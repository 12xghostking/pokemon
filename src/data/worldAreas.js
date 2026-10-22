(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.WorldAreas = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const AREAS = {
    pelletTown: {
      id: 'pelletTown',
      name: 'Pellet Town',
      subtitle: 'A tranquil coastal settlement of new beginnings',
      levelRange: [2, 5],
      badgeRequired: 0,
      encounterPool: [
        { speciesId: 'Emby', weight: 35 },
        { speciesId: 'Pidgey', weight: 35 },
        { speciesId: 'Caterpie', weight: 30 }
      ],
      weather: 'none',
      themeColor: '#4CAF50',
      description: 'Your hometown. Home to your cottage, Professor Oak\'s research lab, the Poké Center, and the Poké Mart.'
    },
    verdantRoute: {
      id: 'verdantRoute',
      name: 'Verdant Route',
      subtitle: 'Open grassy plains stretching toward the woods',
      levelRange: [4, 8],
      badgeRequired: 0,
      encounterPool: [
        { speciesId: 'Pidgey', weight: 25 },
        { speciesId: 'Caterpie', weight: 25 },
        { speciesId: 'Pikachu', weight: 15 },
        { speciesId: 'Bulbasaur', weight: 15 },
        { speciesId: 'Draggle', weight: 20 }
      ],
      weather: 'leaves',
      themeColor: '#8BC34A',
      description: 'Gentle breezes carry the scent of sweet blossoms. Beginner trainers practice battling in the meadows.'
    },
    whisperingWoods: {
      id: 'whisperingWoods',
      name: 'Whispering Woods',
      subtitle: 'Ancient canopy where insect and forest Pokémon dwell',
      levelRange: [8, 14],
      badgeRequired: 1, // Requires Boulder Badge
      encounterPool: [
        { speciesId: 'Butterfree', weight: 25 },
        { speciesId: 'Bulbasaur', weight: 25 },
        { speciesId: 'Pikachu', weight: 20 },
        { speciesId: 'Ivysaur', weight: 10 },
        { speciesId: 'Eevee', weight: 20 }
      ],
      weather: 'leaves',
      themeColor: '#2E7D32',
      description: 'Tall ancient oaks block out most sunlight. Rare wild Eevee have been sighted near mossy clearings.'
    },
    emberCrag: {
      id: 'emberCrag',
      name: 'Ember Crag & Caverns',
      subtitle: 'Smoldering volcanic rocks and steep jagged cliffs',
      levelRange: [14, 22],
      badgeRequired: 2, // Requires Cascade Badge
      encounterPool: [
        { speciesId: 'Charmander', weight: 25 },
        { speciesId: 'Geodude', weight: 35 },
        { speciesId: 'Charmeleon', weight: 15 },
        { speciesId: 'Graveler', weight: 15 },
        { speciesId: 'Flareon', weight: 10 }
      ],
      weather: 'embers',
      themeColor: '#E65100',
      description: 'Thermal steam vents hiss from cracks in the obsidian rock. Strong Fire and Rock Pokémon guard the cliffs.'
    },
    ceruleanCoast: {
      id: 'ceruleanCoast',
      name: 'Cerulean Coast',
      subtitle: 'Sun-drenched beaches and deep rolling ocean waves',
      levelRange: [20, 30],
      badgeRequired: 3, // Requires Thunder Badge
      encounterPool: [
        { speciesId: 'Squirtle', weight: 20 },
        { speciesId: 'Magikarp', weight: 25 },
        { speciesId: 'Wartortle', weight: 15 },
        { speciesId: 'Lapras', weight: 20 },
        { speciesId: 'Vaporeon', weight: 20 }
      ],
      weather: 'mist',
      themeColor: '#0288D1',
      description: 'Clear azure waters sparkle under the sun. Lapras can occasionally be heard singing songs across the waves.'
    },
    hauntedCrypt: {
      id: 'hauntedCrypt',
      name: 'Haunted Crypt',
      subtitle: 'Desolate catacombs cloaked in eerie supernatural mist',
      levelRange: [28, 38],
      badgeRequired: 4, // Requires Rainbow Badge
      encounterPool: [
        { speciesId: 'Gastly', weight: 35 },
        { speciesId: 'Haunter', weight: 25 },
        { speciesId: 'Abra', weight: 20 },
        { speciesId: 'Kadabra', weight: 15 },
        { speciesId: 'Gengar', weight: 5 }
      ],
      weather: 'fog',
      themeColor: '#4A148C',
      description: 'Cobwebs and cold silence hang heavy in the air. Ghost and Psychic Pokémon lurk within shadowy corners.'
    },
    indigoSummit: {
      id: 'indigoSummit',
      name: 'Indigo Summit & Arena',
      subtitle: 'The sacred peak where Pokémon Champions battle',
      levelRange: [42, 55],
      badgeRequired: 5, // Requires 5 Badges
      encounterPool: [
        { speciesId: 'Draggonor', weight: 25 },
        { speciesId: 'Draggoking', weight: 20 },
        { speciesId: 'Charizard', weight: 15 },
        { speciesId: 'Blastoise', weight: 15 },
        { speciesId: 'Venusaur', weight: 15 },
        { speciesId: 'Mewtwo', weight: 10 }
      ],
      weather: 'sparkles',
      themeColor: '#311B92',
      description: 'Above the cloud line stands the legendary battlefield. The air crackles with sheer mythical power.'
    }
  };

  function getArea(id) {
    return AREAS[id] || AREAS.pelletTown;
  }

  function getAllAreas() {
    return Object.values(AREAS);
  }

  function pickWildEncounter(areaId, pokemonDataModule) {
    const area = getArea(areaId);
    const pool = area.encounterPool;

    const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
    let rand = Math.random() * totalWeight;
    let chosenSpecies = pool[0].speciesId;

    for (const item of pool) {
      if (rand < item.weight) {
        chosenSpecies = item.speciesId;
        break;
      }
      rand -= item.weight;
    }

    const minLevel = area.levelRange[0];
    const maxLevel = area.levelRange[1];
    const level = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;

    const dataModule = pokemonDataModule || (typeof root !== 'undefined' ? root.PokemonData : null);
    if (!dataModule) {
      throw new Error('PokemonData module is required to generate wild encounter instance.');
    }

    return dataModule.createPokemonInstance(chosenSpecies, level, {
      caughtLocation: area.name
    });
  }

  return {
    AREAS,
    getArea,
    getAllAreas,
    pickWildEncounter
  };
});
