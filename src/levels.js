// ExBlock haritaları — referans karelerinden ölçülerek çıkarıldı.
//
// Izgara: 18 sütun (c = 0..17) × satır (r = 0..). Bir hücre, 1264 px genişliğe
// ölçeklenmiş video karesinde 65 × 63.5 px (yarım tuğla). Satır 0, HUD'ın hemen
// altındaki ilk sıra (Stage 4 burada başlıyor); Stage 1–3 satır 1'den başlar.
// Bazı bloklar ızgaraya tam oturmuyor; c kesirli olabilir (Stage 4). Normal tuğla 2×1,
// dikey tuğla 1×2 hücre; L parçaları üç hücreden oluşur.
//
// Türler:
//   red, blue, yellow, green, purple      → düz renkli tuğla
//   red-s, blue-s, yellow-s, purple-s,  (blue-s: Stage 16 alt sıra)
//   violet-s, green-s, silver-s           → çizgili/parlak görünümlü tuğla
//   metal                                 → perçinli gri-bej blok
// Çizgili ve metal blokların dayanıklılığı videodan DOĞRULANMADI; davranış
// game.js içindeki RULES nesnesinde varsayım olarak tanımlı.
//
// Her haritanın `source` ve `confidence` alanı kanıt düzeyini belirtir.
(function (root) {
  'use strict';

  const R = (t, c, r, w = 2, h = 1) => ({ t, c, r, w, h });
  const V = (t, c, r) => R(t, c, r, 1, 2);
  const L = (t, cells) => ({ t, cells });
  const row = (t, cols, r, w = 2, h = 1) => cols.map((c) => R(t, c, r, w, h));
  // İlk ölçümler satır 0 = Stage 1'in üst sırası kabul edilerek yazıldı; Stage 4
  // bir sıra daha yukarıda başladığı için bu haritalar bir satır aşağı kaydırılır.
  const down = (bricks) => bricks.map((b) => (b.cells ? { ...b, cells: b.cells.map(([c, r]) => [c, r + 1]) } : { ...b, r: b.r + 1 }));

  // Stage 1 — reference-frames/user-stage-01b.jpg ("Stage 1", puan 0, X 5).
  // user-stage-01.jpg'de alt sıra aynı renklerde ama çizgili: büyük olasılıkla
  // bölüm girişindeki parıltı animasyonu. 0010.jpg'de alt sıranın ortası
  // kırmızı (G P B P B R B P G); bu fark çözülmedi.
  const stage1 = [
    ...row('red', [6, 10], 0),
    ...row('blue', [3, 8, 13], 1),
    ...row('yellow', [1, 5, 11, 15], 2),
    ...row('green', [0, 4, 8, 12, 16], 3),
    ...['green', 'blue', 'purple', 'blue', 'purple', 'blue', 'purple', 'blue', 'green']
      .map((t, i) => R(t, i * 2, 5)),
    // trim_01 (gerçek hız, temiz kare): alt sıra G P B P B P B P G.
    ...['green', 'purple', 'blue', 'purple', 'blue', 'purple', 'blue', 'purple', 'green']
      .map((t, i) => R(t, i * 2, 7)),
  ];

  // Stage 2 — reference-frames/user-stage-02.jpg ("Stage 2" yazılı başlangıç).
  // Üç bant, dikey tuğlalar, metal uçlar. O karede orta bant gümüş, alt bant
  // çizgili sarı görünüyor; Stage 1'deki gibi giriş parıltısı kabul edildi ve
  // renkler oyun sırasındaki 0035.jpg karesinden alındı (orta kırmızı, alt sarı).
  const band = (t, from, to, r) => {
    const out = [V('metal', from, r)];
    for (let c = from + 1; c < to; c++) out.push(V(t, c, r));
    out.push(V('metal', to, r));
    return out;
  };
  const stage2 = [...band('yellow', 0, 17, 0), ...band('red', 1, 16, 3), ...band('yellow', 3, 14, 6)];

  // Stage 3 — reference-frames/0055.jpg ve user-stage-03-start.jpg (top
  // çubukta, harita sağlam; iki kare birebir aynı). Numara ekranda görünmedi;
  // kullanıcı Stage 1 ve 2'nin ardından sırayla gönderdi.
  const spiral = [
    L('blue', [[1, 0], [2, 0], [1, 1]]), V('blue', 1, 2), V('blue', 1, 4),
    ...row('yellow', [3, 5, 7, 9, 11, 13], 0),
    L('yellow', [[15, 0], [16, 0], [16, 1]]), V('yellow', 16, 2), V('yellow', 16, 4),
    L('red', [[16, 6], [16, 7], [15, 7]]),
    ...row('red', [5, 7, 9, 11, 13], 7),
    L('red', [[3, 6], [3, 7], [4, 7]]), V('red', 3, 4),
    L('green', [[3, 2], [4, 2], [3, 3]]),
    ...row('green', [5, 7, 9, 11], 2),
    L('green', [[13, 2], [14, 2], [14, 3]]),
    L('purple', [[5, 4], [5, 5], [6, 5]]),
    ...row('purple', [7, 9, 11], 5),
    L('purple', [[14, 4], [13, 5], [14, 5]]),
    ...row('green-s', [6, 8, 10, 12], 4),
  ];

  // Yeşil simetrik harita — reference-frames/0550.jpg (top çubukta, tuğlalar
  // sağlam). Puan önceki karelerden düşük; oyun yeniden başlatılmış olabilir.
  // Bölüm numarası bilinmiyor.
  const edgeColumn = (c) => [R('red-s', c, 0, 1, 1), V('red-s', c, 1), V('red-s', c, 3), V('red-s', c, 5)];
  const outerRow = (r) => [...row('green', [2, 4, 6], r), R('blue', 8, r), ...row('green', [10, 12, 14], r)];
  const ringRow = (r) => [
    R('green', 2, r, 1), R('metal', 3, r), R('green', 5, r), R('blue', 7, r, 1),
    R('blue', 10, r, 1), R('green', 11, r), R('metal', 13, r), R('green', 15, r, 1),
  ];
  const greenSym = [
    ...edgeColumn(1), ...edgeColumn(16),
    ...outerRow(0), ...ringRow(1),
    ...row('green', [2, 4], 2), R('blue', 6, 2, 1), R('blue', 11, 2, 1), ...row('green', [12, 14], 2),
    ...row('purple-s', [2, 4], 3), R('yellow', 8, 3), ...row('purple-s', [12, 14], 3),
    ...row('green', [2, 4], 4), R('blue', 6, 4, 1), R('metal', 7, 4), R('metal', 9, 4), R('blue', 11, 4, 1), ...row('green', [12, 14], 4),
    ...ringRow(5), ...outerRow(6),
  ];

  // Stage 4 — reference-frames/user-stage-04.jpg ("Stage 4"). İki üst blok:
  // satır 0–4 metal/mor/metal/mor/metal. Bloklar ızgaraya göre çeyrek hücre
  // kayık (c = 2.25 / 4.5 ve ayna 11.5 / 13.75); karede satır başına birkaç
  // piksellik dışa kayma da var, ölçüm hatası sayıldı. Alt sıra satır 6.
  // Kuleler hareketli (trim_05): game.js moveTowers konumu her karede hesaplar.
  const pillar = (side) => [0, 2].flatMap((dc) => ['metal', 'purple', 'metal', 'purple', 'metal']
    .map((t, r) => ({ ...R(t, (side === 'L' ? 2.3 : 11.7) + dc, r), move: 'tower', side, dc })));
  const stage4 = [
    ...pillar('L'), ...pillar('R'),
    ...['red', 'blue', 'metal', 'green', 'metal', 'purple', 'metal', 'yellow', 'green'].map((t, i) => R(t, i * 2, 6)),
  ];

  // Stage 5 — reference-frames/user-stage-05.jpg ("Stage 5"). Elmas biçimli
  // halka: sol yarı çizgili mor 2'lik tuğlalar, sağ yarı kırmızı/mor çizgili
  // kareler, ortada tek metal kare. Satır 3 sağdaki kırmızı kare yazının
  // altında kaldı; desenden çıkarıldı.
  const stage5 = [
    R('purple-s', 7, 0), R('purple-s', 9, 0, 1),
    ...[[6, 1], [5, 2], [4, 3], [3, 4]].map(([c, r]) => R('purple-s', c, r)),
    R('red-s', 3, 5, 1),
    ...[[3, 6], [4, 7], [5, 8], [6, 9]].map(([c, r]) => R('purple-s', c, r)),
    ...[[9, 1], [10, 2], [11, 3], [12, 4], [13, 5], [12, 6], [11, 7], [10, 8], [9, 9]].map(([c, r]) => R('red-s', c, r, 1)),
    ...[[10, 1], [11, 2], [12, 3], [13, 4], [13, 6], [12, 7], [11, 8], [10, 9]].map(([c, r]) => R('purple-s', c, r, 1)),
    R('metal', 8, 5, 1),
  ];

  // Stage 6 — reference-frames/user-stage-06.jpg ("Stage 6"). Köşelerde
  // çizgili kırmızı kareler, iki yanda çizgili merdiven, ortada üç renk +
  // mor, altta dört L parçadan iki halka. Halkaların içindeki mavi kareler
  // hareketli: boşlukta kayar, halka kırılınca alanda dolaşır (videom_parca_02).
  const ring = (t, c, r) => [
    L(t, [[c, r], [c + 1, r], [c, r + 1]]), L(t, [[c + 2, r], [c + 3, r], [c + 3, r + 1]]),
    L(t, [[c, r + 2], [c, r + 3], [c + 1, r + 3]]), L(t, [[c + 3, r + 2], [c + 2, r + 3], [c + 3, r + 3]]),
  ];
  const stage6 = [
    R('red-s', 0, 0, 1), R('blue', 6, 0), R('yellow', 8, 0), R('green', 10, 0), R('red-s', 17, 0, 1),
    R('purple-s', 1, 1), R('purple', 8, 1), R('purple-s', 15, 1),
    R('yellow-s', 2, 2), R('yellow-s', 14, 2),
    R('green-s', 3, 3), R('green-s', 13, 3),
    ...ring('violet-s', 4, 4), ...ring('red-s', 10, 4),
    ...[[5, 5], [6, 6], [11, 5], [12, 6]].map(([c, r]) => ({ ...R('blue', c, r, 1), move: true })),
  ];

  // Stage 7 — reference-frames/user-stage-07.jpg ("Stage 7"). Üstte çizgili
  // mor / sarı basamaklar arasında yeşil dikey çiftler, altında kırmızı ve
  // mavi dikey bloklar, iki yanda metal L'ler; altta metal kareler ve L'ler.
  // Satır 3'teki kırmızılar kısmen yazının altında.
  const stage7 = [
    ...row('violet-s', [1, 6, 10, 15], 1),
    ...[4, 5, 8, 9, 12, 13].map((c) => V('green', c, 1)),
    ...row('yellow', [2, 6, 10, 14], 2),
    L('metal', [[1, 3], [1, 4], [2, 4]]), L('metal', [[16, 3], [15, 4], [16, 4]]),
    R('red', 4, 3), R('red', 12, 3),
    ...[6, 7, 10, 11].map((c) => V('blue', c, 3)),
    R('metal', 0, 6, 1), L('metal', [[4, 6], [4, 7], [5, 7]]), R('metal', 8, 6),
    L('metal', [[13, 6], [12, 7], [13, 7]]), R('metal', 17, 6, 1),
    R('metal', 2, 7, 1), R('metal', 15, 7, 1),
  ];

  // Stage 8 — reference-frames/user-stage-08.jpg ("Stage 8"). Sağ üstte sarı
  // çerçeveli kıvrım, soldan sağa yükselen sarı/mavi merdiven, altta mavi ve
  // sarı tam sıralar, en altta yeşil kareler. Yazısız başlangıç karesiyle
  // doğrulandı (reference-frames/video-stage-08-start.jpg).
  const stage8 = [
    R('yellow', 11, 0, 1), R('yellow', 12, 0), R('yellow', 14, 0),
    V('yellow', 11, 1), R('blue', 12, 1, 1), R('blue', 13, 1), V('blue', 15, 1), V('yellow', 16, 1),
    R('red-s', 12, 2, 1), R('metal', 13, 2), R('yellow', 17, 2, 1),
    R('yellow', 10, 3, 1), R('red-s', 11, 3, 1), R('blue', 15, 3, 1), V('blue', 16, 3), R('yellow', 17, 3, 1),
    R('yellow', 6, 4, 1), R('yellow', 7, 4, 1), R('yellow', 8, 4), R('red-s', 10, 4, 1), R('green-s', 15, 4, 1), V('yellow', 17, 4),
    R('yellow', 2, 5, 1), R('yellow', 3, 5, 1), R('yellow', 4, 5), R('yellow', 6, 5, 1), R('blue', 7, 5), R('red-s', 9, 5, 1), R('green-s', 13, 5), V('blue', 16, 5),
    R('yellow', 1, 6), R('blue', 3, 6), R('blue', 5, 6), R('green-s', 7, 6, 1), R('green-s', 12, 6, 1), V('yellow', 17, 6),
    R('yellow', 0, 7, 1), R('blue', 1, 7), R('metal', 4, 7), R('green-s', 8, 7), R('green-s', 10, 7), R('metal', 13, 7), R('blue', 16, 7, 1),
    R('yellow', 0, 8, 1), R('blue', 1, 8, 1), ...row('blue', [2, 4, 6, 8, 10], 8), R('yellow', 12, 8, 1), ...row('blue', [13, 15], 8), R('yellow', 17, 8, 1),
    ...row('yellow', [1, 3, 5, 7, 9], 9), R('yellow', 11, 9, 1), ...row('yellow', [13, 15], 9),
    ...[2, 4, 6, 8, 10, 14, 16].map((c) => R('green', c, 10, 1)),
  ];

  // Stage 9 — reference-frames/user-stage-09.jpg ("Stage 9"). Üstte ve altta
  // çizgili yeşil kareler, ortada iki sıra mor kare. Mor kareler kendi
  // sıralarında yatay kayıyor (videom_parca_03); başlangıç konumları ölçüldü.
  const greenSq = (cols, r) => cols.map((c) => R('green-s', c, r, 1));
  const purpleSq = (cols, r) => cols.flatMap((c) => [R('purple', c, r, 1), R('purple', +(17 - c).toFixed(2), r, 1)]).map((b) => ({ ...b, move: 'h' }));
  const stage9 = [
    ...greenSq([2, 4, 6, 8, 9, 11, 13, 15], 1),
    ...purpleSq([0.6, 3.4, 4.6, 7.4], 4),
    ...purpleSq([0.7, 2.2, 4.35, 5.7, 7.7], 5),
    ...greenSq([1, 3, 5, 7, 10, 12, 14, 16], 8),
    ...greenSq([0, 2, 4, 6, 8, 9, 11, 13, 15, 17], 9),
  ];

  // Stage 10 — reference-frames/video-stage-10-start.jpg (yazısız başlangıç
  // karesiyle birebir doğrulandı). Çizgili kırmızı dikey bloklarla "HUK"
  // biçimi, metal ara parçalar.
  const redCol = (c) => [0, 2, 4, 6, 8].map((r) => V('red-s', c, r));
  const stage10 = [
    ...redCol(2), ...redCol(3), ...redCol(6), ...redCol(7), ...redCol(10), ...redCol(11),
    V('metal', 4, 4), V('metal', 5, 4), R('metal', 8, 8), R('metal', 8, 9),
    V('red-s', 15, 0), R('red-s', 16, 0, 1), R('red-s', 14, 1, 1), V('red-s', 14, 2), V('red-s', 15, 2),
    R('red-s', 13, 3, 1), R('red-s', 14, 4, 1), R('red-s', 12, 4), R('red-s', 12, 5),
    R('red-s', 13, 6, 1), V('red-s', 14, 6), V('red-s', 15, 7), R('red-s', 15, 9, 1), V('red-s', 16, 8),
  ];

  // Stage 11 — trim_17/18 (0.25x kayıt). Mavi kareler 4 sütun aralıklı çapraz
  // çizgiler halinde başlıyor ve oyun boyunca yatayda kayıyor (hepsi hareketli).
  const stage11 = [];
  for (let r = 0; r < 10; r++) {
    const off = (((0.4 - 0.95 * r) % 4) + 4) % 4;
    for (let c = off; c <= 17; c += 4) stage11.push({ ...R('blue', +c.toFixed(2), r, 1), move: 'h' });
  }

  // Stage 12 — trim_19 temiz başlangıç karesi. Metal iskelet, iki sarı ve bir
  // çizgili lila üst sıra, ortada çizgili kırmızı; dört sarı kare serbestçe
  // dolaşıyor.
  const stage12 = [
    R('yellow', 5, 1), R('purple-s', 8, 1), R('yellow', 11, 1),
    ...[1, 4, 7, 10, 13, 16].map((c) => V('metal', c, 2)),
    R('red-s', 8, 4),
    ...[2, 5, 8, 11, 14].map((c) => R('metal', c, 5)),
    ...[4, 7, 10, 13].map((c) => R('metal', c, 7, 1)),
    ...[[6, 4], [11, 4], [6, 6], [11, 6]].map(([c, r]) => ({ ...R('yellow', c, r, 1), move: true })),
  ];

  // Stage 13 — trim_20 temiz başlangıç karesi. Sol üstte turuncu 2×2, ortada
  // mor sütunlu piramit (çizgili kırmızı tepe, çizgili yeşil/lila iç), iki
  // yanda metal basamaklar, sağda yeşil kaktüs, altta sarı ve çizgili lila sıra.
  const stage13 = [
    ...[[1, 1], [2, 1], [1, 2], [2, 2]].map(([c, r]) => R('red', c, r, 1)),
    ...[[9, 0], [8, 1], [10, 1], [7, 2], [11, 2]].map(([c, r]) => R('red-s', c, r, 1)),
    V('purple', 9, 1), V('purple', 8, 2), V('purple', 10, 2),
    V('purple', 7, 3), V('purple', 11, 3), V('purple', 6, 4), V('purple', 12, 4),
    V('purple', 5, 5), V('purple', 13, 5), V('purple', 7, 5), V('purple', 11, 5),
    V('purple', 6, 6), V('purple', 12, 6),
    ...[5, 7, 11, 13].map((c) => R('purple', c, 7, 1)),
    V('green-s', 9, 3), V('green-s', 8, 4), V('green-s', 10, 4), V('green-s', 8, 6), V('green-s', 10, 6),
    V('purple-s', 9, 5), R('purple-s', 9, 7, 1),
    R('metal', 5, 3), R('metal', 12, 3), R('metal', 4, 4), R('metal', 13, 4), R('metal', 3, 5), R('metal', 14, 5),
    V('metal', 0, 6), V('metal', 4, 6), V('metal', 14, 6),
    ...[[16, 1], [15, 2], [16, 2], [17, 2], [15, 3], [16, 3], [17, 3], [16, 4], [16, 5], [16, 6], [16, 7]].map(([c, r]) => R('green', c, r, 1)),
    ...[0, 2, 4, 6, 8, 10, 12, 14, 16].map((c) => R('yellow', c, 8)),
    R('purple-s', 0, 9, 1), ...[1, 3, 5, 7, 9, 11, 13, 15].map((c) => R('purple-s', c, 9)), R('purple-s', 17, 9, 1),
  ];

  // Stage 14 — trim_23 temiz başlangıç karesi. Üstte iki yanda çizgili
  // basamaklar ve ortada küçük piramit, iki mor parça yatay kayıyor; altta
  // karışık iki tam sıra (alt sırada metal aralar).
  const stage14 = [
    R('yellow-s', 0, 0), R('purple-s', 8, 0), R('yellow-s', 16, 0),
    R('green-s', 1, 1), R('red', 7, 1), R('red', 9, 1), R('green-s', 15, 1),
    R('violet-s', 2, 2), R('purple-s', 6, 2), R('purple-s', 8, 2), R('purple-s', 10, 2), R('violet-s', 14, 2),
    { ...R('purple', 5.6, 3, 1), move: 'h' }, { ...R('purple', 7.4, 4), move: 'h' },
    ...['red-s', 'red', 'yellow-s', 'yellow', 'violet-s', 'purple', 'purple-s', 'blue', 'green-s'].map((t, i) => R(t, i * 2, 5)),
    ...['metal', 'red', 'metal', 'blue', 'metal', 'yellow', 'metal', 'purple', 'metal'].map((t, i) => R(t, i * 2, 6)),
  ];

  // Stage 15–21 — kayit_trim videoları (0.25x), temiz başlangıç kareleri
  // reference-frames/kayit-stage-NN-start.jpg.
  const s15band = (r) => [R('green', 2, r), R('green', 4, r), R('green', 6, r), R('blue', 8, r), R('green', 10, r), R('green', 12, r), R('green', 14, r)];
  const s15side = (r) => [R('green', 2, r, 1), R('metal', 3, r), R('green', 5, r), R('blue', 7, r, 1), R('blue', 10, r, 1), R('green', 11, r), R('metal', 13, r), R('green', 15, r, 1)];
  const stage15 = [
    ...[1, 16].flatMap((c) => [R('red-s', c, 1, 1), V('red-s', c, 2), V('red-s', c, 4), V('red-s', c, 6)]),
    ...s15band(1), ...s15side(2),
    R('green', 2, 3), R('green', 4, 3), R('blue', 6, 3, 1), R('blue', 11, 3, 1), R('green', 12, 3), R('green', 14, 3),
    R('purple-s', 2, 4), R('purple-s', 4, 4), R('yellow', 8, 4), R('purple-s', 12, 4), R('purple-s', 14, 4),
    R('green', 2, 5), R('green', 4, 5), R('blue', 6, 5, 1), R('metal', 7, 5), R('metal', 9, 5), R('blue', 11, 5, 1), R('green', 12, 5), R('green', 14, 5),
    ...s15side(6), ...s15band(7),
  ];

  const stage16 = [
    ...row('green', [6, 8, 10], 0),
    R('green', 5, 1), ...row('red', [7, 9], 1), R('green', 11, 1),
    R('green', 4, 2), ...row('red', [6, 8, 10], 2), R('green', 12, 2),
    R('green', 3, 3), R('red', 5, 3), R('metal', 7, 3), R('metal', 9, 3), R('red', 11, 3), R('green', 13, 3),
    R('green', 2, 4), ...row('red', [4, 6, 8, 10, 12], 4), R('green', 14, 4),
    R('green', 1, 5), ...row('red', [3, 5, 7, 9, 11, 13], 5), R('green', 15, 5),
    ...row('blue', [0, 2, 4], 6), R('metal', 6, 6), R('red', 8, 6), R('metal', 10, 6), ...row('blue', [12, 14, 16], 6),
    ...[0, 4, 8, 12, 16].map((c) => R('violet-s', c, 7)), ...[2, 6, 10, 14].map((c) => R('blue-s', c, 7)),
  ];

  // Stage 17 — kalp ve mavi kareli kalp çizgisi. Kenarlar çizgili kırmızı.
  const stage17 = [
    R('red-s', 4, 1), R('red-s', 7, 1),
    ...[[3, 2], [6, 2], [9, 2], [2, 5], [10, 5], [3, 6], [9, 6], [4, 7], [8, 7], [5, 8], [7, 8], [6, 9]].map(([c, r]) => R('red-s', c, r, 1)),
    V('red-s', 2, 3), V('red-s', 10, 3),
    V('red', 3, 3), R('red', 3, 5, 1), V('red', 4, 2), V('red', 4, 4), R('red', 4, 6, 1),
    V('red', 5, 2), V('red', 5, 4), V('red', 5, 6), V('red', 6, 3), V('red', 6, 5), V('red', 6, 7),
    V('red', 7, 2), V('red', 7, 4), V('red', 7, 6), V('red', 8, 2), V('red', 8, 4), R('red', 8, 6, 1),
    V('red', 9, 3), R('red', 9, 5, 1),
    R('blue', 12, 3), R('blue', 11, 4, 1), R('blue', 14, 4, 1), V('blue', 15, 5), R('blue', 15, 7, 1),
    ...[[8, 8], [14, 8], [9, 9], [13, 9], [10, 10], [12, 10], [11, 11]].map(([c, r]) => R('blue', c, r, 1)),
  ];

  // Stage 18 — metal yüz/robot: çizgili lila sütunlar, metal kemer, altta
  // çizgili kırmızı tam sıra. Ortadaki metal parçalar yarım hücre kayık.
  const stage18 = [
    ...row('metal', [6, 8, 10], 0),
    R('metal', 6, 1, 1), R('red', 7, 1, 1), R('purple-s', 8, 1), R('red', 10, 1, 1), R('metal', 11, 1, 1),
    ...[1, 2, 3, 4].flatMap((r) => [R('purple-s', 3, r), R('purple-s', 13, r)]),
    R('purple-s', 7, 2), R('purple-s', 9, 2),
    R('metal', 6.5, 3, 1), R('purple-s', 8, 3), R('metal', 10.5, 3, 1),
    R('metal', 6.5, 4), R('metal', 9.5, 4),
    R('metal', 1.1, 5, 1), V('metal', 7.75, 5), V('metal', 9.25, 5), R('metal', 15.8, 5, 1),
    ...row('purple-s', [1, 3, 5, 11, 13, 15], 6),
    ...row('red-s', [0, 2, 4, 6, 8, 10, 12, 14, 16], 7),
  ];

  // Stage 19 — iki tek sıra (yeşil + çizgili lila), dikey metal eksen, altta
  // kırmızı + çizgili lila tek sıralar.
  const singles = (t, from, to, r) => Array.from({ length: to - from + 1 }, (_, i) => R(t, from + i, r, 1));
  const stage19 = [
    V('metal', 8, 0), ...singles('green', 0, 17, 2), ...singles('purple-s', 0, 17, 3), V('metal', 8, 4),
    ...singles('red', 2, 15, 6), ...singles('purple-s', 2, 15, 7),
  ];

  // Stage 20 — kırmızı kanat/merdiven, ortada sarı U içinde çizgili yeşil, yanlarda
  // kırmızı köşeli parçalar, altta mavi ve metal. Konumlar kullanıcının net
  // "Stage 20" karesinden (images/19); oyun sırasında yan parçalar kayık
  // görünüyor, hareket ediyor olabilirler (doğrulanmadı).
  const stage20 = [
    R('red-s', 0, 1), R('red-s', 2, 1, 1), R('red-s', 15, 1, 1), R('red-s', 16, 1),
    R('red', 1, 2), R('red-s', 3, 2), R('red-s', 5, 2, 1), R('red-s', 12, 2, 1), R('red-s', 13, 2), R('red', 15, 2),
    R('red', 4, 3), R('red-s', 6, 3), R('metal', 8, 3), R('red-s', 10, 3), R('red', 12, 3),
    R('red', 1, 4), R('yellow', 7, 4), R('yellow', 9, 4), R('red', 15, 4),
    R('red', 1, 5), R('yellow', 7, 5, 1), R('green-s', 8, 5, 1), R('green-s', 9, 5, 1), R('yellow', 10, 5, 1), R('red', 15, 5),
    R('red', 2, 6, 1), R('red', 4, 6), R('red-s', 6, 6), R('metal', 8, 6), R('red-s', 10, 6), R('red', 12, 6), R('red', 15, 6, 1),
    R('red', 1, 7), R('red-s', 3, 7), R('red-s', 5, 7, 1), R('metal', 6, 7), R('metal', 10, 7), R('red-s', 12, 7, 1), R('red-s', 13, 7), R('red', 15, 7),
    R('blue', 0, 8), R('blue', 2, 8, 1), R('blue', 3, 8), R('blue', 13, 8), R('blue', 15, 8, 1), R('blue', 16, 8),
    R('metal', 0, 9), R('metal', 16, 9),
  ];

  // Stage 21 — çizgili lila elmas; ortadan geçen mavi sıra elmastan geniş ve
  // aralıklı (konumlar ölçüldü).
  const stage21 = [
    ...row('purple-s', [7, 9], 2), ...row('purple-s', [5, 7, 9, 11], 3), ...row('purple-s', [3, 5, 7, 9, 11, 13], 4),
    ...[0.85, 2.95, 5.05, 7.2, 9.2, 11.3, 13.4, 15.5].map((c) => R('blue', c, 5)),
    ...row('purple-s', [3, 5, 7, 9, 11, 13], 6), ...row('purple-s', [5, 7, 9, 11], 7), ...row('purple-s', [7, 9], 8),
  ];

  // Stage 22–31 — yeni_parca_02…23 videoları; her bölümün "Stage N" yazısı
  // kaybolduğu andaki kare ızgarayla ölçüldü (reference-frames/parca-stage-NN.jpg).
  // Hareketli bloklarda `speed` (px/s), `dir` (+1 sağa) ve `amp` (hücre, salınım
  // genliği) videodaki hızdan yaklaşık olarak alındı.
  const mv = (b, dir, speed, amp) => ({ ...b, move: 'h', dir, speed, ...(amp ? { amp } : {}) });
  const shiftC = (b, dc) => (b.cells ? { ...b, cells: b.cells.map(([c, r]) => [c + dc, r]) } : { ...b, c: b.c + dc });
  const mirrorC = (b) => (b.cells ? { ...b, cells: b.cells.map(([c, r]) => [17 - c, r]) } : { ...b, c: 18 - b.c - b.w });

  // Stage 22 — metal çerçeve içinde dikey kırmızılar; kenarlarda dört mavi sıra.
  const stage22 = [
    R('purple-s', 8, 1),
    L('red', [[4, 2], [5, 2], [4, 3]]), L('metal', [[6, 2], [5, 3], [6, 3]]), R('purple-s', 7, 2), R('purple-s', 9, 2),
    L('metal', [[11, 2], [11, 3], [12, 3]]), L('red', [[12, 2], [13, 2], [13, 3]]),
    ...[3, 4, 5, 6].flatMap((r) => [R('blue', 0, r), R('blue', 16, r)]),
    L('metal', [[2, 3], [3, 3], [2, 4]]), R('metal', 7, 3), R('metal', 9, 3), L('metal', [[14, 3], [15, 3], [15, 4]]),
    ...[3, 4, 6, 7, 10, 11, 13, 14].map((c) => V('red', c, 4)), V('purple-s', 5, 4), V('purple-s', 12, 4), R('purple-s', 8, 4),
    R('metal', 8, 5), L('metal', [[2, 5], [2, 6], [3, 6]]), L('metal', [[15, 5], [15, 6], [14, 6]]),
    ...row('metal', [4, 6, 8, 10, 12], 6),
  ];

  // Stage 23 — asimetrik; alttaki iki metal blok yatayda kayıyor (duvardan sekiyor).
  const stage23 = [
    R('violet-s', 8, 0, 1), R('violet-s', 8, 1, 1), V('violet-s', 7, 1), V('violet-s', 9, 1), V('green', 8, 2),
    R('red-s', 1, 1), R('red-s', 13, 1), R('red-s', 3, 3), R('red-s', 14, 3), V('red-s', 12, 3), R('red-s', 0, 4, 1), R('red-s', 16, 5, 1),
    ...[6, 7, 9, 10].map((c) => R('violet-s', c, 3, 1)), V('violet-s', 6, 4), V('violet-s', 10, 4), R('violet-s', 6, 6, 1), R('violet-s', 10, 6, 1),
    ...[[7, 4], [9, 4], [5, 6], [11, 6], [6, 7], [10, 7]].map(([c, r]) => R('metal', c, r, 1)),
    V('purple', 2, 5), V('purple', 14, 5), ...[1, 3, 13, 15, 17].map((c) => V('purple', c, 7)), ...[0, 4, 12, 16].map((c) => R('purple', c, 9, 1)),
    V('violet-s', 5, 7), V('violet-s', 11, 7), R('green', 7, 7), R('green', 9, 7, 1),
    ...[0, 2, 4, 8, 12, 14, 16].map((c) => R('yellow', c, 8, 1)), R('yellow', 6, 8), R('yellow', 9, 8),
    mv(R('metal', 0.3, 10), -1, 23), mv(R('metal', 15, 10), -1, 23),
  ];

  // Stage 24 — iki mavi sarmal, kırmızı çerçeve; ortada metal ve çizgili yeşil.
  const stage24 = [
    ...[5, 6, 11, 12].map((c) => R('purple-s', c, 0, 1)), R('purple-s', 7, 1, 1), R('purple-s', 10, 1, 1),
    ...[2, 15].flatMap((c) => [V('red', c, 1), R('red', c, 3, 1), V('red', c, 4), V('red', c, 6)]),
    R('red', 3, 1), R('red', 13, 1), R('red', 3, 7), R('red', 13, 7),
    ...[[5, 2], [5, 6], [6, 3], [6, 5], [12, 2], [12, 6], [11, 3], [11, 5]].map(([c, r]) => R('red', c, r, 1)),
    R('blue', 3, 2), L('blue', [[3, 3], [3, 4], [4, 4]]), R('blue', 4, 3), L('blue', [[5, 4], [4, 5], [5, 5]]), L('blue', [[3, 5], [3, 6], [4, 6]]),
    R('blue', 13, 2), L('blue', [[14, 3], [14, 4], [13, 4]]), R('blue', 12, 3), L('blue', [[12, 4], [13, 5], [12, 5]]), L('blue', [[14, 5], [14, 6], [13, 6]]),
    R('metal', 8, 2), R('metal', 6, 4), R('metal', 8, 4), R('metal', 10, 4), R('metal', 8, 6),
    R('green-s', 7, 3), R('green-s', 9, 3), R('green-s', 7, 5), R('green-s', 9, 5),
    R('yellow', 3, 8, 1), R('yellow', 2, 9, 1), R('yellow', 14, 8, 1), R('yellow', 15, 9, 1),
  ];

  // Stage 25 — çizgili kırmızı ve lila dağınık kümeler.
  const stage25 = [
    R('purple-s', 12, 1), R('purple-s', 14, 1),
    ...[2, 4, 8, 9, 12, 15].map((c) => R('red-s', c, 2, 1)), R('purple-s', 11, 2, 1), R('purple-s', 13, 2),
    ...[3, 7, 8].map((c) => R('red-s', c, 3, 1)), R('purple-s', 9, 3, 1), R('purple-s', 10, 3, 1), R('purple-s', 12, 3), R('purple-s', 14, 3),
    R('purple-s', 2, 4), R('purple-s', 4, 4), R('purple-s', 7, 4, 1), R('purple-s', 8, 4, 1), ...[9, 10, 14].map((c) => R('red-s', c, 4, 1)),
    ...[2, 5, 8, 9, 13, 15].map((c) => R('red-s', c, 5, 1)), R('purple-s', 3, 5), R('purple-s', 6, 5, 1),
    R('purple-s', 2, 6), R('purple-s', 4, 6),
  ];

  // Stage 26 — "KCS" harfleri (lila, sarı, yeşil; hepsi çizgili).
  const stage26 = [
    R('purple-s', 2, 2, 1), V('purple-s', 2, 3), V('purple-s', 2, 5), V('purple-s', 2, 7), V('purple-s', 5, 2), V('purple-s', 5, 7),
    R('purple-s', 4, 4, 1), R('purple-s', 3, 5, 1), R('purple-s', 4, 6, 1),
    R('yellow-s', 8, 2), R('yellow-s', 10, 2, 1), R('yellow-s', 8, 3, 1), V('yellow-s', 7, 3), R('yellow-s', 7, 5, 1), V('yellow-s', 7, 6),
    R('yellow-s', 8, 7, 1), R('yellow-s', 8, 8), R('yellow-s', 10, 8, 1),
    R('green-s', 13, 2), R('green-s', 15, 2, 1), V('green-s', 12, 3), R('green-s', 13, 5), V('green-s', 15, 6), R('green-s', 12, 8, 1), R('green-s', 13, 8),
  ];

  // Stage 27 — kare sıralar; sarı sıra sağa kayıp birbirinden sekiyor, metal
  // kareler çiftler halinde küçük salınım yapıyor (hareket yaklaşık).
  const gap27 = [0, 1, 2, 3, 4, 5, 6, 7, 10, 11, 12, 13, 14, 15, 16, 17];
  const stage27 = [
    ...[0, 2, 4, 6, 8, 10, 12, 14, 16].map((c) => R('violet-s', c, 1, 1)),
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((k) => mv(R('yellow', 1.4 + 2 * k, 2, 1), 1, 16)),
    ...[[0.25, 1], [1.7, -1], [3.25, 1], [4.7, -1], [6.2, 1], [7.65, -1], [9.15, 1], [10.6, -1]].map(([c, d]) => mv(R('metal', c, 3, 1), d, 16, 0.2)),
    mv(R('metal', 12.4, 3, 1), -1, 16, 0.35),
    ...gap27.map((c) => R('blue', c, 5, 1)), ...gap27.map((c) => R('red-s', c, 6, 1)),
    ...Array.from({ length: 18 }, (_, c) => R(c === 16 ? 'violet-s' : c % 2 ? 'yellow' : 'purple-s', c, 8, 1)),
    ...Array.from({ length: 18 }, (_, c) => R('green', c, 9, 1)),
  ];

  // Stage 28 — mor kareler V çiziyor; her sırada metal bloklar kareler arasında kayıyor.
  const stage28 = [
    ...[[4, 1], [13, 1], [0, 2], [5, 2], [12, 2], [17, 2], [1, 3], [6, 3], [11, 3], [16, 3], [2, 4], [7, 4], [10, 4], [15, 4],
      [3, 5], [8, 5], [9, 5], [14, 5], [4, 6], [13, 6], [5, 7], [12, 7], [6, 8], [11, 8], [7, 9], [10, 9], [8, 10], [9, 10]]
      .map(([c, r]) => R('violet-s', c, r, 1)),
    ...[[1.8, 1, -1], [14.45, 1, 1], [2.6, 2, -1], [13.4, 2, 1], [3.65, 3, -1], [12.35, 3, 1], [4.7, 4, -1], [11.3, 4, 1],
      [5.75, 5, -1], [10.25, 5, 1], [6.8, 6, -1], [9.05, 6, 1], [6.25, 7, 1], [9.85, 7, -1]].map(([c, r, d]) => mv(R('metal', c, r), d, 25)),
    R('green-s', 8, 8),
  ];

  // Stage 29 — iki metal çerçeveli kare; ortada iki lila kare kayıyor.
  const half29 = [
    L('metal', [[0, 0], [1, 0], [0, 1]]), R('metal', 2, 0), R('metal', 4, 0), L('metal', [[6, 0], [7, 0], [7, 1]]),
    V('metal', 0, 2), V('metal', 0, 4), V('metal', 7, 4),
    L('metal', [[0, 6], [0, 7], [1, 7]]), R('metal', 2, 7), R('metal', 4, 7), L('metal', [[7, 6], [6, 7], [7, 7]]),
  ];
  const inner29 = [
    L('blue', [[1, 1], [2, 1], [1, 2]]), R('blue', 3, 1), L('blue', [[5, 1], [6, 1], [6, 2]]), V('blue', 1, 3), V('blue', 6, 3),
    L('blue', [[1, 5], [1, 6], [2, 6]]), R('blue', 3, 6), L('blue', [[6, 5], [5, 6], [6, 6]]),
    L('green', [[2, 2], [3, 2], [2, 3]]), L('green', [[4, 2], [5, 2], [5, 3]]), L('green', [[2, 4], [2, 5], [3, 5]]), L('green', [[5, 4], [4, 5], [5, 5]]),
    R('purple', 4, 3, 1), R('purple', 4, 4, 1),
  ];
  const stage29 = [
    ...half29, ...half29.map(mirrorC), ...inner29, ...inner29.map((b) => shiftC(b, 10)),
    mv(R('purple', 8.75, 0, 1), -1, 20), mv(R('purple', 8.3, 1, 1), 1, 20),
    R('green', 9, 4, 1), R('yellow', 8, 5, 1), R('blue', 9, 6, 1), R('red', 8, 7, 1),
  ];

  // Stage 30 — kırmızı ve sarı dalgalar; dört metal kare.
  const stage30 = [
    R('red-s', 4, 0), R('yellow', 8, 0),
    ...[3, 6, 17].map((c) => R('red-s', c, 1, 1)), R('yellow', 7, 1, 1), R('yellow', 10, 1, 1),
    V('red-s', 2, 2), V('red-s', 7, 2), V('red-s', 16, 2), V('yellow', 6, 2), V('yellow', 11, 2),
    ...[1, 8, 15].map((c) => R('red-s', c, 3, 1)), R('yellow', 5, 3, 1), R('yellow', 12, 3, 1),
    V('red-s', 1, 4), V('red-s', 8, 4), V('red-s', 15, 4), ...[2, 7, 16].map((c) => R('red-s', c, 4, 1)),
    V('yellow', 5, 4), V('yellow', 12, 4), R('yellow', 6, 4, 1), R('yellow', 11, 4, 1),
    ...[0, 9, 14].map((c) => R('red-s', c, 5, 1)), R('yellow-s', 4, 5, 1), R('yellow-s', 13, 5, 1),
    ...[1, 8, 15].map((c) => R('red-s', c, 6, 1)), V('red', 0, 6), V('red', 9, 6), V('red', 14, 6),
    V('yellow-s', 4, 6), V('yellow-s', 13, 6), R('yellow-s', 5, 6, 1), R('yellow-s', 12, 6, 1),
    ...[3, 5, 8, 10].map((c) => R('metal', c, 7, 1)),
    ...[0, 3, 14, 17].map((c) => R('yellow-s', c, 8, 1)), R('red', 10, 8, 1), R('red', 13, 8, 1),
    R('yellow-s', 1, 9), R('red', 11, 9), R('yellow-s', 15, 9),
  ];

  // Stage 31 — kırmızı direk ve yeşil kanatlar; iki metal L ortaya doğru kayıp sekiyor.
  const stage31 = [
    R('metal', 7, 1, 1), R('purple-s', 8, 1), R('metal', 10, 1, 1),
    R('purple-s', 7, 2, 1), R('purple-s', 8, 2), R('purple-s', 10, 2, 1), R('metal', 8, 3),
    R('green-s', 1, 4), R('green-s', 3, 4, 1), R('green-s', 4, 4), R('green-s', 6, 4),
    R('green-s', 10, 4), R('green-s', 12, 4), R('green-s', 14, 4, 1), R('green-s', 15, 4),
    R('green-s', 1, 5, 1), R('metal', 2, 5, 1), R('green-s', 3, 5), R('green-s', 5, 5), R('green-s', 7, 5, 1),
    R('green-s', 10, 5, 1), R('green-s', 11, 5), R('green-s', 13, 5), R('metal', 15, 5, 1), R('green-s', 16, 5, 1),
    R('green-s', 2, 6, 1), R('green-s', 15, 6, 1),
    V('red', 8, 4), V('red', 8, 6), V('red', 8, 8), R('red', 8, 10, 1), R('red', 9, 4, 1), V('metal', 9, 5), V('red', 9, 7), V('red', 9, 9),
    mv(L('metal', [[0.85, 7], [1.85, 7], [0.85, 8]]), 1, 25), mv(L('metal', [[15.15, 7], [16.15, 7], [16.15, 8]]), -1, 25),
    R('yellow-s', 4, 7), R('metal', 6, 7), R('metal', 10, 7), R('yellow-s', 12, 7),
    R('yellow-s', 5, 8), R('yellow-s', 7, 8, 1), R('yellow-s', 10, 8, 1), R('yellow-s', 11, 8),
    R('metal', 7, 10, 1), R('metal', 10, 10, 1),
  ];


  // Stage 32–74 — masaüstü ekran kaydı (uzun 4× YouTube videosu, Stage 31 → oyun sonu).
  // Kareler kayıttan otomatik hücre çıkarımıyla ölçülüp elle düzeltildi
  // (reference-frames/kayit2-stage-NN.jpg). Kayan blokların hızı yaklaşık.
  const stage32 = [
    R('violet-s', 0, 0, 1), R('blue', 1, 0), R('blue', 3, 0), R('blue', 5, 0), R('blue', 7, 0), R('blue', 9, 0), R('blue', 11, 0), R('blue', 13, 0), R('blue', 15, 0), R('red-s', 17, 0, 1),
    R('violet-s', 1, 1, 1), R('red-s', 2, 1), R('red-s', 4, 1), R('metal', 6, 1), R('red-s', 8, 1), R('metal', 10, 1), R('red-s', 12, 1), R('red-s', 14, 1), R('red-s', 16, 1, 1),
    R('violet-s', 2, 2, 1), R('green', 3, 2), R('green', 5, 2), R('green', 7, 2), R('green', 9, 2), R('green', 11, 2), R('green', 13, 2), R('red-s', 15, 2, 1),
    R('violet-s', 3, 3, 1), R('purple-s', 4, 3), R('purple-s', 6, 3), R('purple-s', 8, 3), R('purple-s', 10, 3), R('purple-s', 12, 3), R('red-s', 14, 3, 1),
    R('violet-s', 4, 4, 1), R('metal', 5, 4), R('metal', 7, 4), R('metal', 9, 4), R('metal', 11, 4), R('red-s', 13, 4, 1),
    R('violet-s', 5, 5, 1), R('yellow-s', 6, 5), R('yellow-s', 8, 5), R('yellow-s', 10, 5), R('red-s', 12, 5, 1),
    R('violet-s', 6, 6, 1), R('purple', 7, 6), R('purple', 9, 6), R('red-s', 11, 6, 1),
    R('violet-s', 7, 7, 1), R('green-s', 8, 7), R('red-s', 10, 7, 1),
    R('violet-s', 8, 8, 1), R('red-s', 9, 8, 1),
    R('metal', 0, 9, 1), R('metal', 4, 9, 1), R('red-s', 8, 9, 1), R('violet-s', 9, 9, 1), R('metal', 10, 9, 1), R('metal', 14, 9, 1),
    R('red-s', 7, 10, 1), R('violet-s', 10, 10, 1),
  ];

  const stage33 = [
    R('red', 1, 1), R('red', 3, 1), R('red', 5, 1), R('red', 7, 1), R('red', 9, 1), R('red', 11, 1), R('red', 13, 1), R('red', 15, 1),
    V('violet-s', 1, 2), V('violet-s', 3, 2), V('violet-s', 5, 2), V('violet-s', 7, 2), V('violet-s', 9, 2), V('violet-s', 11, 2), V('violet-s', 13, 2), V('violet-s', 15, 2),
    R('blue', 1, 4), R('blue', 3, 4), R('blue', 5, 4), R('blue', 7, 4), R('blue', 9, 4), R('blue', 11, 4), R('blue', 13, 4), R('blue', 15, 4),
    V('green-s', 2, 5), V('green-s', 4, 5), V('green-s', 6, 5), V('green-s', 8, 5), V('green-s', 10, 5), V('green-s', 12, 5), V('green-s', 14, 5), V('green-s', 16, 5),
    R('yellow', 1, 7), R('yellow', 3, 7), R('yellow', 5, 7), R('yellow', 7, 7), R('yellow', 9, 7), R('yellow', 11, 7), R('yellow', 13, 7), R('yellow', 15, 7),
  ];

  const stage34 = [
    R('red-s', 4, 0, 1), R('red-s', 13, 0, 1),
    R('red-s', 3, 1, 1), R('red-s', 5, 1, 1), R('red-s', 12, 1, 1), R('red-s', 14, 1, 1),
    R('red-s', 2, 2, 1), R('red-s', 6, 2, 1), R('red-s', 11, 2, 1), R('red-s', 15, 2, 1),
    R('red-s', 1, 3, 1), R('metal', 4, 3, 1), R('red-s', 7, 3, 1), R('red-s', 10, 3, 1), R('metal', 13, 3, 1), R('red-s', 16, 3, 1),
    R('red-s', 0, 4, 1), R('metal', 3, 4, 1), R('metal', 5, 4, 1), R('red-s', 8, 4, 1), R('red-s', 9, 4, 1), R('metal', 12, 4, 1), R('metal', 14, 4, 1), R('red-s', 17, 4, 1),
    R('metal', 4, 5, 1), R('metal', 13, 5, 1),
    R('green', 0, 7, 1), R('green', 1, 7, 1), R('violet-s', 2, 7), R('violet-s', 4, 7), R('violet-s', 6, 7), R('violet-s', 8, 7), R('violet-s', 10, 7), R('violet-s', 12, 7), R('violet-s', 14, 7), R('violet-s', 16, 7),
    R('red-s', 0, 8), R('red-s', 2, 8), R('red-s', 4, 8), R('red-s', 6, 8), R('red-s', 8, 8), R('red-s', 10, 8), R('red-s', 12, 8), R('red-s', 14, 8), R('blue', 16, 8, 1), R('blue', 17, 8, 1),
  ];

  const stage35 = [
    R('purple-s', 13, 0, 1), R('purple-s', 14, 0, 1), R('purple-s', 15, 0, 1),
    R('red', 4, 1, 1), R('red', 5, 1), R('red', 10, 1), R('purple-s', 12, 1, 1), R('purple-s', 13, 1, 1), R('purple-s', 14, 1, 1),
    R('red', 3, 2, 1), R('red', 7, 2, 1), R('red', 9, 2, 1), R('purple-s', 12, 2, 1), R('purple-s', 13, 2, 1),
    R('red', 2, 3, 1), V('red', 8, 3), R('purple-s', 11, 3, 1), R('red', 14, 3, 1),
    V('red', 2, 4), R('purple-s', 10, 4, 1), V('red', 14, 4),
    R('purple-s', 9, 5, 1),
    R('red', 3, 6, 1), R('red', 13, 6, 1),
    R('red', 4, 7, 1), R('red', 12, 7, 1),
    R('red', 5, 8, 1), R('red', 11, 8, 1),
    R('purple-s', 3, 9, 1), R('purple-s', 5, 9, 1), R('red', 6, 9, 1), R('red', 10, 9, 1),
    R('purple-s', 3, 10, 1), R('purple-s', 4, 10, 1), R('red', 7, 10, 1), R('red', 9, 10, 1),
    R('purple-s', 3, 11, 1), R('purple-s', 4, 11, 1), R('purple-s', 5, 11, 1), R('red', 8, 11, 1),
  ];

  const stage36 = [
    R('yellow-s', 0, 0, 1), R('yellow-s', 1, 0, 1), R('yellow-s', 2, 0, 1), R('yellow-s', 3, 0, 1), R('yellow-s', 4, 0, 1), R('yellow-s', 5, 0, 1), R('yellow-s', 6, 0, 1), R('yellow-s', 7, 0, 1), R('yellow-s', 8, 0, 1), R('yellow-s', 9, 0, 1), R('yellow-s', 10, 0, 1), R('yellow-s', 11, 0, 1), R('yellow-s', 12, 0, 1), R('yellow-s', 13, 0, 1), R('yellow-s', 14, 0, 1), R('yellow-s', 15, 0, 1), R('yellow-s', 16, 0, 1), R('yellow-s', 17, 0, 1),
    R('yellow-s', 0, 1, 1), R('yellow-s', 1, 1, 1), R('yellow-s', 2, 1, 1), R('yellow-s', 3, 1, 1), R('yellow-s', 4, 1, 1), R('red-s', 5, 1, 1), R('red-s', 6, 1, 1), R('red-s', 7, 1, 1), R('red-s', 8, 1, 1), R('red-s', 9, 1, 1), R('yellow-s', 10, 1, 1), R('yellow-s', 11, 1, 1), R('yellow-s', 12, 1, 1), R('yellow-s', 13, 1, 1), R('yellow-s', 14, 1, 1), R('yellow-s', 15, 1, 1), R('yellow-s', 16, 1, 1), R('yellow-s', 17, 1, 1),
    R('yellow-s', 3, 2), R('yellow-s', 5, 2, 1), R('red-s', 6, 2, 1), R('red-s', 7, 2, 1), R('red-s', 8, 2, 1), R('red-s', 9, 2, 1),
    R('yellow-s', 3, 3), R('yellow-s', 5, 3, 1), R('green-s', 11, 3, 1), R('green-s', 12, 3, 1), R('green-s', 15, 3, 1), R('green-s', 16, 3, 1),
    R('yellow-s', 3, 4), R('yellow-s', 5, 4, 1), R('green-s', 11, 4, 1), R('green-s', 12, 4, 1), R('green-s', 15, 4, 1), R('green-s', 16, 4, 1),
    R('yellow-s', 3, 5), R('yellow-s', 5, 5, 1), R('red-s', 6, 5, 1), R('red-s', 7, 5, 1), R('red-s', 8, 5, 1), R('red-s', 9, 5, 1), R('blue', 13, 5, 1), R('blue', 14, 5, 1),
    R('yellow-s', 3, 6), R('yellow-s', 5, 6, 1), R('red-s', 6, 6, 1), R('red-s', 7, 6, 1), R('red-s', 8, 6, 1), R('red-s', 9, 6, 1), R('green-s', 11, 6, 1), R('blue', 13, 6, 1), R('blue', 14, 6, 1), R('green-s', 16, 6, 1),
    R('yellow-s', 3, 7), R('yellow-s', 5, 7, 1), R('green-s', 12, 7, 1), R('green-s', 15, 7, 1),
    R('yellow-s', 3, 8), R('yellow-s', 5, 8, 1), R('green-s', 13, 8, 1), R('green-s', 14, 8, 1),
    R('red-s', 4, 9, 1), R('red-s', 5, 9, 1),
  ];

  const stage37 = [
    L('red', [[1, 1], [2, 1], [1, 2]]), R('red', 3, 1), R('red', 5, 1), R('red', 7, 1), R('red', 9, 1), R('red', 11, 1), R('red', 13, 1), L('red', [[15, 1], [16, 1], [16, 2]]),
    V('red', 1, 3), L('purple-s', [[3, 3], [4, 3], [3, 4]]), R('purple-s', 5, 3), R('purple-s', 7, 3), R('purple-s', 9, 3), R('purple-s', 11, 3), L('purple-s', [[13, 3], [14, 3], [14, 4]]), V('red', 16, 3),
    V('red', 1, 5), V('purple-s', 3, 5), L('yellow', [[5, 5], [6, 5], [5, 6]]), R('yellow', 7, 5), R('yellow', 9, 5), L('yellow', [[11, 5], [12, 5], [12, 6]]), V('purple-s', 14, 5), V('red', 16, 5),
    V('red', 1, 7), V('purple-s', 3, 7), V('yellow', 5, 7), L('green', [[7, 7], [8, 7], [7, 8]]), L('green', [[9, 7], [10, 7], [10, 8]]), V('yellow', 12, 7), V('purple-s', 14, 7), V('red', 16, 7),
    V('red', 1, 9), V('yellow', 5, 9), V('yellow', 12, 9), V('red', 16, 9),
  ];

  const stage38 = [
    V('red-s', 1, 0), V('red-s', 2, 0), V('red-s', 3, 0), V('red-s', 4, 0), R('red-s', 11, 0), R('red-s', 13, 0), R('red-s', 15, 0),
    V('red-s', 5, 1), V('red-s', 6, 1), R('red-s', 11, 1), R('red-s', 13, 1), R('red-s', 15, 1),
    V('red-s', 1, 2), V('red-s', 2, 2), R('red-s', 12, 2), R('red-s', 14, 2),
    V('metal', 3.7, 3), V('metal', 8.55, 3), R('red-s', 13, 3),
    R('metal', 1, 4), R('metal', 11.4, 4),
    R('metal', 1, 5), R('metal', 4, 5, 1), V('red-s', 6, 5), V('red-s', 7, 5), R('metal', 10.5, 5), R('red-s', 13, 5),
    V('red-s', 1, 6), V('red-s', 2, 6), R('red-s', 13, 6),
    V('red-s', 5, 7), V('red-s', 6, 7), R('metal', 9.75, 7),
    V('red-s', 1, 8), V('red-s', 2, 8), V('red-s', 3, 8), V('red-s', 4, 8), R('red-s', 10, 8, 1), R('red-s', 13, 8),
    R('red-s', 10, 9), R('red-s', 12, 9),
    R('red-s', 11, 10),
  ];

  const stage39 = [
    L('metal', [[1, 2], [2, 2], [1, 3]]), L('metal', [[4, 2], [5, 2], [5, 3]]), L('yellow', [[7, 2], [8, 2], [7, 3]]), L('yellow', [[9, 2], [10, 2], [10, 3]]), L('metal', [[12, 2], [13, 2], [12, 3]]), L('metal', [[15, 2], [16, 2], [16, 3]]),
    mv(R('purple', 4, 3, 1), -1, 20, 0.5), R('red-s', 8, 3), mv(R('purple', 15, 3, 1), -1, 20, 0.5),
    R('red-s', 8, 4),
    L('metal', [[1, 5], [1, 6], [2, 6]]), mv(R('purple', 2, 5, 1), 1, 20, 0.5), L('metal', [[5, 5], [4, 6], [5, 6]]), L('yellow', [[7, 5], [7, 6], [8, 6]]), R('red-s', 8, 5), L('yellow', [[10, 5], [9, 6], [10, 6]]), L('metal', [[12, 5], [12, 6], [13, 6]]), mv(R('purple', 13, 5, 1), 1, 20, 0.5), L('metal', [[16, 5], [15, 6], [16, 6]]),
  ];

  const stage40 = [
    R('red-s', 1, 1), R('red-s', 5, 1), R('red-s', 9, 1), R('red-s', 13, 1), R('red-s', 15, 1),
    L('yellow-s', [[0, 2], [0, 3], [1, 3]]), L('yellow-s', [[1, 2], [2, 2], [2, 3]]), L('yellow-s', [[3, 2], [3, 3], [4, 3]]), L('yellow-s', [[4, 2], [5, 2], [5, 3]]), L('yellow-s', [[6, 2], [6, 3], [7, 3]]), L('yellow-s', [[7, 2], [8, 2], [8, 3]]), L('yellow-s', [[9, 2], [9, 3], [10, 3]]), L('yellow-s', [[10, 2], [11, 2], [11, 3]]), L('yellow-s', [[12, 2], [12, 3], [13, 3]]), L('yellow-s', [[13, 2], [14, 2], [14, 3]]), L('yellow-s', [[15, 2], [15, 3], [16, 3]]), L('yellow-s', [[16, 2], [17, 2], [17, 3]]),
    mv(R('metal', 1.65, 4), 1, 60), mv(R('metal', 4.25, 4), 1, 60), mv(R('metal', 11.5, 4), -1, 60), mv(R('metal', 14.25, 4), -1, 60),
    R('red', 3, 5), R('red', 5, 5), R('red', 7, 5), R('red', 9, 5), R('red', 11, 5), R('red', 13, 5),
    R('blue', 3, 6, 1), R('blue', 4, 6), R('blue', 6, 6, 1), R('blue', 7, 6), R('blue', 9, 6, 1), R('blue', 10, 6), R('blue', 12, 6, 1), R('blue', 13, 6),
    R('red-s', 3, 7), R('red-s', 5, 7), R('red-s', 7, 7), R('red-s', 9, 7), R('red-s', 11, 7), R('red-s', 13, 7),
  ];

  const stage41 = [
    R('violet-s', 0, 0, 1), R('violet-s', 17, 0, 1),
    R('red-s', 3, 2, 1), R('metal', 4, 2, 1), R('metal', 5, 2), R('metal', 7, 2), R('metal', 9, 2), R('metal', 11, 2), R('metal', 13, 2, 1), R('red-s', 14, 2, 1),
    L('purple-s', [[3, 3], [3, 4], [4, 4]]), L('purple-s', [[14, 3], [13, 4], [14, 4]]),
    R('yellow-s', 5, 4, 1), R('green-s', 6, 4, 1), R('red-s', 7, 4, 1), R('purple-s', 8, 4, 1), R('yellow-s', 9, 4, 1), R('green-s', 10, 4, 1), R('violet-s', 11, 4, 1), R('red-s', 12, 4, 1),
    L('metal', [[3, 5], [3, 6], [4, 6]]), R('purple-s', 4, 5), R('metal', 6, 5), R('red-s', 8, 5), R('metal', 10, 5), R('green-s', 12, 5), L('metal', [[14, 5], [13, 6], [14, 6]]),
    R('metal', 5, 6), R('metal', 7, 6), R('metal', 9, 6), R('metal', 11, 6),
  ];

  const stage42 = [
    R('red', 7, 1), R('red', 9, 1),
    R('red', 0, 2), L('red', [[2, 2], [2, 3], [3, 3]]), L('red', [[6, 2], [7, 2], [6, 3]]), R('yellow-s', 8, 2), L('red', [[11, 2], [10, 2], [11, 3]]), L('red', [[15, 2], [15, 3], [14, 3]]), R('red', 16, 2),
    R('red', 4, 3), R('red', 12, 3),
    R('metal', 3, 4, 1), V('red', 4, 4), V('metal', 5, 4), R('yellow-s', 8, 4), V('metal', 12, 4), V('red', 13, 4), R('metal', 14, 4, 1),
    R('red', 2, 5), L('metal', [[7, 5], [8, 5], [7, 6]]), L('metal', [[10, 5], [9, 5], [10, 6]]), R('red', 14, 5),
    R('metal', 3, 6), V('red', 5, 6), V('red', 12, 6), R('metal', 13, 6),
    R('red', 2, 7), R('red', 4, 7, 1), R('purple-s', 8, 7), R('red', 13, 7, 1), R('red', 14, 7),
    R('metal', 3, 8, 1), V('red', 4, 8), R('metal', 5, 8, 1), L('blue', [[7, 9], [8, 9], [8, 8]]), L('blue', [[10, 9], [9, 9], [9, 8]]), R('metal', 12, 8, 1), V('red', 13, 8), R('metal', 14, 8, 1),
    L('red', [[2, 9], [3, 9], [2, 10]]), R('blue', 5, 9), R('blue', 11, 9), L('red', [[15, 9], [14, 9], [15, 10]]),
    R('red', 0, 10), R('red', 16, 10),
  ];

  const stage43 = [
    R('yellow', 3, 0), R('purple', 6, 0), R('purple', 10, 0), R('yellow', 13, 0),
    R('yellow', 2, 1), R('purple', 5, 1), R('purple', 11, 1), R('yellow', 14, 1),
    R('yellow', 1, 2), R('purple', 4, 2), R('green', 8, 2), R('purple', 12, 2), R('yellow', 15, 2),
    R('yellow', 0, 3), R('purple', 3, 3), mv(R('green', 5.5, 3), 1, 110), mv(R('green', 10.3, 3), -1, 110), R('purple', 13, 3), R('yellow', 16, 3),
    R('purple', 2, 4), mv(R('green', 5.4, 4), -1, 110), mv(R('green', 10.45, 4), 1, 110), R('purple', 14, 4),
    R('purple', 1, 5), mv(R('green', 6.45, 5), 1, 110), mv(R('green', 9.4, 5), -1, 110), R('purple', 15, 5),
    R('purple', 0, 6), mv(R('green', 6.45, 6), -1, 110), mv(R('green', 9.4, 6), 1, 110), R('purple', 16, 6),
    mv(R('green', 5.35, 7), -1, 110), mv(R('green', 10.45, 7), 1, 110),
    R('green', 1, 8), R('green', 15, 8),
    R('green', 0, 9), R('green', 16, 9),
  ];

  const stage44 = [
    R('purple', 0, 0), R('purple', 2, 0), R('purple', 4, 0), R('purple', 6, 0), R('purple', 8, 0), R('purple', 10, 0), R('purple', 12, 0, 1), R('purple', 13, 0, 1), R('purple', 14, 0), R('purple', 16, 0),
    R('purple-s', 1, 1), R('purple-s', 3, 1), R('purple-s', 5, 1), R('purple-s', 7, 1), R('purple-s', 9, 1), R('purple-s', 11, 1), R('purple-s', 13, 1), R('purple-s', 15, 1),
    R('metal', 1, 3), R('purple-s', 4, 3), R('metal', 6, 3), R('purple-s', 8, 3), R('metal', 10, 3), R('purple-s', 12, 3), R('metal', 14.6, 3),
    R('red', 1, 4), R('red', 3, 4), R('red', 5, 4), R('red', 7, 4), R('red', 9, 4), R('red', 11, 4), R('red', 13, 4), R('red', 15, 4),
    R('purple', 0.15, 5), R('green-s', 3, 5), R('purple', 5, 5), R('green-s', 7, 5), R('purple', 9, 5), R('green-s', 11, 5, 1), R('purple', 12, 5), R('green-s', 14, 5, 1), R('purple', 15.8, 5),
    R('red-s', 1, 6), L('red-s', [[3, 6], [3, 7], [4, 7]]), L('red-s', [[4, 6], [5, 6], [5, 7]]), L('red-s', [[6, 6], [6, 7], [7, 7]]), L('red-s', [[7, 6], [8, 6], [8, 7]]), L('red-s', [[9, 6], [9, 7], [10, 7]]), L('red-s', [[10, 6], [11, 6], [11, 7]]), V('red-s', 12, 6), L('red-s', [[13, 6], [14, 6], [14, 7]]), L('red-s', [[15, 6], [16, 6], [16, 7]]),
    R('violet-s', 1, 7), R('violet-s', 13, 7, 1), R('violet-s', 15, 7, 1),
  ];

  const stage45 = [
    R('red-s', 6, 1), R('red-s', 8, 1), R('green-s', 10, 1, 1), R('violet-s', 11, 1, 1),
    R('purple-s', 5, 2), R('purple-s', 7, 2), R('purple-s', 9, 2), R('violet-s', 11, 2, 1), R('violet-s', 12, 2, 1),
    R('violet-s', 3, 3, 1), R('green-s', 4, 3), L('green-s', [[6, 3], [6, 4], [7, 4]]), L('green-s', [[7, 3], [8, 3], [8, 4]]), L('green-s', [[9, 3], [9, 4], [10, 4]]), L('green-s', [[10, 3], [11, 3], [11, 4]]), L('violet-s', [[12, 3], [12, 4], [13, 4]]), L('violet-s', [[13, 3], [14, 3], [14, 4]]),
    R('violet-s', 3, 4), R('violet-s', 5, 4, 1),
    R('red', 2, 5, 1), mv(R('metal', 3.3, 5), 1, 37), mv(R('metal', 6.3, 5), 1, 37), mv(R('metal', 8.6, 5), 1, 37), mv(R('metal', 12.45, 5), 1, 37),
    R('red', 1, 6), R('red', 3, 6), R('red', 5, 6), R('red', 7, 6), R('red', 9, 6), R('red', 11, 6), R('red', 13, 6, 1), R('red', 14, 6), R('violet-s', 16, 6, 1),
    mv(R('red', 5.45, 7), -1, 69), mv(R('red', 8.35, 7), -1, 69), mv(R('red', 10.4, 7), -1, 69), mv(R('red', 13.3, 7), -1, 69), mv(R('red', 15.35, 7), -1, 69),
    R('red', 1, 8), R('red', 3, 8), R('red', 5, 8, 1), R('red', 6, 8), R('red', 8, 8, 1), R('red', 9, 8), R('red', 11, 8), mv(R('red', 13.2, 8), 1, 15), mv(R('red', 15.3, 8), 1, 15),
    R('blue', 2, 9), R('blue', 4, 9), R('blue', 6, 9), R('blue', 8, 9), R('blue', 10, 9), R('blue', 12, 9), R('blue', 14, 9),
  ];

  const stage46 = [
    R('blue', 5, 1), R('blue', 7, 1, 1), R('blue', 10, 1, 1), R('blue', 11, 1),
    R('red', 0, 2, 1), R('red', 1, 2), R('red-s', 3, 2), V('blue', 5, 2), V('blue', 6, 2), R('blue', 7, 2, 1), R('blue', 8, 2), R('blue', 10, 2, 1), V('blue', 11, 2), V('blue', 12, 2), R('red-s', 13, 2), R('red', 15, 2), R('red', 17, 2, 1),
    R('metal', 3, 3), R('blue', 8, 3), R('metal', 13, 3),
    R('red', 1, 4), R('red-s', 3, 4), V('blue', 5, 4), V('blue', 6, 4), R('yellow', 9, 4), V('blue', 11, 4), V('blue', 12, 4), R('red-s', 13, 4), R('red', 15, 4),
    R('metal', 3, 5), R('yellow', 7, 5), R('metal', 13, 5),
    R('red', 1, 6), R('red-s', 3, 6), V('blue', 5, 6), V('blue', 6, 6), R('yellow', 9, 6), V('blue', 11, 6), V('blue', 12, 6), R('red-s', 13, 6), R('red', 15, 6),
    R('metal', 3, 7), R('yellow', 7, 7), R('metal', 13, 7),
    R('red', 0, 8, 1), R('red', 1, 8), R('red-s', 3, 8), R('blue', 5, 8, 1), R('blue', 6, 8), R('blue', 8, 8), R('blue', 10, 8), R('blue', 12, 8, 1), R('red-s', 13, 8), R('red', 15, 8), R('red', 17, 8, 1),
    R('metal', 3, 9), R('blue', 5, 9, 1), R('blue', 6, 9), R('blue', 8, 9), R('blue', 10, 9), R('blue', 12, 9, 1), R('metal', 13, 9),
  ];

  const stage47 = [
    R('blue', 0, 0), R('blue', 2, 0), R('blue', 4, 0), R('blue', 6, 0), R('blue', 8, 0), R('blue', 10, 0), R('blue', 12, 0), R('blue', 14, 0), R('blue', 16, 0),
    R('purple-s', 0, 1), R('purple-s', 2, 1), R('purple-s', 4, 1), R('purple-s', 6, 1), R('purple-s', 8, 1), R('purple-s', 10, 1), R('purple-s', 12, 1), R('purple-s', 14, 1), R('purple-s', 16, 1),
    R('yellow-s', 3, 2), R('yellow-s', 5, 2), mv(R('yellow', 8.35, 2), 1, 33), mv(R('yellow', 11.4, 2), -1, 33), R('yellow', 15, 2, 1), R('yellow', 16, 2),
    R('yellow', 3, 3), R('metal', 5, 3), R('yellow', 9, 3), L('metal', [[11, 3], [12, 3], [11, 4]]),
    R('blue', 3, 4), R('blue', 5, 4), R('red', 9, 4), R('red', 12, 4, 1), R('yellow', 13, 4),
    R('purple', 3, 5), R('purple', 5, 5), R('red', 9, 5), R('red', 11, 5), mv(R('metal', 14.15, 5), 1, 30),
    R('red-s', 3, 6), R('red-s', 5, 6), R('red-s', 9, 6), R('red-s', 11, 6),
    R('purple-s', 3, 7), R('purple-s', 5, 7), R('red-s', 9, 7), R('red-s', 11, 7),
    R('yellow', 3, 8), R('yellow', 5, 8), R('yellow', 9, 8), R('yellow', 11, 8), R('yellow', 15, 8, 1),
    R('yellow', 9, 9), R('yellow', 11, 9), R('yellow', 15, 9),
    R('yellow', 16, 10, 1),
  ];

  const stage48 = [
    R('green-s', 4, 1), L('red', [[6, 1], [7, 1], [7, 2]]), R('red', 8, 1), L('red', [[10, 1], [11, 1], [10, 2]]), R('green-s', 12, 1),
    R('green-s', 4, 2, 1), R('blue', 5, 2), R('red', 8, 2), R('blue', 11, 2), R('green-s', 13, 2, 1),
    R('metal', 1.65, 3), V('metal', 4, 3), R('red', 5, 3), R('metal', 7, 3), R('metal', 9, 3), R('red', 11, 3), V('metal', 13, 3), R('metal', 14.7, 3),
    R('red-s', 5, 4, 1), R('red-s', 6, 4), R('purple-s', 8, 4), R('red-s', 10, 4), R('red-s', 12, 4, 1),
    R('red', 0, 5), R('red', 2, 5, 1), L('metal', [[3, 5], [4, 5], [3, 6]]), R('blue', 5, 5), R('blue', 7, 5), R('blue', 9, 5), R('blue', 11, 5), L('metal', [[13, 5], [14, 5], [14, 6]]), R('red', 15, 5, 1), R('red', 16, 5),
    R('green', 0, 6), V('green', 2, 6), L('blue', [[4, 6], [5, 6], [4, 7]]), R('purple', 6, 6), R('purple', 8, 6), R('purple', 10, 6), L('blue', [[12, 6], [13, 6], [13, 7]]), V('green', 15, 6), R('green', 16, 6),
    R('green', 0, 7), L('metal', [[3, 7], [3, 8], [4, 8]]), R('purple-s', 5, 7), R('red', 7, 7), R('red', 9, 7), R('purple-s', 11, 7), L('metal', [[14, 7], [14, 8], [13, 8]]), R('green', 16, 7, 1), R('green', 17, 7, 1),
    R('green-s', 0, 8), R('blue', 2, 8, 1), R('metal', 5, 8), R('red', 7, 8, 1), R('red', 8, 8, 1), R('metal', 9, 8), R('metal', 11, 8), R('blue', 15, 8, 1), R('green-s', 16, 8),
  ];

  const stage49 = [
    V('red', 1, 0), V('purple-s', 3, 0), V('yellow-s', 5, 0), mv(V('purple', 6.68, 0), 1, 20), mv(V('purple', 10.25, 0), -1, 20), V('yellow-s', 12, 0), V('purple-s', 14, 0), V('red', 16, 0),
    V('red', 1, 2), V('purple-s', 3, 2), V('yellow-s', 5, 2), mv(V('purple', 7.4, 2), 1, 20), mv(V('purple', 9.5, 2), -1, 20), V('yellow-s', 12, 2), V('purple-s', 14, 2), V('red', 16, 2),
    V('red', 1, 4), V('purple-s', 3, 4), V('yellow-s', 5, 4), mv(V('purple', 6.42, 4), 1, 20), mv(V('purple', 10.5, 4), -1, 20), V('yellow-s', 12, 4), V('purple-s', 14, 4), V('red', 16, 4),
    V('red', 1, 6), V('purple-s', 3, 6), V('yellow-s', 5, 6), mv(V('purple', 7.67, 6), 1, 20), mv(V('purple', 9.27, 6), -1, 20), V('yellow-s', 12, 6), V('purple-s', 14, 6), V('red', 16, 6),
    V('red', 1, 8), V('purple-s', 3, 8), V('yellow-s', 5, 8), mv(V('purple', 6.17, 8), 1, 20), mv(V('purple', 10.74, 8), -1, 20), V('yellow-s', 12, 8), V('purple-s', 14, 8), V('red', 16, 8),
  ];

  const stage50 = [
    R('red-s', 2, 1), R('red-s', 4, 1), R('red-s', 7, 1), R('red-s', 9, 1, 1), R('red-s', 10, 1, 1), R('red-s', 12, 1), R('red-s', 14, 1, 1), R('red-s', 15, 1, 1),
    R('yellow-s', 2, 2), R('yellow-s', 4, 2), R('yellow-s', 7, 2), R('yellow-s', 9, 2), R('yellow-s', 12, 2), R('yellow-s', 14, 2),
    mv(R('metal', 0.62, 3), 1, 36), mv(R('metal', 3.02, 3), -1, 36), R('yellow', 7, 3), mv(R('metal', 9.42, 3), -1, 36), R('yellow', 12, 3), mv(R('metal', 14.48, 3), 1, 36),
    R('blue', 2, 4), R('blue', 4, 4), R('blue', 7, 4), R('blue', 9, 4), R('blue', 12, 4), R('blue', 14, 4),
    R('red-s', 2, 5), R('red-s', 4, 5), R('red-s', 6, 5), R('red-s', 8, 5), R('red-s', 10, 5), R('red-s', 12, 5), R('red-s', 14, 5),
    V('green-s', 1, 6), L('green-s', [[2, 6], [2, 7], [3, 7]]), L('green-s', [[3, 6], [4, 6], [4, 7]]), L('green-s', [[5, 6], [5, 7], [6, 7]]), L('green-s', [[6, 6], [7, 6], [7, 7]]), L('green-s', [[8, 6], [8, 7], [9, 7]]), L('green-s', [[9, 6], [10, 6], [10, 7]]), L('green-s', [[11, 6], [11, 7], [12, 7]]), L('green-s', [[12, 6], [13, 6], [13, 7]]), L('green-s', [[14, 6], [14, 7], [15, 7]]), L('green-s', [[15, 6], [16, 6], [16, 7]]),
    R('metal', 0, 8, 1), R('red', 1, 8), R('blue', 3, 8), R('red', 5, 8), R('blue', 7, 8), R('red', 9, 8), R('blue', 11, 8), R('red', 13, 8), R('blue', 15, 8, 1), R('red', 16, 8),
  ];

  const stage51 = [
    R('violet-s', 0, 0), R('violet-s', 2, 0), R('violet-s', 4, 0), R('violet-s', 6, 0), R('violet-s', 8, 0), R('violet-s', 10, 0), R('violet-s', 12, 0), R('violet-s', 14, 0), R('violet-s', 16, 0),
    R('red-s', 2, 2), R('red-s', 4, 2), R('red-s', 6, 2), R('red-s', 8, 2), R('red-s', 10, 2), R('red-s', 12, 2), R('red-s', 14, 2), R('red-s', 16, 2),
    R('purple-s', 0, 4), R('purple-s', 2, 4), R('purple-s', 4, 4), R('purple-s', 6, 4), R('purple-s', 8, 4), R('purple-s', 10, 4), R('purple-s', 12, 4), R('purple-s', 14, 4),
    R('yellow-s', 2, 6), R('yellow-s', 4, 6), R('yellow-s', 6, 6), R('yellow-s', 8, 6), R('yellow-s', 10, 6), R('yellow-s', 12, 6), R('yellow-s', 14, 6), R('yellow-s', 16, 6),
    R('metal', 0, 8), R('metal', 2, 8), R('metal', 4, 8), R('metal', 6, 8), R('metal', 8, 8), R('metal', 10, 8), R('metal', 12, 8), R('metal', 14, 8),
  ];

  const stage52 = [
    R('red-s', 6, 0), R('red-s', 8, 0), R('red-s', 10, 0),
    R('red-s', 3, 1), R('red-s', 5, 1), R('red-s', 7, 1), R('red-s', 9, 1), R('red-s', 11, 1), R('red-s', 13, 1),
    R('red-s', 0, 2), R('red-s', 2, 2), R('red-s', 4, 2), R('red-s', 6, 2), R('red-s', 8, 2), R('red-s', 10, 2), R('red-s', 12, 2), R('red-s', 14, 2), R('red-s', 16, 2),
    R('yellow-s', 0, 3), R('yellow-s', 2, 3, 1), R('metal', 3, 3), R('metal', 5, 3, 1), R('red', 6, 3), R('red', 8, 3), R('red', 10, 3, 1), R('metal', 11, 3), R('metal', 13, 3, 1), R('yellow-s', 14, 3), R('yellow-s', 16, 3),
    R('purple-s', 3, 4), R('purple-s', 5, 4, 1), R('metal', 6, 4), R('metal', 8, 4), R('metal', 10, 4, 1), R('yellow-s', 11, 4), R('yellow-s', 13, 4, 1),
    R('purple-s', 3, 5, 1), R('purple-s', 4, 5), R('red-s', 6, 5), R('red-s', 10, 5, 1), R('yellow-s', 11, 5, 1), R('yellow-s', 12, 5),
    R('metal', 3, 6), R('metal', 5, 6, 1), R('red-s', 6, 6), R('metal', 8, 6, 1), V('red-s', 10, 6), R('metal', 11, 6), R('metal', 13, 6, 1),
    R('red', 3, 7), R('red', 5, 7, 1), R('red-s', 6, 7), R('red', 11, 7), R('red', 13, 7, 1),
    V('red', 3, 8), V('red', 4, 8), V('red', 5, 8), R('red-s', 6, 8), V('red-s', 10, 8), R('red', 11, 8, 1), R('red', 12, 8),
    R('red', 2, 9, 1), R('red-s', 6, 9), R('red', 11, 9, 1), R('red', 12, 9), R('red', 14, 9, 1),
  ];

  const stage53 = [
    R('purple-s', 1, 0), R('purple-s', 5, 0), R('purple-s', 11, 0), R('purple-s', 15, 0),
    R('metal', 1, 1), R('metal', 5, 1), R('metal', 11, 1), R('metal', 15, 1),
    R('red', 0, 2), R('red', 2, 2), R('red', 4, 2), R('red', 6, 2), R('red', 8, 2), R('red', 10, 2), R('red', 12, 2), R('red', 14, 2), R('red', 16, 2),
    mv(R('green', 1.87, 3), -1, 65), R('purple-s', 4, 3), R('purple-s', 7, 3), R('purple-s', 10, 3), R('purple-s', 13, 3), mv(R('green', 15.25, 3), 1, 65),
    mv(R('green', 3.3, 4), -1, 65), mv(R('green', 5.7, 4), -1, 65), mv(R('green', 8.1, 4), -1, 65), mv(R('green', 10.74, 4), -1, 65), mv(R('green', 12.91, 4), -1, 65), mv(R('green', 15.8, 4), -1, 65),
    R('purple-s', 1, 5), R('purple-s', 4, 5), R('purple-s', 7, 5), R('purple-s', 10, 5), R('purple-s', 13, 5), R('purple-s', 15.8, 5),
    mv(R('green', 3.17, 6), -1, 65), mv(R('green', 5.82, 6), -1, 65), mv(R('green', 7.97, 6), -1, 65), mv(R('green', 10.87, 6), -1, 65), mv(R('green', 12.83, 6), -1, 65), mv(R('green', 15.74, 6), -1, 65),
    R('metal', 0, 7), R('metal', 4, 7), R('metal', 6, 7), R('metal', 8, 7), R('metal', 10, 7), R('metal', 12, 7), R('metal', 15.8, 7),
  ];

  const stage54 = [
    R('red-s', 0, 0, 1), R('metal', 8, 0, 1), R('metal', 9, 0, 1), R('red-s', 17, 0, 1),
    R('metal', 6, 1, 1), R('metal', 7, 1, 1), R('red-s', 8, 1, 1), R('red-s', 9, 1, 1), R('metal', 10, 1, 1), R('metal', 11, 1, 1),
    R('metal', 4, 2, 1), R('metal', 5, 2, 1), R('red-s', 6, 2, 1), R('purple-s', 7, 2), R('purple-s', 9, 2), R('red-s', 11, 2, 1), R('metal', 12, 2, 1), R('metal', 13, 2, 1),
    R('metal', 3, 3, 1), R('red-s', 4, 3, 1), L('purple-s', [[5, 3], [6, 3], [6, 4]]), R('violet-s', 7, 3, 1), R('green-s', 8, 3), R('violet-s', 10, 3, 1), L('purple-s', [[11, 3], [12, 3], [11, 4]]), R('red-s', 13, 3, 1), R('metal', 14, 3, 1),
    R('metal', 2, 4, 1), R('red-s', 3, 4, 1), R('yellow-s', 4, 4), R('violet-s', 7, 4, 1), R('green-s', 8, 4), R('violet-s', 10, 4, 1), R('yellow-s', 12, 4), R('red-s', 14, 4, 1), R('metal', 15, 4, 1),
    R('metal', 2, 5, 1), R('red-s', 3, 5, 1), R('yellow-s', 4, 5), R('purple-s', 8, 5), R('yellow-s', 12, 5), R('red-s', 14, 5, 1), R('metal', 15, 5, 1),
    R('metal', 3, 6, 1), R('purple-s', 4, 6), R('violet-s', 6, 6), R('metal', 8, 6, 1), R('metal', 9, 6, 1), R('violet-s', 10, 6), R('purple-s', 12, 6), R('metal', 14, 6, 1),
    R('metal', 4, 7, 1), R('metal', 5, 7, 1), R('metal', 8, 7, 1), R('metal', 9, 7, 1), R('metal', 12, 7, 1), R('metal', 13, 7, 1),
  ];

  const stage55 = [
    R('purple', 6, 0), R('purple', 8, 0), R('purple', 10, 0),
    R('purple', 4, 1), R('purple', 12, 1),
    R('purple', 3, 2), V('metal', 7, 2), V('metal', 10, 2), R('purple', 13, 2),
    R('purple', 2, 3), R('purple', 14, 3),
    R('purple', 2, 4), R('purple-s', 5, 4, 1), R('purple-s', 12, 4, 1), R('purple', 14, 4),
    R('purple', 2, 5), R('purple-s', 6, 5, 1), R('purple-s', 11, 5, 1), R('purple', 14, 5),
    R('purple', 3, 6), R('purple-s', 7, 6, 1), R('purple-s', 8, 6), R('purple-s', 10, 6, 1), R('purple', 13, 6),
    R('purple', 4, 7), R('purple', 12, 7),
    R('purple', 6, 8), R('purple', 8, 8), R('purple', 10, 8),
  ];

  const stage56 = [
    V('blue', 0, 1), V('blue', 1, 1), V('blue', 2, 1), V('blue', 3, 1), V('blue', 4, 1), V('blue', 5, 1), V('blue', 6, 1), V('blue', 7, 1), V('blue', 10, 1), V('blue', 11, 1), V('blue', 12, 1), V('blue', 13, 1), V('blue', 14, 1), V('blue', 15, 1), V('blue', 16, 1), V('blue', 17, 1),
    R('metal', 8, 2),
    R('metal', 8, 3),
    mv(R('metal', 4, 4), -1, 80), mv(R('metal', 12, 4), 1, 80),
    mv(R('metal', 6, 5), -1, 80), mv(R('metal', 10, 5), 1, 80),
    mv(R('metal', 6, 6), -1, 80), mv(R('metal', 10, 6), 1, 80),
    mv(R('metal', 4, 7), 1, 80), mv(R('metal', 12, 7), -1, 80),
  ];

  const stage57 = [
    L('blue', [[1, 1], [2, 1], [1, 2]]), R('green', 3, 1), R('red', 5, 1, 1), R('purple', 6, 1), R('red', 8, 1, 1), R('purple', 9, 1), R('red', 11, 1, 1), R('green', 12, 1), L('blue', [[15, 1], [14, 1], [15, 2]]),
    L('metal', [[2, 2], [3, 2], [2, 3]]), R('metal', 4, 2), R('metal', 6, 2), R('metal', 8, 2, 1), R('metal', 9, 2), R('metal', 11, 2), L('metal', [[14, 2], [13, 2], [14, 3]]),
    V('green', 1, 3), L('green', [[3, 3], [4, 3], [3, 4]]), R('red', 5, 3), R('yellow', 8, 3, 1), R('red', 10, 3), L('green', [[13, 3], [12, 3], [13, 4]]), V('green', 15, 3),
    V('metal', 2, 4), L('purple', [[4, 4], [5, 4], [4, 5]]), R('yellow', 6, 4), R('green', 8, 4, 1), R('yellow', 9, 4), L('purple', [[12, 4], [11, 4], [12, 5]]), V('metal', 14, 4),
    V('red', 1, 5), V('red', 3, 5), L('red', [[5, 5], [6, 5], [5, 6]]), R('blue', 7, 5, 1), R('blue', 8, 5, 1), R('blue', 9, 5, 1), L('red', [[11, 5], [10, 5], [11, 6]]), V('red', 13, 5), V('red', 15, 5),
    V('metal', 2, 6), V('blue', 4, 6), V('blue', 6, 6), V('blue', 10, 6), V('blue', 12, 6), V('metal', 14, 6),
    L('purple', [[1, 7], [1, 8], [2, 8]]), L('green', [[3, 7], [3, 8], [4, 8]]), L('yellow', [[5, 7], [5, 8], [6, 8]]), L('yellow', [[11, 7], [11, 8], [10, 8]]), L('green', [[13, 7], [13, 8], [12, 8]]), L('purple', [[15, 7], [15, 8], [14, 8]]),
  ];

  const stage58 = [
    R('blue', 0, 0, 1), R('blue', 17, 0, 1),
    R('blue', 1, 1, 1), R('blue', 16, 1, 1),
    R('blue', 2, 2, 1), V('metal', 5, 2), L('purple-s', [[7, 2], [8, 2], [8, 3]]), L('purple-s', [[10, 2], [9, 2], [9, 3]]), V('metal', 12, 2), R('blue', 15, 2, 1),
    R('blue', 3, 3, 1), L('metal', [[6, 3], [7, 3], [6, 4]]), L('metal', [[11, 3], [10, 3], [11, 4]]), R('blue', 14, 3, 1),
    V('metal', 2, 4), L('purple-s', [[3, 4], [4, 4], [3, 5]]), R('metal', 7, 4), R('metal', 9, 4), L('purple-s', [[14, 4], [13, 4], [14, 5]]), V('metal', 15, 4),
    L('red-s', [[4, 5], [5, 5], [5, 6]]), L('purple-s', [[6, 5], [7, 5], [6, 6]]), R('purple-s', 8, 5), L('purple-s', [[11, 5], [10, 5], [11, 6]]), L('red-s', [[13, 5], [12, 5], [12, 6]]),
    L('metal', [[2, 6], [2, 7], [3, 7]]), L('red', [[3, 6], [4, 6], [4, 7]]), L('red-s', [[7, 6], [8, 6], [7, 7]]), L('red-s', [[10, 6], [9, 6], [10, 7]]), L('red', [[14, 6], [13, 6], [13, 7]]), L('metal', [[15, 6], [15, 7], [14, 7]]),
    R('metal', 5, 7), R('metal', 8, 7), R('metal', 11, 7),
  ];

  const stage59 = [
    L('red', [[0, 0], [1, 0], [0, 1]]), R('yellow', 2, 0), R('yellow', 4, 0), R('yellow', 6, 0), R('yellow', 8, 0), R('yellow', 10, 0), R('yellow', 12, 0), R('yellow', 14, 0), L('red', [[16, 0], [17, 0], [17, 1]]),
    V('yellow', 0, 2), L('green-s', [[2, 2], [3, 2], [2, 3]]), L('green-s', [[4, 2], [5, 2], [5, 3]]), R('violet-s', 8, 2), L('green-s', [[12, 2], [13, 2], [12, 3]]), L('green-s', [[14, 2], [15, 2], [15, 3]]), V('yellow', 17, 2),
    L('red-s', [[7, 3], [8, 3], [7, 4]]), L('red-s', [[9, 3], [10, 3], [10, 4]]),
    V('yellow', 0, 4), V('purple', 2, 4), V('purple', 5, 4), R('metal', 8, 4), V('purple', 12, 4), V('purple', 15, 4), V('yellow', 17, 4),
    L('red-s', [[7, 5], [7, 6], [8, 6]]), R('metal', 8, 5), L('red-s', [[10, 5], [10, 6], [9, 6]]),
    V('yellow', 0, 6), mv(L('metal', [[1.7, 6], [1.7, 7], [2.7, 7]]), 1, 15, 0.3), mv(L('metal', [[5.4, 6], [4.4, 7], [5.4, 7]]), -1, 15, 0.3), mv(L('metal', [[11.56, 6], [11.56, 7], [12.56, 7]]), 1, 15, 0.3), mv(L('metal', [[15.25, 6], [14.25, 7], [15.25, 7]]), -1, 15, 0.3), V('yellow', 17, 6),
    R('violet-s', 8, 7),
    L('red', [[0, 8], [0, 9], [1, 9]]), L('red', [[17, 8], [17, 9], [16, 9]]),
    R('yellow', 2, 9), R('purple-s', 4, 9), R('yellow', 6, 9), R('purple-s', 8, 9), R('yellow', 10, 9), R('purple-s', 12, 9), R('yellow', 14, 9),
  ];

  const stage60 = [
    mv(R('metal', 0.65, 0), -1, 44), R('green', 3, 0), R('purple-s', 5, 0), R('green', 7, 0), R('green', 9, 0), R('purple-s', 11, 0), R('green', 13, 0), mv(R('metal', 14.8, 0), 1, 44),
    mv(R('metal', 1.7, 1), 1, 44), R('green', 4, 1), R('green', 6, 1), R('metal', 8, 1), R('green', 10, 1), R('green', 12, 1), mv(R('metal', 13.9, 1), -1, 44),
    mv(R('metal', 1, 2), -1, 44), R('green', 3, 2), R('purple-s', 5, 2), R('green', 7, 2), R('green', 9, 2), R('purple-s', 11, 2), R('green', 13, 2), mv(R('metal', 14.8, 2), 1, 44),
    mv(R('metal', 1.57, 3), 1, 44), R('green', 4, 3), R('green', 6, 3), R('metal', 8, 3), R('green', 10, 3), R('green', 12, 3), mv(R('metal', 14.02, 3), -1, 44),
    mv(R('metal', 1.02, 4), -1, 44), R('green', 3, 4), R('purple-s', 5, 4), R('green', 7, 4), R('green', 9, 4), R('purple-s', 11, 4), R('green', 13, 4), mv(R('metal', 14.8, 4), 1, 44),
    mv(R('metal', 1.45, 5), 1, 44), R('green', 4, 5), R('green', 6, 5), R('metal', 8, 5), R('green', 10, 5), R('green', 12, 5), mv(R('metal', 14.14, 5), -1, 44),
    mv(R('metal', 1, 6), -1, 44), R('green', 3, 6), R('purple-s', 5, 6), R('green', 7, 6), R('green', 9, 6), R('purple-s', 11, 6), R('green', 13, 6), mv(R('metal', 14.8, 6), 1, 44),
    R('metal', 0, 7), R('green', 2, 7), R('green', 4, 7), R('green', 6, 7), R('metal', 8, 7), R('green', 10, 7), R('green', 12, 7), R('green', 14, 7), R('metal', 16, 7),
  ];

  const stage61 = [
    R('metal', 0, 0, 1), R('metal', 2, 0, 1), R('blue', 3, 0, 1), R('metal', 4, 0, 1), R('metal', 5, 0), R('blue', 7, 0, 1), R('metal', 8, 0, 1), R('metal', 10, 0, 1),
    R('metal', 0, 1, 1), R('metal', 2, 1, 1), R('blue', 3, 1, 1), R('metal', 4, 1, 1), R('metal', 6, 1, 1), R('blue', 7, 1, 1), R('metal', 8, 1, 1), R('metal', 10, 1, 1), R('blue', 11, 1, 1), R('blue', 12, 1, 1), R('blue', 13, 1, 1), R('blue', 14, 1, 1), R('blue', 15, 1, 1), R('blue', 16, 1, 1), R('blue', 17, 1, 1),
    R('metal', 0, 2, 1), R('metal', 1, 2), R('blue', 3, 2, 1), R('metal', 4, 2, 1), R('metal', 6, 2, 1), R('blue', 7, 2, 1), R('metal', 8, 2, 1), R('metal', 10, 2, 1),
    R('blue', 0, 3, 1), R('metal', 1, 3, 1), R('blue', 2, 3), R('metal', 4, 3, 1), R('metal', 5, 3), R('blue', 7, 3, 1), R('metal', 8, 3, 1), R('metal', 9, 3), R('blue', 11, 3, 1), R('blue', 12, 3, 1), R('blue', 13, 3, 1), R('blue', 14, 3, 1), R('blue', 15, 3, 1), R('blue', 16, 3, 1), R('blue', 17, 3, 1),
    R('metal', 0, 6, 1), R('blue', 1, 6, 1), R('blue', 2, 6, 1), R('blue', 3, 6, 1), R('metal', 4, 6, 1), R('blue', 5, 6, 1), R('blue', 6, 6, 1), R('blue', 7, 6, 1), R('metal', 8, 6, 1), R('blue', 9, 6, 1), R('metal', 10, 6, 1), R('blue', 11, 6, 1), R('metal', 12, 6, 1), R('metal', 13, 6, 1), R('purple-s', 14, 6), R('blue', 16, 6),
    R('blue', 0, 7, 1), R('metal', 1, 7, 1), R('blue', 2, 7, 1), R('metal', 3, 7, 1), R('blue', 4, 7, 1), R('metal', 5, 7, 1), R('blue', 6, 7, 1), R('metal', 7, 7, 1), R('blue', 8, 7, 1), R('blue', 9, 7, 1), R('metal', 10, 7, 1), R('blue', 11, 7, 1), R('metal', 12, 7, 1), R('blue', 13, 7, 1), R('metal', 14, 7, 1), R('metal', 15, 7, 1), R('blue', 16, 7),
    R('blue', 0, 8, 1), R('blue', 1, 8, 1), R('metal', 2, 8, 1), R('blue', 3, 8, 1), R('blue', 4, 8, 1), R('blue', 5, 8, 1), R('metal', 6, 8, 1), R('blue', 7, 8, 1), R('blue', 8, 8, 1), R('blue', 9, 8, 1), R('metal', 10, 8, 1), R('blue', 11, 8, 1), R('metal', 12, 8, 1), R('blue', 13, 8, 1), R('blue', 14, 8, 1), R('metal', 15, 8, 1), R('green-s', 16, 8),
  ];

  const stage62 = [
    R('violet-s', 6, 0), R('yellow-s', 8, 0), R('purple-s', 10, 0),
    V('metal', 6, 1), V('metal', 10.8, 1),
    R('green-s', 4, 3), R('violet-s', 6, 3), R('red-s', 8, 3), R('purple-s', 10, 3), R('green-s', 12, 3),
    mv(V('metal', 7.7, 4), -1, 120), mv(V('metal', 9.13, 4), 1, 120),
    R('red-s', 2, 6), R('purple-s', 4, 6), R('yellow-s', 6, 6), R('green-s', 8, 6), R('violet-s', 10, 6), R('red-s', 12, 6), R('purple-s', 14, 6),
    mv(V('metal', 5.54, 7), 1, 120), mv(V('metal', 11.28, 7), -1, 120),
    R('red-s', 0, 9), R('purple-s', 2, 9), R('yellow-s', 4, 9), R('green-s', 6, 9), R('violet-s', 8, 9), R('red-s', 10, 9), R('purple-s', 12, 9), R('yellow-s', 14, 9), R('green-s', 16, 9),
  ];

  const stage63 = [
    R('yellow', 0, 0), R('yellow', 2, 0), R('yellow', 4, 0), R('yellow', 6, 0), R('yellow', 8, 0), R('yellow', 10, 0), R('yellow', 12, 0), R('yellow', 14, 0), R('yellow', 16, 0),
    R('blue', 0, 1), R('blue', 2, 1), R('blue', 4, 1), R('blue', 6, 1), R('blue', 8, 1), R('blue', 10, 1), R('blue', 12, 1), R('blue', 14, 1), R('blue', 16, 1),
    R('green', 0, 2), R('green', 2, 2, 1), R('metal', 3, 2, 1), R('metal', 4, 2, 1), R('green', 5, 2, 1), R('green', 6, 2), R('purple-s', 8, 2, 1), R('purple-s', 9, 2, 1), R('green', 10, 2), R('green', 12, 2, 1), R('metal', 13, 2, 1), R('green', 14, 2, 1), R('green', 15, 2), R('metal', 17, 2, 1),
    R('green', 0, 3), R('metal', 2, 3, 1), R('green', 3, 3), R('green', 5, 3), R('purple-s', 7, 3, 1), R('purple-s', 10, 3, 1), R('green', 11, 3), R('metal', 13, 3, 1), R('metal', 14, 3, 1), R('green', 15, 3, 1), R('metal', 16, 3, 1), R('metal', 17, 3, 1),
    R('green', 0, 4, 1), R('metal', 1, 4, 1), R('green', 2, 4), R('green', 4, 4), R('purple-s', 6, 4, 1), R('purple-s', 11, 4, 1), R('green', 12, 4, 1), R('metal', 13, 4, 1), R('green', 14, 4, 1), R('metal', 15, 4, 1), R('green', 16, 4, 1), R('metal', 17, 4, 1),
    R('green', 0, 5, 1), R('metal', 1, 5, 1), R('green', 2, 5), R('green', 4, 5), R('purple-s', 6, 5, 1), R('purple-s', 11, 5, 1), R('green', 12, 5, 1), R('metal', 13, 5, 1), R('green', 14, 5), R('green', 16, 5, 1), R('metal', 17, 5, 1),
    R('green', 0, 6), R('metal', 2, 6, 1), R('green', 3, 6), R('green', 5, 6), R('purple-s', 7, 6, 1), R('purple-s', 10, 6, 1), L('green', [[11, 6], [10, 7], [11, 7]]), R('green', 12, 6, 1), R('metal', 13, 6, 1), R('green', 14, 6), R('green', 16, 6, 1), R('metal', 17, 6, 1),
    R('metal', 0, 7, 1), R('green', 1, 7), R('metal', 3, 7, 1), R('metal', 4, 7, 1), R('green', 5, 7), R('green', 7, 7, 1), R('purple-s', 8, 7, 1), R('purple-s', 9, 7, 1), R('green', 12, 7, 1), R('metal', 13, 7, 1), R('green', 14, 7), R('green', 16, 7, 1), R('metal', 17, 7, 1),
    R('purple', 0, 8), R('purple', 2, 8), R('purple', 4, 8), R('purple', 6, 8), R('purple', 8, 8), R('purple', 10, 8), R('purple', 12, 8), R('purple', 14, 8), R('purple', 16, 8),
    R('red', 0, 9), R('red', 2, 9), R('red', 4, 9), R('red', 6, 9), R('red', 8, 9), R('red', 10, 9), R('red', 12, 9), R('red', 14, 9), R('red', 16, 9),
  ];

  const stage64 = [
    R('red-s', 4, 0, 1), R('red-s', 8, 0), R('red-s', 13, 0, 1),
    R('red-s', 5, 1, 1), R('red-s', 7, 1, 1), R('red-s', 8, 1), R('red-s', 10, 1, 1), R('red-s', 12, 1, 1),
    R('red-s', 6, 2, 1), R('yellow-s', 7, 2), R('yellow-s', 9, 2), R('red-s', 11, 2, 1),
    R('green-s', 6, 3, 1), R('green-s', 7, 3), R('green-s', 9, 3), R('green-s', 11, 3, 1),
    mv(L('metal', [[0.23, 4], [1.23, 4], [1.23, 5]]), 1, 68), R('green', 5, 4, 1), R('metal', 6, 4), R('metal', 8, 4), R('metal', 10, 4), R('green', 12, 4, 1), mv(L('metal', [[15.34, 4], [16.34, 4], [15.34, 5]]), -1, 68),
    L('green', [[5, 5], [6, 5], [6, 6]]), R('green', 7, 5, 1), R('green', 8, 5), R('green', 10, 5, 1), L('green', [[11, 5], [12, 5], [11, 6]]),
    R('yellow', 2, 6), R('yellow', 4, 6), R('green', 7, 6, 1), R('green', 8, 6), R('green', 10, 6, 1), R('green', 12, 6, 1), R('yellow', 13, 6), R('yellow', 15, 6, 1),
    R('yellow', 2, 7, 1), R('yellow', 3, 7), R('green', 5, 7, 1), R('metal', 6, 7), R('metal', 8, 7), R('metal', 10, 7), R('green', 12, 7, 1), R('yellow', 13, 7), R('yellow', 15, 7, 1),
    mv(R('metal', 0, 8), 1, 68), R('green', 5, 8, 1), R('purple', 6, 8), R('purple', 8, 8), R('purple', 10, 8), R('green', 12, 8, 1), mv(R('metal', 15.6, 8), -1, 68),
    R('yellow', 1, 9), R('purple', 7, 9), R('purple', 9, 9), R('yellow', 15, 9),
    R('yellow', 6, 10), R('yellow', 8, 10), R('yellow', 10, 10),
  ];

  const stage65 = [
    R('blue', 2, 0, 1), L('blue', [[3, 0], [3, 1], [4, 1]]), L('blue', [[5, 0], [5, 1], [6, 1]]), L('blue', [[7, 0], [7, 1], [8, 1]]), L('blue', [[10, 0], [10, 1], [9, 1]]), L('blue', [[12, 0], [12, 1], [11, 1]]), L('blue', [[14, 0], [14, 1], [13, 1]]), R('blue', 15, 0, 1),
    R('purple-s', 2, 1, 1), R('purple-s', 15, 1, 1),
    R('purple-s', 2, 2, 1), R('red', 3, 2), R('red', 5, 2, 1), R('red', 6, 2), V('red', 8, 2), V('red', 9, 2), R('red', 10, 2), R('red', 12, 2, 1), R('red', 13, 2), R('purple-s', 15, 2, 1),
    R('metal', 2, 3, 1), R('red-s', 3, 3, 1), R('red-s', 4, 3), R('metal', 6, 3), R('metal', 10, 3), R('red-s', 12, 3), R('red-s', 14, 3, 1), R('metal', 15, 3, 1),
    R('metal', 2, 4, 1), V('yellow', 3, 4), R('green', 4, 4, 1), R('metal', 5, 4), R('blue', 7, 4), R('blue', 9, 4), R('metal', 11, 4), R('green', 13, 4, 1), V('yellow', 14, 4), R('metal', 15, 4, 1),
    R('metal', 2, 5, 1), R('green', 4, 5), L('green', [[6, 5], [5, 6], [6, 6]]), L('purple-s', [[7, 5], [7, 6], [8, 6]]), R('purple-s', 8, 5), L('purple-s', [[10, 5], [10, 6], [9, 6]]), L('green', [[11, 5], [12, 6], [11, 6]]), R('green', 12, 5), R('metal', 15, 5, 1),
    R('metal', 2, 6, 1), R('yellow', 3, 6), R('yellow', 13, 6), R('metal', 15, 6, 1),
    R('metal', 2, 7), R('metal', 4, 7), R('metal', 6, 7), R('metal', 8, 7), R('metal', 10, 7), R('metal', 12, 7), R('metal', 14, 7),
    R('red', 0, 8), R('red', 2, 8, 1), R('red', 3, 8), R('metal', 5, 8), R('red', 7, 8), R('red', 9, 8), R('metal', 11, 8), R('red', 13, 8), R('red', 15, 8, 1), R('red', 16, 8),
  ];

  const stage66 = [
    V('red-s', 1, 0), V('purple-s', 3, 0), V('yellow-s', 5, 0), V('green-s', 7, 0), V('violet-s', 9, 0), V('metal', 11, 0), V('red-s', 13, 0), V('purple-s', 15, 0),
    V('red-s', 1, 2), V('purple-s', 3, 2), V('yellow-s', 5, 2), V('green-s', 7, 2), V('violet-s', 9, 2), V('metal', 11, 2), V('red-s', 13, 2), V('purple-s', 15, 2),
    V('red-s', 1, 4), V('purple-s', 3, 4), V('yellow-s', 5, 4), V('green-s', 7, 4), V('violet-s', 9, 4), V('metal', 11, 4), V('red-s', 13, 4), V('purple-s', 15, 4),
    V('red-s', 1, 6), V('purple-s', 3, 6), V('yellow-s', 5, 6), V('green-s', 7, 6), V('violet-s', 9, 6), V('metal', 11, 6), V('red-s', 13, 6), V('purple-s', 15, 6),
  ];

  const stage67 = [
    R('red-s', 0, 1), R('blue', 2, 1, 1), R('blue', 15, 1, 1), R('red-s', 16, 1),
    R('red-s', 2, 2), R('blue', 4, 2, 1), V('green', 5, 2), R('green', 6, 2), R('green', 10, 2), V('green', 12, 2), R('blue', 13, 2, 1), R('red-s', 14, 2),
    R('blue', 3, 3, 1), R('red-s', 4, 3, 1), L('blue', [[6, 3], [7, 3], [6, 4]]), R('yellow-s', 8, 3), L('blue', [[11, 3], [10, 3], [11, 4]]), R('red-s', 13, 3, 1), R('blue', 14, 3, 1),
    L('yellow', [[1, 4], [2, 4], [2, 5]]), R('green-s', 8, 4, 1), R('green-s', 9, 4, 1), L('yellow', [[16, 4], [15, 4], [15, 5]]),
    L('blue', [[6, 5], [6, 6], [7, 6]]), L('blue', [[11, 5], [11, 6], [10, 6]]),
    R('yellow', 1.62, 6), R('red-s', 4, 6), R('yellow-s', 8, 6), R('red-s', 12, 6), R('yellow', 13.94, 6),
    R('red-s', 2, 7), R('metal', 4, 7), R('red-s', 6, 7, 1), R('red-s', 11, 7, 1), R('metal', 12, 7), R('red-s', 14, 7),
    R('red-s', 0, 8), R('metal', 2, 8), R('red-s', 4, 8), R('yellow', 6, 8), R('yellow', 8, 8), R('yellow', 10, 8), R('red-s', 12, 8), R('metal', 14, 8), R('red-s', 16, 8),
    R('blue', 0, 9), R('blue', 2, 9), R('blue', 14, 9), R('blue', 16, 9),
  ];

  const stage68 = [
    L('metal', [[0, 0], [1, 0], [0, 1]]), R('violet-s', 2, 0, 1), R('violet-s', 6, 0, 1), R('red-s', 7, 0), R('red-s', 9, 0), R('violet-s', 11, 0, 1), L('metal', [[13, 0], [14, 0], [13, 1]]), R('violet-s', 15, 0, 1), R('violet-s', 16, 0, 1),
    R('purple-s', 1, 1), R('violet-s', 3, 1, 1), V('metal', 6, 1), R('red-s', 7, 1, 1), R('red-s', 8, 1), R('red-s', 10, 1, 1), R('violet-s', 11, 1, 1), R('yellow-s', 14, 1), R('yellow-s', 16, 1, 1), R('violet-s', 17, 1, 1),
    R('violet-s', 0, 2, 1), R('purple-s', 1, 2, 1), R('purple-s', 2, 2), R('violet-s', 4, 2, 1), R('red-s', 7, 2), R('red-s', 9, 2), V('metal', 11, 2), R('violet-s', 13, 2, 1), V('yellow-s', 14, 2), R('yellow-s', 15, 2), R('violet-s', 17, 2, 1),
    R('metal', 0, 3, 1), R('purple-s', 1, 3), R('purple-s', 3, 3, 1), V('metal', 4, 3), R('violet-s', 6, 3, 1), R('red-s', 7, 3, 1), R('red-s', 8, 3), R('red-s', 10, 3, 1), R('metal', 13, 3, 1), R('violet-s', 15, 3, 1), R('metal', 16, 3, 1),
    R('metal', 0, 4, 1), R('purple-s', 1, 4, 1), R('purple-s', 2, 4), R('violet-s', 6, 4, 1), R('red-s', 7, 4), R('red-s', 9, 4), R('violet-s', 11, 4, 1), R('metal', 13, 4, 1), L('yellow-s', [[14, 4], [14, 5], [15, 5]]), R('violet-s', 15, 4, 1), R('violet-s', 16, 4, 1),
    R('violet-s', 0, 5, 1), R('purple-s', 1, 5), R('purple-s', 3, 5, 1), R('violet-s', 4, 5, 1), V('metal', 7, 5), V('red-s', 8, 5), V('red-s', 9, 5), R('violet-s', 10, 5, 1), R('violet-s', 13, 5, 1), R('yellow-s', 16, 5, 1), R('violet-s', 17, 5, 1),
    L('metal', [[0, 6], [0, 7], [1, 7]]), R('purple-s', 1, 6, 1), R('purple-s', 2, 6, 1), R('violet-s', 3, 6, 1), R('metal', 10, 6, 1), L('metal', [[13, 6], [13, 7], [14, 7]]), R('yellow-s', 14, 6, 1), R('yellow-s', 15, 6), R('metal', 17, 6, 1),
    R('violet-s', 2, 7, 1), R('violet-s', 8, 7, 1), R('metal', 9, 7, 1), R('violet-s', 15, 7, 1), R('violet-s', 16, 7, 1),
  ];

  const stage69 = [
    R('metal', 0, 0, 1), R('metal', 1, 0, 1), R('metal', 2, 0, 1), R('metal', 5, 0, 1), R('metal', 6, 0, 1), R('metal', 7, 0, 1), R('metal', 10, 0, 1), R('metal', 11, 0, 1), R('metal', 12, 0, 1), R('metal', 15, 0, 1), R('metal', 16, 0, 1), R('metal', 17, 0, 1),
    R('metal', 0, 1, 1), R('metal', 1, 1, 1), R('metal', 2, 1, 1), R('metal', 3, 1, 1), R('metal', 4, 1, 1), R('metal', 5, 1, 1), R('metal', 6, 1, 1), R('metal', 7, 1, 1), R('metal', 8, 1, 1), R('metal', 9, 1, 1), R('metal', 10, 1, 1), R('metal', 11, 1, 1), R('metal', 12, 1, 1), R('metal', 13, 1, 1), R('metal', 14, 1, 1), R('metal', 15, 1, 1), R('metal', 16, 1, 1), R('metal', 17, 1, 1),
    R('metal', 0, 2, 1), R('red', 1, 2, 1), L('green-s', [[2, 2], [3, 2], [3, 3]]), V('green-s', 4, 2), R('metal', 6, 2, 1), R('red', 8, 2, 1), R('red', 9, 2, 1), R('metal', 11, 2, 1), V('green-s', 13, 2), L('green-s', [[14, 2], [15, 2], [14, 3]]), R('red', 16, 2, 1), R('metal', 17, 2, 1),
    R('metal', 0, 3, 1), R('red', 1, 3, 1), R('red', 2, 3, 1), R('red', 8, 3, 1), R('red', 9, 3, 1), R('red', 15, 3, 1), R('red', 16, 3, 1), R('metal', 17, 3, 1),
    R('metal', 0, 4, 1), R('red', 1, 4, 1), R('red', 2, 4, 1), R('metal', 3, 4, 1), R('metal', 4, 4, 1), R('purple', 5, 4, 1), R('red', 6, 4, 1), R('purple', 7, 4, 1), R('metal', 8, 4, 1), R('metal', 9, 4, 1), R('purple', 10, 4, 1), R('red', 11, 4, 1), R('purple', 12, 4, 1), R('metal', 13, 4, 1), R('metal', 14, 4, 1), R('red', 15, 4, 1), R('red', 16, 4, 1), R('metal', 17, 4, 1),
    R('metal', 0, 5, 1), R('red', 1, 5, 1), R('red', 2, 5, 1), R('metal', 3, 5, 1), R('metal', 4, 5, 1), R('purple', 5, 5, 1), R('red', 6, 5, 1), R('purple', 7, 5, 1), R('metal', 8, 5, 1), R('metal', 9, 5, 1), R('purple', 10, 5, 1), R('red', 11, 5, 1), R('purple', 12, 5, 1), R('metal', 13, 5, 1), R('metal', 14, 5, 1), R('red', 15, 5, 1), R('red', 16, 5, 1), R('metal', 17, 5, 1),
    R('metal', 0, 6, 1), R('red', 1, 6, 1), R('red', 2, 6, 1), R('metal', 3, 6, 1), R('metal', 4, 6, 1), R('purple', 5, 6, 1), R('red', 6, 6, 1), R('purple', 7, 6, 1), R('metal', 8, 6, 1), R('metal', 9, 6, 1), R('purple', 10, 6, 1), R('red', 11, 6, 1), R('purple', 12, 6, 1), R('metal', 13, 6, 1), R('metal', 14, 6, 1), R('red', 15, 6, 1), R('red', 16, 6, 1), R('metal', 17, 6, 1),
    R('metal', 0, 7, 1), R('metal', 1, 7, 1), R('metal', 2, 7, 1), R('metal', 3, 7, 1), R('metal', 4, 7, 1), R('purple', 5, 7, 1), R('red', 6, 7, 1), R('purple', 7, 7, 1), R('metal', 8, 7, 1), R('metal', 9, 7, 1), R('purple', 10, 7, 1), R('red', 11, 7, 1), R('purple', 12, 7, 1), R('metal', 13, 7, 1), R('metal', 14, 7, 1), R('metal', 15, 7, 1), R('metal', 16, 7, 1), R('metal', 17, 7, 1),
  ];

  const stage70 = [
    R('red', 6, 0), R('red', 8, 0),
    R('metal', 5, 1), R('metal', 7, 1), L('metal', [[9, 1], [10, 1], [10, 2]]), R('metal', 14, 1, 1), R('metal', 15, 1, 1), R('red', 16, 1, 1),
    R('metal', 4, 2, 1), V('blue', 5, 2), V('green', 6, 2), V('purple-s', 7, 2), V('blue', 8, 2), R('yellow-s', 9, 2, 1), R('metal', 13, 2, 1), V('red', 14, 2), R('metal', 15, 2, 1),
    R('metal', 3, 3, 1), V('red', 4, 3), L('yellow-s', [[9, 3], [9, 4], [10, 4]]), R('metal', 10, 3), R('metal', 12, 3, 1), L('red', [[13, 3], [13, 4], [14, 4]]), V('red-s', 15, 3),
    R('red', 2, 4, 1), V('red', 3, 4), V('blue', 5, 4), R('red', 6, 4, 1), R('purple-s', 7, 4, 1), V('blue', 8, 4), V('yellow', 11, 4), V('red', 12, 4),
    R('red', 2, 5, 1), V('red', 4, 5), V('green', 6, 5), V('purple-s', 7, 5), L('yellow-s', [[9, 5], [10, 5], [9, 6]]), L('red', [[13, 5], [14, 5], [13, 6]]), V('red-s', 15, 5),
    R('metal', 3, 6, 1), V('blue', 5, 6), V('blue', 8, 6), R('metal', 10, 6), R('metal', 12, 6, 1), V('red', 14, 6),
    R('metal', 4, 7, 1), R('green', 6, 7, 1), R('purple-s', 7, 7, 1), R('metal', 9, 7, 1), R('metal', 13, 7, 1), V('metal', 15, 7),
    R('metal', 5, 8), R('metal', 7, 8), R('metal', 14, 8, 1), R('red', 16, 8, 1),
  ];

  const stage71 = [
    R('yellow-s', 7, 0, 1), R('yellow-s', 8, 0), R('yellow-s', 10, 0, 1),
    R('yellow-s', 5, 1, 1), R('yellow-s', 6, 1), R('yellow-s', 10, 1), R('yellow-s', 12, 1, 1),
    R('red-s', 2, 2, 1), R('red', 3, 2, 1), R('yellow-s', 4, 2), R('yellow-s', 12, 2), R('red', 14, 2, 1), R('red-s', 15, 2, 1),
    V('green-s', 1, 3), V('metal', 2, 3), V('red', 3, 3), V('yellow-s', 4, 3), mv(R('metal', 6.47, 3, 1), 1, 30), V('yellow-s', 13, 3), V('red', 14, 3), V('metal', 15, 3), V('green-s', 16, 3),
    R('green-s', 0, 4, 1), mv(R('metal', 7.45, 4), -1, 30), R('green-s', 17, 4, 1),
    R('green-s', 0, 5, 1), R('green-s', 1, 5, 1), R('metal', 2, 5, 1), V('red', 3, 5), V('yellow-s', 4, 5), mv(R('metal', 6.34, 5), 1, 30), V('yellow-s', 13, 5), V('red', 14, 5), R('metal', 15, 5, 1), R('green-s', 16, 5, 1), R('green-s', 17, 5, 1),
    R('green-s', 0, 6, 1), V('green-s', 1, 6), V('metal', 2, 6), mv(L('metal', [[8.56, 6], [9.56, 6], [8.56, 7]]), -1, 30), V('metal', 15, 6), V('green-s', 16, 6), R('green-s', 17, 6, 1),
    V('red', 3, 7), R('metal', 4, 7, 1), R('metal', 13, 7, 1), V('red', 14, 7),
    R('metal', 2, 8, 1), mv(L('metal', [[4.8, 8], [4.8, 9], [5.8, 9]]), 1, 30), R('metal', 15, 8, 1),
    R('red', 3, 9, 1), R('red', 14, 9, 1),
    R('metal', 2, 10), R('metal', 14, 10),
  ];

  const stage72 = [
    R('yellow', 0, 0), R('red-s', 2, 0), R('green', 4, 0), R('purple-s', 6, 0), R('purple', 8, 0), R('yellow-s', 10, 0), R('red', 12, 0), R('green-s', 14, 0), R('blue', 16, 0),
    R('metal', 0, 1, 1), R('red', 1, 1, 1), R('red', 16, 1, 1), R('metal', 17, 1, 1),
    R('metal', 1, 2, 1), R('blue', 2, 2, 1), R('metal', 5, 2, 1), R('red-s', 6, 2), R('red-s', 10, 2), R('metal', 12, 2, 1), R('blue', 15, 2, 1), R('metal', 16, 2, 1),
    R('metal', 2, 3, 1), R('yellow', 3, 3, 1), R('metal', 6, 3), R('metal', 10, 3), R('yellow', 14, 3, 1), R('metal', 15, 3, 1),
    R('metal', 3, 4, 1), R('green', 4, 4, 1), L('metal', [[9, 4], [8, 5], [9, 5]]), R('green', 13, 4, 1), R('metal', 14, 4, 1),
    R('metal', 4, 5, 1), R('purple', 5, 5, 1), R('purple', 12, 5, 1), R('metal', 13, 5, 1),
    R('purple', 0, 6, 1), V('red', 1, 6), R('metal', 5, 6, 1), R('green', 6, 6, 1), R('green', 11, 6, 1), R('metal', 12, 6, 1), V('red', 16, 6), R('purple', 17, 6, 1),
    R('metal', 6, 7, 1), R('red', 7, 7, 1), R('red', 10, 7, 1), R('metal', 11, 7, 1),
    R('green', 1, 8), R('green', 3, 8), R('green', 5, 8), R('metal', 7, 8, 1), R('metal', 10, 8, 1), R('green', 11, 8), R('green', 13, 8), R('green', 15, 8),
  ];

  const stage73 = [
    R('metal', 1, 1, 1), R('metal', 2, 1, 1), R('metal', 3, 1, 1), R('red-s', 7, 1, 1), R('red-s', 9, 1, 1), R('metal', 13, 1, 1), R('metal', 16, 1, 1),
    R('metal', 2, 2, 1), R('metal', 6, 2, 1), R('red', 7, 2, 1), R('red-s', 8, 2, 1), R('red', 9, 2, 1), R('metal', 10, 2, 1), R('metal', 13, 2, 1), R('metal', 16, 2, 1),
    R('metal', 2, 3, 1), R('metal', 6, 3, 1), R('red', 7, 3, 1), R('red', 8, 3, 1), R('red', 9, 3, 1), R('metal', 10, 3, 1), R('metal', 13, 3, 1), R('metal', 16, 3, 1),
    R('metal', 2, 4, 1), R('metal', 7, 4, 1), R('red', 8, 4, 1), R('metal', 9, 4, 1), R('metal', 13, 4, 1), R('metal', 16, 4, 1),
    R('metal', 1, 5, 1), R('metal', 2, 5, 1), R('metal', 3, 5, 1), R('red-s', 8, 5, 1), R('metal', 14, 5, 1), R('metal', 15, 5, 1),
    R('purple-s', 0, 8, 1), R('purple-s', 1, 8, 1), R('purple-s', 2, 8, 1), R('purple-s', 3, 8, 1), R('purple-s', 4, 8, 1), R('purple-s', 5, 8, 1), R('purple-s', 6, 8, 1), R('purple-s', 7, 8, 1), R('purple-s', 8, 8, 1), R('purple-s', 9, 8, 1), R('purple-s', 10, 8, 1), R('purple-s', 11, 8, 1), R('purple-s', 12, 8, 1), R('purple-s', 13, 8, 1), R('purple-s', 14, 8, 1), R('purple-s', 15, 8, 1), R('purple-s', 16, 8, 1), R('purple-s', 17, 8, 1),
    R('green', 0, 9, 1), R('green', 1, 9, 1), R('green', 2, 9, 1), R('green', 3, 9, 1), R('green', 4, 9, 1), R('green', 5, 9, 1), R('green', 6, 9, 1), R('green', 7, 9, 1), R('green', 8, 9, 1), R('green', 9, 9, 1), R('green', 10, 9, 1), R('green', 11, 9, 1), R('green', 12, 9, 1), R('green', 13, 9, 1), R('green', 14, 9, 1), R('green', 15, 9, 1), R('green', 16, 9, 1), R('green', 17, 9, 1),
  ];

  const stage74 = [
    R('yellow-s', 0, 1), R('yellow-s', 2, 1), R('yellow-s', 4, 1), R('yellow-s', 6, 1), R('yellow-s', 8, 1), R('yellow-s', 10, 1), R('yellow-s', 12, 1), R('yellow-s', 14, 1), R('yellow-s', 16, 1),
    R('yellow-s', 0, 2, 1), R('yellow-s', 1, 2), R('yellow-s', 3, 2), R('yellow-s', 5, 2), R('yellow-s', 7, 2), R('yellow-s', 9, 2), R('yellow-s', 11, 2), R('yellow-s', 13, 2), R('yellow-s', 15, 2), R('yellow-s', 17, 2, 1),
    R('metal', 2, 3), R('metal', 4, 3), R('metal', 7, 3, 1), R('metal', 8, 3), R('metal', 10, 3, 1), R('metal', 12, 3), R('metal', 14, 3),
    R('metal', 3, 4), R('metal', 8, 4), R('metal', 13, 4),
    R('yellow-s', 3, 5), R('yellow-s', 8, 5), R('yellow-s', 13, 5),
    R('metal', 3, 6), R('metal', 8, 6), R('metal', 13, 6),
    R('metal', 1, 7), R('metal', 3, 7, 1), R('metal', 4, 7), R('metal', 7, 7, 1), R('metal', 8, 7), R('metal', 10, 7, 1), R('metal', 12, 7), R('metal', 14, 7, 1), R('metal', 15, 7),
    R('yellow', 0, 8), R('yellow', 2, 8, 1), R('yellow-s', 3, 8), R('yellow-s', 5, 8), R('yellow', 7, 8), R('yellow', 9, 8), R('yellow-s', 11, 8), R('yellow-s', 13, 8), R('yellow', 15, 8, 1), R('yellow', 16, 8),
    R('yellow-s', 0, 9), R('yellow-s', 2, 9), R('yellow', 4, 9), R('yellow', 6, 9), R('yellow-s', 8, 9), R('yellow', 10, 9), R('yellow', 12, 9), R('yellow-s', 14, 9), R('yellow-s', 16, 9),
  ];
  root.EXBLOCK_LEVELS = [
    { id: 'stage-1', stage: 1, name: 'Kademeler', source: 'reference-frames/user-stage-01b.jpg', confidence: 'yüksek', bricks: down(stage1) },
    { id: 'stage-2', stage: 2, name: 'Üç bant', source: 'reference-frames/user-stage-02.jpg + 0035.jpg', confidence: 'yüksek (renkler 0035.jpg)', bricks: down(stage2) },
    { id: 'spiral', stage: 3, name: 'Spiral', source: 'reference-frames/user-stage-03-start.jpg', confidence: 'yüksek', bricks: down(spiral) },
    { id: 'stage-4', stage: 4, name: 'İki kule', source: 'reference-frames/user-stage-04.jpg', confidence: 'yüksek (yatay konum ±0.25 hücre)', bricks: stage4 },
    { id: 'stage-5', stage: 5, name: 'Elmas', source: 'reference-frames/user-stage-05.jpg', confidence: 'yüksek (1 kare desenden)', bricks: stage5 },
    { id: 'stage-6', stage: 6, name: 'İki halka', source: 'reference-frames/user-stage-06.jpg', confidence: 'yüksek', bricks: stage6 },
    { id: 'stage-7', stage: 7, name: 'Basamaklar ve L', source: 'reference-frames/user-stage-07.jpg', confidence: 'yüksek', bricks: stage7 },
    { id: 'stage-8', stage: 8, name: 'Sarı kıvrım', source: 'reference-frames/user-stage-08.jpg', confidence: 'orta-yüksek (yazı altı bölge)', bricks: stage8 },
    { id: 'stage-9', stage: 9, name: 'Kareler', source: 'reference-frames/user-stage-09.jpg', confidence: 'yüksek (mor kareler ±0.1 hücre)', bricks: stage9 },
    { id: 'stage-10', stage: 10, name: 'Kırmızı sütunlar', source: 'reference-frames/video-stage-10-start.jpg', confidence: 'yüksek', bricks: stage10 },
    { id: 'stage-11', stage: 11, name: 'Kayan çaprazlar', source: 'trim_17 1:10, trim_18', confidence: 'orta (hareket yaklaşık)', bricks: stage11 },
    { id: 'stage-12', stage: 12, name: 'Metal iskelet', source: 'reference-frames/trim-stage-12-start.jpg', confidence: 'yüksek', bricks: stage12 },
    { id: 'stage-13', stage: 13, name: 'Piramit ve kaktüs', source: 'reference-frames/trim-stage-13-start.jpg', confidence: 'yüksek', bricks: stage13 },
    { id: 'stage-14', stage: 14, name: 'Basamaklı sıra', source: 'reference-frames/trim-stage-14-start.jpg', confidence: 'yüksek (yalnız başlangıç görüldü)', bricks: stage14 },
    { id: 'stage-15', stage: 15, name: 'Yeşil çerçeve', source: 'reference-frames/kayit-stage-15-start.jpg', confidence: 'yüksek', bricks: stage15 },
    { id: 'stage-16', stage: 16, name: 'Piramit', source: 'reference-frames/kayit-stage-16-start.jpg', confidence: 'yüksek', bricks: stage16 },
    { id: 'stage-17', stage: 17, name: 'Kalp', source: 'reference-frames/kayit-stage-17-start.jpg', confidence: 'orta-yüksek (iç dikey düzen)', bricks: stage17 },
    { id: 'stage-18', stage: 18, name: 'Robot yüz', source: 'reference-frames/kayit-stage-18-start.jpg', confidence: 'orta (metal parçalar)', bricks: stage18 },
    { id: 'stage-19', stage: 19, name: 'Tek sıralar', source: 'reference-frames/kayit-stage-19-start.jpg', confidence: 'yüksek', bricks: stage19 },
    { id: 'stage-20', stage: 20, name: 'Kanatlar', source: 'reference-frames/user-stage-20.jpg', confidence: 'yüksek', bricks: stage20 },
    { id: 'stage-21', stage: 21, name: 'Elmas ve kuşak', source: 'reference-frames/kayit-stage-21-start.jpg', confidence: 'yüksek', bricks: stage21 },
    { id: 'stage-22', stage: 22, name: 'Metal kale', source: 'reference-frames/parca-stage-22.jpg', confidence: 'yüksek', bricks: stage22 },
    { id: 'stage-23', stage: 23, name: 'Mor kule', source: 'reference-frames/parca-stage-23.jpg', confidence: 'yüksek (alt metal hızı yaklaşık)', bricks: stage23 },
    { id: 'stage-24', stage: 24, name: 'Mavi sarmallar', source: 'reference-frames/parca-stage-24.jpg', confidence: 'yüksek', bricks: stage24 },
    { id: 'stage-25', stage: 25, name: 'Dağınık kümeler', source: 'reference-frames/parca-stage-25.jpg', confidence: 'yüksek', bricks: stage25 },
    { id: 'stage-26', stage: 26, name: 'KCS', source: 'reference-frames/parca-stage-26.jpg', confidence: 'yüksek', bricks: stage26 },
    { id: 'stage-27', stage: 27, name: 'Kayan sıralar', source: 'reference-frames/parca-stage-27.jpg', confidence: 'orta (hareket yaklaşık)', bricks: stage27 },
    { id: 'stage-28', stage: 28, name: 'Mor V', source: 'reference-frames/parca-stage-28.jpg', confidence: 'yüksek (hız yaklaşık)', bricks: stage28 },
    { id: 'stage-29', stage: 29, name: 'İki çerçeve', source: 'reference-frames/parca-stage-29.jpg', confidence: 'yüksek', bricks: stage29 },
    { id: 'stage-30', stage: 30, name: 'Dalgalar', source: 'reference-frames/parca-stage-30.jpg', confidence: 'yüksek', bricks: stage30 },
    { id: 'stage-31', stage: 31, name: 'Direk ve kanatlar', source: 'reference-frames/parca-stage-31.jpg', confidence: 'yüksek (L hızı yaklaşık)', bricks: stage31 },
    { id: 'stage-32', stage: 32, name: 'Ters piramit', source: 'reference-frames/kayit2-stage-32.jpg', confidence: 'yüksek', bricks: stage32 },
    { id: 'stage-33', stage: 33, name: 'Sütunlar', source: 'reference-frames/kayit2-stage-33.jpg', confidence: 'yüksek', bricks: stage33 },
    { id: 'stage-34', stage: 34, name: 'Dağlar', source: 'reference-frames/kayit2-stage-34.jpg', confidence: 'yüksek', bricks: stage34 },
    { id: 'stage-35', stage: 35, name: 'Kalp ve ok', source: 'reference-frames/kayit2-stage-35.jpg', confidence: 'yüksek', bricks: stage35 },
    { id: 'stage-36', stage: 36, name: 'F ve kupa', source: 'reference-frames/kayit2-stage-36.jpg', confidence: 'yüksek', bricks: stage36 },
    { id: 'stage-37', stage: 37, name: 'İç içe kemer', source: 'reference-frames/kayit2-stage-37.jpg', confidence: 'yüksek', bricks: stage37 },
    { id: 'stage-38', stage: 38, name: 'GJ', source: 'reference-frames/kayit2-stage-38.jpg', confidence: 'yüksek', bricks: stage38 },
    { id: 'stage-39', stage: 39, name: 'Köşeli kutular', source: 'reference-frames/kayit2-stage-39.jpg', confidence: 'orta (kayan blok hızı yaklaşık)', bricks: stage39 },
    { id: 'stage-40', stage: 40, name: 'Zincir', source: 'reference-frames/kayit2-stage-40.jpg', confidence: 'orta (kayan blok hızı yaklaşık); temiz başlangıç karesi sonradan alındı', bricks: stage40 },
    { id: 'stage-41', stage: 41, name: 'Renkli kutu', source: 'reference-frames/kayit2-stage-41.jpg', confidence: 'yüksek', bricks: stage41 },
    { id: 'stage-42', stage: 42, name: 'Simetrik kale', source: 'reference-frames/kayit2-stage-42.jpg', confidence: 'yüksek; temiz başlangıç karesi sonradan alındı', bricks: stage42 },
    { id: 'stage-43', stage: 43, name: 'Yaylar', source: 'reference-frames/kayit2-stage-43.jpg', confidence: 'orta (kayan blok hızı yaklaşık)', bricks: stage43 },
    { id: 'stage-44', stage: 44, name: 'Mor kuşak', source: 'reference-frames/kayit2-stage-44.jpg', confidence: 'yüksek', bricks: stage44 },
    { id: 'stage-45', stage: 45, name: 'Gemi', source: 'reference-frames/kayit2-stage-45.jpg', confidence: 'orta (kayan blok hızı yaklaşık)', bricks: stage45 },
    { id: 'stage-46', stage: 46, name: 'Mavi kalkan', source: 'reference-frames/kayit2-stage-46.jpg', confidence: 'yüksek', bricks: stage46 },
    { id: 'stage-47', stage: 47, name: 'TT', source: 'reference-frames/kayit2-stage-47.jpg', confidence: 'orta (kayan blok hızı yaklaşık)', bricks: stage47 },
    { id: 'stage-48', stage: 48, name: 'Kale kapısı', source: 'reference-frames/kayit2-stage-48.jpg', confidence: 'yüksek', bricks: stage48 },
    { id: 'stage-49', stage: 49, name: 'Kayan sütunlar', source: 'reference-frames/kayit2-stage-49.jpg', confidence: 'orta (kayan blok hızı yaklaşık)', bricks: stage49 },
    { id: 'stage-50', stage: 50, name: 'Yeşil zincir', source: 'reference-frames/kayit2-stage-50.jpg', confidence: 'orta (kayan blok hızı yaklaşık)', bricks: stage50 },
    { id: 'stage-51', stage: 51, name: 'Uzun sıralar', source: 'reference-frames/kayit2-stage-51.jpg', confidence: 'yüksek', bricks: stage51 },
    { id: 'stage-52', stage: 52, name: 'Şapka', source: 'reference-frames/kayit2-stage-52.jpg', confidence: 'yüksek', bricks: stage52 },
    { id: 'stage-53', stage: 53, name: 'Kayan yeşiller', source: 'reference-frames/kayit2-stage-53.jpg', confidence: 'orta (kayan blok hızı yaklaşık)', bricks: stage53 },
    { id: 'stage-54', stage: 54, name: 'Uzay gemisi', source: 'reference-frames/kayit2-stage-54.jpg', confidence: 'yüksek', bricks: stage54 },
    { id: 'stage-55', stage: 55, name: 'Gülen yüz', source: 'reference-frames/kayit2-stage-55.jpg', confidence: 'yüksek', bricks: stage55 },
    { id: 'stage-56', stage: 56, name: 'Kayan merdiven', source: 'reference-frames/kayit2-stage-56.jpg', confidence: 'orta (kayan blok hızı yaklaşık)', bricks: stage56 },
    { id: 'stage-57', stage: 57, name: 'İç içe çerçeve', source: 'reference-frames/kayit2-stage-57.jpg', confidence: 'yüksek', bricks: stage57 },
    { id: 'stage-58', stage: 58, name: 'Bıyık', source: 'reference-frames/kayit2-stage-58.jpg', confidence: 'yüksek', bricks: stage58 },
    { id: 'stage-59', stage: 59, name: 'Çerçeve', source: 'reference-frames/kayit2-stage-59.jpg', confidence: 'orta (kayan blok hızı yaklaşık)', bricks: stage59 },
    { id: 'stage-60', stage: 60, name: 'Duvar', source: 'reference-frames/kayit2-stage-60.jpg', confidence: 'orta (kayan blok hızı yaklaşık)', bricks: stage60 },
    { id: 'stage-61', stage: 61, name: 'YOU', source: 'reference-frames/kayit2-stage-61.jpg', confidence: 'yüksek', bricks: stage61 },
    { id: 'stage-62', stage: 62, name: 'Asılı direkler', source: 'reference-frames/kayit2-stage-62.jpg', confidence: 'orta (kayan blok hızı yaklaşık)', bricks: stage62 },
    { id: 'stage-63', stage: 63, name: 'Labirent', source: 'reference-frames/kayit2-stage-63.jpg', confidence: 'yüksek', bricks: stage63 },
    { id: 'stage-64', stage: 64, name: 'Böcek', source: 'reference-frames/kayit2-stage-64.jpg', confidence: 'orta (kayan blok hızı yaklaşık)', bricks: stage64 },
    { id: 'stage-65', stage: 65, name: 'Kale', source: 'reference-frames/kayit2-stage-65.jpg', confidence: 'yüksek', bricks: stage65 },
    { id: 'stage-66', stage: 66, name: 'Renkli sütunlar', source: 'reference-frames/kayit2-stage-66.jpg', confidence: 'yüksek', bricks: stage66 },
    { id: 'stage-67', stage: 67, name: 'Maske', source: 'reference-frames/kayit2-stage-67.jpg', confidence: 'yüksek', bricks: stage67 },
    { id: 'stage-68', stage: 68, name: 'Harfler', source: 'reference-frames/kayit2-stage-68.jpg', confidence: 'yüksek', bricks: stage68 },
    { id: 'stage-69', stage: 69, name: 'Kule duvarı', source: 'reference-frames/kayit2-stage-69.jpg', confidence: 'yüksek', bricks: stage69 },
    { id: 'stage-70', stage: 70, name: 'Balık', source: 'reference-frames/kayit2-stage-70.jpg', confidence: 'yüksek', bricks: stage70 },
    { id: 'stage-71', stage: 71, name: 'Kafatası', source: 'reference-frames/kayit2-stage-71.jpg', confidence: 'orta (kayan blok hızı yaklaşık); temiz başlangıç karesi sonradan alındı', bricks: stage71 },
    { id: 'stage-72', stage: 72, name: 'Çapraz zincir', source: 'reference-frames/kayit2-stage-72.jpg', confidence: 'yüksek', bricks: stage72 },
    { id: 'stage-73', stage: 73, name: 'I ♥ U', source: 'reference-frames/kayit2-stage-73.jpg', confidence: 'yüksek', bricks: stage73 },
    { id: 'stage-74', stage: 74, name: 'Sütunlu tapınak', source: 'reference-frames/kayit2-stage-74.jpg', confidence: 'yüksek', bricks: stage74 },
  ];
  // Sırası bilinmeyen haritalar: oyunda kullanılmaz, Stage karesi gelince
  // doğru yere taşınır.
  root.EXBLOCK_UNPLACED = [
    { id: 'green-symmetric', stage: null, name: 'Yeşil simetri (sıra bilinmiyor)', source: 'reference-frames/0550.jpg', confidence: 'orta', bricks: down(greenSym) },
  ];
  root.EXBLOCK_GRID = { cols: 18, x0: 49, y0: 73.5, cw: 65, ch: 63.5 };
})(typeof window !== 'undefined' ? window : globalThis);
