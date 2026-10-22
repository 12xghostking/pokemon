(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const PokemonData = require('../data/pokemonData');
    module.exports = factory(PokemonData);
  } else {
    root.BattleTower = factory(root.PokemonData);
  }
})(typeof self !== 'undefined' ? self : this, function (PokemonData) {
  'use strict';

  function getPokemonData() {
    return PokemonData || (typeof root !== 'undefined' ? root.PokemonData : null);
  }

  const TOWER_TIERS = [
    { minFloor: 1, maxFloor: 5, levelBase: 15, teamSize: 1, title: 'Novice Challenger' },
    { minFloor: 6, maxFloor: 10, levelBase: 25, teamSize: 2, title: 'Ace Trainer' },
    { minFloor: 11, maxFloor: 20, levelBase: 38, teamSize: 3, title: 'Tower Veteran' },
    { minFloor: 21, maxFloor: 30, levelBase: 50, teamSize: 3, title: 'Elite Master' },
    { minFloor: 31, maxFloor: 999, levelBase: 65, teamSize: 3, title: 'Legendary Champion' }
  ];

  const TOWER_BOSS_ROSTER = [
    'Charizard', 'Blastoise', 'Venusaur', 'Raichu', 'Gengar',
    'Alakazam', 'Gyarados', 'Lapras', 'Snorlax', 'Draggoking',
    'Vaporeon', 'Jolteon', 'Flareon', 'Infernodra', 'Mewtwo'
  ];

  function getTierForFloor(floor) {
    for (const tier of TOWER_TIERS) {
      if (floor <= tier.maxFloor) return tier;
    }
    return TOWER_TIERS[TOWER_TIERS.length - 1];
  }

  function generateTowerOpponent(floor) {
    const dataMod = getPokemonData();
    if (!dataMod) throw new Error('PokemonData required');

    const tier = getTierForFloor(floor);
    const scaling = Math.floor((floor - tier.minFloor) * 1.5);
    const opponentLevel = Math.min(100, tier.levelBase + scaling);

    const allSpecies = dataMod.getAllSpecies();
    const team = [];

    // On milestone floors (every 5 floors), pick from BOSS roster
    const isBossFloor = (floor % 5 === 0);

    for (let i = 0; i < tier.teamSize; i++) {
      let chosenSpeciesId;
      if (isBossFloor && i === tier.teamSize - 1) {
        chosenSpeciesId = TOWER_BOSS_ROSTER[Math.floor(Math.random() * TOWER_BOSS_ROSTER.length)];
      } else {
        const randSpecies = allSpecies[Math.floor(Math.random() * allSpecies.length)];
        chosenSpeciesId = randSpecies.id;
      }
      team.push(dataMod.createPokemonInstance(chosenSpeciesId, opponentLevel));
    }

    const opponentName = isBossFloor ? `Tower Boss (Floor ${floor})` : `Challenger #${Math.floor(Math.random() * 900 + 100)}`;

    return {
      name: opponentName,
      title: `${tier.title} (Floor ${floor})`,
      floor,
      isBoss: isBossFloor,
      rewardCoins: 300 + floor * 150,
      rewardItem: isBossFloor ? (floor >= 20 ? 'masterBall' : 'rareCandy') : (Math.random() < 0.4 ? 'ultraBall' : null),
      team
    };
  }

  function calculateFloorRewards(floor) {
    const baseCoins = 300 + floor * 150;
    const items = [];
    if (floor % 5 === 0) {
      items.push({ itemId: 'rareCandy', count: 1 });
    }
    if (floor % 10 === 0) {
      items.push({ itemId: 'ultraBall', count: 3 });
    }
    return { coins: baseCoins, items };
  }

  return {
    generateTowerOpponent,
    calculateFloorRewards
  };
});
