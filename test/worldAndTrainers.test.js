const test = require('node:test');
const assert = require('node:assert');
const WorldAreas = require('../src/data/worldAreas');
const TrainersData = require('../src/data/trainersData');
const PokemonData = require('../src/data/pokemonData');

test('WorldAreas - all 7 areas are defined with valid encounter pools', () => {
  const areas = WorldAreas.getAllAreas();
  assert.strictEqual(areas.length, 7, 'Must have 7 world exploration areas');

  areas.forEach(a => {
    assert.ok(a.id);
    assert.ok(a.name);
    assert.ok(Array.isArray(a.levelRange) && a.levelRange.length === 2);
    assert.ok(a.levelRange[0] <= a.levelRange[1]);
    assert.ok(Array.isArray(a.encounterPool) && a.encounterPool.length > 0);

    // Verify all species in pool exist
    a.encounterPool.forEach(item => {
      assert.ok(item.weight > 0);
      const sp = PokemonData.getPokemonSpecies(item.speciesId);
      assert.ok(sp, `Species ${item.speciesId} in area ${a.id} must exist in PokemonData`);
    });
  });
});

test('WorldAreas - pickWildEncounter returns valid level-bounded Pokémon instance', () => {
  const wildPk = WorldAreas.pickWildEncounter('verdantRoute', PokemonData);
  assert.ok(wildPk);
  assert.ok(wildPk.level >= 4 && wildPk.level <= 8, `Level ${wildPk.level} must be between 4 and 8`);
  assert.strictEqual(wildPk.caughtLocation, 'Verdant Route');
});

test('TrainersData - all trainers have valid teams and rewards', () => {
  const trainerIds = Object.keys(TrainersData.TRAINERS);
  assert.ok(trainerIds.length >= 6);

  trainerIds.forEach(id => {
    const t = TrainersData.getTrainer(id);
    assert.ok(t.name);
    assert.ok(t.rewardCoins > 0);
    assert.ok(Array.isArray(t.team) && t.team.length >= 1 && t.team.length <= 6);

    const teamInstances = TrainersData.createTrainerTeam(id, PokemonData);
    assert.strictEqual(teamInstances.length, t.team.length);
    teamInstances.forEach(member => {
      assert.ok(member.maxHp > 0);
      assert.strictEqual(member.currentHp, member.maxHp);
      assert.ok(member.moves.length > 0);
    });
  });
});
