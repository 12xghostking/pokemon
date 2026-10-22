(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const TypeChart = require('../data/typeChart');
    const MovesData = require('../data/movesData');
    const PokemonData = require('../data/pokemonData');
    module.exports = factory(TypeChart, MovesData, PokemonData);
  } else {
    root.BattleEngine = factory(root.TypeChart, root.MovesData, root.PokemonData);
  }
})(typeof self !== 'undefined' ? self : this, function (TypeChart, MovesData, PokemonData) {
  'use strict';

  function getTypeChart() {
    return TypeChart || (typeof root !== 'undefined' ? root.TypeChart : null);
  }

  function getMovesData() {
    return MovesData || (typeof root !== 'undefined' ? root.MovesData : null);
  }

  function getPokemonData() {
    return PokemonData || (typeof root !== 'undefined' ? root.PokemonData : null);
  }

  /**
   * Calculate damage according to the standard Pokémon damage formula
   */
  function calculateDamage(attacker, defender, move, options = {}) {
    if (!move || move.category === 'status') {
      return { damage: 0, isCritical: false, effectiveness: 1, effectivenessText: '' };
    }

    const typeChart = getTypeChart();
    const pokemonData = getPokemonData();

    // Attacker stats
    const level = attacker.level || 5;
    const isPhysical = move.category === 'physical';

    let attackStat = isPhysical ? attacker.stats.attack : attacker.stats.spAttack;
    let defenseStat = isPhysical ? defender.stats.defense : defender.stats.spDefense;

    // Burn halves physical attack power
    if (attacker.status === 'BRN' && isPhysical) {
      attackStat = Math.floor(attackStat * 0.5);
    }

    // Critical Hit Check
    let critChance = move.critRatio ? 0.125 : 0.0625;
    const isCritical = options.critOverride !== undefined ? options.critOverride : (Math.random() < critChance);
    const critMultiplier = isCritical ? 1.5 : 1.0;

    // Base damage formula
    const baseDamage = Math.floor(Math.floor((2 * level / 5 + 2) * move.power * (attackStat / Math.max(1, defenseStat))) / 50) + 2;

    // Same-Type Attack Bonus (STAB)
    let attackerTypes = attacker.types || [];
    if (!attackerTypes.length && pokemonData) {
      const species = pokemonData.getPokemonSpecies(attacker.speciesId);
      if (species) attackerTypes = species.types;
    }
    const hasStab = attackerTypes.includes(move.type);
    const stabMultiplier = hasStab ? 1.5 : 1.0;

    // Type Effectiveness
    let defenderTypes = defender.types || [];
    if (!defenderTypes.length && pokemonData) {
      const defSpecies = pokemonData.getPokemonSpecies(defender.speciesId);
      if (defSpecies) defenderTypes = defSpecies.types;
    }
    const effectiveness = typeChart ? typeChart.getTypeEffectiveness(move.type, defenderTypes) : 1;
    const effectivenessText = typeChart ? typeChart.getEffectivenessText(effectiveness) : '';

    if (effectiveness === 0) {
      return { damage: 0, isCritical: false, effectiveness: 0, effectivenessText };
    }

    // Random variance [0.85 - 1.00]
    const randomMultiplier = options.randomMultiplier !== undefined ? options.randomMultiplier : (0.85 + Math.random() * 0.15);

    let finalDamage = Math.floor(baseDamage * critMultiplier * stabMultiplier * effectiveness * randomMultiplier);
    finalDamage = Math.max(1, finalDamage);

    return {
      damage: finalDamage,
      isCritical,
      effectiveness,
      effectivenessText
    };
  }

  /**
   * Check if attacker can move this turn based on status (SLP, FRZ, PAR)
   */
  function checkStatusBeforeMove(combatant) {
    if (!combatant.status) return { canMove: true, message: '' };

    if (combatant.status === 'SLP') {
      combatant.statusTurns = (combatant.statusTurns || 0) + 1;
      // Sleep lasts 1-3 turns
      if (combatant.statusTurns >= 2 && Math.random() < 0.5) {
        combatant.status = null;
        combatant.statusTurns = 0;
        return { canMove: true, message: `${combatant.name} woke up!` };
      }
      return { canMove: false, message: `${combatant.name} is fast asleep!` };
    }

    if (combatant.status === 'FRZ') {
      // 20% thaw chance each turn
      if (Math.random() < 0.2) {
        combatant.status = null;
        return { canMove: true, message: `${combatant.name} thawed out!` };
      }
      return { canMove: false, message: `${combatant.name} is frozen solid!` };
    }

    if (combatant.status === 'PAR') {
      // 25% full paralysis chance
      if (Math.random() < 0.25) {
        return { canMove: false, message: `${combatant.name} is fully paralyzed! It can't move!` };
      }
    }

    return { canMove: true, message: '' };
  }

  /**
   * Apply turn-end status damage (Burn, Poison)
   */
  function applyTurnEndEffects(combatant) {
    const events = [];
    if (!combatant || combatant.currentHp <= 0) return events;

    if (combatant.status === 'BRN') {
      const burnDamage = Math.max(1, Math.floor(combatant.maxHp / 16));
      combatant.currentHp = Math.max(0, combatant.currentHp - burnDamage);
      events.push({
        type: 'status_damage',
        target: combatant,
        damage: burnDamage,
        message: `${combatant.name} is hurt by its burn! (-${burnDamage} HP)`
      });
    } else if (combatant.status === 'PSN') {
      const poisonDamage = Math.max(1, Math.floor(combatant.maxHp / 8));
      combatant.currentHp = Math.max(0, combatant.currentHp - poisonDamage);
      events.push({
        type: 'status_damage',
        target: combatant,
        damage: poisonDamage,
        message: `${combatant.name} is hurt by poison! (-${poisonDamage} HP)`
      });
    }

    return events;
  }

  /**
   * Execute an attack action from user on target
   */
  function executeAttack(attacker, defender, move, options = {}) {
    const logs = [];

    // Deduct PP if move has PP tracking
    if (move && move.currentPp !== undefined && move.currentPp > 0) {
      move.currentPp--;
    }

    // Status check
    const statusCheck = checkStatusBeforeMove(attacker);
    if (statusCheck.message) logs.push(statusCheck.message);
    if (!statusCheck.canMove) {
      return {
        success: false,
        logs,
        damage: 0,
        defenderFainted: defender.currentHp <= 0
      };
    }

    logs.push(`${attacker.name} used ${move.name}!`);

    // Accuracy Check
    const accuracy = move.accuracy || 100;
    const hitRoll = options.hitOverride !== undefined ? options.hitOverride : (Math.random() * 100);
    if (hitRoll > accuracy) {
      logs.push(`${attacker.name}'s attack missed!`);
      return {
        success: false,
        missed: true,
        logs,
        damage: 0,
        defenderFainted: defender.currentHp <= 0
      };
    }

    // Status / Heal moves
    if (move.category === 'status') {
      if (move.effect && move.effect.healPercent) {
        const healAmt = Math.floor(attacker.maxHp * move.effect.healPercent);
        attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + healAmt);
        logs.push(`${attacker.name} regained health! (+${healAmt} HP)`);
      } else if (move.effect && move.effect.status) {
        if (!defender.status) {
          defender.status = move.effect.status;
          defender.statusTurns = 0;
          logs.push(`${defender.name} was inflicted with ${move.effect.status}!`);
        } else {
          logs.push(`It had no effect!`);
        }
      }
      return {
        success: true,
        logs,
        damage: 0,
        defenderFainted: defender.currentHp <= 0
      };
    }

    // Damaging moves
    const damageResult = calculateDamage(attacker, defender, move, options);
    defender.currentHp = Math.max(0, defender.currentHp - damageResult.damage);

    if (damageResult.isCritical) logs.push('A critical hit!');
    if (damageResult.effectivenessText) logs.push(damageResult.effectivenessText);

    // Secondary status effects (e.g. Flamethrower burn, ThunderShock paralyze)
    if (move.effect && move.effect.status && !defender.status && defender.currentHp > 0) {
      const procChance = move.effect.chance || 0.1;
      const procRoll = options.procOverride !== undefined ? options.procOverride : Math.random();
      if (procRoll < procChance) {
        defender.status = move.effect.status;
        defender.statusTurns = 0;
        logs.push(`${defender.name} was inflicted with ${move.effect.status}!`);
      }
    }

    // Recoil (e.g. Struggle)
    if (move.effect && move.effect.recoilPercent) {
      const recoilAmt = Math.max(1, Math.floor(damageResult.damage * move.effect.recoilPercent));
      attacker.currentHp = Math.max(0, attacker.currentHp - recoilAmt);
      logs.push(`${attacker.name} is hit with recoil!`);
    }

    return {
      success: true,
      damage: damageResult.damage,
      isCritical: damageResult.isCritical,
      effectiveness: damageResult.effectiveness,
      logs,
      defenderFainted: defender.currentHp <= 0,
      attackerFainted: attacker.currentHp <= 0
    };
  }

  /**
   * Smart AI Move Decision
   */
  function pickEnemyMove(enemy, target) {
    const movesData = getMovesData();
    const typeChart = getTypeChart();

    // Filter usable moves (PP > 0)
    let availableMoves = enemy.moves.filter(m => (m.currentPp === undefined || m.currentPp > 0));

    // If out of PP, return Struggle
    if (availableMoves.length === 0) {
      return movesData ? movesData.getMove('Struggle') : { id: 'Struggle', name: 'Struggle', power: 50, type: 'Normal', category: 'physical' };
    }

    // Resolve full move definitions
    const scoredMoves = availableMoves.map(m => {
      const fullMove = (movesData && movesData.getMove(m.id)) ? { ...movesData.getMove(m.id), ...m } : m;
      let score = fullMove.power || 10;

      // Type effectiveness weighting
      if (typeChart && fullMove.type && target.types) {
        const eff = typeChart.getTypeEffectiveness(fullMove.type, target.types);
        score *= eff;
      }

      // Check if move can finish off the target
      if (fullMove.power > 0) {
        const estimatedDamage = calculateDamage(enemy, target, fullMove, { randomMultiplier: 0.9 }).damage;
        if (estimatedDamage >= target.currentHp) {
          score += 100; // Prioritize knockout
        }
      }

      // Value status moves if target has full HP and no status
      if (fullMove.category === 'status' && !target.status && target.currentHp === target.maxHp) {
        score += 30;
      }

      return { move: fullMove, score };
    });

    // Sort descending by score
    scoredMoves.sort((a, b) => b.score - a.score);

    // Pick top score or second top for slight variety
    if (scoredMoves.length > 1 && Math.random() < 0.25) {
      return scoredMoves[1].move;
    }
    return scoredMoves[0].move;
  }

  /**
   * Calculate experience gained from defeating a Pokémon
   */
  function calculateExpGain(defeatedPokemon, isTrainerBattle = false) {
    const pokemonData = getPokemonData();
    let baseExp = 64;
    if (pokemonData) {
      const species = pokemonData.getPokemonSpecies(defeatedPokemon.speciesId);
      if (species && species.baseExp) baseExp = species.baseExp;
    } else if (defeatedPokemon.baseExp) {
      baseExp = defeatedPokemon.baseExp;
    }

    const trainerMultiplier = isTrainerBattle ? 1.5 : 1.0;
    const exp = Math.floor((baseExp * defeatedPokemon.level * trainerMultiplier) / 7);
    return Math.max(1, exp);
  }

  /**
   * Check and apply level-up and stat gains
   */
  function applyExpGain(pokemon, expGained) {
    const pokemonData = getPokemonData();
    pokemon.exp = (pokemon.exp || 0) + expGained;

    const leveledUp = [];
    let currentLevel = pokemon.level;

    while (currentLevel < 100) {
      const nextLevelExp = pokemonData ? pokemonData.getExpForLevel(currentLevel + 1) : Math.pow(currentLevel + 1, 3);
      if (pokemon.exp >= nextLevelExp) {
        currentLevel++;
        pokemon.level = currentLevel;

        // Recalculate stats
        if (pokemonData) {
          const species = pokemonData.getPokemonSpecies(pokemon.speciesId);
          if (species) {
            const oldMaxHp = pokemon.maxHp;
            const newMaxHp = pokemonData.calculateStat(species.baseStats.hp, currentLevel, true);
            const hpDiff = newMaxHp - oldMaxHp;
            pokemon.maxHp = newMaxHp;
            pokemon.currentHp += hpDiff;

            pokemon.stats = {
              hp: newMaxHp,
              attack: pokemonData.calculateStat(species.baseStats.attack, currentLevel),
              defense: pokemonData.calculateStat(species.baseStats.defense, currentLevel),
              spAttack: pokemonData.calculateStat(species.baseStats.spAttack, currentLevel),
              spDefense: pokemonData.calculateStat(species.baseStats.spDefense, currentLevel),
              speed: pokemonData.calculateStat(species.baseStats.speed, currentLevel)
            };

            // Check new moves learned at this level
            const newMoveEntries = species.movesByLevel.filter(m => m.level === currentLevel);
            const learnedMoves = newMoveEntries.map(e => e.moveId);

            leveledUp.push({
              level: currentLevel,
              newStats: pokemon.stats,
              learnedMoves
            });
          }
        }
      } else {
        break;
      }
    }

    pokemon.expToNext = pokemonData ? pokemonData.getExpForLevel(pokemon.level + 1) : Math.pow(pokemon.level + 1, 3);

    return {
      leveledUp: leveledUp.length > 0,
      levelsGained: leveledUp
    };
  }

  return {
    calculateDamage,
    checkStatusBeforeMove,
    applyTurnEndEffects,
    executeAttack,
    pickEnemyMove,
    calculateExpGain,
    applyExpGain
  };
});
