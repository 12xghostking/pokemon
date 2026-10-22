const battleBackgroundImage = new Image();
battleBackgroundImage.src = './img/battleBackground.png';

const battleBackground = new Sprite({
  position: { x: 0, y: 0 },
  image: battleBackgroundImage
});

let enemyMonster = null;
let playerMonster = null;
let renderedSprites = [];
let battleAnimationId = null;
let battleQueue = [];
let isProcessingTurn = false;

// Active battle metadata
let currentBattleType = 'wild'; // 'wild', 'trainer', 'tower'
let currentTrainerData = null;
let currentTrainerTeam = [];
let currentTrainerIndex = 0;
let currentTowerFloor = 1;

/**
 * Initialize a Battle (Wild, Trainer, or Tower)
 */
function initBattle(encounterData = {}) {
  const state = GameState.getState();
  currentBattleType = encounterData.type || 'wild';
  currentTrainerData = encounterData.trainer || null;
  currentTrainerTeam = encounterData.trainerTeam || [];
  currentTrainerIndex = 0;
  currentTowerFloor = encounterData.floor || 1;

  // Make sure player has at least one conscious pokemon
  let activePlayerPk = state.party.find(p => p.currentHp > 0);
  if (!activePlayerPk) {
    GameState.healAllParty();
    activePlayerPk = state.party[0];
  }

  // Determine opponent pokemon
  let enemyPkInstance = null;
  if (currentBattleType === 'trainer' && currentTrainerTeam.length > 0) {
    enemyPkInstance = currentTrainerTeam[0];
  } else if (currentBattleType === 'tower' && encounterData.opponent) {
    enemyPkInstance = encounterData.opponent.team[0];
    currentTrainerTeam = encounterData.opponent.team;
  } else {
    // Wild encounter
    if (encounterData.wildPokemon) {
      enemyPkInstance = encounterData.wildPokemon;
    } else {
      enemyPkInstance = WorldAreas.pickWildEncounter(state.player.currentArea, PokemonData);
    }
  }

  // Record Pokédex encounter
  GameState.recordPokedexEncounter(enemyPkInstance.speciesId);

  // Setup UI
  document.querySelector('#userInterface').style.display = 'block';
  document.querySelector('#dialogueBox').style.display = 'none';

  // Setup Monsters
  enemyMonster = createMonsterFromInstance(enemyPkInstance, true);
  playerMonster = createMonsterFromInstance(activePlayerPk, false);
  renderedSprites = [enemyMonster, playerMonster];
  battleQueue = [];
  isProcessingTurn = false;

  updateBattleHud();
  showActionMenu();

  // Intro message
  if (currentBattleType === 'trainer' && currentTrainerData) {
    queueDialogue(`${currentTrainerData.name}: "${currentTrainerData.introMessage}"`);
    queueDialogue(`${currentTrainerData.name} sent out ${enemyMonster.name}!`);
  } else if (currentBattleType === 'tower') {
    queueDialogue(`Floor ${currentTowerFloor}: Challenger sent out ${enemyMonster.name}!`);
  } else {
    queueDialogue(`A wild ${enemyMonster.name} appeared!`);
  }

  // Switch BGM to Battle Theme
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playBgm('battle');
  }
}

function createMonsterFromInstance(pkInstance, isEnemy) {
  const species = PokemonData.getPokemonSpecies(pkInstance.speciesId);
  let sheetSrc = null;

  if (species && species.sheetSrc) {
    sheetSrc = species.sheetSrc;
  } else if (pkInstance.speciesId === 'Emby') {
    sheetSrc = './img/embySprite.png';
  } else if (pkInstance.speciesId === 'Draggle') {
    sheetSrc = './img/draggleSprite.png';
  }

  let imgObj = null;
  if (sheetSrc) {
    imgObj = new Image();
    imgObj.src = sheetSrc;
  }

  const pos = isEnemy ? { x: 800, y: 100 } : { x: 280, y: 325 };

  // Map moves
  const attacks = pkInstance.moves.map(m => {
    const fullMove = MovesData.getMove(m.id);
    return { ...fullMove, ...m };
  });

  return new Monster({
    position: pos,
    image: imgObj,
    frames: { max: 4, hold: 30 },
    animate: true,
    isEnemy,
    name: pkInstance.name,
    attacks,
    pokemonInstance: pkInstance
  });
}

