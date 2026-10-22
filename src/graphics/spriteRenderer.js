(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const PokemonData = require('../data/pokemonData');
    module.exports = factory(PokemonData);
  } else {
    root.SpriteRenderer = factory(root.PokemonData);
  }
})(typeof self !== 'undefined' ? self : this, function (PokemonData) {
  'use strict';

  // Cache for procedural data URLs
  const avatarCache = {};

  // Custom palettes for shinies
  const SHINY_PALETTES = {
    Charizard: '#263238',
    Charmander: '#FFB74D',
    Charmeleon: '#FFA726',
    Pikachu: '#FF8F00',
    Raichu: '#E65100',
    Bulbasaur: '#81C784',
    Ivysaur: '#66BB6A',
    Venusaur: '#388E3C',
    Squirtle: '#80DEEA',
    Wartortle: '#4DD0E1',
    Blastoise: '#00838F',
    Gengar: '#B0BEC5',
    Mewtwo: '#8E24AA',
    Gyarados: '#D32F2F', // Red Gyarados!
    Emby: '#FFD700',     // Golden Emby!
    Draggle: '#AB47BC'   // Purple Draggle!
  };

  /**
   * Draw procedural retro-pixel Pokémon sprite on HTML5 canvas context
   */
  function drawProceduralPokemon(ctx, pokemon, x, y, width, height, isBackView = false, bobOffset = 0) {
    const speciesId = pokemon.speciesId || pokemon.id || 'Emby';
    const isShiny = !!pokemon.isShiny;

    let baseColor = pokemon.spriteColor || '#F08030';
    if (isShiny && SHINY_PALETTES[speciesId]) {
      baseColor = SHINY_PALETTES[speciesId];
    }

    ctx.save();
    ctx.translate(x, y + bobOffset);

    // Subtle drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(width / 2, height - 6, width * 0.35, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    const scale = width / 120;
    ctx.scale(scale, scale);

    // Draw silhouette based on species type & features
    renderSpeciesArt(ctx, speciesId, baseColor, isBackView, isShiny);

    // Draw Shiny Sparkles
    if (isShiny) {
      drawShinySparkles(ctx, 120, 120);
    }

    ctx.restore();
  }

  function renderSpeciesArt(ctx, speciesId, baseColor, isBackView, isShiny) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#1A1A1A';
    ctx.fillStyle = baseColor;

    // Center coordinates
    const cx = 60;
    const cy = 60;

    // Distinct signature renderers
    if (speciesId === 'Pikachu' || speciesId === 'Raichu') {
      drawElectricMouse(ctx, cx, cy, baseColor, isBackView, speciesId === 'Raichu');
    } else if (speciesId.startsWith('Charm') || speciesId === 'Charizard' || speciesId === 'Emby' || speciesId === 'Emberon' || speciesId === 'Infernodra') {
      drawFlameReptile(ctx, cx, cy, baseColor, isBackView, speciesId);
    } else if (speciesId.startsWith('Squirt') || speciesId === 'Wartortle' || speciesId === 'Blastoise') {
      drawWaterTurtle(ctx, cx, cy, baseColor, isBackView, speciesId);
    } else if (speciesId.startsWith('Bulba') || speciesId === 'Ivysaur' || speciesId === 'Venusaur') {
      drawPlantBeast(ctx, cx, cy, baseColor, isBackView, speciesId);
    } else if (speciesId.startsWith('Dragg') || speciesId.startsWith('Drati') || speciesId === 'Dragonite') {
      drawDragonSerpent(ctx, cx, cy, baseColor, isBackView, speciesId);
    } else if (speciesId === 'Gastly' || speciesId === 'Haunter' || speciesId === 'Gengar') {
      drawGhostlyShade(ctx, cx, cy, baseColor, isBackView, speciesId);
    } else if (speciesId === 'Geodude' || speciesId === 'Graveler' || speciesId === 'Golem') {
      drawRockGolem(ctx, cx, cy, baseColor, isBackView);
    } else if (speciesId.startsWith('Pidge')) {
      drawAvianBird(ctx, cx, cy, baseColor, isBackView);
    } else if (speciesId === 'Snorlax') {
      drawGiantSnorlax(ctx, cx, cy, baseColor, isBackView);
    } else if (speciesId === 'Mewtwo') {
      drawPsychicLegend(ctx, cx, cy, baseColor, isBackView);
    } else {
      drawGenericCreature(ctx, cx, cy, baseColor, isBackView);
    }
  }

  function drawElectricMouse(ctx, cx, cy, color, isBack, isRaichu) {
    // Body
    ctx.beginPath();
    ctx.arc(cx, cy + 10, isRaichu ? 26 : 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Head
    ctx.beginPath();
    ctx.arc(cx, cy - 14, isRaichu ? 20 : 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Ears
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy - 25);
    ctx.lineTo(cx - 24, cy - 48);
    ctx.lineTo(cx - 4, cy - 30);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + 12, cy - 25);
    ctx.lineTo(cx + 24, cy - 48);
    ctx.lineTo(cx + 4, cy - 30);
    ctx.fill();
    ctx.stroke();

    // Ear tips (black)
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy - 40);
    ctx.lineTo(cx - 24, cy - 48);
    ctx.lineTo(cx - 15, cy - 44);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx + 20, cy - 40);
    ctx.lineTo(cx + 24, cy - 48);
    ctx.lineTo(cx + 15, cy - 44);
    ctx.fill();

    // Tail (Lightning bolt)
    ctx.fillStyle = '#F57F17';
    ctx.beginPath();
    ctx.moveTo(cx + 18, cy + 10);
    ctx.lineTo(cx + 34, cy + 2);
    ctx.lineTo(cx + 28, cy - 8);
    ctx.lineTo(cx + 46, cy - 18);
    ctx.lineTo(cx + 38, cy + 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (!isBack) {
      // Cheeks (Red)
      ctx.fillStyle = '#E53935';
      ctx.beginPath();
      ctx.arc(cx - 12, cy - 8, 5, 0, Math.PI * 2);
      ctx.arc(cx + 12, cy - 8, 5, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.arc(cx - 6, cy - 16, 3, 0, Math.PI * 2);
      ctx.arc(cx + 6, cy - 16, 3, 0, Math.PI * 2);
      ctx.fill();

      // White eye gleam
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(cx - 5, cy - 17, 1.2, 0, Math.PI * 2);
      ctx.arc(cx + 7, cy - 17, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawFlameReptile(ctx, cx, cy, color, isBack, speciesId) {
    // Tail with flame
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx + (isBack ? -14 : 14), cy + 16);
    ctx.quadraticCurveTo(cx + (isBack ? -34 : 34), cy + 10, cx + (isBack ? -38 : 38), cy - 6);
    ctx.lineTo(cx + (isBack ? -30 : 30), cy - 2);
    ctx.fill();
    ctx.stroke();

    // Flame on tail tip
    ctx.fillStyle = '#FFEB3B';
    ctx.beginPath();
    ctx.arc(cx + (isBack ? -38 : 38), cy - 8, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F44336';
    ctx.beginPath();
    ctx.arc(cx + (isBack ? -38 : 38), cy - 8, 5, 0, Math.PI * 2);
    ctx.fill();

    // Wings for Charizard or Infernodra
    if (speciesId === 'Charizard' || speciesId === 'Infernodra') {
      ctx.fillStyle = '#00897B';
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy - 6);
      ctx.lineTo(cx - 42, cy - 36);
      ctx.lineTo(cx - 20, cy + 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 10, cy - 6);
      ctx.lineTo(cx + 42, cy - 36);
      ctx.lineTo(cx + 20, cy + 2);
      ctx.fill();
      ctx.stroke();
    }

    // Body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 12, 20, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Head
    ctx.beginPath();
    ctx.ellipse(cx, cy - 16, 16, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (!isBack) {
      // Cream belly
      ctx.fillStyle = '#FFF9C4';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 14, 12, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#00E5FF';
      ctx.beginPath();
      ctx.arc(cx - 6, cy - 17, 3, 0, Math.PI * 2);
      ctx.arc(cx + 6, cy - 17, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.arc(cx - 5, cy - 17, 1.5, 0, Math.PI * 2);
      ctx.arc(cx + 7, cy - 17, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawWaterTurtle(ctx, cx, cy, color, isBack, speciesId) {
    // Shell
    ctx.fillStyle = '#6D4C41';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 10, 24, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cannons for Blastoise
    if (speciesId === 'Blastoise') {
      ctx.fillStyle = '#9E9E9E';
      ctx.fillRect(cx - 26, cy - 24, 8, 20);
      ctx.strokeRect(cx - 26, cy - 24, 8, 20);
      ctx.fillRect(cx + 18, cy - 24, 8, 20);
      ctx.strokeRect(cx + 18, cy - 24, 8, 20);
    }

    // Body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy - 16, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Feet
    ctx.beginPath();
    ctx.arc(cx - 16, cy + 32, 7, 0, Math.PI * 2);
    ctx.arc(cx + 16, cy + 32, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (!isBack) {
      // Belly plate
      ctx.fillStyle = '#FFE082';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 10, 16, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Eyes
      ctx.fillStyle = '#8E24AA';
      ctx.beginPath();
      ctx.arc(cx - 6, cy - 17, 3, 0, Math.PI * 2);
      ctx.arc(cx + 6, cy - 17, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawPlantBeast(ctx, cx, cy, color, isBack, speciesId) {
    // Plant bulb/flower on back
    ctx.fillStyle = (speciesId === 'Venusaur') ? '#E91E63' : '#43A047';
    ctx.beginPath();
    ctx.arc(cx, cy - 2, (speciesId === 'Venusaur') ? 24 : 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Quadruped body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 16, 26, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Head
    ctx.beginPath();
    ctx.arc(cx + (isBack ? 0 : -8), cy - 2, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (!isBack) {
      // Red eyes
      ctx.fillStyle = '#E53935';
      ctx.beginPath();
      ctx.arc(cx - 12, cy - 4, 3, 0, Math.PI * 2);
      ctx.arc(cx - 2, cy - 4, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawDragonSerpent(ctx, cx, cy, color, isBack, speciesId) {
    // Serpentine winding body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 12, 22, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Dragon horns
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy - 24);
    ctx.lineTo(cx - 18, cy - 40);
    ctx.lineTo(cx - 6, cy - 26);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + 10, cy - 24);
    ctx.lineTo(cx + 18, cy - 40);
    ctx.lineTo(cx + 6, cy - 26);
    ctx.fill();
    ctx.stroke();

    // Dragon head
    ctx.beginPath();
    ctx.arc(cx, cy - 16, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (!isBack) {
      // Slit eyes
      ctx.fillStyle = '#76FF03';
      ctx.beginPath();
      ctx.arc(cx - 6, cy - 16, 3, 0, Math.PI * 2);
      ctx.arc(cx + 6, cy - 16, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawGhostlyShade(ctx, cx, cy, color, isBack, speciesId) {
    // Spooky gaseous spikes around body
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const r = 32;
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;
      ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Core round ghost
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (!isBack) {
      // Sinister red eyes
      ctx.fillStyle = '#FF1744';
      ctx.beginPath();
      ctx.arc(cx - 9, cy - 6, 5, 0, Math.PI * 2);
      ctx.arc(cx + 9, cy - 6, 5, 0, Math.PI * 2);
      ctx.fill();

      // White teeth grin
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(cx, cy + 8, 12, 0, Math.PI);
      ctx.fill();
      ctx.stroke();
    }
  }

  function drawRockGolem(ctx, cx, cy, color, isBack) {
    ctx.fillStyle = color;
    // Craggy boulder shape
    ctx.beginPath();
    ctx.moveTo(cx - 24, cy - 14);
    ctx.lineTo(cx - 8, cy - 28);
    ctx.lineTo(cx + 18, cy - 24);
    ctx.lineTo(cx + 30, cy + 6);
    ctx.lineTo(cx + 18, cy + 28);
    ctx.lineTo(cx - 16, cy + 26);
    ctx.lineTo(cx - 28, cy + 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Muscle arms
    ctx.fillRect(cx - 40, cy - 4, 16, 12);
    ctx.strokeRect(cx - 40, cy - 4, 16, 12);
    ctx.fillRect(cx + 24, cy - 4, 16, 12);
    ctx.strokeRect(cx + 24, cy - 4, 16, 12);

    if (!isBack) {
      // Rugged furrowed eyes
      ctx.fillStyle = '#FFF';
      ctx.fillRect(cx - 10, cy - 8, 6, 4);
      ctx.fillRect(cx + 4, cy - 8, 6, 4);
    }
  }

  function drawAvianBird(ctx, cx, cy, color, isBack) {
    ctx.fillStyle = color;
    // Bird wings
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy + 4);
    ctx.lineTo(cx - 40, cy - 18);
    ctx.lineTo(cx - 20, cy + 14);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + 14, cy + 4);
    ctx.lineTo(cx + 40, cy - 18);
    ctx.lineTo(cx + 20, cy + 14);
    ctx.fill();
    ctx.stroke();

    // Torso & head
    ctx.beginPath();
    ctx.ellipse(cx, cy + 8, 18, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy - 14, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (!isBack) {
      // Beak
      ctx.fillStyle = '#FFB300';
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy - 12);
      ctx.lineTo(cx, cy - 6);
      ctx.lineTo(cx + 4, cy - 12);
      ctx.fill();
      ctx.stroke();
    }
  }

  function drawGiantSnorlax(ctx, cx, cy, color, isBack) {
    // Massive round belly
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 10, 34, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Head with cute pointy ears
    ctx.beginPath();
    ctx.arc(cx, cy - 20, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - 16, cy - 30);
    ctx.lineTo(cx - 18, cy - 42);
    ctx.lineTo(cx - 8, cy - 34);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + 16, cy - 30);
    ctx.lineTo(cx + 18, cy - 42);
    ctx.lineTo(cx + 8, cy - 34);
    ctx.fill();
    ctx.stroke();

    if (!isBack) {
      // Cream belly & face mask
      ctx.fillStyle = '#FFF8E1';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 12, 24, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sleeping slit eyes
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 12, cy - 20);
      ctx.lineTo(cx - 4, cy - 20);
      ctx.moveTo(cx + 4, cy - 20);
      ctx.lineTo(cx + 12, cy - 20);
      ctx.stroke();
    }
  }

  function drawPsychicLegend(ctx, cx, cy, color, isBack) {
    // Sleek psychic body
    ctx.fillStyle = '#EDE7F6';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, 18, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Long thick purple psychic tail
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx + (isBack ? -8 : 8), cy + 16);
    ctx.quadraticCurveTo(cx + (isBack ? -36 : 36), cy + 20, cx + (isBack ? -32 : 32), cy + 38);
    ctx.lineTo(cx + (isBack ? -16 : 16), cy + 30);
    ctx.fill();
    ctx.stroke();

    // Head with psychic ridges
    ctx.fillStyle = '#EDE7F6';
    ctx.beginPath();
    ctx.arc(cx, cy - 20, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (!isBack) {
      // Fierce purple eyes
      ctx.fillStyle = '#7B1FA2';
      ctx.beginPath();
      ctx.arc(cx - 6, cy - 20, 3.5, 0, Math.PI * 2);
      ctx.arc(cx + 6, cy - 20, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawGenericCreature(ctx, cx, cy, color, isBack) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 8, 22, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy - 16, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (!isBack) {
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.arc(cx - 6, cy - 16, 3, 0, Math.PI * 2);
      ctx.arc(cx + 6, cy - 16, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawShinySparkles(ctx, width, height) {
    ctx.fillStyle = '#FFD700';
    const sparkles = [
      { x: 18, y: 18, size: 6 },
      { x: width - 20, y: 24, size: 8 },
      { x: 26, y: height - 24, size: 5 },
      { x: width - 24, y: height - 20, size: 7 }
    ];
    for (const s of sparkles) {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.beginPath();
      ctx.moveTo(0, -s.size);
      ctx.lineTo(s.size * 0.4, -s.size * 0.4);
      ctx.lineTo(s.size, 0);
      ctx.lineTo(s.size * 0.4, s.size * 0.4);
      ctx.lineTo(0, s.size);
      ctx.lineTo(-s.size * 0.4, s.size * 0.4);
      ctx.lineTo(-s.size, 0);
      ctx.lineTo(-s.size * 0.4, -s.size * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  /**
   * Generate an SVG data URI avatar for UI cards & Pokédex
   */
  function getPokemonAvatarUrl(speciesId, isShiny = false) {
    const key = `${speciesId}_${isShiny}`;
    if (avatarCache[key]) return avatarCache[key];

    // If client has canvas available, generate clean 96x96 data URL
    if (typeof document !== 'undefined') {
      const c = document.createElement('canvas');
      c.width = 96;
      c.height = 96;
      const ctx = c.getContext('2d');
      const pokemonData = PokemonData || (typeof root !== 'undefined' ? root.PokemonData : null);
      const species = pokemonData ? pokemonData.getPokemonSpecies(speciesId) : { id: speciesId };
      const dummy = { speciesId, spriteColor: species ? species.spriteColor : '#FF9800', isShiny };

      drawProceduralPokemon(ctx, dummy, 0, 0, 96, 96, false, 0);
      const url = c.toDataURL('image/png');
      avatarCache[key] = url;
      return url;
    }

    return '';
  }

  return {
    drawProceduralPokemon,
    getPokemonAvatarUrl
  };
});
