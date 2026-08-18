'use strict';

// -------------------------------------------------------------
// SEEDED PSEUDO-RANDOM GENERATOR & HELPERS
// -------------------------------------------------------------
function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function stringToSeed(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const clampValue = v => Math.max(0, Math.min(100, Math.round(v)));

// -------------------------------------------------------------
// APP GLOBAL STATE & LOCAL STORAGE
// -------------------------------------------------------------
let APP_STATE = {
  screen: 'home',
  phase: 'event',
  showTeacher: false,
  selectedZone: null,
  turnsTotal: 10,
  reading: '??',
  seed: 'langqiao-01',
  savedGame: null,
  g: null,
  fb: null,
  snapshot: null,
  reconsidered: false
};

function saveActiveGame(g) {
  try {
    localStorage.setItem('langqiao.save.active', JSON.stringify(g));
  } catch (e) { console.error('Save failed', e); }
}

function loadActiveGame() {
  try {
    const raw = localStorage.getItem('langqiao.save.active');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.roleId) return parsed;
    }
  } catch (e) { console.error('Load failed', e); }
  return null;
}

function computeCells(value, color) {
  const filledCount = Math.max(0, Math.min(5, Math.round(value / 20)));
  return [0, 1, 2, 3, 4].map(i => i < filledCount ? color : '#dde7ec');
}

function getTrendSummary(start, current) {
  const diff = current - start;
  if (diff >= 10) return '?? ????';
  if (diff > 0)   return '? ????';
  if (diff === 0) return '? ??';
  if (diff > -10) return '? ????';
  return '?? ????';
}

function applyConflictStageChange(g, stageDelta) {
  Object.keys(stageDelta).forEach(k => {
    if (k === 'all') {
      Object.keys(g.rel).forEach(f => {
        g.rel[f].stage = Math.max(0, Math.min(5, g.rel[f].stage + stageDelta.all));
      });
    } else if (g.rel[k]) {
      const val = stageDelta[k];
      if (val < 0) {
        g.rel[k].stage = Math.max(0, g.rel[k].stage + val);
      } else {
        g.rel[k].stage = Math.max(0, Math.min(5, Math.max(g.rel[k].stage, val)));
      }
    }
  });
}

// -------------------------------------------------------------
// GAMEPLAY LOGIC & FLOW
// -------------------------------------------------------------
function startNewGameSession(roleId) {
  const role = ROLES.find(r => r.id === roleId);
  const rel = {};
  Object.keys(FACTIONS).forEach(f => {
    if (f !== role.faction) {
      rel[f] = { trust: (role.rel[f] || 0), stage: 0 };
    }
  });

  const g = {
    roleId,
    turn: 1,
    res: Object.assign({}, role.res),
    rel,
    seed: APP_STATE.seed,
    turnsTotal: APP_STATE.turnsTotal,
    used: [],
    history: [],
    scheduled: [],
    agreements: [],
    notes: [],
    start: Object.assign({}, role.res),
    code: 'LQ-' + String(stringToSeed(APP_STATE.seed + roleId) % 9000 + 1000)
  };

  runTurnStart(g);
}

function runTurnStart(g) {
  const notes = [];
  g.scheduled = (g.scheduled || []).filter(s => {
    if (s.turn > g.turn) return true;
    notes.push(s.text);
    if (s.res) {
      Object.keys(s.res).forEach(k => { g.res[k] = clampValue(g.res[k] + s.res[k]); });
    }
    if (s.rel) {
      Object.keys(s.rel).forEach(k => {
        if (g.rel[k]) g.rel[k].trust = Math.max(-100, Math.min(100, g.rel[k].trust + s.rel[k]));
      });
    }
    if (s.stage) {
      applyConflictStageChange(g, s.stage);
    }
    return false;
  });

  g.notes = notes;
  const ev = drawNextEvent(g);
  g.eventId = ev ? ev.id : null;
  if (ev) g.used = g.used.concat([ev.id]);

  saveActiveGame(g);

  APP_STATE.g = g;
  APP_STATE.screen = 'game';
  APP_STATE.phase = 'event';
  APP_STATE.fb = null;
  APP_STATE.snapshot = null;

  renderApplication();
}