function updateBattleHud() {
  if (!enemyMonster || !playerMonster) return;

  const enemyPk = enemyMonster.pokemonInstance;
  const playerPk = playerMonster.pokemonInstance;

  // Enemy HUD
  document.querySelector('#enemyName').textContent = enemyMonster.name;
  document.querySelector('#enemyLevel').textContent = `Lv. ${enemyPk ? enemyPk.level : 5}`;

  const enemyHpPct = enemyPk ? Math.max(0, Math.round((enemyPk.currentHp / enemyPk.maxHp) * 100)) : enemyMonster.health;
  document.querySelector('#enemyHealthBar').style.width = enemyHpPct + '%';
  document.querySelector('#enemyHpText').textContent = `HP: ${enemyHpPct}%`;

  const enemyStatusEl = document.querySelector('#enemyStatus');
  if (enemyPk && enemyPk.status) {
    enemyStatusEl.textContent = enemyPk.status;
    enemyStatusEl.style.display = 'inline-block';
  } else {
    enemyStatusEl.style.display = 'none';
  }

  // Player HUD
  document.querySelector('#playerName').textContent = playerMonster.name;
  document.querySelector('#playerLevel').textContent = `Lv. ${playerPk ? playerPk.level : 5}`;

  const playerHpPct = playerPk ? Math.max(0, Math.round((playerPk.currentHp / playerPk.maxHp) * 100)) : playerMonster.health;
  document.querySelector('#playerHealthBar').style.width = playerHpPct + '%';
  if (playerPk) {
    document.querySelector('#playerHpText').textContent = `${playerPk.currentHp} / ${playerPk.maxHp} HP`;
  }

  const playerStatusEl = document.querySelector('#playerStatus');
  if (playerPk && playerPk.status) {
    playerStatusEl.textContent = playerPk.status;
    playerStatusEl.style.display = 'inline-block';
  } else {
    playerStatusEl.style.display = 'none';
  }

  // Player Exp Bar
  if (playerPk) {
    const currentLvlExp = PokemonData.getExpForLevel(playerPk.level);
    const nextLvlExp = PokemonData.getExpForLevel(playerPk.level + 1);
    const expRange = nextLvlExp - currentLvlExp;
    const progress = Math.max(0, playerPk.exp - currentLvlExp);
    const expPct = Math.min(100, Math.round((progress / Math.max(1, expRange)) * 100));
    document.querySelector('#playerExpBar').style.width = expPct + '%';
  }
}

/**
 * Menu View Switchers
 */
function hideAllSubmenus() {
  document.querySelector('#battleActionMenu').style.display = 'none';
  document.querySelector('#attacksBox').style.display = 'none';
  document.querySelector('#battleBagSubmenu').style.display = 'none';
  document.querySelector('#battlePartySubmenu').style.display = 'none';
  document.querySelector('#battleBackBtn').style.display = 'none';
}

function showActionMenu() {
  hideAllSubmenus();
  document.querySelector('#battleActionMenu').style.display = 'grid';
  document.querySelector('#attackType').innerHTML = 'What will you do?';
  document.querySelector('#attackType').style.color = '#0F172A';
}

