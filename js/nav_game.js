/**
 * Autonomous Navigation (Quest 03) - Project VELOCITY
 * Grid-based pathfinding mini-game for Vault 2
 */
class NavGame {
  constructor(config) {
    this.team = config.team || 'A';
    this.gridSize = config.gridSize || 6;
    this.startPos = { ...config.startPos };
    this.goalPos = { ...config.goalPos };
    this.keycardPos = config.keycardPos ? { ...config.keycardPos } : null;
    this.hasKeycard = false;
    this.obstacles = config.obstacles || [];
    this.currentPos = { ...this.startPos };
    this.sequence = [];
    this.isMoving = false;
    this.activeStepIndex = -1;
    this.stepTimer = null;
    this.onWin = config.onWin || (() => {});

    // Element references
    this.boardElem = document.getElementById(config.boardId);
    this.statusBadgeElem = document.getElementById(config.statusBadgeId);
    this.coordTextElem = document.getElementById(config.coordTextId);
    this.moveCountElem = document.getElementById(config.moveCountId);
    this.seqListElem = document.getElementById(config.seqListId);
    this.alertBannerElem = document.getElementById(config.alertBannerId);
    this.successBoxElem = document.getElementById(config.successBoxId);
    this.runBtn = document.getElementById(config.runBtnId);
    this.undoBtn = document.getElementById(config.undoBtnId);
    this.clearBtn = document.getElementById(config.clearBtnId);
    this.resetBtn = document.getElementById(config.resetBtnId);
    this.dpadPrefix = config.dpadPrefix; // e.g. 'dpadA_' or 'dpadB_'

    this.robotElem = null;

    this.init();
  }

  init() {
    this.bindEvents();
    this.renderBoard();
    this.renderSequence();
    this.updateHUD('READY');

    // Initial position after render
    setTimeout(() => {
      this.updateRobotPosition(false);
    }, 50);
  }

