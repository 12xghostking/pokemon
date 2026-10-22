const test = require('node:test');
const assert = require('node:assert');
const CatchEngine = require('../src/engine/catchEngine');
const PokemonData = require('../src/data/pokemonData');
const ItemsData = require('../src/data/itemsData');

test('CatchEngine - Master Ball always captures with 4 shakes', () => {
  const target = PokemonData.createPokemonInstance('Mewtwo', 50);
  const masterBall = ItemsData.getItem('masterBall');

  const res = CatchEngine.calculateCatch(target, masterBall, 'indigoSummit');
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.shakes, 4);
  assert.strictEqual(res.message, 'Gotcha! Mewtwo was caught!');
});

test('CatchEngine - Lower HP increases catch value', () => {
  const targetFull = PokemonData.createPokemonInstance('Pidgey', 5);
  const targetLow = PokemonData.createPokemonInstance('Pidgey', 5);
  targetLow.currentHp = 1;

  const pokeBall = ItemsData.getItem('pokeBall');

  const resFull = CatchEngine.calculateCatch(targetFull, pokeBall, 'verdantRoute');
  const resLow = CatchEngine.calculateCatch(targetLow, pokeBall, 'verdantRoute');

  assert.ok(resLow.captureValue >= resFull.captureValue, 'Lower HP target should have equal or higher capture value');
});

test('CatchEngine - Sleep status increases capture probability', () => {
  const targetNormal = PokemonData.createPokemonInstance('Pikachu', 10);
  const targetAsleep = PokemonData.createPokemonInstance('Pikachu', 10);
  targetAsleep.status = 'SLP';

  const pokeBall = ItemsData.getItem('pokeBall');

  const resNormal = CatchEngine.calculateCatch(targetNormal, pokeBall, 'whisperingWoods');
  const resAsleep = CatchEngine.calculateCatch(targetAsleep, pokeBall, 'whisperingWoods');

  assert.ok(resAsleep.captureValue > resNormal.captureValue, 'Sleeping target should have higher capture value');
});

test('CatchEngine - Deterministic RNG verification', () => {
  const target = PokemonData.createPokemonInstance('Caterpie', 3);
  const pokeBall = ItemsData.getItem('pokeBall');

  // Force RNG to always return 0 (guaranteed success)
  const resSuccess = CatchEngine.calculateCatch(target, pokeBall, 'verdantRoute', {
    rng: () => 0
  });
  assert.strictEqual(resSuccess.success, true);
  assert.strictEqual(resSuccess.shakes, 4);

  // Force RNG to return max 65535 (guaranteed failure on first shake)
  const resFail = CatchEngine.calculateCatch(target, pokeBall, 'verdantRoute', {
    rng: () => 65535
  });
  assert.strictEqual(resFail.success, false);
  assert.strictEqual(resFail.shakes, 0);
  assert.strictEqual(resFail.message, 'Oh no! The Pokémon broke free right away!');
});