function showFightMenu() {
  if (isProcessingTurn) return;
  hideAllSubmenus();

  const attacksBox = document.querySelector('#attacksBox');
  attacksBox.style.display = 'grid';
  attacksBox.replaceChildren();
  document.querySelector('#battleBackBtn').style.display = 'block';

  playerMonster.attacks.forEach((attack, index) => {
    const button = document.createElement('button');
    button.className = 'battle-action-btn';
    button.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 6px;
      gap: 2px;
      font-size: 11px;
    `;

    const isOutOfPp = (attack.currentPp !== undefined && attack.currentPp <= 0);

    button.innerHTML = `
      <span style="font-size: 10px; font-weight: bold;">${index + 1}. ${attack.name}</span>
      <span style="font-size: 8px; font-family: monospace; color: ${isOutOfPp ? '#EF4444' : '#64748B'};">
        PP ${attack.currentPp !== undefined ? attack.currentPp : 20}/${attack.maxPp || 20}
      </span>
    `;

    if (isOutOfPp) {
      button.disabled = true;
      button.style.opacity = '0.5';
    }

    button.addEventListener('click', () => {
      executePlayerAttackTurn(attack);
    });

    button.addEventListener('mouseenter', () => {
      document.querySelector('#attackType').innerHTML = `
        <span style="color: ${attack.color || '#38BDF8'};">${attack.type || 'Normal'}</span>
        <div style="font-size: 9px; font-family: monospace; color: #64748B; margin-top: 4px;">
          PWR: ${attack.power || '-'} | ACC: ${attack.accuracy || '-'}%
        </div>
      `;
    });

    attacksBox.append(button);
  });
}

function showBagMenu() {
  if (isProcessingTurn) return;
  hideAllSubmenus();

  const bagSubmenu = document.querySelector('#battleBagSubmenu');
  bagSubmenu.style.display = 'block';
  bagSubmenu.replaceChildren();
  document.querySelector('#battleBackBtn').style.display = 'block';
  document.querySelector('#attackType').innerHTML = 'Select Item';

  const state = GameState.getState();
  const inv = state.inventory || {};

  // Battle usable items
  const usableItems = ['pokeBall', 'greatBall', 'ultraBall', 'netBall', 'duskBall', 'masterBall', 'potion', 'superPotion', 'hyperPotion', 'revive'];
  const itemsInBag = usableItems.filter(id => (inv[id] || 0) > 0);

  if (itemsInBag.length === 0) {
    bagSubmenu.innerHTML = `<div style="font-size: 10px; color: #64748B; padding: 12px; text-align: center;">No battle items in Bag!</div>`;
    return;
  }

  itemsInBag.forEach(id => {
    const item = ItemsData.getItem(id);
    const count = inv[id];

    const itemRow = document.createElement('div');
    itemRow.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 10px;
      margin-bottom: 4px;
      background: #F1F5F9;
      border-radius: 4px;
      cursor: pointer;
    `;

    itemRow.innerHTML = `
      <span style="font-size: 10px;">${item.icon || '📦'} ${item.name}</span>
      <span style="font-size: 10px; font-weight: bold; color: #0284C7;">x${count}</span>
    `;

    itemRow.addEventListener('click', () => {
      useItemInBattle(item);
    });

    bagSubmenu.appendChild(itemRow);
  });
}

