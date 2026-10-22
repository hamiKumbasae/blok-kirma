// BlokYıldızı — oyun motoru (ExBlock'tan esinlenen hayran yapımı).
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
    brickScore: 1000,     // gözlem (yüksek): birinci.mov, her kırılan tuğla +1000
    paddleScore: 100,     // gözlem (yüksek): birinci.mov, top çubuğa her çarpışta +100
    bonusScore: 10000,    // gözlem (yüksek): birinci.mov, baloncuk yakalanınca +10000
    bonusChance: 0.2,     // varsayım: Stage 2'de ~46 tuğladan ~10 baloncuk (videom_parca_01)
    // Baloncuk türleri: lazer, can (gözlem), 3'lü top ve genişlik (kullanıcının
    // hatırladığı). Oranlar varsayım.
    bonusShares: { laser: 0.16, triple: 0.15, wide: 0.14, shrink: 0.1, slow: 0.1, fast: 0.08, life: 0.07 },
    shrinkW: 130,         // varsayım: kısa çubuk (ceza)
    slowMul: 0.7, fastMul: 1.4, // varsayım: yavaşlatma / hızlandırma çarpanları
    fireChance: 0.05,     // varsayım: kırılan tuğladan ateş topu çıkma olasılığı
    fireSpeed: 2.2,       // varsayım: ateş topu normal topun ~2 katı hızlı (kullanıcı)
    fireR: 24,            // gözlem (orta): videodaki turuncu top normalden büyük
    wideW: 290,           // varsayım: geniş çubuk (normal 194); kullanıcının listesi: uzatma, kısaltma, çoklu top, lazer, yavaşlatma/hızlandırma
    laserInterval: 0.3,   // varsayım (s): lazer çubuk kendiliğinden çift ışın atar
    creatureScore: 50000, // gözlem (yüksek): yaratık yok edildiği karede +50000
    creatureFirst: 2.5,   // gözlem (orta): Stage 1'de ilk yaratık ~2.5 sn sonra
    creatureEvery: 7,     // varsayım (s)
    creatureMax: 4,       // gözlem (orta): Stage 3'te aynı anda 4 yaratık
    creatureSpeed: 110,   // varsayım (px/s)
    bonusFall: 110,       // gözlem (orta): trim videoları, gerçek hız
    stripedHits: 2,       // gözlem (yüksek): ilk vuruşta çizgiler gider, ikincide kırılır
    moverSpeed: 45,       // gözlem (orta): Stage 6/9 hareketli kareler, gerçek hız
    towerPeriod: 5.9,     // gözlem (orta): Stage 4 kuleleri ~5.9 sn'de bir ortada buluşur
    towerLag: 0.12,       // gözlem (düşük): kule sıraları hafif dalgalı kayıyor (radyan/sıra)
    metalBreakable: false, // varsayım: metal bloklar bölüm bitişine sayılmıyor
    ballSpeed: 230,       // kullanıcı isteği: orijinal (~135 px/s) çok yavaş geldi
    ballStageStep: 4,     // bölüm başına hafif hızlanma (74 bölümde ~+290)
    ballSpeedMax: 520,    // varsayım
    paddleSpeed: 620,     // hızlı topa yetişsin diye artırıldı (orijinal ~340)
    shotSpeed: 700,       // varsayım (lazer ışını)
    maxBounce: 0.9,       // varsayım (radyan, ~52°); çubuk kenarında top yana yatıp yavaş görünmesin
    laserTime: 12,        // varsayım (s), yalnızca debug
  };

  const PADDLE = { w: 194, baseW: 194, h: 30, y: 893 };   // gözlem: 0010/0035 kareleri
  const BALL_R = 16;                           // gözlem: ~34 px çap

  const COLORS = {
    // Orijinal karelerden ölçülen ortanca renkler (çizgililerde parlak şerit payı düşüldü).
    red: '#c4371f', blue: '#3570c8', yellow: '#e3c001', green: '#00ae00', purple: '#a976cf',
    'red-s': '#b5261b', 'blue-s': '#6a9ad8', 'yellow-s': '#9c9018', 'purple-s': '#7870ac', 'violet-s': '#a35ec9', 'green-s': '#5e8c19', 'silver-s': '#b9bccb', metal: '#a1a580',
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
  const MENU = ['New Game', 'Continue', 'Stage Select', 'Exit'];
  // Stage Select bu yeniden yapıma eklendi; orijinal menüde yok.
  const MENU_Y0 = 520, MENU_DY = 100;
  const SEL = { cols: 10, x0: 28, y0: 92, w: 116, h: 96, gx: 7, gy: 6 };
  const S = {
    speedMul: 1, creatures: [], spawnT: 0, introT: 99, fireT: 0,
    selIndex: 0, selLimit: 0, selFrom: 'menu',
    mode: 'menu', menuIndex: 0, levelIndex: 0, score: 0, lives: RULES.startLives,
    bricks: [], balls: [], shots: [], effects: [], debris: [], bonuses: [], paddleX: (W - PADDLE.w) / 2, laser: 0,
    timer: 0, paused: false,
  };
  const keys = new Set();
  let infiniteLives = true;
  try { if (localStorage.getItem('blok-sonsuz') === '0') infiniteLives = false; } catch { /* yok say */ }

  const cellRect = (c, r) => {
    const x = Math.round(GRID.x0 + c * GRID.cw), y = Math.round(GRID.y0 + r * GRID.ch);
    return { x, y, w: Math.round(GRID.x0 + (c + 1) * GRID.cw) - x, h: Math.round(GRID.y0 + (r + 1) * GRID.ch) - y };
  };
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
        mover: !!b.move && b.move !== 'tower',
        tower: b.move === 'tower' ? { side: b.side, dc: b.dc } : null,
        // dir / speed / amp (hücre): Stage 23+ için bölüme özel hareket.
        vx: b.move ? (b.dir ?? (Math.round(b.c * 10) % 2 ? -1 : 1)) * (b.speed ?? RULES.moverSpeed) : 0,
        vy: b.move === true ? (b.r % 2 ? -0.5 : 0.5) * RULES.moverSpeed : 0,
        amp: b.amp ? b.amp * GRID.cw : 0, homeX: cellRect(cells[0][0], cells[0][1]).x,
      };
    });
  }

  function dockBall() {
    S.balls = [{ x: 0, y: 0, vx: 0, vy: 0, docked: true }];
    S.shots = []; S.laser = 0; S.bonuses = []; S.splitPending = false; S.fireT = 0; setPaddleW(PADDLE.baseW); S.speedMul = 1;
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
    S.mode = 'intro'; S.timer = 2.2; S.paused = false; S.introT = 0;
    S.creatures = []; S.spawnT = RULES.creatureFirst; S.levelT = 0;
    save.write({ levelIndex: index, score: S.score, lives: S.lives, max: Math.max(index, save.read()?.max ?? 0) });
  }

  function newGame() { S.score = 0; S.lives = RULES.startLives; startLevel(0); }
  // Orijinalde Continue, ulaşılan en yüksek bölüme kadar "Select Stage Using
  // V+/V-, Press OK to Start Game" ekranı açar; seçilen bölüm 0 puan ve 5 canla
  // başlar (kayit_trim_13–14).
  function continueGame() {
    const d = save.read();
    if (!d) return false;
    S.selLimit = Math.min(LEVELS.length - 1, d.max ?? d.levelIndex);
    S.selIndex = Math.min(d.levelIndex, S.selLimit);
    S.mode = 'select'; S.selFrom = 'continue';
    return true;
  }

  function menuSelect() {
    const item = MENU[S.menuIndex];
    if (item === 'New Game') newGame();
    else if (item === 'Continue') continueGame();
    else if (item === 'Stage Select') { S.mode = 'select'; S.selFrom = 'menu'; S.selLimit = LEVELS.length - 1; }
    else if (window.AndroidTV) window.AndroidTV.exit(); else S.mode = 'exit';
  }

  function launch() {
    if (S.mode === 'intro') { S.mode = 'play'; S.timer = 0; S.introT = 99; }
    if (S.mode !== 'play' || S.paused) return;
    const docked = S.balls.find((b) => b.docked);
    if (docked) {
      docked.docked = false;
      const a = -0.45;
      const v = (RULES.ballSpeed + RULES.ballStageStep * S.levelIndex) * S.speedMul;
      docked.vx = Math.sin(a) * v; docked.vy = -Math.cos(a) * v;
    } else if (S.laser > 0 && S.shots.length < 4) {
      for (const dx of [26, PADDLE.w - 26]) S.shots.push({ x: S.paddleX + dx, y: PADDLE.y - 4 });
    }
  }

  // ---------- fizik ----------
  // Kırılma: tuğla kısa süre kırmızı yanar, sonra iki altın halka ve gri
  // kırıntılar çıkar (birinci.mov). Bazı tuğlalardan bonus baloncuk düşer.
  function breakBrick(br) {
    br.alive = false; S.score += RULES.brickScore;
    const xs = br.rects.map((r) => r.x), ys = br.rects.map((r) => r.y);
    const x0 = Math.min(...xs), y0 = Math.min(...ys);
    const x1 = Math.max(...br.rects.map((r) => r.x + r.w)), y1 = Math.max(...br.rects.map((r) => r.y + r.h));
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    S.effects.push({ rects: br.rects, x: cx, y: cy, t: 0 });
    for (let i = 0; i < 6; i++) {
      S.debris.push({ x: x0 + Math.random() * (x1 - x0), y: cy, vx: (Math.random() - 0.5) * 160, vy: 60 + Math.random() * 200, t: 0 });
    }
    // trim_09 1:32: ateş topu bir tuğla kırıldığı yerde ortaya çıkıyor (baloncuk değil).
    if (Math.random() < RULES.fireChance) spawnFire(cx, cy);
    else if (Math.random() < RULES.bonusChance) S.bonuses.push({ x: cx, y: cy, kind: pickBonusKind() });
  }
  function spawnFire(x, y) {
    const v = (RULES.ballSpeed + RULES.ballStageStep * S.levelIndex) * RULES.fireSpeed, a = (Math.random() - 0.5) * 1.2;
    S.balls.push({ x, y, vx: v * Math.sin(a), vy: v * Math.cos(a), docked: false, fire: true, r: RULES.fireR });
  }
  function pickBonusKind() {
    let r = Math.random();
    for (const [k, p] of Object.entries(RULES.bonusShares)) { if (r < p) return k; r -= p; }
    return 'score';
  }
  // Hız ödülleri normal topların hızını çarpanla değiştirir; can kaybında sıfırlanır.
  function setSpeedMul(m) {
    const k = m / S.speedMul; S.speedMul = m;
    for (const b of S.balls) if (!b.fire) { b.vx *= k; b.vy *= k; }
  }
  function setPaddleW(w) {
    const cx = S.paddleX + PADDLE.w / 2; PADDLE.w = w;
    S.paddleX = Math.max(WALL_L, Math.min(WALL_R - w, cx - w / 2));
  }
  // 3'lü top: her uçan toptan ±20° açıyla iki top daha çıkar.
  // Üçlü top: bonus alınınca hemen bölünmez; top bir sonraki sefer çubuğa
  // çarptığında çarptığı noktadan üç top yelpaze gibi dağılır.
  function tripleBalls() { S.splitPending = true; }
  function splitAtPaddle(b, ang, speed) {
    for (const d of [-0.45, 0.45]) {
      const a = Math.max(-1.25, Math.min(1.25, ang + d));
      S.balls.push({ x: b.x, y: b.y, vx: Math.sin(a) * speed, vy: -Math.cos(a) * speed, docked: false });
    }
  }
  function hitBrick(br) {
    if (!Number.isFinite(br.hits)) { br.flash = 0.15; return; }
    br.hits--; br.flash = 0.15;
    if (br.hits <= 0) breakBrick(br);
  }

  // Yaratıklar (videom_parca_01): üstten girip tuğlaların arasında dolaşır;
  // top ya da lazer değince kırmızı parçalara ayrılıp +50000 verir. Çubukla
  // etkileşimi görülmedi, zararsız kabul edildi.
  const CREATURE_R = 30;
  function spawnCreature() {
    const x = WALL_L + 80 + Math.random() * (WALL_R - WALL_L - 160);
    S.creatures.push({ x, y: FIELD_TOP + 10, vx: (Math.random() - 0.5) * RULES.creatureSpeed, vy: RULES.creatureSpeed * 0.6, turn: 1 + Math.random() * 2, t: Math.random() * 6 });
  }
  function killCreature(c) {
    c.dead = true; S.score += RULES.creatureScore;
    for (let i = 0; i < 8; i++) S.debris.push({ x: c.x, y: c.y, vx: (Math.random() - 0.5) * 260, vy: -80 + Math.random() * 200, t: 0, red: true });
  }
  function updateCreatures(dt) {
    S.spawnT -= dt;
    if (S.spawnT <= 0) { if (S.creatures.length < RULES.creatureMax) spawnCreature(); S.spawnT = RULES.creatureEvery; }
    for (const c of S.creatures) {
      c.t += dt; c.turn -= dt;
      if (c.turn <= 0) {
        const a = Math.random() * Math.PI * 2;
        c.vx = Math.cos(a) * RULES.creatureSpeed; c.vy = Math.sin(a) * RULES.creatureSpeed * 0.7; c.turn = 1 + Math.random() * 2;
      }
      c.x += c.vx * dt; c.y += c.vy * dt;
      if (c.x < WALL_L + CREATURE_R) { c.x = WALL_L + CREATURE_R; c.vx = Math.abs(c.vx); }
      if (c.x > WALL_R - CREATURE_R) { c.x = WALL_R - CREATURE_R; c.vx = -Math.abs(c.vx); }
      if (c.y < FIELD_TOP + CREATURE_R) { c.y = FIELD_TOP + CREATURE_R; c.vy = Math.abs(c.vy); }
      if (c.y > 700) { c.y = 700; c.vy = -Math.abs(c.vy); }
      for (const b of S.balls) {
        if (b.docked || c.dead) continue;
        if ((b.x - c.x) ** 2 + (b.y - c.y) ** 2 < (CREATURE_R + BALL_R) ** 2) { killCreature(c); b.vy = -b.vy; }
      }
      for (const sh of S.shots) {
        if (!sh.dead && !c.dead && Math.abs(sh.x - c.x) < CREATURE_R && Math.abs(sh.y - c.y) < CREATURE_R) { killCreature(c); sh.dead = true; }
      }
    }
    S.creatures = S.creatures.filter((c) => !c.dead);
  }

  // Hareketli tuğlalar (Stage 6, videom_parca_02): diğer tuğlalara, duvarlara
  // çarpıp yön değiştirerek dolaşır; halka kırılınca alana yayılır.
  // axis: 'x' yalnız yan duvarlara, 'y' yalnız üst/alt sınıra bakar (alt sıradaki
  // yatay kayanlar alt sınırın altında kalabilir — Stage 23).
  function overlapsAny(br, rect, axis) {
    if (axis !== 'y' && (rect.x < WALL_L || rect.x + rect.w > WALL_R)) return true;
    if (axis !== 'x' && (rect.y < FIELD_TOP + 8 || rect.y + rect.h > 720)) return true;
    for (const o of S.bricks) {
      if (o === br || !o.alive) continue;
      for (const r of o.rects) if (rect.x < r.x + r.w && rect.x + rect.w > r.x && rect.y < r.y + r.h && rect.y + rect.h > r.y) return true;
    }
    return false;
  }
  // Stage 4 kuleleri (trim_05): iki kule birlikte ortada buluşup duvarlara
  // açılır; sıralar hafif gecikmeyle kayar.
  function moveTowers() {
    const w = (Math.PI * 2) / RULES.towerPeriod;
    for (const br of S.bricks) {
      if (!br.tower) continue;
      const r = br.cells[0][1];
      const cL = 2.8 + 2.2 * Math.sin(w * S.levelT - 0.23 - r * RULES.towerLag);
      const c = br.tower.side === 'L' ? cL + br.tower.dc : 14 - cL + br.tower.dc;
      const x = Math.round(GRID.x0 + c * GRID.cw);
      br.rects[0].x = x; br.rects[1].x = x + br.rects[0].w;
    }
  }
  function moveBricks(dt) {
    S.levelT += dt;
    moveTowers();
    for (const br of S.bricks) {
      if (!br.alive || !br.mover) continue;
      // Çok hücreli (2×1, L) parçalar tek gövde olarak kayar.
      const dx = br.vx * dt, dy = br.vy * dt;
      const nx = br.rects.map((r) => ({ ...r, x: r.x + dx }));
      const outX = br.amp && Math.abs(nx[0].x - br.homeX) > br.amp && Math.sign(nx[0].x - br.homeX) === Math.sign(dx);
      if (outX || nx.some((r) => overlapsAny(br, r, 'x'))) br.vx = -br.vx; else br.rects.forEach((r, i) => { r.x = nx[i].x; });
      if (!dy) continue;
      const ny = br.rects.map((r) => ({ ...r, y: r.y + dy }));
      if (ny.some((r) => overlapsAny(br, r, 'y'))) br.vy = -br.vy; else br.rects.forEach((r, i) => { r.y = ny[i].y; });
    }
  }

  // Ateş topu (kullanıcının hatırladığı + videodaki turuncu top): kırılabilen
  // tuğlaların içinden geçip hepsini tek seferde kırar; metalden seker.
  // Top–tuğla çarpışması: en derin temas eden hücreden topu dışarı it, yalnız
  // tuğlaya doğru giden hız bileşenini çevir (duvar gibi). Böylece top metalin
  // içinde kalıp titremez, yavaşlamaz; kayan metaller de topu dışarı iter.
  function collideBall(b) {
    const R = b.r || BALL_R;
    let hitOnce = false;
    for (let pass = 0; pass < 3; pass++) {
      let best = null;
      for (const br of S.bricks) {
        if (!br.alive) continue;
        for (const r of br.rects) {
          const cx = Math.max(r.x, Math.min(b.x, r.x + r.w)), cy = Math.max(r.y, Math.min(b.y, r.y + r.h));
          let dx = b.x - cx, dy = b.y - cy, d = Math.hypot(dx, dy);
          if (d >= R) continue;
          if (d === 0) { // merkez içeride: en kısa çıkış yönü
            const l = b.x - r.x, rr = r.x + r.w - b.x, t = b.y - r.y, bo = r.y + r.h - b.y, m = Math.min(l, rr, t, bo);
            dx = m === l ? -1 : m === rr ? 1 : 0; dy = m === t ? -1 : m === bo ? 1 : 0; d = 0;
          }
          const pen = R - d;
          if (!best || pen > best.pen) best = { br, dx, dy, d, pen };
        }
      }
      if (!best) return;
      const { br } = best;
      if (b.fire && Number.isFinite(br.hits)) { br.hits = 1; hitBrick(br); continue; }
      const len = Math.hypot(best.dx, best.dy) || 1, nx = best.dx / len, ny = best.dy / len;
      b.x += nx * (best.pen + 0.5); b.y += ny * (best.pen + 0.5);
      // Köşe değilse baskın eksende yansı; köşede ikisini de çevir.
      const ax = Math.abs(nx), ay = Math.abs(ny);
      if (ax > ay * 1.5) { if (b.vx * nx < 0) b.vx = -b.vx; }
      else if (ay > ax * 1.5) { if (b.vy * ny < 0) b.vy = -b.vy; }
      else { if (b.vx * nx < 0) b.vx = -b.vx; if (b.vy * ny < 0) b.vy = -b.vy; }
      if (!hitOnce) { hitBrick(br); hitOnce = true; }
    }
  }

  function stepBall(b, dt) {
    const px = b.x, py = b.y, R = b.r || BALL_R;
    b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.x < WALL_L + R) { b.x = WALL_L + R; b.vx = Math.abs(b.vx); }
    if (b.x > WALL_R - R) { b.x = WALL_R - R; b.vx = -Math.abs(b.vx); }
    if (b.y < FIELD_TOP + R) { b.y = FIELD_TOP + R; b.vy = Math.abs(b.vy); }
    if (b.vy > 0 && py + R <= PADDLE.y + 2 && b.y + R >= PADDLE.y &&
        b.x >= S.paddleX - R && b.x <= S.paddleX + PADDLE.w + R) {
      b.y = PADDLE.y - R;
      S.score += RULES.paddleScore;
      const off = Math.max(-1, Math.min(1, (b.x - (S.paddleX + PADDLE.w / 2)) / (PADDLE.w / 2)));
      const speed = b.fire ? Math.hypot(b.vx, b.vy) : Math.min(RULES.ballSpeedMax * S.speedMul, Math.hypot(b.vx, b.vy) + 1);
      b.vx = Math.sin(off * RULES.maxBounce) * speed; b.vy = -Math.cos(off * RULES.maxBounce) * speed;
      if (S.splitPending && !b.fire) { S.splitPending = false; splitAtPaddle(b, off * RULES.maxBounce, speed); }
      return;
    }
    collideBall(b);
    // Neredeyse yatay sonsuz döngüyü önle.
    const minVy = Math.hypot(b.vx, b.vy) * 0.45;
    if (Math.abs(b.vy) < minVy) { b.vy = b.vy < 0 ? -minVy : minVy; }
  }

  function update(dt) {
    if (S.paused) return;
    for (const br of S.bricks) if (br.flash > 0) br.flash -= dt;
    S.introT += dt;
    if (S.mode === 'intro') { S.timer -= dt; if (S.timer <= 0) S.mode = 'play'; }
    if (S.mode !== 'play' && S.mode !== 'intro') return;

    const dir = (keys.has('right') ? 1 : 0) - (keys.has('left') ? 1 : 0);
    S.paddleX = Math.max(WALL_L, Math.min(WALL_R - PADDLE.w, S.paddleX + dir * RULES.paddleSpeed * dt));
    syncDocked();
    if (S.mode !== 'play') return;

    if (S.laser > 0) {
      S.fireT -= dt;
      if (S.fireT <= 0) { for (const dx of [26, PADDLE.w - 26]) S.shots.push({ x: S.paddleX + dx, y: PADDLE.y - 4 }); S.fireT = RULES.laserInterval; }
    }
    updateCreatures(dt);
    moveBricks(dt);
    for (const b of S.balls) if (!b.docked) stepBall(b, dt);
    S.balls = S.balls.filter((b) => b.y - BALL_R < H);

    for (const s of S.shots) {
      s.y -= RULES.shotSpeed * dt;
      for (const br of S.bricks) {
        if (!br.alive || s.dead) continue;
        if (br.rects.some((r) => s.x + 7 >= r.x && s.x - 7 <= r.x + r.w && s.y >= r.y && s.y - 20 <= r.y + r.h)) { hitBrick(br); s.dead = true; }
      }
    }
    S.shots = S.shots.filter((s) => !s.dead && s.y > FIELD_TOP);

    for (const e of S.effects) e.t += dt;
    S.effects = S.effects.filter((e) => e.t < 0.45);
    for (const d of S.debris) { d.t += dt; d.x += d.vx * dt; d.y += d.vy * dt; d.vy += 600 * dt; }
    S.debris = S.debris.filter((d) => d.t < 1.2 && d.y < H);
    for (const bn of S.bonuses) {
      bn.y += RULES.bonusFall * dt;
      if (bn.y + 22 >= PADDLE.y && bn.y - 22 <= PADDLE.y + PADDLE.h && bn.x >= S.paddleX - 10 && bn.x <= S.paddleX + PADDLE.w + 10) {
        bn.caught = true; S.score += RULES.bonusScore;
        if (bn.kind === 'laser') S.laser = Infinity; // gözlem: lazer bölüm sonuna kadar sürüyor
        if (bn.kind === 'life') S.lives++;
        if (bn.kind === 'triple') tripleBalls();
        if (bn.kind === 'wide') setPaddleW(RULES.wideW);
        if (bn.kind === 'shrink') setPaddleW(RULES.shrinkW);
        if (bn.kind === 'slow' || bn.kind === 'fast') setSpeedMul(bn.kind === 'slow' ? RULES.slowMul : RULES.fastMul);

      }
    }
    S.bonuses = S.bonuses.filter((bn) => !bn.caught && bn.y - 22 < H);

    if (S.balls.length === 0) {
      if (infiniteLives) { dockBall(); return; }
      if (S.lives === 0) { S.mode = 'gameover'; save.clear(); return; }
      S.lives--; dockBall();
      save.write({ levelIndex: S.levelIndex, score: S.score, lives: S.lives, max: Math.max(S.levelIndex, save.read()?.max ?? 0) });
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

  // Bölüm girişi (videom_parca_01): tuğlalar önce koyu gri, sonra gümüş
  // çizgili görünür, ardından satır satır gerçek rengine döner.
  function revealStage(br) {
    const k = S.introT - br.cells[0][1] * 0.06;
    return k < 0.25 ? 'dark' : k < 0.75 ? 'silver' : null;
  }
  function drawBrick(br) {
    const stage = revealStage(br);
    const base = stage === 'dark' ? '#3a3a48' : stage === 'silver' ? '#d8dcea' : COLORS[br.t];
    const striped = stage === 'silver' || (!stage && ((br.t.endsWith('-s') && br.hits > 1) || br.t === 'metal'));
    const B = 6; // kabartma kalınlığı
    for (let i = 0; i < br.cells.length; i++) {
      const [c, r] = br.cells[i], rc = br.rects[i];
      const top = !br.set.has(c + ',' + (r - 1)), bottom = !br.set.has(c + ',' + (r + 1));
      const left = !br.set.has(c - 1 + ',' + r), right = !br.set.has(c + 1 + ',' + r);
      const x = rc.x + (left ? 2 : 0), y = rc.y + (top ? 2 : 0);
      const w = rc.w - (left ? 2 : 0) - (right ? 2 : 0), h = rc.h - (top ? 2 : 0) - (bottom ? 2 : 0);
      ctx.fillStyle = br.flash > 0 ? shade(base, 0.3) : base; // vuruşta kısa parlama (renk değişmez)
      ctx.fillRect(x, y, w, h);
      if (striped) {
        ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
        ctx.strokeStyle = br.t === 'metal' ? 'rgba(255,255,235,.32)' : 'rgba(255,255,255,.28)';
        ctx.lineWidth = 9;
        for (let k = -2; k < 4; k++) {
          const sx = rc.x + k * 0.55 * GRID.cw;
          ctx.beginPath(); ctx.moveTo(sx, rc.y + rc.h); ctx.lineTo(sx + rc.h * 0.7, rc.y); ctx.stroke();
        }
        ctx.restore();
      }
      if (br.t === 'metal' && !stage) {
        ctx.fillStyle = 'rgba(70,70,55,.6)';
        for (const [dx, dy] of [[8, 8], [w - 11, 8], [8, h - 11], [w - 11, h - 11]]) ctx.fillRect(x + dx, y + dy, 3, 3);
      }
      ctx.fillStyle = shade(base, 0.55);
      if (top) ctx.fillRect(x, y, w, B);
      if (left) ctx.fillRect(x, y, B, h);
      ctx.fillStyle = shade(base, -0.45);
      if (bottom) ctx.fillRect(x, y + h - B, w, B);
      if (right) ctx.fillRect(x + w - B, y, B, h);
      // L parçalarının iç köşesi: iki kol birleşirken kabartma kesintisiz devam etsin.
      const has = (dc, dr) => br.set.has(c + dc + ',' + (r + dr));
      const G = 2, light = shade(base, 0.55), dark = shade(base, -0.45);
      if (has(1, 0) && has(0, 1) && !has(1, 1)) {        // sağ-alt iç köşe
        ctx.fillStyle = dark; ctx.fillRect(x + w - B - G, y + h - B - G, B + G, B + G);
      }
      if (has(-1, 0) && has(0, -1) && !has(-1, -1)) {    // sol-üst iç köşe
        ctx.fillStyle = light; ctx.fillRect(x, y, B + G, B + G);
      }
      if (has(1, 0) && has(0, -1) && !has(1, -1)) {      // sağ-üst iç köşe
        ctx.fillStyle = light; ctx.fillRect(x + w - B - G, y + G, B + G, B);
        ctx.fillStyle = dark; ctx.fillRect(x + w - B - G, y, B, B + G);
      }
      if (has(-1, 0) && has(0, 1) && !has(-1, 1)) {      // sol-alt iç köşe
        ctx.fillStyle = light; ctx.fillRect(x + G, y + h - B - G, B, B + G);
        ctx.fillStyle = dark; ctx.fillRect(x, y + h - B - G, B + G, B);
      }
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

  function drawEffects() {
    for (const e of S.effects) {
      if (e.t < 0.1) { ctx.fillStyle = '#e0402a'; for (const r of e.rects) ctx.fillRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4); continue; }
      const k = (e.t - 0.1) / 0.35, rad = 14 + k * 8;
      ctx.globalAlpha = 1 - k * 0.7; ctx.lineWidth = 7;
      for (const dx of [-rad, rad]) {
        const g = ctx.createLinearGradient(0, e.y - rad, 0, e.y + rad);
        g.addColorStop(0, '#fff3a0'); g.addColorStop(1, k > 0.5 ? '#d0501a' : '#e0a020');
        ctx.strokeStyle = g; ctx.beginPath(); ctx.arc(e.x + dx, e.y, rad, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    ctx.lineWidth = 4;
    for (const d of S.debris) {
      ctx.strokeStyle = d.red ? 'rgba(200,60,30,.85)' : 'rgba(200,200,210,.75)';
      ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - d.vx * 0.03, d.y - d.vy * 0.03); ctx.stroke();
    }
    for (const bn of S.bonuses) {
      const g = ctx.createRadialGradient(bn.x - 6, bn.y - 6, 2, bn.x, bn.y, 22);
      g.addColorStop(0, 'rgba(220,235,255,.95)'); g.addColorStop(0.7, 'rgba(90,130,220,.55)'); g.addColorStop(1, 'rgba(60,90,200,.25)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bn.x, bn.y, 22, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(210,225,255,.9)'; ctx.lineWidth = 2; ctx.stroke();
      // Can baloncuğunun görünüşü doğrulanmadı; yeşil çekirdek seçildi.
      if (bn.kind === 'triple') {
        ctx.fillStyle = '#ffffff';
        for (const [dx, dy] of [[-6, 4], [6, 4], [0, -6]]) { ctx.beginPath(); ctx.arc(bn.x + dx, bn.y + dy, 5, 0, Math.PI * 2); ctx.fill(); }
      } else if (bn.kind === 'fire') {
        ctx.fillStyle = '#ff9a2a'; ctx.beginPath(); ctx.arc(bn.x, bn.y, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff3a0'; ctx.beginPath(); ctx.arc(bn.x - 3, bn.y - 3, 4, 0, Math.PI * 2); ctx.fill();
      } else if (bn.kind === 'shrink') {
        ctx.fillStyle = '#ff5a3a'; ctx.fillRect(bn.x - 7, bn.y - 4, 14, 8);
        ctx.fillStyle = '#ffcf3a'; ctx.fillRect(bn.x - 9, bn.y - 6, 3, 12); ctx.fillRect(bn.x + 6, bn.y - 6, 3, 12);
      } else if (bn.kind === 'slow' || bn.kind === 'fast') {
        outlinedText(bn.kind === 'slow' ? 'S' : 'F', bn.x, bn.y + 1, 22, bn.kind === 'slow' ? '#7fd0ff' : '#ff7a4a', 'center');
      } else if (bn.kind === 'wide') {
        ctx.fillStyle = '#7dff5a'; ctx.fillRect(bn.x - 13, bn.y - 4, 26, 8);
        ctx.fillStyle = '#ffcf3a'; ctx.fillRect(bn.x - 15, bn.y - 6, 4, 12); ctx.fillRect(bn.x + 11, bn.y - 6, 4, 12);
      } else {
        ctx.fillStyle = bn.kind === 'laser' ? '#f0c840' : bn.kind === 'life' ? '#ff5a8a' : '#2a3a90';
        ctx.beginPath(); ctx.arc(bn.x, bn.y, 8, 0, Math.PI * 2); ctx.fill();
      }
    }
    for (const c of S.creatures) drawCreature(c);
  }

  function drawCreature(c) {
    const bob = Math.sin(c.t * 6) * 3;
    for (const [dy, rx, ry, col] of [[14, 30, 13, '#6a2a10'], [2, 23, 11, '#83381a'], [-9, 15, 9, '#9a4622'], [-18, 6, 6, '#b05428']]) {
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(c.x, c.y + dy + bob, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    }
    for (const dx of [-9, 9]) {
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(c.x + dx, c.y + 10 + bob, 7, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(c.x + dx + Math.sign(c.vx) * 2, c.y + 11 + bob, 3, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Lazer ışını: videodaki gibi kalın, parlak altın çekirdekli uzun iz.
  function drawShots() {
    ctx.save();
    for (const s of S.shots) {
      const len = 110, g = ctx.createLinearGradient(0, s.y - len, 0, s.y);
      g.addColorStop(0, 'rgba(255,170,40,0)'); g.addColorStop(0.35, 'rgba(255,190,60,.85)'); g.addColorStop(1, 'rgba(255,240,170,1)');
      ctx.shadowColor = 'rgba(255,180,40,.9)'; ctx.shadowBlur = 18;
      ctx.fillStyle = g; ctx.fillRect(s.x - 7, s.y - len, 14, len);
      ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,255,230,.95)'; ctx.fillRect(s.x - 2.5, s.y - len * 0.7, 5, len * 0.7);
    }
    ctx.restore();
  }

  function drawBall(b) {
    if (b.fire) {
      const R = b.r, sp = Math.hypot(b.vx, b.vy) || 1;
      ctx.save(); ctx.shadowColor = 'rgba(255,150,30,.9)'; ctx.shadowBlur = 24;
      const tg = ctx.createLinearGradient(b.x, b.y, b.x - b.vx / sp * 90, b.y - b.vy / sp * 90);
      tg.addColorStop(0, 'rgba(255,170,40,.75)'); tg.addColorStop(1, 'rgba(255,90,20,0)');
      ctx.strokeStyle = tg; ctx.lineWidth = R * 1.4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - b.vx / sp * 90, b.y - b.vy / sp * 90); ctx.stroke();
      const fg = ctx.createRadialGradient(b.x - 6, b.y - 6, 3, b.x, b.y, R);
      fg.addColorStop(0, '#fffbe0'); fg.addColorStop(0.45, '#ffd84a'); fg.addColorStop(1, '#e0601a');
      ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(b.x, b.y, R, 0, Math.PI * 2); ctx.fill();
      ctx.restore(); return;
    }
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
    // Menüde üst bilgi çubuğu yok (user-menu.jpg); yalnızca ince üst kenar.
    if (S.mode === 'menu' || S.mode === 'exit' || S.mode === 'select') { ctx.fillStyle = '#241878'; ctx.fillRect(0, 0, W, 8); return; }
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
    outlinedText('X ' + (infiniteLives ? '∞' : S.lives), 176, HUD_H / 2 + 2, 38, '#f4ecb0');
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
    outlinedText('BlokYıldızı', W / 2, 235, 150, t, 'center');
    const hasSave = !!save.read();
    MENU.forEach((item, i) => {
      const y = MENU_Y0 + i * MENU_DY;
      const off = item === 'Continue' && !hasSave;
      const g = ctx.createLinearGradient(0, y - 30, 0, y + 30);
      g.addColorStop(0, '#fffbe0'); g.addColorStop(0.5, '#f5c23a'); g.addColorStop(1, '#c8701a');
      outlinedText(item, W / 2, y, 54, off ? '#8f8a6a' : g, 'center');
      if (i === S.menuIndex) { ctx.strokeStyle = '#d8d8e8'; ctx.lineWidth = 6; ctx.strokeRect(W / 2 - 300, y - 43, 600, 86); }
    });
  }

  // ---------- bölüm seçimi ----------
  const thumbs = [];
  function thumb(i) {
    if (thumbs[i]) return thumbs[i];
    const c = document.createElement('canvas'); c.width = SEL.w; c.height = SEL.h - 28;
    const g = c.getContext('2d'), sx = c.width / (WALL_R - WALL_L), sy = c.height / (760 - FIELD_TOP);
    g.fillStyle = 'rgba(2,2,10,.85)'; g.fillRect(0, 0, c.width, c.height);
    for (const b of LEVELS[i].bricks) {
      g.fillStyle = COLORS[b.t];
      for (const [cc, r] of cellsOf(b)) {
        const rc = cellRect(cc, r);
        g.fillRect((rc.x - WALL_L) * sx + 0.5, (rc.y - FIELD_TOP) * sy + 0.5, rc.w * sx - 1, rc.h * sy - 1);
      }
    }
    return (thumbs[i] = c);
  }
  function selRect(i) {
    const col = i % SEL.cols, row = Math.floor(i / SEL.cols);
    return { x: SEL.x0 + col * (SEL.w + SEL.gx), y: SEL.y0 + row * (SEL.h + SEL.gy) };
  }
  function drawSelect() {
    const cont = S.selFrom === 'continue';
    outlinedText(cont ? 'Select Stage Using V+/V-' : 'Stage Select', W / 2, 70, cont ? 46 : 56, '#ffd84a', 'center');
    LEVELS.forEach((lv, i) => {
      const { x, y } = selRect(i), on = i === S.selIndex;
      ctx.globalAlpha = i > S.selLimit ? 0.25 : 1;
      ctx.drawImage(thumb(i), x, y);
      ctx.strokeStyle = on ? '#ffd84a' : 'rgba(200,195,255,.45)'; ctx.lineWidth = on ? 6 : 2;
      ctx.strokeRect(x, y, SEL.w, SEL.h);
      outlinedText('Stage ' + lv.stage, x + 8, y + SEL.h - 8, 19, on ? '#ffd84a' : '#f4ecb0');
      ctx.globalAlpha = 1;
    });
    ctx.font = '600 20px Arial, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#c9c3f2';
    ctx.fillText(cont ? 'Press OK to Start Game · Esc: menü' : 'Tıkla ya da oklar + Enter · Esc: menü', W / 2, H - 14);
  }
  function startStage(i) { S.score = 0; S.lives = RULES.startLives; startLevel(i); }
  function selMove(d) { S.selIndex = Math.max(0, Math.min(S.selLimit, S.selIndex + d)); }

  function draw() {
    ctx.drawImage(bg, 0, 0);
    drawFrame();
    if (S.mode === 'menu') { drawMenu(); return; }
    if (S.mode === 'select') { drawSelect(); return; }
    if (S.mode === 'exit') { panel('Exit', ['Enter / Boşluk: menüye dön']); return; }
    for (const br of S.bricks) if (br.alive) drawBrick(br);
    drawEffects();
    ctx.fillStyle = '#fff6c0';
    drawShots();
    drawPaddle();
    for (const b of S.balls) drawBall(b);
    if (S.mode === 'intro') drawStageBanner();
    if (S.paused) panel('Pause', ['Devam etmek için P']);
    if (S.mode === 'gameover') panel('Game Over', ['Enter / Boşluk: menü']);
    if (S.mode === 'end') panel('Tebrikler! Oyun bitti', ['Tüm ' + LEVELS.length + ' bölümü tamamladın. Puan: ' + S.score, 'Enter / Boşluk: menü']);
    if (debug) {
      const lv = LEVELS[S.levelIndex];
      ctx.font = '20px monospace'; ctx.textAlign = 'left'; ctx.fillStyle = '#9cf';
      ctx.fillText(`${lv.id} · ${lv.source} · güven: ${lv.confidence} · 1:çoklu top 2:lazer N:sonraki`, 40, H - 12);
    }
  }

  // ---------- giriş ----------
  function confirm() {
    if (S.mode === 'menu') menuSelect();
    else if (S.mode === 'select') startStage(S.selIndex);
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
    if (S.mode === 'select' && ['arrowleft', 'arrowright', 'arrowup', 'arrowdown'].includes(k)) {
      selMove({ arrowleft: -1, arrowright: 1, arrowup: -SEL.cols, arrowdown: SEL.cols }[k]); return;
    }
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
      if (S.mode === 'select') selMove(key === 'left' ? -1 : 1);
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
      const i = Math.round((p.y - MENU_Y0) / MENU_DY);
      if (i >= 0 && i < MENU.length) { S.menuIndex = i; menuSelect(); }
      return;
    }
    if (S.mode === 'select') {
      const i = LEVELS.findIndex((_, j) => { const r = selRect(j); return p.x >= r.x && p.x <= r.x + SEL.w && p.y >= r.y && p.y <= r.y + SEL.h; });
      if (i >= 0 && i <= S.selLimit) { S.selIndex = i; startStage(i); }
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
  // Oyun hızı (orijinal TV kutusu oyunu yavaş; varsayılan 1.5×). Hız düğmesi / H tuşu değiştirir.
  // Sonsuz can (varsayılan açık). Can düğmesi / L tuşu / kumandada yeşil tuş.
  function toggleLives() {
    infiniteLives = !infiniteLives; showLives();
    try { localStorage.setItem('blok-sonsuz', infiniteLives ? '1' : '0'); } catch { /* yok say */ }
  }
  const livesBtn = document.getElementById('lives');
  const showLives = () => { if (livesBtn) livesBtn.textContent = 'Can: ' + (infiniteLives ? 'sonsuz' : 'normal'); };
  if (livesBtn) livesBtn.onclick = toggleLives;
  window.addEventListener('keydown', (e) => { if (e.key === 'l' || e.key === 'L') toggleLives(); });
  showLives();
  const SPEEDS = [1, 1.5, 2, 2.5];
  let gameSpeed = 1.5;
  try { const v = +localStorage.getItem('blok-hiz'); if (SPEEDS.includes(v)) gameSpeed = v; } catch { /* yok say */ }
  const speedBtn = document.getElementById('speed');
  const showSpeed = () => { if (speedBtn) speedBtn.textContent = 'Hız ' + gameSpeed + '×'; };
  function cycleSpeed() {
    gameSpeed = SPEEDS[(SPEEDS.indexOf(gameSpeed) + 1) % SPEEDS.length]; showSpeed();
    try { localStorage.setItem('blok-hiz', String(gameSpeed)); } catch { /* yok say */ }
  }
  if (speedBtn) speedBtn.onclick = cycleSpeed;
  window.addEventListener('keydown', (e) => { if (e.key === 'h' || e.key === 'H') cycleSpeed(); });
  showSpeed();
  function frame(t) {
    acc += Math.min((t - last) / 1000, 0.05) * gameSpeed; last = t;
    while (acc >= STEP) { update(STEP); acc -= STEP; }
    draw();
    requestAnimationFrame(frame);
  }

  // #stage5 gibi bir bağlantı doğrudan o bölümü açar; #stages seçim ekranını.
  const hashStage = /^#stage(\d+)$/.exec(location.hash);
  if (hashStage) { const i = LEVELS.findIndex((l) => l.stage === +hashStage[1]); if (i >= 0) startStage(i); }
  else if (location.hash === '#stages') { S.mode = 'select'; S.selLimit = LEVELS.length - 1; }
  requestAnimationFrame(frame);

  // Tarayıcı testleri için.
  window.__exblock = { S, RULES, LEVELS, startLevel, newGame };

  // ---------- TV modu (Android TV uygulaması / ?tv) ----------
  // Uygulama kumandanın Geri, Oynat/Duraklat ve renkli tuşlarını buraya iletir.
  const tvMode = /BlokTV/.test(navigator.userAgent) || new URLSearchParams(location.search).has('tv');
  if (tvMode) document.body.classList.add('tv');
  window.__tv = {
    // Geri tuşu: oyundan menüye, menüden çıkış ('exit' döner → uygulama kapanır).
    back() {
      if (S.mode === 'menu') return 'exit';
      S.mode = 'menu'; S.paused = false; return 'ok';
    },
    pause() { togglePause(); },
    speed() { cycleSpeed(); },
    lives() { toggleLives(); },
  };
})();
