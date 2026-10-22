const fs = require('fs');
const path = require('path');

const MAPS_DIR = path.join(__dirname, '..', 'maps');
if (!fs.existsSync(MAPS_DIR)) {
  fs.mkdirSync(MAPS_DIR, { recursive: true });
}

const WIDTH = 70;
const HEIGHT = 40;
const TOTAL_TILES = WIDTH * HEIGHT;

/**
 * Common Tileset GIDs (from Tiled/tileset.png):
 * 12x12 px tiles, 32 columns x 32 rows
 */
const TILE = {
  EMPTY: 0,
  GRASS_BASE: 212,
  GRASS_ALT: 213,
  DIRT_PATH: 180,
  DIRT_EDGE_T: 244,
  DIRT_EDGE_B: 245,
  WATER_DEEP: 439,
  WATER_SHALLOW: 471,
  WATER_EDGE_T: 440,
  WATER_EDGE_B: 472,
  WATER_EDGE_L: 503,
  WATER_EDGE_R: 504,
  TREE_TOP_L: 258,
  TREE_TOP_R: 259,
  TREE_BOT_L: 290,
  TREE_BOT_R: 291,
  TREE_TRUNK_L: 322,
  TREE_TRUNK_R: 323,
  TREE_SHADOW_L: 354,
  TREE_SHADOW_R: 355,
  PINE_TREE: 358,
  FLOWERS_RED: 425,
  FLOWERS_YELLOW: 426,
  TALL_GRASS: 468,
  TALL_GRASS_DENSE: 469,
  ROCK_SMALL: 838,
  ROCK_LARGE: 839,
  WOOD_FENCE: 56,
  STONE_BRICK: 550,
  COLLISION: 1025,
  BATTLE_ZONE: 1025
};

function createLayer(name, id, type = 'tilelayer', initialGid = 0) {
  return {
    id,
    name,
    type,
    visible: true,
    opacity: 1,
    x: 0,
    y: 0,
    width: WIDTH,
    height: HEIGHT,
    data: new Array(TOTAL_TILES).fill(initialGid)
  };
}

function setTile(layer, x, y, gid) {
  if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
    layer.data[y * WIDTH + x] = gid;
  }
}

function fillRect(layer, x1, y1, w, h, gid) {
  for (let y = y1; y < y1 + h; y++) {
    for (let x = x1; x < x1 + w; x++) {
      setTile(layer, x, y, gid);
    }
  }
}

function stampTree(foliageLayer, collLayer, x, y) {
  setTile(foliageLayer, x, y, TILE.TREE_TOP_L);
  setTile(foliageLayer, x + 1, y, TILE.TREE_TOP_R);
  setTile(foliageLayer, x, y + 1, TILE.TREE_BOT_L);
  setTile(foliageLayer, x + 1, y + 1, TILE.TREE_BOT_R);
  setTile(foliageLayer, x, y + 2, TILE.TREE_TRUNK_L);
  setTile(foliageLayer, x + 1, y + 2, TILE.TREE_TRUNK_R);
  setTile(foliageLayer, x, y + 3, TILE.TREE_SHADOW_L);
  setTile(foliageLayer, x + 1, y + 3, TILE.TREE_SHADOW_R);
  // Collision at base
  setTile(collLayer, x, y + 2, TILE.COLLISION);
  setTile(collLayer, x + 1, y + 2, TILE.COLLISION);
  setTile(collLayer, x, y + 3, TILE.COLLISION);
  setTile(collLayer, x + 1, y + 3, TILE.COLLISION);
}

function stampDenseForestBorder(foliageLayer, collLayer) {
  // Border perimeter trees
  for (let x = 0; x < WIDTH; x += 2) {
    // Top border (except path)
    if (x < 28 || x > 40) {
      stampTree(foliageLayer, collLayer, x, 0);
      stampTree(foliageLayer, collLayer, x, 3);
    }
    // Bottom border (except path)
    if (x < 28 || x > 40) {
      stampTree(foliageLayer, collLayer, x, HEIGHT - 5);
      stampTree(foliageLayer, collLayer, x, HEIGHT - 3);
    }
  }
  for (let y = 0; y < HEIGHT; y += 3) {
    if (y < 15 || y > 24) {
      stampTree(foliageLayer, collLayer, 0, y);
      stampTree(foliageLayer, collLayer, 2, y);
      stampTree(foliageLayer, collLayer, WIDTH - 4, y);
      stampTree(foliageLayer, collLayer, WIDTH - 2, y);
    }
  }
}

