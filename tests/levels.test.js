// Harita verisini doğrular: node tests/levels.test.js
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ctx = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/levels.js'), 'utf8'), { globalThis: ctx });
const levels = ctx.EXBLOCK_LEVELS;
const grid = ctx.EXBLOCK_GRID;

const cellsOf = (b) => b.cells || Array.from({ length: b.w * b.h }, (_, i) => [b.c + (i % b.w), b.r + Math.floor(i / b.w)]);
const TYPES = new Set(['red', 'blue', 'yellow', 'green', 'purple', 'red-s', 'blue-s', 'yellow-s', 'purple-s', 'green-s', 'silver-s', 'metal']);

// Referans karelerinde sayılan blok adetleri.
const expected = { 'stage-1': 32, 'stage-2': 46, spiral: 35, 'stage-4': 29, 'green-symmetric': 57 };

for (const lv of levels) {
  const seen = new Map();
  for (const b of lv.bricks) {
    assert(TYPES.has(b.t), `${lv.id}: bilinmeyen tür ${b.t}`);
    for (const [c, r] of cellsOf(b)) {
      assert(c >= 0 && c < grid.cols && r >= 0 && r < 10, `${lv.id}: alan dışı hücre ${c},${r}`);
      const key = c + ',' + r;
      assert(!seen.has(key), `${lv.id}: çakışan hücre ${key}`);
      seen.set(key, b.t);
    }
  }
  assert.strictEqual(lv.bricks.length, expected[lv.id], `${lv.id}: blok sayısı`);
  // Spiral dışındaki gözlenen haritalar yatayda simetrik (şekil olarak).
  if (lv.id === 'spiral') { console.log(`ok ${lv.id}: ${lv.bricks.length} blok, ${seen.size} hücre`); continue; }
  for (const key of seen.keys()) {
    const [c, r] = key.split(',').map(Number);
    assert(seen.has(grid.cols - 1 - c + ',' + r), `${lv.id}: simetri bozuk ${key}`);
  }
  console.log(`ok ${lv.id}: ${lv.bricks.length} blok, ${seen.size} hücre`);
}
