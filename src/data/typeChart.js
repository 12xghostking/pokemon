(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TypeChart = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const TYPES = [
    'Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice',
    'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug',
    'Rock', 'Ghost', 'Dragon', 'Steel', 'Dark', 'Fairy'
  ];

  const TYPE_COLORS = {
    Normal: '#A8A878',
    Fire: '#F08030',
    Water: '#6890F0',
    Grass: '#78C850',
    Electric: '#F8D030',
    Ice: '#98D8D8',
    Fighting: '#C03028',
    Poison: '#A040A0',
    Ground: '#E0C068',
    Flying: '#A890F0',
    Psychic: '#F85888',
    Bug: '#A8B820',
    Rock: '#B8A038',
    Ghost: '#705898',
    Dragon: '#7038F8',
    Steel: '#B8B8D0',
    Dark: '#705848',
    Fairy: '#EE99AC'
  };

  // Attacker -> Defender -> Multiplier
  const EFFECTIVENESS = {
    Normal: { Rock: 0.5, Ghost: 0, Steel: 0.5 },
    Fire: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
    Water: { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
    Grass: { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
    Electric: { Water: 2, Grass: 0.5, Electric: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
    Ice: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
    Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5 },
    Poison: { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
    Ground: { Fire: 2, Grass: 0.5, Electric: 2, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
    Flying: { Grass: 2, Electric: 0.5, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
    Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
    Bug: { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5 },
    Rock: { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
    Ghost: { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
    Dragon: { Dragon: 2, Steel: 0.5, Fairy: 0 },
    Steel: { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2 },
    Dark: { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
    Fairy: { Fire: 0.5, Fighting: 2, Poison: 0.5, Dragon: 2, Dark: 2, Steel: 0.5 }
  };

  function getSingleTypeEffectiveness(moveType, targetType) {
    if (!moveType || !targetType) return 1;
    if (EFFECTIVENESS[moveType] && EFFECTIVENESS[moveType][targetType] !== undefined) {
      return EFFECTIVENESS[moveType][targetType];
    }
    return 1;
  }

  function getTypeEffectiveness(moveType, targetTypes) {
    if (!moveType || !targetTypes) return 1;
    const types = Array.isArray(targetTypes) ? targetTypes : [targetTypes];
    let multiplier = 1;
    for (const t of types) {
      multiplier *= getSingleTypeEffectiveness(moveType, t);
    }
    return multiplier;
  }

  function getEffectivenessText(multiplier) {
    if (multiplier === 0) return "It had no effect!";
    if (multiplier >= 2) return "It's super effective!";
    if (multiplier <= 0.5) return "It's not very effective...";
    return "";
  }

  function getTypeColor(type) {
    return TYPE_COLORS[type] || '#777777';
  }

  return {
    TYPES,
    TYPE_COLORS,
    EFFECTIVENESS,
    getSingleTypeEffectiveness,
    getTypeEffectiveness,
    getEffectivenessText,
    getTypeColor
  };
});
