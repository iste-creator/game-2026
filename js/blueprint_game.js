/**
 * Vault 03: Blueprint Recovery (Rebuild the Chassis)
 * Interactive Drag & Drop + Click-to-Install CAD Engineering Mini-Game
 */
class BlueprintGame {
  constructor(config) {
    this.team = config.team || 'A';
    this.timeLimit = config.timeLimit || 45;
    this.timeLeft = this.timeLimit;
    this.timerInterval = null;
    this.isCompleted = false;
    this.isTimedOut = false;
    this.selectedPartId = null;
    this.onWin = config.onWin || (() => {});

    // Target slots definition
    this.slots = config.slots || [
      { id: 'slot-1', requiredPart: 'axle', name: 'TRANSAXLE SHAFT', icon: '🔩', num: '01' },
      { id: 'slot-2', requiredPart: 'motor-mount', name: 'CHASSIS MOTOR MOUNT', icon: '🛠️', num: '02' },
      { id: 'slot-3', requiredPart: 'gear', name: 'DRIVE PINION GEAR', icon: '⚙️', num: '03' },
      { id: 'slot-4', requiredPart: 'brake-disc', name: 'VENTILATED BRAKE DISC', icon: '💿', num: '04' }
    ];

    // Available parts in tray (8 components)
    this.parts = config.parts || [
      { id: 'wheel-1', name: 'Magnesium Wheel', icon: '🛞', spec: 'Forged 18-inch' },
      { id: 'axle', name: 'Transaxle Shaft', icon: '🔩', spec: 'Titanium-Alloy 32mm' },
      { id: 'motor-mount', name: 'Chassis Motor Mount', icon: '🛠️', spec: 'Billet CNC Bracket' },
      { id: 'gear', name: 'Drive Pinion Gear', icon: '⚙️', spec: 'Helical Steel 4.10' },
      { id: 'spring', name: 'Hydraulic Spring', icon: '🌀', spec: 'Progressive Rate 650lb' },
      { id: 'brake-disc', name: 'Ventilated Brake Disc', icon: '💿', spec: 'Carbon-Ceramic 380mm' },
      { id: 'wheel-2', name: 'Aero Disc Wheel', icon: '🛞', spec: 'Turbofan Cover 18-inch' },
      { id: 'propeller', name: 'Aero Turbine Propeller', icon: '🚁', spec: 'Twin-Blade Carbon' }
    ];

    // Code digits: 4 7 2 9
    this.codeDigits = ['4', '7', '2', '9'];
    this.installedParts = {}; // slotId -> partId

    // UI element IDs
    this.containerId = config.containerId;
    this.timerElemId = config.timerElemId;
    this.errorToastId = config.errorToastId;
    this.successCardId = config.successCardId;
    this.timeoutBoxId = config.timeoutBoxId;
    this.digitPrefix = config.digitPrefix; // e.g. 'bpDigitA_'

    this.init();
  }

