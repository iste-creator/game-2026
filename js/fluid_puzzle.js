// ========================================================
// DELUXE FLUID CARVING ENGINE (WHERE'S MY WATER DELUXE)
// Features: 
// 1. Bedrock excavation & carving
// 2. Reservoir release gate
// 3. 3 Collectible Micro-Cores
// 4. Corrosive Acid / Thermal Hazard Pools (vaporizes drops)
// 5. Interactive mechanical diverter gate
// 6. Real-time RPM tachometer & fluid fill gauge
// ========================================================

class FluidPuzzle {
  constructor(options) {
    this.canvasId = options.canvasId;
    this.team = options.team; // 'A' or 'B'
    this.accentColor = options.accentColor || '#00d2ff';
    this.targetFill = options.targetFill || 25; // number of drops needed
    this.onWin = options.onWin || (() => {});
    
    this.canvas = document.getElementById(this.canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.width = 720;
    this.height = 430;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.cellSize = 8;
    this.cols = Math.ceil(this.width / this.cellSize);
    this.rows = Math.ceil(this.height / this.cellSize);

    // 0 = empty air, 1 = carveable bedrock, 2 = steel barrier, 3 = acid/thermal hazard
    this.grid = [];
    this.particles = [];
    this.steamParticles = [];
    this.digSparks = [];
    this.splashes = [];
    this.floatingPopups = [];
    this.collectedDrops = 0;
    this.isWon = false;
    this.isCarving = false;
    this.gateOpen = false;
    this.rpm = 0;
    this.turbineAngle = 0;
    this.lastCarveSoundTime = 0;

    // Interactive dig reticle
    this.mousePos = { x: -100, y: -100, isHover: false };

    // Diverter gate angle (for Team A / Team B interactive mechanic)
    this.diverterAngle = 0; // toggles on click

    // 3 Collectible Micro-Cores & Checkpoint Storage
    this.cores = [];
    this.coresCheckpointKey = `op_rebuild_v1_cores_${this.team}`;
    this.lastLockWarnTime = 0;

    // Layout configuration by Team
    if (this.team === 'A') {
      this.reservoir = { x: 50, y: 30, w: 150, h: 60 };
      this.funnel = { x: 560, y: 345, w: 120, h: 65 };
      this.gate = { x: 70, y: 90, w: 110, h: 12 };
      this.diverter = { x: 380, y: 220, len: 55, angle: -0.6 };
      
      // 3 Cores in strategic trick spots
      this.cores = [
        { x: 180, y: 210, r: 12, collected: false, label: '1' },
        { x: 480, y: 170, r: 12, collected: false, label: '2' },
        { x: 380, y: 330, r: 12, collected: false, label: '3' }
      ];

      // Acid/Thermal Hazard Zones
      this.hazards = [
        { x: 260, y: 360, w: 120, h: 35, color: '#ef4444', label: 'THERMAL LAVA' },
        { x: 440, y: 260, w: 90, h: 25, color: '#ef4444', label: 'VENT' }
      ];

    } else {
      // Team B Layout: Top-Center Reservoir -> Bottom-Center Intake with Dual Acid Flanks
      this.reservoir = { x: 285, y: 30, w: 150, h: 60 };
      this.funnel = { x: 300, y: 345, w: 120, h: 65 };
      this.gate = { x: 305, y: 90, w: 110, h: 12 };
      this.diverter = { x: 360, y: 190, len: 65, angle: 0 };

      // 3 Cores
      this.cores = [
        { x: 120, y: 220, r: 12, collected: false, label: '1' },
        { x: 600, y: 220, r: 12, collected: false, label: '2' },
        { x: 360, y: 280, r: 12, collected: false, label: '3' }
      ];

      // Acid Hazards (Corrosive purple / lava)
      this.hazards = [
        { x: 170, y: 350, w: 100, h: 35, color: '#d946ef', label: 'CORROSIVE ACID' },
        { x: 450, y: 350, w: 100, h: 35, color: '#d946ef', label: 'CORROSIVE ACID' }
      ];
    }

    // Load any previously saved core checkpoints
    const checkpoint = this.loadCoresCheckpoint();
    this.cores.forEach((core, idx) => {
      if (checkpoint[idx]) {
        core.collected = true;
      }
    });

    this.initTerrain();
    this.initParticles();
    this.bindEvents();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  loadCoresCheckpoint() {
    try {
      const saved = localStorage.getItem(this.coresCheckpointKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 3) {
          return parsed;
        }
      }
    } catch (e) {}
    return [false, false, false];
  }

  saveCoresCheckpoint() {
    try {
      const data = this.cores.map(c => !!c.collected);
      localStorage.setItem(this.coresCheckpointKey, JSON.stringify(data));
    } catch (e) {}
  }

  allCoresCollected() {
    return this.cores.length > 0 && this.cores.every(c => c.collected);
  }

  getCoresCollectedCount() {
    return this.cores.filter(c => c.collected).length;
  }

  initTerrain() {
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      this.grid[r] = [];
      for (let c = 0; c < this.cols; c++) {
        const x = c * this.cellSize;
        const y = r * this.cellSize;

        // Reservoir interior is open
        if (x >= this.reservoir.x && x <= this.reservoir.x + this.reservoir.w &&
            y >= this.reservoir.y && y <= this.reservoir.y + this.reservoir.h) {
          this.grid[r][c] = 0;
          continue;
        }

        // Funnel interior is open
        if (x >= this.funnel.x && x <= this.funnel.x + this.funnel.w &&
            y >= this.funnel.y - 10) {
          this.grid[r][c] = 0;
          continue;
        }

        // Gate zone initially blocks
        if (!this.gateOpen && x >= this.gate.x && x <= this.gate.x + this.gate.w &&
            y >= this.gate.y && y <= this.gate.y + this.gate.h) {
          this.grid[r][c] = 2; // blast door
          continue;
        }

        // Outer borders are indestructible steel
        if (r <= 2 || r >= this.rows - 2 || c <= 2 || c >= this.cols - 2) {
          this.grid[r][c] = 2;
          continue;
        }

        // Check Acid Hazards (Cell type 3)
        let isHazard = false;
        for (let hz of this.hazards) {
          if (x >= hz.x && x <= hz.x + hz.w && y >= hz.y && y <= hz.y + hz.h) {
            this.grid[r][c] = 3;
            isHazard = true;
            break;
          }
        }
        if (isHazard) continue;

        // Team-specific steel barriers
        if (this.team === 'A') {
          // Steel bulkheads forcing zig-zag planning
          if ((x >= 230 && x <= 250 && y >= 110 && y <= 270) ||
              (x >= 400 && x <= 420 && y >= 170 && y <= 330) ||
              (x >= 90 && x <= 240 && y >= 270 && y <= 285)) {
            this.grid[r][c] = 2;
            continue;
          }
        } else {
          // Team B: Central reactor core
          if ((x >= 290 && x <= 430 && y >= 140 && y <= 230) ||
              (x >= 80 && x <= 220 && y >= 250 && y <= 265) ||
              (x >= 500 && x <= 640 && y >= 250 && y <= 265)) {
            this.grid[r][c] = 2;
            continue;
          }
        }

        // Default carveable bedrock
        this.grid[r][c] = 1;
      }
    }
  }

