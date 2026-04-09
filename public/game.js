// ============================================================
// BLOCK SMASH PUZZLE — Ultimate Game Engine v4.0.0
// Features: Themes, Power-ups, Tournaments, Social, Accessibility,
//           Rate/Review, Seasonal Events, Smart Analytics
// © 2026 BlockSmash Studios. All rights reserved.
// ============================================================
(() => {
  'use strict';

  // ---- SAFE STORAGE HELPERS ----
  function safeGet(key, fallback) {
    try { const v = localStorage.getItem(key); return v !== null ? v : fallback; }
    catch(e) { return fallback; }
  }
  function safeGetJSON(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch(e) { return fallback; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value)); }
    catch(e) { /* localStorage full or unavailable */ }
  }

  // ---- CONFIG ----
  const BOARD_SIZE = 8;
  const UNDO_COST = 0;

  // ==================================================================
  // THEME SYSTEM — Unlockable color palettes
  // ==================================================================
  const THEMES = {
    default: {
      id: 'default', name: 'Classic', cssClass: '', cost: 0, unlockLevel: 0,
      colors: [
        { main:'#ff6b6b', light:'#ff8e8e', dark:'#cc4444', glow:'rgba(255,107,107,0.4)' },
        { main:'#ffd93d', light:'#ffe066', dark:'#ccad00', glow:'rgba(255,217,61,0.4)' },
        { main:'#6bcb77', light:'#8ed99a', dark:'#4a9e55', glow:'rgba(107,203,119,0.4)' },
        { main:'#4d96ff', light:'#7ab4ff', dark:'#2a6ecc', glow:'rgba(77,150,255,0.4)' },
        { main:'#a855f7', light:'#c084fc', dark:'#7c3aed', glow:'rgba(168,85,247,0.4)' },
        { main:'#f97316', light:'#fb923c', dark:'#c2590c', glow:'rgba(249,115,22,0.4)' },
        { main:'#06b6d4', light:'#22d3ee', dark:'#0891b2', glow:'rgba(6,182,212,0.4)' },
        { main:'#ec4899', light:'#f472b6', dark:'#be185d', glow:'rgba(236,72,153,0.4)' },
      ],
      preview: ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff'],
    },
    ocean: {
      id:'ocean', name:'Ocean', cssClass:'theme-ocean', cost:500, unlockLevel:3,
      colors: [
        { main:'#00bcd4',light:'#26c6da',dark:'#00838f',glow:'rgba(0,188,212,0.4)' },
        { main:'#0097a7',light:'#00acc1',dark:'#006064',glow:'rgba(0,151,167,0.4)' },
        { main:'#4dd0e1',light:'#80deea',dark:'#00838f',glow:'rgba(77,208,225,0.4)' },
        { main:'#00e5ff',light:'#18ffff',dark:'#00b8d4',glow:'rgba(0,229,255,0.4)' },
        { main:'#26c6da',light:'#4dd0e1',dark:'#0097a7',glow:'rgba(38,198,218,0.4)' },
        { main:'#00acc1',light:'#26c6da',dark:'#006064',glow:'rgba(0,172,193,0.4)' },
        { main:'#0288d1',light:'#039be5',dark:'#01579b',glow:'rgba(2,136,209,0.4)' },
        { main:'#29b6f6',light:'#4fc3f7',dark:'#0288d1',glow:'rgba(41,182,246,0.4)' },
      ],
      preview:['#00bcd4','#0097a7','#4dd0e1','#00e5ff'],
    },
    sunset: {
      id:'sunset', name:'Sunset', cssClass:'theme-sunset', cost:800, unlockLevel:5,
      colors: [
        { main:'#ff7043',light:'#ff8a65',dark:'#d84315',glow:'rgba(255,112,67,0.4)' },
        { main:'#ff5722',light:'#ff6e40',dark:'#bf360c',glow:'rgba(255,87,34,0.4)' },
        { main:'#ffab40',light:'#ffc107',dark:'#ff6f00',glow:'rgba(255,171,64,0.4)' },
        { main:'#ffc107',light:'#ffd54f',dark:'#ff8f00',glow:'rgba(255,193,7,0.4)' },
        { main:'#e91e63',light:'#f06292',dark:'#880e4f',glow:'rgba(233,30,99,0.4)' },
        { main:'#ff4081',light:'#ff80ab',dark:'#c51162',glow:'rgba(255,64,129,0.4)' },
        { main:'#ff6e40',light:'#ff9e80',dark:'#dd2c00',glow:'rgba(255,110,64,0.4)' },
        { main:'#ff9800',light:'#ffb74d',dark:'#e65100',glow:'rgba(255,152,0,0.4)' },
      ],
      preview:['#ff7043','#ff5722','#ffab40','#e91e63'],
    },
    forest: {
      id:'forest', name:'Forest', cssClass:'theme-forest', cost:800, unlockLevel:5,
      colors: [
        { main:'#66bb6a',light:'#81c784',dark:'#388e3c',glow:'rgba(102,187,106,0.4)' },
        { main:'#4caf50',light:'#66bb6a',dark:'#2e7d32',glow:'rgba(76,175,80,0.4)' },
        { main:'#81c784',light:'#a5d6a7',dark:'#388e3c',glow:'rgba(129,199,132,0.4)' },
        { main:'#aed581',light:'#c5e1a5',dark:'#7cb342',glow:'rgba(174,213,129,0.4)' },
        { main:'#8d6e63',light:'#a1887f',dark:'#5d4037',glow:'rgba(141,110,99,0.4)' },
        { main:'#a5d6a7',light:'#c8e6c9',dark:'#66bb6a',glow:'rgba(165,214,167,0.4)' },
        { main:'#43a047',light:'#66bb6a',dark:'#1b5e20',glow:'rgba(67,160,71,0.4)' },
        { main:'#2e7d32',light:'#43a047',dark:'#1b5e20',glow:'rgba(46,125,50,0.4)' },
      ],
      preview:['#66bb6a','#4caf50','#81c784','#8d6e63'],
    },
    neon: {
      id:'neon', name:'Neon', cssClass:'theme-neon', cost:1200, unlockLevel:8,
      colors: [
        { main:'#00e5ff',light:'#18ffff',dark:'#00b8d4',glow:'rgba(0,229,255,0.5)' },
        { main:'#e040fb',light:'#ea80fc',dark:'#aa00ff',glow:'rgba(224,64,251,0.5)' },
        { main:'#76ff03',light:'#b2ff59',dark:'#64dd17',glow:'rgba(118,255,3,0.5)' },
        { main:'#ff1744',light:'#ff5252',dark:'#d50000',glow:'rgba(255,23,68,0.5)' },
        { main:'#ffea00',light:'#ffff00',dark:'#ffd600',glow:'rgba(255,234,0,0.5)' },
        { main:'#00e676',light:'#69f0ae',dark:'#00c853',glow:'rgba(0,230,118,0.5)' },
        { main:'#651fff',light:'#7c4dff',dark:'#6200ea',glow:'rgba(101,31,255,0.5)' },
        { main:'#f50057',light:'#ff4081',dark:'#c51162',glow:'rgba(245,0,87,0.5)' },
      ],
      preview:['#00e5ff','#e040fb','#76ff03','#ff1744'],
    },
    candy: {
      id:'candy', name:'Candy', cssClass:'theme-candy', cost:1500, unlockLevel:10,
      colors: [
        { main:'#f48fb1',light:'#f8bbd0',dark:'#c2185b',glow:'rgba(244,143,177,0.4)' },
        { main:'#ce93d8',light:'#e1bee7',dark:'#8e24aa',glow:'rgba(206,147,216,0.4)' },
        { main:'#80cbc4',light:'#b2dfdb',dark:'#00897b',glow:'rgba(128,203,196,0.4)' },
        { main:'#fff176',light:'#fff9c4',dark:'#f9a825',glow:'rgba(255,241,118,0.4)' },
        { main:'#ef5350',light:'#ef9a9a',dark:'#c62828',glow:'rgba(239,83,80,0.4)' },
        { main:'#90caf9',light:'#bbdefb',dark:'#1565c0',glow:'rgba(144,202,249,0.4)' },
        { main:'#a5d6a7',light:'#c8e6c9',dark:'#2e7d32',glow:'rgba(165,214,167,0.4)' },
        { main:'#ffab91',light:'#ffccbc',dark:'#d84315',glow:'rgba(255,171,145,0.4)' },
      ],
      preview:['#f48fb1','#ce93d8','#80cbc4','#fff176'],
    },
    arctic: {
      id:'arctic', name:'Arctic', cssClass:'theme-arctic', cost:2000, unlockLevel:12,
      colors: [
        { main:'#81d4fa',light:'#b3e5fc',dark:'#0288d1',glow:'rgba(129,212,250,0.4)' },
        { main:'#b39ddb',light:'#d1c4e9',dark:'#512da8',glow:'rgba(179,157,219,0.4)' },
        { main:'#80cbc4',light:'#b2dfdb',dark:'#00897b',glow:'rgba(128,203,196,0.4)' },
        { main:'#ef9a9a',light:'#ffcdd2',dark:'#c62828',glow:'rgba(239,154,154,0.4)' },
        { main:'#fff59d',light:'#fff9c4',dark:'#f9a825',glow:'rgba(255,245,157,0.4)' },
        { main:'#90caf9',light:'#bbdefb',dark:'#1565c0',glow:'rgba(144,202,249,0.4)' },
        { main:'#ce93d8',light:'#e1bee7',dark:'#8e24aa',glow:'rgba(206,147,216,0.4)' },
        { main:'#a5d6a7',light:'#c8e6c9',dark:'#2e7d32',glow:'rgba(165,214,167,0.4)' },
      ],
      preview:['#81d4fa','#b39ddb','#80cbc4','#ef9a9a'],
    },
    volcanic: {
      id:'volcanic', name:'Volcanic', cssClass:'theme-volcanic', cost:2500, unlockLevel:15,
      colors: [
        { main:'#ff6e40',light:'#ff9e80',dark:'#dd2c00',glow:'rgba(255,110,64,0.5)' },
        { main:'#ff3d00',light:'#ff6e40',dark:'#bf360c',glow:'rgba(255,61,0,0.5)' },
        { main:'#ffa726',light:'#ffb74d',dark:'#e65100',glow:'rgba(255,167,38,0.5)' },
        { main:'#d50000',light:'#ff1744',dark:'#b71c1c',glow:'rgba(213,0,0,0.5)' },
        { main:'#ffd600',light:'#ffff00',dark:'#f57f17',glow:'rgba(255,214,0,0.5)' },
        { main:'#ff5722',light:'#ff7043',dark:'#bf360c',glow:'rgba(255,87,34,0.5)' },
        { main:'#e65100',light:'#f57c00',dark:'#bf360c',glow:'rgba(230,81,0,0.5)' },
        { main:'#ff8f00',light:'#ffa000',dark:'#e65100',glow:'rgba(255,143,0,0.5)' },
      ],
      preview:['#ff6e40','#ff3d00','#ffa726','#d50000'],
    },
  };

  // Colorblind-safe palettes
  const COLORBLIND_PALETTES = {
    none: null,
    deuteranopia: [
      { main:'#0077bb',light:'#33bbee',dark:'#004488',glow:'rgba(0,119,187,0.4)' },
      { main:'#ee7733',light:'#ff9955',dark:'#cc5500',glow:'rgba(238,119,51,0.4)' },
      { main:'#009988',light:'#33bbaa',dark:'#006655',glow:'rgba(0,153,136,0.4)' },
      { main:'#ee3377',light:'#ff6699',dark:'#cc0044',glow:'rgba(238,51,119,0.4)' },
      { main:'#bbbbbb',light:'#dddddd',dark:'#888888',glow:'rgba(187,187,187,0.4)' },
      { main:'#cc3311',light:'#ee5533',dark:'#991100',glow:'rgba(204,51,17,0.4)' },
      { main:'#0077bb',light:'#3399dd',dark:'#004488',glow:'rgba(0,119,187,0.4)' },
      { main:'#33bbee',light:'#66ddff',dark:'#0099cc',glow:'rgba(51,187,238,0.4)' },
    ],
    protanopia: [
      { main:'#4477aa',light:'#6699cc',dark:'#224466',glow:'rgba(68,119,170,0.4)' },
      { main:'#ccbb44',light:'#eedd66',dark:'#998800',glow:'rgba(204,187,68,0.4)' },
      { main:'#228833',light:'#44aa55',dark:'#005500',glow:'rgba(34,136,51,0.4)' },
      { main:'#ee6677',light:'#ff8899',dark:'#cc3344',glow:'rgba(238,102,119,0.4)' },
      { main:'#aa3377',light:'#cc5599',dark:'#771144',glow:'rgba(170,51,119,0.4)' },
      { main:'#66ccee',light:'#88eeff',dark:'#3399bb',glow:'rgba(102,204,238,0.4)' },
      { main:'#bbbbbb',light:'#dddddd',dark:'#888888',glow:'rgba(187,187,187,0.4)' },
      { main:'#4477aa',light:'#6699cc',dark:'#224466',glow:'rgba(68,119,170,0.4)' },
    ],
    tritanopia: [
      { main:'#332288',light:'#5544aa',dark:'#110055',glow:'rgba(51,34,136,0.4)' },
      { main:'#88ccee',light:'#aaeeff',dark:'#5599bb',glow:'rgba(136,204,238,0.4)' },
      { main:'#44aa99',light:'#66ccbb',dark:'#228877',glow:'rgba(68,170,153,0.4)' },
      { main:'#ddcc77',light:'#ffee99',dark:'#aa9944',glow:'rgba(221,204,119,0.4)' },
      { main:'#cc6677',light:'#ee8899',dark:'#993344',glow:'rgba(204,102,119,0.4)' },
      { main:'#aa4499',light:'#cc66bb',dark:'#772266',glow:'rgba(170,68,153,0.4)' },
      { main:'#882255',light:'#aa4477',dark:'#550033',glow:'rgba(136,34,85,0.4)' },
      { main:'#117733',light:'#339955',dark:'#005511',glow:'rgba(17,119,51,0.4)' },
    ],
  };

  // Cell patterns for accessibility
  const CELL_PATTERNS = [
    'repeating-linear-gradient(45deg,rgba(255,255,255,0.3) 0,rgba(255,255,255,0.3) 1px,transparent 1px,transparent 3px)',
    'radial-gradient(circle,rgba(255,255,255,0.3) 1px,transparent 1px)',
    'repeating-linear-gradient(0deg,rgba(255,255,255,0.3) 0,rgba(255,255,255,0.3) 1px,transparent 1px,transparent 3px)',
    'repeating-linear-gradient(90deg,rgba(255,255,255,0.3) 0,rgba(255,255,255,0.3) 1px,transparent 1px,transparent 3px)',
    'repeating-linear-gradient(-45deg,rgba(255,255,255,0.3) 0,rgba(255,255,255,0.3) 1px,transparent 1px,transparent 3px)',
    'repeating-conic-gradient(rgba(255,255,255,0.2) 0 25%,transparent 25% 50%)',
    'linear-gradient(45deg,rgba(255,255,255,0.2) 25%,transparent 25%,transparent 75%,rgba(255,255,255,0.2) 75%)',
    'repeating-linear-gradient(135deg,rgba(255,255,255,0.3) 0,rgba(255,255,255,0.3) 2px,transparent 2px,transparent 6px)',
  ];

  // Active theme & color palette
  let activeTheme = 'default';
  let COLOR_PALETTE = [...THEMES.default.colors];
  let COLORS = COLOR_PALETTE.map(c => c.main);

  function applyTheme(themeId) {
    const theme = THEMES[themeId];
    if (!theme) return;
    // Remove all theme classes
    Object.values(THEMES).forEach(t => { if (t.cssClass) document.body.classList.remove(t.cssClass); });
    // Remove seasonal theme classes
    ['theme-halloween','theme-christmas','theme-valentine','theme-spring'].forEach(c => document.body.classList.remove(c));
    if (theme.cssClass) document.body.classList.add(theme.cssClass);
    activeTheme = themeId;
    // Apply colorblind override if active
    const cbMode = settings.colorblindMode || 'none';
    if (cbMode !== 'none' && COLORBLIND_PALETTES[cbMode]) {
      COLOR_PALETTE = [...COLORBLIND_PALETTES[cbMode]];
    } else {
      COLOR_PALETTE = [...theme.colors];
    }
    COLORS = COLOR_PALETTE.map(c => c.main);
    settings.theme = themeId;
    saveSetting();
    // Re-render if board exists
    if (board.length) renderBoard();
    if (pieces.length) renderPieces();
  }

  // ==================================================================
  // SEASONAL EVENTS SYSTEM
  // ==================================================================
  const SEASONAL_EVENTS = [
    {
      id:'halloween', name:'Halloween Haunt', icon:'🎃',
      startMonth:10, startDay:20, endMonth:11, endDay:2,
      themeClass:'theme-halloween',
      challenges:[
        { name:'Pumpkin Smasher', desc:'Clear 10 lines in one game', icon:'🎃', target:10, stat:'lines', bonusXP:200 },
        { name:'Ghost Buster', desc:'Get a 4x combo', icon:'👻', target:4, stat:'combo', bonusXP:300 },
      ],
      decorations:['🎃','👻','🦇','🕸️','💀','🕷️'],
      splashMsg:'🎃 Halloween Event Active!',
    },
    {
      id:'christmas', name:'Holiday Blitz', icon:'🎄',
      startMonth:12, startDay:15, endMonth:1, endDay:3,
      themeClass:'theme-christmas',
      challenges:[
        { name:'Gift Wrapper', desc:'Score 2000 in one game', icon:'🎁', target:2000, stat:'score', bonusXP:250 },
        { name:'Snow Globe', desc:'Clear 15 lines', icon:'❄️', target:15, stat:'lines', bonusXP:350 },
      ],
      decorations:['🎄','⭐','🎁','❄️','☃️','🔔'],
      splashMsg:'🎄 Holiday Blitz Event!',
    },
    {
      id:'valentine', name:"Valentine's Puzzle", icon:'💝',
      startMonth:2, startDay:10, endMonth:2, endDay:16,
      themeClass:'theme-valentine',
      challenges:[
        { name:'Heart Breaker', desc:'Get 3 perfect clears total', icon:'💝', target:3, stat:'perfectClears', bonusXP:400 },
        { name:'Love Combo', desc:'Get a 5x combo', icon:'💕', target:5, stat:'combo', bonusXP:350 },
      ],
      decorations:['💝','💕','❤️','💖','🌹','💗'],
      splashMsg:'💝 Valentine Event!',
    },
    {
      id:'spring', name:'Spring Bloom', icon:'🌸',
      startMonth:3, startDay:15, endMonth:4, endDay:5,
      themeClass:'theme-spring',
      challenges:[
        { name:'Flower Power', desc:'Clear 20 lines total', icon:'🌸', target:20, stat:'lines', bonusXP:200 },
        { name:'Butterfly Effect', desc:'Get a 6x combo', icon:'🦋', target:6, stat:'combo', bonusXP:500 },
      ],
      decorations:['🌸','🌺','🌻','🦋','🌷','🐝'],
      splashMsg:'🌸 Spring Bloom Event!',
    },
  ];

  function getActiveSeasonalEvent() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    for (const event of SEASONAL_EVENTS) {
      let active = false;
      if (event.startMonth <= event.endMonth) {
        active = (month > event.startMonth || (month === event.startMonth && day >= event.startDay)) &&
                 (month < event.endMonth || (month === event.endMonth && day <= event.endDay));
      } else {
        // Crosses year boundary (e.g., Dec-Jan)
        active = (month > event.startMonth || (month === event.startMonth && day >= event.startDay)) ||
                 (month < event.endMonth || (month === event.endMonth && day <= event.endDay));
      }
      if (active) return event;
    }
    return null;
  }

  let activeSeasonalEvent = null;

  function initSeasonalEvent() {
    activeSeasonalEvent = getActiveSeasonalEvent();
    if (!activeSeasonalEvent) return;

    // Show splash message
    const splashSeasonal = document.getElementById('splash-seasonal');
    if (splashSeasonal) {
      splashSeasonal.textContent = activeSeasonalEvent.splashMsg;
      splashSeasonal.style.display = 'block';
    }

    // Apply seasonal theme (only if user hasn't chosen their own)
    if (settings.theme === 'default' && activeSeasonalEvent.themeClass) {
      document.body.classList.add(activeSeasonalEvent.themeClass);
    }

    // Show in-game banner
    const banner = $('seasonal-event-banner');
    const text = $('seasonal-event-text');
    if (banner && text) {
      text.textContent = activeSeasonalEvent.icon + ' ' + activeSeasonalEvent.name + ' — Special Challenges!';
      banner.style.display = 'block';
      banner.addEventListener('click', () => showSeasonalChallenges());
      // Auto-hide after 5 seconds
      setTimeout(() => {
        banner.style.transition = 'opacity 0.5s';
        banner.style.opacity = '0.4';
      }, 5000);
    }

    // Sprinkle seasonal decorations on the board container
    spawnSeasonalDecorations();
  }

  function spawnSeasonalDecorations() {
    if (!activeSeasonalEvent) return;
    const container = boardContainer;
    const decos = activeSeasonalEvent.decorations;
    // Add subtle corner decorations
    const positions = [
      { top:'-8px', left:'-8px' },
      { top:'-8px', right:'-8px' },
      { bottom:'-8px', left:'-8px' },
      { bottom:'-8px', right:'-8px' },
    ];
    positions.forEach((pos, i) => {
      const el = document.createElement('div');
      el.className = 'seasonal-deco';
      el.textContent = decos[i % decos.length];
      Object.assign(el.style, pos);
      el.style.animation = 'iconBounce 3s ease-in-out infinite';
      el.style.animationDelay = (i * 0.4) + 's';
      container.appendChild(el);
    });
  }

  function showSeasonalChallenges() {
    if (!activeSeasonalEvent) return;
    // Reuse the tournament modal to show seasonal info
    const modal = $('tournament-modal');
    const info = $('tournament-info');
    const lb = $('tournament-leaderboard');
    const prizes = $('tournament-prizes');

    info.innerHTML = '<div style="text-align:center;margin-bottom:12px;">' +
      '<div style="font-size:2em;">' + activeSeasonalEvent.icon + '</div>' +
      '<div style="font-size:1.2em;font-weight:800;">' + activeSeasonalEvent.name + '</div>' +
      '<div style="font-size:0.7em;opacity:0.4;">Limited-Time Event Challenges</div></div>';

    lb.innerHTML = activeSeasonalEvent.challenges.map(ch => {
      let current = 0;
      if (ch.stat === 'lines') current = totalLinesCleared;
      else if (ch.stat === 'score') current = score;
      else if (ch.stat === 'combo') current = maxCombo;
      else if (ch.stat === 'perfectClears') current = stats.perfectClears || 0;
      const done = current >= ch.target;
      return '<div class="t-row" style="' + (done ? 'background:rgba(107,203,119,0.06);' : '') + '">' +
        '<div class="t-rank">' + ch.icon + '</div>' +
        '<div class="t-name-col">' + ch.name + '<br><span style="font-size:0.7em;opacity:0.4;">' + ch.desc + '</span></div>' +
        '<div class="t-score-col">' + (done ? '✅' : Math.min(current, ch.target) + '/' + ch.target) + '</div>' +
        '</div>';
    }).join('');

    prizes.innerHTML = '<div style="text-align:center;font-size:0.7em;opacity:0.35;">Complete challenges for bonus XP!</div>';
    modal.querySelector('h3').textContent = '🎪 ' + activeSeasonalEvent.name;
    modal.classList.add('show');
  }

  function checkSeasonalRewards() {
    if (!activeSeasonalEvent) return 0;
    let bonusXP = 0;
    const eventId = activeSeasonalEvent.id;
    if (!stats.seasonalCompleted) stats.seasonalCompleted = {};
    if (!stats.seasonalCompleted[eventId]) stats.seasonalCompleted[eventId] = [];

    for (const ch of activeSeasonalEvent.challenges) {
      if (stats.seasonalCompleted[eventId].includes(ch.name)) continue;
      let current = 0;
      if (ch.stat === 'lines') current = stats.lifetimeLines;
      else if (ch.stat === 'score') current = stats.bestScore;
      else if (ch.stat === 'combo') current = stats.maxCombo;
      else if (ch.stat === 'perfectClears') current = stats.perfectClears || 0;
      if (current >= ch.target) {
        stats.seasonalCompleted[eventId].push(ch.name);
        bonusXP += ch.bonusXP;
      }
    }
    saveStats();
    return bonusXP;
  }

  // ==================================================================
  // POWER-UPS SYSTEM
  // ==================================================================
  const POWERUP_DEFS = {
    bomb: { name:'Bomb', icon:'💣', desc:'Destroy a 3×3 area', earnCombo:4, earnMilestone:'combo_3' },
    colorBomb: { name:'Color Bomb', icon:'🌈', desc:'Remove all blocks of one color', earnCombo:6, earnMilestone:'combo_4' },
    rowClear: { name:'Row Clear', icon:'➡️', desc:'Clear any row instantly', earnCombo:3, earnMilestone:null },
    colClear: { name:'Column Clear', icon:'⬇️', desc:'Clear any column instantly', earnCombo:5, earnMilestone:null },
  };

  let powerups = safeGetJSON('bsPowerups', {});
  if (!powerups.bomb) powerups = { bomb:0, colorBomb:0, rowClear:0, colClear:0 };
  let activePowerup = null; // current powerup being targeted

  function savePowerups() { safeSet('bsPowerups', powerups); }

  function awardPowerup(type) {
    powerups[type] = (powerups[type] || 0) + 1;
    savePowerups();
    updatePowerupUI();
    // Show popup
    const def = POWERUP_DEFS[type];
    const el = document.createElement('div');
    el.className = 'powerup-popup';
    el.textContent = def.icon + ' +1 ' + def.name + '!';
    el.style.color = '#ffd93d';
    boardContainer.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  function updatePowerupUI() {
    for (const [type, def] of Object.entries(POWERUP_DEFS)) {
      const btn = $('pu-' + type);
      const countEl = $('pu-' + type + '-count');
      if (!btn || !countEl) continue;
      const count = powerups[type] || 0;
      countEl.textContent = count;
      btn.classList.toggle('disabled', count <= 0 || !gameActive);
      btn.classList.toggle('ready', count > 0 && gameActive);
    }
  }

  function activatePowerup(type) {
    if (!gameActive || (powerups[type] || 0) <= 0) return;
    if (activePowerup === type) { deactivatePowerup(); return; }
    deactivatePowerup();
    activePowerup = type;

    if (type === 'bomb') {
      // Enter bomb targeting mode
      boardEl.style.cursor = 'crosshair';
      showPowerupPopupBrief(POWERUP_DEFS[type].icon + ' Tap a cell!');
    } else if (type === 'colorBomb') {
      // Enter color bomb mode — tap a filled cell to remove all of that color
      boardEl.style.cursor = 'crosshair';
      showPowerupPopupBrief(POWERUP_DEFS[type].icon + ' Tap a color!');
    } else if (type === 'rowClear') {
      boardEl.style.cursor = 'crosshair';
      showPowerupPopupBrief(POWERUP_DEFS[type].icon + ' Tap a row!');
    } else if (type === 'colClear') {
      boardEl.style.cursor = 'crosshair';
      showPowerupPopupBrief(POWERUP_DEFS[type].icon + ' Tap a column!');
    }
  }

  function showPowerupPopupBrief(text) {
    const el = document.createElement('div');
    el.className = 'powerup-popup';
    el.textContent = text;
    el.style.color = '#ffd93d';
    boardContainer.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  function deactivatePowerup() {
    activePowerup = null;
    boardEl.style.cursor = '';
    // Remove targeting highlights
    const cells = boardEl.children;
    for (let i = 0; i < cells.length; i++) {
      cells[i].classList.remove('bomb-target', 'bomb-area');
    }
  }

  function handleBoardClick(e) {
    if (!activePowerup) return;
    const cell = e.target.closest('.cell');
    if (!cell) return;
    const r = parseInt(cell.dataset.r);
    const c = parseInt(cell.dataset.c);

    if (activePowerup === 'bomb') {
      executeBomb(r, c);
    } else if (activePowerup === 'colorBomb') {
      executeColorBomb(r, c);
    } else if (activePowerup === 'rowClear') {
      executeRowClear(r);
    } else if (activePowerup === 'colClear') {
      executeColClear(c);
    }
  }

  function executeBomb(centerR, centerC) {
    powerups.bomb--;
    savePowerups();
    sfxClear(3);
    vibrate(40);
    screenShake(2);
    stats.powerupsUsed = (stats.powerupsUsed || 0) + 1;
    sessionAnalytics.powerupsUsed++;
    saveStats();

    const cells = boardEl.children;
    let cleared = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = centerR + dr, nc = centerC + dc;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc]) {
          spawnClearParticles(cells[nr * BOARD_SIZE + nc], board[nr][nc]);
          cells[nr * BOARD_SIZE + nc].classList.add('clearing');
          board[nr][nc] = 0;
          cleared++;
        }
      }
    }
    setTimeout(() => { renderBoard(); }, 450);
    if (cleared > 0) addScore(cleared * 15);
    if (isBoardEmpty()) handlePerfectClear();
    deactivatePowerup();
    updatePowerupUI();
    saveGameState();
    // Check for game over after power-up
    setTimeout(() => { if (gameActive && !canAnyPieceFit()) gameOver(); }, 500);
  }

  function executeColorBomb(r, c) {
    const color = board[r][c];
    if (!color) { deactivatePowerup(); return; }
    powerups.colorBomb--;
    savePowerups();
    sfxPerfectClear();
    vibrate(60);
    screenShake(2);
    stats.powerupsUsed = (stats.powerupsUsed || 0) + 1;
    sessionAnalytics.powerupsUsed++;
    saveStats();

    const cells = boardEl.children;
    let cleared = 0;
    for (let br = 0; br < BOARD_SIZE; br++) {
      for (let bc = 0; bc < BOARD_SIZE; bc++) {
        if (board[br][bc] === color) {
          spawnClearParticles(cells[br * BOARD_SIZE + bc], color);
          cells[br * BOARD_SIZE + bc].classList.add('clearing');
          board[br][bc] = 0;
          cleared++;
        }
      }
    }
    setTimeout(() => { renderBoard(); }, 450);
    if (cleared > 0) addScore(cleared * 10);
    if (isBoardEmpty()) handlePerfectClear();
    deactivatePowerup();
    updatePowerupUI();
    saveGameState();
    // Check for game over after power-up
    setTimeout(() => { if (gameActive && !canAnyPieceFit()) gameOver(); }, 500);
  }

  function executeRowClear(r) {
    powerups.rowClear--;
    savePowerups();
    sfxClear(1);
    vibrate(30);
    screenShake(1);
    stats.powerupsUsed = (stats.powerupsUsed || 0) + 1;
    sessionAnalytics.powerupsUsed++;
    saveStats();

    const cells = boardEl.children;
    let cleared = 0;
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c]) {
        spawnClearParticles(cells[r * BOARD_SIZE + c], board[r][c]);
        cells[r * BOARD_SIZE + c].classList.add('clearing');
        cleared++;
      }
      board[r][c] = 0;
    }
    setTimeout(() => { renderBoard(); }, 450);
    if (cleared > 0) addScore(cleared * 12);
    if (isBoardEmpty()) handlePerfectClear();
    deactivatePowerup();
    updatePowerupUI();
    saveGameState();
    setTimeout(() => { if (gameActive && !canAnyPieceFit()) gameOver(); }, 500);
  }

  function executeColClear(c) {
    powerups.colClear--;
    savePowerups();
    sfxClear(1);
    vibrate(30);
    screenShake(1);
    stats.powerupsUsed = (stats.powerupsUsed || 0) + 1;
    sessionAnalytics.powerupsUsed++;
    saveStats();

    const cells = boardEl.children;
    let cleared = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (board[r][c]) {
        spawnClearParticles(cells[r * BOARD_SIZE + c], board[r][c]);
        cells[r * BOARD_SIZE + c].classList.add('clearing');
        cleared++;
      }
      board[r][c] = 0;
    }
    setTimeout(() => { renderBoard(); }, 450);
    if (cleared > 0) addScore(cleared * 12);
    if (isBoardEmpty()) handlePerfectClear();
    deactivatePowerup();
    updatePowerupUI();
    saveGameState();
    setTimeout(() => { if (gameActive && !canAnyPieceFit()) gameOver(); }, 500);
  }

  // Check if combo should award powerups
  function checkComboRewards(comboN) {
    if (comboN === 3) awardPowerup('rowClear');
    if (comboN === 4) awardPowerup('bomb');
    if (comboN === 5) awardPowerup('colClear');
    if (comboN >= 6) awardPowerup('colorBomb');
  }

  // ==================================================================
  // WEEKLY TOURNAMENT SYSTEM
  // ==================================================================
  function getWeekNumber() {
    const now = new Date();
    const onejan = new Date(now.getFullYear(), 0, 1);
    return Math.ceil(((now - onejan) / 86400000 + onejan.getDay() + 1) / 7);
  }

  function getWeekKey() { return new Date().getFullYear() + '-W' + getWeekNumber(); }

  function getWeekEndDate() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilSunday = (7 - dayOfWeek) % 7 || 7;
    const end = new Date(now);
    end.setDate(end.getDate() + daysUntilSunday);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  function getTimeUntilWeekEnd() {
    const end = getWeekEndDate();
    const diff = end - new Date();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    return days + 'd ' + hours + 'h left';
  }

  let tournament = safeGetJSON('bsTournament', {});
  if (!tournament.weekKey || tournament.weekKey !== getWeekKey()) {
    tournament = { weekKey: getWeekKey(), bestScore: 0, entries: 0 };
  }

  function saveTournament() { safeSet('bsTournament', tournament); }

  function submitTournamentScore(score) {
    if (score > tournament.bestScore) {
      tournament.bestScore = score;
      tournament.entries++;
      saveTournament();
    }
    // Submit to server
    fetch('/api/tournament', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ week: getWeekKey(), name: 'Player', score })
    }).catch(() => {});
  }

  function showTournamentModal() {
    const modal = $('tournament-modal');
    const info = $('tournament-info');
    const lb = $('tournament-leaderboard');
    const prizes = $('tournament-prizes');

    modal.querySelector('h3').textContent = '🏟️ Weekly Tournament';
    info.innerHTML = '<div style="text-align:center;margin-bottom:8px;">' +
      '<div style="font-size:0.8em;font-weight:700;">Week ' + getWeekNumber() + '</div>' +
      '<div style="font-size:0.65em;opacity:0.4;">' + getTimeUntilWeekEnd() + '</div>' +
      '<div style="font-size:0.9em;font-weight:800;color:var(--accent-gold);margin-top:4px;">Your Best: ' +
      (tournament.bestScore || 0).toLocaleString() + '</div>' +
      '<div style="font-size:0.6em;opacity:0.3;margin-top:2px;">Entries: ' + (tournament.entries || 0) + '</div></div>';

    // Fetch tournament leaderboard
    fetch('/api/tournament?week=' + getWeekKey()).then(r => r.json()).then(scores => {
      if (!scores.length) {
        lb.innerHTML = '<div style="text-align:center;opacity:0.35;padding:15px;">Be the first to compete this week!</div>';
      } else {
        const medals = ['🥇','🥈','🥉'];
        lb.innerHTML = scores.slice(0, 15).map((s, i) => {
          const prefix = i < 3 ? medals[i] : '<span style="opacity:0.35;">' + (i+1) + '.</span>';
          return '<div class="t-row">' +
            '<div class="t-rank">' + prefix + '</div>' +
            '<div class="t-name-col">' + s.name + '</div>' +
            '<div class="t-score-col">' + s.score.toLocaleString() + '</div></div>';
        }).join('');
      }
    }).catch(() => {
      lb.innerHTML = '<div style="text-align:center;opacity:0.35;padding:15px;">Tournament data unavailable offline</div>';
    });

    prizes.innerHTML = [
      { icon:'🥇', name:'1st — 500 XP + Neon Theme' },
      { icon:'🥈', name:'2nd — 300 XP' },
      { icon:'🥉', name:'3rd — 150 XP' },
    ].map(p => '<div class="tournament-prize"><div class="tp-icon">' + p.icon + '</div><div class="tp-name">' + p.name + '</div></div>').join('');

    modal.classList.add('show');
  }

  let tournamentTimerInterval = null;
  let tournamentBarInitialized = false;

  function initTournamentQuickBar() {
    const bar = $('tournament-quick-bar');
    if (!bar) return;
    bar.style.display = '';
    $('tq-name').textContent = 'Week ' + getWeekNumber() + ' Tournament';
    $('tq-desc').textContent = tournament.bestScore > 0
      ? 'Your best: ' + tournament.bestScore.toLocaleString()
      : 'Compete for XP & prizes!';
    $('tq-timer').textContent = getTimeUntilWeekEnd();

    // Only add the click listener once
    if (!tournamentBarInitialized) {
      bar.addEventListener('click', showTournamentModal);
      tournamentBarInitialized = true;
    }

    // Update timer every minute (clear previous interval to prevent leaks)
    if (tournamentTimerInterval) clearInterval(tournamentTimerInterval);
    tournamentTimerInterval = setInterval(() => {
      const timer = $('tq-timer');
      if (timer) timer.textContent = getTimeUntilWeekEnd();
    }, 60000);
  }

  // ==================================================================
  // SMART RATE/REVIEW SYSTEM
  // ==================================================================
  let rateState = safeGetJSON('bsRateState', {});
  if (!rateState.rating) rateState = { rating: 0, dismissed: false, neverAsk: false, promptCount: 0, lastPrompt: null };

  function saveRateState() { safeSet('bsRateState', rateState); }

  function shouldShowRatePrompt() {
    if (rateState.neverAsk || rateState.rating > 0) return false;
    if (rateState.dismissed && rateState.promptCount >= 3) return false;
    // Only prompt after good games
    if (stats.lifetimeGames < 3) return false;
    if (score < stats.bestScore * 0.7 && score < 500) return false;
    // Don't prompt too often
    if (rateState.lastPrompt) {
      const daysSincePrompt = (Date.now() - rateState.lastPrompt) / 86400000;
      if (daysSincePrompt < 3) return false;
    }
    // Smart conditions: after a new record, high combo, or milestone
    if (isNewRecord) return true;
    if (maxCombo >= 3) return true;
    if (score > 1000) return true;
    // After completing a daily challenge
    if (stats.dailyChallengeComplete) return true;
    // After a perfect clear
    if (stats.perfectClears > 0 && score > 800) return true;
    // After every 5th game
    return stats.lifetimeGames % 5 === 0;
  }

  function showRatePrompt() {
    rateState.promptCount++;
    rateState.lastPrompt = Date.now();
    saveRateState();
    const modal = $('rate-modal');
    modal.classList.add('show');

    // Star interaction — use onclick to avoid accumulating listeners
    const stars = document.querySelectorAll('#rate-stars .rate-star');
    let selectedRating = 0;
    stars.forEach(star => {
      star.onclick = () => {
        selectedRating = parseInt(star.dataset.star);
        stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.star) <= selectedRating));
        // Show feedback box for low ratings
        $('rate-feedback').style.display = selectedRating <= 3 ? 'block' : 'none';
      };
    });

    $('btn-rate-submit').onclick = () => {
      rateState.rating = selectedRating;
      saveRateState();
      modal.classList.remove('show');
      if (selectedRating >= 4) {
        // Redirect to app store
        if (window.Capacitor && window.Capacitor.Plugins) {
          // Try native in-app review first (iOS App Store / Google Play)
          try {
            if (window.Capacitor.Plugins.InAppReview) {
              window.Capacitor.Plugins.InAppReview.requestReview();
            } else {
              // Fallback to store URL
              const isIOS = window.Capacitor.getPlatform && window.Capacitor.getPlatform() === 'ios';
              const url = isIOS
                ? 'https://apps.apple.com/app/id1234567890?action=write-review'
                : 'market://details?id=com.blocksmash.puzzle';
              window.Capacitor.Plugins.App.openUrl({ url });
            }
          } catch(e) {}
        }
        // Bonus XP for rating
        addXP(100);
        showScoreFloat('+100 XP ⭐');
      } else if (selectedRating > 0 && selectedRating <= 3) {
        // Low rating — collect feedback silently
        const feedback = $('rate-feedback-text').value;
        if (feedback) {
          // Store locally for potential future submission
          safeSet('bsFeedback', {
            rating: selectedRating, feedback, date: new Date().toISOString()
          });
        }
        // Still give some XP for engaging
        addXP(25);
        showScoreFloat('+25 XP for feedback');
      }
    };

    $('btn-rate-later').onclick = () => {
      rateState.dismissed = true;
      saveRateState();
      modal.classList.remove('show');
    };

    $('btn-rate-never').onclick = () => {
      rateState.neverAsk = true;
      saveRateState();
      modal.classList.remove('show');
    };
  }

  // ==================================================================
  // SOCIAL / FRIEND CHALLENGE SYSTEM
  // ==================================================================
  function showChallengeModal() {
    const modal = $('challenge-modal');
    const displayScore = score > 0 ? score : lastGameScore;
    $('challenge-score').textContent = displayScore.toLocaleString() + ' pts';
    // Show challenge history
    showChallengeHistory();
    modal.classList.add('show');
  }

  function getChallengeText() {
    const displayScore = score > 0 ? score : lastGameScore;
    return '🧩 I challenge you! I scored ' + displayScore.toLocaleString() +
      ' on Block Smash Puzzle. Think you can beat me? 🔥\n\n' +
      '📲 Play now: ' + window.location.href;
  }

  function sendChallenge() {
    const text = getChallengeText();
    if (navigator.share) {
      navigator.share({ title: 'Block Smash Challenge!', text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => alert('Challenge copied to clipboard! Share it with your friends.'));
    }
    // Track challenge sent
    saveChallengeEvent('sent', score);
    $('challenge-modal').classList.remove('show');
  }

  // Platform-specific share helpers (exposed globally for inline onclick)
  window.shareToTwitter = function() {
    const displayScore = score > 0 ? score : lastGameScore;
    const text = encodeURIComponent('🧩 I scored ' + displayScore.toLocaleString() + ' on Block Smash Puzzle! Can you beat me? 🔥 #BlockSmash');
    const url = encodeURIComponent(window.location.href);
    window.open('https://twitter.com/intent/tweet?text=' + text + '&url=' + url, '_blank');
    saveChallengeEvent('twitter', displayScore);
  };

  window.shareToWhatsApp = function() {
    const text = encodeURIComponent(getChallengeText());
    window.open('https://wa.me/?text=' + text, '_blank');
    const displayScore = score > 0 ? score : lastGameScore;
    saveChallengeEvent('whatsapp', displayScore);
  };

  window.copyChallenge = function() {
    const text = getChallengeText();
    navigator.clipboard.writeText(text).then(() => {
      const btn = $('btn-copy-challenge');
      if (btn) {
        btn.classList.add('copied');
        btn.textContent = '✅ Copied!';
        setTimeout(() => { btn.classList.remove('copied'); btn.textContent = '📋 Copy Link'; }, 2000);
      }
    });
    const displayScore = score > 0 ? score : lastGameScore;
    saveChallengeEvent('copy', displayScore);
  };

  // Challenge history tracking
  function saveChallengeEvent(type, challengeScore) {
    let history = safeGetJSON('bsChallengeHistory', []);
    history.unshift({ type, score: challengeScore, date: new Date().toISOString() });
    history = history.slice(0, 20);
    safeSet('bsChallengeHistory', history);
  }

  function showChallengeHistory() {
    const container = $('challenge-history');
    if (!container) return;
    const history = safeGetJSON('bsChallengeHistory', []);
    if (history.length === 0) {
      container.innerHTML = '<div style="font-size:0.65em;opacity:0.2;text-align:center;padding:8px;">No challenges sent yet</div>';
      return;
    }
    container.innerHTML = '<div style="font-size:0.65em;opacity:0.35;margin-bottom:6px;">Recent Challenges:</div>' +
      history.slice(0, 5).map(h => {
        const icons = { sent:'🔗', twitter:'🐦', whatsapp:'💬', copy:'📋' };
        const ago = getTimeAgo(new Date(h.date));
        return '<div style="display:flex;align-items:center;gap:6px;padding:4px 0;font-size:0.7em;opacity:0.4;">' +
          '<span>' + (icons[h.type] || '🔗') + '</span>' +
          '<span style="flex:1">' + h.score.toLocaleString() + ' pts</span>' +
          '<span style="font-size:0.85em;opacity:0.5;">' + ago + '</span></div>';
      }).join('');
  }

  function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
    return Math.floor(seconds / 86400) + 'd ago';
  }

  // ==================================================================
  // SMART ANALYTICS — Session tracking & insights
  // ==================================================================
  let sessionAnalytics = {
    startTime: Date.now(),
    piecesPlaced: 0,
    linesCleared: 0,
    combos: [],
    powerupsUsed: 0,
    avgPlacementTime: 0,
    placementTimes: [],
    lastPlacementTime: Date.now(),
  };

  function resetSessionAnalytics() {
    sessionAnalytics = {
      startTime: Date.now(),
      piecesPlaced: 0,
      linesCleared: 0,
      combos: [],
      powerupsUsed: 0,
      placementTimes: [],
      lastPlacementTime: Date.now(),
    };
  }

  function trackPlacement() {
    const now = Date.now();
    const elapsed = now - sessionAnalytics.lastPlacementTime;
    if (elapsed > 500 && elapsed < 60000) { // reasonable range
      sessionAnalytics.placementTimes.push(elapsed);
    }
    sessionAnalytics.lastPlacementTime = now;
    sessionAnalytics.piecesPlaced++;
  }

  function trackCombo(n) {
    sessionAnalytics.combos.push(n);
  }

  function getSessionInsights() {
    const duration = Math.round((Date.now() - sessionAnalytics.startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const avgTime = sessionAnalytics.placementTimes.length > 0
      ? Math.round(sessionAnalytics.placementTimes.reduce((a,b) => a+b, 0) / sessionAnalytics.placementTimes.length / 1000 * 10) / 10
      : 0;
    const maxComboSession = sessionAnalytics.combos.length > 0 ? Math.max(...sessionAnalytics.combos) : 0;
    const ppm = minutes > 0 ? Math.round(sessionAnalytics.piecesPlaced / minutes * 10) / 10 : sessionAnalytics.piecesPlaced;

    const insights = [];
    insights.push('⏱️ Session: ' + minutes + 'm ' + seconds + 's');
    if (avgTime > 0) insights.push('⚡ Avg move: ' + avgTime + 's');
    insights.push('🧩 Pieces/min: ' + ppm);
    if (maxComboSession >= 3) insights.push('🔥 Best combo: ' + maxComboSession + 'x');

    // Performance compared to history
    if (stats.lifetimeGames > 2) {
      const avgScore = Math.round(stats.lifetimeScore / stats.lifetimeGames);
      if (score > avgScore * 1.2) insights.push('📈 ' + Math.round((score / avgScore - 1) * 100) + '% above your average!');
      else if (score < avgScore * 0.8) insights.push('💪 You usually score ' + avgScore + '. Keep trying!');
    }

    return insights;
  }

  function showAnalyticsInsights() {
    const container = $('analytics-insights');
    if (!container) return;

    // Historical analytics
    const gamesPlayed = stats.lifetimeGames;
    const avgScore = gamesPlayed > 0 ? Math.round(stats.lifetimeScore / gamesPlayed) : 0;
    const avgLines = gamesPlayed > 0 ? Math.round(stats.lifetimeLines / gamesPlayed * 10) / 10 : 0;

    let html = '<h3 style="margin-top:16px;">📈 Performance Insights</h3>';

    if (gamesPlayed >= 3) {
      // Score trend analysis (compare recent games to overall)
      const recentGames = safeGetJSON('bsRecentScores', []);
      let trendHtml = '';
      if (recentGames.length >= 3) {
        const recentAvg = Math.round(recentGames.slice(0, 5).reduce((a, b) => a + b, 0) / Math.min(recentGames.length, 5));
        const trendPct = avgScore > 0 ? Math.round((recentAvg / avgScore - 1) * 100) : 0;
        const trendClass = trendPct > 5 ? 'up' : (trendPct < -5 ? 'down' : 'neutral');
        const trendIcon = trendPct > 5 ? '📈' : (trendPct < -5 ? '📉' : '➡️');
        trendHtml = '<span class="trend-badge ' + trendClass + '">' + trendIcon + ' ' + (trendPct > 0 ? '+' : '') + trendPct + '%</span>';
      }

      html += '<div class="insights-row"><div class="insight-card"><div class="insight-icon">📊</div>' +
        '<div class="insight-text">Avg Score: <strong>' + avgScore.toLocaleString() + '</strong>' + trendHtml + '<br>Avg Lines: <strong>' + avgLines + '</strong>/game</div></div>';

      // Efficiency metric
      const avgPieces = gamesPlayed > 0 ? Math.round(stats.lifetimePieces / gamesPlayed) : 0;
      const efficiency = avgPieces > 0 ? Math.round(avgScore / avgPieces * 10) / 10 : 0;
      html += '<div class="insight-card"><div class="insight-icon">⚡</div>' +
        '<div class="insight-text">Points/Piece: <strong>' + efficiency + '</strong><br>Avg Pieces: <strong>' + avgPieces + '</strong>/game</div></div></div>';
    }

    if (stats.longestStreak >= 3) {
      html += '<div class="insight-card"><div class="insight-icon">🔥</div>' +
        '<div class="insight-text">Best streak: <strong>' + stats.longestStreak + ' days</strong>! ' +
        (stats.currentStreak > 0 ? 'Current: <strong>' + stats.currentStreak + ' days</strong>' : 'Start a new streak!') + '</div></div>';
    }

    if (stats.maxCombo >= 4) {
      html += '<div class="insight-card"><div class="insight-icon">💥</div>' +
        '<div class="insight-text">Best combo: <strong>' + stats.maxCombo + 'x</strong>! ' +
        (stats.maxCombo >= 6 ? 'Godlike level!' : 'Keep chaining clears!') + '</div></div>';
    }

    // Pieces per game
    if (gamesPlayed > 0) {
      const ppg = Math.round(stats.lifetimePieces / gamesPlayed);
      html += '<div class="insight-card"><div class="insight-icon">🧩</div>' +
        '<div class="insight-text">Avg <strong>' + ppg + ' pieces</strong>/game · Total: <strong>' +
        stats.lifetimePieces.toLocaleString() + '</strong></div></div>';
    }

    // Power-up usage
    if ((stats.powerupsUsed || 0) > 0) {
      html += '<div class="insight-card"><div class="insight-icon">💣</div>' +
        '<div class="insight-text">Power-ups used: <strong>' + stats.powerupsUsed + '</strong>' +
        (stats.powerupsUsed >= 10 ? ' — Power Player!' : '') + '</div></div>';
    }

    // Seasonal progress
    if (activeSeasonalEvent && stats.seasonalCompleted && stats.seasonalCompleted[activeSeasonalEvent.id]) {
      const completed = stats.seasonalCompleted[activeSeasonalEvent.id].length;
      const total = activeSeasonalEvent.challenges.length;
      html += '<div class="insight-card"><div class="insight-icon">' + activeSeasonalEvent.icon + '</div>' +
        '<div class="insight-text">' + activeSeasonalEvent.name + ': <strong>' + completed + '/' + total + '</strong> challenges done</div></div>';
    }

    container.innerHTML = html;
  }

  // ==================================================================
  // ACCESSIBILITY SYSTEM
  // ==================================================================
  function applyAccessibilitySettings() {
    // High contrast
    document.body.classList.toggle('a11y-high-contrast', !!settings.highContrast);

    // Colorblind mode
    const cbMode = settings.colorblindMode || 'none';
    ['a11y-deuteranopia','a11y-protanopia','a11y-tritanopia'].forEach(c => document.body.classList.remove(c));
    if (cbMode !== 'none') {
      document.body.classList.add('a11y-' + cbMode);
      if (COLORBLIND_PALETTES[cbMode]) {
        COLOR_PALETTE = [...COLORBLIND_PALETTES[cbMode]];
        COLORS = COLOR_PALETTE.map(c => c.main);
      }
    } else {
      // Re-apply theme colors
      const theme = THEMES[activeTheme] || THEMES.default;
      COLOR_PALETTE = [...theme.colors];
      COLORS = COLOR_PALETTE.map(c => c.main);
    }

    // Block patterns
    // Handled in renderBoard

    // Large text
    document.body.style.fontSize = settings.largeText ? '18px' : '';
  }

  // ---- LEVEL / PROGRESSION CONFIG ----
  const LEVEL_THRESHOLDS = [0];
  for (let i = 1; i <= 100; i++) LEVEL_THRESHOLDS.push(Math.floor(150 * Math.pow(1.18, i)));
  const LEVEL_TITLES = [
    'Rookie','Rookie','Beginner','Beginner','Learner','Learner',
    'Player','Player','Skilled','Skilled','Expert','Expert',
    'Pro','Pro','Master','Master','Champion','Champion','Legend','Legend',
    'Grandmaster'
  ];
  function getLevelTitle(lvl) { return LEVEL_TITLES[Math.min(lvl, LEVEL_TITLES.length - 1)]; }

  // Level-up rewards (themes, powerups)
  const LEVEL_REWARDS = {
    3: { type:'theme', id:'ocean', msg:'🌊 Ocean Theme Unlocked!' },
    5: { type:'theme', id:'sunset', msg:'🌅 Sunset Theme Unlocked!' },
    6: { type:'powerup', pu:'bomb', count:2, msg:'💣 2 Bombs Earned!' },
    8: { type:'theme', id:'neon', msg:'💜 Neon Theme Unlocked!' },
    10: { type:'theme', id:'candy', msg:'🍬 Candy Theme Unlocked!' },
    12: { type:'theme', id:'arctic', msg:'❄️ Arctic Theme Unlocked!' },
    15: { type:'theme', id:'volcanic', msg:'🌋 Volcanic Theme Unlocked!' },
    20: { type:'powerup', pu:'colorBomb', count:3, msg:'🌈 3 Color Bombs!' },
  };

  // ---- MILESTONE DEFINITIONS ----
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
    { id:'perfect_clear', name:'Perfectionist', desc:'Clear the entire board', icon:'✨', check: s => s.perfectClears >= 1 },
    { id:'perfect_3', name:'Spotless', desc:'Get 3 perfect clears', icon:'💫', check: s => s.perfectClears >= 3 },
    { id:'powerup_5', name:'Power Player', desc:'Use 5 power-ups', icon:'💣', check: s => s.powerupsUsed >= 5 },
    { id:'games_50', name:'Veteran', desc:'Play 50 games', icon:'🎖️', check: s => s.gamesPlayed >= 50 },
    { id:'lines_500', name:'Line Master', desc:'Clear 500 lines total', icon:'⚜️', check: s => s.lifetimeLines >= 500 },
    { id:'score_10000', name:'Legendary', desc:'Score 10,000 in one game', icon:'👑', check: s => s.bestScore >= 10000 },
    { id:'streak_14', name:'Fortnight Hero', desc:'Play 14 days straight', icon:'🏅', check: s => s.longestStreak >= 14 },
    { id:'tournament_win', name:'Champion', desc:'Win a weekly tournament', icon:'🏟️', check: s => s.tournamentWins >= 1 },
  ];

  // ---- DAILY CHALLENGE ----
  function getDailyChallenge() {
    const today = new Date().toDateString();
    let seed = 0;
    for (let i = 0; i < today.length; i++) seed = ((seed << 5) - seed + today.charCodeAt(i)) | 0;
    seed = Math.abs(seed);
    const challenges = [
      { name:'Line Blitz', desc:'Clear 5 lines in one game', icon:'⚡', target:5, stat:'lines' },
      { name:'Score Rush', desc:'Score 800 points', icon:'🎯', target:800, stat:'score' },
      { name:'Combo King', desc:'Get a 3x combo', icon:'🔥', target:3, stat:'combo' },
      { name:'Line Mania', desc:'Clear 8 lines in one game', icon:'💥', target:8, stat:'lines' },
      { name:'High Roller', desc:'Score 1,500 points', icon:'💰', target:1500, stat:'score' },
      { name:'Combo Master', desc:'Get a 4x combo', icon:'👑', target:4, stat:'combo' },
      { name:'Marathon', desc:'Clear 12 lines in one game', icon:'🏃', target:12, stat:'lines' },
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

  // ---- SETTINGS ----
  const defaults = {
    soundOn:true, vibrationOn:true, musicOn:false,
    theme:'default', highContrast:false, colorblindMode:'none',
    patterns:false, largeText:false,
    reducedMotion: window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
  let settings = { ...defaults, ...safeGetJSON('bsSettings', {}) };
  function saveSetting() { safeSet('bsSettings', settings); }

  // ---- STATE ----
  let board = [];
  let pieces = [];
  let score = 0;
  let bestScore = parseInt(safeGet('blockSmashBest', '0'));
  let combo = 0;
  let maxCombo = 0;
  let totalLinesCleared = 0;
  let gamesPlayed = parseInt(safeGet('bsGamesPlayed', '0'));
  let draggingIdx = -1;
  let gameActive = true;
  let isNewRecord = false;
  let lastGameScore = 0; // Preserved for share/challenge after restart
  let undoState = null;
  let undoAvailable = false;
  let hasShownTutorial = safeGet('bsTutorialShown', '0') === '1';

  // ---- PERSISTENT STATS ----
  let stats = safeGetJSON('bsStats', null) || {
    lifetimeScore:0, lifetimeLines:0, lifetimeGames:0, lifetimePieces:0,
    bestScore:0, maxCombo:0, xp:0, level:1,
    unlockedMilestones:[], currentStreak:0, longestStreak:0,
    lastPlayDate:null, dailyChallengeDate:null,
    dailyChallengeComplete:false, dailyChallengesCompleted:0,
    perfectClears:0, powerupsUsed:0, tournamentWins:0,
    unlockedThemes:['default'],
    seasonalCompleted:{},
  };
  // Ensure new fields
  if (!stats.unlockedThemes) stats.unlockedThemes = ['default'];
  if (!stats.powerupsUsed) stats.powerupsUsed = 0;
  if (!stats.tournamentWins) stats.tournamentWins = 0;
  if (!stats.seasonalCompleted) stats.seasonalCompleted = {};
  function saveStats() { safeSet('bsStats', stats); }

  // ---- STREAK TRACKER ----
  function updateStreak() {
    const today = new Date().toDateString();
    if (stats.lastPlayDate === today) return;
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
  const bgCanvas = $('bg-canvas');
  const fxCanvas = $('fx-canvas');

  // ==================================================================
  // AMBIENT BACKGROUND
  // ==================================================================
  const bgCtx = bgCanvas.getContext('2d');
  let bgW, bgH, bgAnimId;
  const bgOrbs = [];

  function initBgCanvas() {
    // Render BG at reduced resolution to save GPU tile memory on Android
    // Tablets get lower scale since the orbs are just blurry ambient effects
    const w = window.innerWidth;
    const scale = w > 1200 ? 0.25 : w > 768 ? 0.4 : 0.6;
    bgW = bgCanvas.width = Math.round(w * scale);
    bgH = bgCanvas.height = Math.round(window.innerHeight * scale);
    bgCanvas.style.width = '100%';
    bgCanvas.style.height = '100%';
    bgOrbs.length = 0;
    const orbCount = Math.min(6, Math.floor(bgW * bgH / 120000));
    for (let i = 0; i < orbCount; i++) {
      bgOrbs.push({
        x: Math.random() * bgW, y: Math.random() * bgH,
        r: 80 + Math.random() * 160,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        hue: Math.random() * 360, alpha: 0.04 + Math.random() * 0.04,
      });
    }
  }

  function renderBg() {
    bgCtx.clearRect(0, 0, bgW, bgH);
    for (const orb of bgOrbs) {
      orb.x += orb.vx; orb.y += orb.vy;
      if (orb.x < -orb.r) orb.x = bgW + orb.r;
      if (orb.x > bgW + orb.r) orb.x = -orb.r;
      if (orb.y < -orb.r) orb.y = bgH + orb.r;
      if (orb.y > bgH + orb.r) orb.y = -orb.r;
      orb.hue = (orb.hue + 0.05) % 360;
      const grad = bgCtx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
      grad.addColorStop(0, 'hsla(' + orb.hue + ',70%,50%,' + orb.alpha + ')');
      grad.addColorStop(1, 'transparent');
      bgCtx.fillStyle = grad;
      bgCtx.fillRect(orb.x - orb.r, orb.y - orb.r, orb.r * 2, orb.r * 2);
    }
    bgAnimId = requestAnimationFrame(renderBg);
  }

  // ==================================================================
  // PARTICLE FX ENGINE
  // ==================================================================
  const fxCtx = fxCanvas.getContext('2d');
  let fxW, fxH;
  const particles = [];
  let fxAnimRunning = false;

  function initFxCanvas() {
    fxW = fxCanvas.width = window.innerWidth;
    fxH = fxCanvas.height = window.innerHeight;
  }

  class Particle {
    constructor(x, y, color, opts = {}) {
      this.x = x; this.y = y; this.color = color;
      this.size = opts.size || (3 + Math.random() * 5);
      const angle = opts.angle ?? (Math.random() * Math.PI * 2);
      const speed = opts.speed ?? (2 + Math.random() * 4);
      this.vx = Math.cos(angle) * speed; this.vy = Math.sin(angle) * speed;
      this.gravity = opts.gravity ?? 0.08;
      this.friction = opts.friction ?? 0.98;
      this.life = 1;
      this.decay = opts.decay ?? (0.015 + Math.random() * 0.02);
      this.type = opts.type || 'circle';
    }
    update() {
      this.vx *= this.friction; this.vy *= this.friction;
      this.vy += this.gravity;
      this.x += this.vx; this.y += this.vy;
      this.life -= this.decay;
      return this.life > 0;
    }
    draw(ctx) {
      ctx.globalAlpha = this.life;
      ctx.fillStyle = this.color;
      if (this.type === 'spark') {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.atan2(this.vy, this.vx));
        ctx.fillRect(-this.size * 1.5, -this.size * 0.3, this.size * 3, this.size * 0.6);
        ctx.restore();
      } else if (this.type === 'star') {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(performance.now() * 0.003);
        const s = this.size * this.life;
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(-s * 0.15, -s, s * 0.3, s * 2);
          ctx.rotate(Math.PI / 4);
        }
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  function spawnClearParticles(cellEl, color) {
    if (settings.reducedMotion) return;
    const rect = cellEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    const pal = COLOR_PALETTE.find(c => c.main === color) || { main:color, light:color, glow:color };
    for (let i = 0; i < 8; i++) {
      particles.push(new Particle(cx, cy, pal.main, { speed:3+Math.random()*5, size:2+Math.random()*4, gravity:0.06, decay:0.02+Math.random()*0.015 }));
    }
    for (let i = 0; i < 4; i++) {
      particles.push(new Particle(cx, cy, pal.light||'#fff', { speed:1+Math.random()*3, size:1.5+Math.random()*2, gravity:0.02, decay:0.025, type:'spark' }));
    }
    ensureFxLoop();
  }

  function spawnComboExplosion(x, y, comboN) {
    if (settings.reducedMotion) return;
    const count = Math.min(comboN * 12, 60);
    const colors = ['#ffd93d','#ff6b6b','#6bcb77','#4d96ff','#a855f7','#fff'];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(x, y, colors[i % colors.length], {
        speed:4+Math.random()*8, size:2+Math.random()*5, gravity:0.1,
        decay:0.012+Math.random()*0.01, type:Math.random()>0.5?'spark':'circle',
      }));
    }
    ensureFxLoop();
  }

  function spawnPerfectClearFX() {
    if (settings.reducedMotion) return;
    const cx = fxW / 2, cy = fxH / 2;
    const golds = ['#ffd93d','#ffe066','#fff','#f97316','#ffd93d'];
    for (let i = 0; i < 80; i++) {
      particles.push(new Particle(cx, cy, golds[i % golds.length], {
        speed:5+Math.random()*10, size:3+Math.random()*6, gravity:0.05,
        decay:0.008+Math.random()*0.008, type:Math.random()>0.3?'spark':'circle',
      }));
    }
    ensureFxLoop();
  }

  function spawnConfetti() {
    if (settings.reducedMotion) return;
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    const colors = ['#ffd93d','#ff6b6b','#6bcb77','#4d96ff','#a855f7','#ec4899','#fff'];
    for (let i = 0; i < 50; i++) {
      const angle = (Math.PI * 2 * i / 50) + (Math.random() - 0.5);
      particles.push(new Particle(cx, cy, colors[i % colors.length], {
        angle, speed:6+Math.random()*10, size:3+Math.random()*5,
        gravity:0.12, decay:0.006+Math.random()*0.006, friction:0.99,
        type:Math.random()>0.5?'spark':'circle',
      }));
    }
    ensureFxLoop();
  }

  // Seasonal particle effects
  function spawnSeasonalParticles() {
    if (!activeSeasonalEvent) return;
    const decos = activeSeasonalEvent.decorations;
    // Use star particles with theme colors
    const cx = fxW / 2, cy = fxH * 0.3;
    for (let i = 0; i < 20; i++) {
      particles.push(new Particle(
        Math.random() * fxW, -10, COLORS[i % COLORS.length],
        { speed:0.5+Math.random()*2, gravity:0.03, decay:0.005+Math.random()*0.005,
          size:2+Math.random()*4, type:'star', angle:Math.PI/2+(Math.random()-0.5)*0.5 }
      ));
    }
    ensureFxLoop();
  }

  function ensureFxLoop() {
    if (!fxAnimRunning) { fxAnimRunning = true; renderFx(); }
  }

  function renderFx() {
    fxCtx.clearRect(0, 0, fxW, fxH);
    for (let i = particles.length - 1; i >= 0; i--) {
      if (!particles[i].update()) { particles.splice(i, 1); }
      else { particles[i].draw(fxCtx); }
    }
    if (particles.length > 0) { requestAnimationFrame(renderFx); }
    else { fxAnimRunning = false; }
  }

  // ==================================================================
  // AUDIO ENGINE
  // ==================================================================
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

  function sfxPlace() {
    playTone(440, 0.06, 'sine', 0.08);
    setTimeout(() => playTone(554, 0.06, 'sine', 0.06), 30);
    setTimeout(() => playTone(659, 0.08, 'sine', 0.04), 60);
  }
  function sfxClear(n) {
    const baseFreqs = [523,659,784,880,1047,1175];
    for (let i = 0; i < Math.min(n, 6); i++) {
      setTimeout(() => { playTone(baseFreqs[i], 0.15, 'triangle', 0.07); playTone(baseFreqs[i]*1.5, 0.1, 'sine', 0.03); }, i * 80);
    }
  }
  function sfxCombo(n) {
    const base = 500;
    for (let i = 0; i < Math.min(n, 8); i++) {
      setTimeout(() => { playTone(base+i*100, 0.2, 'triangle', 0.05); playTone((base+i*100)*2, 0.15, 'sine', 0.02); }, i * 60);
    }
  }
  function sfxPerfectClear() {
    [523,659,784,1047,1319,1568].forEach((f, i) => setTimeout(() => { playTone(f, 0.3, 'triangle', 0.08); playTone(f*1.5, 0.2, 'sine', 0.04); }, i * 100));
  }
  function sfxGameOver() {
    playTone(350, 0.3, 'sawtooth', 0.06);
    setTimeout(() => playTone(280, 0.3, 'sawtooth', 0.06), 150);
    setTimeout(() => playTone(200, 0.4, 'sawtooth', 0.04), 300);
  }
  function sfxNewRecord() {
    [523,659,784,1047].forEach((f, i) => setTimeout(() => playTone(f, 0.25, 'triangle', 0.08), i * 110));
  }
  function sfxPowerup() {
    playTone(800, 0.12, 'square', 0.06);
    setTimeout(() => playTone(1000, 0.12, 'square', 0.06), 60);
    setTimeout(() => playTone(1200, 0.15, 'triangle', 0.05), 120);
  }

  let userHasInteracted = false;
  document.addEventListener('touchstart', () => { userHasInteracted = true; }, { once: true, passive: true });
  document.addEventListener('click', () => { userHasInteracted = true; }, { once: true });

  function vibrate(ms = 15) {
    if (!settings.vibrationOn || !userHasInteracted) return;
    try { navigator.vibrate && navigator.vibrate(ms); } catch(e) {}
  }

  // ---- BACKGROUND MUSIC ----
  let musicOsc1 = null, musicOsc2 = null, musicGain = null, musicPlaying = false;
  function startMusic() {
    if (musicPlaying || !settings.musicOn) return;
    try {
      const ctx = getAudioCtx();
      musicGain = ctx.createGain();
      musicGain.gain.setValueAtTime(0.03, ctx.currentTime);
      musicGain.connect(ctx.destination);
      musicOsc1 = ctx.createOscillator();
      musicOsc1.type = 'sine';
      musicOsc1.frequency.setValueAtTime(220, ctx.currentTime);
      musicOsc1.connect(musicGain); musicOsc1.start();
      musicOsc2 = ctx.createOscillator();
      musicOsc2.type = 'sine';
      musicOsc2.frequency.setValueAtTime(330, ctx.currentTime);
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.02, ctx.currentTime);
      musicOsc2.connect(g2); g2.connect(ctx.destination); musicOsc2.start();
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.1, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(8, ctx.currentTime);
      lfo.connect(lfoGain); lfoGain.connect(musicOsc1.frequency); lfo.start();
      musicPlaying = true;
    } catch(e) {}
  }
  function stopMusic() {
    try { if (musicOsc1) { musicOsc1.stop(); musicOsc1 = null; } if (musicOsc2) { musicOsc2.stop(); musicOsc2 = null; } } catch(e) {}
    musicPlaying = false;
  }
  function toggleMusic(on) { settings.musicOn = on; saveSetting(); if (on) startMusic(); else stopMusic(); }

  // ==================================================================
  // SCREEN SHAKE & COMBO FIRE
  // ==================================================================
  function screenShake(intensity) {
    const dur = intensity >= 2 ? 450 : 350;
    boardContainer.classList.remove('shake', 'shake-heavy');
    void boardContainer.offsetWidth;
    const cls = intensity >= 2 ? 'shake-heavy' : 'shake';
    boardContainer.classList.add(cls);
    setTimeout(() => boardContainer.classList.remove(cls), dur);
  }

  function updateComboFire(comboN) {
    const fireEl = $('combo-fire');
    if (!fireEl) return;
    if (comboN <= 0) { fireEl.textContent = ''; fireEl.className = ''; return; }
    if (comboN >= 4) { fireEl.textContent = '🔥🔥🔥'; fireEl.className = 'mega'; }
    else if (comboN >= 2) { fireEl.textContent = '🔥'.repeat(comboN); fireEl.className = 'active'; }
    if (comboN >= 2) {
      boardEl.classList.add('combo-glow');
      setTimeout(() => boardEl.classList.remove('combo-glow'), 800);
    }
  }

  // ==================================================================
  // UNDO SYSTEM
  // ==================================================================
  function saveUndoSnapshot() {
    undoState = {
      board: board.map(row => [...row]),
      pieces: pieces.map(p => p ? { ...p, shape: p.shape.map(r => [...r]) } : null),
      score, combo, maxCombo, totalLinesCleared,
    };
    undoAvailable = true;
    updateUndoButton();
  }

  function performUndo() {
    if (!undoState || !undoAvailable || !gameActive) return;
    board = undoState.board; pieces = undoState.pieces;
    score = undoState.score; combo = undoState.combo;
    maxCombo = undoState.maxCombo; totalLinesCleared = undoState.totalLinesCleared;
    scoreEl.textContent = score;
    undoAvailable = false; undoState = null;
    renderBoard(); renderPieces(); saveGameState(); updateUndoButton();
    sfxPlace(); vibrate(10);
  }

  function updateUndoButton() {
    const btn = $('btn-undo');
    if (btn) { btn.style.opacity = undoAvailable ? '1' : '0.3'; btn.style.pointerEvents = undoAvailable ? 'auto' : 'none'; }
  }

  // ---- TUTORIAL ----
  function showTutorial() {
    if (hasShownTutorial) return;
    const overlay = $('tutorial-overlay');
    if (overlay) { overlay.classList.add('show'); hasShownTutorial = true; safeSet('bsTutorialShown', '1'); }
  }
  function dismissTutorial() {
    const overlay = $('tutorial-overlay');
    if (overlay) overlay.classList.remove('show');
  }

  // ---- DANGER INDICATOR ----
  function getBoardFillPercent() {
    let filled = 0;
    for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) if (board[r][c]) filled++;
    return filled / (BOARD_SIZE * BOARD_SIZE);
  }

  function updateDangerIndicator() {
    const pct = getBoardFillPercent();
    const fillIndicator = $('fill-percent');
    if (fillIndicator) {
      fillIndicator.textContent = Math.round(pct * 100) + '%';
      fillIndicator.style.color = pct > 0.7 ? '#ff6b6b' : pct > 0.5 ? '#ffd93d' : 'rgba(255,255,255,0.2)';
    }
    boardEl.style.borderColor = pct > 0.75 ? 'rgba(255,107,107,0.25)' : 'rgba(255,255,255,0.04)';
  }

  // ---- ADMOB INTEGRATION ----
  const ADMOB_ENABLED = false;
  const ADMOB_BANNER_ID = 'ca-app-pub-XXXXXXXXXXXXX/XXXXXXXXXX';
  const ADMOB_INTERSTITIAL_ID = 'ca-app-pub-XXXXXXXXXXXXX/XXXXXXXXXX';
  const ADMOB_REWARDED_ID = 'ca-app-pub-XXXXXXXXXXXXX/XXXXXXXXXX';

  const AdMob = {
    isNative: typeof window.Capacitor !== 'undefined',
    interstitialCount: 0, INTERSTITIAL_EVERY: 3,
    async init() {
      if (!this.isNative || !ADMOB_ENABLED) return;
      try {
        const { AdMob: CapAdMob } = await import('@capacitor-community/admob');
        this.plugin = CapAdMob;
        await this.plugin.initialize({ initializeForTesting: false });
        this.showBanner();
      } catch(e) { console.log('AdMob not available:', e.message); }
    },
    async showBanner() { if (!this.plugin) return; try { await this.plugin.showBanner({ adId: ADMOB_BANNER_ID, adSize: 'BANNER', position: 'BOTTOM_CENTER' }); } catch(e) {} },
    async showInterstitial() {
      if (!this.plugin) return;
      this.interstitialCount++;
      if (this.interstitialCount % this.INTERSTITIAL_EVERY !== 0) return;
      try { await this.plugin.prepareInterstitial({ adId: ADMOB_INTERSTITIAL_ID }); await this.plugin.showInterstitial(); } catch(e) {}
    },
    async showRewarded() {
      if (!this.plugin) return;
      try { await this.plugin.prepareRewardVideoAd({ adId: ADMOB_REWARDED_ID }); const result = await this.plugin.showRewardVideoAd(); return result.type === 'earned'; } catch(e) { return false; }
    }
  };

  // ==================================================================
  // INIT BOARD
  // ==================================================================
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
    const cells = boardEl.children;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const cell = cells[r * BOARD_SIZE + c];
        const val = board[r][c];
        if (val) {
          cell.style.background = val;
          cell.classList.add('filled');
          // Accessibility: add pattern overlay
          if (settings.patterns) {
            const colorIdx = COLORS.indexOf(val);
            cell.classList.add('a11y-pattern');
            cell.style.setProperty('--cell-pattern', CELL_PATTERNS[colorIdx >= 0 ? colorIdx : 0]);
          } else {
            cell.classList.remove('a11y-pattern');
          }
        } else {
          cell.style.background = '';
          cell.classList.remove('filled', 'a11y-pattern');
        }
        cell.classList.remove('preview', 'clearing', 'row-hint', 'col-hint', 'invalid-preview', 'just-placed', 'bomb-target', 'bomb-area');
        cell.style.opacity = '';
      }
    }
    cachedCells = null;
    highlightAlmostComplete();
    updateDangerIndicator();
  }

  function highlightAlmostComplete() {
    const cells = boardEl.children;
    for (let r = 0; r < BOARD_SIZE; r++) {
      let empty = 0;
      for (let c = 0; c < BOARD_SIZE; c++) if (!board[r][c]) empty++;
      if (empty > 0 && empty <= 2) {
        for (let c = 0; c < BOARD_SIZE; c++) if (!board[r][c]) cells[r * BOARD_SIZE + c].classList.add('row-hint');
      }
    }
    for (let c = 0; c < BOARD_SIZE; c++) {
      let empty = 0;
      for (let r = 0; r < BOARD_SIZE; r++) if (!board[r][c]) empty++;
      if (empty > 0 && empty <= 2) {
        for (let r = 0; r < BOARD_SIZE; r++) if (!board[r][c]) cells[r * BOARD_SIZE + c].classList.add('col-hint');
      }
    }
  }

  // ==================================================================
  // PIECES
  // ==================================================================
  function randomPiece() {
    const idx = Math.floor(Math.random() * PIECE_DEFS.length);
    const def = PIECE_DEFS[idx];
    const colorIdx = Math.floor(Math.random() * COLOR_PALETTE.length);
    const color = COLOR_PALETTE[colorIdx];
    return { shape: def.s, color: color.main, colorData: color, weight: def.w };
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
      if (!piece) { slot.style.opacity = '0.12'; slot.style.pointerEvents = 'none'; piecesEl.appendChild(slot); return; }
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

  // ==================================================================
  // DRAG & DROP
  // ==================================================================
  let dragPiece = null, dragOffsetR = 0, dragOffsetC = 0;
  let lastPreviewR = -1, lastPreviewC = -1;
  let ghostHalfW = 0, ghostH = 0;
  let cachedBoardRect = null, cachedCells = null;
  let previewIndices = [];

  function startDrag(e, idx) {
    if (!gameActive || !pieces[idx] || activePowerup) return;
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
    ghostHalfW = ghostEl.offsetWidth / 2;
    ghostH = ghostEl.offsetHeight;

    let massR = 0, massC = 0, massN = 0;
    for (let r = 0; r < dragPiece.shape.length; r++) {
      for (let c = 0; c < dragPiece.shape[0].length; c++) {
        if (dragPiece.shape[r][c]) { massR += r; massC += c; massN++; }
      }
    }
    dragOffsetR = massN > 0 ? massR / massN : 0;
    dragOffsetC = massN > 0 ? massC / massN : 0;
    cachedCells = Array.from(boardEl.children);
    cachedBoardRect = boardEl.getBoundingClientRect();
    previewIndices = [];
    document.body.classList.add('dragging');
    moveGhost(e);
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('touchend', onDragEnd);
    document.addEventListener('touchcancel', onDragEnd);
  }

  // Dynamic touch offset: tablets (600px+) need less offset since pieces are bigger
  // and the user's finger obscures less of the board
  function getTouchYOffset() {
    const w = window.innerWidth;
    if (w >= 1200) return 60;  // large tablet / chromebook
    if (w >= 768) return 80;   // tablet
    return 110;                // phone
  }
  function getSnapYOffset() {
    const w = window.innerWidth;
    if (w >= 1200) return 50;
    if (w >= 768) return 70;
    return 100;
  }

  function moveGhost(e) {
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const yOff = e.touches ? getTouchYOffset() : 40;
    ghostEl.style.transform = 'translate3d(' + (cx - ghostHalfW) + 'px,' + (cy - ghostH - yOff) + 'px,0)';
  }

  let dragRAF = null, pendingDragEvent = null;

  function onDragMove(e) {
    e.preventDefault();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const isTouch = !!e.touches;
    const yOff = isTouch ? getTouchYOffset() : 40;
    ghostEl.style.transform = 'translate3d(' + (cx - ghostHalfW) + 'px,' + (cy - ghostH - yOff) + 'px,0)';
    pendingDragEvent = { cx, cy, isTouch };
    if (!dragRAF) dragRAF = requestAnimationFrame(processDragMove);
  }

  function processDragMove() {
    dragRAF = null;
    if (!pendingDragEvent || !dragPiece) return;
    const { cx, cy, isTouch } = pendingDragEvent;
    pendingDragEvent = null;
    const adjustedY = cy - (isTouch ? getSnapYOffset() : 70);
    const br = cachedBoardRect || boardEl.getBoundingClientRect();
    const cellW = br.width / BOARD_SIZE, cellH = br.height / BOARD_SIZE;
    const sR = Math.round((adjustedY - br.top) / cellH - dragOffsetR);
    const sC = Math.round((cx - br.left) / cellW - dragOffsetC);
    if (sR === lastPreviewR && sC === lastPreviewC) return;
    const prevR = lastPreviewR;
    clearPreviewFast();
    if (canPlace(dragPiece, sR, sC)) {
      showPreviewFast(dragPiece, sR, sC);
      if (prevR === -1) vibrate(6);
      lastPreviewR = sR; lastPreviewC = sC;
    } else { lastPreviewR = -1; lastPreviewC = -1; }
  }

  function showPreviewFast(piece, sR, sC) {
    const cells = cachedCells;
    if (!cells) return;
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[0].length; c++) {
        if (piece.shape[r][c]) {
          const idx = (sR + r) * BOARD_SIZE + (sC + c);
          const cell = cells[idx];
          if (cell) { cell.classList.add('preview'); cell.style.background = piece.color; cell.style.opacity = '0.5'; previewIndices.push(idx); }
        }
      }
    }
  }

  function clearPreviewFast() {
    const cells = cachedCells;
    if (!cells) return;
    for (let i = 0; i < previewIndices.length; i++) {
      const idx = previewIndices[i];
      const cell = cells[idx];
      if (cell) { cell.classList.remove('preview'); cell.style.opacity = ''; const r = (idx / BOARD_SIZE) | 0, c = idx % BOARD_SIZE; cell.style.background = board[r][c] || ''; }
    }
    previewIndices.length = 0;
  }

  function onDragEnd(e) {
    if (dragRAF) { cancelAnimationFrame(dragRAF); dragRAF = null; }
    if (pendingDragEvent && dragPiece) {
      const { cx, cy, isTouch } = pendingDragEvent;
      pendingDragEvent = null;
      const adjustedY = cy - (isTouch ? getSnapYOffset() : 70);
      const br = cachedBoardRect || boardEl.getBoundingClientRect();
      const cellW = br.width / BOARD_SIZE, cellH = br.height / BOARD_SIZE;
      const sR = Math.round((adjustedY - br.top) / cellH - dragOffsetR);
      const sC = Math.round((cx - br.left) / cellW - dragOffsetC);
      clearPreviewFast();
      if (canPlace(dragPiece, sR, sC)) { lastPreviewR = sR; lastPreviewC = sC; }
      else { lastPreviewR = -1; lastPreviewC = -1; }
    } else { pendingDragEvent = null; }

    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
    document.removeEventListener('touchmove', onDragMove);
    document.removeEventListener('touchend', onDragEnd);
    document.removeEventListener('touchcancel', onDragEnd);
    ghostEl.style.display = 'none'; ghostEl.style.transform = '';
    document.body.classList.remove('dragging');
    clearPreviewFast();
    if (draggingIdx >= 0 && piecesEl.children[draggingIdx]) piecesEl.children[draggingIdx].classList.remove('dragging');

    if (lastPreviewR >= 0 && lastPreviewC >= 0 && dragPiece) {
      saveUndoSnapshot();
      placePieceAnimated(dragPiece, lastPreviewR, lastPreviewC);
      pieces[draggingIdx] = null;
      stats.lifetimePieces++;
      sfxPlace(); vibrate(12);
      trackPlacement();

      const cleared = checkAndClearLines();
      if (cleared > 0) {
        combo++;
        maxCombo = Math.max(maxCombo, combo);
        totalLinesCleared += cleared;
        sessionAnalytics.linesCleared += cleared;
        const pts = cleared * BOARD_SIZE * 10 * Math.max(1, combo);
        addScore(pts);
        sfxClear(cleared);
        updateComboFire(combo);
        screenShake();
        trackCombo(combo);

        if (combo > 1) {
          showCombo(combo);
          sfxCombo(combo);
          vibrate(25 + combo * 10);
          const bRect = boardContainer.getBoundingClientRect();
          spawnComboExplosion(bRect.left + bRect.width / 2, bRect.top + bRect.height / 2, combo);
        }

        // Power-up rewards from combos
        checkComboRewards(combo);

        if (isBoardEmpty()) handlePerfectClear();
      } else {
        combo = 0;
        addScore(countCells(dragPiece));
        updateComboFire(0);
      }

      if (pieces.every(p => p === null)) generatePieces();
      else renderPieces();
      saveGameState();
      if (!canAnyPieceFit()) setTimeout(() => gameOver(), 350);
    }

    draggingIdx = -1; dragPiece = null;
    cachedCells = null; cachedBoardRect = null;
    lastPreviewR = -1; lastPreviewC = -1;
  }

  // ==================================================================
  // BOARD LOGIC
  // ==================================================================
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

  function placePieceAnimated(piece, sR, sC) {
    const cells = boardEl.children;
    for (let r = 0; r < piece.shape.length; r++)
      for (let c = 0; c < piece.shape[0].length; c++)
        if (piece.shape[r][c]) {
          const br = sR + r, bc = sC + c;
          board[br][bc] = piece.color;
          const cell = cells[br * BOARD_SIZE + bc];
          cell.style.background = piece.color;
          cell.classList.add('filled', 'just-placed');
          cell.style.animationDelay = ((r * piece.shape[0].length + c) * 20) + 'ms';
          setTimeout(() => { cell.classList.remove('just-placed'); cell.style.animationDelay = ''; }, 300);
        }
    cachedCells = null;
    highlightAlmostComplete();
    updateDangerIndicator();
  }

  function checkAndClearLines() {
    const rowsC = [], colsC = [];
    for (let r = 0; r < BOARD_SIZE; r++) if (board[r].every(c => c !== 0)) rowsC.push(r);
    for (let c = 0; c < BOARD_SIZE; c++) if (board.every(row => row[c] !== 0)) colsC.push(c);
    if (!rowsC.length && !colsC.length) return 0;
    const children = boardEl.children;
    const toClear = new Set();
    rowsC.forEach(r => { for (let c = 0; c < BOARD_SIZE; c++) toClear.add(r * BOARD_SIZE + c); });
    colsC.forEach(c => { for (let r = 0; r < BOARD_SIZE; r++) toClear.add(r * BOARD_SIZE + c); });
    let delay = 0;
    toClear.forEach(idx => {
      const cell = children[idx];
      setTimeout(() => { cell.classList.add('clearing'); spawnClearParticles(cell, cell.style.background || '#ffd93d'); }, delay);
      delay += 12;
    });
    setTimeout(() => {
      rowsC.forEach(r => { for (let c = 0; c < BOARD_SIZE; c++) board[r][c] = 0; });
      colsC.forEach(c => { for (let r = 0; r < BOARD_SIZE; r++) board[r][c] = 0; });
      renderBoard();
    }, 420);
    return rowsC.length + colsC.length;
  }

  function isBoardEmpty() {
    for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) if (board[r][c]) return false;
    return true;
  }

  function handlePerfectClear() {
    const bonus = 500 * Math.max(1, combo);
    addScore(bonus);
    stats.perfectClears = (stats.perfectClears || 0) + 1;
    saveStats();
    const el = document.createElement('div');
    el.className = 'perfect-popup';
    el.textContent = '✨ PERFECT CLEAR! +' + bonus;
    boardContainer.appendChild(el);
    setTimeout(() => el.remove(), 1800);
    sfxPerfectClear(); vibrate(100);
    spawnPerfectClearFX(); screenShake();
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

  // ==================================================================
  // SCORING
  // ==================================================================
  let displayScore = 0, scoreAnimFrame = null;

  function addScore(pts) {
    score += pts;
    animateScoreCounter();
    if (score > bestScore) {
      bestScore = score;
      bestScoreEl.textContent = bestScore;
      bestScoreEl.classList.add('new-best');
      setTimeout(() => bestScoreEl.classList.remove('new-best'), 600);
      safeSet('blockSmashBest', String(bestScore));
      isNewRecord = true;
    }
    showScoreFloat('+' + pts);
    updateDailyUI();
  }

  function animateScoreCounter() {
    if (scoreAnimFrame) cancelAnimationFrame(scoreAnimFrame);
    const start = displayScore, end = score, duration = 350, startTime = performance.now();
    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      displayScore = Math.round(start + (end - start) * (1 - Math.pow(1 - progress, 3)));
      scoreEl.textContent = displayScore;
      if (progress < 1) scoreAnimFrame = requestAnimationFrame(tick);
      else { displayScore = end; scoreEl.textContent = end; }
    }
    scoreAnimFrame = requestAnimationFrame(tick);
  }

  // ==================================================================
  // XP & LEVELING
  // ==================================================================
  function addXP(amount) {
    const oldLevel = stats.level;
    stats.xp += amount;
    while (stats.level < LEVEL_THRESHOLDS.length - 1 && stats.xp >= LEVEL_THRESHOLDS[stats.level]) stats.level++;
    saveStats();
    updateLevelUI();
    if (stats.level > oldLevel) {
      // Process level rewards
      for (let lvl = oldLevel + 1; lvl <= stats.level; lvl++) {
        const reward = LEVEL_REWARDS[lvl];
        if (reward) processLevelReward(reward, lvl);
      }
      showLevelUp(stats.level);
    }
  }

  function processLevelReward(reward, level) {
    if (reward.type === 'theme') {
      if (!stats.unlockedThemes.includes(reward.id)) {
        stats.unlockedThemes.push(reward.id);
        saveStats();
      }
    } else if (reward.type === 'powerup') {
      powerups[reward.pu] = (powerups[reward.pu] || 0) + reward.count;
      savePowerups();
    }
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
      ? ((stats.xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100 : 100;
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
    // Show rewards
    const rewardsEl = $('level-up-rewards');
    const reward = LEVEL_REWARDS[level];
    rewardsEl.textContent = reward ? reward.msg : '';
    overlay.classList.add('show');
    sfxNewRecord(); vibrate(50); spawnConfetti();
    setTimeout(() => overlay.classList.remove('show'), 2500);
  }

  // ---- DAILY CHALLENGE ----
  function updateDailyUI() {
    const challenge = getDailyChallenge();
    $('daily-icon').textContent = challenge.icon;
    $('daily-name').textContent = 'Daily: ' + challenge.name;
    $('daily-desc').textContent = challenge.desc;
    let current = 0;
    if (challenge.stat === 'lines') current = totalLinesCleared;
    else if (challenge.stat === 'score') current = score;
    else if (challenge.stat === 'combo') current = maxCombo;
    const completed = current >= challenge.target;
    $('daily-progress-text').textContent = Math.min(current, challenge.target) + '/' + challenge.target;
    $('daily-challenge').classList.toggle('completed', completed);
    if (completed && !stats.dailyChallengeComplete && stats.dailyChallengeDate === challenge.date) {
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

  // ---- MILESTONES ----
  function checkMilestones() {
    const state = {
      totalLinesCleared, bestScore, maxCombo: stats.maxCombo,
      gamesPlayed: stats.lifetimeGames, lifetimeLines: stats.lifetimeLines,
      longestStreak: stats.longestStreak, perfectClears: stats.perfectClears || 0,
      powerupsUsed: stats.powerupsUsed || 0, tournamentWins: stats.tournamentWins || 0,
    };
    const newlyUnlocked = [];
    for (const m of MILESTONES) {
      if (stats.unlockedMilestones.includes(m.id)) continue;
      if (m.check(state)) { stats.unlockedMilestones.push(m.id); newlyUnlocked.push(m); }
    }
    saveStats();
    return newlyUnlocked;
  }

  function showMilestoneUnlock(milestone) {
    $('milestone-icon').textContent = milestone.icon;
    $('milestone-name').textContent = milestone.name;
    $('milestone-unlock').style.display = 'flex';
    sfxNewRecord(); vibrate(40);
  }

  function getMotivationalNudge() {
    const diff = bestScore - score;
    if (diff > 0 && diff < bestScore * 0.15 && score > 100) return '😱 So close! Only ' + diff + ' points from your best!';
    if (stats.lifetimeGames <= 1) return '🌟 Great first game! Most players double their score by game 3.';
    if (score > 0 && stats.lifetimeGames > 1) {
      const avg = Math.round(stats.lifetimeScore / Math.max(stats.lifetimeGames - 1, 1));
      if (score > avg) return '📈 Above your average of ' + avg + '! You\'re getting better!';
    }
    if (stats.currentStreak >= 2) return '🔥 ' + stats.currentStreak + '-day streak! Don\'t break it!';
    const nextT = LEVEL_THRESHOLDS[stats.level] || 9999;
    const remaining = nextT - stats.xp;
    if (remaining > 0 && remaining < 100) return '⭐ Only ' + remaining + ' XP to Level ' + (stats.level + 1) + '!';
    const nudges = [
      '🧩 Average players clear 6+ lines per game. Can you beat that?',
      '💡 Pro tip: Save space in corners for big pieces!',
      '🎯 Your record is ' + bestScore + ' — can you smash it?',
      '💣 Earn power-ups with combos! Try for 3x+!',
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
      { v: (stats.perfectClears || 0), l: 'Perfect Clears' },
      { v: (stats.powerupsUsed || 0), l: 'Power-ups Used' },
      { v: stats.dailyChallengesCompleted || 0, l: 'Dailies Done' },
    ].map(s => '<div class="stat-card"><div class="stat-value">' + s.v + '</div><div class="stat-label">' + s.l + '</div></div>').join('');
    list.innerHTML = MILESTONES.map(m => {
      const unlocked = stats.unlockedMilestones.includes(m.id);
      return '<div class="achievement-row ' + (unlocked ? '' : 'locked') + '">' +
        '<div class="ach-icon">' + m.icon + '</div>' +
        '<div><div class="ach-name">' + m.name + '</div><div class="ach-desc">' + m.desc + '</div></div></div>';
    }).join('');
    showAnalyticsInsights();
    $('stats-modal').classList.add('show');
  }

  // ---- THEMES MODAL ----
  function showThemesModal() {
    const grid = $('theme-grid');
    $('themes-xp-display').textContent = stats.xp + ' XP';
    grid.innerHTML = Object.values(THEMES).map(theme => {
      const unlocked = stats.unlockedThemes.includes(theme.id);
      const active = activeTheme === theme.id;
      const canUnlockByLevel = stats.level >= theme.unlockLevel;
      return '<div class="theme-card ' + (active ? 'active' : '') +
        (unlocked ? '' : (canUnlockByLevel ? ' locked unlockable' : ' locked')) + '"' +
        ' data-theme="' + theme.id + '"' +
        ' style="background:linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01));">' +
        '<div class="theme-preview">' + theme.preview.map(c =>
          '<div class="theme-swatch" style="background:' + c + ';"></div>'
        ).join('') + '</div>' +
        '<div class="theme-name">' + theme.name + '</div>' +
        (!unlocked && canUnlockByLevel ? '<div class="theme-lock">�</div><div class="theme-cost" style="color:var(--accent-green);">Tap to Unlock!</div>' : '') +
        (!unlocked && !canUnlockByLevel ? '<div class="theme-lock">�🔒</div><div class="theme-cost">Lv.' + theme.unlockLevel + ' · ' + theme.cost + ' XP</div>' : '') +
        (active ? '<div style="font-size:0.5em;color:var(--accent-green);">✓ Active</div>' : '') +
        (unlocked && !active ? '<div style="font-size:0.5em;opacity:0.3;">Tap to use</div>' : '') +
        '</div>';
    }).join('');

    // Click handlers — use event delegation on the grid to avoid adding listeners repeatedly
    grid.onclick = (e) => {
      const card = e.target.closest('.theme-card');
      if (!card) return;
      const themeId = card.dataset.theme;
      const unlocked = stats.unlockedThemes.includes(themeId);
      if (unlocked) {
        applyTheme(themeId);
        showThemesModal(); // Refresh
      } else {
        const theme = THEMES[themeId];
        if (stats.level >= theme.unlockLevel) {
          // Unlock with level
          stats.unlockedThemes.push(themeId);
          saveStats();
          applyTheme(themeId);
          sfxNewRecord(); vibrate(30);
          showThemesModal(); // Refresh
        }
      }
    };

    $('themes-modal').classList.add('show');
  }

  function showScoreFloat(text) {
    const el = document.createElement('div');
    el.className = 'score-float';
    el.textContent = text;
    el.style.left = '50%'; el.style.top = '35%'; el.style.transform = 'translateX(-50%)';
    boardContainer.appendChild(el);
    setTimeout(() => el.remove(), 800);
  }

  function showCombo(n) {
    const texts = ['','','DOUBLE! 🔥','TRIPLE! 💥','QUAD! ⚡','INSANE! 🌟','GODLIKE! 👑'];
    const el = document.createElement('div');
    el.className = 'combo-popup';
    el.textContent = n < texts.length ? texts[n] : 'x' + n + ' COMBO! 🏆';
    el.style.color = COLORS[n % COLORS.length];
    boardContainer.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }

  // ==================================================================
  // GAME STATE PERSISTENCE
  // ==================================================================
  function saveGameState() { safeSet('bsState', { board, pieces, score, combo, maxCombo, totalLinesCleared }); }

  function loadGameState() {
    try {
      const state = safeGetJSON('bsState', null);
      if (!state || !state.board || state.board.length !== BOARD_SIZE) return false;
      board = state.board; pieces = state.pieces;
      score = state.score || 0; combo = state.combo || 0;
      maxCombo = state.maxCombo || 0; totalLinesCleared = state.totalLinesCleared || 0;
      return true;
    } catch(e) { return false; }
  }

  function clearGameState() { try { localStorage.removeItem('bsState'); } catch(e) {} }

  // ==================================================================
  // GAME OVER
  // ==================================================================
  function gameOver() {
    gameActive = false;
    lastGameScore = score;
    sfxGameOver(); vibrate(80);
    gamesPlayed++;
    safeSet('bsGamesPlayed', gamesPlayed);
    clearGameState();

    stats.lifetimeGames++;
    stats.lifetimeScore += score;
    stats.lifetimeLines += totalLinesCleared;
    stats.bestScore = Math.max(stats.bestScore, score);
    stats.maxCombo = Math.max(stats.maxCombo, maxCombo);

    // Track recent scores for trend analysis
    let recentScores = safeGetJSON('bsRecentScores', []);
    recentScores.unshift(score);
    recentScores = recentScores.slice(0, 20);
    safeSet('bsRecentScores', recentScores);

    const xpEarned = Math.floor(score * 0.3) + (totalLinesCleared * 15) + (maxCombo * 20) + 10;
    const seasonalBonus = checkSeasonalRewards();
    addXP(xpEarned + seasonalBonus);

    const newMilestones = checkMilestones();

    finalScoreEl.textContent = score;
    finalBestEl.textContent = bestScore;
    $('new-record').style.display = isNewRecord ? 'block' : 'none';
    if (isNewRecord) { sfxNewRecord(); spawnConfetti(); }

    $('xp-gain-text').textContent = '+' + xpEarned + ' XP' + (seasonalBonus > 0 ? ' (+' + seasonalBonus + ' seasonal)' : '');
    $('xp-gain').style.display = 'block';

    // Session insights
    const insights = getSessionInsights();
    const insightsEl = $('session-insights');
    if (insights.length > 0) {
      insightsEl.innerHTML = '<div class="session-summary">' +
        insights.map(i => '<span class="session-tag">' + i + '</span>').join('') + '</div>';
      insightsEl.style.display = 'block';
    }

    $('motivational-nudge').textContent = getMotivationalNudge();
    $('motivational-nudge').style.display = 'block';

    $('milestone-unlock').style.display = 'none';
    if (newMilestones.length > 0) setTimeout(() => showMilestoneUnlock(newMilestones[0]), 600);

    gameOverEl.classList.add('show');

    // Submit to leaderboard & tournament
    fetch('/api/score', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Player', score }) }).catch(() => {});
    submitTournamentScore(score);

    AdMob.showInterstitial();

    // Smart rate/review prompt
    if (shouldShowRatePrompt()) {
      setTimeout(() => showRatePrompt(), 1500);
    }
  }

  function restart() {
    gameOverEl.classList.remove('show');
    score = 0; combo = 0; maxCombo = 0; totalLinesCleared = 0;
    isNewRecord = false; undoState = null; undoAvailable = false;
    displayScore = 0;
    scoreEl.textContent = '0';
    bestScoreEl.textContent = bestScore;
    gameActive = true;
    updateComboFire(0);
    deactivatePowerup();
    $('xp-gain').style.display = 'none';
    $('motivational-nudge').style.display = 'none';
    $('milestone-unlock').style.display = 'none';
    $('session-insights').style.display = 'none';
    initBoard(); renderBoard(); generatePieces();
    updateDailyUI();
    updatePowerupUI();
    saveGameState();
    resetSessionAnalytics();
  }

  // ---- SHARE ----
  function shareScore() {
    const displayScore = score > 0 ? score : lastGameScore;
    const text = '🎮 I scored ' + displayScore + ' on Block Smash Puzzle! Can you beat me? 🧩🔥';
    if (navigator.share) {
      navigator.share({ title: 'Block Smash Puzzle', text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text + ' ' + window.location.href).then(() => alert('Score copied to clipboard!'));
    }
  }

  // ---- SETTINGS ----
  function initSettings() {
    const soundT = $('toggle-sound');
    const vibT = $('toggle-vibration');
    const musicT = $('toggle-music');
    const hcT = $('toggle-high-contrast');
    const patT = $('toggle-patterns');
    const ltT = $('toggle-large-text');
    const cbSelect = $('select-colorblind');

    soundT.classList.toggle('on', settings.soundOn);
    vibT.classList.toggle('on', settings.vibrationOn);
    musicT.classList.toggle('on', settings.musicOn);
    hcT.classList.toggle('on', !!settings.highContrast);
    patT.classList.toggle('on', !!settings.patterns);
    ltT.classList.toggle('on', !!settings.largeText);
    if (cbSelect) cbSelect.value = settings.colorblindMode || 'none';

    soundT.addEventListener('click', () => { settings.soundOn = !settings.soundOn; soundT.classList.toggle('on'); saveSetting(); });
    vibT.addEventListener('click', () => { settings.vibrationOn = !settings.vibrationOn; vibT.classList.toggle('on'); saveSetting(); });
    musicT.addEventListener('click', () => { toggleMusic(!settings.musicOn); musicT.classList.toggle('on'); });

    hcT.addEventListener('click', () => {
      settings.highContrast = !settings.highContrast;
      hcT.classList.toggle('on');
      saveSetting();
      applyAccessibilitySettings();
    });

    patT.addEventListener('click', () => {
      settings.patterns = !settings.patterns;
      patT.classList.toggle('on');
      saveSetting();
      renderBoard();
    });

    ltT.addEventListener('click', () => {
      settings.largeText = !settings.largeText;
      ltT.classList.toggle('on');
      saveSetting();
      applyAccessibilitySettings();
    });

    if (cbSelect) {
      cbSelect.addEventListener('change', () => {
        settings.colorblindMode = cbSelect.value;
        saveSetting();
        applyAccessibilitySettings();
        renderBoard();
        renderPieces();
      });
    }

    $('btn-settings').addEventListener('click', () => $('settings-modal').classList.add('show'));
    $('btn-close-settings').addEventListener('click', () => $('settings-modal').classList.remove('show'));
    $('settings-modal').addEventListener('click', e => { if (e.target === $('settings-modal')) $('settings-modal').classList.remove('show'); });
  }

  // ---- EVENT LISTENERS ----
  $('btn-restart').addEventListener('click', restart);
  $('btn-share').addEventListener('click', shareScore);

  function exitGame() {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
      window.Capacitor.Plugins.App.exitApp();
    } else { window.close(); }
  }
  if ($('btn-exit-game')) $('btn-exit-game').addEventListener('click', exitGame);
  if ($('btn-exit-settings')) $('btn-exit-settings').addEventListener('click', exitGame);

  // Leaderboard with tabs
  let lbTab = 'all';
  function showLeaderboard(tab) {
    lbTab = tab || 'all';
    $('lb-tab-all').style.opacity = lbTab === 'all' ? '1' : '0.4';
    $('lb-tab-weekly').style.opacity = lbTab === 'weekly' ? '1' : '0.4';

    const endpoint = lbTab === 'weekly' ? '/api/tournament?week=' + getWeekKey() : '/api/scores';
    fetch(endpoint).then(r => r.json()).then(scores => {
      const list = $('leaderboard-list');
      if (!scores.length) {
        list.innerHTML = '<div style="text-align:center;opacity:0.35;padding:20px;">No scores yet. Be the first!</div>';
      } else {
        const medals = ['🥇','🥈','🥉'];
        list.innerHTML = scores.slice(0, 15).map((s, i) => {
          const prefix = i < 3 ? medals[i] : '<span style="opacity:0.35;font-size:0.8em;">' + (i+1) + '.</span>';
          return '<div class="lb-row">' + prefix + ' <span class="lb-name">' + s.name + '</span><span class="lb-score">' + s.score.toLocaleString() + '</span></div>';
        }).join('');
      }
    }).catch(() => {
      $('leaderboard-list').innerHTML = '<div style="text-align:center;opacity:0.35;padding:20px;">Leaderboard unavailable offline</div>';
    });

    $('leaderboard-modal').classList.add('show');
  }

  $('btn-leaderboard').addEventListener('click', () => showLeaderboard('all'));
  $('lb-tab-all').addEventListener('click', () => showLeaderboard('all'));
  $('lb-tab-weekly').addEventListener('click', () => showLeaderboard('weekly'));
  $('btn-close-leaderboard').addEventListener('click', () => $('leaderboard-modal').classList.remove('show'));
  $('leaderboard-modal').addEventListener('click', e => { if (e.target === $('leaderboard-modal')) $('leaderboard-modal').classList.remove('show'); });

  $('btn-stats').addEventListener('click', showStatsModal);
  $('btn-close-stats').addEventListener('click', () => $('stats-modal').classList.remove('show'));
  $('stats-modal').addEventListener('click', e => { if (e.target === $('stats-modal')) $('stats-modal').classList.remove('show'); });

  // Themes
  $('btn-close-themes').addEventListener('click', () => $('themes-modal').classList.remove('show'));
  $('themes-modal').addEventListener('click', e => { if (e.target === $('themes-modal')) $('themes-modal').classList.remove('show'); });

  // Tournament
  $('btn-close-tournament').addEventListener('click', () => $('tournament-modal').classList.remove('show'));
  $('tournament-modal').addEventListener('click', e => { if (e.target === $('tournament-modal')) $('tournament-modal').classList.remove('show'); });

  // Challenge
  if ($('btn-challenge-friend')) $('btn-challenge-friend').addEventListener('click', showChallengeModal);
  if ($('btn-send-challenge')) $('btn-send-challenge').addEventListener('click', sendChallenge);
  if ($('btn-close-challenge')) $('btn-close-challenge').addEventListener('click', () => $('challenge-modal').classList.remove('show'));
  $('challenge-modal').addEventListener('click', e => { if (e.target === $('challenge-modal')) $('challenge-modal').classList.remove('show'); });

  $('level-up-overlay').addEventListener('click', () => $('level-up-overlay').classList.remove('show'));
  $('btn-undo').addEventListener('click', performUndo);
  if ($('btn-tutorial-close')) $('btn-tutorial-close').addEventListener('click', dismissTutorial);
  if ($('tutorial-overlay')) $('tutorial-overlay').addEventListener('click', e => { if (e.target === $('tutorial-overlay')) dismissTutorial(); });
  if ($('btn-how-to-play')) $('btn-how-to-play').addEventListener('click', () => { const o = $('tutorial-overlay'); if (o) o.classList.add('show'); });

  // Power-up button listeners
  document.querySelectorAll('.powerup-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.pu;
      if (type) { sfxPowerup(); activatePowerup(type); }
    });
  });

  // Board click for powerup targeting
  boardEl.addEventListener('click', handleBoardClick);

  // Handle resize (debounced) — important for tablet rotation & foldable devices
  let resizeTimer = null;
  function handleResize() {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cachedBoardRect = null; cachedCells = null; // invalidate cached layout
      initBgCanvas(); initFxCanvas(); initBoard(); renderBoard();
    }, 150);
  }
  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', () => setTimeout(handleResize, 200));
  // Android visual viewport changes (nav bar show/hide, foldable unfold)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleResize);
  }

  // ==================================================================
  // BOOT
  // ==================================================================
  function boot() {
    initBgCanvas(); initFxCanvas(); renderBg();
    bestScoreEl.textContent = bestScore;
    initSettings();
    updateStreak();
    updateLevelUI();
    updateDailyUI();
    updatePowerupUI();

    // Apply saved theme
    if (settings.theme && THEMES[settings.theme]) {
      applyTheme(settings.theme);
    }

    // Apply accessibility
    applyAccessibilitySettings();

    // Init seasonal events
    initSeasonalEvent();

    // Init tournament quick bar
    initTournamentQuickBar();

    if (stats.bestScore > bestScore) {
      bestScore = stats.bestScore;
      safeSet('blockSmashBest', String(bestScore));
      bestScoreEl.textContent = bestScore;
    }

    if (loadGameState()) {
      initBoard(); renderBoard(); renderPieces();
      scoreEl.textContent = score; displayScore = score;
      if (!canAnyPieceFit()) { clearGameState(); initBoard(); renderBoard(); generatePieces(); }
    } else {
      initBoard(); renderBoard(); generatePieces();
    }

    // Splash animated blocks
    const splashBlocksContainer = document.getElementById('splash-blocks');
    if (splashBlocksContainer) {
      for (let i = 0; i < 20; i++) {
        const block = document.createElement('div');
        block.className = 'splash-block';
        const size = 14 + Math.random() * 32;
        block.style.width = size + 'px'; block.style.height = size + 'px';
        block.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
        block.style.left = (Math.random() * 100) + '%';
        block.style.animationDelay = (Math.random() * 4) + 's';
        block.style.animationDuration = (3 + Math.random() * 4) + 's';
        block.style.borderRadius = (4 + Math.random() * 4) + 'px';
        splashBlocksContainer.appendChild(block);
      }
    }

    // Splash tap to play
    const splashTap = document.getElementById('splash-tap');
    let splashReady = false;

    function dismissSplash() {
      if (!splashReady) return;
      splashReady = false;
      splashEl.classList.add('hide');
      document.getElementById('game-container').classList.add('show');
      if (audioCtx) audioCtx.resume();
      vibrate(15);
      if (activeSeasonalEvent) spawnSeasonalParticles();
      setTimeout(() => {
        splashEl.remove();
        if (!hasShownTutorial) setTimeout(showTutorial, 300);
      }, 700);
    }

    setTimeout(() => { splashReady = true; if (splashTap) splashTap.classList.add('ready'); }, 2200);
    splashEl.addEventListener('click', dismissSplash);
    splashEl.addEventListener('touchend', e => { e.preventDefault(); dismissSplash(); });
    setTimeout(() => { if (splashEl && splashEl.parentNode) { splashReady = true; dismissSplash(); } }, 5500);

    AdMob.init();

    if (settings.musicOn) {
      document.addEventListener('click', function musicStarter() { startMusic(); document.removeEventListener('click', musicStarter); }, { once: true });
    }

    updateUndoButton();

    if ('serviceWorker' in navigator && !window.Capacitor) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    // Add theme & tournament buttons to the header area
    addExtraButtons();

    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
      window.Capacitor.Plugins.App.addListener('backButton', () => {
        const modals = ['rate-modal','challenge-modal','tournament-modal','themes-modal','stats-modal','settings-modal','leaderboard-modal','tutorial-overlay','level-up-overlay'];
        for (const id of modals) {
          const el = $(id);
          if (el && el.classList.contains('show')) { el.classList.remove('show'); return; }
        }
        if (gameOverEl.classList.contains('show')) { restart(); return; }
        window.Capacitor.Plugins.App.minimizeApp();
      });

      // Handle app state changes (background/foreground) on Android
      window.Capacitor.Plugins.App.addListener('appStateChange', ({ isActive }) => {
        if (!isActive) {
          // Going to background — pause audio & save state
          if (audioCtx && audioCtx.state === 'running') audioCtx.suspend();
          stopMusic();
          saveGameState();
        } else {
          // Returning to foreground — resume audio if settings allow
          if (audioCtx && audioCtx.state === 'suspended' && settings.soundOn) audioCtx.resume();
          if (settings.musicOn) startMusic();
          // Re-invalidate cached layout (screen might have changed on foldables)
          cachedBoardRect = null; cachedCells = null;
        }
      });
    }

    document.addEventListener('gesturestart', e => e.preventDefault());
    document.addEventListener('dblclick', e => e.preventDefault());
  }

  function addExtraButtons() {
    // Prevent duplicate creation
    if (document.getElementById('btn-themes-go')) return;

    // Add theme button and tournament button to game over
    const goEl = gameOverEl;
    // Add a row for themes & tournament after stats row
    const extraRow = document.createElement('div');
    extraRow.className = 'btn-row';
    extraRow.style.marginTop = '4px';
    extraRow.innerHTML = '<button class="btn btn-secondary" id="btn-themes-go">🎨 Themes</button>' +
      '<button class="btn btn-secondary" id="btn-tournament-go">🏟️ Tournament</button>';
    // Insert before exit row
    const exitRow = goEl.querySelector('.btn-exit').parentNode;
    goEl.insertBefore(extraRow, exitRow);

    $('btn-themes-go').addEventListener('click', showThemesModal);
    $('btn-tournament-go').addEventListener('click', showTournamentModal);

    // Also add to header gear area (a small theme button)
    const headerRight = document.querySelector('.header-right');
    if (!headerRight.querySelector('.gear-btn[title="Themes"]')) {
      const themeBtn = document.createElement('button');
      themeBtn.className = 'gear-btn';
      themeBtn.textContent = '🎨';
      themeBtn.title = 'Themes';
      themeBtn.addEventListener('click', showThemesModal);
      headerRight.appendChild(themeBtn);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
