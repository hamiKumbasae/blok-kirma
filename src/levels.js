// ExBlock haritaları — referans karelerinden ölçülerek çıkarıldı.
//
// Izgara: 18 sütun (c = 0..17) × satır (r = 0..). Bir hücre, 1264 px genişliğe
// ölçeklenmiş video karesinde 65 × 63.5 px (yarım tuğla). Normal tuğla 2×1,
// dikey tuğla 1×2 hücre; L parçaları üç hücreden oluşur.
//
// Türler:
//   red, blue, yellow, green, purple      → düz renkli tuğla
//   red-s, purple-s, green-s, silver-s    → çizgili/parlak görünümlü tuğla
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

  // Stage 1 — reference-frames/0010.jpg (puan 0, tuğlalar sağlam).
  const stage1 = [
    ...row('red', [6, 10], 0),
    ...row('blue', [3, 8, 13], 1),
    ...row('yellow', [1, 5, 11, 15], 2),
    ...row('green', [0, 4, 8, 12, 16], 3),
    ...['green', 'blue', 'purple', 'blue', 'purple', 'blue', 'purple', 'blue', 'green']
      .map((t, i) => R(t, i * 2, 5)),
    ...['green', 'purple', 'blue', 'purple', 'blue', 'red', 'blue', 'purple', 'green']
      .map((t, i) => R(t, i * 2, 7)),
  ];

  // Stage 2 — reference-frames/0035.jpg (Stage 1'in son tuğlasından hemen sonra,
  // top çubuğun üstünde, tüm tuğlalar sağlam). Üç bant, dikey tuğlalar, metal uçlar.
  const band = (t, from, to, r) => {
    const out = [V('metal', from, r)];
    for (let c = from + 1; c < to; c++) out.push(V(t, c, r));
    out.push(V('metal', to, r));
    return out;
  };
  const stage2 = [...band('yellow', 0, 17, 0), ...band('red', 1, 16, 3), ...band('yellow', 3, 14, 6)];

  // Spiral — reference-frames/0055.jpg. Stage 2'den sonra görülen ilk harita;
  // bölüm numarası ekranda görünmedi (muhtemelen 3). Kare haritanın tamamını
  // gösteriyor gibi, ancak kırılmış parça olup olmadığı başka kareyle doğrulanmadı.
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

  root.EXBLOCK_LEVELS = [
    { id: 'stage-1', stage: 1, name: 'Kademeler', source: 'reference-frames/0010.jpg', confidence: 'yüksek', bricks: stage1 },
    { id: 'stage-2', stage: 2, name: 'Üç bant', source: 'reference-frames/0035.jpg', confidence: 'yüksek', bricks: stage2 },
    { id: 'spiral', stage: null, name: 'Spiral (muhtemelen 3)', source: 'reference-frames/0055.jpg', confidence: 'orta', bricks: spiral },
    { id: 'green-symmetric', stage: null, name: 'Yeşil simetri (sıra bilinmiyor)', source: 'reference-frames/0550.jpg', confidence: 'orta', bricks: greenSym },
  ];
  root.EXBLOCK_GRID = { cols: 18, x0: 49, y0: 137, cw: 65, ch: 63.5 };
})(typeof window !== 'undefined' ? window : globalThis);