  initParticles() {
    this.particles = [];
    this.steamParticles = [];
    this.collectedDrops = 0;
    this.isWon = false;
    this.rpm = 0;
    this.gateOpen = false;

    // Checkpoint Retention: Preserve collected telemetry cores across redos!
    const checkpoint = this.loadCoresCheckpoint();
    this.cores.forEach((core, idx) => {
      if (checkpoint[idx]) {
        core.collected = true;
      }
      const badge = document.getElementById(`coreBadge${this.team}_${idx + 1}`);
      if (badge) {
        if (core.collected) badge.classList.add('collected');
        else badge.classList.remove('collected');
      }
    });

    const valveBtn = document.getElementById(`valveBtn${this.team}`);
    if (valveBtn) {
      valveBtn.classList.remove('open');
      valveBtn.innerHTML = '<span>🚪</span> OPEN VALVE';
    }

    const count = 110;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: this.reservoir.x + 10 + Math.random() * (this.reservoir.w - 20),
        y: this.reservoir.y + 10 + Math.random() * (this.reservoir.h - 20),
        vx: (Math.random() - 0.5) * 1.4,
        vy: Math.random() * 0.4,
        radius: 3.5 + Math.random() * 1.5,
        active: true
      });
    }
  }

  toggleGate() {
    this.gateOpen = !this.gateOpen;
    const valveBtn = document.getElementById(`valveBtn${this.team}`);
    if (valveBtn) {
      if (this.gateOpen) {
        valveBtn.classList.add('open');
        valveBtn.innerHTML = '<span>⚡</span> VALVE RELEASED';
      } else {
        valveBtn.classList.remove('open');
        valveBtn.innerHTML = '<span>🚪</span> OPEN VALVE';
      }
    }

    // Open gate cells
    const startCol = Math.floor(this.gate.x / this.cellSize);
    const endCol = Math.floor((this.gate.x + this.gate.w) / this.cellSize);
    const startRow = Math.floor(this.gate.y / this.cellSize);
    const endRow = Math.floor((this.gate.y + this.gate.h) / this.cellSize);

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
          this.grid[r][c] = this.gateOpen ? 0 : 2;
        }
      }
    }

    if (window.soundEngine) {
      window.soundEngine.playClick();
      setTimeout(() => window.soundEngine.playEngineRev(), 150);
    }
  }

  toggleDiverter() {
    this.diverterAngle += 0.8;
    if (this.diverterAngle > 1.2) this.diverterAngle = -1.2;
    if (window.soundEngine) window.soundEngine.playClick();
  }

  bindEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    };

    const carve = (e) => {
      const pos = getPos(e);
      this.mousePos.x = pos.x;
      this.mousePos.y = pos.y;
      this.mousePos.isHover = true;

      if (!this.isCarving) return;
      this.carveAt(pos.x, pos.y, 24);
    };

    this.canvas.addEventListener('mouseenter', () => { this.mousePos.isHover = true; });
    this.canvas.addEventListener('mouseleave', () => { this.mousePos.isHover = false; this.isCarving = false; });

    this.canvas.addEventListener('mousedown', (e) => {
      const pos = getPos(e);
      this.mousePos.x = pos.x;
      this.mousePos.y = pos.y;
      this.mousePos.isHover = true;

      // Check if clicking the mechanical diverter fin
      const dx = pos.x - this.diverter.x;
      const dy = pos.y - this.diverter.y;
      if (dx * dx + dy * dy < 45 * 45) {
        this.toggleDiverter();
        return;
      }

      this.isCarving = true;
      carve(e);
      if (window.soundEngine) window.soundEngine.playClick();
    });

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('mousemove', (e) => {
        if (this.canvas) {
          const rect = this.canvas.getBoundingClientRect();
          if (e.clientX >= rect.left && e.clientX <= rect.right &&
              e.clientY >= rect.top && e.clientY <= rect.bottom) {
            const pos = getPos(e);
            this.mousePos.x = pos.x;
            this.mousePos.y = pos.y;
            this.mousePos.isHover = true;
          }
        }
        if (this.isCarving) {
          carve(e);
        }
      });

      window.addEventListener('mouseup', () => { this.isCarving = false; });

      window.addEventListener('touchmove', (e) => {
        if (this.isCarving) {
          carve(e);
          e.preventDefault();
        }
      }, { passive: false });

      window.addEventListener('touchend', () => { 
        this.isCarving = false; 
        this.mousePos.isHover = false;
      });

      // Keyboard Space shortcut for Emergency Fluid Surge
      window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && this.canvas && this.canvas.offsetParent !== null) {
          e.preventDefault();
          this.boostFluid();
        }
      });
    }
  }

  boostFluid() {
    let affected = 0;
    for (let p of this.particles) {
      if (p.active) {
        p.vx += (Math.random() - 0.5) * 5;
        p.vy -= (Math.random() * 3 + 1.5);
        affected++;
      }
    }
    this.floatingPopups.push({
      text: '⚡ PNEUMATIC SURGE!',
      x: this.diverter.x,
      y: this.diverter.y - 30,
      alpha: 1,
      color: '#f59e0b',
      vy: -1.2
    });
    if (window.soundEngine) {
      window.soundEngine.playEngineRev();
    }
  }

  carveAt(x, y, radius) {
    const centerCol = Math.floor(x / this.cellSize);
    const centerRow = Math.floor(y / this.cellSize);
    const cellRadius = Math.ceil(radius / this.cellSize);
    let excavatedCount = 0;

    for (let r = centerRow - cellRadius; r <= centerRow + cellRadius; r++) {
      for (let c = centerCol - cellRadius; c <= centerCol + cellRadius; c++) {
        if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
          const dx = (c - centerCol) * this.cellSize;
          const dy = (r - centerRow) * this.cellSize;
          if (dx * dx + dy * dy <= radius * radius) {
            // Only excavate bedrock (1). Steel (2) & Acid (3) cannot be dug!
            if (this.grid[r][c] === 1) {
              this.grid[r][c] = 0;
              excavatedCount++;

              // Emit rock sparks & debris
              if (Math.random() < 0.35 && this.digSparks.length < 50) {
                this.digSparks.push({
                  x: c * this.cellSize + this.cellSize / 2,
                  y: r * this.cellSize + this.cellSize / 2,
                  vx: (Math.random() - 0.5) * 4,
                  vy: -Math.random() * 3 - 0.5,
                  alpha: 1,
                  size: Math.random() * 2.5 + 1.5,
                  color: Math.random() < 0.6 ? '#f59e0b' : this.accentColor
                });
              }
            }
          }
        }
      }
    }

    if (excavatedCount > 0) {
      const now = performance.now();
      if (now - this.lastCarveSoundTime > 60) {
        this.lastCarveSoundTime = now;
        if (window.soundEngine) {
          window.soundEngine.playCarve();
        }
      }
    }
  }

  getCellType(x, y) {
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return 2; // steel boundary
    return this.grid[row][col];
  }

  updatePhysics() {
    const gravity = 0.35;
    const friction = 0.985;

    // Diverter blade endpoints
    const cosA = Math.cos(this.diverter.angle);
    const sinA = Math.sin(this.diverter.angle);
    const dX1 = this.diverter.x - (this.diverter.len / 2) * cosA;
    const dY1 = this.diverter.y - (this.diverter.len / 2) * sinA;
    const dX2 = this.diverter.x + (this.diverter.len / 2) * cosA;
    const dY2 = this.diverter.y + (this.diverter.len / 2) * sinA;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.active) continue;

      p.vy += gravity;
      p.vx *= friction;
      p.vy = Math.min(p.vy, 8.5);

      let nextX = p.x + p.vx;
      let nextY = p.y + p.vy;

      // 1. Check Acid / Thermal Hazard (Type 3) -> Vaporize
      if (this.getCellType(nextX, nextY) === 3) {
        p.active = false;
        // Spawn steam vapor
        for (let s = 0; s < 3; s++) {
          this.steamParticles.push({
            x: nextX,
            y: nextY,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -Math.random() * 2 - 1,
            alpha: 0.8,
            radius: Math.random() * 4 + 2
          });
        }
        if (window.soundEngine && Math.random() < 0.2) {
          window.soundEngine.playClick();
        }
        continue;
      }

      // 2. Check Collectible Micro-Cores
      this.cores.forEach((core, cIdx) => {
        if (!core.collected) {
          const cdx = p.x - core.x;
          const cdy = p.y - core.y;
          if (cdx * cdx + cdy * cdy <= (core.r + p.radius) * (core.r + p.radius)) {
            core.collected = true;
            this.saveCoresCheckpoint(); // Store checkpoint immediately

            const badge = document.getElementById(`coreBadge${this.team}_${cIdx + 1}`);
            if (badge) badge.classList.add('collected');

            const allDone = this.allCoresCollected();
            const count = this.getCoresCollectedCount();

            // Floating popup
            this.floatingPopups.push({
              text: allDone ? '⚡ ALL 3 CORES SECURED! MOTOR INTAKE UNLOCKED!' : `+1 CORE [0${cIdx + 1}] CHECKPOINT SAVED (${count}/3) 💾`,
              x: core.x,
              y: core.y - 12,
              alpha: 1,
              color: allDone ? '#10b981' : '#f59e0b',
              vy: -1.2
            });

            if (window.soundEngine) {
              window.soundEngine.playChipCollect();
              if (allDone) {
                setTimeout(() => window.soundEngine.playDoorUnlock(), 300);
              }
            }
          }
        }
      });

      // 3. Collision with Mechanical Diverter Blade
      // Point-to-segment distance check
      const segLen2 = (dX2 - dX1) * (dX2 - dX1) + (dY2 - dY1) * (dY2 - dY1);
      let t = ((p.x - dX1) * (dX2 - dX1) + (p.y - dY1) * (dY2 - dY1)) / segLen2;
      t = Math.max(0, Math.min(1, t));
      const projX = dX1 + t * (dX2 - dX1);
      const projY = dY1 + t * (dY2 - dY1);
      const distDiverter = Math.hypot(p.x - projX, p.y - projY);

      if (distDiverter < p.radius + 5) {
        // Deflect along the blade vector
        p.vx = cosA * 3.5;
        p.vy = sinA * 3.5;
        p.x = projX + (p.vx > 0 ? 6 : -6);
        p.y = projY - 6;
      }

      // 4. Vertical Grid Terrain Collision
      const cellBelow = this.getCellType(p.x, nextY + p.radius);
      if (cellBelow > 0) {
        p.vy = -p.vy * 0.12;
        // Natural fluid slump / rolling left or right
        const leftEmpty = this.getCellType(p.x - p.radius - 2, p.y) === 0;
        const rightEmpty = this.getCellType(p.x + p.radius + 2, p.y) === 0;

        if (leftEmpty && !rightEmpty) p.vx -= 0.9;
        else if (rightEmpty && !leftEmpty) p.vx += 0.9;
        else p.vx += (Math.random() - 0.5) * 0.6;

        nextY = p.y;
      } else {
        p.y = nextY;
      }

      // 5. Horizontal Grid Terrain Collision
      const cellSide = this.getCellType(nextX + (p.vx > 0 ? p.radius : -p.radius), p.y);
      if (cellSide > 0) {
        p.vx = -p.vx * 0.25;
      } else {
        p.x = nextX;
      }

      // 6. Check Funnel Arrival (Into Motor Cooling Reservoir)
      if (p.x >= this.funnel.x && p.x <= this.funnel.x + this.funnel.w &&
          p.y >= this.funnel.y && p.y <= this.funnel.y + this.funnel.h) {

        // REQUIREMENT: Must collect ALL 3 telemetry cores before entering motor!
        if (!this.allCoresCollected()) {
          // Motor intake is locked: bounce droplet away with deflection
          p.vy = -Math.abs(p.vy) * 0.55 - 1.4;
          p.vx += (Math.random() - 0.5) * 4.8;
          p.y = this.funnel.y - p.radius - 2;

          const now = performance.now();
          if (!this.lastLockWarnTime || now - this.lastLockWarnTime > 850) {
            this.lastLockWarnTime = now;
            const count = this.getCoresCollectedCount();
            this.floatingPopups.push({
              text: `🔒 MOTOR LOCKED! COLLECT ALL 3 CORES FIRST (${count}/3)`,
              x: this.funnel.x - 30,
              y: this.funnel.y - 18,
              alpha: 1,
              color: '#ef4444',
              vy: -1.1
            });
            if (window.soundEngine) {
              window.soundEngine.playLaserHit();
            }
          }
          continue;
        }

        p.active = false;
        this.collectedDrops++;

        // Spawn energetic splashes
        for (let sp = 0; sp < 3; sp++) {
          this.splashes.push({
            x: p.x,
            y: this.funnel.y + 40,
            vx: (Math.random() - 0.5) * 3,
            vy: -Math.random() * 3.5 - 1,
            alpha: 1,
            radius: Math.random() * 2 + 1.5,
            color: this.accentColor
          });
        }

        // Live RPM Tachometer Acceleration
        const fillFraction = Math.min(1, this.collectedDrops / this.targetFill);
        this.rpm = Math.round(fillFraction * 12500);

        const rText = document.getElementById(`rpmText${this.team}`);
        if (rText) rText.textContent = `${this.rpm.toLocaleString()} RPM`;

        const fillPct = Math.min(100, Math.round(fillFraction * 100));
        const fillBar = document.getElementById(`tankFill${this.team}`);
        const pctText = document.getElementById(`tankPct${this.team}`);
        if (fillBar) fillBar.style.width = `${fillPct}%`;
        if (pctText) pctText.textContent = `${fillPct}%`;

        if (window.soundEngine && (this.collectedDrops % 3 === 0)) {
          window.soundEngine.playSplash();
        }

        // Winning trigger
        if (this.collectedDrops >= this.targetFill && !this.isWon) {
          this.isWon = true;
          this.rpm = 12500;
          this.floatingPopups.push({
            text: 'MOTOR FULLY PRIMED! 🏁',
            x: this.funnel.x - 20,
            y: this.funnel.y - 20,
            alpha: 1,
            color: '#10b981',
            vy: -0.8
          });
          if (window.soundEngine) {
            window.soundEngine.playGrandCelebration();
          }
          this.onWin();
        }
      }
    }

    // Update turbine rotation speed based on RPM
    this.turbineAngle += 0.04 + (this.rpm / 12500) * 0.35;

    // Update vapor steam
    for (let s = this.steamParticles.length - 1; s >= 0; s--) {
      const st = this.steamParticles[s];
      st.x += st.vx;
      st.y += st.vy;
      st.alpha -= 0.025;
      st.radius += 0.2;
      if (st.alpha <= 0) {
        this.steamParticles.splice(s, 1);
      }
    }

    // Update rock excavation sparks
    for (let d = this.digSparks.length - 1; d >= 0; d--) {
      const spark = this.digSparks[d];
      spark.x += spark.vx;
      spark.y += spark.vy;
      spark.vy += 0.15; // gravity
      spark.alpha -= 0.035;
      if (spark.alpha <= 0) {
        this.digSparks.splice(d, 1);
      }
    }

    // Update funnel splashes
    for (let sp = this.splashes.length - 1; sp >= 0; sp--) {
      const splash = this.splashes[sp];
      splash.x += splash.vx;
      splash.y += splash.vy;
      splash.vy += 0.2;
      splash.alpha -= 0.03;
      if (splash.alpha <= 0) {
        this.splashes.splice(sp, 1);
      }
    }

    // Update floating popups
    for (let fp = this.floatingPopups.length - 1; fp >= 0; fp--) {
      const popup = this.floatingPopups[fp];
      popup.y += popup.vy;
      popup.alpha -= 0.015;
      if (popup.alpha <= 0) {
        this.floatingPopups.splice(fp, 1);
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Grid Terrain
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const val = this.grid[r][c];
        const x = c * this.cellSize;
        const y = r * this.cellSize;

        if (val === 1) {
          // Carveable Bedrock / Dirt with high-tech rock patterning
          this.ctx.fillStyle = '#141a24';
          this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
          if ((r + c) % 4 === 0) {
            this.ctx.fillStyle = '#1a2330';
            this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
          }
        } else if (val === 2) {
          // Indestructible Steel Bulkheads
          this.ctx.fillStyle = '#2b394a';
          this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
          if ((r + c) % 3 === 0) {
            this.ctx.fillStyle = '#f59e0b';
            this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
          }
        } else if (val === 3) {
          // Acid / Thermal Hazard Pools
          const hazardColor = this.team === 'A' ? 'rgba(239, 68, 68, 0.75)' : 'rgba(217, 70, 239, 0.75)';
          this.ctx.fillStyle = hazardColor;
          this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
        }
      }
    }

    // 2. Draw Acid / Lava Warning Signs
    for (let hz of this.hazards) {
      this.ctx.strokeStyle = hz.color;
      this.ctx.lineWidth = 1.5;
      this.ctx.strokeRect(hz.x, hz.y, hz.w, hz.h);

      this.ctx.fillStyle = hz.color;
      this.ctx.font = 'bold 9px "Share Tech Mono", monospace';
      this.ctx.fillText(`⚠️ ${hz.label}`, hz.x + 8, hz.y + 18);
    }

    // 3. Draw Reservoir Top Casing & Blast Gate
    this.ctx.fillStyle = 'rgba(6, 10, 16, 0.85)';
    this.ctx.strokeStyle = this.accentColor;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(this.reservoir.x, this.reservoir.y, this.reservoir.w, this.reservoir.h);

    this.ctx.fillStyle = this.accentColor;
    this.ctx.font = 'bold 11px "Share Tech Mono", monospace';
    this.ctx.fillText('⚡ HIGH-PRESSURE RESERVOIR', this.reservoir.x + 8, this.reservoir.y - 7);

    // Draw Blast Gate Bar
    if (!this.gateOpen) {
      this.ctx.fillStyle = '#f59e0b';
      this.ctx.fillRect(this.gate.x, this.gate.y, this.gate.w, this.gate.h);
      this.ctx.fillStyle = '#000';
      this.ctx.font = 'bold 9px "Share Tech Mono", monospace';
      this.ctx.fillText('BLAST GATE [LOCKED]', this.gate.x + 10, this.gate.y + 9);
    }

    // 4. Draw Interactive Mechanical Diverter Fin
    this.ctx.save();
    this.ctx.translate(this.diverter.x, this.diverter.y);
    this.ctx.rotate(this.diverter.angle);
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.fillRect(-this.diverter.len / 2, -4, this.diverter.len, 8);
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(-this.diverter.len / 2, -4, this.diverter.len, 8);
    this.ctx.restore();

    // Diverter Center Pivot
    this.ctx.beginPath();
    this.ctx.arc(this.diverter.x, this.diverter.y, 7, 0, Math.PI * 2);
    this.ctx.fillStyle = '#10b981';
    this.ctx.fill();
    this.ctx.strokeStyle = '#000';
    this.ctx.stroke();

    this.ctx.fillStyle = '#f59e0b';
    this.ctx.font = '9px "Share Tech Mono", monospace';
    this.ctx.fillText('CLICK PIVOT', this.diverter.x - 28, this.diverter.y - 14);

    // 5. Draw 3 Collectible Micro-Cores
    for (let core of this.cores) {
      this.ctx.beginPath();
      this.ctx.arc(core.x, core.y, core.r, 0, Math.PI * 2);

      if (core.collected) {
        this.ctx.fillStyle = '#f59e0b';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#f59e0b';
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      } else {
        this.ctx.fillStyle = '#1e293b';
        this.ctx.fill();
        this.ctx.strokeStyle = '#f59e0b';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Pulsing outer halo for uncollected cores
        this.ctx.beginPath();
        const haloR = core.r + 3 + Math.sin(Date.now() * 0.005) * 2;
        this.ctx.arc(core.x, core.y, haloR, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
      }

      this.ctx.fillStyle = core.collected ? '#000' : '#f59e0b';
      this.ctx.font = 'bold 10px "Share Tech Mono", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(`⚡${core.label}`, core.x, core.y);
    }
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'alphabetic';

    // 6. Draw Motor Intake Funnel
    const allUnlocked = this.allCoresCollected();
    const intakeColor = allUnlocked ? '#10b981' : '#ef4444';

    this.ctx.fillStyle = '#0a1018';
    this.ctx.strokeStyle = intakeColor;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(this.funnel.x, this.funnel.y);
    this.ctx.lineTo(this.funnel.x + 18, this.funnel.y + 45);
    this.ctx.lineTo(this.funnel.x + this.funnel.w - 18, this.funnel.y + 45);
    this.ctx.lineTo(this.funnel.x + this.funnel.w, this.funnel.y);
    this.ctx.stroke();

    if (!allUnlocked) {
      // Red locked intake hatch with caution crosshatch
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
      this.ctx.fillRect(this.funnel.x, this.funnel.y, this.funnel.w, 45);

      this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      for (let lx = this.funnel.x; lx <= this.funnel.x + this.funnel.w; lx += 16) {
        this.ctx.moveTo(lx, this.funnel.y);
        this.ctx.lineTo(lx + 20, this.funnel.y + 45);
      }
      this.ctx.stroke();

      const count = this.getCoresCollectedCount();
      this.ctx.fillStyle = '#ef4444';
      this.ctx.font = 'bold 10px "Share Tech Mono", monospace';
      this.ctx.fillText(`🔒 INTAKE LOCKED [${count}/3 CORES]`, this.funnel.x + 6, this.funnel.y + 28);
      this.ctx.restore();
    } else {
      this.ctx.fillStyle = '#10b981';
      this.ctx.font = 'bold 11px "Share Tech Mono", monospace';
      this.ctx.fillText('⚡ MOTOR INTAKE: ONLINE', this.funnel.x + 8, this.funnel.y + 36);
    }

    // Dynamic Spinning Turbine inside Funnel
    const turbX = this.funnel.x + this.funnel.w / 2;
    const turbY = this.funnel.y + 45;
    this.ctx.save();
    this.ctx.translate(turbX, turbY);
    this.ctx.rotate(this.turbineAngle);
    for (let b = 0; b < 4; b++) {
      this.ctx.rotate(Math.PI / 2);
      this.ctx.fillStyle = '#10b981';
      this.ctx.fillRect(-2, -14, 4, 14);
    }
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 5, 0, Math.PI * 2);
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.fill();
    this.ctx.restore();

    // 7. Draw Rising Fluid Inside Funnel
    if (this.collectedDrops > 0) {
      const fillHeight = Math.min(30, (this.collectedDrops / this.targetFill) * 30);
      this.ctx.fillStyle = this.accentColor;
      this.ctx.shadowBlur = 12;
      this.ctx.shadowColor = this.accentColor;
      this.ctx.fillRect(this.funnel.x + 20, this.funnel.y + 45 - fillHeight, this.funnel.w - 40, fillHeight);
      this.ctx.shadowBlur = 0;
    }

    // 8. Draw Liquid Particles with Viscous Teardrop Tails
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = this.accentColor;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.active) continue;

      // Draw droplet tail stretching along velocity
      const speed = Math.hypot(p.vx, p.vy);
      if (speed > 1) {
        this.ctx.strokeStyle = this.accentColor;
        this.ctx.lineWidth = p.radius * 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(p.x - p.vx * 1.6, p.y - p.vy * 1.6);
        this.ctx.stroke();
      }

      this.ctx.fillStyle = this.accentColor;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();

      // White hot core highlight
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(p.x - 0.5, p.y - 0.5, p.radius * 0.45, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.shadowBlur = 0;

    // 9. Draw Excavation Sparks
    for (let spk of this.digSparks) {
      this.ctx.fillStyle = spk.color;
      this.ctx.globalAlpha = Math.max(0, spk.alpha);
      this.ctx.beginPath();
      this.ctx.arc(spk.x, spk.y, spk.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;

    // 10. Draw Funnel Splashes
    for (let spl of this.splashes) {
      this.ctx.fillStyle = spl.color;
      this.ctx.globalAlpha = Math.max(0, spl.alpha);
      this.ctx.beginPath();
      this.ctx.arc(spl.x, spl.y, spl.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;

    // 11. Draw Steam Vapor
    for (let st of this.steamParticles) {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${st.alpha * 0.6})`;
      this.ctx.beginPath();
      this.ctx.arc(st.x, st.y, st.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 12. Draw Floating Popups
    for (let popup of this.floatingPopups) {
      this.ctx.save();
      this.ctx.font = 'bold 12px "Share Tech Mono", monospace';
      this.ctx.fillStyle = popup.color || '#fff';
      this.ctx.globalAlpha = Math.max(0, popup.alpha);
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = popup.color || '#fff';
      this.ctx.fillText(popup.text, popup.x, popup.y);
      this.ctx.restore();
    }

    // 13. Draw High-Tech Laser Excavator Cursor Reticle
    if (this.mousePos.isHover) {
      const mx = this.mousePos.x;
      const my = this.mousePos.y;
      const radius = 24;

      this.ctx.save();
      // Outer rotating targeting dashed circle
      this.ctx.beginPath();
      this.ctx.arc(mx, my, radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = this.accentColor;
      this.ctx.lineWidth = 1.5;
      this.ctx.setLineDash([4, 4]);
      this.ctx.stroke();

      // Inner crosshairs
      this.ctx.setLineDash([]);
      this.ctx.beginPath();
      this.ctx.moveTo(mx - 8, my);
      this.ctx.lineTo(mx + 8, my);
      this.ctx.moveTo(mx, my - 8);
      this.ctx.lineTo(mx, my + 8);
      this.ctx.strokeStyle = '#f59e0b';
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();

      // Tool label
      this.ctx.fillStyle = this.accentColor;
      this.ctx.font = '8px "Share Tech Mono", monospace';
      this.ctx.fillText('EXCAVATOR', mx + 12, my - 12);
      this.ctx.restore();
    }
  }

  animate() {
    this.updatePhysics();
    this.draw();
    requestAnimationFrame(this.animate);
  }

  reset() {
    this.gateOpen = false;
    this.initTerrain();
    this.initParticles(); // Preserves checkpointed cores!
    const fillBar = document.getElementById(`tankFill${this.team}`);
    const pctText = document.getElementById(`tankPct${this.team}`);
    const rText = document.getElementById(`rpmText${this.team}`);
    if (fillBar) fillBar.style.width = '0%';
    if (pctText) pctText.textContent = '0%';
    if (rText) rText.textContent = '0 RPM';

    const count = this.getCoresCollectedCount();
    this.floatingPopups.push({
      text: count === 3 ? '⚡ CHECKPOINT: 3/3 CORES READY FOR MOTOR' : `💾 CHECKPOINT: ${count}/3 CORES RETAINED`,
      x: this.reservoir.x + 10,
      y: this.reservoir.y + 75,
      alpha: 1,
      color: '#00e5ff',
      vy: -1
    });
  }
}

window.FluidPuzzle = FluidPuzzle;