// -------------------------------------------------------------
// 1. Pellet Town (Copy with Enhanced Warp Layer & Metadata)
// -------------------------------------------------------------
function buildPelletTown() {
  const original = require('../pelletTown.json');
  const map = JSON.parse(JSON.stringify(original));

  map.id = 'pelletTown';
  map.name = 'Pellet Town';
  map.properties = {
    themeColor: '#4CAF50',
    weather: 'none',
    bgm: 'map',
    subtitle: 'A tranquil coastal settlement of new beginnings',
    exits: [
      { direction: 'north', targetArea: 'verdantRoute', x: 28, y: 0, width: 14, height: 2, spawnX: 34, spawnY: 36 },
      { direction: 'east', targetArea: 'ceruleanCoast', x: 67, y: 16, width: 3, height: 8, spawnX: 5, spawnY: 20 }
    ]
  };

  fs.writeFileSync(path.join(MAPS_DIR, 'pelletTown.json'), JSON.stringify(map, null, 2));
  console.log('✔ Built maps/pelletTown.json');
}

// -------------------------------------------------------------
// 2. Verdant Route (Route 1 - Rolling Meadows, Fences & Trails)
// -------------------------------------------------------------
function buildVerdantRoute() {
  const terrain = createLayer('Terrain', 1, 'tilelayer', TILE.GRASS_BASE);
  const paths = createLayer('Paths', 2, 'tilelayer', 0);
  const foliage = createLayer('Foliage', 3, 'tilelayer', 0);
  const tallGrass = createLayer('Tall Grass', 4, 'tilelayer', 0);
  const collisions = createLayer('Collisions', 5, 'tilelayer', 0);
  const battleZones = createLayer('Battle Zones', 6, 'tilelayer', 0);
  const foreground = createLayer('Foreground Objects', 7, 'tilelayer', 0);

  // Borders
  stampDenseForestBorder(foliage, collisions);

  // Central winding trail from south (30..38) to north (30..38)
  for (let y = 0; y < HEIGHT; y++) {
    const curveOffset = Math.round(Math.sin(y / 6) * 4);
    fillRect(paths, 32 + curveOffset, y, 6, 1, TILE.DIRT_PATH);
  }

  // Cross trail going west and east
  for (let x = 0; x < WIDTH; x++) {
    fillRect(paths, x, 19, 1, 4, TILE.DIRT_PATH);
  }

  // Large tall grass patches (Battle Zones)
  // Left meadow
  fillRect(tallGrass, 10, 8, 16, 8, TILE.TALL_GRASS);
  fillRect(battleZones, 10, 8, 16, 8, TILE.BATTLE_ZONE);

  fillRect(tallGrass, 12, 26, 14, 8, TILE.TALL_GRASS_DENSE);
  fillRect(battleZones, 12, 26, 14, 8, TILE.BATTLE_ZONE);

  // Right meadow
  fillRect(tallGrass, 44, 8, 18, 8, TILE.TALL_GRASS);
  fillRect(battleZones, 44, 8, 18, 8, TILE.BATTLE_ZONE);

  fillRect(tallGrass, 46, 26, 16, 8, TILE.TALL_GRASS);
  fillRect(battleZones, 46, 26, 16, 8, TILE.BATTLE_ZONE);

  // Decorative fences and flowers
  for (let x = 10; x < 26; x += 2) {
    setTile(foliage, x, 7, TILE.WOOD_FENCE);
    setTile(collisions, x, 7, TILE.COLLISION);
  }
  for (let x = 44; x < 60; x += 2) {
    setTile(foliage, x, 7, TILE.WOOD_FENCE);
    setTile(collisions, x, 7, TILE.COLLISION);
  }

  // Scattered flowers
  setTile(foliage, 20, 18, TILE.FLOWERS_RED);
  setTile(foliage, 22, 17, TILE.FLOWERS_YELLOW);
  setTile(foliage, 48, 18, TILE.FLOWERS_RED);
  setTile(foliage, 50, 17, TILE.FLOWERS_YELLOW);

  const map = {
    compressionlevel: -1,
    width: WIDTH,
    height: HEIGHT,
    tilewidth: 12,
    tileheight: 12,
    infinite: false,
    orientation: 'orthogonal',
    renderorder: 'right-down',
    id: 'verdantRoute',
    name: 'Verdant Route',
    properties: {
      themeColor: '#8BC34A',
      weather: 'leaves',
      bgm: 'map',
      subtitle: 'Open grassy plains stretching toward the woods',
      exits: [
        { direction: 'south', targetArea: 'pelletTown', x: 28, y: 38, width: 14, height: 2, spawnX: 34, spawnY: 4 },
        { direction: 'north', targetArea: 'whisperingWoods', x: 28, y: 0, width: 14, height: 2, spawnX: 34, spawnY: 36 },
        { direction: 'west', targetArea: 'emberCrag', x: 0, y: 16, width: 3, height: 8, spawnX: 65, spawnY: 20 },
        { direction: 'east', targetArea: 'ceruleanCoast', x: 67, y: 16, width: 3, height: 8, spawnX: 5, spawnY: 20 }
      ]
    },
    layers: [terrain, paths, foliage, tallGrass, collisions, battleZones, foreground],
    tilesets: [
      { firstgid: 1, source: 'Tiled/pokemonStyleGameTileset.tsx' },
      { firstgid: 1025, source: 'Tiled/collisionTileset.tsx' }
    ]
  };

  fs.writeFileSync(path.join(MAPS_DIR, 'verdantRoute.json'), JSON.stringify(map, null, 2));
  console.log('✔ Built maps/verdantRoute.json');
}