function drawNextEvent(g) {
  const maxStage = Math.max(...Object.keys(g.rel).map(k => g.rel[k].stage), 0);
  const eligible = EVENTS_DATA.filter(e =>
    g.used.indexOf(e.id) < 0 &&
    (!e.minTurn || g.turn >= e.minTurn) &&
    (!e.minStage || maxStage >= e.minStage)
  );

  const pool = eligible.length ? eligible : EVENTS_DATA.filter(e => !e.minStage && !e.minTurn);
  const rng = mulberry32(stringToSeed(g.seed + ':' + g.turn))();
  const totalWeight = pool.reduce((acc, e) => acc + (e.weight || 3), 0);
  let needle = rng * totalWeight;

  for (const e of pool) {
    needle -= (e.weight || 3);
    if (needle <= 0) return e;
  }
  return pool[0];
}

function checkOptionRequirements(g, opt) {
  if (!opt.req) return true;
  if (opt.req.res) {
    for (const k in opt.req.res) {
      if (g.res[k] < opt.req.res[k]) return false;
    }
  }
  if (opt.req.rel) {
    for (const k in opt.req.rel) {
      if (!g.rel[k] || g.rel[k].trust < opt.req.rel[k]) return false;
    }
  }
  return true;
}

function handleOptionChoice(ev, opt) {
  const snapshot = JSON.parse(JSON.stringify(APP_STATE.g));
  const g = JSON.parse(JSON.stringify(APP_STATE.g));
  const beforeRes = Object.assign({}, g.res);

  if (opt.res) {
    Object.keys(opt.res).forEach(k => { g.res[k] = clampValue(g.res[k] + opt.res[k]); });
  }
  if (opt.rel) {
    Object.keys(opt.rel).forEach(k => {
      if (g.rel[k]) g.rel[k].trust = Math.max(-100, Math.min(100, g.rel[k].trust + opt.rel[k]));
    });
  }
  if (opt.stage) {
    applyConflictStageChange(g, opt.stage);
  }
  if (opt.agree && g.agreements.indexOf(opt.agree) < 0) {
    g.agreements = g.agreements.concat([opt.agree]);
  }
  if (opt.delay) {
    g.scheduled = g.scheduled.concat([{
      turn: g.turn + opt.delay.after,
      text: '? ' + g.turn + ' ?????' + opt.delay.text,
      res: opt.delay.res,
      rel: opt.delay.rel,
      stage: opt.delay.stage
    }]);
  }

  const deltas = [];
  Object.keys(g.res).forEach(k => {
    const diff = g.res[k] - beforeRes[k];
    if (diff !== 0) deltas.push({ key: k, diff });
  });

  g.history = g.history.concat([{
    turn: g.turn,
    title: ev.title,
    choice: opt.label,
    note: opt.fb,
    missed: opt.missed || '',
    agree: opt.agree || ''
  }]);

  saveActiveGame(g);

  APP_STATE.g = g;
  APP_STATE.snapshot = snapshot;
  APP_STATE.phase = 'feedback';
  APP_STATE.fb = {
    choice: opt.label,
    text: opt.fb,
    missed: opt.missed || '',
    deltas
  };

  renderApplication();
}

function handleAdvanceNextTurn() {
  const g = JSON.parse(JSON.stringify(APP_STATE.g));
  if (g.turn >= g.turnsTotal) {
    saveActiveGame(g);
    APP_STATE.g = g;
    APP_STATE.screen = 'ending';
    renderApplication();
    return;
  }

  g.turn += 1;
  APP_STATE.reconsidered = false;
  runTurnStart(g);
}

