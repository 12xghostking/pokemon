const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

// Initialize Core Game State
if (typeof GameState !== 'undefined') {
  GameState.init(PokemonData);
}

// Initialize Particle System
window.particleSystem = new ParticleSystem();

// Initialize Modals & Touch Controls
if (typeof ModalManager !== 'undefined') {
  ModalManager.init();
}
if (typeof TouchControls !== 'undefined') {
  TouchControls.init();
}

const boundaries = [];
const battleZones = [];
const offset = {
  x: -735,
  y: -650
};

// Initialize Map Manager
const initialArea = (typeof GameState !== 'undefined' && GameState.getState().player.currentArea) 
  ? GameState.getState().player.currentArea 
  : 'pelletTown';

if (typeof MapManager !== 'undefined') {
  MapManager.init(initialArea);
}

const image = new Image();
image.src = './img/Pellet Town.png';

const foregroundImage = new Image();
foregroundImage.src = './img/foregroundObjects.png';

const background = new Sprite({
  position: {
    x: offset.x,
    y: offset.y
  },
  image: image
});

const foreground = new Sprite({
  position: {
    x: offset.x,
    y: offset.y
  },
  image: foregroundImage
});

const movables = [background, foreground];

function rebuildSceneBoundaries() {
  boundaries.length = 0;
  battleZones.length = 0;

  if (typeof MapManager !== 'undefined') {
    const mapBounds = MapManager.getBoundaries();
    mapBounds.forEach(b => {
      boundaries.push(
        new Boundary({
          position: {
            x: b.gridX * Boundary.width + offset.x,
            y: b.gridY * Boundary.height + offset.y
          }
        })
      );
    });

    const mapZones = MapManager.getBattleZones();
    mapZones.forEach(z => {
      battleZones.push(
        new Boundary({
          position: {
            x: z.gridX * Boundary.width + offset.x,
            y: z.gridY * Boundary.height + offset.y
          }
        })
      );
    });
  } else {
    // Legacy fallback
    for (let i = 0; i < collisions.length; i += 70) {
      const row = collisions.slice(i, 70 + i);
      const rowIdx = i / 70;
      row.forEach((symbol, colIdx) => {
        if (symbol === 1025) {
          boundaries.push(
            new Boundary({
              position: {
                x: colIdx * Boundary.width + offset.x,
                y: rowIdx * Boundary.height + offset.y
              }
            })
          );
        }
      });
    }

    for (let i = 0; i < battleZonesData.length; i += 70) {
      const row = battleZonesData.slice(i, 70 + i);
      const rowIdx = i / 70;
      row.forEach((symbol, colIdx) => {
        if (symbol === 1025) {
          battleZones.push(
            new Boundary({
              position: {
                x: colIdx * Boundary.width + offset.x,
                y: rowIdx * Boundary.height + offset.y
              }
            })
          );
        }
      });
    }
  }

  movables.length = 0;
  movables.push(background, ...boundaries, foreground, ...battleZones);
}

rebuildSceneBoundaries();

window.repositionToArea = function (targetAreaId, spawn) {
  const spawnCol = spawn && spawn.spawnX !== undefined ? spawn.spawnX : 34;
  const spawnRow = spawn && spawn.spawnY !== undefined ? spawn.spawnY : 20;

  offset.x = -(spawnCol * Boundary.width) + (canvas.width / 2);
  offset.y = -(spawnRow * Boundary.height) + (canvas.height / 2);

  background.position.x = offset.x;
  background.position.y = offset.y;
  foreground.position.x = offset.x;
  foreground.position.y = offset.y;

  rebuildSceneBoundaries();
};

const playerDownImage = new Image();
playerDownImage.src = './img/playerDown.png';

const playerUpImage = new Image();
playerUpImage.src = './img/playerUp.png';

const playerLeftImage = new Image();
playerLeftImage.src = './img/playerLeft.png';

const playerRightImage = new Image();
playerRightImage.src = './img/playerRight.png';

const player = new Sprite({
  position: {
    x: canvas.width / 2 - 192 / 4 / 2,
    y: canvas.height / 2 - 68 / 2
  },
  image: playerDownImage,
  frames: {
    max: 4,
    hold: 10
  },
  sprites: {
    up: playerUpImage,
    left: playerLeftImage,
    right: playerRightImage,
    down: playerDownImage
  }
});

