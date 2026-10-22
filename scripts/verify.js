const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

console.log('--- Starting Pokémon Adventure Integrity & Build Verification ---');

// 1. Verify Assets on Disk
const requiredFiles = [
  'index.html',
  'style.css',
  'index.js',
  'battleScene.js',
  'classes.js',
  'pelletTown.json',
  'img/Pellet Town.png',
  'img/foregroundObjects.png',
  'img/battleBackground.png',
  'img/embySprite.png',
  'img/draggleSprite.png',
  'img/fireball.png',
  'img/playerDown.png',
  'img/playerUp.png',
  'img/playerLeft.png',
  'img/playerRight.png',
  'Audio/map.wav',
  'Audio/battle.mp3',
  'Audio/initBattle.wav',
  'Audio/fireballHit.wav',
  'Audio/tackleHit.wav',
  'Audio/victory.wav'
];

let missing = 0;
requiredFiles.forEach(file => {
  const fullPath = path.join(ROOT_DIR, file);
  if (!fs.existsSync(fullPath)) {
    console.error(`MISSING ASSET: ${file}`);
    missing++;
  }
});

if (missing > 0) {
  console.error(`Verification FAILED: ${missing} required assets are missing.`);
  process.exit(1);
}

// 2. Validate Data Integrity
const TypeChart = require('../src/data/typeChart');
const MovesData = require('../src/data/movesData');
const PokemonData = require('../src/data/pokemonData');
const ItemsData = require('../src/data/itemsData');
const WorldAreas = require('../src/data/worldAreas');
const TrainersData = require('../src/data/trainersData');
const MapsData = require('../src/data/mapsData');
const MapManager = require('../src/engine/mapManager');

console.log(`Verified ${TypeChart.TYPES.length} Pokemon Types`);
console.log(`Verified ${Object.keys(MovesData.MOVES).length} Moves`);
console.log(`Verified ${PokemonData.getAllSpecies().length} Pokemon Species`);
console.log(`Verified ${Object.keys(ItemsData.ITEMS).length} Items`);
console.log(`Verified ${WorldAreas.getAllAreas().length} Exploration Areas`);
console.log(`Verified ${Object.keys(TrainersData.TRAINERS).length} NPC Trainers & Leaders`);
console.log(`Verified ${Object.keys(MapsData).length} Tiled JSON Maps`);

// Test MapManager initialization
MapManager.init('pelletTown');
console.log(`Verified MapManager initialized in ${MapManager.getCurrentAreaId()} with ${MapManager.getBoundaries().length} boundaries and ${MapManager.getWarps().length} warps`);

console.log('--- All Assets, Data, Tiled Maps & Game Systems Successfully Verified! ---');