function handleReconsiderOption() {
  if (!APP_STATE.snapshot) return;
  const g = JSON.parse(JSON.stringify(APP_STATE.snapshot));
  saveActiveGame(g);
  APP_STATE.reconsidered = true;
  APP_STATE.phase = 'event';
  APP_STATE.fb = null;
  APP_STATE.g = g;
  APP_STATE.snapshot = null;
  renderApplication();
}

function determineFinalEnding() {
  const g = APP_STATE.g;
  if (!g) return ENDINGS_DATA[ENDINGS_DATA.length - 1];
  const maxStage = Math.max(...Object.keys(g.rel).map(k => g.rel[k].stage), 0);
  return ENDINGS_DATA.find(e => e.test(g, g.agreements, maxStage)) || ENDINGS_DATA[ENDINGS_DATA.length - 1];
}

// -------------------------------------------------------------
// UI RENDERERS
// -------------------------------------------------------------
function switchScreen(screenId) {
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
  const target = document.getElementById('screen-' + screenId);
  if (target) {
    target.classList.add('active');
    APP_STATE.screen = screenId;
  }
}

function renderApplication() {
  switchScreen(APP_STATE.screen);
  switch (APP_STATE.screen) {
    case 'home':   renderHomeScreen(); break;
    case 'role':   renderRoleSelectionScreen(); break;
    case 'game':   renderGameScreen(); break;
    case 'ending': renderEndingScreen(); break;
    case 'report': renderReportScreen(); break;
  }
}

function renderHomeScreen() {
  const saved = loadActiveGame();
  const continueBtn = document.getElementById('btn-home-continue');
  if (saved) {
    continueBtn.disabled = false;
    const role = ROLES.find(r => r.id === saved.roleId);
    continueBtn.textContent = '?? ???' + (role ? role.name : '') + ' ? ' + saved.turn + '?';
    APP_STATE.savedGame = saved;
  } else {
    continueBtn.disabled = true;
    continueBtn.textContent = '?? ????';
  }

  // Teacher settings turn buttons
  const turnContainer = document.getElementById('turn-options-group');
  turnContainer.innerHTML = '';
  [6, 10, 12].forEach(num => {
    const btn = document.createElement('button');
    btn.className = 'btn-toggle ' + (APP_STATE.turnsTotal === num ? 'active' : 'inactive');
    btn.textContent = num + ' ?';
    btn.onclick = () => { APP_STATE.turnsTotal = num; renderHomeScreen(); };
    turnContainer.appendChild(btn);
  });

  // Teacher reading buttons
  const readContainer = document.getElementById('read-options-group');
  readContainer.innerHTML = '';
  ['??', '??'].forEach(mode => {
    const btn = document.createElement('button');
    btn.className = 'btn-toggle ' + (APP_STATE.reading === mode ? 'active' : 'inactive');
    btn.textContent = mode;
    btn.onclick = () => { APP_STATE.reading = mode; renderHomeScreen(); };
    readContainer.appendChild(btn);
  });

  document.getElementById('seed-input-box').value = APP_STATE.seed;
}

function renderRoleSelectionScreen() {
  const container = document.getElementById('role-cards-container');
  container.innerHTML = '';

  ROLES.forEach(r => {
    const card = document.createElement('div');
    card.className = 'role-card';

    const startSummary = CORE_RESOURCES.map(k => ({
      glyph: RES_META[k].g,
      text: Math.round(r.res[k] / 20) + '/5'
    }));

    card.innerHTML = `
      <div class="role-scene">
        <span class="role-side-emoji">${r.sideA}</span>
        <div class="role-avatar" style="background:${FACTION_COLOR[r.faction]};">${FACTION_GLYPH[r.faction]}</div>
        <span class="role-side-emoji">${r.sideB}</span>
      </div>
      <div class="role-body">
        <div class="role-name">${r.name}</div>
        <div class="role-traits">
          <div class="role-trait-row"><span class="role-trait-icon">??</span><span>${r.advantage}</span></div>
          <div class="role-trait-row"><span class="role-trait-icon">??</span><span>${r.limit}</span></div>
          <div class="role-trait-row"><span class="role-trait-icon">??</span><span>${r.actions}</span></div>
        </div>
        <div class="role-res-summary">
          ${startSummary.map(s => `<span class="role-res-pill">${s.glyph} ${s.text}</span>`).join('')}
        </div>
        <button class="btn-select-role" data-role-id="${r.id}">??????</button>
      </div>
    `;

    card.querySelector('.btn-select-role').onclick = () => startNewGameSession(r.id);
    container.appendChild(card);
  });
}