  bindEvents() {
    ['UP', 'DOWN', 'LEFT', 'RIGHT'].forEach(dir => {
      const btn = document.getElementById(`${this.dpadPrefix}${dir}`);
      if (btn) {
        btn.addEventListener('click', () => this.addMove(dir));
      }
    });

    if (this.runBtn) {
      this.runBtn.addEventListener('click', () => this.runSequence());
    }
    if (this.undoBtn) {
      this.undoBtn.addEventListener('click', () => this.undoMove());
    }
    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => this.clearSequence());
    }
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => this.reset());
    }

    // Reposition on window resize if needed
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('resize', () => {
        this.updateRobotPosition(false);
      });
    }
  }

  isObstacle(x, y) {
    return this.obstacles.some(ob => ob.x === x && ob.y === y);
  }

  isGoal(x, y) {
    return this.goalPos.x === x && this.goalPos.y === y;
  }

  isKeycard(x, y) {
    return this.keycardPos && this.keycardPos.x === x && this.keycardPos.y === y;
  }

  renderBoard() {
    if (!this.boardElem) return;
    this.boardElem.innerHTML = '';

    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const tile = document.createElement('div');
        tile.className = 'maze-tile';
        tile.dataset.x = x;
        tile.dataset.y = y;

        if (this.isObstacle(x, y)) {
          tile.classList.add('obstacle');
          tile.setAttribute('title', `Hazard at (${x}, ${y})`);
          tile.innerHTML = '<div class="hazard-pulse-core">⚠️</div>';
        } else if (this.isKeycard(x, y)) {
          tile.classList.add('keycard');
          if (this.hasKeycard) tile.classList.add('collected');
          tile.setAttribute('title', `Encryption Keycard at (${x}, ${y})`);
          tile.innerHTML = `
            <div class="keycard-badge-wrap">
              <span class="keycard-icon">💳</span>
              <span class="keycard-subtext">KEYCARD</span>
            </div>
          `;
        } else if (this.isGoal(x, y)) {
          tile.classList.add('destination');
          if (this.keycardPos && !this.hasKeycard) {
            tile.classList.add('locked');
            tile.setAttribute('title', `Exit Gate (LOCKED - Keycard Required) at (${x}, ${y})`);
            tile.innerHTML = '<div class="dest-beacon-ring"></div><div class="dest-flag">🔒</div>';
          } else {
            tile.classList.add('unlocked');
            tile.setAttribute('title', `Exit Gate (UNLOCKED) at (${x}, ${y})`);
            tile.innerHTML = '<div class="dest-beacon-ring"></div><div class="dest-flag">🏁</div>';
          }
        }

        // Direct tile clicking to queue moves!
        tile.addEventListener('click', () => {
          if (this.isMoving) return;
          this.handleTileClick(x, y);
        });

        this.boardElem.appendChild(tile);
      }
    }

    // Create the smooth-gliding robot token with expressive LED visor
    this.robotElem = document.createElement('div');
    this.robotElem.className = 'robot-glider';
    this.robotElem.id = `robotGlider_${this.team}`;
    this.robotElem.innerHTML = '<span class="robot-visor">[•‿•]</span>';
    this.boardElem.appendChild(this.robotElem);
  }

  handleTileClick(targetX, targetY) {
    // Determine the end position of the current sequence
    let currentEndpoint = { ...this.startPos };
    for (let dir of this.sequence) {
      if (dir === 'UP') currentEndpoint.y -= 1;
      else if (dir === 'DOWN') currentEndpoint.y += 1;
      else if (dir === 'LEFT') currentEndpoint.x -= 1;
      else if (dir === 'RIGHT') currentEndpoint.x += 1;
    }

    const dx = targetX - currentEndpoint.x;
    const dy = targetY - currentEndpoint.y;

    if (dx === 0 && dy === -1) {
      this.addMove('UP');
    } else if (dx === 0 && dy === 1) {
      this.addMove('DOWN');
    } else if (dx === -1 && dy === 0) {
      this.addMove('LEFT');
    } else if (dx === 1 && dy === 0) {
      this.addMove('RIGHT');
    }
  }

  updateRobotPosition(smooth = true, isCrash = false, isVictory = false) {
    if (!this.boardElem || !this.robotElem || !this.robotElem.style) return;

    const targetTile = this.boardElem.querySelector(`.maze-tile[data-x="${this.currentPos.x}"][data-y="${this.currentPos.y}"]`);
    
    // Update subtle tile glow
    this.boardElem.querySelectorAll('.maze-tile.robot-present').forEach(el => el.classList.remove('robot-present'));
    if (targetTile) {
      targetTile.classList.add('robot-present');
    }

    if (targetTile) {
      const left = targetTile.offsetLeft + (targetTile.offsetWidth - this.robotElem.offsetWidth) / 2;
      const top = targetTile.offsetTop + (targetTile.offsetHeight - this.robotElem.offsetHeight) / 2;

      if (!smooth) {
        this.robotElem.style.transition = 'none';
        this.robotElem.style.transform = `translate(${left}px, ${top}px)`;
        // Force reflow
        void this.robotElem.offsetHeight;
        this.robotElem.style.transition = 'transform 0.34s cubic-bezier(0.2, 0.9, 0.3, 1)';
      } else {
        this.robotElem.style.transform = `translate(${left}px, ${top}px)`;
      }
    }

    this.robotElem.classList.remove('crashed', 'victory');
    if (isCrash) {
      this.robotElem.classList.add('crashed');
      this.robotElem.innerHTML = '<span class="robot-visor crash">[x_x]</span><span class="crash-spark-fx">💥</span>';
    } else if (isVictory) {
      this.robotElem.classList.add('victory');
      this.robotElem.innerHTML = '<span class="robot-visor win">[^‿^]</span><span class="win-crown">👑</span>';
    } else if (this.isMoving) {
      this.robotElem.innerHTML = '<span class="robot-visor move">[⚡‿⚡]</span>';
    } else {
      this.robotElem.innerHTML = '<span class="robot-visor">[•‿•]</span>';
    }
  }

  renderSequence() {
    if (!this.seqListElem) return;

    if (this.sequence.length === 0) {
      this.seqListElem.innerHTML = `
        <div class="empty-seq-placeholder">
          <div style="color: #cbd5e1; font-weight: 600; margin-bottom: 2px;">Reach the finish without hitting a hazard.</div>
          <div style="color: #64748b; font-size: 0.72rem;">Click adjacent tiles or use D-pad to queue moves, then press RUN ROBOT.</div>
        </div>
      `;
      if (this.moveCountElem) {
        this.moveCountElem.textContent = 'MOVES: 0';
      }
      this.renderPathProjection();
      return;
    }

    this.seqListElem.innerHTML = '';
    const arrows = { UP: '▲', DOWN: '▼', LEFT: '◀', RIGHT: '▶' };

    this.sequence.forEach((dir, idx) => {
      const chip = document.createElement('span');
      chip.className = 'seq-chip';
      if (idx === this.activeStepIndex) {
        chip.classList.add('active-step');
      }
      chip.innerHTML = `<span class="seq-arrow">${arrows[dir] || ''}</span> <span>${dir}</span>`;
      this.seqListElem.appendChild(chip);

      if (idx < this.sequence.length - 1) {
        const arrowSep = document.createElement('span');
        arrowSep.style.color = '#475569';
        arrowSep.style.fontSize = '0.72rem';
        arrowSep.textContent = '→';
        this.seqListElem.appendChild(arrowSep);
      }
    });

    if (this.moveCountElem) {
      this.moveCountElem.textContent = `MOVES: ${this.sequence.length}`;
    }

    this.renderPathProjection();
  }

  renderPathProjection() {
    if (!this.boardElem) return;

    // Clear old projected path markers
    this.boardElem.querySelectorAll('.projected-marker').forEach(el => el.remove());
    this.boardElem.querySelectorAll('.maze-tile.projected-hazard').forEach(el => el.classList.remove('projected-hazard'));

    if (this.sequence.length === 0) return;

    let curr = { ...this.startPos };
    const arrows = { UP: '▲', DOWN: '▼', LEFT: '◀', RIGHT: '▶' };

    for (let i = 0; i < this.sequence.length; i++) {
      const dir = this.sequence[i];
      if (dir === 'UP') curr.y -= 1;
      else if (dir === 'DOWN') curr.y += 1;
      else if (dir === 'LEFT') curr.x -= 1;
      else if (dir === 'RIGHT') curr.x += 1;

      const tile = this.boardElem.querySelector(`.maze-tile[data-x="${curr.x}"][data-y="${curr.y}"]`);
      if (!tile) {
        // Out of bounds step!
        break;
      }

      const isHazard = this.isObstacle(curr.x, curr.y);
      const marker = document.createElement('div');
      marker.className = `projected-marker ${isHazard ? 'collision' : ''}`;
      marker.innerHTML = `
        <span class="proj-step-num">${i + 1}</span>
        <span class="proj-arrow">${arrows[dir] || ''}</span>
      `;
      tile.appendChild(marker);

      if (isHazard) {
        tile.classList.add('projected-hazard');
        // Stop projecting after collision point
        break;
      }
    }
  }

  updateHUD(statusText) {
    if (this.statusBadgeElem) {
      this.statusBadgeElem.className = `nav-status-badge ${statusText.toLowerCase()}`;
      let icon = '●';
      if (statusText === 'READY') icon = '⚡';
      if (statusText === 'MOVING') icon = '🔄';
      if (statusText === 'BLOCKED') icon = '⚠️';
      if (statusText === 'ARRIVED') icon = '🏆';
      this.statusBadgeElem.innerHTML = `<span>${icon}</span> ${statusText}`;
    }

    if (this.coordTextElem) {
      let keycardStatus = '';
      if (this.keycardPos) {
        keycardStatus = this.hasKeycard
          ? ' &bull; <span style="color: #10b981;">💳 KEYCARD: ACQUIRED ✓</span>'
          : ' &bull; <span style="color: #f59e0b;">💳 KEYCARD: REQUIRED</span>';
      }
      this.coordTextElem.innerHTML = `[X: ${this.currentPos.x}, Y: ${this.currentPos.y}]${keycardStatus}`;
    }

    if (this.moveCountElem) {
      this.moveCountElem.textContent = `MOVES: ${this.sequence.length}`;
    }
  }

  setControlsDisabled(disabled) {
    ['UP', 'DOWN', 'LEFT', 'RIGHT'].forEach(dir => {
      const btn = document.getElementById(`${this.dpadPrefix}${dir}`);
      if (btn) btn.disabled = disabled;
    });

    if (this.runBtn) this.runBtn.disabled = disabled;
    if (this.undoBtn) this.undoBtn.disabled = disabled;
    if (this.clearBtn) this.clearBtn.disabled = disabled;
  }

  addMove(dir) {
    if (this.isMoving) return;
    if (this.sequence.length >= 24) return;

    this.sequence.push(dir);
    this.renderSequence();
    this.hideAlert();
    this.updateHUD('READY');

    if (window.soundEngine) window.soundEngine.playClick();
  }

  undoMove() {
    if (this.isMoving || this.sequence.length === 0) return;

    this.sequence.pop();
    this.renderSequence();
    this.hideAlert();
    this.updateHUD('READY');

    if (window.soundEngine) window.soundEngine.playClick();
  }

  clearSequence() {
    if (this.isMoving) return;

    this.sequence = [];
    this.renderSequence();
    this.hideAlert();
    this.updateHUD('READY');

    if (window.soundEngine) window.soundEngine.playClick();
  }

  reset() {
    if (this.stepTimer) {
      clearTimeout(this.stepTimer);
      this.stepTimer = null;
    }

    this.isMoving = false;
    this.activeStepIndex = -1;
    this.currentPos = { ...this.startPos };
    this.sequence = [];
    this.hasKeycard = false;

    this.renderBoard();
    this.updateRobotPosition(false);
    this.renderSequence();
    this.updateHUD('READY');
    this.hideAlert();
    this.hideSuccess();
    this.setControlsDisabled(false);

    if (window.soundEngine) window.soundEngine.playClick();
  }

  showAlert(message) {
    if (this.alertBannerElem) {
      this.alertBannerElem.textContent = message;
      this.alertBannerElem.classList.add('active');
    }
  }

  hideAlert() {
    if (this.alertBannerElem) {
      this.alertBannerElem.classList.remove('active');
    }
  }

  showSuccess() {
    if (this.successBoxElem) {
      this.successBoxElem.classList.add('active');
    }
  }

  hideSuccess() {
    if (this.successBoxElem) {
      this.successBoxElem.classList.remove('active');
    }
  }

  runSequence() {
    if (this.isMoving) return;
    if (this.sequence.length === 0) {
      this.showAlert("Queue at least one movement direction before running!");
      if (window.soundEngine) window.soundEngine.playCrash();
      return;
    }

    this.isMoving = true;
    this.setControlsDisabled(true);
    this.hideAlert();
    this.hideSuccess();

    // Reset board state for each execution run
    this.currentPos = { ...this.startPos };
    this.hasKeycard = false;
    this.activeStepIndex = -1;
    this.renderBoard();
    this.updateRobotPosition(false);
    this.updateHUD('MOVING');

    let step = 0;

    const executeNextStep = () => {
      if (!this.isMoving) return;

      if (step >= this.sequence.length) {
        // Sequence completed
        this.activeStepIndex = -1;
        this.renderSequence();

        if (this.currentPos.x === this.goalPos.x && this.currentPos.y === this.goalPos.y) {
          if (this.keycardPos && !this.hasKeycard) {
            this.handleKeycardDenied();
          } else {
            this.handleGoalReached();
          }
        } else {
          this.isMoving = false;
          this.setControlsDisabled(false);
          this.updateHUD('READY');
          this.showAlert(`DESTINATION NOT REACHED! Route ended at (${this.currentPos.x}, ${this.currentPos.y}). Adjust your route and retry.`);
          if (window.soundEngine) window.soundEngine.playCrash();
        }
        return;
      }

      const dir = this.sequence[step];
      this.activeStepIndex = step;
      this.renderSequence();

      let nextX = this.currentPos.x;
      let nextY = this.currentPos.y;

      if (dir === 'UP') nextY -= 1;
      else if (dir === 'DOWN') nextY += 1;
      else if (dir === 'LEFT') nextX -= 1;
      else if (dir === 'RIGHT') nextX += 1;

      // 1. Boundary Check
      if (nextX < 0 || nextX >= this.gridSize || nextY < 0 || nextY >= this.gridSize) {
        this.handleBlocked();
        return;
      }

      // 2. Obstacle / Hazard Check
      if (this.isObstacle(nextX, nextY)) {
        this.handleBlocked();
        return;
      }

      // 3. Move Robot smoothly to next tile
      this.currentPos = { x: nextX, y: nextY };
      this.updateRobotPosition(true);

      // 4. Check Keycard collection
      if (this.isKeycard(nextX, nextY) && !this.hasKeycard) {
        this.hasKeycard = true;
        const keyTile = this.boardElem.querySelector('.maze-tile.keycard');
        if (keyTile) keyTile.classList.add('collected');

        const goalTile = this.boardElem.querySelector('.maze-tile.destination');
        if (goalTile) {
          goalTile.classList.remove('locked');
          goalTile.classList.add('unlocked');
          const flag = goalTile.querySelector('.dest-flag');
          if (flag) flag.textContent = '🏁';
        }

        if (window.soundEngine && typeof window.soundEngine.playChipCollect === 'function') {
          window.soundEngine.playChipCollect();
        }
      }

      this.updateHUD('MOVING');
      if (window.soundEngine) {
        if (typeof window.soundEngine.playServo === 'function') window.soundEngine.playServo();
        if (typeof window.soundEngine.playStep === 'function') window.soundEngine.playStep();
      }

      // 5. Check if reached destination right on this step!
      if (this.currentPos.x === this.goalPos.x && this.currentPos.y === this.goalPos.y) {
        if (this.keycardPos && !this.hasKeycard) {
          this.stepTimer = setTimeout(() => {
            this.handleKeycardDenied();
          }, 320);
          return;
        } else {
          this.stepTimer = setTimeout(() => {
            this.handleGoalReached();
          }, 320);
          return;
        }
      }

      step++;
      this.stepTimer = setTimeout(executeNextStep, 380);
    };

    this.stepTimer = setTimeout(executeNextStep, 350);
  }

  handleKeycardDenied() {
    this.isMoving = false;
    this.updateHUD('BLOCKED');
    this.updateRobotPosition(true, true, false);
    this.showAlert("ACCESS DENIED: KEYCARD REQUIRED! You must navigate through the 💳 Keycard before reaching the Exit Gate!");
    this.setControlsDisabled(false);

    if (window.soundEngine && typeof window.soundEngine.playCrash === 'function') {
      window.soundEngine.playCrash();
    }
  }

  handleBlocked() {
    this.isMoving = false;
    this.updateHUD('BLOCKED');
    this.updateRobotPosition(true, true, false); // crashed shake animation
    this.showAlert("PATH BLOCKED! Robot hit a hazard. Recalculate your route.");
    this.setControlsDisabled(false);

    if (window.soundEngine && typeof window.soundEngine.playCrash === 'function') {
      window.soundEngine.playCrash();
    }
  }

  handleGoalReached() {
    this.isMoving = false;
    this.activeStepIndex = -1;
    this.renderSequence();
    this.updateHUD('ARRIVED');
    this.updateRobotPosition(true, false, true); // victory spin
    this.showSuccess();
    this.setControlsDisabled(false);

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
}

window.NavGame = NavGame;