// -------------------------------------------------------------
// 3. Whispering Woods (Ancient Forest & Dense Canopy)
// -------------------------------------------------------------
function buildWhisperingWoods() {
  const terrain = createLayer('Terrain', 1, 'tilelayer', TILE.GRASS_ALT);
  const paths = createLayer('Paths', 2, 'tilelayer', 0);
  const foliage = createLayer('Foliage', 3, 'tilelayer', 0);
  const tallGrass = createLayer('Tall Grass', 4, 'tilelayer', 0);
  const collisions = createLayer('Collisions', 5, 'tilelayer', 0);
  const battleZones = createLayer('Battle Zones', 6, 'tilelayer', 0);
  const foreground = createLayer('Foreground Objects', 7, 'tilelayer', 0);

  // Extra heavy border
  stampDenseForestBorder(foliage, collisions);

  // Interior dense clusters of trees creating maze-like corridors
  for (let x = 8; x < 26; x += 3) {
    for (let y = 8; y < 28; y += 4) {
      stampTree(foliage, collisions, x, y);
    }
  }
  for (let x = 44; x < 62; x += 3) {
    for (let y = 8; y < 28; y += 4) {
      stampTree(foliage, collisions, x, y);
    }
  }

  // Winding dirt trail through woods
  for (let y = 0; y < HEIGHT; y++) {
    const curve = Math.round(Math.sin(y / 4) * 6);
    fillRect(paths, 32 + curve, y, 5, 1, TILE.DIRT_PATH);
  }

  // Large patches of wild tall grass
  fillRect(tallGrass, 28, 6, 8, 8, TILE.TALL_GRASS_DENSE);
  fillRect(battleZones, 28, 6, 8, 8, TILE.BATTLE_ZONE);

  fillRect(tallGrass, 36, 16, 7, 10, TILE.TALL_GRASS_DENSE);
  fillRect(battleZones, 36, 16, 7, 10, TILE.BATTLE_ZONE);

  fillRect(tallGrass, 26, 26, 8, 8, TILE.TALL_GRASS_DENSE);
  fillRect(battleZones, 26, 26, 8, 8, TILE.BATTLE_ZONE);

  const map = {
    compressionlevel: -1,
    width: WIDTH,
    height: HEIGHT,
    tilewidth: 12,
    tileheight: 12,
    infinite: false,
    orientation: 'orthogonal',
    renderorder: 'right-down',
    id: 'whisperingWoods',
    name: 'Whispering Woods',
    properties: {
      themeColor: '#2E7D32',
      weather: 'leaves',
      bgm: 'map',
      subtitle: 'Ancient canopy where insect and forest Pokémon dwell',
      exits: [
        { direction: 'south', targetArea: 'verdantRoute', x: 28, y: 38, width: 14, height: 2, spawnX: 34, spawnY: 4 },
        { direction: 'north', targetArea: 'hauntedCrypt', x: 28, y: 0, width: 14, height: 2, spawnX: 34, spawnY: 36 }
      ]
    },
    layers: [terrain, paths, foliage, tallGrass, collisions, battleZones, foreground],
    tilesets: [
      { firstgid: 1, source: 'Tiled/pokemonStyleGameTileset.tsx' },
      { firstgid: 1025, source: 'Tiled/collisionTileset.tsx' }
    ]
  };

  fs.writeFileSync(path.join(MAPS_DIR, 'whisperingWoods.json'), JSON.stringify(map, null, 2));
  console.log('✔ Built maps/whisperingWoods.json');
}