function renderGameScreen() {
  const g = APP_STATE.g;
  if (!g) return;

  const role = ROLES.find(r => r.id === g.roleId);
  const ev = g.eventId ? EVENTS_DATA.find(e => e.id === g.eventId) : null;

  renderMapWorldBackground(g, ev);

  // Top Status Bar
  document.getElementById('hud-role-name').textContent = role ? role.name : '';
  document.getElementById('hud-turn-info').textContent = `? ${g.turn} / ${g.turnsTotal} ? ? ${SEASONS_LIST[(g.turn - 1) % 4]}?`;

  const coreList = document.getElementById('hud-core-resources');
  coreList.innerHTML = '';
  CORE_RESOURCES.forEach(k => {
    const meta = RES_META[k];
    const val = g.res[k];
    const item = document.createElement('div');
    item.className = 'core-res-item';
    item.innerHTML = `
      <span class="core-res-glyph">${meta.g}</span>
      <div class="core-res-meta">
        <div class="core-res-label">${meta.label} ${val}</div>
        <div class="core-res-bars">
          ${computeCells(val, meta.c).map(c => `<span class="res-bar-segment" style="background:${c};"></span>`).join('')}
        </div>
      </div>
    `;
    coreList.appendChild(item);
  });

  // Left Status Chips
  const leftChips = document.getElementById('hud-left-status-chips');
  leftChips.innerHTML = '';
  const chipDefinitions = [
    { g: '??', label: '??', val: g.res.forest >= 60 ? '??' : g.res.forest >= 35 ? '???' : '???', col: g.res.forest >= 35 ? '#3f8f5b' : '#d4552b' },
    { g: '??', label: '??', val: g.res.soil >= 60 ? '??' : g.res.soil >= 35 ? '??' : '???', col: g.res.soil >= 35 ? '#3f8f5b' : '#d4552b' },
    { g: '???', label: '??', val: g.res.security >= 60 ? '??' : g.res.security >= 35 ? '???' : '???', col: g.res.security >= 35 ? '#3f8f5b' : '#d4552b' },
    { g: '??', label: '????', val: g.res.pressure >= 65 ? '??' : g.res.pressure >= 40 ? '???' : '??', col: g.res.pressure >= 40 ? '#d4552b' : '#3f8f5b' }
  ];
  chipDefinitions.forEach(c => {
    const chip = document.createElement('div');
    chip.className = 'status-chip-card';
    chip.innerHTML = `
      <span class="status-chip-icon">${c.g}</span>
      <div class="status-chip-body">
        <span class="status-chip-label">${c.label}</span>
        <span class="status-chip-val" style="color:${c.col};">${c.val}</span>
      </div>
    `;
    leftChips.appendChild(chip);
  });

  // Right Event Panel
  renderRightEventPanel(g, ev);

  // Options vs. Feedback Modal
  if (APP_STATE.phase === 'event') {
    document.getElementById('bottom-options-bar').style.display = 'flex';
    document.getElementById('feedback-modal-overlay').style.display = 'none';
    renderEventOptionsBar(g, ev);
  } else {
    document.getElementById('bottom-options-bar').style.display = 'none';
    document.getElementById('feedback-modal-overlay').style.display = 'flex';
    renderFeedbackModal(g);
  }

  // Zone details popup if selected
  renderZoneDetailPopup();
}

