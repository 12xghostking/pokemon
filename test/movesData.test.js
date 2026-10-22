const test = require('node:test');
const assert = require('node:assert');
const MovesData = require('../src/data/movesData');
const TypeChart = require('../src/data/typeChart');

test('MovesData - all moves have valid attributes and types', () => {
  const moveIds = Object.keys(MovesData.MOVES);
  assert.ok(moveIds.length >= 30, 'Should have at least 30 moves defined');

  moveIds.forEach(id => {
    const move = MovesData.getMove(id);
    assert.strictEqual(move.id, id);
    assert.ok(move.name);
    assert.ok(TypeChart.TYPES.includes(move.type), `Move ${id} has invalid type ${move.type}`);
    assert.ok(['physical', 'special', 'status'].includes(move.category), `Move ${id} has invalid category`);
    assert.ok(typeof move.power === 'number');
    assert.ok(typeof move.accuracy === 'number' && move.accuracy > 0 && move.accuracy <= 100);
    assert.ok(typeof move.maxPp === 'number' && move.maxPp > 0);
  });
});

test('MovesData - Struggle recoil configuration', () => {
  const struggle = MovesData.getMove('Struggle');
  assert.strictEqual(struggle.name, 'Struggle');
  assert.ok(struggle.effect && struggle.effect.recoilPercent > 0);
});
