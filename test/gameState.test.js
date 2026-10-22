const test = require('node:test');
const assert = require('node:assert');
const GameState = require('../src/core/gameState');
const PokemonData = require('../src/data/pokemonData');

test('GameState - Party capacity limit of 6 and box overflow', () => {
  const state = GameState.resetGame(PokemonData);
  assert.strictEqual(state.party.length, 1); // Started with Emby

  // Add 5 more to reach 6
  for (let i = 0; i < 5; i++) {
    const pk = PokemonData.createPokemonInstance('Pidgey', 3 + i);
    const res = GameState.addPokemon(pk);
    assert.strictEqual(res.location, 'party');
  }
  assert.strictEqual(state.party.length, 6);

  // 7th Pokémon must go to storage box
  const seventh = PokemonData.createPokemonInstance('Pikachu', 5);
  const resSeventh = GameState.addPokemon(seventh);
  assert.strictEqual(resSeventh.location, 'box');
  assert.strictEqual(state.party.length, 6);
  assert.strictEqual(state.box.length, 1);
});

test('GameState - Inventory add and atomic remove', () => {
  GameState.resetGame(PokemonData);

  GameState.addItem('pokeBall', 3);
  const initial = GameState.getItemCount('pokeBall');
  assert.ok(initial >= 3);

  const removed = GameState.removeItem('pokeBall', 2);
  assert.strictEqual(removed, true);
  assert.strictEqual(GameState.getItemCount('pokeBall'), initial - 2);

  // Cannot remove more than available
  const overRemoved = GameState.removeItem('pokeBall', 9999);
  assert.strictEqual(overRemoved, false);
});

test('GameState - Currency operations', () => {
  GameState.resetGame(PokemonData);
  const coins = GameState.addCoins(500);
  assert.strictEqual(coins, 1500);

  const spent = GameState.removeCoins(600);
  assert.strictEqual(spent, true);
  assert.strictEqual(GameState.getState().player.coins, 900);

  const overspent = GameState.removeCoins(10000);
  assert.strictEqual(overspent, false);
  assert.strictEqual(GameState.getState().player.coins, 900);
});

test('GameState - Pokédex tracking', () => {
  GameState.resetGame(PokemonData);

  GameState.recordPokedexEncounter('Draggle');
  let entry = GameState.getState().pokedex.Draggle;
  assert.strictEqual(entry.seen, true);
  assert.strictEqual(entry.caught, false);

  GameState.recordPokedexCatch('Draggle');
  entry = GameState.getState().pokedex.Draggle;
  assert.strictEqual(entry.seen, true);
  assert.strictEqual(entry.caught, true);
  assert.strictEqual(entry.countCaught, 1);
});

test('GameState - Achievements and duplicate claim prevention', () => {
  GameState.resetGame(PokemonData);

  const unlocked = GameState.triggerAchievement('first_catch');
  assert.strictEqual(unlocked, true);

  // Second trigger should return false (already unlocked)
  const duplicateUnlock = GameState.triggerAchievement('first_catch');
  assert.strictEqual(duplicateUnlock, false);

  // Claim reward
  const initialCoins = GameState.getState().player.coins;
  const claimed = GameState.claimAchievementReward('first_catch', 500, 'greatBall', 2);
  assert.strictEqual(claimed, true);
  assert.strictEqual(GameState.getState().player.coins, initialCoins + 500);
  assert.strictEqual(GameState.getItemCount('greatBall'), 2);

  // Duplicate claim must fail
  const duplicateClaim = GameState.claimAchievementReward('first_catch', 500, 'greatBall', 2);
  assert.strictEqual(duplicateClaim, false);
});

test('GameState - Export and import backup', () => {
  GameState.resetGame(PokemonData);
  GameState.addCoins(1234);

  const exported = GameState.exportSave();
  assert.ok(typeof exported === 'string');

  // Modify current state
  GameState.addCoins(5000);

  // Import old state
  const res = GameState.importSave(exported, PokemonData);
  assert.strictEqual(res.success, true);
  assert.strictEqual(GameState.getState().player.coins, 2234); // 1000 start + 1234
});