function renderMapWorldBackground(g, ev) {
  // River height responsive to water
  document.getElementById('river').style.height = Math.max(14, 14 + g.res.water * 0.12).toFixed(0) + 'px';

  // Trees
  const treeBox = document.getElementById('world-trees-container');
  treeBox.innerHTML = '';
  const rng = mulberry32(stringToSeed(g.seed + ':world'));
  const treeCount = Math.round(g.res.forest / 6);
  for (let i = 0; i < treeCount; i++) {
    const d = document.createElement('div');
    d.className = 'world-deco';
    d.style.cssText = `left:${(4 + rng() * 88).toFixed(1)}%; top:${(48 + rng() * 46).toFixed(1)}%; font-size:${(22 + rng() * 20).toFixed(0)}px;`;
    d.textContent = '??';
    treeBox.appendChild(d);
  }

  // Fields
  const fieldBox = document.getElementById('world-fields-container');
  fieldBox.innerHTML = '';
  const fieldCount = Math.round(g.res.soil / 12);
  const fieldBg = g.res.water < 35 ? '#cbb27a' : '#c7d95f';
  for (let i = 0; i < fieldCount; i++) {
    const d = document.createElement('div');
    d.className = 'world-deco';
    d.style.cssText = `left:${24 + (i % 4) * 8}%; top:${62 + Math.floor(i / 4) * 9}%; width:54px; height:32px; border-radius:5px; background:${fieldBg}; box-shadow:inset 0 0 0 3px rgba(255,255,255,0.35); transform:skewX(-12deg);`;
    fieldBox.appendChild(d);
  }

  // Interactive Nodes
  const nodesBox = document.getElementById('map-nodes-container');
  nodesBox.innerHTML = '';
  ZONES_DATA.forEach(z => {
    const isFocus = ev && ev.zone === z.id;
    const isSelected = APP_STATE.selectedZone === z.id;
    const btn = document.createElement('button');
    btn.className = 'node-btn';
    btn.style.left = z.x;
    btn.style.top = z.y;
    btn.style.zIndex = isFocus ? 4 : isSelected ? 3 : 2;
    btn.style.animation = isFocus ? 'bob 1.6s ease-in-out infinite' : 'none';
    btn.title = z.name;

    const ringColor = isFocus ? '#e0492c' : isSelected ? '#3a72b0' : '#ffffff';
    btn.innerHTML = `
      ${isFocus ? '<span class="node-badge">?????</span>' : ''}
      <span class="node-circle" style="border-color:${ringColor};">${z.glyph}</span>
      ${(isFocus || isSelected) ? `<span class="node-name-label">${z.name}</span>` : ''}
    `;

    btn.onclick = () => {
      APP_STATE.selectedZone = APP_STATE.selectedZone === z.id ? null : z.id;
      renderGameScreen();
    };
    nodesBox.appendChild(btn);
  });
}