function showPartySwitchMenu(isForcedReplacement = false) {
  const isCurrentFainted = Boolean(playerMonster && playerMonster.pokemonInstance && playerMonster.pokemonInstance.currentHp <= 0);
  const isForced = isForcedReplacement || isCurrentFainted;

  // Prevent voluntary switch while an attack animation/turn is processing,
  // but allow forced replacement when active pokemon faints.
  if (isProcessingTurn && !isForced) return;

  // Release processing lock so player can select replacement
  isProcessingTurn = false;
  hideAllSubmenus();

  const partySubmenu = document.querySelector('#battlePartySubmenu');
  partySubmenu.style.display = 'block';
  partySubmenu.replaceChildren();

  const backBtn = document.querySelector('#battleBackBtn');
  if (isForced) {
    if (backBtn) backBtn.style.display = 'none';
    document.querySelector('#attackType').innerHTML = 'Select Next Pokémon';
  } else {
    if (backBtn) backBtn.style.display = 'block';
    document.querySelector('#attackType').innerHTML = 'Switch Pokémon';
  }

  const state = GameState.getState();
  const party = state.party || [];

  party.forEach((pk, idx) => {
    const isCurrent = (playerMonster && playerMonster.pokemonInstance && pk.instanceId === playerMonster.pokemonInstance.instanceId);
    const isFainted = (pk.currentHp <= 0);

    const pkRow = document.createElement('div');
    pkRow.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 10px;
      margin-bottom: 6px;
      background: ${isCurrent ? '#E0F2FE' : (isFainted ? '#FEE2E2' : '#F1F5F9')};
      border: 1px solid ${isCurrent ? '#38BDF8' : (isFainted ? '#FCA5A5' : '#CBD5E1')};
      border-radius: 4px;
      cursor: ${(!isCurrent && !isFainted) ? 'pointer' : 'not-allowed'};
      opacity: ${isFainted ? '0.55' : '1'};
    `;

    pkRow.innerHTML = `
      <div style="display: flex; flex-direction: column;">
        <span style="font-size: 10px; font-weight: bold; color: #0F172A;">${pk.name} (Lv. ${pk.level})</span>
        <span style="font-size: 8px; color: ${isFainted ? '#DC2626' : (isCurrent ? '#0284C7' : '#64748B')}; font-family: monospace;">
          ${isCurrent ? '★ ACTIVE' : (isFainted ? '❌ FAINTED' : 'READY')}
        </span>
      </div>
      <span style="font-size: 9px; font-family: monospace; font-weight: bold; color: ${isFainted ? '#DC2626' : '#0284C7'};">
        HP: ${pk.currentHp}/${pk.maxHp}
      </span>
    `;

    if (!isCurrent && !isFainted) {
      pkRow.addEventListener('click', () => {
        executeSwitchPokemon(pk, isForced);
      });
      pkRow.addEventListener('mouseenter', () => {
        pkRow.style.background = '#BAE6FD';
      });
      pkRow.addEventListener('mouseleave', () => {
        pkRow.style.background = isCurrent ? '#E0F2FE' : '#F1F5F9';
      });
    }

    partySubmenu.appendChild(pkRow);
  });
}

/**
 * Handle Item Usage in Battle (Throw Ball or Heal)
 */
function useItemInBattle(item) {
  if (isProcessingTurn) return;

  if (item.category === 'ball') {
    if (currentBattleType !== 'wild') {
      queueDialogue("The trainer blocked the Ball! Don't be a thief!");
      showActionMenu();
      return;
    }

    // Deduct ball
    GameState.removeItem(item.id, 1);
    hideAllSubmenus();
    isProcessingTurn = true;

    queueDialogue(`Red threw a ${item.name}!`);

    // Calculate catch outcome
    const state = GameState.getState();
    const catchResult = CatchEngine.calculateCatch(enemyMonster.pokemonInstance, item, state.player.currentArea);

    // Create Pokéball Actor
    const ballActor = new PokeballActor({
      startPosition: { x: playerMonster.position.x + 40, y: playerMonster.position.y + 40 },
      targetPosition: { x: enemyMonster.position.x + 20, y: enemyMonster.position.y + 20 },
      shakes: catchResult.shakes,
      success: catchResult.success,
      onComplete: (success) => {
        if (success) {
          queueDialogue(catchResult.message);

          // Add to player party or box
          const addRes = GameState.addPokemon(enemyMonster.pokemonInstance);
          GameState.recordPokedexCatch(enemyMonster.pokemonInstance.speciesId);
          GameState.triggerAchievement('first_catch');
          GameState.updateQuestProgress('daily_catch_2', 1);

          if (addRes.location === 'box') {
            queueDialogue(`${enemyMonster.name} was transferred to Bill's PC Storage Box!`);
          } else {
            queueDialogue(`${enemyMonster.name} joined your party!`);
          }

          queueDialogue(() => {
            endBattle(true);
          });
        } else {
          queueDialogue(catchResult.message);
          // Enemy gets turn to attack
          queueEnemyTurn();
        }
      }
    });

    ballActor.start(renderedSprites, enemyMonster);
  } else if (item.healHp || item.revivePercent) {
    // Heal active pokemon
    const pk = playerMonster.pokemonInstance;
    let used = false;
    if (item.healHp && pk.currentHp < pk.maxHp) {
      const healAmt = item.healHp === 'all' ? pk.maxHp : item.healHp;
      pk.currentHp = Math.min(pk.maxHp, pk.currentHp + healAmt);
      used = true;
    } else if (item.revivePercent && pk.currentHp <= 0) {
      pk.currentHp = Math.floor(pk.maxHp * item.revivePercent);
      used = true;
    }

    if (used) {
      GameState.removeItem(item.id, 1);
      GameState.save();
      updateBattleHud();
      if (typeof AudioEngine !== 'undefined') AudioEngine.playSfx('heal');
      hideAllSubmenus();
      queueDialogue(`Used ${item.name} on ${pk.name}!`);
      queueEnemyTurn();
    }
  }
}

/**
 * Handle Switching Active Pokémon
 */
