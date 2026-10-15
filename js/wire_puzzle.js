/**
 * OPERATION REBUILD — VAULT 02
 * WIRE CIRCUIT ARCHITECT: POWER GRID RIDDLE
 * 
 * 5x5 Electrical Wire Rotation Puzzle
 * Objective: Rotate scrambled wire tiles on a 5x5 grid to create a continuous electrical path
 * from the Power Source (0,0) to the Light Bulb (4,4).
 */

(function () {
  'use strict';

  // Base endpoint definitions at 0 degrees rotation:
  // North: 0, East: 1, South: 2, West: 3
  const BASE_ENDPOINTS = {
    STRAIGHT: [true, false, true, false], // 0 deg = North-South
    CORNER: [true, true, false, false],   // 0 deg = North-East (NE)
    TEE: [true, true, true, false]        // 0 deg = North-East-South (NES)
  };

  function rotateEndpoints(ep, turns) {
    let [n, e, s, w] = ep;
    const count = ((turns % 4) + 4) % 4;
    for (let i = 0; i < count; i++) {
      const temp = w;
      w = s;
      s = e;
      e = n;
      n = temp;
    }
    return [n, e, s, w];
  }

  class WirePuzzleGame {
    constructor(config) {
      this.team = config.team || 'A';
      this.containerId = config.containerId || `wireGrid_${this.team}`;
      this.modalId = config.modalId || `wireModal_${this.team}`;
      this.keyCode = config.keyCode || (this.team === 'A' ? 'KEY-VOLT99' : 'KEY-VOLT77');
      this.authCode = config.authCode || (this.team === 'A' ? 'VEL-307' : 'VEL-582');
      this.onWin = config.onWin || (() => {});

      this.rows = 5;
      this.cols = 5;
      this.moves = 0;
      this.isSolved = false;
      this.history = [];

      this.setupDOM();
      this.initLayoutDefinitions();
      this.reset();
    }

    setupDOM() {
      const p = this.team;
      this.container = document.getElementById(this.containerId);
      this.modal = document.getElementById(this.modalId);
      this.moveCounterElem = document.getElementById(`wireMoves_${p}`);
      this.statusBulbElem = document.getElementById(`wireStatusBulb_${p}`);
      this.victoryOverlay = document.getElementById(`wireVictory_${p}`);
      this.keyCodeElem = document.getElementById(`wireKeyCode_${p}`);
      this.authCodeElem = document.getElementById(`wireAuthCode_${p}`);
      this.resetBtn = document.getElementById(`wireResetBtn_${p}`);
      this.undoBtn = document.getElementById(`wireUndoBtn_${p}`);

      if (this.resetBtn) {
        this.resetBtn.onclick = () => this.reset();
      }
      if (this.undoBtn) {
        this.undoBtn.onclick = () => this.undo();
      }
    }

    initLayoutDefinitions() {
      if (this.team === 'A') {
        // Sector Alpha Verified 24-Node High-Difficulty Labyrinth
        this.rawLayout = [
          // Row 0
          [
            { type: 'POWER', endpoints: [false, true, false, false], fixed: true, label: 'PWR IN' },
            { type: 'TEE', solutionTurns: 1 },      // ESW (connects W to PWR, S to 1,1, and E decoy to 0,2)
            { type: 'STRAIGHT', solutionTurns: 1 }, // EW (decoy)
            { type: 'CORNER', solutionTurns: 1 },   // ES (connects S to 1,3, E to 0,4)
            { type: 'CORNER', solutionTurns: 2 }    // SW (connects W to 0,3, S to 1,4)
          ],
          // Row 1
          [
            { type: 'CORNER', solutionTurns: 1 },   // ES (decoy)
            { type: 'CORNER', solutionTurns: 0 },   // NE (connects N to 0,1, E to 1,2)
            { type: 'TEE', solutionTurns: 1 },      // ESW (connects W to 1,1, E to 1,3, S to 2,2)
            { type: 'CORNER', solutionTurns: 3 },   // WN (connects W to 1,2, N to 0,3)
            { type: 'STRAIGHT', solutionTurns: 0 }  // NS (connects N to 0,4, S to 2,4)
          ],
          // Row 2
          [
            { type: 'CORNER', solutionTurns: 1 },   // ES (connects E to 2,1, S to 3,0)
            { type: 'CORNER', solutionTurns: 2 },   // SW (connects W to 2,0, S to 3,1)
            { type: 'TEE', solutionTurns: 3 },      // WNE (connects N to 1,2, W to 2,1, E to 2,3)
            { type: 'CORNER', solutionTurns: 2 },   // SW (connects W to 2,2, S to 3,3)
            { type: 'STRAIGHT', solutionTurns: 0 }  // NS (connects N to 1,4, S to 3,4)
          ],
          // Row 3
          [
            { type: 'STRAIGHT', solutionTurns: 0 }, // NS (connects N to 2,0, S to 4,0)
            { type: 'CORNER', solutionTurns: 0 },   // NE (connects N to 2,1, E to 3,2)
            { type: 'CORNER', solutionTurns: 3 },   // WN (connects W to 3,1, N to 2,2)
            { type: 'TEE', solutionTurns: 2 },      // SWN (connects N to 2,3, S to 4,3, W to 3,2)
            { type: 'CORNER', solutionTurns: 3 }    // WN (connects N to 2,4, W to 3,3)
          ],
          // Row 4
          [
            { type: 'CORNER', solutionTurns: 0 },   // NE (connects N to 3,0, E to 4,1)
            { type: 'STRAIGHT', solutionTurns: 1 }, // EW (connects W to 4,0, E to 4,2)
            { type: 'STRAIGHT', solutionTurns: 1 }, // EW (connects W to 4,1, E to 4,3)
            { type: 'TEE', solutionTurns: 3 },      // WNE (connects N to 3,3, W to 4,2, E to 4,4)
            { type: 'BULB', endpoints: [false, false, false, true], fixed: true, label: 'LIGHT BULB' }
          ]
        ];
      } else {
        // Sector Beta Verified 23-Node High-Difficulty Labyrinth
        this.rawLayout = [
          // Row 0
          [
            { type: 'POWER', endpoints: [false, true, false, false], fixed: true, label: 'PWR IN' },
            { type: 'TEE', solutionTurns: 1 },      // ESW
            { type: 'CORNER', solutionTurns: 1 },   // ES
            { type: 'CORNER', solutionTurns: 1 },   // ES
            { type: 'CORNER', solutionTurns: 2 }    // SW
          ],
          // Row 1
          [
            { type: 'CORNER', solutionTurns: 1 },   // ES
            { type: 'CORNER', solutionTurns: 0 },   // NE
            { type: 'CORNER', solutionTurns: 2 },   // SW
            { type: 'STRAIGHT', solutionTurns: 0 }, // NS
            { type: 'STRAIGHT', solutionTurns: 0 }  // NS
          ],
          // Row 2
          [
            { type: 'CORNER', solutionTurns: 1 },   // ES
            { type: 'CORNER', solutionTurns: 2 },   // SW
            { type: 'CORNER', solutionTurns: 0 },   // NE
            { type: 'CORNER', solutionTurns: 3 },   // WN
            { type: 'STRAIGHT', solutionTurns: 0 }  // NS
          ],
          // Row 3
          [
            { type: 'STRAIGHT', solutionTurns: 0 }, // NS
            { type: 'CORNER', solutionTurns: 0 },   // NE
            { type: 'STRAIGHT', solutionTurns: 1 }, // EW
            { type: 'STRAIGHT', solutionTurns: 1 }, // EW
            { type: 'CORNER', solutionTurns: 3 }    // WN
          ],
          // Row 4
          [
            { type: 'CORNER', solutionTurns: 0 },   // NE
            { type: 'STRAIGHT', solutionTurns: 1 }, // EW
            { type: 'STRAIGHT', solutionTurns: 1 }, // EW
            { type: 'STRAIGHT', solutionTurns: 1 }, // EW
            { type: 'BULB', endpoints: [false, false, false, true], fixed: true, label: 'LIGHT BULB' }
          ]
        ];
      }
    }

    reset() {
      this.moves = 0;
      this.isSolved = false;
      this.history = [];
      if (this.victoryOverlay) this.victoryOverlay.style.display = 'none';

      // Build initial board with random scrambling
      let solvedOnScramble = false;
      let scrambleTries = 0;

      do {
        this.board = this.rawLayout.map(row => row.map(tile => {
          if (tile.fixed) {
            return {
              ...tile,
              rotation: 0,
              energized: false
            };
          }

          // Random 1, 2, or 3 turns offset from solution
          const randomTurns = Math.floor(Math.random() * 3) + 1;
          const currentTurns = (tile.solutionTurns + randomTurns) % 4;

          return {
            type: tile.type,
            solutionTurns: tile.solutionTurns,
            currentTurns: currentTurns,
            rotation: currentTurns * 90,
            endpoints: rotateEndpoints(BASE_ENDPOINTS[tile.type], currentTurns),
            energized: false
          };
        }));

        this.runPathCheck();
        solvedOnScramble = this.isBulbConnected();
        scrambleTries++;
      } while (solvedOnScramble && scrambleTries < 10);

      // Guarantee initial path is broken
      if (this.isBulbConnected()) {
        this.rotateTile(0, 1, false);
        this.rotateTile(1, 2, false);
        this.runPathCheck();
      }

      this.render();
      this.updateHUD();
    }

    rotateTile(r, c, record = true) {
      if (this.isSolved) return;
      const tile = this.board[r][c];
      if (!tile || tile.fixed) return;

      if (record) {
        this.history.push({ r, c });
        this.moves++;
      }

      // Rotate 90 deg clockwise with spring physics
      tile.currentTurns = (tile.currentTurns + 1) % 4;
      tile.rotation = tile.rotation + 90;
      tile.endpoints = rotateEndpoints(BASE_ENDPOINTS[tile.type], tile.currentTurns);

      this.runPathCheck();
      this.render();
      this.updateHUD();

      // Micro-animation for cell click
      if (this.container) {
        const clickedCell = this.container.querySelector(`.wire-cell[data-row="${r}"][data-col="${c}"]`);
        if (clickedCell) {
          clickedCell.classList.add('cell-clicked');
          setTimeout(() => clickedCell.classList.remove('cell-clicked'), 250);
        }
      }

      if (window.soundEngine && typeof window.soundEngine.playClick === 'function') {
        window.soundEngine.playClick();
      }

      if (this.isBulbConnected()) {
        this.triggerVictory();
      }
    }

    undo() {
      if (this.isSolved || this.history.length === 0) return;
      const last = this.history.pop();
      const tile = this.board[last.r][last.c];
      if (!tile || tile.fixed) return;

      // Rotate counter-clockwise by 90 deg (which is 3 clockwise turns)
      tile.currentTurns = (tile.currentTurns + 3) % 4;
      tile.rotation = tile.rotation - 90;
      tile.endpoints = rotateEndpoints(BASE_ENDPOINTS[tile.type], tile.currentTurns);
      if (this.moves > 0) this.moves--;

      this.runPathCheck();
      this.render();
      this.updateHUD();

      if (window.soundEngine && typeof window.soundEngine.playClick === 'function') {
        window.soundEngine.playClick();
      }
    }

    /**
     * Breadth-First Search (BFS) to track electrical flow from (0,0)
     */
    runPathCheck() {
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          this.board[r][c].energized = false;
        }
      }

      const queue = [{ r: 0, c: 0 }];
      this.board[0][0].energized = true;

      while (queue.length > 0) {
        const { r, c } = queue.shift();
        const curr = this.board[r][c];
        const [n, e, s, w] = curr.endpoints;

        // North: curr.N must match neighbor.S
        if (n && r > 0) {
          const neighbor = this.board[r - 1][c];
          if (neighbor && neighbor.endpoints[2] && !neighbor.energized) {
            neighbor.energized = true;
            queue.push({ r: r - 1, c });
          }
        }

        // East: curr.E must match neighbor.W
        if (e && c < this.cols - 1) {
          const neighbor = this.board[r][c + 1];
          if (neighbor && neighbor.endpoints[3] && !neighbor.energized) {
            neighbor.energized = true;
            queue.push({ r, c: c + 1 });
          }
        }

        // South: curr.S must match neighbor.N
        if (s && r < this.rows - 1) {
          const neighbor = this.board[r + 1][c];
          if (neighbor && neighbor.endpoints[0] && !neighbor.energized) {
            neighbor.energized = true;
            queue.push({ r: r + 1, c });
          }
        }

        // West: curr.W must match neighbor.E
        if (w && c > 0) {
          const neighbor = this.board[r][c - 1];
          if (neighbor && neighbor.endpoints[1] && !neighbor.energized) {
            neighbor.energized = true;
            queue.push({ r, c: c - 1 });
          }
        }
      }
    }

    isBulbConnected() {
      return this.board[this.rows - 1][this.cols - 1].energized === true;
    }

    triggerVictory() {
      this.isSolved = true;
      this.updateHUD();

      // Trigger electric surge flash across the board
      if (this.container) {
        this.container.classList.add('surge-active');
        setTimeout(() => this.container.classList.remove('surge-active'), 800);
      }

      if (this.keyCodeElem) {
        this.keyCodeElem.textContent = this.keyCode;
      }
      if (this.authCodeElem) {
        this.authCodeElem.textContent = this.authCode;
      }

      if (window.soundEngine && typeof window.soundEngine.playVaultDecrypted === 'function') {
        window.soundEngine.playVaultDecrypted();
      }

      setTimeout(() => {
        if (this.victoryOverlay) {
          this.victoryOverlay.style.display = 'flex';
        }
        this.onWin();
      }, 600);
    }

    updateHUD() {
      if (this.moveCounterElem) {
        this.moveCounterElem.textContent = this.moves;
      }
      if (this.statusBulbElem) {
        const lit = this.isBulbConnected();
        this.statusBulbElem.textContent = lit ? 'LIGHT BULB: LIT 💡⚡' : 'LIGHT BULB: UNLIT ○';
        this.statusBulbElem.className = `wire-status-pill ${lit ? 'lit' : ''}`;
      }
    }

    render() {
      if (!this.container) return;
      this.container.innerHTML = '';

      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const tile = this.board[r][c];
          const cell = document.createElement('div');
          cell.className = 'wire-cell';
          cell.dataset.row = r;
          cell.dataset.col = c;

          if (tile.fixed) cell.classList.add('fixed');
          if (tile.energized) cell.classList.add('energized');

          if (tile.type === 'POWER') {
            cell.classList.add('cell-power');
            cell.innerHTML = `
              <div class="terminal-badge power-badge">
                <span class="icon">⚡</span>
                <span class="label">POWER</span>
              </div>
            `;
            cell.appendChild(this.createFixedWireSVG(tile.endpoints, true));
          } else if (tile.type === 'BULB') {
            cell.classList.add('cell-bulb');
            if (tile.energized) cell.classList.add('bulb-lit');
            cell.innerHTML = `
              <div class="terminal-badge bulb-badge ${tile.energized ? 'active' : ''}">
                <span class="icon">${tile.energized ? '💡' : '○'}</span>
                <span class="label">BULB</span>
              </div>
            `;
            cell.appendChild(this.createFixedWireSVG(tile.endpoints, tile.energized));
          } else {
            // Rotating wire tile
            cell.classList.add('cell-wire');
            cell.style.cursor = this.isSolved ? 'default' : 'pointer';

            const wireWrapper = document.createElement('div');
            wireWrapper.className = 'wire-wrapper';
            wireWrapper.style.transform = `rotate(${tile.rotation}deg)`;
            wireWrapper.appendChild(this.createTileSVG(tile.type, tile.energized));
            cell.appendChild(wireWrapper);

            // Click listener
            cell.addEventListener('click', () => this.rotateTile(r, c));
          }

          this.container.appendChild(cell);
        }
      }
    }

    createTileSVG(type, isEnergized) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 100 100');
      svg.setAttribute('class', `wire-svg ${isEnergized ? 'energized-flow' : ''}`);

      const strokeColor = isEnergized ? '#00e5ff' : '#334155';
      const glowFilterId = `wireGlow_${this.team}`;

      let d = '';
      if (type === 'STRAIGHT') {
        d = 'M 50 0 L 50 100';
      } else if (type === 'CORNER') {
        d = 'M 50 0 L 50 50 L 100 50';
      } else if (type === 'TEE') {
        d = 'M 50 0 L 50 100 M 50 50 L 100 50';
      }

      svg.innerHTML = `
        <defs>
          <filter id="${glowFilterId}" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <!-- Outer conduit channel -->
        <path d="${d}" fill="none" stroke="#060c14" stroke-width="22" stroke-linecap="square" />
        <path d="${d}" fill="none" stroke="#1e293b" stroke-width="14" stroke-linecap="square" />
        <!-- Electrical conducting wire -->
        <path d="${d}" fill="none" stroke="${strokeColor}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"
              style="filter: ${isEnergized ? `url(#${glowFilterId})` : 'none'}; transition: stroke 0.25s;" />
        <!-- High-voltage animated current pulse stream -->
        ${isEnergized ? `<path d="${d}" fill="none" class="wire-current-pulse" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" />` : ''}
        <!-- Hub node -->
        <circle cx="50" cy="50" r="7.5" fill="${strokeColor}" />
      `;

      return svg;
    }

    createFixedWireSVG(endpoints, isEnergized) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 100 100');
      svg.setAttribute('class', `wire-fixed-svg ${isEnergized ? 'energized-flow' : ''}`);

      const strokeColor = isEnergized ? '#00e5ff' : '#334155';
      const [n, e, s, w] = endpoints;
      let d = '';
      if (n) d += ' M 50 50 L 50 0';
      if (e) d += ' M 50 50 L 100 50';
      if (s) d += ' M 50 50 L 50 100';
      if (w) d += ' M 50 50 L 0 50';

      svg.innerHTML = `
        <path d="${d}" fill="none" stroke="#1e293b" stroke-width="14" stroke-linecap="square" />
        <path d="${d}" fill="none" stroke="${strokeColor}" stroke-width="7" stroke-linecap="round" />
        ${isEnergized ? `<path d="${d}" fill="none" class="wire-current-pulse" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round" />` : ''}
        <circle cx="50" cy="50" r="7.5" fill="${strokeColor}" />
      `;
      return svg;
    }
  }

  window.WirePuzzleGame = WirePuzzleGame;
})();
