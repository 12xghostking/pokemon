const test = require('node:test');
const assert = require('node:assert');
const TypeChart = require('../src/data/typeChart');

test('TypeChart - single type effectiveness', () => {
  assert.strictEqual(TypeChart.getSingleTypeEffectiveness('Fire', 'Grass'), 2);
  assert.strictEqual(TypeChart.getSingleTypeEffectiveness('Water', 'Fire'), 2);
  assert.strictEqual(TypeChart.getSingleTypeEffectiveness('Electric', 'Ground'), 0);
  assert.strictEqual(TypeChart.getSingleTypeEffectiveness('Ghost', 'Normal'), 0);
  assert.strictEqual(TypeChart.getSingleTypeEffectiveness('Fire', 'Water'), 0.5);
  assert.strictEqual(TypeChart.getSingleTypeEffectiveness('Normal', 'Normal'), 1);
});

test('TypeChart - dual type effectiveness', () => {
  // Grass/Poison vs Fire: Grass is 2x, Poison is 1x => total 2x
  assert.strictEqual(TypeChart.getTypeEffectiveness('Fire', ['Grass', 'Poison']), 2);

  // Grass/Bug vs Fire: Grass is 2x, Bug is 2x => total 4x
  assert.strictEqual(TypeChart.getTypeEffectiveness('Fire', ['Grass', 'Bug']), 4);

  // Water/Ground vs Electric: Water is 2x, Ground is 0x => total 0x
  assert.strictEqual(TypeChart.getTypeEffectiveness('Electric', ['Water', 'Ground']), 0);
});

test('TypeChart - effectiveness feedback text', () => {
  assert.strictEqual(TypeChart.getEffectivenessText(2), "It's super effective!");
  assert.strictEqual(TypeChart.getEffectivenessText(4), "It's super effective!");
  assert.strictEqual(TypeChart.getEffectivenessText(0.5), "It's not very effective...");
  assert.strictEqual(TypeChart.getEffectivenessText(0), "It had no effect!");
  assert.strictEqual(TypeChart.getEffectivenessText(1), "");
});

test('TypeChart - type color codes exist', () => {
  TypeChart.TYPES.forEach(t => {
    const color = TypeChart.getTypeColor(t);
    assert.match(color, /^#[0-9A-Fa-f]{6}$/, `Color for ${t} should be hex`);
  });
});