function executeSwitchPokemon(newPokemonInstance, isForcedReplacement = false) {
  const isCurrentFainted = Boolean(playerMonster && playerMonster.pokemonInstance && playerMonster.pokemonInstance.currentHp <= 0);
  const isForced = isForcedReplacement || isCurrentFainted;

  hideAllSubmenus();
  isProcessingTurn = true;

  if (isCurrentFainted) {
    queueDialogue(`Go! ${newPokemonInstance.name}!`);
  } else {
    queueDialogue(`Come back, ${playerMonster.name}!`);
    queueDialogue(`Go! ${newPokemonInstance.name}!`);
  }

  queueDialogue(() => {
    // Swap instance
    playerMonster = createMonsterFromInstance(newPokemonInstance, false);
    renderedSprites[1] = playerMonster;
    updateBattleHud();

    if (isForced) {
      // Free switch after faint — start fresh turn with player action menu
      isProcessingTurn = false;
      showActionMenu();
    } else {
      // Voluntary switch during battle consumes turn; opponent attacks
      queueEnemyTurn();
    }
  });
}

/**
 * Turn Logic: Player Attacks First or Second
 */
function executePlayerAttackTurn(selectedAttack) {
  if (isProcessingTurn) return;
  isProcessingTurn = true;
  hideAllSubmenus();

  const playerPk = playerMonster.pokemonInstance;
  const enemyPk = enemyMonster.pokemonInstance;

  // Decide enemy move
  const enemyMove = BattleEngine.pickEnemyMove(enemyPk, playerPk);

  // Determine turn order based on Speed and priority
  const playerPriority = selectedAttack.priority || 0;
  const enemyPriority = enemyMove.priority || 0;

  let playerFirst = true;
  if (playerPriority !== enemyPriority) {
    playerFirst = playerPriority > enemyPriority;
  } else {
    const playerSpd = playerPk.stats.speed * (playerPk.status === 'PAR' ? 0.5 : 1.0);
    const enemySpd = enemyPk.stats.speed * (enemyPk.status === 'PAR' ? 0.5 : 1.0);
    playerFirst = playerSpd >= enemySpd;
  }

  if (playerFirst) {
    performPlayerMove(selectedAttack, () => {
      if (enemyPk.currentHp <= 0) {
        handleEnemyFaint();
      } else {
        performEnemyMove(enemyMove, () => {
          if (playerPk.currentHp <= 0) {
            handlePlayerFaint();
          } else {
            handleTurnEnd();
          }
        });
      }
    });
  } else {
    performEnemyMove(enemyMove, () => {
      if (playerPk.currentHp <= 0) {
        handlePlayerFaint();
      } else {
        performPlayerMove(selectedAttack, () => {
          if (enemyPk.currentHp <= 0) {
            handleEnemyFaint();
          } else {
            handleTurnEnd();
          }
        });
      }
    });
  }
}

function queueEnemyTurn() {
  const enemyPk = enemyMonster.pokemonInstance;
  const playerPk = playerMonster.pokemonInstance;
  const enemyMove = BattleEngine.pickEnemyMove(enemyPk, playerPk);

  performEnemyMove(enemyMove, () => {
    if (playerPk.currentHp <= 0) {
      handlePlayerFaint();
    } else {
      handleTurnEnd();
    }
  });
}

function performPlayerMove(attack, next) {
  const playerPk = playerMonster.pokemonInstance;
  const enemyPk = enemyMonster.pokemonInstance;

  const result = BattleEngine.executeAttack(playerPk, enemyPk, attack);

  // Play animation on canvas
  playerMonster.attack({
    attack,
    recipient: enemyMonster,
    renderedSprites,
    onComplete: () => {
      updateBattleHud();
      result.logs.forEach(msg => queueDialogue(msg));
      queueDialogue(() => {
        if (typeof next === 'function') next();
      });
    }
  });
}

function performEnemyMove(attack, next) {
  const playerPk = playerMonster.pokemonInstance;
  const enemyPk = enemyMonster.pokemonInstance;

  const result = BattleEngine.executeAttack(enemyPk, playerPk, attack);

  enemyMonster.attack({
    attack,
    recipient: playerMonster,
    renderedSprites,
    onComplete: () => {
      updateBattleHud();
      result.logs.forEach(msg => queueDialogue(msg));
      queueDialogue(() => {
        if (typeof next === 'function') next();
      });
    }
  });
}