// -------------------------------------------------------------
// 4. Ember Crag (Volcanic Cliffs & Smoldering Caverns)
// -------------------------------------------------------------
function buildEmberCrag() {
  const terrain = createLayer('Terrain', 1, 'tilelayer', TILE.DIRT_PATH);
  const paths = createLayer('Paths', 2, 'tilelayer', 0);
  const foliage = createLayer('Foliage', 3, 'tilelayer', 0);
  const tallGrass = createLayer('Tall Grass', 4, 'tilelayer', 0);
  const collisions = createLayer('Collisions', 5, 'tilelayer', 0);
  const battleZones = createLayer('Battle Zones', 6, 'tilelayer', 0);
  const foreground = createLayer('Foreground Objects', 7, 'tilelayer', 0);

  // Surrounding rock cliff borders
  for (let x = 0; x < WIDTH; x++) {
    if (x < 30 || x > 40) {
      setTile(foliage, x, 0, TILE.ROCK_LARGE);
      setTile(foliage, x, 1, TILE.ROCK_LARGE);
      setTile(collisions, x, 0, TILE.COLLISION);
      setTile(collisions, x, 1, TILE.COLLISION);

      setTile(foliage, x, HEIGHT - 2, TILE.ROCK_LARGE);
      setTile(foliage, x, HEIGHT - 1, TILE.ROCK_LARGE);
      setTile(collisions, x, HEIGHT - 2, TILE.COLLISION);
      setTile(collisions, x, HEIGHT - 1, TILE.COLLISION);
    }
  }
  for (let y = 0; y < HEIGHT; y++) {
    if (y < 16 || y > 24) {
      setTile(foliage, 0, y, TILE.ROCK_LARGE);
      setTile(foliage, 1, y, TILE.ROCK_LARGE);
      setTile(collisions, 0, y, TILE.COLLISION);
      setTile(collisions, 1, y, TILE.COLLISION);
    }
  }

  // Jagged boulders & lava channels across the crag
  for (let y = 4; y < HEIGHT - 4; y += 5) {
    fillRect(foliage, 10, y, 16, 2, TILE.ROCK_SMALL);
    fillRect(collisions, 10, y, 16, 2, TILE.COLLISION);

    fillRect(foliage, 44, y, 16, 2, TILE.ROCK_SMALL);
    fillRect(collisions, 44, y, 16, 2, TILE.COLLISION);
  }

  // Crag Encounter Zones (Smoldering Ash Grass)
  fillRect(tallGrass, 12, 10, 12, 8, TILE.TALL_GRASS_DENSE);
  fillRect(battleZones, 12, 10, 12, 8, TILE.BATTLE_ZONE);

  fillRect(tallGrass, 46, 20, 12, 8, TILE.TALL_GRASS_DENSE);
  fillRect(battleZones, 46, 20, 12, 8, TILE.BATTLE_ZONE);

  fillRect(tallGrass, 28, 16, 14, 8, TILE.TALL_GRASS);
  fillRect(battleZones, 28, 16, 14, 8, TILE.BATTLE_ZONE);

  const map = {
    compressionlevel: -1,
    width: WIDTH,
    height: HEIGHT,
    tilewidth: 12,
    tileheight: 12,
    infinite: false,
    orientation: 'orthogonal',
    renderorder: 'right-down',
    id: 'emberCrag',
    name: 'Ember Crag & Caverns',
    properties: {
      themeColor: '#E65100',
      weather: 'embers',
      bgm: 'map',
      subtitle: 'Smoldering volcanic rocks and steep jagged cliffs',
      exits: [
        { direction: 'east', targetArea: 'verdantRoute', x: 67, y: 16, width: 3, height: 8, spawnX: 4, spawnY: 20 },
        { direction: 'north', targetArea: 'indigoSummit', x: 30, y: 0, width: 10, height: 2, spawnX: 35, spawnY: 36 }
      ]
    },
    layers: [terrain, paths, foliage, tallGrass, collisions, battleZones, foreground],
    tilesets: [
      { firstgid: 1, source: 'Tiled/pokemonStyleGameTileset.tsx' },
      { firstgid: 1025, source: 'Tiled/collisionTileset.tsx' }
    ]
  };

  fs.writeFileSync(path.join(MAPS_DIR, 'emberCrag.json'), JSON.stringify(map, null, 2));
  console.log('✔ Built maps/emberCrag.json');
}

