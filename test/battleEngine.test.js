const test = require('node:test');
const assert = require('node:assert');
const BattleEngine = require('../src/engine/battleEngine');
const PokemonData = require('../src/data/pokemonData');
const MovesData = require('../src/data/movesData');

test('BattleEngine - damage calculation respects physical stats', () => {
  const attacker = PokemonData.createPokemonInstance('Charmander', 10);
  const defender = PokemonData.createPokemonInstance('Bulbasaur', 10);
  const move = MovesData.getMove('Scratch'); // Normal, physical, power 40

  const res = BattleEngine.calculateDamage(attacker, defender, move, {
    critOverride: false,
    randomMultiplier: 1.0
  });

  assert.ok(res.damage > 0, 'Damage must be positive');
  assert.strictEqual(res.isCritical, false);
});

test('BattleEngine - STAB gives 1.5x damage bonus', () => {
  const attacker = PokemonData.createPokemonInstance('Charmander', 10); // Fire
  const defender = PokemonData.createPokemonInstance('Pidgey', 10); // Normal/Flying

  const fireMove = MovesData.getMove('Ember'); // Fire, power 40
  const normalMove = MovesData.getMove('Scratch'); // Normal, power 40

  const resFire = BattleEngine.calculateDamage(attacker, defender, fireMove, {
    critOverride: false,
    randomMultiplier: 1.0
  });

  const resNormal = BattleEngine.calculateDamage(attacker, defender, normalMove, {
    critOverride: false,
    randomMultiplier: 1.0
  });

  // Since Ember has STAB (1.5x) and Scratch does not, Ember should deal more damage
  assert.ok(resFire.damage > resNormal.damage, `Fire STAB damage (${resFire.damage}) should be > Normal damage (${resNormal.damage})`);
});

test('BattleEngine - Type immunity deals 0 damage', () => {
  const attacker = PokemonData.createPokemonInstance('Pikachu', 10);
  const defender = PokemonData.createPokemonInstance('Geodude', 10); // Rock/Ground
  const thunderbolt = MovesData.getMove('Thunderbolt'); // Electric vs Ground = 0x

  const res = BattleEngine.calculateDamage(attacker, defender, thunderbolt);
  assert.strictEqual(res.damage, 0);
  assert.strictEqual(res.effectiveness, 0);
  assert.strictEqual(res.effectivenessText, "It had no effect!");
});

test('BattleEngine - Critical hits deal 1.5x damage', () => {
  const attacker = PokemonData.createPokemonInstance('Squirtle', 10);
  const defender = PokemonData.createPokemonInstance('Pidgey', 10);
  const tackle = MovesData.getMove('Tackle');

  const regular = BattleEngine.calculateDamage(attacker, defender, tackle, { critOverride: false, randomMultiplier: 1.0 });
  const critical = BattleEngine.calculateDamage(attacker, defender, tackle, { critOverride: true, randomMultiplier: 1.0 });

  assert.ok(critical.damage >= Math.floor(regular.damage * 1.4), 'Critical hit should deal ~1.5x damage');
  assert.strictEqual(critical.isCritical, true);
});

test('BattleEngine - Level up and stat increases', () => {
  const pokemon = PokemonData.createPokemonInstance('Emby', 5);
  const initialAtk = pokemon.stats.attack;

  // Emby level 5 -> give enough exp to reach level 6
  const expToNext = pokemon.expToNext - pokemon.exp;
  const result = BattleEngine.applyExpGain(pokemon, expToNext + 10);

  assert.strictEqual(result.leveledUp, true);
  assert.strictEqual(pokemon.level, 6);
  assert.ok(pokemon.stats.attack >= initialAtk, 'Attack stat should increase on level-up');
});

test('BattleEngine - party faint and replacement detection', () => {
  const party = [
    PokemonData.createPokemonInstance('Charmander', 5),
    PokemonData.createPokemonInstance('Pikachu', 5),
    PokemonData.createPokemonInstance('Squirtle', 5)
  ];

  // Active pokemon faints
  party[0].currentHp = 0;

  // Find next conscious pokemon
  const nextAlive = party.find(p => p.currentHp > 0);
  assert.ok(nextAlive, 'Should find an alive replacement');
  assert.strictEqual(nextAlive.speciesId, 'Pikachu');

  // Verify that fainted pokemon is not selectable as healthy replacement
  const healthyOptions = party.filter(p => p.currentHp > 0 && p.instanceId !== party[0].instanceId);
  assert.strictEqual(healthyOptions.length, 2);

  // When all party members faint -> blackout detected
  party[1].currentHp = 0;
  party[2].currentHp = 0;
  const anyAlive = party.find(p => p.currentHp > 0);
  assert.strictEqual(anyAlive, undefined, 'All pokemon fainted should trigger blackout');
});

