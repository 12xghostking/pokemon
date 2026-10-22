const test = require('node:test');
const assert = require('node:assert');
const BattleTower = require('../src/engine/battleTower');

test('BattleTower - opponent generation scales with floor', () => {
  const floor1 = BattleTower.generateTowerOpponent(1);
  assert.strictEqual(floor1.floor, 1);
  assert.strictEqual(floor1.isBoss, false);
  assert.strictEqual(floor1.team.length, 1);
  assert.strictEqual(floor1.team[0].level, 15);

  const floor5 = BattleTower.generateTowerOpponent(5);
  assert.strictEqual(floor5.floor, 5);
  assert.strictEqual(floor5.isBoss, true, 'Floor 5 should be a Boss floor');

  const floor15 = BattleTower.generateTowerOpponent(15);
  assert.strictEqual(floor15.team.length, 3);
  assert.ok(floor15.team[0].level >= 38);
});

test('BattleTower - reward calculation', () => {
  const r1 = BattleTower.calculateFloorRewards(1);
  assert.strictEqual(r1.coins, 450); // 300 + 1 * 150
  assert.strictEqual(r1.items.length, 0);

  const r5 = BattleTower.calculateFloorRewards(5);
  assert.strictEqual(r5.coins, 1050); // 300 + 5 * 150
  assert.ok(r5.items.some(i => i.itemId === 'rareCandy'));

  const r10 = BattleTower.calculateFloorRewards(10);
  assert.ok(r10.items.some(i => i.itemId === 'ultraBall'));
});