// -------------------------------------------------------------
// 5. Cerulean Coast (Sunlit Beach, Pier & Ocean Waves)
// -------------------------------------------------------------
function buildCeruleanCoast() {
  const terrain = createLayer('Terrain', 1, 'tilelayer', TILE.GRASS_BASE);
  const paths = createLayer('Paths', 2, 'tilelayer', 0);
  const foliage = createLayer('Foliage', 3, 'tilelayer', 0);
  const tallGrass = createLayer('Tall Grass', 4, 'tilelayer', 0);
  const collisions = createLayer('Collisions', 5, 'tilelayer', 0);
  const battleZones = createLayer('Battle Zones', 6, 'tilelayer', 0);
  const foreground = createLayer('Foreground Objects', 7, 'tilelayer', 0);

  // Sandy beach & ocean on the right side (columns 45..69)
  for (let x = 40; x < WIDTH; x++) {
    for (let y = 0; y < HEIGHT; y++) {
      if (x < 48) {
        setTile(paths, x, y, TILE.DIRT_PATH); // Sand
      } else {
        setTile(terrain, x, y, TILE.WATER_DEEP); // Ocean
        setTile(collisions, x, y, TILE.COLLISION);
      }
    }
  }

  // Wooden pier jutting into ocean
  for (let x = 45; x < 62; x++) {
    setTile(paths, x, 20, TILE.STONE_BRICK);
    setTile(paths, x, 21, TILE.STONE_BRICK);
    setTile(collisions, x, 20, 0); // Walkable on pier
    setTile(collisions, x, 21, 0);
  }

  // Coastline tall grass
  fillRect(tallGrass, 12, 10, 16, 10, TILE.TALL_GRASS);
  fillRect(battleZones, 12, 10, 16, 10, TILE.BATTLE_ZONE);

  fillRect(tallGrass, 16, 26, 16, 8, TILE.TALL_GRASS);
  fillRect(battleZones, 16, 26, 16, 8, TILE.BATTLE_ZONE);

  // Trees on left border
  for (let y = 0; y < HEIGHT; y += 3) {
    if (y < 16 || y > 24) {
      stampTree(foliage, collisions, 0, y);
      stampTree(foliage, collisions, 2, y);
    }
  }

  const map = {
    compressionlevel: -1,
    width: WIDTH,
    height: HEIGHT,
    tilewidth: 12,
    tileheight: 12,
    infinite: false,
    orientation: 'orthogonal',
    renderorder: 'right-down',
    id: 'ceruleanCoast',
    name: 'Cerulean Coast',
    properties: {
      themeColor: '#0288D1',
      weather: 'mist',
      bgm: 'map',
      subtitle: 'Sun-drenched beaches and deep rolling ocean waves',
      exits: [
        { direction: 'west', targetArea: 'verdantRoute', x: 0, y: 16, width: 3, height: 8, spawnX: 64, spawnY: 20 },
        { direction: 'north', targetArea: 'indigoSummit', x: 20, y: 0, width: 10, height: 2, spawnX: 50, spawnY: 36 }
      ]
    },
    layers: [terrain, paths, foliage, tallGrass, collisions, battleZones, foreground],
    tilesets: [
      { firstgid: 1, source: 'Tiled/pokemonStyleGameTileset.tsx' },
      { firstgid: 1025, source: 'Tiled/collisionTileset.tsx' }
    ]
  };

  fs.writeFileSync(path.join(MAPS_DIR, 'ceruleanCoast.json'), JSON.stringify(map, null, 2));
  console.log('✔ Built maps/ceruleanCoast.json');
}

