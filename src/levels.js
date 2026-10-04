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
//   red-s, blue-s, yellow-s, purple-s,
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
    // c10: oyun sırasında yeşil (birinci.mov); girişte mor, vurulunca kırmızı görünüyor.
    ...['green', 'purple', 'blue', 'purple', 'blue', 'green', 'blue', 'purple', 'green']
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
  const pillar = (cols) => cols.flatMap((c) => ['metal', 'purple', 'metal', 'purple', 'metal'].map((t, r) => R(t, c, r)));
  const stage4 = [
    ...pillar([2.25, 4.5, 11.5, 13.75]),
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
  // boşluğun soluna çeyrek hücre kayık duruyor (c = 5.25 / 11.25).
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
    R('blue', 5.25, 5, 1), R('blue', 5.25, 6, 1), R('blue', 11.25, 5, 1), R('blue', 11.25, 6, 1),
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
  // sarı tam sıralar, en altta yeşil kareler. Yazının altındaki satır 3–4
  // bölgesinde (c 4–9) görünmeyen blok olabilir.
  const stage8 = [
    R('yellow', 11, 0, 1), R('yellow', 12, 0), R('yellow', 14, 0),
    V('yellow', 11, 1), R('blue', 12, 1, 1), R('blue', 13, 1), V('blue', 15, 1), V('yellow', 16, 1),
    R('red-s', 12, 2, 1), R('metal', 13, 2), R('yellow', 17, 2, 1),
    R('yellow', 10, 3, 1), R('blue', 15, 3, 1), V('blue', 16, 3), R('yellow', 17, 3, 1),
    R('yellow', 6, 4, 1), R('yellow', 7, 4, 1), R('yellow', 8, 4), R('red-s', 10, 4, 1), R('green-s', 15, 4, 1), V('yellow', 17, 4),
    R('yellow', 2, 5, 1), R('yellow', 3, 5, 1), R('yellow', 4, 5), R('yellow', 6, 5, 1), R('blue', 7, 5), R('red-s', 9, 5, 1), R('green-s', 13, 5), V('blue', 16, 5),
    R('yellow', 1, 6), R('blue', 3, 6), R('blue', 5, 6), R('green-s', 7, 6, 1), R('green-s', 12, 6, 1), V('yellow', 17, 6),
    R('yellow', 0, 7, 1), R('blue', 1, 7), R('metal', 4, 7), R('green-s', 8, 7), R('green-s', 10, 7), R('metal', 13, 7), R('blue', 16, 7, 1),
    R('yellow', 0, 8, 1), R('blue', 1, 8, 1), ...row('blue', [2, 4, 6, 8, 10], 8), R('yellow', 12, 8, 1), ...row('blue', [13, 15], 8), R('yellow', 17, 8, 1),
    ...row('yellow', [1, 3, 5, 7, 9], 9), R('yellow', 11, 9, 1), ...row('yellow', [13, 15], 9),
    ...[2, 4, 6, 8, 10, 14, 16].map((c) => R('green', c, 10, 1)),
  ];

  // Stage 9 — reference-frames/user-stage-09.jpg ("Stage 9"). Üstte ve altta
  // çizgili yeşil kareler, ortada ızgaraya oturmayan iki sıra mor kare
  // (konumlar ölçüldü, yatayda simetrik).
  const greenSq = (cols, r) => cols.map((c) => R('green-s', c, r, 1));
  const purpleSq = (cols, r) => cols.flatMap((c) => [R('purple', c, r, 1), R('purple', +(17 - c).toFixed(2), r, 1)]);
  const stage9 = [
    ...greenSq([2, 4, 6, 8, 9, 11, 13, 15], 1),
    ...purpleSq([0.6, 3.4, 4.6, 7.4], 4),
    ...purpleSq([0.7, 2.2, 4.35, 5.7, 7.7], 5),
    ...greenSq([1, 3, 5, 7, 10, 12, 14, 16], 8),
    ...greenSq([0, 2, 4, 6, 8, 9, 11, 13, 15, 17], 9),
  ];

  // Stage 10 — kullanıcının sohbette gönderdiği "Stage 10" karesi (dosyaya
  // kaydedilemedi; görsel ölçüm). Çizgili kırmızı dikey bloklarla "HUK"
  // benzeri biçim, metal ara parçalar.
  const redCol = (c) => [0, 2, 4, 6, 8].map((r) => V('red-s', c, r));
  const stage10 = [
    ...redCol(2), ...redCol(3), ...redCol(6), ...redCol(7), ...redCol(10), ...redCol(11),
    V('metal', 4, 4), V('metal', 5, 4), R('metal', 8, 8), R('metal', 8, 9),
    V('red-s', 15, 0), R('red-s', 16, 0, 1), R('red-s', 14, 1, 1), V('red-s', 14, 2), V('red-s', 15, 2),
    R('red-s', 13, 3, 1), R('red-s', 14, 4, 1), R('red-s', 12, 4), R('red-s', 12, 5),
    R('red-s', 13, 6, 1), V('red-s', 14, 6), V('red-s', 15, 7), R('red-s', 15, 9, 1), V('red-s', 16, 8),
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
    { id: 'stage-10', stage: 10, name: 'Kırmızı sütunlar', source: 'sohbet görüntüsü (kaydedilemedi)', confidence: 'orta (görsel ölçüm)', bricks: stage10 },
  ];
  // Sırası bilinmeyen haritalar: oyunda kullanılmaz, Stage karesi gelince
  // doğru yere taşınır.
  root.EXBLOCK_UNPLACED = [
    { id: 'green-symmetric', stage: null, name: 'Yeşil simetri (sıra bilinmiyor)', source: 'reference-frames/0550.jpg', confidence: 'orta', bricks: down(greenSym) },
  ];
  root.EXBLOCK_GRID = { cols: 18, x0: 49, y0: 73.5, cw: 65, ch: 63.5 };
})(typeof window !== 'undefined' ? window : globalThis);
