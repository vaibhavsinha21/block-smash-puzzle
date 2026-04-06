// ============================================================
// BLOCK SMASH PUZZLE — Production Game Engine v1.0.0
// © 2026 BlockSmash Studios. All rights reserved.
// ============================================================
(() => {
  'use strict';

  // ---- CONFIG ----
  const BOARD_SIZE = 8;
  const COLORS = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#a855f7','#f97316','#06b6d4','#ec4899'];

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
  let totalLinesCleared = 0;
  let gamesPlayed = parseInt(localStorage.getItem('bsGamesPlayed') || '0');
  let draggingIdx = -1;
  let gameActive = true;
  let isNewRecord = false;

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

  // ---- ADMOB INTEGRATION (Capacitor) ----
  const AdMob = {
    isNative: typeof window.Capacitor !== 'undefined',
    interstitialCount: 0,
    INTERSTITIAL_EVERY: 3,

    async init() {
      if (!this.isNative) return;
      try {
        const { AdMob: CapAdMob } = await import('@capacitor-community/admob');
        this.plugin = CapAdMob;
        await this.plugin.initialize({ initializeForTesting: true });
        this.showBanner();
      } catch(e) { console.log('AdMob not available:', e.message); }
    },

    async showBanner() {
      if (!this.plugin) return;
      try {
        await this.plugin.showBanner({
          adId: 'ca-app-pub-XXXXXXXXXXXXX/XXXXXXXXXX', // Replace with your Ad Unit ID
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
        await this.plugin.prepareInterstitial({
          adId: 'ca-app-pub-XXXXXXXXXXXXX/XXXXXXXXXX', // Replace with your Ad Unit ID
        });
        await this.plugin.showInterstitial();
      } catch(e) {}
    },

    async showRewarded() {
      if (!this.plugin) return;
      try {
        await this.plugin.prepareRewardVideoAd({
          adId: 'ca-app-pub-XXXXXXXXXXXXX/XXXXXXXXXX', // Replace with your Ad Unit ID
        });
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
    ghostEl.style.display = 'none';
    clearPreview();

    if (draggingIdx >= 0 && piecesEl.children[draggingIdx]) {
      piecesEl.children[draggingIdx].classList.remove('dragging');
    }

    if (lastPreviewR >= 0 && lastPreviewC >= 0 && dragPiece) {
      placePiece(dragPiece, lastPreviewR, lastPreviewC);
      const cellCount = countCells(dragPiece);
      pieces[draggingIdx] = null;
      sfxPlace(); vibrate(12);

      const cleared = checkAndClearLines();
      if (cleared > 0) {
        combo++;
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
  function addScore(pts) {
    score += pts;
    scoreEl.textContent = score;
    if (score > bestScore) {
      bestScore = score;
      bestScoreEl.textContent = bestScore;
      bestScoreEl.classList.add('new-best');
      setTimeout(() => bestScoreEl.classList.remove('new-best'), 600);
      localStorage.setItem('blockSmashBest', bestScore);
      isNewRecord = true;
    }
    showScoreFloat('+' + pts);
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
    localStorage.setItem('bsState', JSON.stringify({ board, pieces, score, combo, totalLinesCleared }));
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

    finalScoreEl.textContent = score;
    finalBestEl.textContent = bestScore;
    newRecordEl.style.display = isNewRecord ? 'block' : 'none';
    if (isNewRecord) sfxNewRecord();
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
    score = 0; combo = 0; totalLinesCleared = 0;
    isNewRecord = false;
    scoreEl.textContent = '0';
    bestScoreEl.textContent = bestScore;
    gameActive = true;
    initBoard(); renderBoard(); generatePieces();
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
    musicT.addEventListener('click', () => { settings.musicOn = !settings.musicOn; musicT.classList.toggle('on'); saveSetting(); });

    $('btn-settings').addEventListener('click', () => settingsModal.classList.add('show'));
    $('btn-close-settings').addEventListener('click', () => settingsModal.classList.remove('show'));
    settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) settingsModal.classList.remove('show'); });
  }

  // ---- EVENTS ----
  $('btn-restart').addEventListener('click', restart);
  $('btn-share').addEventListener('click', shareScore);
  $('btn-leaderboard').addEventListener('click', () => {
    fetch('/api/scores').then(r => r.json()).then(scores => {
      let msg = '\u{1F3C5} Top Scores:\n';
      scores.slice(0, 10).forEach((s, i) => { msg += (i + 1) + '. ' + s.name + ' — ' + s.score + '\n'; });
      alert(msg);
    }).catch(() => alert('Leaderboard unavailable offline'));
  });

  window.addEventListener('resize', () => { initBoard(); renderBoard(); });

  // ---- BOOT ----
  function boot() {
    bestScoreEl.textContent = bestScore;
    initSettings();

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
    }, 800);

    // Init AdMob
    AdMob.init();

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
