// BlokYıldızı — telefon kumandası, ekran (oyun) tarafı.
//
// "Telefonla oyna" düğmesi (klavyede K; TV menüsünde ▶ ya da mavi tuş) bir QR kod gösterir.
// Telefon kumanda.html'i açar ve iki sayfa WebRTC ile doğrudan bağlanır.
// Eşleştirmeyi PeerJS'in ücretsiz sunucusu yapar; sonra veri telefondan oyuna
// doğrudan akar. Kütüphaneler (src/vendor) yalnız düğmeye basılınca yüklenir,
// oyunun kendisi bağımlılıksız kalır.
//
// Mesajlar (JSON):
//   telefon → oyun  {t:'h'}        bağlandım, durumu gönder
//                   {t:'d', x, y}  parmak hareketi, kumanda alanının oranı cinsinden
//                   {t:'u'}        parmak kalktı
//                   {t:'p', x}     eğme modu: çubuk konumu, -1 (sol) … +1 (sağ)
//                   {t:'k', d}     tuş modu: ◀ basılı -1, ▶ basılı +1, bırakıldı 0
//                   {t:'b', b}     düğme: ok | pause | menu | speed | lives
//   oyun → telefon  {t:'s', ...}   oyun durumu (değiştikçe)
//                   {t:'v'}        top kaçtı (telefon titrer)
(function () {
  'use strict';

  const G = window.__remote;
  if (!G) return;

  // kumanda.html'deki değerlerle aynı olmalı.
  const PREFIX = 'blokyildizi-';
  const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // 0/O ve 1/I/L karışmasın
  const SITE = 'https://hamikumbasae.github.io/blok-kirma/';
  const CODE_KEY = 'blok-kumanda-kod';

  const params = new URLSearchParams(location.search);
  const tvMode = document.body.classList.contains('tv');

  // Geliştirme: ?peer=localhost:9000 ile ücretsiz sunucu yerine yerel PeerJS sunucusu.
  function peerOptions() {
    const p = params.get('peer');
    if (!p) return { debug: 0 };
    const [host, port] = p.split(':');
    const local = /^(localhost|127\.|192\.168\.|10\.)/.test(host);
    return { debug: 1, host, port: +port || (local ? 9000 : 443), path: '/', secure: !local };
  }

  function newCode() {
    const r = new Uint8Array(6);
    crypto.getRandomValues(r);
    return Array.from(r, (n) => ALPHABET[n % ALPHABET.length]).join('');
  }
  function storedCode() {
    try {
      const c = localStorage.getItem(CODE_KEY);
      if (c && /^[A-Z0-9]{6}$/.test(c)) return c;
    } catch { /* yok say */ }
    const c = newCode();
    try { localStorage.setItem(CODE_KEY, c); } catch { /* yok say */ }
    return c;
  }

  // Telefon bu adresi açacak. Bilgisayarda yerel dosya ya da localhost ise
  // telefon oraya ulaşamaz; o zaman yayındaki site kullanılır (aynı ücretsiz
  // sunucuya bağlandığı için yine çalışır).
  function controllerUrl(code) {
    const unreachable = location.protocol === 'file:' || /^(localhost|127\.|\[::1\])/.test(location.hostname);
    const base = unreachable && !params.has('peer') ? SITE : new URL('.', location.href).href;
    const q = params.has('peer') ? '?peer=' + encodeURIComponent(params.get('peer')) : '';
    return base + 'kumanda.html' + q + '#' + code;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = () => reject(new Error(src));
      document.head.appendChild(s);
    });
  }

  // ---------- görünüm ----------
  const css = document.createElement('style');
  css.textContent = `
    .kumanda-perde { position: fixed; inset: 0; z-index: 20; display: grid; place-items: center;
      background: rgba(2, 2, 7, 0.86); padding: 16px; overflow: auto; }
    body.tv .kumanda-kart { padding: 2.5vh 22px 2vh; }
    body.tv .kumanda-kart p { display: block; } /* TV modu sayfadaki <p>'leri gizliyor */
    body.tv .kumanda-kart p.kumanda-adres { display: none; } /* TV'de kod yeterli, yer dar */
    body.tv .kumanda-kart .kumanda-kod { margin-top: 1.2vh; font-size: 28px; }
    body.tv .kumanda-kart .kumanda-durum { margin: 1.2vh 0; }
    body.tv .kumanda-kart .alt { margin-bottom: 1.6vh; }
    .kumanda-perde[hidden] { display: none; }
    .kumanda-kart { width: min(92vw, 400px); background: #0d1424; border: 2px solid #3a4a68;
      border-top-color: #72819c; border-left-color: #72819c; padding: 22px 22px 18px; text-align: center; }
    .kumanda-kart h2 { margin: 0 0 4px; font-size: 20px; font-weight: normal; color: #fff6c0; }
    .kumanda-kart .alt { margin: 0 0 16px; color: #95a2b9; font-size: 14px; line-height: 1.5; }
    /* Sayfadaki genel canvas kurallarını (oyun alanı oranı, TV'de tam yükseklik) ez. */
    body .kumanda-perde canvas.kumanda-qr { display: block; margin: 0 auto; width: min(64vw, 248px, 38vh);
      height: auto; max-width: none; aspect-ratio: 1; image-rendering: pixelated; background: #fff; }
    .kumanda-kod { margin: 14px 0 2px; font-size: 32px; letter-spacing: 0.18em; color: #e3c001; }
    .kumanda-adres { margin: 0; font-size: 12px; color: #72819c; word-break: break-all; }
    .kumanda-durum { margin: 14px 0 12px; min-height: 1.4em; font-size: 15px; color: #c6d2e6; }
    .kumanda-durum.hata { color: #ff8a70; }
    .kumanda-durum.tamam { color: #6ee06e; }
    .kumanda-rozet { position: fixed; top: 8px; right: 8px; z-index: 19; padding: 6px 10px;
      font: 13px monospace; color: #c6f5c6; background: rgba(13, 20, 36, 0.85);
      border: 1px solid #2f6b2f; border-radius: 4px; cursor: pointer; }
    .kumanda-rozet.koptu { color: #ffc9b8; border-color: #8a3a2a; }
    .kumanda-rozet[hidden], .kumanda-ipucu[hidden] { display: none; }
    .kumanda-ipucu { position: fixed; left: 50%; bottom: 2.5vh; transform: translateX(-50%); z-index: 19;
      font: 2.2vh monospace; color: #95a2b9; background: rgba(2, 2, 7, 0.7); padding: 0.6vh 1.4vh; }
    @media (prefers-reduced-motion: no-preference) {
      .kumanda-perde:not([hidden]) .kumanda-kart { animation: kumanda-ac 160ms ease-out; }
      @keyframes kumanda-ac { from { transform: scale(0.96); opacity: 0; } }
    }
  `;
  document.head.appendChild(css);

  const overlay = document.createElement('div');
  overlay.className = 'kumanda-perde';
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="kumanda-kart" role="dialog" aria-modal="true" aria-labelledby="kumanda-baslik">
      <h2 id="kumanda-baslik">Telefonu kumanda yap</h2>
      <p class="alt">Telefonun kamerasıyla QR kodu okut. Açılan sayfada parmağını sağa sola kaydırınca çubuk hareket eder.</p>
      <canvas class="kumanda-qr" width="10" height="10" aria-label="Kumanda sayfasının QR kodu"></canvas>
      <p class="kumanda-kod" aria-label="Bağlantı kodu"></p>
      <p class="kumanda-adres"></p>
      <p class="kumanda-durum" role="status"></p>
      <button type="button" class="kumanda-kapat">Kapat</button>
    </div>`;
  document.body.appendChild(overlay);
  const $ = (s) => overlay.querySelector(s);
  const qrCanvas = $('.kumanda-qr'), codeEl = $('.kumanda-kod'), urlEl = $('.kumanda-adres'), statusEl = $('.kumanda-durum');
  $('.kumanda-kapat').addEventListener('click', () => close());
  if (tvMode) $('.kumanda-kapat').textContent = 'Kapat (OK ya da Geri)';
  overlay.addEventListener('pointerdown', (e) => { if (e.target === overlay) close(); });

  const badge = document.createElement('button');
  badge.type = 'button';
  badge.className = 'kumanda-rozet';
  badge.hidden = true;
  badge.addEventListener('click', () => open());
  document.body.appendChild(badge);

  // TV'de düğmeler gizli; menüdeyken mavi tuşu hatırlat.
  const tvHint = document.createElement('div');
  tvHint.className = 'kumanda-ipucu';
  tvHint.textContent = '▶ ya da mavi tuş: telefonu kumanda yap';
  tvHint.hidden = true;
  document.body.appendChild(tvHint);

  // Web sayfasındaki düğme.
  const controls = document.querySelector('.controls');
  if (controls) {
    const btn = document.createElement('button');
    btn.id = 'phone';
    btn.textContent = 'Telefonla oyna';
    btn.addEventListener('click', () => toggle());
    controls.appendChild(btn);
  }

  function setStatus(text, kind) {
    statusEl.textContent = text;
    statusEl.className = 'kumanda-durum' + (kind ? ' ' + kind : '');
  }

  function drawQr(text) {
    const qr = window.qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    const n = qr.getModuleCount(), quiet = 4, cell = 8, size = (n + quiet * 2) * cell;
    qrCanvas.width = size; qrCanvas.height = size;
    const g = qrCanvas.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, size, size);
    g.fillStyle = '#020207';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      if (qr.isDark(r, c)) g.fillRect((c + quiet) * cell, (r + quiet) * cell, cell, cell);
    }
  }

  // ---------- bağlantı ----------
  let peer = null, conn = null, code = null, starting = null, idRetries = 0;
  let pausedByOverlay = false;

  async function start() {
    if (peer && !peer.destroyed) return;
    if (starting) return starting;
    setStatus('Hazırlanıyor…');
    starting = (async () => {
      try {
        await Promise.all([
          window.Peer ? null : loadScript('src/vendor/peerjs.min.js'),
          window.qrcode ? null : loadScript('src/vendor/qrcode.js'),
        ]);
      } catch {
        setStatus('Kumanda dosyaları yüklenemedi. Sayfayı yenileyip tekrar dene.', 'hata');
        return;
      }
      code = code || storedCode();
      const url = controllerUrl(code);
      drawQr(url);
      codeEl.textContent = code;
      urlEl.textContent = url.replace(/^https?:\/\//, '');
      createPeer();
    })();
    try { await starting; } finally { starting = null; }
  }

  function createPeer() {
    setStatus('Sunucuya bağlanıyor…');
    peer = new window.Peer(PREFIX + code, peerOptions());
    peer.on('open', () => {
      idRetries = 0;
      setStatus(conn && conn.open ? 'Telefon bağlı.' : 'Telefonun bağlanması bekleniyor…', conn && conn.open ? 'tamam' : '');
    });
    peer.on('connection', accept);
    peer.on('disconnected', () => {
      // Eşleştirme sunucusu koptu; kurulmuş telefon bağlantısı çalışmaya devam eder.
      setTimeout(() => { if (peer && !peer.destroyed && peer.disconnected) peer.reconnect(); }, 2000);
    });
    peer.on('error', (err) => {
      if (err.type === 'unavailable-id') {
        // Sayfa yenilenince eski kayıt sunucuda birkaç saniye kalabiliyor.
        peer.destroy();
        if (++idRetries <= 3) { setStatus('Kod yeniden alınıyor…'); setTimeout(createPeer, 2000); return; }
        idRetries = 0;
        code = newCode();
        try { localStorage.setItem(CODE_KEY, code); } catch { /* yok say */ }
        const url = controllerUrl(code);
        drawQr(url); codeEl.textContent = code; urlEl.textContent = url.replace(/^https?:\/\//, '');
        createPeer();
      } else if (['network', 'server-error', 'socket-error', 'socket-closed', 'browser-incompatible'].includes(err.type)) {
        setStatus(err.type === 'browser-incompatible'
          ? 'Bu tarayıcı WebRTC desteklemiyor.'
          : 'Eşleştirme sunucusuna ulaşılamadı. İnternet bağlantını kontrol et; tekrar deneniyor…', 'hata');
        if (err.type !== 'browser-incompatible') {
          peer.destroy();
          setTimeout(() => { if (!overlay.hidden || conn) createPeer(); else peer = null; }, 5000);
        }
      }
    });
  }

  function accept(c) {
    if (conn && conn !== c) { conn.close(); G.hold(0); } // aynı anda tek kumanda
    conn = c;
    c.on('open', () => {
      lastSent = '';
      pushState(true);
      setStatus('Telefon bağlı.', 'tamam');
      showBadge(true);
      if (!overlay.hidden) setTimeout(close, 1200);
    });
    c.on('data', onData);
    c.on('close', () => {
      if (conn !== c) return;
      conn = null;
      G.hold(0); // basılı kalmış yön tuşu çubuğu sürüklemesin
      showBadge(false);
      setStatus('Telefon bağlantısı koptu. Kumanda sayfası kendiliğinden yeniden bağlanır.', 'hata');
    });
    c.on('error', () => { /* close olayı ayrıca gelir */ });
  }

  function showBadge(connected) {
    badge.hidden = false;
    badge.classList.toggle('koptu', !connected);
    badge.textContent = connected ? 'Telefon bağlı' : 'Telefon koptu';
    badge.title = connected ? 'Telefon kumandası' : 'Yeniden bağlanmak için QR kodu göster';
  }

  // ---------- telefondan gelenler ----------
  const NAV_STEP = 0.16; // menüde bir adım için gereken kaydırma (alan oranı)
  let navX = 0, navY = 0;

  function onData(m) {
    if (!m || typeof m !== 'object') return;
    if (m.t === 'd') {
      const x = clamp(+m.x || 0), y = clamp(+m.y || 0);
      const st = G.state();
      if (st.mode === 'play' || st.mode === 'intro') { G.move(x * G.fieldWidth); return; }
      if (st.mode !== 'menu' && st.mode !== 'select') return;
      navX += x; navY += y;
      if (Math.abs(navY) >= NAV_STEP && Math.abs(navY) >= Math.abs(navX)) {
        G.nav(0, Math.sign(navY)); navY = 0; navX = 0;
      } else if (Math.abs(navX) >= NAV_STEP) {
        G.nav(Math.sign(navX), 0); navX = 0; navY = 0;
      }
    } else if (m.t === 'p') {
      G.place(clamp(+m.x || 0));
    } else if (m.t === 'k') {
      G.hold(Math.sign(+m.d || 0));
    } else if (m.t === 'u') {
      navX = 0; navY = 0;
    } else if (m.t === 'h') {
      // Telefon hazır: güncel durumu hemen gönder.
      pushState(true);
    } else if (m.t === 'b') {
      if (m.b === 'ok') G.confirm();
      else if (m.b === 'pause') G.pause();
      else if (m.b === 'menu') G.menu();
      else if (m.b === 'speed') G.speed();
      else if (m.b === 'lives') G.lives();
      pushState();
    }
  }
  const clamp = (v) => Math.max(-1, Math.min(1, v));

  // ---------- telefona gidenler ----------
  let lastSent = '', wasInPlay = false, lastLevel = null, ticks = 0;
  function pushState(force) {
    if (++ticks % 25 === 0) force = true; // ~3 sn'de bir değişmese de gönder
    const st = G.state();
    // Top kaçtı mı? (aynı bölümde, uçan top varken hepsi çubuğa geri döndü)
    const inPlay = st.mode === 'play' && !st.docked;
    const lost = wasInPlay && st.mode === 'play' && st.docked && lastLevel === st.stage;
    wasInPlay = inPlay; lastLevel = st.stage;
    tvHint.hidden = !(tvMode && st.mode === 'menu' && overlay.hidden);
    if (!conn || !conn.open) return;
    if (lost) conn.send({ t: 'v' });
    const s = JSON.stringify(st);
    if (!force && s === lastSent) return;
    lastSent = s;
    conn.send(Object.assign({ t: 's' }, st));
  }
  setInterval(() => pushState(), 120);

  // ---------- aç / kapat ----------
  function open() {
    if (!overlay.hidden) return;
    const st = G.state();
    if ((st.mode === 'play' || st.mode === 'intro') && !st.paused) { G.pause(); pausedByOverlay = true; }
    overlay.hidden = false;
    tvHint.hidden = true;
    if (conn && conn.open) setStatus('Telefon bağlı. Başka bir telefonla okutursan o devralır.', 'tamam');
    start();
  }
  function close() {
    if (overlay.hidden) return false;
    overlay.hidden = true;
    if (pausedByOverlay && G.state().paused) G.pause();
    pausedByOverlay = false;
    return true;
  }
  function toggle() { if (overlay.hidden) open(); else close(); }

  // Panel açıkken tuşlar oyuna gitmesin; K aç/kapa, Esc kapatır.
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (!overlay.hidden) {
      if (k === 'escape' || k === 'k' || k === 'enter' || k === ' ') close();
      e.preventDefault();
      e.stopImmediatePropagation();
    } else if (!e.repeat && (k === 'k' || (tvMode && k === 'arrowright' && G.state().mode === 'menu'))) {
      // TV menüsünde ◀ ▶ boşta; her kumandada renkli tuş olmadığı için ▶ de paneli açar.
      open();
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);

  // TV kumandası: Geri önce paneli kapatır, mavi tuş paneli açar/kapatır.
  if (window.__tv) {
    const back = window.__tv.back;
    window.__tv.back = () => (close() ? 'ok' : back());
    window.__tv.phone = toggle;
  }
})();