// -------------------------------------------------------------
// 6. Haunted Crypt (Desolate Ruins & Spectral Fog)
// -------------------------------------------------------------
function buildHauntedCrypt() {
  const terrain = createLayer('Terrain', 1, 'tilelayer', TILE.STONE_BRICK);
  const paths = createLayer('Paths', 2, 'tilelayer', 0);
  const foliage = createLayer('Foliage', 3, 'tilelayer', 0);
  const tallGrass = createLayer('Tall Grass', 4, 'tilelayer', 0);
  const collisions = createLayer('Collisions', 5, 'tilelayer', 0);
  const battleZones = createLayer('Battle Zones', 6, 'tilelayer', 0);
  const foreground = createLayer('Foreground Objects', 7, 'tilelayer', 0);

  // Outer ancient stone walls
  for (let x = 0; x < WIDTH; x++) {
    if (x < 30 || x > 40) {
      setTile(foliage, x, 0, TILE.STONE_BRICK);
      setTile(foliage, x, 1, TILE.STONE_BRICK);
      setTile(collisions, x, 0, TILE.COLLISION);
      setTile(collisions, x, 1, TILE.COLLISION);

      setTile(foliage, x, HEIGHT - 2, TILE.STONE_BRICK);
      setTile(foliage, x, HEIGHT - 1, TILE.STONE_BRICK);
      setTile(collisions, x, HEIGHT - 2, TILE.COLLISION);
      setTile(collisions, x, HEIGHT - 1, TILE.COLLISION);
    }
  }
  for (let y = 0; y < HEIGHT; y++) {
    setTile(foliage, 0, y, TILE.STONE_BRICK);
    setTile(foliage, 1, y, TILE.STONE_BRICK);
    setTile(collisions, 0, y, TILE.COLLISION);
    setTile(collisions, 1, y, TILE.COLLISION);

    setTile(foliage, WIDTH - 2, y, TILE.STONE_BRICK);
    setTile(foliage, WIDTH - 1, y, TILE.STONE_BRICK);
    setTile(collisions, WIDTH - 2, y, TILE.COLLISION);
    setTile(collisions, WIDTH - 1, y, TILE.COLLISION);
  }

  // Tombstones & pillar rows
  for (let x = 10; x < 60; x += 8) {
    for (let y = 6; y < 34; y += 6) {
      setTile(foliage, x, y, TILE.ROCK_LARGE);
      setTile(foliage, x, y + 1, TILE.ROCK_SMALL);
      setTile(collisions, x, y, TILE.COLLISION);
      setTile(collisions, x, y + 1, TILE.COLLISION);
    }
  }

  // Haunted Fog Encounter Zones
  fillRect(tallGrass, 14, 8, 12, 10, TILE.TALL_GRASS_DENSE);
  fillRect(battleZones, 14, 8, 12, 10, TILE.BATTLE_ZONE);

  fillRect(tallGrass, 44, 18, 12, 10, TILE.TALL_GRASS_DENSE);
  fillRect(battleZones, 44, 18, 12, 10, TILE.BATTLE_ZONE);

  const map = {
    compressionlevel: -1,
    width: WIDTH,
    height: HEIGHT,
    tilewidth: 12,
    tileheight: 12,
    infinite: false,
    orientation: 'orthogonal',
    renderorder: 'right-down',
    id: 'hauntedCrypt',
    name: 'Haunted Crypt',
    properties: {
      themeColor: '#4A148C',
      weather: 'fog',
      bgm: 'map',
      subtitle: 'Desolate catacombs cloaked in eerie supernatural mist',
      exits: [
        { direction: 'south', targetArea: 'whisperingWoods', x: 30, y: 38, width: 10, height: 2, spawnX: 35, spawnY: 4 },
        { direction: 'north', targetArea: 'indigoSummit', x: 30, y: 0, width: 10, height: 2, spawnX: 35, spawnY: 36 }
      ]
    },
    layers: [terrain, paths, foliage, tallGrass, collisions, battleZones, foreground],
    tilesets: [
      { firstgid: 1, source: 'Tiled/pokemonStyleGameTileset.tsx' },
      { firstgid: 1025, source: 'Tiled/collisionTileset.tsx' }
    ]
  };

  fs.writeFileSync(path.join(MAPS_DIR, 'hauntedCrypt.json'), JSON.stringify(map, null, 2));
  console.log('✔ Built maps/hauntedCrypt.json');
}

