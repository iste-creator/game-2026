/**
 * Vault 04: LASER LOCKDOWN (Final Challenge)
 * 2D Top-Down Stealth Grid Action-Puzzle Engine
 */
class LaserLockdownGame {
  constructor(config) {
    this.team = config.team || 'A';
    this.canvasId = config.canvasId;
    this.canvas = document.getElementById(this.canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    // Configuration
    this.VAULT_CODE = 'VEL-5831'; // Clearly defined configuration variable as requested
    this.cols = 12;
    this.rows = 10;
    this.tileSize = 48; // 12 * 48 = 576px wide, 10 * 48 = 480px high
    this.timeLimit = config.timeLimit || 75;
    this.timeLeft = this.timeLimit;
    this.timerInterval = null;
    this.animFrameId = null;

    // Game States: 'READY', 'PLAYING', 'CHIP_COLLECTED', 'MISSION_COMPLETE', 'MISSION_FAILED'
    this.state = 'READY';
    this.isPaused = false;
    this.hasChip = false;

    // Team color palette
    this.accentColor = this.team === 'A' ? '#00d2ff' : '#ff5500';
    this.glowColor = this.team === 'A' ? 'rgba(0, 210, 255, 0.4)' : 'rgba(255, 85, 0, 0.4)';

    // Map definition
    this.setupMap();

    // Callbacks & UI element references
    this.onWin = config.onWin || (() => {});
    this.timerElem = document.getElementById(config.timerElemId);
    this.chipPill = document.getElementById(config.chipPillId);
    this.statusPill = document.getElementById(config.statusPillId);
    this.briefingModal = document.getElementById(config.briefingModalId);
    this.failedModal = document.getElementById(config.failedModalId);
    this.victoryModal = document.getElementById(config.victoryModalId);
    this.flashOverlay = document.getElementById(config.flashOverlayId);

    // Keyboard & input handlers
    this.lastMoveTime = 0;
    this.moveDelay = 130; // ms between consecutive steps for smooth control

    this.bindEvents();
    this.reset();
  }

  setupMap() {
    // 0 = Empty floor, 1 = Wall
    this.map = [];
    for (let r = 0; r < this.rows; r++) {
      this.map[r] = [];
      for (let c = 0; c < this.cols; c++) {
        // Outer boundaries
        if (r === 0 || r === this.rows - 1 || c === 0 || c === this.cols - 1) {
          this.map[r][c] = 1;
        } else {
          this.map[r][c] = 0;
        }
      }
    }

    if (this.team === 'A') {
      // Team A Map Architecture
      this.startPos = { x: 1, y: 1 };
      this.exitPos = { x: 10, y: 8 };
      this.chipPos = { x: 8, y: 4 };

      // Interior Walls
      // Top divider wall
      this.map[1][4] = 1; this.map[2][4] = 1; this.map[3][4] = 1;
      // Central chamber walls
      this.map[2][6] = 1; this.map[2][7] = 1; this.map[2][8] = 1; this.map[2][9] = 1;
      this.map[3][6] = 1; this.map[3][9] = 1;
      this.map[5][6] = 1; this.map[5][9] = 1;
      this.map[6][6] = 1; this.map[6][7] = 1; this.map[6][8] = 1; this.map[6][9] = 1;
      // Lower obstacles
      this.map[5][2] = 1; this.map[5][3] = 1; this.map[5][4] = 1;
      this.map[7][2] = 1; this.map[7][3] = 1; this.map[7][4] = 1;

      // 3 Security Lasers
      this.lasers = [
        // Laser 1: Continuously Active across upper corridor
        { id: 1, type: 'continuous', x1: 5, y1: 1, x2: 5, y2: 3, dir: 'v', active: true },
        // Laser 2: Alternates ON/OFF (2.0s ON, 2.0s OFF)
        { id: 2, type: 'alternate', x1: 1, y1: 4, x2: 4, y2: 4, dir: 'h', periodOn: 2000, periodOff: 2000, active: false, timer: 0 },
        // Laser 3: Pulses regularly (1.5s ON, 2.5s OFF) guarding chip chamber
        { id: 3, type: 'pulse', x1: 6, y1: 4, x2: 6, y2: 5, dir: 'v', periodOn: 1500, periodOff: 2500, active: false, timer: 0 }
      ];
    } else {
      // Team B Map Architecture (Distinct Layout)
      this.startPos = { x: 1, y: 8 };
      this.exitPos = { x: 10, y: 1 };
      this.chipPos = { x: 4, y: 4 };

      // Interior Walls
      this.map[8][4] = 1; this.map[7][4] = 1; this.map[6][4] = 1;
      this.map[2][2] = 1; this.map[2][3] = 1; this.map[2][4] = 1; this.map[2][5] = 1;
      this.map[3][2] = 1; this.map[3][5] = 1;
      this.map[5][2] = 1; this.map[5][5] = 1;
      this.map[6][2] = 1; this.map[6][3] = 1; this.map[6][4] = 1; this.map[6][5] = 1;
      this.map[4][8] = 1; this.map[4][9] = 1;
      this.map[7][7] = 1; this.map[7][8] = 1;

      // 3 Security Lasers
      this.lasers = [
        // Laser 1: Continuously Active
        { id: 1, type: 'continuous', x1: 5, y1: 8, x2: 5, y2: 6, dir: 'v', active: true },
        // Laser 2: Alternates ON/OFF
        { id: 2, type: 'alternate', x1: 7, y1: 5, x2: 10, y2: 5, dir: 'h', periodOn: 2000, periodOff: 2000, active: false, timer: 0 },
        // Laser 3: Pulses regularly guarding chip entrance
        { id: 3, type: 'pulse', x1: 5, y1: 4, x2: 5, y2: 5, dir: 'v', periodOn: 1500, periodOff: 2500, active: false, timer: 0 }
      ];
    }

    // Robot state
    this.robot = {
      x: this.startPos.x,
      y: this.startPos.y,
      renderX: this.startPos.x * this.tileSize,
      renderY: this.startPos.y * this.tileSize,
      facing: 'RIGHT', // 'UP', 'DOWN', 'LEFT', 'RIGHT'
      facingAngle: 0,
      targetAngle: 0
    };
  }

  bindEvents() {
    this.handleKeyDown = (e) => {
      if (this.state !== 'PLAYING' && this.state !== 'CHIP_COLLECTED') return;
      if (this.isPaused) return;

      const key = e.key.toLowerCase();
      let dx = 0;
      let dy = 0;

      if (key === 'arrowup' || key === 'w') { dy = -1; this.robot.facing = 'UP'; this.robot.targetAngle = -Math.PI / 2; }
      else if (key === 'arrowdown' || key === 's') { dy = 1; this.robot.facing = 'DOWN'; this.robot.targetAngle = Math.PI / 2; }
      else if (key === 'arrowleft' || key === 'a') { dx = -1; this.robot.facing = 'LEFT'; this.robot.targetAngle = Math.PI; }
      else if (key === 'arrowright' || key === 'd') { dx = 1; this.robot.facing = 'RIGHT'; this.robot.targetAngle = 0; }
      else if (key === 'p') { this.togglePause(); return; }
      else return;

      // Prevent window scroll
      e.preventDefault();

      const now = performance.now();
      if (now - this.lastMoveTime < this.moveDelay) return;
      this.lastMoveTime = now;

      this.moveRobot(dx, dy);
    };

    window.addEventListener('keydown', this.handleKeyDown);
  }

  step(dir) {
    if (this.state !== 'PLAYING' && this.state !== 'CHIP_COLLECTED') return;
    if (this.isPaused) return;
    let dx = 0, dy = 0;
    if (dir === 'UP') { dy = -1; this.robot.facing = 'UP'; this.robot.targetAngle = -Math.PI / 2; }
    else if (dir === 'DOWN') { dy = 1; this.robot.facing = 'DOWN'; this.robot.targetAngle = Math.PI / 2; }
    else if (dir === 'LEFT') { dx = -1; this.robot.facing = 'LEFT'; this.robot.targetAngle = Math.PI; }
    else if (dir === 'RIGHT') { dx = 1; this.robot.facing = 'RIGHT'; this.robot.targetAngle = 0; }
    else return;
    this.moveRobot(dx, dy);
  }

  moveRobot(dx, dy) {
    const targetX = this.robot.x + dx;
    const targetY = this.robot.y + dy;

    // Wall collision check
    if (this.map[targetY] && this.map[targetY][targetX] === 1) {
      if (window.soundEngine) window.soundEngine.playClick();
      return;
    }

    // Valid move
    this.robot.x = targetX;
    this.robot.y = targetY;
    if (window.soundEngine) window.soundEngine.playStep();

    // Check Chip Collection
    if (!this.hasChip && this.robot.x === this.chipPos.x && this.robot.y === this.chipPos.y) {
      this.hasChip = true;
      this.state = 'CHIP_COLLECTED';
      this.updateHUD();
      if (window.soundEngine) {
        window.soundEngine.playChipCollect();
        setTimeout(() => window.soundEngine.playSecurityAlarm(), 250);
        setTimeout(() => window.soundEngine.playDoorUnlock(), 650);
      }
    }

    // Check Exit Reach
    if (this.hasChip && this.robot.x === this.exitPos.x && this.robot.y === this.exitPos.y) {
      this.handleVictory();
    }
  }

  startMission() {
    if (this.briefingModal) {
      this.briefingModal.classList.add('hidden');
    }
    this.state = 'PLAYING';
    this.isPaused = false;
    this.startTimer();
    this.startLoop();
    this.updateHUD();

    if (window.soundEngine) window.soundEngine.playClick();
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.isPaused || this.state === 'MISSION_COMPLETE' || this.state === 'MISSION_FAILED') return;

      this.timeLeft--;
      this.updateTimerDisplay();

      if (this.timeLeft <= 0) {
        this.handleFailure();
      }
    }, 1000);
  }

  updateTimerDisplay() {
    if (!this.timerElem) return;
    const mins = Math.floor(this.timeLeft / 60);
    const secs = this.timeLeft % 60;
    this.timerElem.textContent = `TIME: 0${mins}:${secs < 10 ? '0' : ''}${secs}`;

    if (this.timeLeft <= 15) {
      this.timerElem.parentElement.classList.add('warning');
    } else {
      this.timerElem.parentElement.classList.remove('warning');
    }
  }

  updateHUD() {
    if (this.chipPill) {
      if (this.hasChip) {
        this.chipPill.className = 'laser-chip-pill acquired';
        this.chipPill.innerHTML = '<span>⚡</span> ACCESS CHIP: ACQUIRED ✓';
      } else {
        this.chipPill.className = 'laser-chip-pill';
        this.chipPill.innerHTML = '<span>○</span> ACCESS CHIP: MISSING';
      }
    }

    if (this.statusPill) {
      let label = this.state.replace('_', ' ');
      let cls = 'laser-status-pill ' + this.state.toLowerCase().replace('_', '-');
      this.statusPill.className = cls;
      this.statusPill.textContent = label;
    }
  }

  togglePause() {
    if (this.state !== 'PLAYING' && this.state !== 'CHIP_COLLECTED') return;
    this.isPaused = !this.isPaused;
    if (this.statusPill) {
      this.statusPill.textContent = this.isPaused ? 'PAUSED' : (this.hasChip ? 'CHIP COLLECTED' : 'PLAYING');
    }
    if (window.soundEngine) window.soundEngine.playClick();
  }

  checkLaserCollisions() {
    const rx = this.robot.x;
    const ry = this.robot.y;

    for (let laser of this.lasers) {
      if (!laser.active) continue;

      let hit = false;
      if (laser.dir === 'h') {
        const minX = Math.min(laser.x1, laser.x2);
        const maxX = Math.max(laser.x1, laser.x2);
        if (ry === laser.y1 && rx >= minX && rx <= maxX) {
          hit = true;
        }
      } else {
        const minY = Math.min(laser.y1, laser.y2);
        const maxY = Math.max(laser.y1, laser.y2);
        if (rx === laser.x1 && ry >= minY && ry <= maxY) {
          hit = true;
        }
      }

      if (hit) {
        this.handleLaserHit();
        break;
      }
    }
  }

  handleLaserHit() {
    // Red screen flash
    if (this.flashOverlay) {
      this.flashOverlay.classList.add('active');
      setTimeout(() => this.flashOverlay.classList.remove('active'), 250);
    }

    if (window.soundEngine) {
      window.soundEngine.playLaserHit();
    }

    // Reset robot back to start position (chip state is preserved if collected)
    this.robot.x = this.startPos.x;
    this.robot.y = this.startPos.y;
    this.robot.renderX = this.startPos.x * this.tileSize;
    this.robot.renderY = this.startPos.y * this.tileSize;
    this.robot.targetAngle = 0;
  }

  handleFailure() {
    this.state = 'MISSION_FAILED';
    if (this.timerInterval) clearInterval(this.timerInterval);

    if (this.failedModal) {
      this.failedModal.classList.add('active');
    }
    this.updateHUD();

    if (window.soundEngine) {
      window.soundEngine.playCrash();
    }
  }

  handleVictory() {
    this.state = 'MISSION_COMPLETE';
    if (this.timerInterval) clearInterval(this.timerInterval);

    if (this.victoryModal) {
      const codeDigits = this.victoryModal.querySelector('.code-digits');
      if (codeDigits) {
        codeDigits.textContent = this.VAULT_CODE;
      }
      this.victoryModal.classList.add('active');
    }
    this.updateHUD();

    if (window.soundEngine) {
      window.soundEngine.playGrandCelebration();
      setTimeout(() => window.soundEngine.playVaultDecrypted(), 400);
    }

    if (typeof this.onWin === 'function') {
      this.onWin();
    }
  }

  reset() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.state = 'READY';
    this.isPaused = false;
    this.hasChip = false;
    this.timeLeft = this.timeLimit;

    this.robot.x = this.startPos.x;
    this.robot.y = this.startPos.y;
    this.robot.renderX = this.startPos.x * this.tileSize;
    this.robot.renderY = this.startPos.y * this.tileSize;
    this.robot.facingAngle = 0;
    this.robot.targetAngle = 0;

    if (this.briefingModal) this.briefingModal.classList.remove('hidden');
    if (this.failedModal) this.failedModal.classList.remove('active');
    if (this.victoryModal) {
      const codeDigits = this.victoryModal.querySelector('.code-digits');
      if (codeDigits) {
        codeDigits.textContent = '----';
      }
      this.victoryModal.classList.remove('active');
    }

    this.updateTimerDisplay();
    this.updateHUD();
    this.render();
  }

  retry() {
    this.reset();
    this.startMission();
  }

  startLoop() {
    let lastTime = performance.now();

    const loop = (time) => {
      const dt = time - lastTime;
      lastTime = time;

      if (!this.isPaused && (this.state === 'PLAYING' || this.state === 'CHIP_COLLECTED')) {
        this.update(dt);
      }

      this.render();

      if (this.state !== 'MISSION_COMPLETE' && this.state !== 'MISSION_FAILED') {
        this.animFrameId = requestAnimationFrame(loop);
      }
    };

    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.animFrameId = requestAnimationFrame(loop);
  }

  update(dt) {
    // 1. Update Laser Timing & Telegraph Warning State
    for (let laser of this.lasers) {
      if (laser.type === 'continuous') {
        laser.active = true;
        laser.warning = false;
      } else if (laser.type === 'alternate' || laser.type === 'pulse') {
        laser.timer += dt;
        const cycle = laser.periodOn + laser.periodOff;
        const currentMod = laser.timer % cycle;
        laser.active = currentMod < laser.periodOn;

        // Telegraph warning 650ms before laser blasts on!
        const remainingOffTime = cycle - currentMod;
        const isWarning = !laser.active && remainingOffTime <= 650;
        if (isWarning && !laser.warning) {
          if (window.soundEngine) {
            window.soundEngine.playLaserWarning();
          }
        }
        laser.warning = isWarning;
      }
    }

    // 2. Smooth robot position tweening
    const targetRenderX = this.robot.x * this.tileSize;
    const targetRenderY = this.robot.y * this.tileSize;
    this.robot.renderX += (targetRenderX - this.robot.renderX) * 0.35;
    this.robot.renderY += (targetRenderY - this.robot.renderY) * 0.35;

    // Angle smoothing
    this.robot.facingAngle += (this.robot.targetAngle - this.robot.facingAngle) * 0.3;

    // 3. Collision with active lasers
    this.checkLaserCollisions();
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const ts = this.tileSize;

    // Clear background
    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Subtle grid texture
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.lineWidth = 1;
    for (let c = 0; c <= this.cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * ts, 0);
      ctx.lineTo(c * ts, this.rows * ts);
      ctx.stroke();
    }
    for (let r = 0; r <= this.rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * ts);
      ctx.lineTo(this.cols * ts, r * ts);
      ctx.stroke();
    }

    // Render Walls
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.map[r][c] === 1) {
          // Wall tile
          ctx.fillStyle = '#0d1522';
          ctx.fillRect(c * ts, r * ts, ts, ts);
          ctx.strokeStyle = '#1d2c42';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(c * ts + 1, r * ts + 1, ts - 2, ts - 2);

          // Subtle cyan corner accent
          ctx.fillStyle = this.accentColor;
          ctx.fillRect(c * ts + 2, r * ts + 2, 3, 3);
        }
      }
    }

    // Emergency Extraction Runway Lights (Active when chip retrieved)
    if (this.hasChip) {
      const exitCX = this.exitPos.x * ts + ts / 2;
      const exitCY = this.exitPos.y * ts + ts / 2;
      const pulsePhase = (Date.now() * 0.004) % 1;

      ctx.save();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 8]);
      ctx.lineDashOffset = -Date.now() * 0.02;
      ctx.beginPath();
      ctx.moveTo(this.robot.renderX + ts / 2, this.robot.renderY + ts / 2);
      ctx.lineTo(exitCX, exitCY);
      ctx.stroke();
      ctx.restore();
    }

    // Render Exit / Extraction Point
    const ex = this.exitPos.x * ts;
    const ey = this.exitPos.y * ts;
    if (this.hasChip) {
      // Unlocked & glowing green
      ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.fillRect(ex + 4, ey + 4, ts - 8, ts - 8);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 15;
      ctx.strokeRect(ex + 4, ey + 4, ts - 8, ts - 8);
      ctx.shadowBlur = 0;

      // Radar scan pulse
      ctx.save();
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🏁', ex + ts / 2, ey + ts / 2);
      ctx.restore();
    } else {
      // Locked exit
      ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
      ctx.fillRect(ex + 4, ey + 4, ts - 8, ts - 8);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(ex + 4, ey + 4, ts - 8, ts - 8);

      ctx.save();
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔒', ex + ts / 2, ey + ts / 2);
      ctx.restore();
    }

    // Render Access Chip (if not yet collected) with 3D floating sine bobbing
    if (!this.hasChip) {
      const cx = this.chipPos.x * ts + ts / 2;
      const bob = Math.sin(Date.now() * 0.006) * 4;
      const cy = this.chipPos.y * ts + ts / 2 + bob;

      // Rotating Outer halo
      ctx.save();
      ctx.beginPath();
      const haloR = 14 + Math.sin(Date.now() * 0.008) * 2;
      ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Chip icon
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💾', cx, cy);
      ctx.restore();
    }

    // Render Lasers
    for (let laser of this.lasers) {
      const x1 = laser.x1 * ts + ts / 2;
      const y1 = laser.y1 * ts + ts / 2;
      const x2 = laser.x2 * ts + ts / 2;
      const y2 = laser.y2 * ts + ts / 2;

      // Emitter heads
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(x1, y1, 5, 0, Math.PI * 2);
      ctx.arc(x2, y2, 5, 0, Math.PI * 2);
      ctx.fill();

      if (laser.active) {
        // Red glowing active beam with dynamic plasma jitter
        const jitter = Math.sin(Date.now() * 0.03 + laser.id) * 0.8;

        ctx.save();
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 14;

        // Outer glow beam
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.lineWidth = 6 + jitter;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Core bright laser line
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Wall contact flare points
        ctx.fillStyle = '#ff8888';
        ctx.beginPath();
        ctx.arc(x1, y1, 3.5, 0, Math.PI * 2);
        ctx.arc(x2, y2, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else if (laser.warning) {
        // Telegraphing Warning Beam (Laser is charging up!)
        ctx.save();
        ctx.strokeStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 6]);
        ctx.lineDashOffset = -Date.now() * 0.03;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Amber flashing emitter heads
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(x1, y1, 4, 0, Math.PI * 2);
        ctx.arc(x2, y2, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else {
        // Inactive laser faint guide line
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.12)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Render Robot
    const rx = this.robot.renderX + ts / 2;
    const ry = this.robot.renderY + ts / 2;

    // Sci-Fi Directional Flashlight Cone
    if (typeof ctx.createRadialGradient === 'function') {
      ctx.save();
      ctx.translate(rx, ry);
      ctx.rotate(this.robot.facingAngle);
      const grad = ctx.createRadialGradient(0, 0, 10, 80, 0, 130);
      grad.addColorStop(0, this.team === 'A' ? 'rgba(0, 210, 255, 0.28)' : 'rgba(255, 120, 0, 0.28)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 130, -0.42, 0.42);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Robot Body
    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(this.robot.facingAngle);

    // Robot shadow
    ctx.shadowColor = this.accentColor;
    ctx.shadowBlur = 12;

    // Robot circular chassis
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#0a101d';
    ctx.fill();
    ctx.strokeStyle = this.accentColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Direction pointer / eye lens
    ctx.beginPath();
    ctx.arc(8, 0, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Tread lines
    ctx.fillStyle = '#334155';
    ctx.fillRect(-12, -18, 24, 4);
    ctx.fillRect(-12, 14, 24, 4);

    ctx.restore();
  }

  destroy() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.handleKeyDown) window.removeEventListener('keydown', this.handleKeyDown);
  }
}

window.LaserLockdownGame = LaserLockdownGame;
