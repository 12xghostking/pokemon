const test = require('node:test');
const assert = require('node:assert');
const MapsData = require('../src/data/mapsData');
const MapManager = require('../src/engine/mapManager');
const WorldAreas = require('../src/data/worldAreas');

test('MapsData - all 7 exploration maps are defined with valid Tiled JSON schemas', () => {
  const areaIds = ['pelletTown', 'verdantRoute', 'whisperingWoods', 'emberCrag', 'ceruleanCoast', 'hauntedCrypt', 'indigoSummit'];

  areaIds.forEach(id => {
    const map = MapsData[id];
    assert.ok(map, `Map ${id} must exist in MapsData`);
    assert.strictEqual(map.width, 70, `Map ${id} width should be 70 tiles`);
    assert.strictEqual(map.height, 40, `Map ${id} height should be 40 tiles`);
    assert.strictEqual(map.tilewidth, 12, `Map ${id} tilewidth should be 12 px`);
    assert.strictEqual(map.tileheight, 12, `Map ${id} tileheight should be 12 px`);
    assert.ok(Array.isArray(map.layers), `Map ${id} should have layers array`);
    assert.ok(map.layers.length >= 4, `Map ${id} should have at least 4 layers`);
  });
});

test('MapManager - loads map, boundaries, battle zones, and warps', () => {
  MapManager.init('verdantRoute');

  assert.strictEqual(MapManager.getCurrentAreaId(), 'verdantRoute');

  const boundaries = MapManager.getBoundaries();
  assert.ok(boundaries.length > 0, 'Verdant Route must have collision boundaries');

  const battleZones = MapManager.getBattleZones();
  assert.ok(battleZones.length > 0, 'Verdant Route must have tall grass battle zones');

  const warps = MapManager.getWarps();
  assert.ok(warps.length >= 2, 'Verdant Route must have connecting route exits / warps');

  // Verify all warp targets exist in WorldAreas
  warps.forEach(w => {
    const target = WorldAreas.getArea(w.targetArea);
    assert.ok(target, `Warp target area ${w.targetArea} must exist in WorldAreas`);
    assert.ok(typeof w.spawnX === 'number' && typeof w.spawnY === 'number', 'Warp must define spawn coordinates');
  });
});

test('MapManager - Pellet Town connects to Verdant Route and Cerulean Coast', () => {
  MapManager.init('pelletTown');

  const warps = MapManager.getWarps();
  const northWarp = warps.find(w => w.direction === 'north');
  assert.ok(northWarp, 'Pellet Town must have a north warp exit');
  assert.strictEqual(northWarp.targetArea, 'verdantRoute');

  const eastWarp = warps.find(w => w.direction === 'east');
  assert.ok(eastWarp, 'Pellet Town must have an east warp exit');
  assert.strictEqual(eastWarp.targetArea, 'ceruleanCoast');
});
