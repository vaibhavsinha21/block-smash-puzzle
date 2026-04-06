// ============================================================
// BLOCK SMASH PUZZLE — Production Game Engine v2.0.0
// © 2026 BlockSmash Studios. All rights reserved.
// ============================================================
(() => {
  'use strict';

  // ---- CONFIG ----
  const BOARD_SIZE = 8;
  const COLORS = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#a855f7','#f97316','#06b6d4','#ec4899'];
  const UNDO_COST = 0; // free undo (set to score penalty if desired)

  // ---- LEVEL / PROGRESSION CONFIG ----
  // XP thresholds for each level (level 1 = 0 XP, level 2 = 200 XP, etc.)
  const LEVEL_THRESHOLDS = [0];
  for (let i = 1; i <= 100; i++) LEVEL_THRESHOLDS.push(Math.floor(150 * Math.pow(1.18, i)));
  const LEVEL_TITLES = [
    'Rookie','Rookie','Beginner','Beginner','Learner','Learner',
    'Player','Player','Skilled','Skilled','Expert','Expert',
    'Pro','Pro','Master','Master','Champion','Champion','Legend','Legend',
    'Grandmaster'
  ];
  function getLevelTitle(lvl) { return LEVEL_TITLES[Math.min(lvl, LEVEL_TITLES.length - 1)]; }

  // ---- MILESTONE DEFINITIONS (Variable Ratio Rewards) ----
  const MILESTONES = [
    { id:'first_clear', name:'First Clear', desc:'Clear your first line', icon:'⭐', check: s => s.lifetimeLines >= 1 },
    { id:'combo_2', name:'Double Trouble', desc:'Get a 2x combo', icon:'🔥', check: s => s.maxCombo >= 2 },
    { id:'score_500', name:'Rising Star', desc:'Score 500 in one game', icon:'🌟', check: s => s.bestScore >= 500 },
    { id:'lines_10', name:'Line Crusher', desc:'Clear 10 lines total', icon:'💎', check: s => s.lifetimeLines >= 10 },
    { id:'combo_3', name:'Triple Threat', desc:'Get a 3x combo', icon:'💥', check: s => s.maxCombo >= 3 },
    { id:'score_1000', name:'Block Master', desc:'Score 1,000 in one game', icon:'👑', check: s => s.bestScore >= 1000 },
    { id:'games_5', name:'Hooked!', desc:'Play 5 games', icon:'🎮', check: s => s.gamesPlayed >= 5 },
    { id:'lines_50', name:'Line Legend', desc:'Clear 50 lines total', icon:'⚡', check: s => s.lifetimeLines >= 50 },
    { id:'combo_4', name:'Quad Wrecker', desc:'Get a 4x combo', icon:'🌈', check: s => s.maxCombo >= 4 },
    { id:'score_2500', name:'Puzzle Prodigy', desc:'Score 2,500 in one game', icon:'🏆', check: s => s.bestScore >= 2500 },
    { id:'games_25', name:'Addicted!', desc:'Play 25 games', icon:'💊', check: s => s.gamesPlayed >= 25 },
    { id:'lines_200', name:'Line Overlord', desc:'Clear 200 lines total', icon:'🔱', check: s => s.lifetimeLines >= 200 },
    { id:'score_5000', name:'Block God', desc:'Score 5,000 in one game', icon:'🌠', check: s => s.bestScore >= 5000 },
    { id:'streak_3', name:'Consistent!', desc:'Play 3 days in a row', icon:'📅', check: s => s.longestStreak >= 3 },
    { id:'streak_7', name:'Week Warrior', desc:'Play 7 days in a row', icon:'🗓️', check: s => s.longestStreak >= 7 },
    { id:'combo_6', name:'GODLIKE', desc:'Get a 6x combo', icon:'👁️', check: s => s.maxCombo >= 6 },
  ];

  // ---- DAILY CHALLENGE DEFINITIONS ----
  function getDailyChallenge() {
    const today = new Date().toDateString();
    // Seed from date for deterministic daily challenge
    let seed = 0;
    for (let i = 0; i < today.length; i++) seed = ((seed << 5) - seed + today.charCodeAt(i)) | 0;
    seed = Math.abs(seed);
    const challenges = [
      { name: 'Line Blitz', desc: 'Clear 5 lines in one game', icon: '⚡', target: 5, stat: 'lines' },
      { name: 'Score Rush', desc: 'Score 800 points', icon: '🎯', target: 800, stat: 'score' },
      { name: 'Combo King', desc: 'Get a 3x combo', icon: '🔥', target: 3, stat: 'combo' },
      { name: 'Line Mania', desc: 'Clear 8 lines in one game', icon: '💥', target: 8, stat: 'lines' },
      { name: 'High Roller', desc: 'Score 1,500 points', icon: '💰', target: 1500, stat: 'score' },
      { name: 'Combo Master', desc: 'Get a 4x combo', icon: '👑', target: 4, stat: 'combo' },
      { name: 'Marathon', desc: 'Clear 12 lines in one game', icon: '🏃', target: 12, stat: 'lines' },
    ];
    return { ...challenges[seed % challenges.length], date: today };
  }

  // ---- PIECE DEFINITIONS ----
  const PIECE_DEFS = [
    {s:[[1]],w:1}, {s:[[1,1]],w:1}, {s:[[1],[1]],w:1},
    {s:[[1,1,1]],w:2}, {s:[[1],[1],[1]],w:2},
    {s:[[1,1],[1,1]],w:2},
    {s:[[1,0],[1,0],[1,1]],w:3}, {s:[[0,1],[0,1],[1,1]],w:3},
    {s:[[1,1],[1,0],[1,0]],w:3}, {s:[[1,1],[0,1],[0,1]],w:3},
    {s:[[1,1,1],[0,1,0]],w:3}, {s:[[0,1,0],[1,1,1]],w:3},
    {s:[[1,0],[1,1],[1,0]],w:3}, {s:[[0,1],[1,1],[0,1]],w:3},
    {s:[[1,1,1,1]],w:4}, {s:[[1],[1],[1],[1]],w:4},
    {s:[[1,1,1,1,1]],w:6}, {s:[[1],[1],[1],[1],[1]],w:6},
    {s:[[1,1,0],[0,1,1]],w:3}, {s:[[0,1,1],[1,1,0]],w:3},
    {s:[[1,0],[1,1]],w:2}, {s:[[0,1],[1,1]],w:2},
    {s:[[1,1],[1,0]],w:2}, {s:[[1,1],[0,1]],w:2},
    {s:[[1,1,1],[1,1,1],[1,1,1]],w:8},
    {s:[[0,1,0],[1,1,1],[0,1,0]],w:5},
    {s:[[1,1],[1,1],[1,1]],w:5}, {s:[[1,1,1],[1,1,1]],w:5},
  ];

  // ---- SETTINGS (persisted) ----
  const defaults = { soundOn: true, vibrationOn: true, musicOn: false };
  let settings = { ...defaults, ...JSON.parse(localStorage.getItem('bsSettings') || '{}') };
  function saveSetting() { localStorage.setItem('bsSettings', JSON.stringify(settings)); }

  // ---- STATE ----
  let board = [];
  let pieces = [];
  let score = 0;
  let bestScore = parseInt(localStorage.getItem('blockSmashBest') || '0');
  let combo = 0;
  let maxCombo = 0;
  let totalLinesCleared = 0;
  let gamesPlayed = parseInt(localStorage.getItem('bsGamesPlayed') || '0');
  let draggingIdx = -1;
  let gameActive = true;
  let isNewRecord = false;
  let undoState = null; // snapshot before last move
  let undoAvailable = false;
  let hasShownTutorial = localStorage.getItem('bsTutorialShown') === '1';

  // ---- PERSISTENT STATS (Endowed Progress + Loss Aversion) ----
  let stats = JSON.parse(localStorage.getItem('bsStats') || 'null') || {
    lifetimeScore: 0,
    lifetimeLines: 0,
    lifetimeGames: 0,
    lifetimePieces: 0,
    bestScore: 0,
    maxCombo: 0,
    xp: 0,
    level: 1,
    unlockedMilestones: [],
    currentStreak: 0,
    longestStreak: 0,
    lastPlayDate: null,
    dailyChallengeDate: null,
    dailyChallengeComplete: false,
    dailyChallengesCompleted: 0,
  };
  function saveStats() { localStorage.setItem('bsStats', JSON.stringify(stats)); }

  // ---- STREAK TRACKER (Commitment/Consistency) ----
  function updateStreak() {
    const today = new Date().toDateString();
    if (stats.lastPlayDate === today) return; // already counted today
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (stats.lastPlayDate === yesterday) {
      stats.currentStreak++;
    } else if (stats.lastPlayDate !== today) {
      stats.currentStreak = 1;
    }
    stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
    stats.lastPlayDate = today;
    saveStats();
  }

  // ---- DOM ----
  const $ = id => document.getElementById(id);
  const boardEl = $('board');
  const piecesEl = $('pieces-container');
  const scoreEl = $('score');
  const bestScoreEl = $('best-score');
  const gameOverEl = $('game-over');
  const finalScoreEl = $('final-score');
  const finalBestEl = $('final-best');
  const ghostEl = $('drag-ghost');
  const boardContainer = $('board-container');
  const splashEl = $('splash');
  const settingsModal = $('settings-modal');
  const newRecordEl = $('new-record');

  // ---- AUDIO ENGINE ----
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function playTone(freq, dur, type = 'sine', vol = 0.1) {
    if (!settings.soundOn) return;
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      g.gain.setValueAtTime(vol, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + dur);
    } catch(e) {}
  }

  function sfxPlace() { playTone(520, 0.08); setTimeout(() => playTone(680, 0.08), 40); }
  function sfxClear(n) {
    for (let i = 0; i < n; i++) setTimeout(() => playTone(523 + i * 80, 0.12, 'triangle'), i * 60);
  }
  function sfxCombo(n) {
    for (let i = 0; i < Math.min(n, 6); i++) setTimeout(() => playTone(600 + i * 120, 0.18, 'square', 0.06), i * 70);
  }
  function sfxGameOver() { playTone(300, 0.25, 'sawtooth', 0.08); setTimeout(() => playTone(200, 0.35, 'sawtooth', 0.08), 150); }
  function sfxNewRecord() { [523,659,784,1047].forEach((f,i) => setTimeout(() => playTone(f, 0.2, 'triangle', 0.1), i * 100)); }

  function vibrate(ms = 15) {
    if (!settings.vibrationOn) return;
    try { navigator.vibrate && navigator.vibrate(ms); } catch(e) {}
  }

  // ---- BACKGROUND MUSIC (Lo-fi ambient loop) ----
  let musicOsc1 = null, musicOsc2 = null, musicGain = null, musicPlaying = false;
  function startMusic() {
    if (musicPlaying || !settings.musicOn) return;
    try {
      const ctx = getAudioCtx();
      musicGain = ctx.createGain();
      musicGain.gain.setValueAtTime(0.03, ctx.currentTime);
      musicGain.connect(ctx.destination);

      // Pad 1 — warm chord
      musicOsc1 = ctx.createOscillator();
      musicOsc1.type = 'sine';
      musicOsc1.frequency.setValueAtTime(220, ctx.currentTime);
      musicOsc1.connect(musicGain);
      musicOsc1.start();

      // Pad 2 — harmony
      musicOsc2 = ctx.createOscillator();
      musicOsc2.type = 'sine';
      musicOsc2.frequency.setValueAtTime(330, ctx.currentTime);
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.02, ctx.currentTime);
      musicOsc2.connect(g2);
      g2.connect(ctx.destination);
      musicOsc2.start();

      // Slowly modulate for movement
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.1, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(8, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(musicOsc1.frequency);
      lfo.start();

      musicPlaying = true;
    } catch(e) {}
  }

  function stopMusic() {
    try {
      if (musicOsc1) { musicOsc1.stop(); musicOsc1 = null; }
      if (musicOsc2) { musicOsc2.stop(); musicOsc2 = null; }
    } catch(e) {}
    musicPlaying = false;
  }

  function toggleMusic(on) {
    settings.musicOn = on;
    saveSetting();
    if (on) startMusic();
    else stopMusic();
  }

  // ---- UNDO SYSTEM ----
  function saveUndoSnapshot() {
    undoState = {
      board: board.map(row => [...row]),
      pieces: pieces.map(p => p ? { ...p, shape: p.shape.map(r => [...r]) } : null),
      score,
      combo,
      maxCombo,
      totalLinesCleared,
    };
    undoAvailable = true;
    updateUndoButton();
  }

  function performUndo() {
    if (!undoState || !undoAvailable || !gameActive) return;
    board = undoState.board;
    pieces = undoState.pieces;
    score = undoState.score;
    combo = undoState.combo;
    maxCombo = undoState.maxCombo;
    totalLinesCleared = undoState.totalLinesCleared;
    scoreEl.textContent = score;
    undoAvailable = false;
    undoState = null;
    renderBoard();
    renderPieces();
    saveGameState();
    updateUndoButton();
    sfxPlace();
    vibrate(10);
  }

  function updateUndoButton() {
    const btn = $('btn-undo');
    if (btn) {
      btn.style.opacity = undoAvailable ? '1' : '0.3';
      btn.style.pointerEvents = undoAvailable ? 'auto' : 'none';
    }
  }

  // ---- TUTORIAL ----
  function showTutorial() {
    if (hasShownTutorial) return;
    const overlay = $('tutorial-overlay');
    if (overlay) {
      overlay.classList.add('show');
      hasShownTutorial = true;
      localStorage.setItem('bsTutorialShown', '1');
    }
  }

  function dismissTutorial() {
    const overlay = $('tutorial-overlay');
    if (overlay) overlay.classList.remove('show');
  }

  // ---- LOW SPACE WARNING ----
  function getBoardFillPercent() {
    let filled = 0;
    for (let r = 0; r < BOARD_SIZE; r++)
      for (let c = 0; c < BOARD_SIZE; c++)
        if (board[r][c]) filled++;
    return filled / (BOARD_SIZE * BOARD_SIZE);
  }

  function updateDangerIndicator() {
    const pct = getBoardFillPercent();
    const boardBorder = boardEl;
    const fillIndicator = $('fill-percent');
    if (fillIndicator) {
      const percent = Math.round(pct * 100);
      fillIndicator.textContent = percent + '%';
      fillIndicator.style.color = pct > 0.7 ? '#ff6b6b' : pct > 0.5 ? '#ffd93d' : 'rgba(255,255,255,0.3)';
    }
    if (pct > 0.75) {
      boardBorder.style.borderColor = 'rgba(255,107,107,0.4)';
      boardBorder.style.boxShadow = '0 8px 32px rgba(255,60,60,0.15), inset 0 1px 0 rgba(255,255,255,0.05)';
    } else {
      boardBorder.style.borderColor = 'rgba(255,255,255,0.06)';
      boardBorder.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)';
    }
  }

  // ---- CONFETTI (for new records) ----
  function spawnConfetti() {
    const container = document.body;
    const emojis = ['🎉','🎊','⭐','🏆','✨','💎'];
    for (let i = 0; i < 30; i++) {
      const el = document.createElement('div');
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.cssText = 'position:fixed;font-size:' + (16 + Math.random() * 16) + 'px;pointer-events:none;z-index:999;' +
        'left:' + (Math.random() * 100) + 'vw;top:-20px;';
      container.appendChild(el);
      const duration = 1500 + Math.random() * 1500;
      el.animate([
        { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
        { transform: 'translateY(' + (window.innerHeight + 40) + 'px) rotate(' + (360 + Math.random() * 360) + 'deg)', opacity: 0 }
      ], { duration, easing: 'ease-in', delay: Math.random() * 400 });
      setTimeout(() => el.remove(), duration + 400);
    }
  }

  // ---- ADMOB INTEGRATION (Capacitor) ----
  // NOTE: Replace placeholder IDs with real AdMob IDs before enabling ads
  const ADMOB_ENABLED = false; // Set to true once you have real AdMob ad unit IDs
  const ADMOB_BANNER_ID = 'ca-app-pub-XXXXXXXXXXXXX/XXXXXXXXXX'; // Replace with your Banner Ad Unit ID
  const ADMOB_INTERSTITIAL_ID = 'ca-app-pub-XXXXXXXXXXXXX/XXXXXXXXXX'; // Replace with your Interstitial Ad Unit ID
  const ADMOB_REWARDED_ID = 'ca-app-pub-XXXXXXXXXXXXX/XXXXXXXXXX'; // Replace with your Rewarded Ad Unit ID

  const AdMob = {
    isNative: typeof window.Capacitor !== 'undefined',
    interstitialCount: 0,
    INTERSTITIAL_EVERY: 3,

    async init() {
      if (!this.isNative || !ADMOB_ENABLED) return;
      try {
        const { AdMob: CapAdMob } = await import('@capacitor-community/admob');
        this.plugin = CapAdMob;
        await this.plugin.initialize({ initializeForTesting: false });
        this.showBanner();
      } catch(e) { console.log('AdMob not available:', e.message); }
    },

    async showBanner() {
      if (!this.plugin) return;
      try {
        await this.plugin.showBanner({
          adId: ADMOB_BANNER_ID,
          adSize: 'BANNER',
          position: 'BOTTOM_CENTER',
        });
      } catch(e) {}
    },

    async showInterstitial() {
      if (!this.plugin) return;
      this.interstitialCount++;
      if (this.interstitialCount % this.INTERSTITIAL_EVERY !== 0) return;
      try {
        await this.plugin.prepareInterstitial({ adId: ADMOB_INTERSTITIAL_ID });
        await this.plugin.showInterstitial();
      } catch(e) {}
    },

    async showRewarded() {
      if (!this.plugin) return;
      try {
        await this.plugin.prepareRewardVideoAd({ adId: ADMOB_REWARDED_ID });
        const result = await this.plugin.showRewardVideoAd();
        return result.type === 'earned';
      } catch(e) { return false; }
    }
  };

  // ---- INIT BOARD ----
  function initBoard() {
    board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
    boardEl.innerHTML = '';
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.r = r;
        cell.dataset.c = c;
        boardEl.appendChild(cell);
      }
    }
  }

  function renderBoard() {
    const cells = boardEl.querySelectorAll('.cell');
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const cell = cells[r * BOARD_SIZE + c];
        const val = board[r][c];
        cell.style.background = val || 'rgba(255,255,255,0.025)';
        cell.classList.toggle('filled', !!val);
        cell.classList.remove('preview', 'clearing', 'row-hint', 'col-hint', 'invalid-preview');
      }
    }
    highlightAlmostComplete();
    updateDangerIndicator();
  }

  // ---- HIGHLIGHT ALMOST-COMPLETE ROWS/COLS ----
  function highlightAlmostComplete() {
    const cells = boardEl.querySelectorAll('.cell');
    for (let r = 0; r < BOARD_SIZE; r++) {
      const empty = board[r].filter(c => !c).length;
      if (empty > 0 && empty <= 2) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (!board[r][c]) cells[r * BOARD_SIZE + c].classList.add('row-hint');
        }
      }
    }
    for (let c = 0; c < BOARD_SIZE; c++) {
      let empty = 0;
      for (let r = 0; r < BOARD_SIZE; r++) if (!board[r][c]) empty++;
      if (empty > 0 && empty <= 2) {
        for (let r = 0; r < BOARD_SIZE; r++) {
          if (!board[r][c]) cells[r * BOARD_SIZE + c].classList.add('col-hint');
        }
      }
    }
  }

  // ---- PIECES ----
  function randomPiece() {
    const idx = Math.floor(Math.random() * PIECE_DEFS.length);
    const def = PIECE_DEFS[idx];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    return { shape: def.s, color, weight: def.w };
  }

  function generatePieces() {
    pieces = [randomPiece(), randomPiece(), randomPiece()];
    renderPieces();
  }

  function renderPieces() {
    piecesEl.innerHTML = '';
    pieces.forEach((piece, idx) => {
      const slot = document.createElement('div');
      slot.className = 'piece-slot';
      if (!piece) { slot.style.opacity = '0.15'; piecesEl.appendChild(slot); return; }

      // Mark pieces that can't fit anywhere
      let canFit = false;
      outer: for (let r = 0; r <= BOARD_SIZE - piece.shape.length; r++) {
        for (let c = 0; c <= BOARD_SIZE - piece.shape[0].length; c++) {
          if (canPlace(piece, r, c)) { canFit = true; break outer; }
        }
      }
      if (!canFit) slot.classList.add('cannot-fit');

      slot.dataset.idx = idx;
      const grid = document.createElement('div');
      grid.className = 'piece-grid';
      grid.style.gridTemplateColumns = 'repeat(' + piece.shape[0].length + ', 1fr)';
      piece.shape.forEach(row => {
        row.forEach(cell => {
          const el = document.createElement('div');
          el.className = 'piece-cell ' + (cell ? 'active' : 'empty');
          if (cell) el.style.background = piece.color;
          grid.appendChild(el);
        });
      });
      slot.appendChild(grid);
      piecesEl.appendChild(slot);
      slot.addEventListener('mousedown', e => startDrag(e, idx));
      slot.addEventListener('touchstart', e => startDrag(e, idx), { passive: false });
    });
  }

  // ---- DRAG & DROP ----
  let dragPiece = null, dragOffsetR = 0, dragOffsetC = 0;
  let lastPreviewR = -1, lastPreviewC = -1;

  function startDrag(e, idx) {
    if (!gameActive || !pieces[idx]) return;
    e.preventDefault();
    if (audioCtx) audioCtx.resume();
    draggingIdx = idx;
    dragPiece = pieces[idx];

    piecesEl.children[idx].classList.add('dragging');

    ghostEl.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'piece-grid';
    grid.style.gridTemplateColumns = 'repeat(' + dragPiece.shape[0].length + ', 1fr)';
    dragPiece.shape.forEach(row => {
      row.forEach(cell => {
        const el = document.createElement('div');
        el.className = 'piece-cell ' + (cell ? 'active' : 'empty');
        if (cell) el.style.background = dragPiece.color;
        grid.appendChild(el);
      });
    });
    ghostEl.appendChild(grid);
    ghostEl.style.display = 'block';

    dragOffsetR = Math.floor(dragPiece.shape.length / 2);
    dragOffsetC = Math.floor(dragPiece.shape[0].length / 2);

    moveGhost(e);
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('touchend', onDragEnd);
    document.addEventListener('touchcancel', onDragEnd);
  }

  function moveGhost(e) {
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    ghostEl.style.left = (cx - ghostEl.offsetWidth / 2) + 'px';
    ghostEl.style.top = (cy - ghostEl.offsetHeight - 40) + 'px';
    return { cx, cy };
  }

  function onDragMove(e) {
    e.preventDefault();
    const { cx, cy } = moveGhost(e);
    const adjustedY = cy - 70;
    const br = boardEl.getBoundingClientRect();
    const cellW = br.width / BOARD_SIZE;
    const cellH = br.height / BOARD_SIZE;
    const hC = Math.floor((cx - br.left) / cellW);
    const hR = Math.floor((adjustedY - br.top) / cellH);
    const sR = hR - dragOffsetR;
    const sC = hC - dragOffsetC;
    clearPreview();
    if (canPlace(dragPiece, sR, sC)) {
      showPreview(dragPiece, sR, sC);
      lastPreviewR = sR; lastPreviewC = sC;
    } else {
      lastPreviewR = -1; lastPreviewC = -1;
    }
  }

  function onDragEnd() {
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
    document.removeEventListener('touchmove', onDragMove);
    document.removeEventListener('touchend', onDragEnd);
    document.removeEventListener('touchcancel', onDragEnd);
    ghostEl.style.display = 'none';
    clearPreview();

    if (draggingIdx >= 0 && piecesEl.children[draggingIdx]) {
      piecesEl.children[draggingIdx].classList.remove('dragging');
    }

    if (lastPreviewR >= 0 && lastPreviewC >= 0 && dragPiece) {
      // Save undo snapshot before this move
      saveUndoSnapshot();
      placePiece(dragPiece, lastPreviewR, lastPreviewC);
      const cellCount = countCells(dragPiece);
      pieces[draggingIdx] = null;
      stats.lifetimePieces++;
      sfxPlace(); vibrate(12);

      const cleared = checkAndClearLines();
      if (cleared > 0) {
        combo++;
        maxCombo = Math.max(maxCombo, combo);
        totalLinesCleared += cleared;
        const pts = cleared * BOARD_SIZE * 10 * Math.max(1, combo);
        addScore(pts);
        sfxClear(cleared);
        if (combo > 1) { showCombo(combo); sfxCombo(combo); vibrate(25); }
      } else {
        combo = 0;
        addScore(cellCount);
      }

      if (pieces.every(p => p === null)) generatePieces();
      else renderPieces();

      saveGameState();
      if (!canAnyPieceFit()) setTimeout(() => gameOver(), 350);
    }

    draggingIdx = -1; dragPiece = null;
    lastPreviewR = -1; lastPreviewC = -1;
  }

  // ---- BOARD LOGIC ----
  function canPlace(piece, sR, sC) {
    if (!piece) return false;
    for (let r = 0; r < piece.shape.length; r++)
      for (let c = 0; c < piece.shape[0].length; c++)
        if (piece.shape[r][c]) {
          const br = sR + r, bc = sC + c;
          if (br < 0 || br >= BOARD_SIZE || bc < 0 || bc >= BOARD_SIZE || board[br][bc]) return false;
        }
    return true;
  }

  function placePiece(piece, sR, sC) {
    for (let r = 0; r < piece.shape.length; r++)
      for (let c = 0; c < piece.shape[0].length; c++)
        if (piece.shape[r][c]) board[sR + r][sC + c] = piece.color;
    renderBoard();
  }

  function showPreview(piece, sR, sC) {
    const cells = boardEl.querySelectorAll('.cell');
    for (let r = 0; r < piece.shape.length; r++)
      for (let c = 0; c < piece.shape[0].length; c++)
        if (piece.shape[r][c]) {
          const idx = (sR + r) * BOARD_SIZE + (sC + c);
          if (cells[idx]) cells[idx].classList.add('preview');
        }
  }

  function clearPreview() {
    boardEl.querySelectorAll('.preview,.invalid-preview').forEach(c => c.classList.remove('preview', 'invalid-preview'));
  }

  function checkAndClearLines() {
    const rowsC = [], colsC = [];
    for (let r = 0; r < BOARD_SIZE; r++) if (board[r].every(c => c !== 0)) rowsC.push(r);
    for (let c = 0; c < BOARD_SIZE; c++) if (board.every(row => row[c] !== 0)) colsC.push(c);
    if (!rowsC.length && !colsC.length) return 0;

    const cells = boardEl.querySelectorAll('.cell');
    const toClear = new Set();
    rowsC.forEach(r => { for (let c = 0; c < BOARD_SIZE; c++) toClear.add(r * BOARD_SIZE + c); });
    colsC.forEach(c => { for (let r = 0; r < BOARD_SIZE; r++) toClear.add(r * BOARD_SIZE + c); });
    toClear.forEach(idx => { cells[idx].classList.add('clearing'); spawnParticles(cells[idx]); });

    setTimeout(() => {
      rowsC.forEach(r => { for (let c = 0; c < BOARD_SIZE; c++) board[r][c] = 0; });
      colsC.forEach(c => { for (let r = 0; r < BOARD_SIZE; r++) board[r][c] = 0; });
      renderBoard();
    }, 380);

    return rowsC.length + colsC.length;
  }

  function canAnyPieceFit() {
    for (const piece of pieces) {
      if (!piece) continue;
      for (let r = 0; r <= BOARD_SIZE - piece.shape.length; r++)
        for (let c = 0; c <= BOARD_SIZE - piece.shape[0].length; c++)
          if (canPlace(piece, r, c)) return true;
    }
    return false;
  }

  function countCells(piece) {
    let n = 0; piece.shape.forEach(row => row.forEach(c => { if (c) n++; })); return n;
  }

  // ---- SCORING ----
  let displayScore = 0;
  let scoreAnimFrame = null;
  function addScore(pts) {
    score += pts;
    // Smooth animated counter
    animateScoreCounter();
    if (score > bestScore) {
      bestScore = score;
      bestScoreEl.textContent = bestScore;
      bestScoreEl.classList.add('new-best');
      setTimeout(() => bestScoreEl.classList.remove('new-best'), 600);
      localStorage.setItem('blockSmashBest', bestScore);
      isNewRecord = true;
    }
    showScoreFloat('+' + pts);
    // Update daily challenge progress in real-time
    updateDailyUI();
  }

  function animateScoreCounter() {
    if (scoreAnimFrame) cancelAnimationFrame(scoreAnimFrame);
    const start = displayScore;
    const end = score;
    const duration = 300;
    const startTime = performance.now();
    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      displayScore = Math.round(start + (end - start) * eased);
      scoreEl.textContent = displayScore;
      if (progress < 1) {
        scoreAnimFrame = requestAnimationFrame(tick);
      } else {
        displayScore = end;
        scoreEl.textContent = end;
      }
    }
    scoreAnimFrame = requestAnimationFrame(tick);
  }

  // ---- XP & LEVELING (Endowed Progress Effect) ----
  function addXP(amount) {
    const oldLevel = stats.level;
    stats.xp += amount;
    // Check for level up
    while (stats.level < LEVEL_THRESHOLDS.length - 1 && stats.xp >= LEVEL_THRESHOLDS[stats.level]) {
      stats.level++;
    }
    saveStats();
    updateLevelUI();
    if (stats.level > oldLevel) showLevelUp(stats.level);
  }

  function updateLevelUI() {
    const levelBadge = $('level-badge');
    const levelTitle = $('level-title');
    const xpFill = $('xp-bar-fill');
    const xpText = $('xp-text');
    const streakBadge = $('streak-badge');

    levelBadge.textContent = '⭐ Lv.' + stats.level;
    levelTitle.textContent = getLevelTitle(stats.level);

    const currentThreshold = LEVEL_THRESHOLDS[stats.level - 1] || 0;
    const nextThreshold = LEVEL_THRESHOLDS[stats.level] || stats.xp;
    const progress = nextThreshold > currentThreshold
      ? ((stats.xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100
      : 100;
    xpFill.style.width = Math.min(progress, 100) + '%';
    xpText.textContent = stats.xp + ' / ' + nextThreshold + ' XP';

    if (stats.currentStreak > 0) {
      streakBadge.style.display = 'inline';
      streakBadge.textContent = '🔥 ' + stats.currentStreak + ' day' + (stats.currentStreak > 1 ? 's' : '');
    }
  }

  function showLevelUp(level) {
    const overlay = $('level-up-overlay');
    $('level-up-text').textContent = 'LEVEL ' + level + '!';
    $('level-up-title').textContent = getLevelTitle(level);
    overlay.classList.add('show');
    sfxNewRecord();
    vibrate(50);
    setTimeout(() => overlay.classList.remove('show'), 2200);
  }

  // ---- DAILY CHALLENGE (Goal Gradient Effect) ----
  function updateDailyUI() {
    const challenge = getDailyChallenge();
    const dailyEl = $('daily-challenge');
    $('daily-icon').textContent = challenge.icon;
    $('daily-name').textContent = 'Daily: ' + challenge.name;
    $('daily-desc').textContent = challenge.desc;

    let current = 0;
    if (challenge.stat === 'lines') current = totalLinesCleared;
    else if (challenge.stat === 'score') current = score;
    else if (challenge.stat === 'combo') current = maxCombo;

    const completed = current >= challenge.target;
    $('daily-progress-text').textContent = Math.min(current, challenge.target) + '/' + challenge.target;
    dailyEl.classList.toggle('completed', completed);

    if (completed && !stats.dailyChallengeComplete && stats.dailyChallengeDate === challenge.date) {
      // Just completed the daily!
      stats.dailyChallengeComplete = true;
      stats.dailyChallengesCompleted++;
      saveStats();
    }
    if (stats.dailyChallengeDate !== challenge.date) {
      stats.dailyChallengeDate = challenge.date;
      stats.dailyChallengeComplete = false;
      saveStats();
    }
  }

  // ---- MILESTONES / ACHIEVEMENTS (Variable Ratio Rewards) ----
  function checkMilestones() {
    const state = {
      totalLinesCleared, bestScore, maxCombo: stats.maxCombo,
      gamesPlayed: stats.lifetimeGames, lifetimeLines: stats.lifetimeLines,
      longestStreak: stats.longestStreak
    };
    const newlyUnlocked = [];
    for (const m of MILESTONES) {
      if (stats.unlockedMilestones.includes(m.id)) continue;
      if (m.check(state)) {
        stats.unlockedMilestones.push(m.id);
        newlyUnlocked.push(m);
      }
    }
    saveStats();
    return newlyUnlocked;
  }

  function showMilestoneUnlock(milestone) {
    const el = $('milestone-unlock');
    $('milestone-icon').textContent = milestone.icon;
    $('milestone-name').textContent = milestone.name;
    el.style.display = 'flex';
    sfxNewRecord();
    vibrate(40);
  }

  // ---- MOTIVATIONAL NUDGES (Near-Miss Effect + Social Proof) ----
  function getMotivationalNudge() {
    const diff = bestScore - score;
    // Near-miss: player was close to beating their record
    if (diff > 0 && diff < bestScore * 0.15 && score > 100) {
      return '😱 So close! Only ' + diff + ' points from your best. One more try!';
    }
    // First game encouragement
    if (stats.lifetimeGames <= 1) {
      return '🌟 Great first game! Most players double their score by game 3.';
    }
    // Improvement nudge
    if (score > 0 && stats.lifetimeGames > 1) {
      const avg = Math.round(stats.lifetimeScore / Math.max(stats.lifetimeGames - 1, 1));
      if (score > avg) return '📈 Above your average of ' + avg + '! You\'re improving!';
    }
    // Streak motivation
    if (stats.currentStreak >= 2) {
      return '🔥 ' + stats.currentStreak + '-day streak! Don\'t break it — play again tomorrow!';
    }
    // Level progress
    const nextThreshold = LEVEL_THRESHOLDS[stats.level] || 9999;
    const remaining = nextThreshold - stats.xp;
    if (remaining > 0 && remaining < 100) {
      return '⭐ Only ' + remaining + ' XP to Level ' + (stats.level + 1) + '!';
    }
    // Generic social proof
    const nudges = [
      '🧩 Average players clear 6+ lines per game. Can you?',
      '💡 Pro tip: save space in corners for big pieces!',
      '🎯 Try to beat your record — ' + bestScore + ' points!',
    ];
    return nudges[Math.floor(Math.random() * nudges.length)];
  }

  // ---- STATS MODAL ----
  function showStatsModal() {
    const grid = $('stats-grid');
    const list = $('achievements-list');
    grid.innerHTML = [
      { v: stats.lifetimeGames, l: 'Games Played' },
      { v: stats.bestScore, l: 'Best Score' },
      { v: stats.lifetimeLines, l: 'Lines Cleared' },
      { v: stats.maxCombo + 'x', l: 'Best Combo' },
      { v: stats.lifetimePieces, l: 'Pieces Placed' },
      { v: stats.longestStreak + 'd', l: 'Best Streak' },
      { v: stats.level, l: 'Level' },
      { v: stats.unlockedMilestones.length + '/' + MILESTONES.length, l: 'Achievements' },
    ].map(s => '<div class="stat-card"><div class="stat-value">' + s.v + '</div><div class="stat-label">' + s.l + '</div></div>').join('');

    list.innerHTML = MILESTONES.map(m => {
      const unlocked = stats.unlockedMilestones.includes(m.id);
      return '<div class="achievement-row ' + (unlocked ? '' : 'locked') + '">' +
        '<div class="ach-icon">' + m.icon + '</div>' +
        '<div><div class="ach-name">' + m.name + '</div><div class="ach-desc">' + m.desc + '</div></div>' +
        '</div>';
    }).join('');

    const modal = $('stats-modal');
    modal.classList.add('show');
  }

  function showScoreFloat(text) {
    const el = document.createElement('div');
    el.className = 'score-float';
    el.textContent = text;
    el.style.left = '50%'; el.style.top = '35%'; el.style.transform = 'translateX(-50%)';
    boardContainer.appendChild(el);
    setTimeout(() => el.remove(), 700);
  }

  function showCombo(n) {
    const texts = ['','','DOUBLE! \u{1F525}','TRIPLE! \u{1F4A5}','QUAD! \u{26A1}','INSANE! \u{1F31F}','GODLIKE! \u{1F451}'];
    const el = document.createElement('div');
    el.className = 'combo-popup';
    el.textContent = n < texts.length ? texts[n] : 'x' + n + ' COMBO! \u{1F3C6}';
    el.style.color = COLORS[n % COLORS.length];
    boardContainer.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  // ---- PARTICLES ----
  function spawnParticles(cell) {
    const rect = cell.getBoundingClientRect();
    const bRect = boardContainer.getBoundingClientRect();
    const cx = rect.left - bRect.left + rect.width / 2;
    const cy = rect.top - bRect.top + rect.height / 2;
    const color = cell.style.background || '#ffd93d';
    for (let i = 0; i < 3; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.background = color;
      p.style.left = cx + 'px'; p.style.top = cy + 'px';
      p.style.width = (4 + Math.random() * 4) + 'px';
      p.style.height = p.style.width;
      const angle = Math.random() * Math.PI * 2;
      const dist = 15 + Math.random() * 25;
      boardContainer.appendChild(p);
      p.animate([
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: 'translate(' + (Math.cos(angle)*dist) + 'px,' + (Math.sin(angle)*dist) + 'px) scale(0)', opacity: 0 }
      ], { duration: 350 + Math.random() * 150, easing: 'ease-out' });
      setTimeout(() => p.remove(), 500);
    }
  }

  // ---- GAME STATE PERSISTENCE ----
  function saveGameState() {
    localStorage.setItem('bsState', JSON.stringify({ board, pieces, score, combo, maxCombo, totalLinesCleared }));
  }

  function loadGameState() {
    try {
      const raw = localStorage.getItem('bsState');
      if (!raw) return false;
      const state = JSON.parse(raw);
      if (!state.board || state.board.length !== BOARD_SIZE) return false;
      board = state.board;
      pieces = state.pieces;
      score = state.score || 0;
      combo = state.combo || 0;
      maxCombo = state.maxCombo || 0;
      totalLinesCleared = state.totalLinesCleared || 0;
      return true;
    } catch(e) { return false; }
  }

  function clearGameState() { localStorage.removeItem('bsState'); }

  // ---- GAME OVER ----
  function gameOver() {
    gameActive = false;
    sfxGameOver(); vibrate(80);
    gamesPlayed++;
    localStorage.setItem('bsGamesPlayed', gamesPlayed);
    clearGameState();

    // Update persistent stats
    stats.lifetimeGames++;
    stats.lifetimeScore += score;
    stats.lifetimeLines += totalLinesCleared;
    stats.bestScore = Math.max(stats.bestScore, score);
    stats.maxCombo = Math.max(stats.maxCombo, maxCombo);

    // Calculate XP earned this game (Endowed Progress)
    const xpEarned = Math.floor(score * 0.3) + (totalLinesCleared * 15) + (maxCombo * 20) + 10; // +10 just for playing
    addXP(xpEarned);

    // Check milestones (Variable Ratio Rewards)
    const newMilestones = checkMilestones();

    // Show game-over screen
    finalScoreEl.textContent = score;
    finalBestEl.textContent = bestScore;
    newRecordEl.style.display = isNewRecord ? 'block' : 'none';
    if (isNewRecord) { sfxNewRecord(); spawnConfetti(); }

    // Show XP gain
    const xpGainEl = $('xp-gain');
    $('xp-gain-text').textContent = '+' + xpEarned + ' XP';
    xpGainEl.style.display = 'block';

    // Show motivational nudge (Near-Miss / Social Proof)
    const nudgeEl = $('motivational-nudge');
    nudgeEl.textContent = getMotivationalNudge();
    nudgeEl.style.display = 'block';

    // Show milestone unlock if any (delayed for drama)
    const milestoneEl = $('milestone-unlock');
    milestoneEl.style.display = 'none';
    if (newMilestones.length > 0) {
      setTimeout(() => showMilestoneUnlock(newMilestones[0]), 600);
    }

    gameOverEl.classList.add('show');

    // Submit score
    fetch('/api/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Player', score })
    }).catch(() => {});

    // Show interstitial ad
    AdMob.showInterstitial();
  }

  function restart() {
    gameOverEl.classList.remove('show');
    score = 0; combo = 0; maxCombo = 0; totalLinesCleared = 0;
    isNewRecord = false;
    undoState = null; undoAvailable = false;
    displayScore = 0;
    scoreEl.textContent = '0';
    bestScoreEl.textContent = bestScore;
    gameActive = true;
    // Hide game-over extras
    $('xp-gain').style.display = 'none';
    $('motivational-nudge').style.display = 'none';
    $('milestone-unlock').style.display = 'none';
    initBoard(); renderBoard(); generatePieces();
    updateDailyUI();
    saveGameState();
  }

  // ---- SHARE ----
  function shareScore() {
    const text = '\u{1F3AE} I scored ' + score + ' on Block Smash Puzzle! Can you beat me? \u{1F9E9}\u{1F525}';
    if (navigator.share) {
      navigator.share({ title: 'Block Smash Puzzle', text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text + ' ' + window.location.href).then(() => {
        alert('Score copied to clipboard!');
      });
    }
  }

  // ---- SETTINGS ----
  function initSettings() {
    const soundT = $('toggle-sound');
    const vibT = $('toggle-vibration');
    const musicT = $('toggle-music');
    soundT.classList.toggle('on', settings.soundOn);
    vibT.classList.toggle('on', settings.vibrationOn);
    musicT.classList.toggle('on', settings.musicOn);

    soundT.addEventListener('click', () => { settings.soundOn = !settings.soundOn; soundT.classList.toggle('on'); saveSetting(); });
    vibT.addEventListener('click', () => { settings.vibrationOn = !settings.vibrationOn; vibT.classList.toggle('on'); saveSetting(); });
    musicT.addEventListener('click', () => { toggleMusic(!settings.musicOn); musicT.classList.toggle('on'); });

    $('btn-settings').addEventListener('click', () => settingsModal.classList.add('show'));
    $('btn-close-settings').addEventListener('click', () => settingsModal.classList.remove('show'));
    settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) settingsModal.classList.remove('show'); });
  }

  // ---- EVENTS ----
  $('btn-restart').addEventListener('click', restart);
  $('btn-share').addEventListener('click', shareScore);
  $('btn-leaderboard').addEventListener('click', () => {
    fetch('/api/scores').then(r => r.json()).then(scores => {
      const modal = $('leaderboard-modal');
      const list = $('leaderboard-list');
      if (!scores.length) {
        list.innerHTML = '<div style="text-align:center;opacity:0.4;padding:20px;">No scores yet. Be the first!</div>';
      } else {
        list.innerHTML = scores.slice(0, 10).map((s, i) => {
          const medals = ['🥇','🥈','🥉'];
          const prefix = i < 3 ? medals[i] : '<span style="opacity:0.4;font-size:0.8em;">' + (i+1) + '.</span>';
          return '<div class="lb-row">' + prefix + ' <span class="lb-name">' + s.name + '</span><span class="lb-score">' + s.score.toLocaleString() + '</span></div>';
        }).join('');
      }
      modal.classList.add('show');
    }).catch(() => {
      const modal = $('leaderboard-modal');
      $('leaderboard-list').innerHTML = '<div style="text-align:center;opacity:0.4;padding:20px;">Leaderboard unavailable offline</div>';
      modal.classList.add('show');
    });
  });
  $('btn-close-leaderboard').addEventListener('click', () => $('leaderboard-modal').classList.remove('show'));
  $('leaderboard-modal').addEventListener('click', (e) => { if (e.target === $('leaderboard-modal')) $('leaderboard-modal').classList.remove('show'); });
  $('btn-stats').addEventListener('click', showStatsModal);
  $('btn-close-stats').addEventListener('click', () => $('stats-modal').classList.remove('show'));
  $('stats-modal').addEventListener('click', (e) => { if (e.target === $('stats-modal')) $('stats-modal').classList.remove('show'); });
  $('level-up-overlay').addEventListener('click', () => $('level-up-overlay').classList.remove('show'));
  $('btn-undo').addEventListener('click', performUndo);
  if ($('btn-tutorial-close')) $('btn-tutorial-close').addEventListener('click', dismissTutorial);
  if ($('tutorial-overlay')) $('tutorial-overlay').addEventListener('click', (e) => { if (e.target === $('tutorial-overlay')) dismissTutorial(); });
  if ($('btn-how-to-play')) $('btn-how-to-play').addEventListener('click', () => {
    const overlay = $('tutorial-overlay');
    if (overlay) overlay.classList.add('show');
  });

  window.addEventListener('resize', () => { initBoard(); renderBoard(); });

  // ---- BOOT ----
  function boot() {
    bestScoreEl.textContent = bestScore;
    initSettings();

    // Initialize progression systems
    updateStreak();
    updateLevelUI();
    updateDailyUI();

    // Sync bestScore from stats
    if (stats.bestScore > bestScore) {
      bestScore = stats.bestScore;
      localStorage.setItem('blockSmashBest', bestScore);
      bestScoreEl.textContent = bestScore;
    }

    // Try to resume previous game
    if (loadGameState()) {
      initBoard(); renderBoard(); renderPieces();
      scoreEl.textContent = score;
      if (!canAnyPieceFit()) { clearGameState(); initBoard(); renderBoard(); generatePieces(); }
    } else {
      initBoard(); renderBoard(); generatePieces();
    }

    // Dismiss splash
    setTimeout(() => {
      splashEl.classList.add('hide');
      setTimeout(() => splashEl.remove(), 500);
      // Show tutorial on first visit
      if (!hasShownTutorial) setTimeout(showTutorial, 300);
    }, 800);

    // Init AdMob
    AdMob.init();

    // Start music if enabled
    if (settings.musicOn) {
      document.addEventListener('click', function musicStarter() {
        startMusic();
        document.removeEventListener('click', musicStarter);
      }, { once: true });
    }

    // Update undo button state
    updateUndoButton();

    // Register Service Worker (web only, not in Capacitor)
    if ('serviceWorker' in navigator && !window.Capacitor) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    // Android back button handling (Capacitor)
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
      window.Capacitor.Plugins.App.addListener('backButton', () => {
        // Close any open modal first
        if ($('stats-modal').classList.contains('show')) { $('stats-modal').classList.remove('show'); return; }
        if ($('settings-modal').classList.contains('show')) { $('settings-modal').classList.remove('show'); return; }
        if ($('leaderboard-modal') && $('leaderboard-modal').classList.contains('show')) { $('leaderboard-modal').classList.remove('show'); return; }
        if ($('tutorial-overlay') && $('tutorial-overlay').classList.contains('show')) { dismissTutorial(); return; }
        if ($('level-up-overlay').classList.contains('show')) { $('level-up-overlay').classList.remove('show'); return; }
        if (gameOverEl.classList.contains('show')) { restart(); return; }
        // If nothing is open, minimize app (don't exit)
        window.Capacitor.Plugins.App.minimizeApp();
      });
    }

    // Prevent pinch-to-zoom on Android WebView
    document.addEventListener('gesturestart', e => e.preventDefault());
    document.addEventListener('dblclick', e => e.preventDefault());
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