function handleTurnEnd() {
  const playerPk = playerMonster.pokemonInstance;
  const enemyPk = enemyMonster.pokemonInstance;

  // Status damage ticks
  const playerTicks = BattleEngine.applyTurnEndEffects(playerPk);
  const enemyTicks = BattleEngine.applyTurnEndEffects(enemyPk);

  playerTicks.forEach(e => queueDialogue(e.message));
  enemyTicks.forEach(e => queueDialogue(e.message));

  queueDialogue(() => {
    updateBattleHud();
    if (enemyPk.currentHp <= 0) {
      handleEnemyFaint();
    } else if (playerPk.currentHp <= 0) {
      handlePlayerFaint();
    } else {
      isProcessingTurn = false;
      showActionMenu();
    }
  });
}

function handleEnemyFaint() {
  queueDialogue(() => {
    enemyMonster.faint();
  });

  const state = GameState.getState();
  const playerPk = playerMonster.pokemonInstance;
  const enemyPk = enemyMonster.pokemonInstance;

  GameState.recordPokedexDefeat(enemyPk.speciesId);

  // EXP Distribution
  const isTrainer = (currentBattleType !== 'wild');
  const expGained = BattleEngine.calculateExpGain(enemyPk, isTrainer);
  queueDialogue(`${playerPk.name} gained ${expGained} EXP points!`);

  // Apply Level Up
  const expResult = BattleEngine.applyExpGain(playerPk, expGained);
  if (expResult.leveledUp) {
    expResult.levelsGained.forEach(lvl => {
      queueDialogue(() => {
        if (typeof AudioEngine !== 'undefined') AudioEngine.playSfx('levelUp');
      });
      queueDialogue(`${playerPk.name} grew to Level ${lvl.level}!`);
    });
  }

  // Check if trainer has remaining pokemon
  if (currentBattleType === 'trainer' && currentTrainerTeam && currentTrainerIndex < currentTrainerTeam.length - 1) {
    currentTrainerIndex++;
    const nextEnemy = currentTrainerTeam[currentTrainerIndex];
    queueDialogue(`${currentTrainerData.name} is about to send out ${nextEnemy.name}!`);
    queueDialogue(() => {
      enemyMonster = createMonsterFromInstance(nextEnemy, true);
      renderedSprites[0] = enemyMonster;
      updateBattleHud();
      isProcessingTurn = false;
      showActionMenu();
    });
    return;
  }

  // Complete Victory!
  if (currentBattleType === 'trainer' && currentTrainerData) {
    queueDialogue(`${currentTrainerData.name}: "${currentTrainerData.defeatMessage}"`);
    queueDialogue(`Red defeated ${currentTrainerData.name}!`);
    queueDialogue(`Red received 🪙 ${currentTrainerData.rewardCoins} for winning!`);

    GameState.addCoins(currentTrainerData.rewardCoins);

    // Badges & Quest triggers
    if (currentTrainerData.badgeReward) {
      GameState.addBadge(currentTrainerData.badgeReward);
      queueDialogue(`Red earned the prestigious ${currentTrainerData.badgeReward}!`);
    }

    if (currentTrainerData.rewardItems) {
      currentTrainerData.rewardItems.forEach(ri => {
        GameState.addItem(ri.itemId, ri.count);
      });
    }

    GameState.updateQuestProgress('daily_win_3', 1);
  } else if (currentBattleType === 'tower') {
    const floorRewards = BattleTower.calculateFloorRewards(currentTowerFloor);
    GameState.addCoins(floorRewards.coins);
    state.towerStats.currentFloor = currentTowerFloor + 1;
    state.towerStats.highestStreak = Math.max(state.towerStats.highestStreak || 0, currentTowerFloor);
    state.towerStats.totalWins = (state.towerStats.totalWins || 0) + 1;
    GameState.updateQuestProgress('daily_tower_1', 1);
    GameState.updateQuestProgress('daily_win_3', 1);
    GameState.save();

    queueDialogue(`Floor ${currentTowerFloor} Cleared! Earned 🪙 ${floorRewards.coins}!`);
  } else {
    // Wild victory
    const rewardCoins = 50 + enemyPk.level * 10;
    GameState.addCoins(rewardCoins);
    GameState.updateQuestProgress('daily_win_3', 1);
    queueDialogue(`Red defeated the wild ${enemyPk.name} and found 🪙 ${rewardCoins}!`);
  }

  queueDialogue(() => {
    endBattle(true);
  });
}