function renderRightEventPanel(g, ev) {
  // Delayed consequence alerts
  const delayBox = document.getElementById('hud-delayed-notice-box');
  delayBox.innerHTML = '';
  if (g.notes && g.notes.length) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'delay-notice-box';
    alertDiv.innerHTML = `
      <span class="delay-notice-title">? ?????????</span>
      ${g.notes.map(d => `<span class="delay-notice-text">${d}</span>`).join('')}
    `;
    delayBox.appendChild(alertDiv);
  }

  if (!ev) return;

  // Category and truth status pills
  const statusMeta = STATUS_META[ev.status] || { label: '??', bg: '#eee', fg: '#333' };
  document.getElementById('hud-ev-tags').innerHTML = `
    <span class="ev-cat-pill">${ev.cat}</span>
    <span class="ev-status-pill" style="background:${statusMeta.bg}; color:${statusMeta.fg};">${statusMeta.label}</span>
  `;

  // Scene illustration box
  const icons = SCENE_ICONS[ev.cat] || ['??', '??', '??'];
  const sceneEl = document.getElementById('hud-ev-scene');
  sceneEl.style.background = SCENE_GRADIENTS[ev.cat] || '#eee';
  sceneEl.innerHTML = icons.map((e, i) => `<span style="font-size:${i === 1 ? '44px' : '34px'}; line-height:1;">${e}</span>`).join('');

  document.getElementById('hud-ev-title').textContent = ev.title;
  document.getElementById('hud-ev-body').textContent = APP_STATE.reading === '??' ? (ev.body.substring(0, 68) + '?') : ev.body;

  // Known, Unknown, Affected Parties info
  document.getElementById('hud-ev-info-card').innerHTML = `
    <div class="ev-info-line"><span class="ev-info-icon">??</span><span>${ev.known}</span></div>
    <div class="ev-info-line"><span class="ev-info-icon">?</span><span>${ev.unknown}</span></div>
    <div class="ev-info-line"><span class="ev-info-icon">??</span><span>${ev.affected}</span></div>
  `;

  // Relationship Matrix
  const relList = document.getElementById('hud-relations-list');
  relList.innerHTML = '';
  Object.keys(g.rel).forEach(k => {
    const r = g.rel[k];
    const stageColor = r.stage >= 3 ? '#e0492c' : r.stage >= 1 ? '#eaa93c' : '#4aa87f';
    const bars = [0, 1, 2, 3, 4, 5].map(i => `<span class="rel-stage-cell" style="background:${i <= r.stage ? stageColor : '#dde7ec'};"></span>`).join('');

    const row = document.createElement('div');
    row.className = 'rel-faction-row';
    row.innerHTML = `
      <div class="rel-faction-avatar" style="background:${FACTION_COLOR[k]};">
        ${FACTION_GLYPH[k]}
        <span class="rel-faction-mood">${getMoodEmoji(r.trust)}</span>
      </div>
      <span class="rel-faction-name">${FACTIONS[k]}</span>
      <div class="rel-stage-bars">${bars}</div>
    `;
    relList.appendChild(row);
  });
}

function renderEventOptionsBar(g, ev) {
  const container = document.getElementById('options-cards-row');
  container.innerHTML = '';
  if (!ev) return;

  ev.opts.forEach(opt => {
    const isLocked = !checkOptionRequirements(g, opt);
    const btn = document.createElement('button');
    btn.className = 'opt-choice-card' + (isLocked ? ' locked' : '');
    btn.disabled = isLocked;

    const chips = [];
    if (opt.res) {
      Object.keys(opt.res).forEach(k => {
        const delta = opt.res[k];
        const meta = RES_META[k];
        if (!meta) return;
        chips.push({
          glyph: meta.g,
          sign: delta > 0 ? ('?' + delta) : ('?' + Math.abs(delta)),
          bg: delta > 0 ? '#d1f0d8' : '#fde8e8',
          fg: delta > 0 ? '#2a6a3a' : '#a31b1b'
        });
      });
    }

    btn.innerHTML = `
      <span class="opt-card-icon">${opt.ic}</span>
      <span class="opt-card-label">${opt.label}</span>
      <div class="opt-chips-wrap">
        ${chips.map(c => `<span class="opt-delta-chip" style="background:${c.bg}; color:${c.fg};">${c.glyph}${c.sign}</span>`).join('')}
      </div>
      ${isLocked ? `<span class="opt-lock-hint">?? ${opt.lockNote || '????'}</span>` : ''}
    `;

    if (!isLocked) {
      btn.onclick = () => handleOptionChoice(ev, opt);
    }
    container.appendChild(btn);
  });
}

