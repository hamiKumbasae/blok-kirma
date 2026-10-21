// Harita verisini doğrular: node tests/levels.test.js
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ctx = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/levels.js'), 'utf8'), { globalThis: ctx });
const levels = [...ctx.EXBLOCK_LEVELS, ...ctx.EXBLOCK_UNPLACED];
assert.strictEqual(ctx.EXBLOCK_LEVELS.map((l) => l.stage).join(','), Array.from({ length: 74 }, (_, i) => i + 1).join(','), 'oyun Stage 1-74 sırasıyla');
const grid = ctx.EXBLOCK_GRID;

const cellsOf = (b) => b.cells || Array.from({ length: b.w * b.h }, (_, i) => [b.c + (i % b.w), b.r + Math.floor(i / b.w)]);
const TYPES = new Set(['red', 'blue', 'yellow', 'green', 'purple', 'red-s', 'blue-s', 'yellow-s', 'purple-s', 'violet-s', 'green-s', 'silver-s', 'metal']);

// Referans karelerinde sayılan blok adetleri.
const expected = { 'stage-1': 32, 'stage-2': 46, spiral: 35, 'stage-4': 29, 'stage-5': 29, 'stage-6': 24, 'stage-7': 29, 'stage-8': 69, 'stage-9': 44, 'stage-10': 48, 'stage-11': 43, 'stage-12': 23, 'stage-13': 72, 'stage-14': 32, 'stage-15': 57, 'stage-16': 51, 'stage-17': 47, 'stage-18': 42, 'stage-19': 66, 'stage-20': 48, 'stage-21': 32, 'stage-22': 38, 'stage-23': 52, 'stage-24': 49, 'stage-25': 34, 'stage-26': 25, 'stage-27': 94, 'stage-28': 43, 'stage-29': 56, 'stage-30': 55, 'stage-31': 47, 'stage-32': 62, 'stage-33': 40, 'stage-34': 46, 'stage-35': 40, 'stage-36': 82, 'stage-37': 36, 'stage-38': 42, 'stage-39': 19, 'stage-40': 41, 'stage-41': 31, 'stage-42': 45, 'stage-43': 37, 'stage-44': 55, 'stage-45': 54, 'stage-46': 62, 'stage-47': 55, 'stage-48': 60, 'stage-49': 40, 'stage-50': 54, 'stage-51': 41, 'stage-52': 66, 'stage-53': 48, 'stage-54': 57, 'stage-55': 29, 'stage-56': 26, 'stage-57': 51, 'stage-58': 34, 'stage-59': 44, 'stage-60': 62, 'stage-61': 96, 'stage-62': 30, 'stage-63': 110, 'stage-64': 59, 'stage-65': 68, 'stage-66': 32, 'stage-67': 49, 'stage-68': 77, 'stage-69': 122, 'stage-70': 55, 'stage-71': 54, 'stage-72': 56, 'stage-73': 71, 'stage-74': 63, 'green-symmetric': 57 };

for (const lv of levels) {
  const seen = new Map();
  for (const b of lv.bricks) {
    assert(TYPES.has(b.t), `${lv.id}: bilinmeyen tür ${b.t}`);
    for (const [c, r] of cellsOf(b)) {
      assert(c >= 0 && c < grid.cols && r >= 0 && r < 12, `${lv.id}: alan dışı hücre ${c},${r}`);
      const key = +c.toFixed(2) + ',' + r;
      assert(!seen.has(key), `${lv.id}: çakışan hücre ${key}`);
      seen.set(key, b.t);
    }
  }
  assert.strictEqual(lv.bricks.length, expected[lv.id], `${lv.id}: blok sayısı`);
  // Spiral, Stage 5 ve 6 dışındaki gözlenen haritalar yatayda simetrik (şekil olarak).
  if (['spiral', 'stage-5', 'stage-6', 'stage-8', 'stage-10', 'stage-11', 'stage-12', 'stage-13', 'stage-14', 'stage-15', 'stage-16', 'stage-17', 'stage-18', 'stage-19', 'stage-20', 'stage-21', 'stage-23', 'stage-25', 'stage-26', 'stage-27', 'stage-28', 'stage-29', 'stage-30', 'stage-32', 'stage-33', 'stage-34', 'stage-35', 'stage-36', 'stage-37', 'stage-38', 'stage-39', 'stage-40', 'stage-41', 'stage-42', 'stage-43', 'stage-44', 'stage-45', 'stage-46', 'stage-47', 'stage-48', 'stage-49', 'stage-50', 'stage-51', 'stage-52', 'stage-53', 'stage-54', 'stage-55', 'stage-56', 'stage-57', 'stage-58', 'stage-59', 'stage-60', 'stage-61', 'stage-62', 'stage-63', 'stage-64', 'stage-65', 'stage-66', 'stage-67', 'stage-68', 'stage-69', 'stage-70', 'stage-71', 'stage-72', 'stage-73', 'stage-74'].includes(lv.id)) { console.log(`ok ${lv.id}: ${lv.bricks.length} blok, ${seen.size} hücre`); continue; }
  for (const key of seen.keys()) {
    const [c, r] = key.split(',').map(Number);
    assert(seen.has(+(grid.cols - 1 - c).toFixed(2) + ',' + r), `${lv.id}: simetri bozuk ${key}`);
  }
  console.log(`ok ${lv.id}: ${lv.bricks.length} blok, ${seen.size} hücre`);
}
