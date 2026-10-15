/**
 * OPERATION REBUILD — VAULT 03
 * ENGINEERING & TECH LOGIC CORE: KNOWLEDGE MATRIX QUIZ
 * 50 Verified Engineering Questions (20 Easy, 15 Medium, 15 Hard)
 * Dynamic 5-Question Session (2 Easy, 2 Medium, 1 Hard)
 * 18-Second Security Breach Lockout Penalty on Wrong Answers
 * Light Bulb Victory Reveal & Key Access: KEY-ENGINEER-2026
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.EngineeringQuiz = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  // =========================================================================
  // 50 STUDENT-FRIENDLY ENGINEERING & TECH QUESTION POOL
  // 20 Easy, 20 Medium, 10 Hard
  // =========================================================================
  const QUESTION_POOL = [
    // --- EASY (20 Questions) ---
    { id: 1, tier: 'easy', difficulty: 'easy', category: "Electronics", question: "Which basic electronic component is primarily used to restrict the flow of electrical current?", options: ["Capacitor","Resistor","Inductor","Diode"], answer: "Resistor", correct: 1 },
    { id: 2, tier: 'easy', difficulty: 'easy', category: "Digital Logic", question: "Which fundamental logic gate produces an output of 1 ONLY when all its inputs are 1?", options: ["OR Gate","NOT Gate","AND Gate","XOR Gate"], answer: "AND Gate", correct: 2 },
    { id: 3, tier: 'easy', difficulty: 'easy', category: "Electrical Machines", question: "What primary energy transformation occurs in a standard electrical motor?", options: ["Mechanical to Electrical","Electrical to Mechanical","Chemical to Thermal","Thermal to Electrical"], answer: "Electrical to Mechanical", correct: 1 },
    { id: 4, tier: 'easy', difficulty: 'easy', category: "Electrical", question: "What is the standard unit of electrical resistance?", options: ["Volt","Ampere","Ohm","Watt"], answer: "Ohm", correct: 2 },
    { id: 5, tier: 'easy', difficulty: 'easy', category: "Data Structures", question: "Which programming data structure operates on a First-In, First-Out (FIFO) basis?", options: ["Stack","Queue","Array","Tree"], answer: "Queue", correct: 1 },
    { id: 6, tier: 'easy', difficulty: 'easy', category: "Electrical Circuits", question: "In a simple DC circuit, what happens to the total resistance when you add resistors in series?", options: ["Increases","Decreases","Stays the same","Drops to zero"], answer: "Increases", correct: 0 },
    { id: 7, tier: 'easy', difficulty: 'easy', category: "Electronics", question: "What component allows electrical current to flow in only ONE direction?", options: ["Transistor","Diode","Transformer","Capacitor"], answer: "Diode", correct: 1 },
    { id: 8, tier: 'easy', difficulty: 'easy', category: "Physics", question: "Which subatomic particle carries a negative electrical charge?", options: ["Proton","Neutron","Electron","Photon"], answer: "Electron", correct: 2 },
    { id: 9, tier: 'easy', difficulty: 'easy', category: "Computer Architecture", question: "What does 'CPU' stand for in computer systems?", options: ["Central Processing Unit","Control Power Unit","Computer Program Utility","Central Performance User"], answer: "Central Processing Unit", correct: 0 },
    { id: 10, tier: 'easy', difficulty: 'easy', category: "Mechanics", question: "Which physical law states that 'For every action, there is an equal and opposite reaction'?", options: ["Newton's First Law","Newton's Second Law","Newton's Third Law","Hooke's Law"], answer: "Newton's Third Law", correct: 2 },
    { id: 11, tier: 'easy', difficulty: 'easy', category: "Digital Systems", question: "What base system is used in binary code?", options: ["Base-8","Base-10","Base-2","Base-16"], answer: "Base-2", correct: 2 },
    { id: 12, tier: 'easy', difficulty: 'easy', category: "Materials", question: "Which material is a widely used conductor of electricity in house wiring?", options: ["Rubber","Glass","Copper","Plastic"], answer: "Copper", correct: 2 },
    { id: 13, tier: 'easy', difficulty: 'easy', category: "AC Circuits", question: "What does a transformer alter in an alternating current (AC) circuit?", options: ["Frequency","Voltage level","Resistance","Power Factor"], answer: "Voltage level", correct: 1 },
    { id: 14, tier: 'easy', difficulty: 'easy', category: "Civil & Structural", question: "Which geometric shape is structural engineering's most inherently rigid shape for trusses?", options: ["Square","Circle","Triangle","Pentagon"], answer: "Triangle", correct: 2 },
    { id: 15, tier: 'easy', difficulty: 'easy', category: "Computer Systems", question: "In computer memory, how many bits make up 1 Byte?", options: ["4 bits","8 bits","16 bits","32 bits"], answer: "8 bits", correct: 1 },
    { id: 16, tier: 'easy', difficulty: 'easy', category: "Instrumentation", question: "Which tool is commonly used to measure voltage, current, and resistance in electronics?", options: ["Oscilloscope","Multimeter","Galvanometer","Tachometer"], answer: "Multimeter", correct: 1 },
    { id: 17, tier: 'easy', difficulty: 'easy', category: "Electrical", question: "What type of current is supplied by standard chemical batteries?", options: ["Direct Current (DC)","Alternating Current (AC)","Pulsating Current","Radio Frequency"], answer: "Direct Current (DC)", correct: 0 },
    { id: 18, tier: 'easy', difficulty: 'easy', category: "Electronics", question: "What is the primary function of a capacitor in a circuit?", options: ["Generate power","Store electrical energy","Convert AC to DC","Amplify signals"], answer: "Store electrical energy", correct: 1 },
    { id: 19, tier: 'easy', difficulty: 'easy', category: "Power Systems", question: "Which device converts mechanical energy into electrical energy?", options: ["Motor","Generator","Inverter","Transformer"], answer: "Generator", correct: 1 },
    { id: 20, tier: 'easy', difficulty: 'easy', category: "Mechanical Systems", question: "In mechanical systems, what reduces friction between moving parts?", options: ["Lubricant","Abrasive","Insulator","Weight"], answer: "Lubricant", correct: 0 },

    // --- MEDIUM (15 Questions) ---
    { id: 21, tier: 'medium', difficulty: 'medium', category: "Electrical Circuits", question: "According to Ohm's Law (V = I * R), if resistance stays constant and voltage doubles, what happens to current?", options: ["It drops by half","It doubles","It quadruples","It stays the same"], answer: "It doubles", correct: 1 },
    { id: 22, tier: 'medium', difficulty: 'medium', category: "Number Systems", question: "What is the hexadecimal representation of the decimal number 15?", options: ["A","E","F","10"], answer: "F", correct: 2 },
    { id: 23, tier: 'medium', difficulty: 'medium', category: "Digital Logic", question: "Which logic gate outputs 0 ONLY when both inputs are identical?", options: ["AND Gate","OR Gate","XOR Gate","XNOR Gate"], answer: "XOR Gate", correct: 2 },
    { id: 24, tier: 'medium', difficulty: 'medium', category: "Solid Mechanics", question: "What type of stress occurs when two opposing forces pull a structural beam apart?", options: ["Compression","Tension","Shear","Torsion"], answer: "Tension", correct: 1 },
    { id: 25, tier: 'medium', difficulty: 'medium', category: "Data Structures", question: "Which data structure follows a Last-In, First-Out (LIFO) operational order?", options: ["Queue","Stack","Linked List","Binary Search Tree"], answer: "Stack", correct: 1 },
    { id: 26, tier: 'medium', difficulty: 'medium', category: "Circuit Analysis", question: "If two 10 Ohm resistors are connected in PARALLEL, what is the total equivalent resistance?", options: ["20 Ohms","10 Ohms","5 Ohms","2.5 Ohms"], answer: "5 Ohms", correct: 2 },
    { id: 27, tier: 'medium', difficulty: 'medium', category: "Semiconductors", question: "What is the primary semiconductor material used in modern integrated circuits?", options: ["Copper","Silicon","Germanium","Silver"], answer: "Silicon", correct: 1 },
    { id: 28, tier: 'medium', difficulty: 'medium', category: "Algorithms", question: "What is the worst-case time complexity for binary search in a sorted array of N elements?", options: ["O(1)","O(N)","O(log N)","O(N^2)"], answer: "O(log N)", correct: 2 },
    { id: 29, tier: 'medium', difficulty: 'medium', category: "Fluid Mechanics", question: "In fluid mechanics, what principle explains the lift generated by an airplane wing?", options: ["Pascal's Principle","Bernoulli's Principle","Archimedes' Principle","Hooke's Law"], answer: "Bernoulli's Principle", correct: 1 },
    { id: 30, tier: 'medium', difficulty: 'medium', category: "Power Electronics", question: "What component is used to convert Alternating Current (AC) into Direct Current (DC)?", options: ["Inverter","Rectifier","Oscillator","Amplifier"], answer: "Rectifier", correct: 1 },
    { id: 31, tier: 'medium', difficulty: 'medium', category: "Digital Electronics", question: "What does a 3-bit binary counter count up to (in decimal) before resetting to 0?", options: ["3","7","8","15"], answer: "7", correct: 1 },
    { id: 32, tier: 'medium', difficulty: 'medium', category: "Materials Science", question: "What property of a material describes its resistance to being scratched or deformed?", options: ["Toughness","Hardness","Ductility","Elasticity"], answer: "Hardness", correct: 1 },
    { id: 33, tier: 'medium', difficulty: 'medium', category: "Networking", question: "Which layer in the OSI network model is responsible for IP routing?", options: ["Data Link Layer","Network Layer","Transport Layer","Application Layer"], answer: "Network Layer", correct: 1 },
    { id: 34, tier: 'medium', difficulty: 'medium', category: "Circuit Protection", question: "What is the main purpose of an LED's current-limiting series resistor?", options: ["To increase LED brightness","To prevent burning out the LED","To convert light into power","To reverse current flow"], answer: "To prevent burning out the LED", correct: 1 },
    { id: 35, tier: 'medium', difficulty: 'medium', category: "Mechatronics", question: "What type of motor moves in discrete angle increments rather than continuous rotation?", options: ["Induction Motor","DC Brushed Motor","Stepper Motor","Universal Motor"], answer: "Stepper Motor", correct: 2 },

    // --- HARD (15 Questions) ---
    { id: 36, tier: 'hard', difficulty: 'hard', category: "Digital Logic", question: "In a 4-variable Karnaugh Map (K-Map), how many total cells are present?", options: ["8","12","16","32"], answer: "16", correct: 2 },
    { id: 37, tier: 'hard', difficulty: 'hard', category: "Signal Processing", question: "What is the Nyquist sampling frequency required to reconstruct a signal with a maximum frequency of 5 kHz?", options: ["2.5 kHz","5 kHz","10 kHz","20 kHz"], answer: "10 kHz", correct: 2 },
    { id: 38, tier: 'hard', difficulty: 'hard', category: "Boolean Algebra", question: "What logic expression represents De Morgan's Law for NOT (A AND B)?", options: ["NOT A AND NOT B","NOT A OR NOT B","A OR B","NOT (A OR B)"], answer: "NOT A OR NOT B", correct: 1 },
    { id: 39, tier: 'hard', difficulty: 'hard', category: "Control Systems", question: "What type of feedback control loop uses Proportional, Integral, and Derivative actions?", options: ["LQR Controller","PID Controller","Bang-Bang Controller","Feedforward Loop"], answer: "PID Controller", correct: 1 },
    { id: 40, tier: 'hard', difficulty: 'hard', category: "Analog Electronics", question: "What happens to the resonant frequency of an LC circuit if the inductance L is quadrupled?", options: ["Doubles","Halves","Quadruples","Stays the same"], answer: "Halves", correct: 1 },
    { id: 41, tier: 'hard', difficulty: 'hard', category: "Database Architecture", question: "In relational databases, which normal form eliminates transitive functional dependencies?", options: ["1NF","2NF","3NF","BCNF"], answer: "3NF", correct: 2 },
    { id: 42, tier: 'hard', difficulty: 'hard', category: "Thermodynamics", question: "In thermodynamics, which process occurs at a constant volume?", options: ["Isothermal","Isobaric","Isochoric","Adiabatic"], answer: "Isochoric", correct: 2 },
    { id: 43, tier: 'hard', difficulty: 'hard', category: "Software Engineering", question: "In object-oriented programming, what concept allows a subclass to provide a specific implementation of a method already defined in its parent class?", options: ["Method Overloading","Method Overriding","Abstraction","Encapsulation"], answer: "Method Overriding", correct: 1 },
    { id: 44, tier: 'hard', difficulty: 'hard', category: "Sequential Logic", question: "In digital electronics, how many flip-flops are required to construct a modulo-16 counter?", options: ["2","4","8","16"], answer: "4", correct: 1 },
    { id: 45, tier: 'hard', difficulty: 'hard', category: "AI & Deep Learning", question: "What is the main advantage of using positional encoding like RoPE in modern Transformer models?", options: ["Reduces model memory footprint","Preserves relative positional information across tokens","Eliminates attention weights calculation","Speeds up training speed by 10x"], answer: "Preserves relative positional information across tokens", correct: 1 },
    { id: 46, tier: 'hard', difficulty: 'hard', category: "Op-Amp Circuits", question: "Which operational amplifier configuration has a theoretical infinite input impedance and unity voltage gain?", options: ["Inverting Amplifier","Summing Amplifier","Voltage Follower","Differentiator"], answer: "Voltage Follower", correct: 2 },
    { id: 47, tier: 'hard', difficulty: 'hard', category: "Operating Systems", question: "In operating systems, what condition occurs when processes are infinitely waiting for resources held by each other?", options: ["Thrashing","Deadlock","Paging","Fragmentation"], answer: "Deadlock", correct: 1 },
    { id: 48, tier: 'hard', difficulty: 'hard', category: "Materials Engineering", question: "Which material property indicates the maximum stress a material can withstand before necking occurs?", options: ["Yield Strength","Ultimate Tensile Strength","Young's Modulus","Fatigue Limit"], answer: "Ultimate Tensile Strength", correct: 1 },
    { id: 49, tier: 'hard', difficulty: 'hard', category: "Power Systems", question: "In AC circuits, what is the ratio of real power to apparent power called?", options: ["Quality Factor","Power Factor","Form Factor","Crest Factor"], answer: "Power Factor", correct: 1 },
    { id: 50, tier: 'hard', difficulty: 'hard', category: "Circuit Analysis", question: "What is the time constant (tau) of an RC circuit with a 10k Ohm resistor and a 10uF capacitor?", options: ["0.01 seconds","0.1 seconds","1.0 second","10 seconds"], answer: "0.1 seconds", correct: 1 },
  ];

  // =========================================================================
  // AUDIO SYNTHESIS FALLBACK (Clean Web Audio Bleeps & Buzzers)
  // =========================================================================
  class QuizAudio {
    constructor() {
      this.ctx = null;
    }

    _getAudioCtx() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    }

    playCorrect() {
      try {
        const ctx = this._getAudioCtx();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.42);
      } catch (e) {}
    }

    playWrong() {
      try {
        const ctx = this._getAudioCtx();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.28);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
      } catch (e) {}
    }

    playLockoutTick() {
      try {
        const ctx = this._getAudioCtx();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
      } catch (e) {}
    }

    playUnlock() {
      try {
        const ctx = this._getAudioCtx();
        if (!ctx) return;
        const now = ctx.currentTime;
        const chords = [392, 523, 659, 783.99, 1046.5];
        chords.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);
          gain.gain.setValueAtTime(0.12, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8 + idx * 0.07);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.07);
          osc.stop(now + 0.8 + idx * 0.07);
        });
      } catch (e) {}
    }
  }

  // =========================================================================
  // ENGINEERING QUIZ GAME CLASS
  // =========================================================================
  class EngineeringQuizGame {
    /**
     * @param {Object} options Configuration
     * @param {HTMLElement|string} options.container Container element or selector
     * @param {string} [options.team='teamA'] 'teamA' or 'teamB'
     * @param {string} [options.authCode='4729'] Team authorization code (teamA: 4729, teamB: VEL-831)
     * @param {string} [options.securityCode='KEY-ENGINEER-2026'] Target security key
     * @param {Function} [options.onComplete] Callback when victory sequence finishes
     * @param {Function} [options.onClose] Callback when user closes or exits
     */
    constructor(options = {}) {
      this.options = Object.assign({
        container: null,
        team: 'teamA',
        authCode: options.team === 'teamB' ? 'VEL-831' : '4729',
        securityCode: 'KEY-ENGINEER-2026',
        onComplete: null,
        onClose: null
      }, options);

      this.audio = new QuizAudio();
      this.sessionQuestions = [];
      this.currentNodeIndex = 0;
      this.totalNodes = 5;
      this.isLockedOut = false;
      this.lockoutSecondsRemaining = 18;
      this.lockoutInterval = null;
      this.nodeResults = [null, null, null, null, null]; // true, false, or null
      this.hasAnsweredCurrent = false;

      this.dom = {};
      this._initDOM();
    }

    _initDOM() {
      let root = this.options.container;
      if (typeof root === 'string') {
        root = document.querySelector(root);
      }
      if (!root) {
        root = document.body;
      }
      this.container = root;
    }

    /**
     * Start a new game session with 5 questions:
     * - 2 Easy
     * - 2 Medium
     * - 1 Hard
     */
    startSession() {
      this.currentNodeIndex = 0;
      this.isLockedOut = false;
      this.hasAnsweredCurrent = false;
      this.nodeResults = [null, null, null, null, null];
      this._clearLockoutTimer();

      // Filter questions by tier
      const easyPool = QUESTION_POOL.filter(q => q.tier === 'easy');
      const medPool = QUESTION_POOL.filter(q => q.tier === 'medium');
      const hardPool = QUESTION_POOL.filter(q => q.tier === 'hard');

      // Random pick utility
      const pickRandomN = (arr, n) => {
        const copy = arr.slice();
        const picked = [];
        for (let i = 0; i < n; i++) {
          if (copy.length === 0) break;
          const idx = Math.floor(Math.random() * copy.length);
          picked.push(copy.splice(idx, 1)[0]);
        }
        return picked;
      };

      const selectedEasy = pickRandomN(easyPool, 2);
      const selectedMed = pickRandomN(medPool, 2);
      const selectedHard = pickRandomN(hardPool, 1);

      // Order questions progressively: Easy (Node 1, 2) -> Medium (Node 3, 4) -> Hard (Node 5)
      this.sessionQuestions = [
        selectedEasy[0],
        selectedEasy[1],
        selectedMed[0],
        selectedMed[1],
        selectedHard[0]
      ];

      this._renderBaseMarkup();
      this.renderCurrentQuestion();
    }

    _renderBaseMarkup() {
      const isBeta = this.options.team === 'teamB';
      const themeClass = isBeta ? 'theme-beta' : 'theme-alpha';

      this.container.innerHTML = `
        <div class="quiz-modal-window ${themeClass}" id="quizWindow">
          <!-- Topbar -->
          <div class="quiz-topbar">
            <div class="quiz-header-tag">
              <span class="blink-dot"></span>
              <span>SYS-03 // ENGINEERING QUIZ MATRIX</span>
            </div>
            <button class="quiz-close-btn" id="btnQuizClose" title="Exit Quiz Terminal">✕</button>
          </div>

          <!-- Content Area -->
          <div class="quiz-content-area">
            <!-- Header Row -->
            <div class="quiz-title-row">
              <div>
                <div class="quiz-quest-sub">OPERATION REBUILD // VAULT 03</div>
                <h2 class="quiz-main-title">ENGINEERING LOGIC CORE</h2>
              </div>
              <div class="quiz-session-chip">SESSION: 5 NODES</div>
            </div>

            <!-- Objective Banner -->
            <div class="quiz-mission-strip">
              Resolve the <strong>5-Node Knowledge Matrix</strong> (2 Easy, 2 Medium, 1 Hard) to calibrate core systems. 
              <strong>Warning:</strong> Incorrect submissions trigger a <strong>18-second security lockout</strong>!
            </div>

            <!-- 5-Node Progress Pipeline -->
            <div class="quiz-progress-bar" id="quizProgressBar">
              <div class="node-connector-line"></div>
              ${[1, 2, 3, 4, 5].map(num => `
                <div class="node-step" id="nodeStep_${num}" data-step="${num}">
                  <div class="node-circle">${num}</div>
                  <div class="node-label">NODE ${num}/5</div>
                </div>
              `).join('')}
            </div>

            <!-- Question Terminal Card -->
            <div class="question-card" id="questionCard">
              <div class="question-meta-row">
                <span class="node-badge-tag" id="nodeTagBadge">NODE 1/5</span>
                <span class="tier-badge tier-easy" id="tierBadge">EASY</span>
              </div>
              <div class="question-category-tag" id="categoryTag" style="font-family:var(--font-mono, monospace); font-size:0.75rem; color:#94a3b8; letter-spacing:0.05em;">CATEGORY: ELECTRICAL</div>
              <div class="question-text-content" id="questionText">Loading question prompt...</div>

              <!-- Options Grid (A, B, C, D) -->
              <div class="options-grid" id="optionsGrid">
                ${['A', 'B', 'C', 'D'].map((letter, idx) => `
                  <button class="option-btn" id="optionBtn_${idx}" data-index="${idx}">
                    <span class="option-letter">${letter}</span>
                    <span class="option-text" id="optionText_${idx}">---</span>
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- 18-Second Security Breach Lockout Overlay -->
          <div class="lockout-overlay" id="lockoutOverlay">
            <div class="lockout-card">
              <div class="lockout-hazard-badge">
                <span>⚠️</span>
                <span>CRITICAL BREACH WARNING</span>
              </div>
              <div class="lockout-main-message" id="lockoutMsg">
                SECURITY BREACH DETECTED: SYSTEM LOCKED OUT. RETRY IN 18 SECONDS...
              </div>
              <div class="lockout-timer-display">
                <span class="lockout-seconds" id="lockoutSec">18</span>
                <span class="lockout-unit">SECONDS</span>
              </div>
              <div class="lockout-subline">
                All input interfaces disabled. System will auto-resume and advance upon zero count.
              </div>
            </div>
          </div>

          <!-- Victory & Light Bulb Vault Unlock Overlay -->
          <div class="quiz-victory-overlay" id="quizVictoryOverlay">
            <div class="quiz-victory-card">
              <!-- Central Illuminating Light Bulb -->
              <div class="bulb-fixture-wrapper">
                <div class="bulb-radiance-glow"></div>
                <svg class="bulb-svg-element" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <!-- Bulb Glow Rays -->
                  <circle cx="50" cy="42" r="32" fill="url(#bulbInnerGlow)" opacity="0.6"/>
                  <!-- Glass Outline -->
                  <path d="M50 12 C34 12 22 24 22 40 C22 51 28 58 35 64 L35 72 L65 72 L65 64 C72 58 78 51 78 40 C78 24 66 12 50 12 Z" fill="#ffe066" stroke="#fbbf24" stroke-width="2.5" />
                  <!-- Filament -->
                  <path d="M42 46 L46 32 L54 32 L58 46" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                  <line x1="42" y1="46" x2="38" y2="64" stroke="#d97706" stroke-width="2"/>
                  <line x1="58" y1="46" x2="62" y2="64" stroke="#d97706" stroke-width="2"/>
                  <!-- Base Cap -->
                  <rect x="36" y="72" width="28" height="6" rx="2" fill="#94a3b8" stroke="#475569" stroke-width="1.5"/>
                  <rect x="38" y="78" width="24" height="6" rx="2" fill="#64748b" stroke="#334155" stroke-width="1.5"/>
                  <path d="M42 84 Q50 90 58 84" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>
                  <defs>
                    <radialGradient id="bulbInnerGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stop-color="#fffbeb"/>
                      <stop offset="60%" stop-color="#fef08a"/>
                      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
                    </radialGradient>
                  </defs>
                </svg>
              </div>

              <!-- Access Granted Victory Banner -->
              <div class="quiz-access-granted-banner">
                &gt;&gt; ACCESS GRANTED: You have correctly solved the Vault Riddle.
              </div>

              <!-- Security Code Box -->
              <div class="quiz-key-display-box">
                <span class="quiz-key-lbl">VAULT 03 SECURITY PASSCODE</span>
                <span class="quiz-key-code-val" id="victorySecurityCode">${this.options.securityCode}</span>
              </div>

              <!-- Event Authorization Code for Pipeline -->
              <div class="quiz-key-display-box quiz-auth-sub-box">
                <span class="quiz-key-lbl">TEAM SYSTEM AUTHORIZATION KEY</span>
                <span class="quiz-key-code-val" style="font-size:1.4rem; color:#00e5ff;">${this.options.authCode}</span>
              </div>

              <div class="quiz-event-desc">
                Engineering knowledge matrix fully synchronized. Powertrain control conduits ready for navigation bypass.
              </div>

              <div style="display:flex; gap:0.75rem; flex-wrap:wrap; justify-content:center; width:100%;">
                <button class="btn-quiz-continue" id="btnQuizProceed">
                  CONTINUE &rarr; PROCEED TO NEXT MISSION
                </button>
                <button type="button" class="btn-quiz-continue btn-facility-home" id="btnQuizHome" style="background:#111e2f; color:#94a3b8; border:1px solid #334155; box-shadow:none; cursor:pointer;">
                  &larr; FACILITY HOME
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      // Cache DOM references
      this.dom = {
        window: this.container.querySelector('#quizWindow'),
        btnClose: this.container.querySelector('#btnQuizClose'),
        progressBar: this.container.querySelector('#quizProgressBar'),
        questionCard: this.container.querySelector('#questionCard'),
        nodeTagBadge: this.container.querySelector('#nodeTagBadge'),
        tierBadge: this.container.querySelector('#tierBadge'),
        categoryTag: this.container.querySelector('#categoryTag'),
        questionText: this.container.querySelector('#questionText'),
        optionsGrid: this.container.querySelector('#optionsGrid'),
        optionBtns: [
          this.container.querySelector('#optionBtn_0'),
          this.container.querySelector('#optionBtn_1'),
          this.container.querySelector('#optionBtn_2'),
          this.container.querySelector('#optionBtn_3')
        ],
        optionTexts: [
          this.container.querySelector('#optionText_0'),
          this.container.querySelector('#optionText_1'),
          this.container.querySelector('#optionText_2'),
          this.container.querySelector('#optionText_3')
        ],
        lockoutOverlay: this.container.querySelector('#lockoutOverlay'),
        lockoutMsg: this.container.querySelector('#lockoutMsg'),
        lockoutSec: this.container.querySelector('#lockoutSec'),
        victoryOverlay: this.container.querySelector('#quizVictoryOverlay'),
        btnProceed: this.container.querySelector('#btnQuizProceed'),
        btnHome: this.container.querySelector('#btnQuizHome')
      };

      // Bind Events
      if (this.dom.btnClose) {
        this.dom.btnClose.addEventListener('click', () => {
          this._clearLockoutTimer();
          if (typeof this.options.onClose === 'function') {
            this.options.onClose();
          }
        });
      }

      this.dom.optionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(btn.getAttribute('data-index'), 10);
          this.handleAnswer(idx);
        });
      });

      if (this.dom.btnProceed) {
        this.dom.btnProceed.addEventListener('click', () => {
          if (typeof this.options.onComplete === 'function') {
            this.options.onComplete();
          }
        });
      }

      if (this.dom.btnHome) {
        this.dom.btnHome.addEventListener('click', () => {
          if (typeof this.options.onComplete === 'function') {
            this.options.onComplete();
          } else if (typeof this.options.onClose === 'function') {
            this.options.onClose();
          } else {
            window.location.href = '/';
          }
        });
      }
    }

    renderCurrentQuestion() {
      if (this.currentNodeIndex >= this.totalNodes) {
        this.triggerVictory();
        return;
      }

      this.hasAnsweredCurrent = false;
      const q = this.sessionQuestions[this.currentNodeIndex];
      const nodeNum = this.currentNodeIndex + 1;

      // Update Pipeline Progress Bar
      for (let i = 1; i <= 5; i++) {
        const stepEl = this.container.querySelector(`#nodeStep_${i}`);
        if (!stepEl) continue;

        stepEl.classList.remove('active', 'completed', 'breached');
        if (i < nodeNum) {
          if (this.nodeResults[i - 1] === false) {
            stepEl.classList.add('breached');
          } else {
            stepEl.classList.add('completed');
          }
        } else if (i === nodeNum) {
          stepEl.classList.add('active');
        }
      }

      // Update Node Tag & Tier Badge
      this.dom.nodeTagBadge.textContent = `NODE ${nodeNum}/5`;
      this.dom.tierBadge.className = `tier-badge tier-${q.tier}`;
      this.dom.tierBadge.textContent = q.tier.toUpperCase();

      this.dom.categoryTag.textContent = `CATEGORY: ${(q.category || "ENGINEERING").toUpperCase()}`;
      this.dom.questionText.textContent = q.question;

      // Update Options
      this.dom.optionBtns.forEach((btn, idx) => {
        btn.disabled = false;
        btn.classList.remove('correct', 'wrong');
        this.dom.optionTexts[idx].textContent = q.options[idx] || '';
      });

      // Hide lockout & victory overlays
      if (this.dom.lockoutOverlay) this.dom.lockoutOverlay.style.display = 'none';
      if (this.dom.victoryOverlay) this.dom.victoryOverlay.style.display = 'none';
    }

    handleAnswer(selectedIndex) {
      if (this.isLockedOut || this.hasAnsweredCurrent) return;
      this.hasAnsweredCurrent = true;

      const q = this.sessionQuestions[this.currentNodeIndex];
      const isCorrect = selectedIndex === q.correct;
      const chosenBtn = this.dom.optionBtns[selectedIndex];

      if (isCorrect) {
        // Correct Answer
        this.nodeResults[this.currentNodeIndex] = true;
        chosenBtn.classList.add('correct');
        this.audio.playCorrect();

        // Mark current node in progress bar
        const curStepEl = this.container.querySelector(`#nodeStep_${this.currentNodeIndex + 1}`);
        if (curStepEl) curStepEl.classList.add('completed');

        // Short transition to next question
        setTimeout(() => {
          this.currentNodeIndex++;
          this.renderCurrentQuestion();
        }, 750);

      } else {
        // Wrong Answer Penalty: 18-Second Lockout
        this.nodeResults[this.currentNodeIndex] = false;
        chosenBtn.classList.add('wrong');
        this.audio.playWrong();

        // Disable all option buttons immediately
        this.dom.optionBtns.forEach(btn => btn.disabled = true);

        // Mark current node as breached
        const curStepEl = this.container.querySelector(`#nodeStep_${this.currentNodeIndex + 1}`);
        if (curStepEl) curStepEl.classList.add('breached');

        // Trigger 18-second lockout screen after brief shake
        setTimeout(() => {
          this.triggerLockout();
        }, 400);
      }
    }

    triggerLockout() {
      this.isLockedOut = true;
      this.lockoutSecondsRemaining = 18;

      this.dom.lockoutOverlay.style.display = 'flex';
      this._updateLockoutDisplay();

      this._clearLockoutTimer();
      this.lockoutInterval = setInterval(() => {
        this.lockoutSecondsRemaining--;
        this.audio.playLockoutTick();
        this._updateLockoutDisplay();

        if (this.lockoutSecondsRemaining <= 0) {
          this._clearLockoutTimer();
          this.isLockedOut = false;
          this.dom.lockoutOverlay.style.display = 'none';

          // Advance automatically to the next question
          this.currentNodeIndex++;
          this.renderCurrentQuestion();
        }
      }, 1000);
    }

    _updateLockoutDisplay() {
      const secStr = String(this.lockoutSecondsRemaining).padStart(2, '0');
      if (this.dom.lockoutMsg) {
        this.dom.lockoutMsg.textContent = `SECURITY BREACH DETECTED: SYSTEM LOCKED OUT. RETRY IN ${secStr} SECONDS...`;
      }
      if (this.dom.lockoutSec) {
        this.dom.lockoutSec.textContent = secStr;
      }
    }

    _clearLockoutTimer() {
      if (this.lockoutInterval) {
        clearInterval(this.lockoutInterval);
        this.lockoutInterval = null;
      }
    }

    triggerVictory() {
      this._clearLockoutTimer();
      this.audio.playUnlock();

      if (this.dom.victoryOverlay) {
        this.dom.victoryOverlay.style.display = 'flex';
      }

      // Mark all nodes in pipeline as processed
      for (let i = 1; i <= 5; i++) {
        const stepEl = this.container.querySelector(`#nodeStep_${i}`);
        if (stepEl && !stepEl.classList.contains('breached')) {
          stepEl.classList.add('completed');
        }
      }
    }

    destroy() {
      this._clearLockoutTimer();
      this.container.innerHTML = '';
    }
  }

  // Export
  return {
    QUESTION_POOL,
    EngineeringQuizGame,
    QuizAudio
  };
}));
