// ExBlock yeniden yapım — oyun motoru.
// Mantıksal alan 1264×948: referans karelerindeki oyun görüntüsünün piksel
// ölçeği. Böylece levels.js ve aşağıdaki ölçüler doğrudan karelerden okunabilir.
(function () {
  'use strict';

  const W = 1264, H = 948;
  const HUD_H = 58, WALL_L = 32, WALL_R = 1235, FIELD_TOP = HUD_H + 4;
  const GRID = window.EXBLOCK_GRID;
  const LEVELS = window.EXBLOCK_LEVELS;

  // Kurallar. "gözlem" olmayan her değer, normal hızlı video incelenene kadar
  // varsayımdır; ayrıntılar ORIGINAL-ANALYSIS.md içinde.
  const RULES = {
    startLives: 5,        // gözlem (orta): 0010.jpg puan 0 iken X 5
    brickScore: 1000,     // varsayım (düşük): 0030→0035 son tuğla + geçiş = +1000
    stripedHits: 2,       // varsayım: çizgili blokların işlevi bilinmiyor
    metalBreakable: false, // varsayım: metal bloklar bölüm bitişine sayılmıyor
    ballSpeed: 560,       // varsayım (px/s, 1264 px genişlikte)
    ballSpeedMax: 900,    // varsayım
    paddleSpeed: 950,     // varsayım
    maxBounce: 1.05,      // varsayım (radyan, ~60°)
    laserTime: 12,        // varsayım (s), yalnızca debug
  };

  const PADDLE = { w: 194, h: 30, y: 893 };   // gözlem: 0010/0035 kareleri
  const BALL_R = 16;                           // gözlem: ~34 px çap

  const COLORS = {
    red: '#d9542f', blue: '#4b86da', yellow: '#ecd23f', green: '#4dbd3a', purple: '#c48fe2',
    'red-s': '#d83a2c', 'purple-s': '#9c8fe0', 'green-s': '#6cbb3a', 'silver-s': '#d9dde6', metal: '#bcb99c',
  };

  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = W; canvas.height = H;
  const debug = new URLSearchParams(location.search).has('debug');

  // ---------- kayıt (Continue) ----------
  const SAVE_KEY = 'exblock-save-v1';
  const save = {
    read() { try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch { return null; } },
    write(d) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(d)); } catch { /* yok say */ } },
    clear() { try { localStorage.removeItem(SAVE_KEY); } catch { /* yok say */ } },
  };

  // ---------- arka plan ----------
  function rng(seed) { return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const bg = document.createElement('canvas');
  bg.width = W; bg.height = H;
  (function paintBackground() {
    const g = bg.getContext('2d'), rand = rng(7);
    g.fillStyle = '#020207'; g.fillRect(0, 0, W, H);
    // Nebulalar: konumlar referans karelerindeki sabit arka plandan.
    const nebulae = [
      [345, 335, 170, '150,40,140', 0.55, '220,120,220'],
      [1030 - 123 + 20, 560, 230, '40,120,30', 0.6, '90,200,70'],
      [755, 200, 95, '30,110,30', 0.55, '90,190,80'],
      [1060, 245, 85, '30,130,110', 0.55, '90,220,190'],
      [1000, 560, 70, '170,80,30', 0.35, '240,120,60'],
      [160, 185, 40, '120,40,80', 0.4, '200,80,120'],
    ];
    for (const [x, y, r, rgb, a, speck] of nebulae) {
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(0.6, `rgba(${rgb},${a * 0.45})`); gr.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      for (let i = 0; i < r * 2.2; i++) {
        const ang = rand() * Math.PI * 2, d = Math.sqrt(rand()) * r * 0.9;
        g.fillStyle = `rgba(${speck},${0.25 + rand() * 0.5})`;
        g.fillRect(x + Math.cos(ang) * d, y + Math.sin(ang) * d, 2, 2);
      }
    }
    for (let i = 0; i < 420; i++) {
      const s = rand() < 0.08 ? 3 : rand() < 0.4 ? 2 : 1;
      g.fillStyle = `rgba(255,255,255,${0.35 + rand() * 0.6})`;
      g.fillRect(rand() * W, FIELD_TOP + rand() * (H - FIELD_TOP), s, s);
    }
  })();

  // ---------- durum ----------
  const MENU = ['New Game', 'Continue', 'Exit'];
  const S = {
    mode: 'menu', menuIndex: 0, levelIndex: 0, score: 0, lives: RULES.startLives,
    bricks: [], balls: [], shots: [], paddleX: (W - PADDLE.w) / 2, laser: 0,
    timer: 0, paused: false,
  };
  const keys = new Set();

  const cellRect = (c, r) => ({ x: GRID.x0 + c * GRID.cw, y: GRID.y0 + r * GRID.ch, w: GRID.cw, h: GRID.ch });
  const cellsOf = (b) => b.cells || Array.from({ length: b.w * b.h }, (_, i) => [b.c + (i % b.w), b.r + Math.floor(i / b.w)]);

  function buildLevel() {
    S.bricks = LEVELS[S.levelIndex].bricks.map((b) => {
      const cells = cellsOf(b);
      const set = new Set(cells.map(([c, r]) => c + ',' + r));
      const metal = b.t === 'metal';
      return {
        t: b.t, cells, set, rects: cells.map(([c, r]) => cellRect(c, r)), alive: true, flash: 0,
        hits: metal ? (RULES.metalBreakable ? 3 : Infinity) : b.t.endsWith('-s') ? RULES.stripedHits : 1,
        required: !metal || RULES.metalBreakable,
      };
    });
  }

  function dockBall() {
    S.balls = [{ x: 0, y: 0, vx: 0, vy: 0, docked: true }];
    S.shots = []; S.laser = 0;
    syncDocked();
  }
  function syncDocked() {
    for (const b of S.balls) if (b.docked) { b.x = S.paddleX + PADDLE.w / 2; b.y = PADDLE.y - BALL_R - 1; }
  }

  function startLevel(index) {
    S.levelIndex = index;
    buildLevel();
    S.paddleX = (W - PADDLE.w) / 2;
    dockBall();
    S.mode = 'intro'; S.timer = 2.2; S.paused = false;
    save.write({ levelIndex: index, score: S.score, lives: S.lives });
  }

  function newGame() { S.score = 0; S.lives = RULES.startLives; startLevel(0); }
  function continueGame() {
    const d = save.read();
    if (!d || !LEVELS[d.levelIndex]) return false;
    S.score = d.score; S.lives = d.lives; startLevel(d.levelIndex);
    return true;
  }

  function menuSelect() {
    const item = MENU[S.menuIndex];
    if (item === 'New Game') newGame();
    else if (item === 'Continue') continueGame();
    else S.mode = 'exit';
  }

  function launch() {
    if (S.mode === 'intro') { S.mode = 'play'; S.timer = 0; }
    if (S.mode !== 'play' || S.paused) return;
    const docked = S.balls.find((b) => b.docked);
    if (docked) {
      docked.docked = false;
      const a = -0.45;
      docked.vx = Math.sin(a) * RULES.ballSpeed; docked.vy = -Math.cos(a) * RULES.ballSpeed;
    } else if (S.laser > 0 && S.shots.length < 4) {
      for (const dx of [26, PADDLE.w - 26]) S.shots.push({ x: S.paddleX + dx, y: PADDLE.y - 4 });
    }
  }

  // ---------- fizik ----------
  function hitBrick(br) {
    if (!Number.isFinite(br.hits)) { br.flash = 0.15; return; }
    br.hits--; br.flash = 0.15;
    if (br.hits <= 0) { br.alive = false; S.score += RULES.brickScore; }
  }

  function collideBall(b, px, py) {
    for (const br of S.bricks) {
      if (!br.alive) continue;
      for (const r of br.rects) {
        const nx = Math.max(r.x, Math.min(b.x, r.x + r.w)), ny = Math.max(r.y, Math.min(b.y, r.y + r.h));
        if ((b.x - nx) ** 2 + (b.y - ny) ** 2 > BALL_R * BALL_R) continue;
        const fromSide = px + BALL_R <= r.x || px - BALL_R >= r.x + r.w;
        if (fromSide) { b.vx = -b.vx; b.x = px; } else { b.vy = -b.vy; b.y = py; }
        hitBrick(br);
        return;
      }
    }
  }

  function stepBall(b, dt) {
    const px = b.x, py = b.y;
    b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.x < WALL_L + BALL_R) { b.x = WALL_L + BALL_R; b.vx = Math.abs(b.vx); }
    if (b.x > WALL_R - BALL_R) { b.x = WALL_R - BALL_R; b.vx = -Math.abs(b.vx); }
    if (b.y < FIELD_TOP + BALL_R) { b.y = FIELD_TOP + BALL_R; b.vy = Math.abs(b.vy); }
    if (b.vy > 0 && py + BALL_R <= PADDLE.y + 2 && b.y + BALL_R >= PADDLE.y &&
        b.x >= S.paddleX - BALL_R && b.x <= S.paddleX + PADDLE.w + BALL_R) {
      b.y = PADDLE.y - BALL_R;
      const off = Math.max(-1, Math.min(1, (b.x - (S.paddleX + PADDLE.w / 2)) / (PADDLE.w / 2)));
      const speed = Math.min(RULES.ballSpeedMax, Math.hypot(b.vx, b.vy) + 6);
      b.vx = Math.sin(off * RULES.maxBounce) * speed; b.vy = -Math.cos(off * RULES.maxBounce) * speed;
      return;
    }
    collideBall(b, px, py);
    // Neredeyse yatay sonsuz döngüyü önle.
    if (Math.abs(b.vy) < 90) { b.vy = b.vy < 0 ? -90 : 90; }
  }

  function update(dt) {
    if (S.paused) return;
    for (const br of S.bricks) if (br.flash > 0) br.flash -= dt;
    if (S.mode === 'intro') { S.timer -= dt; if (S.timer <= 0) S.mode = 'play'; }
    if (S.mode !== 'play' && S.mode !== 'intro') return;

    const dir = (keys.has('right') ? 1 : 0) - (keys.has('left') ? 1 : 0);
    S.paddleX = Math.max(WALL_L, Math.min(WALL_R - PADDLE.w, S.paddleX + dir * RULES.paddleSpeed * dt));
    syncDocked();
    if (S.mode !== 'play') return;

    if (S.laser > 0) S.laser -= dt;
    for (const b of S.balls) if (!b.docked) stepBall(b, dt);
    S.balls = S.balls.filter((b) => b.y - BALL_R < H);

    for (const s of S.shots) {
      s.y -= 1500 * dt;
      for (const br of S.bricks) {
        if (!br.alive || s.dead) continue;
        if (br.rects.some((r) => s.x >= r.x && s.x <= r.x + r.w && s.y >= r.y && s.y <= r.y + r.h)) { hitBrick(br); s.dead = true; }
      }
    }
    S.shots = S.shots.filter((s) => !s.dead && s.y > FIELD_TOP);

    if (S.balls.length === 0) {
      if (S.lives === 0) { S.mode = 'gameover'; save.clear(); return; }
      S.lives--; dockBall();
      save.write({ levelIndex: S.levelIndex, score: S.score, lives: S.lives });
    }
    if (S.bricks.every((b) => !b.alive || !b.required)) {
      if (S.levelIndex + 1 < LEVELS.length) startLevel(S.levelIndex + 1);
      else { S.mode = 'end'; save.clear(); }
    }
  }

  // ---------- çizim ----------
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const f = (v) => Math.max(0, Math.min(255, Math.round(amt >= 0 ? v + (255 - v) * amt : v * (1 + amt))));
    return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
  }

  function drawBrick(br) {
    const base = COLORS[br.t];
    const B = 6; // kabartma kalınlığı
    for (let i = 0; i < br.cells.length; i++) {
      const [c, r] = br.cells[i], rc = br.rects[i];
      const top = !br.set.has(c + ',' + (r - 1)), bottom = !br.set.has(c + ',' + (r + 1));
      const left = !br.set.has(c - 1 + ',' + r), right = !br.set.has(c + 1 + ',' + r);
      const x = rc.x + (left ? 2 : 0), y = rc.y + (top ? 2 : 0);
      const w = rc.w - (left ? 2 : 0) - (right ? 2 : 0), h = rc.h - (top ? 2 : 0) - (bottom ? 2 : 0);
      ctx.fillStyle = br.flash > 0 ? shade(base, 0.45) : base;
      ctx.fillRect(x, y, w, h);
      if (br.t.endsWith('-s') || br.t === 'metal') {
        ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
        ctx.strokeStyle = br.t === 'metal' ? 'rgba(255,255,240,.45)' : 'rgba(255,255,255,.38)';
        ctx.lineWidth = 9;
        for (let k = -2; k < 4; k++) {
          const sx = GRID.x0 + (c + k * 0.55) * GRID.cw;
          ctx.beginPath(); ctx.moveTo(sx, rc.y + rc.h); ctx.lineTo(sx + rc.h * 0.7, rc.y); ctx.stroke();
        }
        ctx.restore();
      }
      if (br.t === 'metal') {
        ctx.fillStyle = 'rgba(70,70,55,.6)';
        for (const [dx, dy] of [[8, 8], [w - 11, 8], [8, h - 11], [w - 11, h - 11]]) ctx.fillRect(x + dx, y + dy, 3, 3);
      }
      ctx.fillStyle = shade(base, 0.55);
      if (top) ctx.fillRect(x, y, w, B);
      if (left) ctx.fillRect(x, y, B, h);
      ctx.fillStyle = shade(base, -0.45);
      if (bottom) ctx.fillRect(x, y + h - B, w, B);
      if (right) ctx.fillRect(x + w - B, y, B, h);
    }
  }

  function drawPaddle() {
    const x = S.paddleX, y = PADDLE.y, w = PADDLE.w, h = PADDLE.h;
    const laser = S.laser > 0;
    const body = ctx.createLinearGradient(0, y, 0, y + h);
    if (laser) { body.addColorStop(0, '#ffe08a'); body.addColorStop(0.5, '#e08a2a'); body.addColorStop(1, '#7a3a10'); }
    else { body.addColorStop(0, '#b8ff8a'); body.addColorStop(0.45, '#4fcf3a'); body.addColorStop(1, '#1d6a17'); }
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.roundRect(x + 6, y + 3, w - 12, h - 6, 12); ctx.fill();
    for (const ex of [x + 10, x + w - 24]) {
      const cap = ctx.createLinearGradient(ex, 0, ex + 14, 0);
      cap.addColorStop(0, '#ffd23a'); cap.addColorStop(0.5, '#fff3a0'); cap.addColorStop(1, '#d24a1f');
      ctx.fillStyle = cap; ctx.fillRect(ex, y - 2, 14, h + 4);
      ctx.fillStyle = '#c2381b'; ctx.fillRect(ex + 4, y + h + 2, 6, 6);
    }
    if (laser) { ctx.fillStyle = '#fff6c0'; for (const dx of [26, w - 26]) ctx.fillRect(x + dx - 3, y - 14, 6, 14); }
  }

  function drawBall(b) {
    const g = ctx.createRadialGradient(b.x - 5, b.y - 5, 2, b.x, b.y, BALL_R);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.6, '#cfd3d8'); g.addColorStop(1, '#7b8088');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2); ctx.fill();
  }

  function outlinedText(text, x, y, size, fill, align = 'left') {
    ctx.font = `900 ${size}px "Arial Black", Impact, sans-serif`;
    ctx.textAlign = align; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(4, size / 7); ctx.strokeStyle = '#2a1650';
    ctx.strokeText(text, x, y); ctx.fillStyle = fill; ctx.fillText(text, x, y);
  }

  function drawFrame() {
    // Yan duvarlar
    for (const [x, w] of [[0, WALL_L], [WALL_R, W - WALL_R]]) {
      const g = ctx.createLinearGradient(x, 0, x + w, 0);
      g.addColorStop(0, '#1d1470'); g.addColorStop(0.5, '#5b4fd0'); g.addColorStop(1, '#1d1470');
      ctx.fillStyle = g; ctx.fillRect(x, 0, w, H);
    }
    ctx.fillStyle = 'rgba(200,195,255,.55)';
    ctx.fillRect(WALL_L - 3, HUD_H, 3, H - HUD_H); ctx.fillRect(WALL_R, HUD_H, 3, H - HUD_H);
    // HUD çubuğu
    const g = ctx.createLinearGradient(0, 0, 0, HUD_H);
    g.addColorStop(0, '#6d61d8'); g.addColorStop(0.5, '#3d2fa0'); g.addColorStop(1, '#241878');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, HUD_H);
    ctx.fillStyle = '#ddd8ff'; ctx.fillRect(28, 12, 18, HUD_H - 22); ctx.fillRect(W - 46, 12, 18, HUD_H - 22);
    const mid = ctx.createLinearGradient(0, 14, 0, HUD_H - 10);
    mid.addColorStop(0, '#ffffff'); mid.addColorStop(0.5, '#c9c3f2'); mid.addColorStop(1, '#8e86d8');
    ctx.fillStyle = mid; ctx.fillRect(285, 16, 400, HUD_H - 28);
    // Can göstergesi: çubuk simgesi + X n
    const icon = ctx.createLinearGradient(0, 22, 0, 38);
    icon.addColorStop(0, '#b8ff8a'); icon.addColorStop(1, '#2a8a20');
    ctx.fillStyle = icon; ctx.beginPath(); ctx.roundRect(66, 22, 96, 16, 8); ctx.fill();
    ctx.fillStyle = '#ffcf3a'; ctx.fillRect(70, 20, 6, 20); ctx.fillRect(152, 20, 6, 20);
    outlinedText('X ' + S.lives, 176, HUD_H / 2 + 2, 38, '#f4ecb0');
    outlinedText('SCORE', 692, HUD_H / 2 + 2, 38, '#f4ecb0');
    const digits = ctx.createLinearGradient(0, 12, 0, HUD_H - 8);
    digits.addColorStop(0, '#fff2a0'); digits.addColorStop(0.55, '#f2b52a'); digits.addColorStop(1, '#b86a12');
    outlinedText(String(S.score).padStart(8, '0'), 862, HUD_H / 2 + 2, 38, digits);
  }

  function drawStageBanner() {
    const lv = LEVELS[S.levelIndex];
    const label = lv.stage ? 'Stage ' + lv.stage : 'Stage ?';
    const g = ctx.createLinearGradient(0, 230, 0, 330);
    g.addColorStop(0, '#fff6a0'); g.addColorStop(0.5, '#f5c23a'); g.addColorStop(1, '#d4641a');
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowOffsetY = 6;
    outlinedText(label, W / 2, 285, 110, g, 'center');
    ctx.restore();
    if (!lv.stage) outlinedText('(bölüm numarası doğrulanmadı)', W / 2, 365, 26, '#e8e2ff', 'center');
  }

  function panel(title, lines) {
    ctx.fillStyle = 'rgba(4,4,18,.78)'; ctx.fillRect(260, 330, 744, 230);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.strokeRect(260, 330, 744, 230);
    outlinedText(title, W / 2, 400, 58, '#ffd84a', 'center');
    lines.forEach((l, i) => outlinedText(l, W / 2, 470 + i * 42, 26, '#e8e2ff', 'center'));
  }

  function drawMenu() {
    const t = ctx.createLinearGradient(0, 160, 0, 300);
    t.addColorStop(0, '#fff6a0'); t.addColorStop(0.5, '#f5c23a'); t.addColorStop(1, '#d4641a');
    outlinedText('ExBlock', W / 2, 240, 140, t, 'center');
    const hasSave = !!save.read();
    MENU.forEach((item, i) => {
      const y = 470 + i * 110;
      const off = item === 'Continue' && !hasSave;
      outlinedText(item, W / 2, y, 64, off ? '#8f8a6a' : '#ffd84a', 'center');
      if (i === S.menuIndex) { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5; ctx.strokeRect(W / 2 - 250, y - 46, 500, 92); }
    });
  }

  function draw() {
    ctx.drawImage(bg, 0, 0);
    drawFrame();
    if (S.mode === 'menu') { drawMenu(); return; }
    if (S.mode === 'exit') { panel('Exit', ['Enter / Boşluk: menüye dön']); return; }
    for (const br of S.bricks) if (br.alive) drawBrick(br);
    ctx.fillStyle = '#fff6c0';
    for (const s of S.shots) ctx.fillRect(s.x - 3, s.y - 26, 6, 26);
    drawPaddle();
    for (const b of S.balls) drawBall(b);
    if (S.mode === 'intro') drawStageBanner();
    if (S.paused) panel('Pause', ['Devam etmek için P']);
    if (S.mode === 'gameover') panel('Game Over', ['Enter / Boşluk: menü']);
    if (S.mode === 'end') panel('Doğrulanmış haritalar bitti', ['Sonraki bölümler henüz videodan çıkarılmadı.', 'Enter / Boşluk: menü']);
    if (debug) {
      const lv = LEVELS[S.levelIndex];
      ctx.font = '20px monospace'; ctx.textAlign = 'left'; ctx.fillStyle = '#9cf';
      ctx.fillText(`${lv.id} · ${lv.source} · güven: ${lv.confidence} · 1:çoklu top 2:lazer N:sonraki`, 40, H - 12);
    }
  }

  // ---------- giriş ----------
  function confirm() {
    if (S.mode === 'menu') menuSelect();
    else if (S.mode === 'exit' || S.mode === 'gameover' || S.mode === 'end') S.mode = 'menu';
    else launch();
  }
  function menuMove(d) {
    if (S.mode !== 'menu') return;
    S.menuIndex = (S.menuIndex + d + MENU.length) % MENU.length;
  }
  function togglePause() { if (S.mode === 'play' || S.mode === 'intro') S.paused = !S.paused; }

  const KEYMAP = { arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right' };
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' ', 'enter'].includes(k)) e.preventDefault();
    if (KEYMAP[k]) keys.add(KEYMAP[k]);
    if (e.repeat) return;
    if (k === ' ' || k === 'enter') confirm();
    else if (k === 'arrowup' || k === 'w') menuMove(-1);
    else if (k === 'arrowdown' || k === 's') menuMove(1);
    else if (k === 'p') togglePause();
    else if (k === 'escape') { S.mode = 'menu'; S.paused = false; }
    else if (debug && S.mode === 'play') {
      if (k === '1') {
        const src = S.balls.find((b) => !b.docked);
        if (src) for (const a of [-0.5, 0.5]) {
          const c = Math.cos(a), s = Math.sin(a);
          S.balls.push({ x: src.x, y: src.y, vx: src.vx * c - src.vy * s, vy: src.vx * s + src.vy * c, docked: false });
        }
      } else if (k === '2') S.laser = RULES.laserTime;
      else if (k === 'n') { for (const b of S.bricks) b.alive = false; }
    }
  });
  window.addEventListener('keyup', (e) => { const k = KEYMAP[e.key.toLowerCase()]; if (k) keys.delete(k); });
  window.addEventListener('blur', () => { keys.clear(); if (S.mode === 'play') S.paused = true; });

  for (const [id, key] of [['left', 'left'], ['right', 'right']]) {
    const el = document.getElementById(id);
    el.addEventListener('pointerdown', (e) => {
      el.setPointerCapture(e.pointerId); keys.add(key);
      menuMove(key === 'left' ? -1 : 1);
    });
    for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) el.addEventListener(ev, () => keys.delete(key));
  }
  let dragging = false;
  const toLogical = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height };
  };
  canvas.addEventListener('pointerdown', (e) => {
    const p = toLogical(e);
    if (S.mode === 'menu') {
      const i = Math.round((p.y - 470) / 110);
      if (i >= 0 && i < MENU.length) { S.menuIndex = i; menuSelect(); }
      return;
    }
    dragging = true; canvas.setPointerCapture(e.pointerId);
    S.paddleX = Math.max(WALL_L, Math.min(WALL_R - PADDLE.w, p.x - PADDLE.w / 2));
  });
  canvas.addEventListener('pointermove', (e) => {
    if (dragging && !S.paused) S.paddleX = Math.max(WALL_L, Math.min(WALL_R - PADDLE.w, toLogical(e).x - PADDLE.w / 2));
  });
  for (const ev of ['pointerup', 'pointercancel']) canvas.addEventListener(ev, () => { dragging = false; });
  document.getElementById('play').onclick = confirm;
  document.getElementById('pause').onclick = togglePause;
  document.getElementById('menu').onclick = () => { S.mode = 'menu'; S.paused = false; };

  // ---------- döngü ----------
  const STEP = 1 / 240;
  let last = performance.now(), acc = 0;
  function frame(t) {
    acc += Math.min((t - last) / 1000, 0.05); last = t;
    while (acc >= STEP) { update(STEP); acc -= STEP; }
    draw();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Tarayıcı testleri için.
  window.__exblock = { S, RULES, LEVELS, startLevel, newGame };
})();