function renderFeedbackModal(g) {
  const fb = APP_STATE.fb;
  if (!fb) return;

  const hasGain = fb.deltas.some(d => d.diff > 0);
  const hasLoss = fb.deltas.some(d => d.diff < 0);
  document.getElementById('fb-modal-face').textContent = (hasGain && hasLoss) ? '??' : hasGain ? '??' : '??';
  document.getElementById('fb-modal-choice').textContent = fb.choice;
  document.getElementById('fb-modal-narrative').textContent = fb.text;

  const deltasBox = document.getElementById('fb-modal-deltas');
  deltasBox.innerHTML = '';
  fb.deltas.forEach(d => {
    const meta = RES_META[d.key];
    if (!meta) return;
    const chip = document.createElement('span');
    chip.className = 'fb-dialog-delta-chip';
    chip.style.background = d.diff > 0 ? '#d1f0d8' : '#fde8e8';
    chip.style.color = d.diff > 0 ? '#2a6a3a' : '#a31b1b';
    chip.innerHTML = `<span>${meta.g}</span><span>${d.diff > 0 ? ('?' + d.diff) : ('?' + Math.abs(d.diff))} ${meta.label}</span>`;
    deltasBox.appendChild(chip);
  });

  const missedEl = document.getElementById('fb-modal-missed');
  if (fb.missed) {
    missedEl.style.display = 'block';
    missedEl.textContent = '?? ???????' + fb.missed;
  } else {
    missedEl.style.display = 'none';
  }

  document.getElementById('btn-advance-turn').textContent = g.turn >= g.turnsTotal ? '?? ???' : '? ????';
  document.getElementById('btn-undo-reconsider').style.display = (!APP_STATE.reconsidered && APP_STATE.snapshot) ? 'block' : 'none';
}

function renderZoneDetailPopup() {
  const panel = document.getElementById('zone-detail-panel');
  if (!APP_STATE.selectedZone) {
    panel.style.display = 'none';
    return;
  }

  const zone = ZONES_DATA.find(z => z.id === APP_STATE.selectedZone);
  if (!zone) {
    panel.style.display = 'none';
    return;
  }

  panel.style.display = 'flex';
  document.getElementById('zone-glyph-icon').textContent = zone.glyph;
  document.getElementById('zone-title-name').textContent = zone.name;
  document.getElementById('zone-env-desc').textContent = zone.env;

  const list = document.getElementById('zone-rights-list');
  list.innerHTML = '';
  zone.rights.forEach(r => {
    const icon = RIGHT_ICONS_MAP[r.type] || '??';
    const row = document.createElement('div');
    row.className = 'zone-right-entry';
    row.innerHTML = `
      <span class="zone-right-entry-icon">${icon}</span>
      <span class="zone-right-entry-main"><b>${r.faction}</b>?${r.type}</span>
      <span class="zone-right-entry-recog">${r.recognizedBy}</span>
    `;
    list.appendChild(row);
  });
}

function renderEndingScreen() {
  const ending = determineFinalEnding();
  const g = APP_STATE.g;
  document.getElementById('ending-glyph').textContent = ending.emoji;
  document.getElementById('ending-turns-count').textContent = (g ? g.turnsTotal : 10) + ' ?????';
  document.getElementById('ending-title-head').textContent = ending.title;
  document.getElementById('ending-body-desc').textContent = ending.body;

  const tagsBox = document.getElementById('ending-tags-container');
  tagsBox.innerHTML = (ending.tags || []).map(t => `<span class="ending-tag-pill"><span style="font-size:18px;">${t.g}</span>${t.t}</span>`).join('');

  document.getElementById('ending-reflection-prompt').textContent = '?? ????' + ending.reflect;
}