// -------------------------------------------------------------
// 7. Indigo Summit (Champion Battlefield & Sacred Peak)
// -------------------------------------------------------------
function buildIndigoSummit() {
  const terrain = createLayer('Terrain', 1, 'tilelayer', TILE.GRASS_ALT);
  const paths = createLayer('Paths', 2, 'tilelayer', 0);
  const foliage = createLayer('Foliage', 3, 'tilelayer', 0);
  const tallGrass = createLayer('Tall Grass', 4, 'tilelayer', 0);
  const collisions = createLayer('Collisions', 5, 'tilelayer', 0);
  const battleZones = createLayer('Battle Zones', 6, 'tilelayer', 0);
  const foreground = createLayer('Foreground Objects', 7, 'tilelayer', 0);

  // Grand marble battle ring in the center
  fillRect(paths, 22, 10, 26, 20, TILE.STONE_BRICK);

  // Inner Champion platform
  fillRect(paths, 28, 14, 14, 12, TILE.DIRT_PATH);

  // Surrounding marble pillars / statues
  for (let x = 20; x <= 50; x += 6) {
    setTile(foliage, x, 8, TILE.ROCK_LARGE);
    setTile(collisions, x, 8, TILE.COLLISION);

    setTile(foliage, x, 31, TILE.ROCK_LARGE);
    setTile(collisions, x, 31, TILE.COLLISION);
  }

  // High altitude legendary encounter patches
  fillRect(tallGrass, 8, 12, 10, 16, TILE.TALL_GRASS_DENSE);
  fillRect(battleZones, 8, 12, 10, 16, TILE.BATTLE_ZONE);

  fillRect(tallGrass, 52, 12, 10, 16, TILE.TALL_GRASS_DENSE);
  fillRect(battleZones, 52, 12, 10, 16, TILE.BATTLE_ZONE);

  const map = {
    compressionlevel: -1,
    width: WIDTH,
    height: HEIGHT,
    tilewidth: 12,
    tileheight: 12,
    infinite: false,
    orientation: 'orthogonal',
    renderorder: 'right-down',
    id: 'indigoSummit',
    name: 'Indigo Summit & Arena',
    properties: {
      themeColor: '#311B92',
      weather: 'sparkles',
      bgm: 'map',
      subtitle: 'The sacred peak where Pokémon Champions battle',
      exits: [
        { direction: 'south', targetArea: 'hauntedCrypt', x: 28, y: 38, width: 14, height: 2, spawnX: 35, spawnY: 4 }
      ]
    },
    layers: [terrain, paths, foliage, tallGrass, collisions, battleZones, foreground],
    tilesets: [
      { firstgid: 1, source: 'Tiled/pokemonStyleGameTileset.tsx' },
      { firstgid: 1025, source: 'Tiled/collisionTileset.tsx' }
    ]
  };

  fs.writeFileSync(path.join(MAPS_DIR, 'indigoSummit.json'), JSON.stringify(map, null, 2));
  console.log('✔ Built maps/indigoSummit.json');
}

// Generate all maps
buildPelletTown();
buildVerdantRoute();
buildWhisperingWoods();
buildEmberCrag();
buildCeruleanCoast();
buildHauntedCrypt();
buildIndigoSummit();

console.log('All Tiled JSON maps generated successfully!');