const keys = {
  w: { pressed: false },
  a: { pressed: false },
  s: { pressed: false },
  d: { pressed: false },
  shift: { pressed: false }
};

function rectangularCollision({ rectangle1, rectangle2 }) {
  return (
    rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
    rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
    rectangle1.position.y + rectangle1.height >= rectangle2.position.y
  );
}

const battle = {
  initiated: false
};

// Grass step accumulation to prevent instant unfair encounters
let grassSteps = 0;
let lastStepTime = 0;

function triggerBattleSequence(battleConfig = {}) {
  if (battle.initiated) return;
  battle.initiated = true;

  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.stopBgm();
    AudioEngine.playSfx('initBattle');
  }

  gsap.to('#overlappingDiv', {
    opacity: 1,
    repeat: 3,
    yoyo: true,
    duration: 0.35,
    onComplete() {
      gsap.to('#overlappingDiv', {
        opacity: 1,
        duration: 0.35,
        onComplete() {
          // Initialize and animate battle
          initBattle(battleConfig);
          animateBattle();
          gsap.to('#overlappingDiv', {
            opacity: 0,
            duration: 0.35
          });
        }
      });
    }
  });
}

// Global hook for Battle Tower challenges
window.startTowerEncounter = function (floor = 1) {
  if (battle.initiated) return;
  const opponent = BattleTower.generateTowerOpponent(floor);
  triggerBattleSequence({
    type: 'tower',
    floor,
    opponent
  });
};

// Global hook for NPC Trainer battles
window.startTrainerBattle = function (trainerId) {
  if (battle.initiated) return;
  const trainer = TrainersData.getTrainer(trainerId);
  if (!trainer) return;
  const trainerTeam = TrainersData.createTrainerTeam(trainerId, PokemonData);
  triggerBattleSequence({
    type: 'trainer',
    trainer,
    trainerTeam
  });
};

let mainAnimationId = null;

function animate() {
  mainAnimationId = window.requestAnimationFrame(animate);

  // Keep world camera offset in exact sync
  offset.x = background.position.x;
  offset.y = background.position.y;

  if (typeof MapManager !== 'undefined') {
    MapManager.renderBackground(c, background.position);
  } else {
    background.draw();
  }

  boundaries.forEach((boundary) => {
    boundary.draw();
  });
  battleZones.forEach((battleZone) => {
    battleZone.draw();
  });
  player.draw();

  if (typeof MapManager !== 'undefined') {
    MapManager.renderForeground(c, background.position);
  } else {
    foreground.draw();
  }

  // Render ambient weather particles
  if (window.particleSystem) {
    window.particleSystem.updateAmbient();
    window.particleSystem.drawAmbient(c);
  }

  let moving = true;
  player.animate = false;

  if (battle.initiated) return;

  // Check physical route transitions & warps
  if (typeof MapManager !== 'undefined') {
    MapManager.checkWarps(player, background.position, (targetAreaId, spawn) => {
      window.repositionToArea(targetAreaId, spawn);
    });
  }

  const moveSpeed = keys.shift.pressed ? 5 : 3;

  // Wild Battle Trigger in Tall Grass
  if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
    for (let i = 0; i < battleZones.length; i++) {
      const battleZone = battleZones[i];
      const overlappingArea =
        (Math.min(player.position.x + player.width, battleZone.position.x + battleZone.width) -
          Math.max(player.position.x, battleZone.position.x)) *
        (Math.min(player.position.y + player.height, battleZone.position.y + battleZone.height) -
          Math.max(player.position.y, battleZone.position.y));

      if (
        rectangularCollision({ rectangle1: player, rectangle2: battleZone }) &&
        overlappingArea > (player.width * player.height) / 2
      ) {
        grassSteps++;
        const now = Date.now();
        // Encounter probability ramps up after 15 steps in grass
        if (grassSteps > 15 && now - lastStepTime > 200 && Math.random() < 0.05) {
          grassSteps = 0;
          lastStepTime = now;
          window.cancelAnimationFrame(mainAnimationId);
          triggerBattleSequence({ type: 'wild' });
          return;
        }
        break;
      }
    }
  }

  // Directional Movement
  if (keys.w.pressed && lastKey === 'w') {
    player.animate = true;
    player.image = player.sprites.up;

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y + moveSpeed
            }
          }
        })
      ) {
        moving = false;
        break;
      }
    }

    if (moving) {
      movables.forEach((movable) => {
        movable.position.y += moveSpeed;
      });
    }
  } else if (keys.a.pressed && lastKey === 'a') {
    player.animate = true;
    player.image = player.sprites.left;

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x + moveSpeed,
              y: boundary.position.y
            }
          }
        })
      ) {
        moving = false;
        break;
      }
    }

    if (moving) {
      movables.forEach((movable) => {
        movable.position.x += moveSpeed;
      });
    }
  } else if (keys.s.pressed && lastKey === 's') {
    player.animate = true;
    player.image = player.sprites.down;

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y - moveSpeed
            }
          }
        })
      ) {
        moving = false;
        break;
      }
    }

    if (moving) {
      movables.forEach((movable) => {
        movable.position.y -= moveSpeed;
      });
    }
  } else if (keys.d.pressed && lastKey === 'd') {
    player.animate = true;
    player.image = player.sprites.right;

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x - moveSpeed,
              y: boundary.position.y
            }
          }
        })
      ) {
        moving = false;
        break;
      }
    }

    if (moving) {
      movables.forEach((movable) => {
        movable.position.x -= moveSpeed;
      });
    }
  }
}