function renderReportScreen() {
  const g = APP_STATE.g;
  if (!g) return;

  const role = ROLES.find(r => r.id === g.roleId);
  const ending = determineFinalEnding();

  document.getElementById('report-player-meta').innerHTML = `
    <div><b>${role ? role.name : ''}</b></div>
    <div>?? ${g.code} ? ?? ${g.seed}</div>
  `;

  // Stat trends grid
  const statsGrid = document.getElementById('report-stats-grid');
  statsGrid.innerHTML = '';
  Object.keys(RES_META).forEach(k => {
    const meta = RES_META[k];
    const card = document.createElement('div');
    card.className = 'stat-trend-card';
    card.innerHTML = `
      <span class="stat-trend-icon">${meta.g}</span>
      <div>
        <div class="stat-trend-label">${meta.label}</div>
        <div class="stat-trend-val">${getTrendSummary(g.start[k], g.res[k])}</div>
      </div>
    `;
    statsGrid.appendChild(card);
  });

  // History list
  const historyBox = document.getElementById('report-history-list');
  historyBox.innerHTML = '';
  g.history.forEach(h => {
    const row = document.createElement('div');
    row.className = 'history-entry-row';
    row.innerHTML = `
      <span class="history-turn-number">${h.turn}</span>
      <div class="history-entry-details">
        <span class="history-entry-title">${h.title}</span>
        <span class="history-entry-choice">?? ${h.choice}</span>
        <span class="history-entry-note">${h.note}</span>
      </div>
    `;
    historyBox.appendChild(row);
  });

  // Agreements & Max Conflict Stage
  document.getElementById('report-agreements-text').innerHTML = `?? ${g.agreements.length ? g.agreements.join('?') : '????????'}`;
  const maxStage = Math.max(...Object.keys(g.rel).map(k => g.rel[k].stage), 0);
  document.getElementById('report-maxstage-text').innerHTML = `?? ??????${STAGE_LABELS[maxStage] || '????'}`;

  // Reflections
  const refBox = document.getElementById('report-reflections-container');
  refBox.innerHTML = '';
  const questions = [
    ending.reflect,
    '???????????????????????',
    '????????????????????'
  ];
  questions.forEach(q => {
    const div = document.createElement('div');
    div.className = 'report-reflect-entry';
    div.textContent = q;
    refBox.appendChild(div);
  });
}

function handleExportSaveJson() {
  const g = APP_STATE.g;
  if (!g) return;
  const jsonStr = JSON.stringify(g, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `langqiao-${g.roleId}-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// -------------------------------------------------------------
// EVENT LISTENERS BINDING & INITIALIZATION
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Home buttons
  document.getElementById('btn-home-start').onclick = () => {
    APP_STATE.screen = 'role';
    renderApplication();
  };

  document.getElementById('btn-home-continue').onclick = () => {
    if (APP_STATE.savedGame) {
      APP_STATE.g = APP_STATE.savedGame;
      APP_STATE.turnsTotal = APP_STATE.savedGame.turnsTotal || 10;
      APP_STATE.screen = 'game';
      APP_STATE.phase = 'event';
      renderApplication();
    }
  };

  document.getElementById('btn-home-teacher').onclick = () => {
    APP_STATE.showTeacher = !APP_STATE.showTeacher;
    document.getElementById('teacher-panel-container').style.display = APP_STATE.showTeacher ? 'grid' : 'none';
  };

  document.getElementById('seed-input-box').oninput = e => {
    APP_STATE.seed = e.target.value.trim() || 'langqiao-01';
  };

  // Role screen back
  document.getElementById('btn-role-back').onclick = () => {
    APP_STATE.screen = 'home';
    renderApplication();
  };

  // Game screen buttons
  document.getElementById('btn-game-to-home').onclick = () => {
    if (confirm('??????????????????????')) {
      APP_STATE.screen = 'home';
      renderApplication();
    }
  };

  document.getElementById('btn-close-zone-panel').onclick = () => {
    APP_STATE.selectedZone = null;
    renderGameScreen();
  };

  document.getElementById('btn-advance-turn').onclick = () => handleAdvanceNextTurn();
  document.getElementById('btn-undo-reconsider').onclick = () => handleReconsiderOption();

  // Ending screen buttons
  document.getElementById('btn-view-decision-report').onclick = () => {
    APP_STATE.screen = 'report';
    renderApplication();
  };

  document.getElementById('btn-ending-back-home').onclick = () => {
    APP_STATE.screen = 'home';
    renderApplication();
  };

  // Report screen buttons
  document.getElementById('btn-print-report').onclick = () => window.print();
  document.getElementById('btn-export-save-json').onclick = () => handleExportSaveJson();
  document.getElementById('btn-report-back-home').onclick = () => {
    APP_STATE.screen = 'home';
    renderApplication();
  };

  // Check saved game on load
  APP_STATE.savedGame = loadActiveGame();

  renderApplication();
});
