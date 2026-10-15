/**
 * OPERATION REBUILD — VAULT SECURITY CONTROLLER
 * Manages 6-Digit Physical Passcode Clearance & Progressive Vault Unlocking
 *
 * 6 CODES LIST:
 * =========================================================================
 * TEAM A (Sector Alpha):
 *   - Vault 2 Code: 749215  (obtained from physical Vault 01 for Team A)
 *   - Vault 3 Code: 813642  (obtained from physical Vault 02 for Team A)
 *   - Vault 4 Code: 592871  (obtained from physical Vault 03 for Team A)
 *
 * TEAM B (Sector Beta):
 *   - Vault 2 Code: 361849  (obtained from physical Vault 01 for Team B)
 *   - Vault 3 Code: 925418  (obtained from physical Vault 02 for Team B)
 *   - Vault 4 Code: 478163  (obtained from physical Vault 03 for Team B)
 * =========================================================================
 */

class VaultSecurityController {
  constructor(config) {
    this.team = config.team || 'A';
    this.storageKey = `op_rebuild_vault_states_${this.team}`;

    // Configurable 6-digit physical vault passcodes
    this.codes = this.team === 'A' ? {
      2: '749215',
      3: '813642',
      4: '592871'
    } : {
      2: '361849',
      3: '925418',
      4: '478163'
    };

    // Subsystem metadata
    this.vaultMeta = {
      1: { name: 'Vault 1', code: 'SYS-01 // POWER GRID', fromVault: null },
      2: { name: 'Vault 2', code: 'SYS-02 // WIRE GRID PUZZLE', fromVault: 1 },
      3: { name: 'Vault 3', code: 'SYS-03 // ENGINEERING QUIZ', fromVault: 2 },
      4: { name: 'Vault 4', code: 'SYS-04 // TELEMETRY', fromVault: 3 }
    };

    // Vault launcher callbacks
    this.launchers = config.launchers || {};

    // Initial states: Vault 1 is UNLOCKED; Vaults 2, 3, 4 are LOCKED
    this.states = this.loadState();
    this.activeVaultId = null;

    this.initDOM();
    this.render();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            1: parsed[1] || 'UNLOCKED',
            2: parsed[2] || 'LOCKED',
            3: parsed[3] || 'LOCKED',
            4: parsed[4] || 'LOCKED'
          };
        }
      }
    } catch (e) {
      console.warn('Could not read localStorage:', e);
    }
    return {
      1: 'UNLOCKED',
      2: 'LOCKED',
      3: 'LOCKED',
      4: 'LOCKED'
    };
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.states));
    } catch (e) {
      console.warn('Could not write to localStorage:', e);
    }
  }

  openAdminResetModal() {
    const modal = document.getElementById('adminResetModal');
    const pwdInput = document.getElementById('adminPasswordInput');
    const feedback = document.getElementById('adminResetFeedback');
    if (pwdInput) {
      pwdInput.value = '';
    }
    if (feedback) {
      feedback.textContent = '';
      feedback.className = 'admin-reset-feedback';
    }
    if (modal) {
      modal.classList.add('active');
      setTimeout(() => {
        if (pwdInput) pwdInput.focus();
      }, 100);
    }
    if (window.soundEngine) window.soundEngine.playClick();
  }

  closeAdminResetModal() {
    const modal = document.getElementById('adminResetModal');
    if (modal) modal.classList.remove('active');
    const pwdInput = document.getElementById('adminPasswordInput');
    if (pwdInput) pwdInput.value = '';
    if (window.soundEngine) window.soundEngine.playClick();
  }

  executeAdminReset() {
    const pwdInput = document.getElementById('adminPasswordInput');
    const feedback = document.getElementById('adminResetFeedback');
    const pwd = pwdInput ? pwdInput.value.trim() : '';

    if (pwd === 'iste69') {
      // Correct admin password!
      if (feedback) {
        feedback.className = 'admin-reset-feedback success';
        feedback.textContent = '✓ PASSWORD ACCEPTED // PURGING ALL VAULT DATA...';
      }

      if (window.soundEngine) {
        window.soundEngine.playVaultDecrypted();
      }

      // Remove both team storage keys and Vault 1 telemetry checkpoints
      localStorage.removeItem('op_rebuild_vault_states_A');
      localStorage.removeItem('op_rebuild_vault_states_B');
      localStorage.removeItem('op_rebuild_v1_cores_A');
      localStorage.removeItem('op_rebuild_v1_cores_B');

      // Reset active controller state
      this.states = {
        1: 'UNLOCKED',
        2: 'LOCKED',
        3: 'LOCKED',
        4: 'LOCKED'
      };
      this.saveState();
      this.render();

      setTimeout(() => {
        this.closeAdminResetModal();
        location.reload();
      }, 700);

    } else {
      // Incorrect password!
      if (feedback) {
        feedback.className = 'admin-reset-feedback error';
        feedback.textContent = '⚠️ ACCESS DENIED // INVALID ADMIN PASSWORD';
      }
      if (pwdInput) {
        pwdInput.classList.add('shake');
        setTimeout(() => pwdInput.classList.remove('shake'), 450);
        pwdInput.value = '';
        pwdInput.focus();
      }
      if (window.soundEngine) {
        window.soundEngine.playLaserHit();
      }
    }
  }

  resetAllProgress() {
    this.openAdminResetModal();
  }

  completeVault(id) {
    this.states[id] = 'COMPLETED';
    this.saveState();
    this.render();

    if (window.soundEngine) {
      window.soundEngine.playVaultDecrypted();
    }
  }

  unlockVault(id) {
    this.states[id] = 'UNLOCKED';
    this.saveState();
    this.render();
  }

  openVault(id) {
    const state = this.states[id];
    if (state === 'LOCKED') {
      this.openPasscodeModal(id);
    } else {
      // Launch mini-game for this vault
      if (this.launchers[id]) {
        this.launchers[id]();
      }
    }
  }

  initDOM() {
    // Pin inputs setup
    const container = document.getElementById('pinContainer');
    if (!container) return;

    this.pinBoxes = [];
    for (let i = 0; i < 6; i++) {
      const box = document.getElementById(`pinDigit_${i}`);
      if (box) {
        this.pinBoxes.push(box);
        box.addEventListener('input', (e) => this.handleBoxInput(e, i));
        box.addEventListener('keydown', (e) => this.handleBoxKeyDown(e, i));
        box.addEventListener('paste', (e) => this.handleBoxPaste(e));
      }
    }

    // Keypad digits
    const numKeys = document.querySelectorAll('.btn-num-key[data-key]');
    numKeys.forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-key');
        if (key === 'clear') {
          this.clearPin();
        } else if (key === 'backspace') {
          this.backspacePin();
        } else {
          this.appendPinDigit(key);
        }
      });
    });

    // Close button
    const closeBtn = document.getElementById('passcodeCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closePasscodeModal());

    const cancelBtn = document.getElementById('passcodeCancelBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.closePasscodeModal());

    const verifyBtn = document.getElementById('passcodeVerifyBtn');
    if (verifyBtn) verifyBtn.addEventListener('click', () => this.verifyPasscode());

    // Admin Reset Modal events
    const adminOpenBtn = document.getElementById('adminResetBtn');
    if (adminOpenBtn) adminOpenBtn.addEventListener('click', () => this.openAdminResetModal());

    const adminCloseBtn = document.getElementById('adminResetCloseBtn');
    if (adminCloseBtn) adminCloseBtn.addEventListener('click', () => this.closeAdminResetModal());

    const adminCancelBtn = document.getElementById('adminResetCancelBtn');
    if (adminCancelBtn) adminCancelBtn.addEventListener('click', () => this.closeAdminResetModal());

    const adminConfirmBtn = document.getElementById('adminResetConfirmBtn');
    if (adminConfirmBtn) adminConfirmBtn.addEventListener('click', () => this.executeAdminReset());

    const adminPwdInput = document.getElementById('adminPasswordInput');
    if (adminPwdInput) {
      adminPwdInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.executeAdminReset();
      });
    }
  }

  handleBoxInput(e, index) {
    const val = e.target.value.replace(/[^0-9]/g, '');
    e.target.value = val ? val[val.length - 1] : '';

    if (e.target.value) {
      e.target.classList.add('filled');
      if (index < 5 && this.pinBoxes[index + 1]) {
        this.pinBoxes[index + 1].focus();
      } else if (index === 5) {
        // Auto verify when 6th digit entered
        this.verifyPasscode();
      }
    } else {
      e.target.classList.remove('filled');
    }
  }

  handleBoxKeyDown(e, index) {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      this.pinBoxes[index - 1].focus();
      this.pinBoxes[index - 1].value = '';
      this.pinBoxes[index - 1].classList.remove('filled');
    } else if (e.key === 'Enter') {
      this.verifyPasscode();
    }
  }

  handleBoxPaste(e) {
    e.preventDefault();
    const pasteData = (e.clipboardData || window.clipboardData).getData('text').trim();
    const digits = pasteData.replace(/[^0-9]/g, '').slice(0, 6);
    if (!digits) return;

    for (let i = 0; i < 6; i++) {
      if (i < digits.length && this.pinBoxes[i]) {
        this.pinBoxes[i].value = digits[i];
        this.pinBoxes[i].classList.add('filled');
      }
    }

    if (digits.length >= 6) {
      this.verifyPasscode();
    } else if (this.pinBoxes[digits.length]) {
      this.pinBoxes[digits.length].focus();
    }
  }

  appendPinDigit(digit) {
    for (let i = 0; i < 6; i++) {
      if (!this.pinBoxes[i].value) {
        this.pinBoxes[i].value = digit;
        this.pinBoxes[i].classList.add('filled');
        if (i < 5) {
          this.pinBoxes[i + 1].focus();
        } else {
          this.verifyPasscode();
        }
        if (window.soundEngine) window.soundEngine.playClick();
        return;
      }
    }
  }

  backspacePin() {
    for (let i = 5; i >= 0; i--) {
      if (this.pinBoxes[i].value) {
        this.pinBoxes[i].value = '';
        this.pinBoxes[i].classList.remove('filled');
        this.pinBoxes[i].focus();
        if (window.soundEngine) window.soundEngine.playClick();
        return;
      }
    }
  }

  clearPin() {
    this.pinBoxes.forEach(b => {
      b.value = '';
      if (b.classList) b.classList.remove('filled');
    });
    if (this.pinBoxes[0] && typeof this.pinBoxes[0].focus === 'function') this.pinBoxes[0].focus();
    const feedback = document.getElementById('passcodeFeedback');
    if (feedback) feedback.textContent = '';
    if (window.soundEngine) window.soundEngine.playClick();
  }

  openPasscodeModal(vaultId) {
    this.activeVaultId = vaultId;
    const meta = this.vaultMeta[vaultId];
    if (!meta) return;

    const modal = document.getElementById('passcodeModal');
    const title = document.getElementById('passcodeVaultTitle');
    const sub = document.getElementById('passcodeVaultSub');
    const feedback = document.getElementById('passcodeFeedback');

    if (title) title.textContent = `VAULT 0${vaultId} SECURITY LOCK`;
    if (sub) {
      sub.innerHTML = `Enter the 6-digit authorization passcode obtained from <strong>physical Vault 0${meta.fromVault}</strong> to unlock this system.`;
    }
    if (feedback) {
      feedback.textContent = '';
      feedback.className = 'passcode-feedback';
    }

    this.clearPin();

    if (modal) {
      modal.classList.add('active');
      setTimeout(() => {
        if (this.pinBoxes[0] && typeof this.pinBoxes[0].focus === 'function') this.pinBoxes[0].focus();
      }, 100);
    }

    if (window.soundEngine) window.soundEngine.playClick();
  }

  closePasscodeModal() {
    const modal = document.getElementById('passcodeModal');
    if (modal) modal.classList.remove('active');
    this.clearPin();
    if (window.soundEngine) window.soundEngine.playClick();
  }

  verifyPasscode() {
    const entered = this.pinBoxes.map(b => b.value).join('');
    const feedback = document.getElementById('passcodeFeedback');
    const container = document.getElementById('pinContainer');
    const correctCode = this.codes[this.activeVaultId];

    if (entered.length < 6) {
      if (feedback) {
        feedback.className = 'passcode-feedback error';
        feedback.textContent = '⚠️ PLEASE ENTER ALL 6 DIGITS';
      }
      if (container) {
        container.classList.add('shake');
        setTimeout(() => container.classList.remove('shake'), 450);
      }
      if (window.soundEngine) window.soundEngine.playLaserHit();
      return;
    }

    if (entered === correctCode) {
      // Success!
      if (feedback) {
        feedback.className = 'passcode-feedback success';
        feedback.textContent = `✓ PASSCODE VERIFIED // VAULT 0${this.activeVaultId} UNLOCKED!`;
      }

      if (window.soundEngine) {
        window.soundEngine.playVaultDecrypted();
      }

      const unlockedId = this.activeVaultId;
      this.unlockVault(unlockedId);

      setTimeout(() => {
        this.closePasscodeModal();
        // Automatically launch the newly unlocked game
        if (this.launchers[unlockedId]) {
          this.launchers[unlockedId]();
        }
      }, 700);

    } else {
      // Denied!
      if (feedback) {
        feedback.className = 'passcode-feedback error';
        feedback.textContent = '⚠️ ACCESS DENIED // INVALID 6-DIGIT PASSCODE';
      }
      if (container) {
        container.classList.add('shake');
        setTimeout(() => container.classList.remove('shake'), 450);
      }
      if (window.soundEngine) window.soundEngine.playLaserHit();
      setTimeout(() => this.clearPin(), 600);
    }
  }

  render() {
    let completedCount = 0;

    for (let i = 1; i <= 4; i++) {
      const card = document.getElementById(`vaultCard${i}`);
      const tag = document.getElementById(`tagVault${i}`);
      const btn = card ? card.querySelector('.vault-inspect-btn') : null;
      const state = this.states[i];

      if (state === 'COMPLETED') completedCount++;

      if (!card) continue;

      card.classList.remove('locked', 'unlocked', 'completed', 'decrypted');

      if (state === 'COMPLETED') {
        card.classList.add('completed', 'decrypted');
        if (tag) {
          tag.textContent = 'COMPLETED ✓';
        }
        if (btn) {
          btn.innerHTML = 'OPEN';
          btn.onclick = () => this.openVault(i);
        }
      } else if (state === 'UNLOCKED') {
        card.classList.add('unlocked');
        if (tag) {
          tag.textContent = 'READY';
        }
        if (btn) {
          btn.innerHTML = 'OPEN';
          btn.onclick = () => this.openVault(i);
        }
      } else { // LOCKED
        card.classList.add('locked');
        if (tag) {
          tag.textContent = 'LOCKED 🔒';
        }
        if (btn) {
          btn.innerHTML = 'ENTER CODE 🔑';
          btn.onclick = () => this.openPasscodeModal(i);
        }
      }
    }

    // Counter pill
    const counter = document.getElementById('vaultCounterText');
    if (counter) {
      if (completedCount === 4) {
        counter.textContent = 'STATUS: 4 / 4 ALL VAULTS REBUILT!';
        if (counter.style) counter.style.color = '#10b981';
      } else {
        counter.textContent = `STATUS: ${completedCount} / 4 COMPLETED`;
        if (counter.style) counter.style.color = '';
      }
    }

    // Directive Text Banner
    const directiveElem = document.getElementById('missionDirectiveText');
    if (directiveElem) {
      if (completedCount === 0) {
        directiveElem.innerHTML = '<span>⚡</span> <span>OBJECTIVE: Restore vehicle motor coolant in <strong>Vault 1</strong> to extract the first physical key.</span>';
      } else if (this.states[1] === 'COMPLETED' && this.states[2] === 'LOCKED') {
        directiveElem.innerHTML = '<span>🔑</span> <span>OBJECTIVE: Open <strong>physical Vault 01</strong> with your key, retrieve the 6-digit passcode, and unlock <strong>Vault 2</strong>.</span>';
      } else if (this.states[2] === 'UNLOCKED' && this.states[2] !== 'COMPLETED') {
        directiveElem.innerHTML = '<span>🤖</span> <span>OBJECTIVE: Guide the autonomous robot in <strong>Vault 2</strong> to extract the second physical key.</span>';
      } else if (this.states[2] === 'COMPLETED' && this.states[3] === 'LOCKED') {
        directiveElem.innerHTML = '<span>🔑</span> <span>OBJECTIVE: Open <strong>physical Vault 02</strong> with your key, retrieve the 6-digit passcode, and unlock <strong>Vault 3</strong>.</span>';
      } else if (this.states[3] === 'UNLOCKED' && this.states[3] !== 'COMPLETED') {
        directiveElem.innerHTML = '<span>💡</span> <span>OBJECTIVE: Solve the 5-node cybernetic engineering quiz in <strong>Vault 3</strong> to calibrate core systems.</span>';
      } else if (this.states[3] === 'COMPLETED' && this.states[4] === 'LOCKED') {
        directiveElem.innerHTML = '<span>🔑</span> <span>OBJECTIVE: Open <strong>physical Vault 03</strong> with your key, retrieve the 6-digit passcode, and unlock <strong>Vault 4</strong>.</span>';
      } else if (this.states[4] === 'UNLOCKED' && this.states[4] !== 'COMPLETED') {
        directiveElem.innerHTML = '<span>🚨</span> <span>OBJECTIVE: Evade security lasers and retrieve the access chip in <strong>Vault 4</strong> to complete the mission.</span>';
      } else if (completedCount === 4) {
        directiveElem.innerHTML = '<span>🏆</span> <span>MISSION COMPLETE: All 4 vaults restored! Show this terminal to the event executive.</span>';
      }
    }

    // Grand victory banner
    const grandBanner = document.getElementById('grandVictoryBanner');
    if (grandBanner) {
      if (completedCount === 4) {
        grandBanner.classList.add('active');
      } else {
        grandBanner.classList.remove('active');
      }
    }
  }
}

window.VaultSecurityController = VaultSecurityController;
