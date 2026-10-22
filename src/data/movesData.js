(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MovesData = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const MOVES = {
    // Normal Moves
    Tackle: {
      id: 'Tackle',
      name: 'Tackle',
      type: 'Normal',
      category: 'physical',
      power: 40,
      accuracy: 100,
      maxPp: 35,
      description: 'A full-body charge attack that inflicts damage.',
      color: '#A8A878',
      animation: 'tackle'
    },
    Scratch: {
      id: 'Scratch',
      name: 'Scratch',
      type: 'Normal',
      category: 'physical',
      power: 40,
      accuracy: 100,
      maxPp: 35,
      description: 'Hard, pointed, sharp claws rake the target to inflict damage.',
      color: '#A8A878',
      animation: 'slash'
    },
    QuickAttack: {
      id: 'QuickAttack',
      name: 'Quick Attack',
      type: 'Normal',
      category: 'physical',
      power: 40,
      accuracy: 100,
      maxPp: 30,
      priority: 1,
      description: 'An almost invisibly fast strike that always goes first.',
      color: '#A8A878',
      animation: 'tackle'
    },
    Slam: {
      id: 'Slam',
      name: 'Slam',
      type: 'Normal',
      category: 'physical',
      power: 80,
      accuracy: 75,
      maxPp: 20,
      description: 'Slams the target with a long tail or tentacles to inflict damage.',
      color: '#A8A878',
      animation: 'tackle'
    },
    HyperBeam: {
      id: 'HyperBeam',
      name: 'Hyper Beam',
      type: 'Normal',
      category: 'special',
      power: 150,
      accuracy: 90,
      maxPp: 5,
      description: 'A powerful blast of concentrated energy is launched at the foe.',
      color: '#A8A878',
      animation: 'beam'
    },
    Recover: {
      id: 'Recover',
      name: 'Recover',
      type: 'Normal',
      category: 'status',
      power: 0,
      accuracy: 100,
      maxPp: 10,
      description: 'Restores the user\'s HP by up to half of its maximum HP.',
      color: '#A8A878',
      animation: 'heal',
      effect: { healPercent: 0.5 }
    },
    Struggle: {
      id: 'Struggle',
      name: 'Struggle',
      type: 'Normal',
      category: 'physical',
      power: 50,
      accuracy: 100,
      maxPp: 1,
      description: 'Used only when all PP is gone. Deals damage but causes recoil.',
      color: '#A8A878',
      animation: 'tackle',
      effect: { recoilPercent: 0.25 }
    },

    // Fire Moves
    Ember: {
      id: 'Ember',
      name: 'Ember',
      type: 'Fire',
      category: 'special',
      power: 40,
      accuracy: 100,
      maxPp: 25,
      description: 'The target is attacked with small flames. May leave a burn.',
      color: '#F08030',
      animation: 'fireball',
      effect: { status: 'BRN', chance: 0.1 }
    },
    Fireball: {
      id: 'Fireball',
      name: 'Fireball',
      type: 'Fire',
      category: 'special',
      power: 65,
      accuracy: 95,
      maxPp: 20,
      description: 'A blazing orb of fire explodes on the target with great force.',
      color: '#F08030',
      animation: 'fireball',
      effect: { status: 'BRN', chance: 0.2 }
    },
    Flamethrower: {
      id: 'Flamethrower',
      name: 'Flamethrower',
      type: 'Fire',
      category: 'special',
      power: 90,
      accuracy: 100,
      maxPp: 15,
      description: 'The target is scorched with an intense blast of fire. May cause burn.',
      color: '#F08030',
      animation: 'fireball',
      effect: { status: 'BRN', chance: 0.15 }
    },
    FireBlast: {
      id: 'FireBlast',
      name: 'Fire Blast',
      type: 'Fire',
      category: 'special',
      power: 110,
      accuracy: 85,
      maxPp: 5,
      description: 'The target is attacked with an intense blast of all-consuming fire.',
      color: '#F08030',
      animation: 'fireball',
      effect: { status: 'BRN', chance: 0.3 }
    },

    // Water Moves
    WaterGun: {
      id: 'WaterGun',
      name: 'Water Gun',
      type: 'Water',
      category: 'special',
      power: 40,
      accuracy: 100,
      maxPp: 25,
      description: 'The target is blasted with a forceful shot of water.',
      color: '#6890F0',
      animation: 'water'
    },
    Bubble: {
      id: 'Bubble',
      name: 'Bubble',
      type: 'Water',
      category: 'special',
      power: 40,
      accuracy: 100,
      maxPp: 30,
      description: 'A spray of bubbles is fired at the target. May lower Speed.',
      color: '#6890F0',
      animation: 'water',
      effect: { stat: 'speed', stages: -1, chance: 0.2 }
    },
    AquaJet: {
      id: 'AquaJet',
      name: 'Aqua Jet',
      type: 'Water',
      category: 'physical',
      power: 40,
      accuracy: 100,
      maxPp: 20,
      priority: 1,
      description: 'The user lunges at the target at speed that makes it almost invisible.',
      color: '#6890F0',
      animation: 'water'
    },
    Surf: {
      id: 'Surf',
      name: 'Surf',
      type: 'Water',
      category: 'special',
      power: 90,
      accuracy: 100,
      maxPp: 15,
      description: 'A swamp of water crashes down on the target.',
      color: '#6890F0',
      animation: 'water'
    },
    HydroPump: {
      id: 'HydroPump',
      name: 'Hydro Pump',
      type: 'Water',
      category: 'special',
      power: 110,
      accuracy: 80,
      maxPp: 5,
      description: 'The target is blasted by a huge volume of water launched under pressure.',
      color: '#6890F0',
      animation: 'water'
    },

    // Grass Moves
    VineWhip: {
      id: 'VineWhip',
      name: 'Vine Whip',
      type: 'Grass',
      category: 'physical',
      power: 45,
      accuracy: 100,
      maxPp: 25,
      description: 'The target is struck with slender, whiplike vines.',
      color: '#78C850',
      animation: 'leaf'
    },
    RazorLeaf: {
      id: 'RazorLeaf',
      name: 'Razor Leaf',
      type: 'Grass',
      category: 'physical',
      power: 55,
      accuracy: 95,
      maxPp: 25,
      critRatio: 1,
      description: 'Sharp-edged leaves are launched to slash the target. High crit rate.',
      color: '#78C850',
      animation: 'leaf'
    },
    SolarBeam: {
      id: 'SolarBeam',
      name: 'Solar Beam',
      type: 'Grass',
      category: 'special',
      power: 120,
      accuracy: 100,
      maxPp: 10,
      description: 'A powerful solar beam unleashed upon the target.',
      color: '#78C850',
      animation: 'beam'
    },
    SleepPowder: {
      id: 'SleepPowder',
      name: 'Sleep Powder',
      type: 'Grass',
      category: 'status',
      power: 0,
      accuracy: 75,
      maxPp: 15,
      description: 'The user scatters a big cloud of sleep-inducing dust on the target.',
      color: '#78C850',
      animation: 'powder',
      effect: { status: 'SLP', chance: 1.0 }
    },

    // Electric Moves
    ThunderShock: {
      id: 'ThunderShock',
      name: 'Thunder Shock',
      type: 'Electric',
      category: 'special',
      power: 40,
      accuracy: 100,
      maxPp: 30,
      description: 'A jolt of electricity crashes down. May leave the target paralyzed.',
      color: '#F8D030',
      animation: 'lightning',
      effect: { status: 'PAR', chance: 0.1 }
    },
    Spark: {
      id: 'Spark',
      name: 'Spark',
      type: 'Electric',
      category: 'physical',
      power: 65,
      accuracy: 100,
      maxPp: 20,
      description: 'The user throws an electrically charged tackle. May paralyze.',
      color: '#F8D030',
      animation: 'lightning',
      effect: { status: 'PAR', chance: 0.3 }
    },
    Thunderbolt: {
      id: 'Thunderbolt',
      name: 'Thunderbolt',
      type: 'Electric',
      category: 'special',
      power: 90,
      accuracy: 100,
      maxPp: 15,
      description: 'A strong electric blast crashes down on the target. May paralyze.',
      color: '#F8D030',
      animation: 'lightning',
      effect: { status: 'PAR', chance: 0.15 }
    },
    Thunder: {
      id: 'Thunder',
      name: 'Thunder',
      type: 'Electric',
      category: 'special',
      power: 110,
      accuracy: 70,
      maxPp: 10,
      description: 'A wicked thunderbolt strikes the target. May cause paralysis.',
      color: '#F8D030',
      animation: 'lightning',
      effect: { status: 'PAR', chance: 0.3 }
    },

    // Ice Moves
    IceShard: {
      id: 'IceShard',
      name: 'Ice Shard',
      type: 'Ice',
      category: 'physical',
      power: 40,
      accuracy: 100,
      maxPp: 30,
      priority: 1,
      description: 'The user flash-freezes chunks of ice and hurls them. Goes first.',
      color: '#98D8D8',
      animation: 'water'
    },
    IceBeam: {
      id: 'IceBeam',
      name: 'Ice Beam',
      type: 'Ice',
      category: 'special',
      power: 90,
      accuracy: 100,
      maxPp: 10,
      description: 'The target is struck with an icy-cold beam of energy. May freeze.',
      color: '#98D8D8',
      animation: 'beam',
      effect: { status: 'FRZ', chance: 0.1 }
    },
    Blizzard: {
      id: 'Blizzard',
      name: 'Blizzard',
      type: 'Ice',
      category: 'special',
      power: 110,
      accuracy: 70,
      maxPp: 5,
      description: 'A howling blizzard is summoned to strike the target. May freeze.',
      color: '#98D8D8',
      animation: 'powder',
      effect: { status: 'FRZ', chance: 0.2 }
    },

    // Ground Moves
    MudSlap: {
      id: 'MudSlap',
      name: 'Mud-Slap',
      type: 'Ground',
      category: 'special',
      power: 20,
      accuracy: 100,
      maxPp: 10,
      description: 'The user hurls mud in the target\'s face to inflict damage.',
      color: '#E0C068',
      animation: 'earth'
    },
    Earthquake: {
      id: 'Earthquake',
      name: 'Earthquake',
      type: 'Ground',
      category: 'physical',
      power: 100,
      accuracy: 100,
      maxPp: 10,
      description: 'The user sets off an earthquake that strikes surrounding targets.',
      color: '#E0C068',
      animation: 'earth'
    },

    // Rock Moves
    RockThrow: {
      id: 'RockThrow',
      name: 'Rock Throw',
      type: 'Rock',
      category: 'physical',
      power: 50,
      accuracy: 90,
      maxPp: 15,
      description: 'The user picks up and hurls a small rock at the target.',
      color: '#B8A038',
      animation: 'earth'
    },
    RockSlide: {
      id: 'RockSlide',
      name: 'Rock Slide',
      type: 'Rock',
      category: 'physical',
      power: 75,
      accuracy: 90,
      maxPp: 10,
      description: 'Large boulders are hurled at the target to inflict damage.',
      color: '#B8A038',
      animation: 'earth'
    },

    // Psychic Moves
    Confusion: {
      id: 'Confusion',
      name: 'Confusion',
      type: 'Psychic',
      category: 'special',
      power: 50,
      accuracy: 100,
      maxPp: 25,
      description: 'A telekinetic attack that hits the target with mind waves.',
      color: '#F85888',
      animation: 'psychic'
    },
    Psychic: {
      id: 'Psychic',
      name: 'Psychic',
      type: 'Psychic',
      category: 'special',
      power: 90,
      accuracy: 100,
      maxPp: 10,
      description: 'The target is hit by a strong telekinetic force.',
      color: '#F85888',
      animation: 'psychic'
    },
    Hypnosis: {
      id: 'Hypnosis',
      name: 'Hypnosis',
      type: 'Psychic',
      category: 'status',
      power: 0,
      accuracy: 60,
      maxPp: 20,
      description: 'The user employs hypnotic suggestion to make the target sleep.',
      color: '#F85888',
      animation: 'psychic',
      effect: { status: 'SLP', chance: 1.0 }
    },

    // Ghost Moves
    Lick: {
      id: 'Lick',
      name: 'Lick',
      type: 'Ghost',
      category: 'physical',
      power: 30,
      accuracy: 100,
      maxPp: 30,
      description: 'The target is licked with a long tongue. May paralyze.',
      color: '#705898',
      animation: 'shadow',
      effect: { status: 'PAR', chance: 0.3 }
    },
    ShadowBall: {
      id: 'ShadowBall',
      name: 'Shadow Ball',
      type: 'Ghost',
      category: 'special',
      power: 80,
      accuracy: 100,
      maxPp: 15,
      description: 'The user hurls a shadowy blob at the target.',
      color: '#705898',
      animation: 'shadow'
    },

    // Dragon Moves
    DragonBreath: {
      id: 'DragonBreath',
      name: 'Dragon Breath',
      type: 'Dragon',
      category: 'special',
      power: 60,
      accuracy: 100,
      maxPp: 20,
      description: 'The user exhales a powerful blast of dragon fire. May paralyze.',
      color: '#7038F8',
      animation: 'fireball',
      effect: { status: 'PAR', chance: 0.3 }
    },
    DragonClaw: {
      id: 'DragonClaw',
      name: 'Dragon Claw',
      type: 'Dragon',
      category: 'physical',
      power: 80,
      accuracy: 100,
      maxPp: 15,
      description: 'The user slashes the target with sharp, draconic claws.',
      color: '#7038F8',
      animation: 'slash'
    },
    Outrage: {
      id: 'Outrage',
      name: 'Outrage',
      type: 'Dragon',
      category: 'physical',
      power: 120,
      accuracy: 100,
      maxPp: 10,
      description: 'The user rampages and attacks in furious anger.',
      color: '#7038F8',
      animation: 'slash'
    },

    // Poison Moves
    PoisonSting: {
      id: 'PoisonSting',
      name: 'Poison Sting',
      type: 'Poison',
      category: 'physical',
      power: 15,
      accuracy: 100,
      maxPp: 35,
      description: 'The user stabs the target with a poisonous barb. May poison.',
      color: '#A040A0',
      animation: 'slash',
      effect: { status: 'PSN', chance: 0.3 }
    },
    SludgeBomb: {
      id: 'SludgeBomb',
      name: 'Sludge Bomb',
      type: 'Poison',
      category: 'special',
      power: 90,
      accuracy: 100,
      maxPp: 10,
      description: 'Unsanitary sludge is hurled at the target. May cause poison.',
      color: '#A040A0',
      animation: 'powder',
      effect: { status: 'PSN', chance: 0.3 }
    },

    // Flying Moves
    Gust: {
      id: 'Gust',
      name: 'Gust',
      type: 'Flying',
      category: 'special',
      power: 40,
      accuracy: 100,
      maxPp: 35,
      description: 'A gust of wind is whipped up by wings and launched at the target.',
      color: '#A890F0',
      animation: 'leaf'
    },
    WingAttack: {
      id: 'WingAttack',
      name: 'Wing Attack',
      type: 'Flying',
      category: 'physical',
      power: 60,
      accuracy: 100,
      maxPp: 35,
      description: 'The target is struck with large, imposing wings spread wide.',
      color: '#A890F0',
      animation: 'slash'
    },

    // Bug Moves
    BugBite: {
      id: 'BugBite',
      name: 'Bug Bite',
      type: 'Bug',
      category: 'physical',
      power: 60,
      accuracy: 100,
      maxPp: 20,
      description: 'The user bites the target with mandibles.',
      color: '#A8B820',
      animation: 'slash'
    },

    // Fighting Moves
    KarateChop: {
      id: 'KarateChop',
      name: 'Karate Chop',
      type: 'Fighting',
      category: 'physical',
      power: 50,
      accuracy: 100,
      maxPp: 25,
      critRatio: 1,
      description: 'The target is attacked with a sharp karate chop. High crit rate.',
      color: '#C03028',
      animation: 'tackle'
    },
    BrickBreak: {
      id: 'BrickBreak',
      name: 'Brick Break',
      type: 'Fighting',
      category: 'physical',
      power: 75,
      accuracy: 100,
      maxPp: 15,
      description: 'The user attacks with swift, hardened chops.',
      color: '#C03028',
      animation: 'tackle'
    },

    // Dark Moves
    Bite: {
      id: 'Bite',
      name: 'Bite',
      type: 'Dark',
      category: 'physical',
      power: 60,
      accuracy: 100,
      maxPp: 25,
      description: 'The target is bitten with viciously sharp fangs.',
      color: '#705848',
      animation: 'slash'
    },
    Crunch: {
      id: 'Crunch',
      name: 'Crunch',
      type: 'Dark',
      category: 'physical',
      power: 80,
      accuracy: 100,
      maxPp: 15,
      description: 'The user crunches the target with sharp fangs. May lower Defense.',
      color: '#705848',
      animation: 'slash',
      effect: { stat: 'defense', stages: -1, chance: 0.2 }
    }
  };

  function getMove(id) {
    return MOVES[id] || MOVES.Tackle;
  }

  return {
    MOVES,
    getMove
  };
});