  init() {
    this.renderSlots();
    this.renderPartsTray();
    this.bindEvents();
    this.reset(true);
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timeLeft = this.timeLimit;
    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      if (this.isCompleted) {
        clearInterval(this.timerInterval);
        return;
      }

      this.timeLeft--;
      this.updateTimerDisplay();

      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.handleTimeout();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateTimerDisplay() {
    const timerElem = document.getElementById(this.timerElemId);
    if (!timerElem) return;

    const mins = Math.floor(this.timeLeft / 60);
    const secs = this.timeLeft % 60;
    const formatted = `0${mins}:${secs < 10 ? '0' : ''}${secs}`;
    timerElem.innerHTML = `<span>⏱️</span> <span>TIME: ${formatted}</span>`;

    if (this.timeLeft <= 10) {
      timerElem.classList.add('warning');
      if (window.soundEngine && this.timeLeft > 0) {
        window.soundEngine.playClick();
      }
    } else {
      timerElem.classList.remove('warning');
    }
  }

  renderSlots() {
    const slotsContainer = document.getElementById(`${this.containerId}_slots`);
    if (!slotsContainer) return;

    slotsContainer.innerHTML = '';
    this.slots.forEach(slot => {
      const slotElem = document.createElement('div');
      slotElem.className = 'bp-drop-slot';
      slotElem.id = `${this.containerId}_${slot.id}`;
      slotElem.dataset.slotId = slot.id;
      slotElem.dataset.requiredPart = slot.requiredPart;

      slotElem.innerHTML = `
        <span class="bp-slot-num">SLOT // ${slot.num}</span>
        <div class="bp-slot-icon-ghost">${slot.icon}</div>
        <div class="bp-slot-name">${slot.name}</div>
        <span class="bp-slot-status">EMPTY [AWAITING COMPONENT]</span>
      `;

      // Drag and Drop listeners
      slotElem.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!this.installedParts[slot.id] && !this.isTimedOut && !this.isCompleted) {
          slotElem.classList.add('drag-over');
        }
      });

      slotElem.addEventListener('dragleave', () => {
        slotElem.classList.remove('drag-over');
      });

      slotElem.addEventListener('drop', (e) => {
        e.preventDefault();
        slotElem.classList.remove('drag-over');
        if (this.isTimedOut || this.isCompleted) return;

        const partId = e.dataTransfer.getData('text/plain');
        this.attemptInstall(slot.id, partId);
      });

      // Click to install selected part
      slotElem.addEventListener('click', () => {
        if (this.isTimedOut || this.isCompleted) return;
        if (this.selectedPartId) {
          this.attemptInstall(slot.id, this.selectedPartId);
        }
      });

      slotsContainer.appendChild(slotElem);
    });
  }

  renderPartsTray() {
    const trayContainer = document.getElementById(`${this.containerId}_parts`);
    if (!trayContainer) return;

    trayContainer.innerHTML = '';
    this.parts.forEach(part => {
      const card = document.createElement('div');
      card.className = 'bp-part-card';
      card.id = `${this.containerId}_part_${part.id}`;
      card.dataset.partId = part.id;
      card.draggable = true;

      card.innerHTML = `
        <div class="bp-part-icon">${part.icon}</div>
        <div class="bp-part-title">${part.name}</div>
        <div class="bp-part-spec">${part.spec}</div>
      `;

      // Drag start
      card.addEventListener('dragstart', (e) => {
        if (this.isTimedOut || this.isCompleted || card.classList.contains('used')) {
          e.preventDefault();
          return;
        }
        e.dataTransfer.setData('text/plain', part.id);
        this.selectPart(part.id);
      });

      // Click to select
      card.addEventListener('click', () => {
        if (this.isTimedOut || this.isCompleted || card.classList.contains('used')) return;
        this.selectPart(part.id);
      });

      trayContainer.appendChild(card);
    });
  }

  selectPart(partId) {
    const trayContainer = document.getElementById(`${this.containerId}_parts`);
    if (!trayContainer) return;

    // Clear existing target hints from all slots
    this.slots.forEach(s => {
      const elem = document.getElementById(`${this.containerId}_${s.id}`);
      if (elem) elem.classList.remove('target-hint');
    });

    if (this.selectedPartId === partId) {
      // Toggle off
      this.selectedPartId = null;
      trayContainer.querySelectorAll('.bp-part-card').forEach(el => el.classList.remove('selected'));
      return;
    }

    this.selectedPartId = partId;
    trayContainer.querySelectorAll('.bp-part-card').forEach(el => {
      if (el.dataset.partId === partId) el.classList.add('selected');
      else el.classList.remove('selected');
    });

    // Highlight destination slot beacon
    const targetSlot = this.slots.find(s => s.requiredPart === partId);
    if (targetSlot && !this.installedParts[targetSlot.id]) {
      const targetElem = document.getElementById(`${this.containerId}_${targetSlot.id}`);
      if (targetElem) targetElem.classList.add('target-hint');
    }

    if (window.soundEngine) window.soundEngine.playClick();
  }

  attemptInstall(slotId, partId) {
    if (this.installedParts[slotId]) return;

    const slotDef = this.slots.find(s => s.id === slotId);
    if (!slotDef) return;

    if (slotDef.requiredPart === partId) {
      // Correct!
      this.handleCorrectPlacement(slotDef, partId);
    } else {
      // Incorrect!
      this.handleIncorrectPlacement();
    }
  }

  handleCorrectPlacement(slotDef, partId) {
    this.installedParts[slotDef.id] = partId;
    const partDef = this.parts.find(p => p.id === partId);

    // Clear target hints
    this.slots.forEach(s => {
      const elem = document.getElementById(`${this.containerId}_${s.id}`);
      if (elem) elem.classList.remove('target-hint');
    });

    // Update slot UI with slam animation
    const slotElem = document.getElementById(`${this.containerId}_${slotDef.id}`);
    if (slotElem && partDef) {
      slotElem.classList.add('installed', 'bp-slot-slam');
      setTimeout(() => slotElem.classList.remove('bp-slot-slam'), 400);

      slotElem.innerHTML = `
        <span class="bp-slot-num">SLOT // ${slotDef.num} [LOCKED]</span>
        <div class="bp-slot-icon-ghost">${partDef.icon}</div>
        <div class="bp-slot-name">${partDef.name}</div>
        <span class="bp-slot-status">✓ COMPONENT SECURED</span>
      `;
    }

    // Mark part as used in tray
    const partCard = document.getElementById(`${this.containerId}_part_${partId}`);
    if (partCard) {
      partCard.classList.remove('selected');
      partCard.classList.add('used');
    }
    this.selectedPartId = null;

    // Reveal one digit of code 4729 with matrix decryption roll
    const installedCount = Object.keys(this.installedParts).length;
    this.revealCodeDigit(installedCount);

    if (window.soundEngine && typeof window.soundEngine.playSnap === 'function') {
      window.soundEngine.playSnap();
    } else if (window.soundEngine && typeof window.soundEngine.playClick === 'function') {
      window.soundEngine.playClick();
    }

    // Check win condition
    if (installedCount >= this.slots.length) {
      this.handleReconstructionSuccess();
    }
  }

  revealCodeDigit(count) {
    for (let i = 1; i <= 4; i++) {
      const digitCell = document.getElementById(`${this.digitPrefix}${i}`);
      if (!digitCell) continue;

      if (i <= count) {
        digitCell.classList.add('revealed');
        digitCell.textContent = this.codeDigits[i - 1];

        // Animated matrix rolling visual
        if (i === count) {
          digitCell.classList.add('decrypting');
          let rolls = 0;
          const finalVal = this.codeDigits[i - 1];
          const rollTimer = setInterval(() => {
            if (rolls < 6) {
              digitCell.textContent = Math.floor(Math.random() * 10);
              if (window.soundEngine && typeof window.soundEngine.playMatrixRoll === 'function' && rolls % 2 === 0) {
                window.soundEngine.playMatrixRoll();
              }
            } else {
              clearInterval(rollTimer);
              digitCell.classList.remove('decrypting');
              digitCell.textContent = finalVal;
            }
            rolls++;
          }, 40);
        }
      } else {
        digitCell.classList.remove('revealed');
        digitCell.textContent = '_';
      }
    }
  }

  handleIncorrectPlacement() {
    // Show ASSEMBLY ERROR toast
    const errorToast = document.getElementById(this.errorToastId);
    if (errorToast) {
      errorToast.classList.add('active');
      setTimeout(() => {
        errorToast.classList.remove('active');
      }, 1200);
    }

    // Deselect part and remove hints
    this.selectedPartId = null;
    const trayContainer = document.getElementById(`${this.containerId}_parts`);
    if (trayContainer) {
      trayContainer.querySelectorAll('.bp-part-card').forEach(el => el.classList.remove('selected'));
    }
    this.slots.forEach(s => {
      const elem = document.getElementById(`${this.containerId}_${s.id}`);
      if (elem) elem.classList.remove('target-hint');
    });

    if (window.soundEngine) {
      window.soundEngine.playCrash();
    }
  }

  handleTimeout() {
    this.isTimedOut = true;
    this.stopTimer();

    const timeoutBox = document.getElementById(this.timeoutBoxId);
    if (timeoutBox) {
      timeoutBox.classList.add('active');
    }

    if (window.soundEngine) {
      window.soundEngine.playCrash();
    }
  }

  handleReconstructionSuccess() {
    this.isCompleted = true;
    this.stopTimer();

    const successCard = document.getElementById(this.successCardId);
    if (successCard) {
      successCard.classList.add('active');
    }

    if (window.soundEngine) {
      if (typeof window.soundEngine.playGrandCelebration === 'function') {
        window.soundEngine.playGrandCelebration();
      } else if (typeof window.soundEngine.playFanfare === 'function') {
        window.soundEngine.playFanfare();
      }
      if (typeof window.soundEngine.playVaultDecrypted === 'function') {
        setTimeout(() => window.soundEngine.playVaultDecrypted(), 450);
      }
    }

    if (typeof this.onWin === 'function') {
      this.onWin();
    }
  }

  reset(isOpening = false) {
    this.stopTimer();
    this.isCompleted = false;
    this.isTimedOut = false;
    this.selectedPartId = null;
    this.installedParts = {};

    this.renderSlots();
    this.renderPartsTray();

    // Reset code digits
    for (let i = 1; i <= 4; i++) {
      const digitCell = document.getElementById(`${this.digitPrefix}${i}`);
      if (digitCell) {
        digitCell.classList.remove('revealed');
        digitCell.textContent = '_';
      }
    }

    // Hide overlays
    const errorToast = document.getElementById(this.errorToastId);
    if (errorToast) errorToast.classList.remove('active');

    const timeoutBox = document.getElementById(this.timeoutBoxId);
    if (timeoutBox) timeoutBox.classList.remove('active');

    const successCard = document.getElementById(this.successCardId);
    if (successCard) successCard.classList.remove('active');

    this.startTimer();

    if (!isOpening && window.soundEngine) {
      window.soundEngine.playClick();
    }
  }

  bindEvents() {
    // Optional additional global listeners
  }
}

window.BlueprintGame = BlueprintGame;
