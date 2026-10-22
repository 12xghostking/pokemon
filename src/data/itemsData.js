(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ItemsData = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const ITEMS = {
    // Capture Equipment
    pokeBall: {
      id: 'pokeBall',
      name: 'Poké Ball',
      category: 'ball',
      price: 200,
      sellPrice: 100,
      catchMultiplier: 1.0,
      description: 'A device for catching wild Pokémon. It is thrown like a ball.',
      icon: '🔴'
    },
    greatBall: {
      id: 'greatBall',
      name: 'Great Ball',
      category: 'ball',
      price: 600,
      sellPrice: 300,
      catchMultiplier: 1.5,
      description: 'A good, high-performance Ball that provides a higher catch rate than a standard Poké Ball.',
      icon: '🔵'
    },
    ultraBall: {
      id: 'ultraBall',
      name: 'Ultra Ball',
      category: 'ball',
      price: 1200,
      sellPrice: 600,
      catchMultiplier: 2.0,
      description: 'An ultra-performance Ball that provides an even higher Pokémon catch rate than a Great Ball.',
      icon: '🟡'
    },
    netBall: {
      id: 'netBall',
      name: 'Net Ball',
      category: 'ball',
      price: 800,
      sellPrice: 400,
      catchMultiplier: 1.0,
      specialMultiplier: (target) => {
        const types = Array.isArray(target.types) ? target.types : [target.type];
        return (types.includes('Water') || types.includes('Bug')) ? 3.0 : 1.0;
      },
      description: 'A special Poké Ball that works especially well on Water- and Bug-type Pokémon (3x).',
      icon: '🕸️'
    },
    duskBall: {
      id: 'duskBall',
      name: 'Dusk Ball',
      category: 'ball',
      price: 800,
      sellPrice: 400,
      catchMultiplier: 1.0,
      specialMultiplier: (target, zoneId) => {
        return (zoneId === 'crypt' || zoneId === 'cave') ? 3.0 : 1.0;
      },
      description: 'A special Poké Ball that makes it easier to capture Pokémon in dark caves and haunted crypts (3x).',
      icon: '🟣'
    },
    masterBall: {
      id: 'masterBall',
      name: 'Master Ball',
      category: 'ball',
      price: 10000,
      sellPrice: 5000,
      catchMultiplier: 255.0,
      description: 'The best Ball with the ultimate level of performance. It will catch any wild Pokémon without fail.',
      icon: '👑'
    },

    // Medicine & Healing
    potion: {
      id: 'potion',
      name: 'Potion',
      category: 'medicine',
      price: 300,
      sellPrice: 150,
      healHp: 20,
      description: 'A spray-type medicine for treating wounds. It restores the HP of one Pokémon by 20 points.',
      icon: '🧪'
    },
    superPotion: {
      id: 'superPotion',
      name: 'Super Potion',
      category: 'medicine',
      price: 700,
      sellPrice: 350,
      healHp: 50,
      description: 'A spray-type medicine for treating wounds. It restores the HP of one Pokémon by 50 points.',
      icon: '🧴'
    },
    hyperPotion: {
      id: 'hyperPotion',
      name: 'Hyper Potion',
      category: 'medicine',
      price: 1500,
      sellPrice: 750,
      healHp: 200,
      description: 'A spray-type medicine for treating wounds. It restores the HP of one Pokémon by 200 points.',
      icon: '🍶'
    },
    maxPotion: {
      id: 'maxPotion',
      name: 'Max Potion',
      category: 'medicine',
      price: 2500,
      sellPrice: 1250,
      healHp: 'all',
      description: 'A medicine that completely restores the full HP of a single Pokémon.',
      icon: '✨'
    },
    revive: {
      id: 'revive',
      name: 'Revive',
      category: 'medicine',
      price: 1500,
      sellPrice: 750,
      revivePercent: 0.5,
      description: 'A medicine that can revive a single Pokémon that has fainted. It restores half of its max HP.',
      icon: '💎'
    },
    maxRevive: {
      id: 'maxRevive',
      name: 'Max Revive',
      category: 'medicine',
      price: 3000,
      sellPrice: 1500,
      revivePercent: 1.0,
      description: 'A medicine that can revive a single Pokémon that has fainted. It completely restores maximum HP.',
      icon: '🌟'
    },
    antidote: {
      id: 'antidote',
      name: 'Antidote',
      category: 'medicine',
      price: 100,
      sellPrice: 50,
      cureStatus: ['PSN'],
      description: 'A spray-type medicine. It lifts the effect of poisoning from one Pokémon.',
      icon: '🌿'
    },
    burnHeal: {
      id: 'burnHeal',
      name: 'Burn Heal',
      category: 'medicine',
      price: 250,
      sellPrice: 125,
      cureStatus: ['BRN'],
      description: 'A spray-type medicine. It heals a single Pokémon from a burn.',
      icon: '❄️'
    },
    paralyzeHeal: {
      id: 'paralyzeHeal',
      name: 'Paralyze Heal',
      category: 'medicine',
      price: 200,
      sellPrice: 100,
      cureStatus: ['PAR'],
      description: 'A spray-type medicine. It eliminates paralysis from a single Pokémon.',
      icon: '⚡'
    },
    awakening: {
      id: 'awakening',
      name: 'Awakening',
      category: 'medicine',
      price: 250,
      sellPrice: 125,
      cureStatus: ['SLP'],
      description: 'A spray-type medicine. It awakens a Pokémon from the clutches of sleep.',
      icon: '☕'
    },
    fullHeal: {
      id: 'fullHeal',
      name: 'Full Heal',
      category: 'medicine',
      price: 600,
      sellPrice: 300,
      cureStatus: ['PSN', 'BRN', 'PAR', 'SLP', 'FRZ'],
      description: 'A spray-type medicine. It heals all status problems of a single Pokémon.',
      icon: '💖'
    },
    ether: {
      id: 'ether',
      name: 'Ether',
      category: 'medicine',
      price: 1200,
      sellPrice: 600,
      restorePp: 10,
      description: 'Restores the PP of a selected move for a single Pokémon by 10 points.',
      icon: '🧪'
    },

    // Evolution Items
    fireStone: {
      id: 'fireStone',
      name: 'Fire Stone',
      category: 'evolution',
      price: 3000,
      sellPrice: 1500,
      description: 'A peculiar stone that makes certain species of Pokémon evolve. It has a warm orange glow.',
      icon: '🔥'
    },
    waterStone: {
      id: 'waterStone',
      name: 'Water Stone',
      category: 'evolution',
      price: 3000,
      sellPrice: 1500,
      description: 'A peculiar stone that makes certain species of Pokémon evolve. It is clear blue like a pool of water.',
      icon: '💧'
    },
    thunderStone: {
      id: 'thunderStone',
      name: 'Thunder Stone',
      category: 'evolution',
      price: 3000,
      sellPrice: 1500,
      description: 'A peculiar stone that makes certain species of Pokémon evolve. It has a lightning-bolt pattern in it.',
      icon: '⚡'
    },
    leafStone: {
      id: 'leafStone',
      name: 'Leaf Stone',
      category: 'evolution',
      price: 3000,
      sellPrice: 1500,
      description: 'A peculiar stone that makes certain species of Pokémon evolve. It has an unmistakable leaf pattern.',
      icon: '🍃'
    },
    moonStone: {
      id: 'moonStone',
      name: 'Moon Stone',
      category: 'evolution',
      price: 3000,
      sellPrice: 1500,
      description: 'A peculiar stone that makes certain species of Pokémon evolve. It is as dark as the night sky.',
      icon: '🌙'
    },

    // Rare & Useful Items
    rareCandy: {
      id: 'rareCandy',
      name: 'Rare Candy',
      category: 'special',
      price: 4800,
      sellPrice: 2400,
      levelUp: true,
      description: 'A candy that is packed with energy. When consumed, it raises a Pokémon\'s level by one.',
      icon: '🍬'
    },
    escapeRope: {
      id: 'escapeRope',
      name: 'Escape Rope',
      category: 'special',
      price: 550,
      sellPrice: 275,
      escapeToHome: true,
      description: 'A long, durable rope. Use it to instantly warp back to the safety of Pellet Town.',
      icon: '🪢'
    },
    nugget: {
      id: 'nugget',
      name: 'Nugget',
      category: 'treasure',
      price: null, // cannot be purchased
      sellPrice: 5000,
      description: 'A nugget of purest gold that gives off a lustrous gleam. Can be sold at a very high price to shops.',
      icon: '🪙'
    }
  };

  function getItem(id) {
    return ITEMS[id] || null;
  }

  return {
    ITEMS,
    getItem
  };
});
