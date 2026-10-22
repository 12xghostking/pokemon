(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const PokemonData = require('../data/pokemonData');
    module.exports = factory(PokemonData);
  } else {
    root.CatchEngine = factory(root.PokemonData);
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this, function (PokemonData) {
  'use strict';

  /**
   * Calculate capture outcome based on standard Pokémon catch rate formula
   * @param {Object} target - The wild pokemon instance
   * @param {Object} ballItem - The item definition of the ball used
   * @param {String} zoneId - Current area ID
   * @param {Object} options - Optional rng override for deterministic testing
   */
  function calculateCatch(target, ballItem, zoneId = 'pelletTown', options = {}) {
    if (!target || !ballItem) {
      throw new Error('Target Pokémon and Poké Ball item are required.');
    }

    // Master ball guaranteed catch
    if (ballItem.id === 'masterBall' || ballItem.catchMultiplier >= 255) {
      return {
        success: true,
        shakes: 4,
        criticalCatch: false,
        message: `Gotcha! ${target.name} was caught!`
      };
    }

    // Determine ball multiplier
    let ballMultiplier = ballItem.catchMultiplier || 1.0;
    if (typeof ballItem.specialMultiplier === 'function') {
      ballMultiplier = ballItem.specialMultiplier(target, zoneId);
    }

    // Status bonus
    let statusBonus = 1.0;
    if (target.status === 'SLP' || target.status === 'FRZ') {
      statusBonus = 2.0;
    } else if (target.status === 'PAR' || target.status === 'BRN' || target.status === 'PSN') {
      statusBonus = 1.5;
    }

    // Base catch rate from species (fallback 45)
    let speciesCatchRate = 45;
    if (PokemonData) {
      const species = PokemonData.getPokemonSpecies(target.speciesId);
      if (species && species.catchRate) speciesCatchRate = species.catchRate;
    } else if (target.catchRate) {
      speciesCatchRate = target.catchRate;
    }

    const maxHp = target.maxHp || 100;
    const currentHp = Math.max(1, target.currentHp || 1);

    // Standard Capture Value `a`
    // a = [ ( (3 * maxHp - 2 * currentHp) * catchRate * ballMultiplier ) / (3 * maxHp) ] * statusBonus
    const numerator = (3 * maxHp - 2 * currentHp) * speciesCatchRate * ballMultiplier;
    const denominator = 3 * maxHp;
    let a = Math.floor(numerator / denominator) * statusBonus;

    // Minimum 1, maximum 255
    a = Math.max(1, Math.min(255, a));

    // If a >= 255, guaranteed catch
    if (a >= 255) {
      return {
        success: true,
        shakes: 4,
        criticalCatch: false,
        message: `Gotcha! ${target.name} was caught!`
      };
    }

    // Shake check probability: b = 65536 * (a / 255)^0.25
    const b = Math.floor(65536 * Math.pow(a / 255, 0.75));

    const rng = typeof options.rng === 'function' ? options.rng : () => Math.floor(Math.random() * 65536);

    let successfulShakes = 0;
    for (let i = 0; i < 4; i++) {
      const roll = rng();
      if (roll < b) {
        successfulShakes++;
      } else {
        break; // Broke free at this shake
      }
    }

    const success = (successfulShakes === 4);

    let message = '';
    if (success) {
      message = `Gotcha! ${target.name} was caught!`;
    } else if (successfulShakes === 0) {
      message = 'Oh no! The Pokémon broke free right away!';
    } else if (successfulShakes === 1) {
      message = 'Aww! It appeared to be caught!';
    } else if (successfulShakes === 2) {
      message = 'Aargh! Almost had it!';
    } else {
      message = 'Gah! It was so close, too!';
    }

    return {
      success,
      shakes: successfulShakes,
      criticalCatch: false,
      message,
      captureValue: a,
      shakeProbability: b
    };
  }

  return {
    calculateCatch
  };
});
