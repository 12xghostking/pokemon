(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const MovesData = require('./movesData');
    module.exports = factory(MovesData);
  } else {
    root.PokemonData = factory(root.MovesData);
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this, function (MovesData) {
  'use strict';

  const POKEMON = {
    // Original Mini-game Starters
    Emby: {
      id: 'Emby',
      num: 1,
      name: 'Emby',
      types: ['Fire'],
      baseStats: { hp: 45, attack: 52, defense: 43, spAttack: 60, spDefense: 50, speed: 65 },
      baseExp: 64,
      catchRate: 120,
      rarity: 'Starter',
      description: 'A nimble flame creature whose tail burns brighter when excited. Loyal and fiercely competitive.',
      sheetSrc: './img/embySprite.png',
      spriteColor: '#F08030',
      movesByLevel: [
        { level: 1, moveId: 'Tackle' },
        { level: 4, moveId: 'Ember' },
        { level: 8, moveId: 'QuickAttack' },
        { level: 12, moveId: 'Fireball' },
        { level: 16, moveId: 'Flamethrower' },
        { level: 24, moveId: 'FireBlast' }
      ],
      evolution: { targetId: 'Emberon', level: 16 }
    },
    Emberon: {
      id: 'Emberon',
      num: 2,
      name: 'Emberon',
      types: ['Fire'],
      baseStats: { hp: 60, attack: 68, defense: 58, spAttack: 80, spDefense: 65, speed: 80 },
      baseExp: 142,
      catchRate: 60,
      rarity: 'Rare',
      description: 'The evolved form of Emby. It controls white-hot flames and darts across the battlefield like wildfire.',
      spriteColor: '#E65100',
      movesByLevel: [
        { level: 1, moveId: 'Tackle' },
        { level: 16, moveId: 'Fireball' },
        { level: 20, moveId: 'Flamethrower' },
        { level: 28, moveId: 'Crunch' },
        { level: 36, moveId: 'FireBlast' }
      ],
      evolution: { targetId: 'Infernodra', level: 36 }
    },
    Infernodra: {
      id: 'Infernodra',
      num: 3,
      name: 'Infernodra',
      types: ['Fire', 'Dragon'],
      baseStats: { hp: 82, attack: 95, defense: 80, spAttack: 115, spDefense: 85, speed: 100 },
      baseExp: 240,
      catchRate: 45,
      rarity: 'Epic',
      description: 'A magnificent dragon wreathed in raging fire. Its blazing breath melts stone and illuminates darkest nights.',
      spriteColor: '#BF360C',
      movesByLevel: [
        { level: 1, moveId: 'Fireball' },
        { level: 36, moveId: 'DragonBreath' },
        { level: 42, moveId: 'Flamethrower' },
        { level: 48, moveId: 'DragonClaw' },
        { level: 56, moveId: 'FireBlast' },
        { level: 64, moveId: 'Outrage' }
      ],
      evolution: null
    },

    Draggle: {
      id: 'Draggle',
      num: 4,
      name: 'Draggle',
      types: ['Dragon'],
      baseStats: { hp: 48, attack: 64, defense: 45, spAttack: 50, spDefense: 50, speed: 50 },
      baseExp: 67,
      catchRate: 90,
      rarity: 'Rare',
      description: 'A playful green serpent-dragon that nests in tall mystical grass. It harnesses ancient dragon power.',
      sheetSrc: './img/draggleSprite.png',
      spriteColor: '#43A047',
      movesByLevel: [
        { level: 1, moveId: 'Tackle' },
        { level: 5, moveId: 'Lick' },
        { level: 10, moveId: 'DragonBreath' },
        { level: 15, moveId: 'Bite' },
        { level: 22, moveId: 'DragonClaw' },
        { level: 30, moveId: 'Outrage' }
      ],
      evolution: { targetId: 'Draggonor', level: 30 }
    },
    Draggonor: {
      id: 'Draggonor',
      num: 5,
      name: 'Draggonor',
      types: ['Dragon', 'Flying'],
      baseStats: { hp: 70, attack: 85, defense: 65, spAttack: 75, spDefense: 70, speed: 75 },
      baseExp: 147,
      catchRate: 45,
      rarity: 'Rare',
      description: 'Its wings have developed fully, allowing it to soar above clouds and launch sonic blasts.',
      spriteColor: '#2E7D32',
      movesByLevel: [
        { level: 1, moveId: 'DragonBreath' },
        { level: 30, moveId: 'WingAttack' },
        { level: 35, moveId: 'DragonClaw' },
        { level: 45, moveId: 'Slam' },
        { level: 50, moveId: 'Outrage' }
      ],
      evolution: { targetId: 'Draggoking', level: 50 }
    },
    Draggoking: {
      id: 'Draggoking',
      num: 6,
      name: 'Draggoking',
      types: ['Dragon', 'Flying'],
      baseStats: { hp: 95, attack: 130, defense: 95, spAttack: 105, spDefense: 100, speed: 85 },
      baseExp: 270,
      catchRate: 25,
      rarity: 'Legendary',
      description: 'The monarch of dragonkind. Said to circumnavigate the globe in just sixteen hours.',
      spriteColor: '#1B5E20',
      movesByLevel: [
        { level: 1, moveId: 'DragonClaw' },
        { level: 50, moveId: 'Outrage' },
        { level: 55, moveId: 'HyperBeam' },
        { level: 65, moveId: 'Earthquake' }
      ],
      evolution: null
    },

    // Classic Starters
    Charmander: {
      id: 'Charmander',
      num: 7,
      name: 'Charmander',
      types: ['Fire'],
      baseStats: { hp: 39, attack: 52, defense: 43, spAttack: 60, spDefense: 50, speed: 65 },
      baseExp: 62,
      catchRate: 120,
      rarity: 'Starter',
      description: 'The flame on its tail indicates Charmander\'s life force. If healthy, the flame burns brightly.',
      spriteColor: '#FF6D00',
      movesByLevel: [
        { level: 1, moveId: 'Scratch' },
        { level: 4, moveId: 'Ember' },
        { level: 8, moveId: 'Fireball' },
        { level: 15, moveId: 'Flamethrower' },
        { level: 25, moveId: 'FireBlast' }
      ],
      evolution: { targetId: 'Charmeleon', level: 16 }
    },
    Charmeleon: {
      id: 'Charmeleon',
      num: 8,
      name: 'Charmeleon',
      types: ['Fire'],
      baseStats: { hp: 58, attack: 64, defense: 58, spAttack: 80, spDefense: 65, speed: 80 },
      baseExp: 142,
      catchRate: 60,
      rarity: 'Rare',
      description: 'Tough and aggressive. When it swings its burning tail, the temperature elevates uncomfortably.',
      spriteColor: '#D50000',
      movesByLevel: [
        { level: 1, moveId: 'Scratch' },
        { level: 16, moveId: 'Fireball' },
        { level: 24, moveId: 'Flamethrower' },
        { level: 32, moveId: 'FireBlast' }
      ],
      evolution: { targetId: 'Charizard', level: 36 }
    },
    Charizard: {
      id: 'Charizard',
      num: 9,
      name: 'Charizard',
      types: ['Fire', 'Flying'],
      baseStats: { hp: 78, attack: 84, defense: 78, spAttack: 109, spDefense: 85, speed: 100 },
      baseExp: 240,
      catchRate: 45,
      rarity: 'Epic',
      description: 'It spits fire hot enough to melt boulders. Known to cause wildfires unintentionally.',
      spriteColor: '#E65100',
      movesByLevel: [
        { level: 1, moveId: 'Flamethrower' },
        { level: 36, moveId: 'WingAttack' },
        { level: 45, moveId: 'FireBlast' },
        { level: 55, moveId: 'HyperBeam' }
      ],
      evolution: null
    },

    Squirtle: {
      id: 'Squirtle',
      num: 10,
      name: 'Squirtle',
      types: ['Water'],
      baseStats: { hp: 44, attack: 48, defense: 65, spAttack: 50, spDefense: 64, speed: 43 },
      baseExp: 63,
      catchRate: 120,
      rarity: 'Starter',
      description: 'Shoots water at prey while in the water. Withdraws into its shell when in danger.',
      spriteColor: '#29B6F6',
      movesByLevel: [
        { level: 1, moveId: 'Tackle' },
        { level: 4, moveId: 'Bubble' },
        { level: 7, moveId: 'WaterGun' },
        { level: 12, moveId: 'AquaJet' },
        { level: 18, moveId: 'Surf' },
        { level: 25, moveId: 'HydroPump' }
      ],
      evolution: { targetId: 'Wartortle', level: 16 }
    },
    Wartortle: {
      id: 'Wartortle',
      num: 11,
      name: 'Wartortle',
      types: ['Water'],
      baseStats: { hp: 59, attack: 63, defense: 80, spAttack: 65, spDefense: 80, speed: 58 },
      baseExp: 142,
      catchRate: 60,
      rarity: 'Rare',
      description: 'Its long, furry tail is a symbol of longevity. It cleverly moves its ears to maintain balance.',
      spriteColor: '#0288D1',
      movesByLevel: [
        { level: 1, moveId: 'WaterGun' },
        { level: 16, moveId: 'AquaJet' },
        { level: 22, moveId: 'Surf' },
        { level: 30, moveId: 'HydroPump' }
      ],
      evolution: { targetId: 'Blastoise', level: 36 }
    },
    Blastoise: {
      id: 'Blastoise',
      num: 12,
      name: 'Blastoise',
      types: ['Water'],
      baseStats: { hp: 79, attack: 83, defense: 100, spAttack: 85, spDefense: 105, speed: 78 },
      baseExp: 239,
      catchRate: 45,
      rarity: 'Epic',
      description: 'The rocket cannons on its shell shoot high-speed water spouts capable of punching through steel.',
      spriteColor: '#01579B',
      movesByLevel: [
        { level: 1, moveId: 'Surf' },
        { level: 36, moveId: 'HydroPump' },
        { level: 45, moveId: 'Earthquake' },
        { level: 55, moveId: 'HyperBeam' }
      ],
      evolution: null
    },

    Bulbasaur: {
      id: 'Bulbasaur',
      num: 13,
      name: 'Bulbasaur',
      types: ['Grass', 'Poison'],
      baseStats: { hp: 45, attack: 49, defense: 49, spAttack: 65, spDefense: 65, speed: 45 },
      baseExp: 64,
      catchRate: 120,
      rarity: 'Starter',
      description: 'A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon.',
      spriteColor: '#66BB6A',
      movesByLevel: [
        { level: 1, moveId: 'Tackle' },
        { level: 3, moveId: 'VineWhip' },
        { level: 7, moveId: 'PoisonSting' },
        { level: 10, moveId: 'SleepPowder' },
        { level: 15, moveId: 'RazorLeaf' },
        { level: 22, moveId: 'SolarBeam' }
      ],
      evolution: { targetId: 'Ivysaur', level: 16 }
    },
    Ivysaur: {
      id: 'Ivysaur',
      num: 14,
      name: 'Ivysaur',
      types: ['Grass', 'Poison'],
      baseStats: { hp: 60, attack: 62, defense: 63, spAttack: 80, spDefense: 80, speed: 60 },
      baseExp: 142,
      catchRate: 60,
      rarity: 'Rare',
      description: 'When the bud on its back starts swelling, a sweet aroma wafts to indicate the flower\'s coming bloom.',
      spriteColor: '#43A047',
      movesByLevel: [
        { level: 1, moveId: 'VineWhip' },
        { level: 16, moveId: 'RazorLeaf' },
        { level: 22, moveId: 'SleepPowder' },
        { level: 30, moveId: 'SludgeBomb' },
        { level: 35, moveId: 'SolarBeam' }
      ],
      evolution: { targetId: 'Venusaur', level: 32 }
    },
    Venusaur: {
      id: 'Venusaur',
      num: 15,
      name: 'Venusaur',
      types: ['Grass', 'Poison'],
      baseStats: { hp: 80, attack: 82, defense: 83, spAttack: 100, spDefense: 100, speed: 80 },
      baseExp: 236,
      catchRate: 45,
      rarity: 'Epic',
      description: 'The flower on its back catches the sun\'s rays. The sunlight is converted into powerful life energy.',
      spriteColor: '#2E7D32',
      movesByLevel: [
        { level: 1, moveId: 'RazorLeaf' },
        { level: 32, moveId: 'SludgeBomb' },
        { level: 40, moveId: 'SolarBeam' },
        { level: 50, moveId: 'Earthquake' }
      ],
      evolution: null
    },

    // Wild & Route Encounters
    Pikachu: {
      id: 'Pikachu',
      num: 16,
      name: 'Pikachu',
      types: ['Electric'],
      baseStats: { hp: 35, attack: 55, defense: 40, spAttack: 50, spDefense: 50, speed: 90 },
      baseExp: 112,
      catchRate: 190,
      rarity: 'Uncommon',
      description: 'When several of these Pokémon gather, their electricity could build and cause lightning storms.',
      spriteColor: '#FFD600',
      movesByLevel: [
        { level: 1, moveId: 'QuickAttack' },
        { level: 5, moveId: 'ThunderShock' },
        { level: 10, moveId: 'Spark' },
        { level: 18, moveId: 'Thunderbolt' },
        { level: 26, moveId: 'Thunder' }
      ],
      evolution: { targetId: 'Raichu', item: 'thunderStone' }
    },
    Raichu: {
      id: 'Raichu',
      num: 17,
      name: 'Raichu',
      types: ['Electric'],
      baseStats: { hp: 60, attack: 90, defense: 55, spAttack: 90, spDefense: 80, speed: 110 },
      baseExp: 218,
      catchRate: 75,
      rarity: 'Rare',
      description: 'Its long tail serves as a ground to protect itself from its own high voltage power.',
      spriteColor: '#FFAB00',
      movesByLevel: [
        { level: 1, moveId: 'Spark' },
        { level: 1, moveId: 'Thunderbolt' },
        { level: 30, moveId: 'Thunder' },
        { level: 45, moveId: 'HyperBeam' }
      ],
      evolution: null
    },

    Pidgey: {
      id: 'Pidgey',
      num: 18,
      name: 'Pidgey',
      types: ['Normal', 'Flying'],
      baseStats: { hp: 40, attack: 45, defense: 40, spAttack: 35, spDefense: 35, speed: 56 },
      baseExp: 50,
      catchRate: 255,
      rarity: 'Common',
      description: 'A common sight in forests and woods. It flaps its wings at ground level to kick up blinding sand.',
      spriteColor: '#A1887F',
      movesByLevel: [
        { level: 1, moveId: 'Tackle' },
        { level: 5, moveId: 'Gust' },
        { level: 9, moveId: 'QuickAttack' },
        { level: 15, moveId: 'WingAttack' }
      ],
      evolution: { targetId: 'Pidgeotto', level: 18 }
    },
    Pidgeotto: {
      id: 'Pidgeotto',
      num: 19,
      name: 'Pidgeotto',
      types: ['Normal', 'Flying'],
      baseStats: { hp: 63, attack: 60, defense: 55, spAttack: 50, spDefense: 50, speed: 71 },
      baseExp: 122,
      catchRate: 120,
      rarity: 'Uncommon',
      description: 'Very protective of its sprawling territorial area, this Pokémon will fiercely peck at any intruder.',
      spriteColor: '#8D6E63',
      movesByLevel: [
        { level: 1, moveId: 'Gust' },
        { level: 18, moveId: 'WingAttack' },
        { level: 25, moveId: 'QuickAttack' },
        { level: 32, moveId: 'Slam' }
      ],
      evolution: { targetId: 'Pidgeot', level: 36 }
    },
    Pidgeot: {
      id: 'Pidgeot',
      num: 20,
      name: 'Pidgeot',
      types: ['Normal', 'Flying'],
      baseStats: { hp: 83, attack: 80, defense: 75, spAttack: 70, spDefense: 70, speed: 101 },
      baseExp: 216,
      catchRate: 45,
      rarity: 'Rare',
      description: 'When hunting, it skims the surface of water at Mach 2 speed to snatch unsuspecting prey.',
      spriteColor: '#6D4C41',
      movesByLevel: [
        { level: 1, moveId: 'WingAttack' },
        { level: 36, moveId: 'Slam' },
        { level: 44, moveId: 'HyperBeam' }
      ],
      evolution: null
    },

    Caterpie: {
      id: 'Caterpie',
      num: 21,
      name: 'Caterpie',
      types: ['Bug'],
      baseStats: { hp: 45, attack: 30, defense: 35, spAttack: 20, spDefense: 20, speed: 45 },
      baseExp: 39,
      catchRate: 255,
      rarity: 'Common',
      description: 'For protection, it releases a horrible stench from the antenna on its head to drive away enemies.',
      spriteColor: '#8BC34A',
      movesByLevel: [
        { level: 1, moveId: 'Tackle' },
        { level: 5, moveId: 'BugBite' }
      ],
      evolution: { targetId: 'Butterfree', level: 10 }
    },
    Butterfree: {
      id: 'Butterfree',
      num: 22,
      name: 'Butterfree',
      types: ['Bug', 'Flying'],
      baseStats: { hp: 60, attack: 45, defense: 50, spAttack: 90, spDefense: 80, speed: 70 },
      baseExp: 178,
      catchRate: 90,
      rarity: 'Uncommon',
      description: 'In battle, it flaps its wings at great speed to release highly toxic dust into the air.',
      spriteColor: '#7E57C2',
      movesByLevel: [
        { level: 1, moveId: 'Gust' },
        { level: 10, moveId: 'Confusion' },
        { level: 14, moveId: 'SleepPowder' },
        { level: 20, moveId: 'Psybeam' },
        { level: 28, moveId: 'BugBite' }
      ],
      evolution: null
    },

    Geodude: {
      id: 'Geodude',
      num: 23,
      name: 'Geodude',
      types: ['Rock', 'Ground'],
      baseStats: { hp: 40, attack: 80, defense: 100, spAttack: 30, spDefense: 30, speed: 20 },
      baseExp: 60,
      catchRate: 255,
      rarity: 'Common',
      description: 'Found in fields and mountains. Mistaking them for boulders, people often step or trip on them.',
      spriteColor: '#795548',
      movesByLevel: [
        { level: 1, moveId: 'Tackle' },
        { level: 6, moveId: 'MudSlap' },
        { level: 11, moveId: 'RockThrow' },
        { level: 16, moveId: 'RockSlide' },
        { level: 24, moveId: 'Earthquake' }
      ],
      evolution: { targetId: 'Graveler', level: 25 }
    },
    Graveler: {
      id: 'Graveler',
      num: 24,
      name: 'Graveler',
      types: ['Rock', 'Ground'],
      baseStats: { hp: 55, attack: 95, defense: 115, spAttack: 45, spDefense: 45, speed: 35 },
      baseExp: 137,
      catchRate: 120,
      rarity: 'Uncommon',
      description: 'Rolls down slopes to move. It rolls over any obstacle without slowing or changing its direction.',
      spriteColor: '#5D4037',
      movesByLevel: [
        { level: 1, moveId: 'RockThrow' },
        { level: 25, moveId: 'RockSlide' },
        { level: 32, moveId: 'Earthquake' }
      ],
      evolution: { targetId: 'Golem', level: 40 }
    },
    Golem: {
      id: 'Golem',
      num: 25,
      name: 'Golem',
      types: ['Rock', 'Ground'],
      baseStats: { hp: 80, attack: 120, defense: 130, spAttack: 55, spDefense: 65, speed: 45 },
      baseExp: 223,
      catchRate: 45,
      rarity: 'Rare',
      description: 'Its boulder-like body is extremely hard. It can easily withstand dynamite blasts without damage.',
      spriteColor: '#4E342E',
      movesByLevel: [
        { level: 1, moveId: 'RockSlide' },
        { level: 40, moveId: 'Earthquake' },
        { level: 50, moveId: 'HyperBeam' }
      ],
      evolution: null
    },

    Gastly: {
      id: 'Gastly',
      num: 26,
      name: 'Gastly',
      types: ['Ghost', 'Poison'],
      baseStats: { hp: 30, attack: 35, defense: 30, spAttack: 100, spDefense: 35, speed: 80 },
      baseExp: 62,
      catchRate: 190,
      rarity: 'Uncommon',
      description: 'Almost invisible, this gaseous Pokémon cloaks the target and puts it to sleep without notice.',
      spriteColor: '#6A1B9A',
      movesByLevel: [
        { level: 1, moveId: 'Lick' },
        { level: 5, moveId: 'Hypnosis' },
        { level: 12, moveId: 'ShadowBall' },
        { level: 20, moveId: 'SludgeBomb' }
      ],
      evolution: { targetId: 'Haunter', level: 25 }
    },
    Haunter: {
      id: 'Haunter',
      num: 27,
      name: 'Haunter',
      types: ['Ghost', 'Poison'],
      baseStats: { hp: 45, attack: 50, defense: 45, spAttack: 115, spDefense: 55, speed: 95 },
      baseExp: 142,
      catchRate: 90,
      rarity: 'Rare',
      description: 'Because of its ability to slip through walls, it is said to be from another dimension.',
      spriteColor: '#4A148C',
      movesByLevel: [
        { level: 1, moveId: 'Lick' },
        { level: 25, moveId: 'ShadowBall' },
        { level: 30, moveId: 'Hypnosis' },
        { level: 36, moveId: 'SludgeBomb' }
      ],
      evolution: { targetId: 'Gengar', level: 40 }
    },
    Gengar: {
      id: 'Gengar',
      num: 28,
      name: 'Gengar',
      types: ['Ghost', 'Poison'],
      baseStats: { hp: 60, attack: 65, defense: 60, spAttack: 130, spDefense: 75, speed: 110 },
      baseExp: 225,
      catchRate: 45,
      rarity: 'Epic',
      description: 'Under a full moon, this Pokémon likes to mimic the shadows of people and laugh at their fright.',
      spriteColor: '#311B92',
      movesByLevel: [
        { level: 1, moveId: 'ShadowBall' },
        { level: 40, moveId: 'Psychic' },
        { level: 48, moveId: 'SludgeBomb' },
        { level: 56, moveId: 'HyperBeam' }
      ],
      evolution: null
    },

    Abra: {
      id: 'Abra',
      num: 29,
      name: 'Abra',
      types: ['Psychic'],
      baseStats: { hp: 25, attack: 20, defense: 15, spAttack: 105, spDefense: 55, speed: 90 },
      baseExp: 62,
      catchRate: 200,
      rarity: 'Uncommon',
      description: 'Using its psychic powers, it senses danger and teleports to safety even while asleep.',
      spriteColor: '#FDD835',
      movesByLevel: [
        { level: 1, moveId: 'Confusion' },
        { level: 8, moveId: 'Psybeam' }
      ],
      evolution: { targetId: 'Kadabra', level: 16 }
    },
    Kadabra: {
      id: 'Kadabra',
      num: 30,
      name: 'Kadabra',
      types: ['Psychic'],
      baseStats: { hp: 40, attack: 35, defense: 30, spAttack: 120, spDefense: 70, speed: 105 },
      baseExp: 140,
      catchRate: 100,
      rarity: 'Rare',
      description: 'It emits special alpha waves from its body that induce headaches just by being near.',
      spriteColor: '#FBC02D',
      movesByLevel: [
        { level: 1, moveId: 'Confusion' },
        { level: 16, moveId: 'Psybeam' },
        { level: 25, moveId: 'Recover' },
        { level: 32, moveId: 'Psychic' }
      ],
      evolution: { targetId: 'Alakazam', level: 38 }
    },
    Alakazam: {
      id: 'Alakazam',
      num: 31,
      name: 'Alakazam',
      types: ['Psychic'],
      baseStats: { hp: 55, attack: 50, defense: 45, spAttack: 135, spDefense: 95, speed: 120 },
      baseExp: 225,
      catchRate: 50,
      rarity: 'Epic',
      description: 'Its brain can outperform a supercomputer. Its intelligence quotient is said to be 5,000.',
      spriteColor: '#F57F17',
      movesByLevel: [
        { level: 1, moveId: 'Psybeam' },
        { level: 38, moveId: 'Psychic' },
        { level: 45, moveId: 'Recover' },
        { level: 55, moveId: 'HyperBeam' }
      ],
      evolution: null
    },

    Magikarp: {
      id: 'Magikarp',
      num: 32,
      name: 'Magikarp',
      types: ['Water'],
      baseStats: { hp: 20, attack: 10, defense: 55, spAttack: 15, spDefense: 20, speed: 80 },
      baseExp: 40,
      catchRate: 255,
      rarity: 'Common',
      description: 'In the distant past, it was somewhat stronger than the horribly weak descendants that exist today.',
      spriteColor: '#FF5722',
      movesByLevel: [
        { level: 1, moveId: 'Tackle' },
        { level: 15, moveId: 'Bubble' }
      ],
      evolution: { targetId: 'Gyarados', level: 20 }
    },
    Gyarados: {
      id: 'Gyarados',
      num: 33,
      name: 'Gyarados',
      types: ['Water', 'Flying'],
      baseStats: { hp: 95, attack: 125, defense: 79, spAttack: 60, spDefense: 100, speed: 81 },
      baseExp: 189,
      catchRate: 45,
      rarity: 'Epic',
      description: 'Rarely seen in the wild. Huge and vicious, it is capable of destroying entire cities in a rage.',
      spriteColor: '#1565C0',
      movesByLevel: [
        { level: 1, moveId: 'Bite' },
        { level: 20, moveId: 'DragonBreath' },
        { level: 25, moveId: 'AquaJet' },
        { level: 30, moveId: 'Surf' },
        { level: 40, moveId: 'HydroPump' },
        { level: 50, moveId: 'HyperBeam' }
      ],
      evolution: null
    },

    Eevee: {
      id: 'Eevee',
      num: 34,
      name: 'Eevee',
      types: ['Normal'],
      baseStats: { hp: 55, attack: 55, defense: 50, spAttack: 45, spDefense: 65, speed: 55 },
      baseExp: 65,
      catchRate: 150,
      rarity: 'Rare',
      description: 'Its genetic code is irregular. It can mutate if it is exposed to radiation from element Stones.',
      spriteColor: '#8D6E63',
      movesByLevel: [
        { level: 1, moveId: 'Tackle' },
        { level: 5, moveId: 'QuickAttack' },
        { level: 10, moveId: 'Bite' },
        { level: 20, moveId: 'Slam' }
      ],
      evolution: null // Evolves via stones: Vaporeon, Jolteon, Flareon
    },
    Vaporeon: {
      id: 'Vaporeon',
      num: 35,
      name: 'Vaporeon',
      types: ['Water'],
      baseStats: { hp: 130, attack: 65, defense: 60, spAttack: 110, spDefense: 95, speed: 65 },
      baseExp: 184,
      catchRate: 45,
      rarity: 'Epic',
      description: 'Lives close to water. Its long tail is ridged with a fin which is often mistaken for a mermaid\'s.',
      spriteColor: '#00ACC1',
      movesByLevel: [
        { level: 1, moveId: 'WaterGun' },
        { level: 20, moveId: 'AquaJet' },
        { level: 30, moveId: 'Surf' },
        { level: 40, moveId: 'HydroPump' }
      ],
      evolution: null
    },
    Jolteon: {
      id: 'Jolteon',
      num: 36,
      name: 'Jolteon',
      types: ['Electric'],
      baseStats: { hp: 65, attack: 65, defense: 60, spAttack: 110, spDefense: 95, speed: 130 },
      baseExp: 184,
      catchRate: 45,
      rarity: 'Epic',
      description: 'It accumulates negative ions in the atmosphere to blast out 10,000-volt lightning bolts.',
      spriteColor: '#FDD835',
      movesByLevel: [
        { level: 1, moveId: 'ThunderShock' },
        { level: 20, moveId: 'Spark' },
        { level: 30, moveId: 'Thunderbolt' },
        { level: 40, moveId: 'Thunder' }
      ],
      evolution: null
    },
    Flareon: {
      id: 'Flareon',
      num: 37,
      name: 'Flareon',
      types: ['Fire'],
      baseStats: { hp: 65, attack: 130, defense: 60, spAttack: 95, spDefense: 110, speed: 65 },
      baseExp: 184,
      catchRate: 45,
      rarity: 'Epic',
      description: 'When storing thermal energy in its body, its internal temperature could climb to over 1,600 degrees.',
      spriteColor: '#FF7043',
      movesByLevel: [
        { level: 1, moveId: 'Ember' },
        { level: 20, moveId: 'Fireball' },
        { level: 30, moveId: 'Flamethrower' },
        { level: 40, moveId: 'FireBlast' }
      ],
      evolution: null
    },

    Snorlax: {
      id: 'Snorlax',
      num: 38,
      name: 'Snorlax',
      types: ['Normal'],
      baseStats: { hp: 160, attack: 110, defense: 65, spAttack: 65, spDefense: 110, speed: 30 },
      baseExp: 189,
      catchRate: 25,
      rarity: 'Rare',
      description: 'Very lazy. Just eats and sleeps. As its enormous bulk builds, it becomes steadily more gluttonous.',
      spriteColor: '#00695C',
      movesByLevel: [
        { level: 1, moveId: 'Tackle' },
        { level: 15, moveId: 'Bite' },
        { level: 25, moveId: 'Slam' },
        { level: 35, moveId: 'Earthquake' },
        { level: 45, moveId: 'HyperBeam' }
      ],
      evolution: null
    },

    Lapras: {
      id: 'Lapras',
      num: 39,
      name: 'Lapras',
      types: ['Water', 'Ice'],
      baseStats: { hp: 130, attack: 85, defense: 80, spAttack: 85, spDefense: 95, speed: 60 },
      baseExp: 187,
      catchRate: 45,
      rarity: 'Rare',
      description: 'A gentle soul that can read the minds of people. It ferried people across seas on its back.',
      spriteColor: '#039BE5',
      movesByLevel: [
        { level: 1, moveId: 'WaterGun' },
        { level: 12, moveId: 'IceShard' },
        { level: 22, moveId: 'IceBeam' },
        { level: 32, moveId: 'Surf' },
        { level: 42, moveId: 'Blizzard' },
        { level: 50, moveId: 'HydroPump' }
      ],
      evolution: null
    },

    Mewtwo: {
      id: 'Mewtwo',
      num: 40,
      name: 'Mewtwo',
      types: ['Psychic'],
      baseStats: { hp: 106, attack: 110, defense: 90, spAttack: 154, spDefense: 90, speed: 130 },
      baseExp: 306,
      catchRate: 3,
      rarity: 'Legendary',
      description: 'It was created by a scientist after years of horrific gene splicing and DNA engineering experiments.',
      spriteColor: '#7B1FA2',
      movesByLevel: [
        { level: 1, moveId: 'Confusion' },
        { level: 30, moveId: 'Psybeam' },
        { level: 50, moveId: 'Psychic' },
        { level: 60, moveId: 'ShadowBall' },
        { level: 70, moveId: 'Recover' },
        { level: 80, moveId: 'HyperBeam' }
      ],
      evolution: null
    }
  };

  // Stone evolution map for Eevee and others
  const STONE_EVOLUTIONS = {
    Eevee: {
      waterStone: 'Vaporeon',
      thunderStone: 'Jolteon',
      fireStone: 'Flareon'
    },
    Pikachu: {
      thunderStone: 'Raichu'
    }
  };

  function getPokemonSpecies(id) {
    return POKEMON[id] || null;
  }

  function getAllSpecies() {
    return Object.values(POKEMON);
  }

  // Calculate actual stat from base stat, level, and IV (assumed average 15 for simplicity)
  function calculateStat(base, level, isHp = false, iv = 15) {
    if (isHp) {
      if (base === 1) return 1; // Shedinja case
      return Math.floor(((2 * base + iv) * level) / 100) + level + 10;
    }
    return Math.floor(((2 * base + iv) * level) / 100) + 5;
  }

  // Calculate exp needed for level (medium-fast curve: level^3)
  function getExpForLevel(level) {
    return Math.floor(Math.pow(level, 3));
  }

  // Create an active Pokémon instance
  function createPokemonInstance(speciesId, level = 5, options = {}) {
    const species = getPokemonSpecies(speciesId);
    if (!species) throw new Error(`Invalid speciesId: ${speciesId}`);

    const isShiny = options.isShiny !== undefined ? options.isShiny : (Math.random() < 0.02); // 2% shiny chance
    const maxHp = calculateStat(species.baseStats.hp, level, true);

    // Pick top 4 moves that this pokemon learns at or before this level
    const eligibleMoves = species.movesByLevel
      .filter(m => m.level <= level)
      .map(m => m.moveId);

    // Take the last 4 learned moves
    const chosenMoveIds = eligibleMoves.slice(-4);
    if (chosenMoveIds.length === 0) chosenMoveIds.push('Tackle');

    const moves = chosenMoveIds.map(id => {
      const moveDef = MovesData ? MovesData.getMove(id) : { id, name: id, maxPp: 20 };
      return {
        id: moveDef.id,
        name: moveDef.name,
        currentPp: moveDef.maxPp,
        maxPp: moveDef.maxPp
      };
    });

    const expCurrent = getExpForLevel(level);
    const expNext = getExpForLevel(level + 1);

    return {
      instanceId: 'pk_' + Date.now() + '_' + Math.floor(Math.random() * 100000),
      speciesId: species.id,
      name: options.nickname || species.name,
      level,
      currentHp: options.currentHp !== undefined ? options.currentHp : maxHp,
      maxHp,
      stats: {
        hp: maxHp,
        attack: calculateStat(species.baseStats.attack, level),
        defense: calculateStat(species.baseStats.defense, level),
        spAttack: calculateStat(species.baseStats.spAttack, level),
        spDefense: calculateStat(species.baseStats.spDefense, level),
        speed: calculateStat(species.baseStats.speed, level)
      },
      moves,
      status: null,
      statusTurns: 0,
      exp: expCurrent,
      expToNext: expNext,
      isShiny,
      caughtAt: options.caughtAt || new Date().toISOString(),
      caughtLocation: options.caughtLocation || 'Pallet Town'
    };
  }

  return {
    POKEMON,
    STONE_EVOLUTIONS,
    getPokemonSpecies,
    getAllSpecies,
    calculateStat,
    getExpForLevel,
    createPokemonInstance
  };
});
