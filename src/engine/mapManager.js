(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MapManager = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const TILE_SOURCE_SIZE = 12; // 12x12 px on tileset.png
  const TILE_RENDER_SIZE = 48; // 48x48 px scaled 4x on canvas
  const TILESET_COLUMNS = 32;

  let currentAreaId = 'pelletTown';
  let currentMapData = null;
  let tilesetImage = null;
  let pelletTownBgImage = null;
  let pelletTownFgImage = null;

  let offscreenBg = null;
  let offscreenFg = null;

  let boundaries = [];
  let battleZones = [];
  let warps = [];
  let isTransitioning = false;
  let bannerTimeout = null;

  function init(initialArea = 'pelletTown') {
    currentAreaId = initialArea;

    // Load tileset asset
    if (typeof Image !== 'undefined') {
      tilesetImage = new Image();
      tilesetImage.src = './Tiled/tileset.png';

      pelletTownBgImage = new Image();
      pelletTownBgImage.src = './img/Pellet Town.png';

      pelletTownFgImage = new Image();
      pelletTownFgImage.src = './img/foregroundObjects.png';
    }

    loadMapData(currentAreaId);
  }

  function getMapData(areaId) {
    if (typeof MapsData !== 'undefined' && MapsData[areaId]) {
      return MapsData[areaId];
    }
    if (typeof require === 'function') {
      try {
        const localMaps = require('../data/mapsData');
        if (localMaps && localMaps[areaId]) {
          return localMaps[areaId];
        }
      } catch (e) {}
    }
    return null;
  }

  function loadMapData(areaId) {
    currentAreaId = areaId;
    currentMapData = getMapData(areaId);

    if (!currentMapData && typeof pelletTown !== 'undefined' && areaId === 'pelletTown') {
      currentMapData = pelletTown;
    }

    rebuildBoundariesAndZones();
    bakeOffscreenLayers();
  }

  function rebuildBoundariesAndZones() {
    boundaries = [];
    battleZones = [];
    warps = [];

    if (!currentMapData) return;

    const width = currentMapData.width || 70;
    const height = currentMapData.height || 40;

    // Find Layers
    const layers = currentMapData.layers || [];
    const collisionLayer = layers.find(l => l.name.toLowerCase().includes('collision'));
    const battleZoneLayer = layers.find(l => l.name.toLowerCase().includes('battle zone') || l.name.toLowerCase().includes('tall grass'));

    // Collision Boundaries
    if (collisionLayer && collisionLayer.data) {
      collisionLayer.data.forEach((val, idx) => {
        if (val === 1025 || val > 0) {
          const col = idx % width;
          const row = Math.floor(idx / width);
          boundaries.push({
            gridX: col,
            gridY: row,
            position: {
              x: col * TILE_RENDER_SIZE,
              y: row * TILE_RENDER_SIZE
            },
            width: TILE_RENDER_SIZE,
            height: TILE_RENDER_SIZE
          });
        }
      });
    }

    // Battle Zones (Tall Grass)
    if (battleZoneLayer && battleZoneLayer.data) {
      battleZoneLayer.data.forEach((val, idx) => {
        if (val === 1025 || val === 468 || val === 469 || val > 0) {
          const col = idx % width;
          const row = Math.floor(idx / width);
          battleZones.push({
            gridX: col,
            gridY: row,
            position: {
              x: col * TILE_RENDER_SIZE,
              y: row * TILE_RENDER_SIZE
            },
            width: TILE_RENDER_SIZE,
            height: TILE_RENDER_SIZE
          });
        }
      });
    }

    // Route Transition Warps
    if (currentMapData.properties && currentMapData.properties.exits) {
      currentMapData.properties.exits.forEach(exit => {
        warps.push({
          targetArea: exit.targetArea,
          direction: exit.direction,
          x: exit.x * TILE_RENDER_SIZE,
          y: exit.y * TILE_RENDER_SIZE,
          width: exit.width * TILE_RENDER_SIZE,
          height: exit.height * TILE_RENDER_SIZE,
          spawnX: exit.spawnX !== undefined ? exit.spawnX : 34,
          spawnY: exit.spawnY !== undefined ? exit.spawnY : 20
        });
      });
    }
  }

  function bakeOffscreenLayers() {
    if (typeof document === 'undefined') return;

    const width = (currentMapData && currentMapData.width ? currentMapData.width : 70) * TILE_RENDER_SIZE;
    const height = (currentMapData && currentMapData.height ? currentMapData.height : 40) * TILE_RENDER_SIZE;

    if (!offscreenBg) {
      offscreenBg = document.createElement('canvas');
    }
    offscreenBg.width = width;
    offscreenBg.height = height;

    if (!offscreenFg) {
      offscreenFg = document.createElement('canvas');
    }
    offscreenFg.width = width;
    offscreenFg.height = height;

    const bgCtx = offscreenBg.getContext('2d');
    const fgCtx = offscreenFg.getContext('2d');

    bgCtx.imageSmoothingEnabled = false;
    fgCtx.imageSmoothingEnabled = false;

    // Clear
    bgCtx.clearRect(0, 0, width, height);
    fgCtx.clearRect(0, 0, width, height);

    if (!currentMapData || !currentMapData.layers) return;

    // Draw Tiled Layers onto offscreen canvas
    currentMapData.layers.forEach(layer => {
      if (layer.type !== 'tilelayer' || !layer.data) return;

      const isForeground = layer.name.toLowerCase().includes('foreground');
      const targetCtx = isForeground ? fgCtx : bgCtx;

      const layerWidth = layer.width || 70;
      const data = layer.data;

      for (let i = 0; i < data.length; i++) {
        const gid = data[i];
        if (!gid || gid === 1025) continue; // Skip empty or collision-only symbols

        const col = i % layerWidth;
        const row = Math.floor(i / layerWidth);

        const destX = col * TILE_RENDER_SIZE;
        const destY = row * TILE_RENDER_SIZE;

        if (tilesetImage && tilesetImage.complete && tilesetImage.naturalWidth > 0) {
          const tileIdx = gid - 1;
          const sx = (tileIdx % TILESET_COLUMNS) * TILE_SOURCE_SIZE;
          const sy = Math.floor(tileIdx / TILESET_COLUMNS) * TILE_SOURCE_SIZE;

          targetCtx.drawImage(
            tilesetImage,
            sx,
            sy,
            TILE_SOURCE_SIZE,
            TILE_SOURCE_SIZE,
            destX,
            destY,
            TILE_RENDER_SIZE,
            TILE_RENDER_SIZE
          );
        } else {
          // Fallback procedural color tile if image still loading
          targetCtx.fillStyle = layer.name.toLowerCase().includes('water') ? '#1E3A8A' : '#15803D';
          targetCtx.fillRect(destX, destY, TILE_RENDER_SIZE, TILE_RENDER_SIZE);
        }
      }
    });
  }

  function renderBackground(c, offset) {
    if (currentAreaId === 'pelletTown' && pelletTownBgImage && pelletTownBgImage.complete && pelletTownBgImage.naturalWidth > 0) {
      c.drawImage(pelletTownBgImage, offset.x, offset.y);
      return;
    }

    if (offscreenBg) {
      c.drawImage(offscreenBg, offset.x, offset.y);
    }
  }

  function renderForeground(c, offset) {
    if (currentAreaId === 'pelletTown' && pelletTownFgImage && pelletTownFgImage.complete && pelletTownFgImage.naturalWidth > 0) {
      c.drawImage(pelletTownFgImage, offset.x, offset.y);
    } else if (offscreenFg) {
      c.drawImage(offscreenFg, offset.x, offset.y);
    }

    // Biome Ambient Lighting Overlay
    if (typeof WorldAreas !== 'undefined') {
      const area = WorldAreas.getArea(currentAreaId);
      if (area && area.themeColor) {
        c.save();
        if (currentAreaId === 'emberCrag') {
          c.fillStyle = 'rgba(230, 81, 0, 0.08)';
          c.fillRect(0, 0, c.canvas.width, c.canvas.height);
        } else if (currentAreaId === 'hauntedCrypt') {
          c.fillStyle = 'rgba(74, 20, 140, 0.12)';
          c.fillRect(0, 0, c.canvas.width, c.canvas.height);
        } else if (currentAreaId === 'indigoSummit') {
          c.fillStyle = 'rgba(129, 140, 248, 0.06)';
          c.fillRect(0, 0, c.canvas.width, c.canvas.height);
        } else if (currentAreaId === 'ceruleanCoast') {
          c.fillStyle = 'rgba(2, 136, 209, 0.06)';
          c.fillRect(0, 0, c.canvas.width, c.canvas.height);
        }
        c.restore();
      }
    }
  }

  function checkWarps(player, offset, onTransition) {
    if (isTransitioning) return;

    // Convert player position to world coordinates
    const playerWorldX = player.position.x - offset.x;
    const playerWorldY = player.position.y - offset.y;
    const playerBox = {
      x: playerWorldX,
      y: playerWorldY,
      width: player.width,
      height: player.height
    };

    for (let i = 0; i < warps.length; i++) {
      const warp = warps[i];
      if (
        playerBox.x + playerBox.width > warp.x &&
        playerBox.x < warp.x + warp.width &&
        playerBox.y + playerBox.height > warp.y &&
        playerBox.y < warp.y + warp.height
      ) {
        // Warp triggered!
        transitionToArea(warp.targetArea, { spawnX: warp.spawnX, spawnY: warp.spawnY }, onTransition);
        break;
      }
    }
  }

  function transitionToArea(targetAreaId, spawn = null, callback = null) {
    if (isTransitioning) return;
    isTransitioning = true;

    // Check Badge requirement if WorldAreas is defined
    if (typeof WorldAreas !== 'undefined' && typeof GameState !== 'undefined') {
      const targetArea = WorldAreas.getArea(targetAreaId);
      const state = GameState.getState();
      const badgesCount = (state.player.badges || []).length;

      if (targetArea.badgeRequired > badgesCount) {
        isTransitioning = false;
        showAreaBanner(targetArea.name, `🔒 Path blocked! Requires ${targetArea.badgeRequired} Gym Badges.`);
        if (typeof AudioEngine !== 'undefined') AudioEngine.playSfx('bump');
        return;
      }
    }

    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSfx('warp');
    }

    if (typeof gsap !== 'undefined') {
      gsap.to('#overlappingDiv', {
        opacity: 1,
        duration: 0.35,
        onComplete: () => {
          // Switch map
          loadMapData(targetAreaId);

          if (typeof GameState !== 'undefined') {
            const state = GameState.getState();
            state.player.currentArea = targetAreaId;
            if (!state.player.unlockedAreas.includes(targetAreaId)) {
              state.player.unlockedAreas.push(targetAreaId);
            }
            GameState.save();
          }

          // Weather
          if (typeof window !== 'undefined' && window.particleSystem && typeof WorldAreas !== 'undefined') {
            const area = WorldAreas.getArea(targetAreaId);
            if (area && area.weather) {
              window.particleSystem.setWeather(area.weather);
            }
          }

          // HUD
          if (typeof ModalManager !== 'undefined') {
            ModalManager.updateHudValues();
          }

          if (typeof callback === 'function') {
            callback(targetAreaId, spawn);
          }

          const areaInfo = typeof WorldAreas !== 'undefined' ? WorldAreas.getArea(targetAreaId) : { name: targetAreaId, subtitle: '' };
          showAreaBanner(areaInfo.name, areaInfo.subtitle);

          gsap.to('#overlappingDiv', {
            opacity: 0,
            duration: 0.35,
            onComplete: () => {
              isTransitioning = false;
            }
          });
        }
      });
    } else {
      loadMapData(targetAreaId);
      if (typeof callback === 'function') callback(targetAreaId, spawn);
      isTransitioning = false;
    }
  }

  function showAreaBanner(title, subtitle) {
    if (typeof document === 'undefined') return;

    let banner = document.getElementById('mapAreaBanner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'mapAreaBanner';
      banner.style.cssText = `
        position: absolute;
        top: 60px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(15, 23, 42, 0.95);
        color: #F8FAFC;
        border: 2px solid #38BDF8;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
        border-radius: 8px;
        padding: 10px 20px;
        text-align: center;
        z-index: 60;
        pointer-events: none;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        backdrop-filter: blur(6px);
      `;
      const container = document.querySelector('#gameContainer') || document.body;
      container.appendChild(banner);
    }

    banner.innerHTML = `
      <div style="font-family: 'Press Start 2P', monospace; font-size: 11px; color: #38BDF8; margin-bottom: 4px;">
        📍 ${title}
      </div>
      <div style="font-family: monospace; font-size: 10px; color: #94A3B8;">
        ${subtitle || ''}
      </div>
    `;

    banner.style.opacity = '1';
    banner.style.transform = 'translateX(-50%) translateY(0)';

    if (bannerTimeout) clearTimeout(bannerTimeout);
    bannerTimeout = setTimeout(() => {
      banner.style.opacity = '0';
      banner.style.transform = 'translateX(-50%) translateY(-10px)';
    }, 2800);
  }

  return {
    init,
    loadMapData,
    transitionToArea,
    renderBackground,
    renderForeground,
    checkWarps,
    showAreaBanner,
    getBoundaries: () => boundaries,
    getBattleZones: () => battleZones,
    getWarps: () => warps,
    getCurrentAreaId: () => currentAreaId,
    getCurrentMapData: () => currentMapData,
    bakeOffscreenLayers
  };
});