function handlePlayerFaint() {
  queueDialogue(() => {
    playerMonster.faint();
  });

  const state = GameState.getState();
  const nextAlive = state.party.find(p => p.currentHp > 0);

  if (nextAlive) {
    queueDialogue(`${playerMonster.name} fainted! Select your next Pokémon!`);
    queueDialogue(() => {
      showPartySwitchMenu(true);
    });
  } else {
    // Entire party fainted - Blackout!
    queueDialogue("Red is out of usable Pokémon!");
    queueDialogue("Red blacked out and rushed back to the Pokémon Center...");
    queueDialogue(() => {
      GameState.healAllParty();
      state.player.currentArea = 'pelletTown';
      GameState.save();
      endBattle(false);
    });
  }
}

function endBattle(won = true) {
  gsap.to('#overlappingDiv', {
    opacity: 1,
    duration: 0.5,
    onComplete: () => {
      cancelAnimationFrame(battleAnimationId);
      document.querySelector('#userInterface').style.display = 'none';

      // Resume map animation & BGM
      if (typeof animate === 'function') animate();

      gsap.to('#overlappingDiv', {
        opacity: 0,
        duration: 0.5
      });

      battle.initiated = false;
      isProcessingTurn = false;

      if (typeof AudioEngine !== 'undefined') {
        AudioEngine.playBgm('map');
      }

      if (typeof ModalManager !== 'undefined') {
        ModalManager.updateHudValues();
      }
    }
  });
}

function queueDialogue(actionOrText) {
  battleQueue.push(actionOrText);
  const dialogueBox = document.querySelector('#dialogueBox');

  if (dialogueBox.style.display === 'none') {
    advanceDialogueQueue();
  }
}

function advanceDialogueQueue() {
  const dialogueBox = document.querySelector('#dialogueBox');

  if (battleQueue.length > 0) {
    const nextItem = battleQueue.shift();

    if (typeof nextItem === 'function') {
      nextItem();
      advanceDialogueQueue();
    } else {
      dialogueBox.style.display = 'block';
      dialogueBox.innerHTML = nextItem;
    }
  } else {
    dialogueBox.style.display = 'none';
  }
}

function animateBattle() {
  battleAnimationId = window.requestAnimationFrame(animateBattle);
  battleBackground.draw();

  renderedSprites.forEach((sprite) => {
    sprite.draw();
  });

  // Render combat particle effects
  if (typeof window !== 'undefined' && window.particleSystem && c) {
    window.particleSystem.updateCombat();
    window.particleSystem.drawCombat(c);
  }
}

// Click dialogue box or canvas to advance messages
document.querySelector('#dialogueBox').addEventListener('click', () => {
  advanceDialogueQueue();
});

const gameCanvasEl = document.querySelector('#gameCanvas');
if (gameCanvasEl) {
  gameCanvasEl.addEventListener('click', () => {
    if (typeof battle !== 'undefined' && battle.initiated) {
      const dialogueBox = document.querySelector('#dialogueBox');
      if (dialogueBox && dialogueBox.style.display !== 'none') {
        advanceDialogueQueue();
      }
    }
  });
}

// Setup Action Menu Listeners
document.querySelector('#battleFightBtn').addEventListener('click', showFightMenu);
document.querySelector('#battleBagBtn').addEventListener('click', showBagMenu);
document.querySelector('#battlePokemonBtn').addEventListener('click', () => {
  const isCurrentFainted = Boolean(playerMonster && playerMonster.pokemonInstance && playerMonster.pokemonInstance.currentHp <= 0);
  showPartySwitchMenu(isCurrentFainted);
});
document.querySelector('#battleRunBtn').addEventListener('click', () => {
  if (currentBattleType !== 'wild') {
    queueDialogue("No! There's no running from a Trainer battle!");
    return;
  }
  if (Math.random() < 0.8) {
    queueDialogue("Got away safely!");
    queueDialogue(() => {
      endBattle(true);
    });
  } else {
    queueDialogue("Can't escape!");
    queueEnemyTurn();
  }
});

document.querySelector('#battleBackBtn').addEventListener('click', () => {
  showActionMenu();
});