let lastKey = '';

window.addEventListener('keydown', (e) => {
  // Allow hotkeys when not in dialogue or typing
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  switch (e.key) {
    case 'w':
    case 'W':
    case 'ArrowUp':
      keys.w.pressed = true;
      lastKey = 'w';
      break;
    case 'a':
    case 'A':
    case 'ArrowLeft':
      keys.a.pressed = true;
      lastKey = 'a';
      break;
    case 's':
    case 'S':
    case 'ArrowDown':
      keys.s.pressed = true;
      lastKey = 's';
      break;
    case 'd':
    case 'D':
    case 'ArrowRight':
      keys.d.pressed = true;
      lastKey = 'd';
      break;
    case 'Shift':
      keys.shift.pressed = true;
      break;

    // Quick Hotkeys
    case 'm':
    case 'M':
      if (typeof ModalManager !== 'undefined' && !battle.initiated) ModalManager.openWorldMapModal();
      break;
    case 'p':
    case 'P':
      if (typeof ModalManager !== 'undefined') ModalManager.openPokedexModal();
      break;
    case 't':
    case 'T':
      if (typeof ModalManager !== 'undefined') ModalManager.openTeamModal();
      break;
    case 'b':
    case 'B':
      if (typeof ModalManager !== 'undefined') ModalManager.openBagModal();
      break;
    case 'c':
    case 'C':
      if (typeof ModalManager !== 'undefined') ModalManager.openQuestsModal();
      break;

    // In-battle move quick select (1, 2, 3, 4)
    case '1':
    case '2':
    case '3':
    case '4':
      if (battle.initiated) {
        const idx = parseInt(e.key, 10) - 1;
        const btns = document.querySelectorAll('#attacksBox button');
        if (btns && btns[idx] && !btns[idx].disabled) {
          btns[idx].click();
        }
      }
      break;

    // Space / Enter advances dialogue
    case ' ':
    case 'Enter':
      if (battle.initiated) {
        advanceDialogueQueue();
      }
      break;
  }
});

window.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'w':
    case 'W':
    case 'ArrowUp':
      keys.w.pressed = false;
      break;
    case 'a':
    case 'A':
    case 'ArrowLeft':
      keys.a.pressed = false;
      break;
    case 's':
    case 'S':
    case 'ArrowDown':
      keys.s.pressed = false;
      break;
    case 'd':
    case 'D':
    case 'ArrowRight':
      keys.d.pressed = false;
      break;
    case 'Shift':
      keys.shift.pressed = false;
      break;
  }
});

// Unlock audio and start BGM on first interaction
let audioStarted = false;
function startMapAudio() {
  if (!audioStarted) {
    audioStarted = true;
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playBgm('map');
    }
  }
}

window.addEventListener('click', startMapAudio, { once: true });
window.addEventListener('keydown', startMapAudio, { once: true });
window.addEventListener('touchstart', startMapAudio, { once: true });

// Start main animation loop
animate();
