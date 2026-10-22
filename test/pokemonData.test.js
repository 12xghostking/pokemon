const test = require('node:test');
const assert = require('node:assert');
const PokemonData = require('../src/data/pokemonData');
const MovesData = require('../src/data/movesData');

test('PokemonData - all species definitions are valid', () => {
  const speciesList = PokemonData.getAllSpecies();
  assert.ok(speciesList.length >= 35, 'Should have at least 35 species defined');

  speciesList.forEach(p => {
    assert.ok(p.id, 'Species must have an id');
    assert.ok(p.name, 'Species must have a name');
    assert.ok(Array.isArray(p.types) && p.types.length >= 1, `${p.id} must have valid types`);
    assert.ok(p.baseStats, `${p.id} must have baseStats`);
    assert.ok(p.baseStats.hp > 0, `${p.id} hp must be > 0`);
    assert.ok(p.baseStats.attack > 0, `${p.id} attack must be > 0`);
    assert.ok(p.baseStats.defense > 0, `${p.id} defense must be > 0`);
    assert.ok(p.baseStats.spAttack > 0, `${p.id} spAttack must be > 0`);
    assert.ok(p.baseStats.spDefense > 0, `${p.id} spDefense must be > 0`);
    assert.ok(p.baseStats.speed > 0, `${p.id} speed must be > 0`);
    assert.ok(Array.isArray(p.movesByLevel) && p.movesByLevel.length > 0, `${p.id} must have learnable moves`);

    // Verify all moves exist in MovesData
    p.movesByLevel.forEach(m => {
      const moveDef = MovesData.getMove(m.moveId);
      assert.ok(moveDef, `Move ${m.moveId} for ${p.id} must exist in MovesData`);
    });
  });
});

test('PokemonData - stat calculation formula', () => {
  // Base HP 45 at Lv. 5 with IV 15
  // floor(((2 * 45 + 15) * 5) / 100) + 5 + 10 = floor(525 / 100) + 15 = 5 + 15 = 20
  const hp = PokemonData.calculateStat(45, 5, true, 15);
  assert.strictEqual(hp, 20);

  // Attack 52 at Lv. 5 with IV 15
  // floor(((2 * 52 + 15) * 5) / 100) + 5 = floor(595 / 100) + 5 = 5 + 5 = 10
  const atk = PokemonData.calculateStat(52, 5, false, 15);
  assert.strictEqual(atk, 10);
});

test('PokemonData - createPokemonInstance creates complete instance', () => {
  const instance = PokemonData.createPokemonInstance('Charmander', 10, { isShiny: false });
  assert.strictEqual(instance.speciesId, 'Charmander');
  assert.strictEqual(instance.level, 10);
  assert.strictEqual(instance.isShiny, false);
  assert.ok(instance.maxHp > 20);
  assert.strictEqual(instance.currentHp, instance.maxHp);
  assert.ok(instance.moves.length > 0 && instance.moves.length <= 4);
  assert.ok(instance.instanceId.startsWith('pk_'));
});

test('PokemonData - stone evolution map', () => {
  assert.strictEqual(PokemonData.STONE_EVOLUTIONS.Eevee.waterStone, 'Vaporeon');
  assert.strictEqual(PokemonData.STONE_EVOLUTIONS.Eevee.thunderStone, 'Jolteon');
  assert.strictEqual(PokemonData.STONE_EVOLUTIONS.Eevee.fireStone, 'Flareon');
  assert.strictEqual(PokemonData.STONE_EVOLUTIONS.Pikachu.thunderStone, 'Raichu');
});
