# OPERATION REBUILD // Project VELOCITY (Game 2026)
### Experimental Motorsport R&D Sector — College Engineering Challenge

**Operation Rebuild** is an interactive, browser-based cyber-industrial puzzle event console designed for college engineering competitions. Teams step into an abandoned prototype vehicle R&D facility and reconstruct dismantled sub-systems across 4 progressive physical & digital vaults.

---

## ⚡ Overview & Features

- **Dual Team Consoles**:
  - **Sector Alpha (Team A)**: `/teamA` — High-tech electric cyan aesthetic.
  - **Sector Beta (Team B)**: `/teamB` — High-octane plasma amber aesthetic.
- **Master Facility Landing Page**: `/` — Division selection blast doors.
- **Zero External Dependencies**: Pure vanilla HTML5, CSS3, and JavaScript with procedural Web Audio API sound effects.
- **Physical-to-Digital Event Flow**:
  - Vault 1 is unlocked initially.
  - Solving each digital mini-game instructs the team to report to event executives for physical keys.
  - Physical vaults contain the 6-digit access codes to unlock subsequent digital vaults.
- **Executive Master Reset**: Password-protected reset mechanism (`iste69`) to purge saved `localStorage` data and re-lock vaults for subsequent rounds.

---

## 🎮 The 4 Vault Mini-Games

### Vault 1: Coolant Fluid Restoration (*Where's My Water* Deluxe)
- **Concept**: Excavate bedrock channels to guide pressurized coolant into the prototype engine turbine intake.
- **Mechanics**:
  - Interactive digging reticle with rock debris sparks and crunch audio.
  - Particle physics simulation with velocity-stretched fluid teardrop tails.
  - Mechanical diverter fin that toggles angles on click to redirect flow.
  - 3 collectible telemetry micro-cores.
  - Thermal / acid hazard pools that vaporize coolant.
  - Real-time turbine RPM tachometer with spinning blade graphics in the funnel.
  - Emergency **"BOOST PRESSURE (SPACE)"** pneumatic surge control.
- **Reward Code**: `VEL-204`

### Vault 2: Autonomous Navigation (5×5 Robot Maze)
- **Concept**: Guide a robotic drone safely through facility hazards to aerodynamic telemetry terminal.
- **Mechanics**:
  - Direct adjacent tile clicking or directional D-Pad controls.
  - Real-time **Ghost Route Projection**: dynamically highlights the planned path with step numbers (`1`, `2`...) and direction arrows (`▲`, `▼`, `◀`, `▶`).
  - Advance collision warning blinks if a route will intersect an obstacle.
  - Expressive LED visor: `[•‿•]` ready, `[⚡‿⚡]` driving, `[x_x]` crashed, and `[^‿^]` victory!
  - Animated servo motor sounds and telemetry status tracking.
- **Reward Code**: `VEL-307`

### Vault 3: Blueprint Recovery (Chassis CAD Assembly)
- **Concept**: Reconstruct corrupted vehicle chassis blueprints under a 45-second timer.
- **Mechanics**:
  - Dual control: drag & drop or 1-click snap-to-slot.
  - Destination slot targeting beacons highlight matching slots on component selection.
  - Heavy pneumatic clamp sound (`CLANG-SNAP!`) and physical slot slam shockwave animation.
  - Dynamic **Matrix Decryption Scramble**: authorization digits rapidly roll through scrambling green cipher matrix numbers before locking into place.
  - Urgent countdown ticking when timer is below 10 seconds.
- **Reward Code**: `4729`

### Vault 4: LASER LOCKDOWN (Stealth Action-Puzzle Arena)
- **Concept**: Stealth infiltration game navigating a 12×10 security grid to extract the authorization chip.
- **Mechanics**:
  - 3 laser cycle types: continuous, alternating (2.0s), and pulsing (1.5s).
  - **Laser Telegraphing**: 650ms pre-charge warning audio chirp and flashing dashed amber beam before lasers activate.
  - Sci-fi robot flashlight cone illuminating the dark floor.
  - Floating 3D bobbing access chip with holographic halo.
  - Emergency floor runway lights leading toward the extraction door once chip is retrieved.
- **Reward Code**: `VEL-5831`

---

## 🔑 6-Digit Physical Vault Passcodes

| Team | Vault 1 (Key Code) | Vault 2 Passcode | Vault 3 Passcode | Vault 4 Passcode |
| :--- | :--- | :--- | :--- | :--- |
| **Team A** (Sector Alpha) | `VEL-204` | **`749215`** | **`813642`** | **`592871`** |
| **Team B** (Sector Beta) | `VEL-204` | **`361849`** | **`925418`** | **`478163`** |

---

## 🔒 Executive Master Reset

- **Password**: **`iste69`**
- Click the **`🔒 RESET GAME`** button in the topbar of `/`, `/teamA`, or `/teamB`.
- Entering `iste69` immediately purges all `localStorage` vault progress across both teams and re-locks Vaults 2, 3, and 4.

---

## 🚀 Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/iste-creator/game-2026.git
   cd game-2026
   ```

2. Start the local server:
   - Using Python (Recommended):
     ```bash
     pip install -r requirements.txt   # Optional
     python -m http.server 3000
     ```
   - Or using Node.js:
     ```bash
     npx serve -l 3000 .
     ```

3. Open your browser:
   - Facility Hub: `http://localhost:3000/`
   - Team A Console: `http://localhost:3000/teamA`
   - Team B Console: `http://localhost:3000/teamB`
