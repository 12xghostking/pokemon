(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const PokemonData = require('../data/pokemonData');
    module.exports = factory(PokemonData);
  } else {
    root.GameState = factory(root.PokemonData);
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this, function (PokemonData) {
  'use strict';

  const SAVE_KEY = 'pokemon_adventure_save_v2';
  const CURRENT_VERSION = 2;

  class EventEmitter {
    constructor() {
      this._events = {};
    }
    on(event, listener) {
      if (!this._events[event]) this._events[event] = [];
      this._events[event].push(listener);
      return () => this.off(event, listener);
    }
    off(event, listener) {
      if (!this._events[event]) return;
      this._events[event] = this._events[event].filter(l => l !== listener);
    }
    emit(event, ...args) {
      if (!this._events[event]) return;
      this._events[event].forEach(l => {
        try { l(...args); } catch (e) { console.error(`Error in event listener ${event}:`, e); }
      });
    }
  }

  const events = new EventEmitter();

  function getDefaultDailyQuests() {
    const today = new Date().toISOString().slice(0, 10);
    return {
      date: today,
      quests: [
        { id: 'daily_catch_2', title: 'Catch 2 Wild Pokémon', target: 2, current: 0, claimed: false, rewardCoins: 400, rewardItem: 'greatBall', rewardCount: 2 },
        { id: 'daily_win_3', title: 'Win 3 Battles', target: 3, current: 0, claimed: false, rewardCoins: 500, rewardItem: 'superPotion', rewardCount: 2 },
        { id: 'daily_tower_1', title: 'Win 1 Battle Tower match', target: 1, current: 0, claimed: false, rewardCoins: 600, rewardItem: 'rareCandy', rewardCount: 1 }
      ]
    };
  }

  function getInitialState(pokemonDataModule) {
    const dataMod = pokemonDataModule || PokemonData;

    // Initial Starter: Emby at Lv. 5
    let starter = null;
    if (dataMod && typeof dataMod.createPokemonInstance === 'function') {
      starter = dataMod.createPokemonInstance('Emby', 5, {
        nickname: 'Emby',
        caughtLocation: 'Pellet Town'
      });
    }

    return {
      version: CURRENT_VERSION,
      player: {
        name: 'Red',
        coins: 1000,
        badges: [],
        currentArea: 'pelletTown',
        unlockedAreas: ['pelletTown', 'verdantRoute'],
        defeatedTrainers: []
      },
      party: starter ? [starter] : [],
      box: [],
      inventory: {
        pokeBall: 5,
        potion: 3,
        antidote: 1,
        escapeRope: 1
      },
      pokedex: starter ? {
        [starter.speciesId]: { seen: true, caught: true, countCaught: 1, countDefeated: 0 }
      } : {},
      achievements: {},
      dailyQuests: getDefaultDailyQuests(),
      towerStats: {
        currentFloor: 1,
        highestStreak: 0,
        totalWins: 0
      },
      settings: {
        masterVolume: 0.8,
        bgmVolume: 0.6,
        sfxVolume: 0.8,
        muted: false,
        fastBattle: false,
        reducedMotion: false,
        touchControls: 'auto'
      }
    };
  }

  let state = null;

  function init(pokemonDataModule) {
    state = load(pokemonDataModule);
    checkDailyReset();
    return state;
  }

  function getState() {
    if (!state) state = getInitialState();
    return state;
  }

  function checkDailyReset() {
    if (!state) return;
    const today = new Date().toISOString().slice(0, 10);
    if (!state.dailyQuests || state.dailyQuests.date !== today) {
      state.dailyQuests = getDefaultDailyQuests();
      save();
      events.emit('questsUpdated', state.dailyQuests);
    }
  }

  function validateSaveSchema(data) {
    if (!data || typeof data !== 'object') return false;
    if (!data.player || typeof data.player !== 'object') return false;
    if (!Array.isArray(data.party)) return false;
    if (!Array.isArray(data.box)) return false;
    if (!data.inventory || typeof data.inventory !== 'object') return false;
    if (!data.pokedex || typeof data.pokedex !== 'object') return false;
    return true;
  }

  function migrateSave(data, pokemonDataModule) {
    if (!data.version || data.version < 2) {
      data.version = 2;
      if (!data.dailyQuests) data.dailyQuests = getDefaultDailyQuests();
      if (!data.towerStats) data.towerStats = { currentFloor: 1, highestStreak: 0, totalWins: 0 };
      if (!data.settings) {
        data.settings = {
          masterVolume: 0.8,
          bgmVolume: 0.6,
          sfxVolume: 0.8,
          muted: false,
          fastBattle: false,
          reducedMotion: false,
          touchControls: 'auto'
        };
      }
    }
    return data;
  }

  function save() {
    if (!state) return false;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SAVE_KEY, JSON.stringify(state));
        events.emit('saved', state);
        return true;
      }
    } catch (e) {
      console.error('Failed to save game to localStorage:', e);
    }
    return false;
  }

  function load(pokemonDataModule) {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (validateSaveSchema(parsed)) {
            const migrated = migrateSave(parsed, pokemonDataModule);
            state = migrated;
            events.emit('loaded', state);
            return state;
          } else {
            console.warn('Save data failed schema validation. Backing up corrupted save.');
            localStorage.setItem(SAVE_KEY + '_corrupted_' + Date.now(), raw);
          }
        }
      }
    } catch (e) {
      console.error('Error loading save:', e);
    }
    state = getInitialState(pokemonDataModule);
    save();
    return state;
  }

  function exportSave() {
    return JSON.stringify(getState(), null, 2);
  }

  function importSave(jsonString, pokemonDataModule) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!validateSaveSchema(parsed)) {
        throw new Error('Invalid save file format.');
      }
      state = migrateSave(parsed, pokemonDataModule);
      save();
      events.emit('loaded', state);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  function resetGame(pokemonDataModule) {
    state = getInitialState(pokemonDataModule);
    save();
    events.emit('loaded', state);
    return state;
  }

  // --- Party and Storage Box Operations ---
  function addPokemon(pokemonInstance) {
    if (!state) getState();
    if (state.party.length < 6) {
      state.party.push(pokemonInstance);
      events.emit('partyChanged', state.party);
      save();
      return { location: 'party', index: state.party.length - 1 };
    } else {
      state.box.push(pokemonInstance);
      events.emit('boxChanged', state.box);
      save();
      return { location: 'box', index: state.box.length - 1 };
    }
  }

  function swapPartyOrder(idxA, idxB) {
    if (!state || idxA < 0 || idxA >= state.party.length || idxB < 0 || idxB >= state.party.length) {
      return false;
    }
    const temp = state.party[idxA];
    state.party[idxA] = state.party[idxB];
    state.party[idxB] = temp;
    events.emit('partyChanged', state.party);
    save();
    return true;
  }

  function depositToBox(partyIndex) {
    if (!state || state.party.length <= 1) return false; // Cannot deposit last pokemon!
    if (partyIndex < 0 || partyIndex >= state.party.length) return false;

    const [pokemon] = state.party.splice(partyIndex, 1);
    state.box.push(pokemon);
    events.emit('partyChanged', state.party);
    events.emit('boxChanged', state.box);
    save();
    return true;
  }

  function withdrawFromBox(boxIndex) {
    if (!state || state.party.length >= 6) return false;
    if (boxIndex < 0 || boxIndex >= state.box.length) return false;

    const [pokemon] = state.box.splice(boxIndex, 1);
    state.party.push(pokemon);
    events.emit('partyChanged', state.party);
    events.emit('boxChanged', state.box);
    save();
    return true;
  }

  function healAllParty() {
    if (!state) return;
    state.party.forEach(pk => {
      pk.currentHp = pk.maxHp;
      pk.status = null;
      pk.statusTurns = 0;
      pk.moves.forEach(m => {
        m.currentPp = m.maxPp;
      });
    });
    events.emit('partyChanged', state.party);
    save();
  }

  // --- Inventory Operations ---
  function getItemCount(itemId) {
    if (!state || !state.inventory) return 0;
    return state.inventory[itemId] || 0;
  }

  function addItem(itemId, count = 1) {
    if (!state) getState();
    if (count <= 0) return;
    state.inventory[itemId] = (state.inventory[itemId] || 0) + count;
    events.emit('inventoryChanged', state.inventory);
    save();
  }

  function removeItem(itemId, count = 1) {
    if (!state || !state.inventory) return false;
    const current = state.inventory[itemId] || 0;
    if (current < count) return false;
    state.inventory[itemId] = current - count;
    if (state.inventory[itemId] === 0) {
      delete state.inventory[itemId];
    }
    events.emit('inventoryChanged', state.inventory);
    save();
    return true;
  }

  function addCoins(amount) {
    if (!state) getState();
    state.player.coins = Math.max(0, state.player.coins + amount);
    events.emit('coinsChanged', state.player.coins);
    save();
    return state.player.coins;
  }

  function removeCoins(amount) {
    if (!state) getState();
    if (state.player.coins < amount) return false;
    state.player.coins -= amount;
    events.emit('coinsChanged', state.player.coins);
    save();
    return true;
  }

  // --- Pokédex Tracking ---
  function recordPokedexEncounter(speciesId) {
    if (!state) getState();
    if (!state.pokedex[speciesId]) {
      state.pokedex[speciesId] = { seen: true, caught: false, countCaught: 0, countDefeated: 0 };
    } else {
      state.pokedex[speciesId].seen = true;
    }
    events.emit('pokedexUpdated', state.pokedex);
    save();
  }

  function recordPokedexDefeat(speciesId) {
    if (!state) getState();
    if (!state.pokedex[speciesId]) {
      state.pokedex[speciesId] = { seen: true, caught: false, countCaught: 0, countDefeated: 1 };
    } else {
      state.pokedex[speciesId].countDefeated = (state.pokedex[speciesId].countDefeated || 0) + 1;
    }
    events.emit('pokedexUpdated', state.pokedex);
    save();
  }

  function recordPokedexCatch(speciesId) {
    if (!state) getState();
    if (!state.pokedex[speciesId]) {
      state.pokedex[speciesId] = { seen: true, caught: true, countCaught: 1, countDefeated: 0 };
    } else {
      state.pokedex[speciesId].seen = true;
      state.pokedex[speciesId].caught = true;
      state.pokedex[speciesId].countCaught = (state.pokedex[speciesId].countCaught || 0) + 1;
    }
    events.emit('pokedexUpdated', state.pokedex);
    save();
  }

  // --- Achievements & Quests ---
  function triggerAchievement(achievementId) {
    if (!state) getState();
    if (!state.achievements[achievementId]) {
      state.achievements[achievementId] = { completed: true, claimed: false, completedAt: new Date().toISOString() };
      events.emit('achievementUnlocked', achievementId);
      save();
      return true;
    }
    return false;
  }

  function claimAchievementReward(achievementId, rewardCoins, rewardItem, rewardCount = 1) {
    if (!state) return false;
    const ach = state.achievements[achievementId];
    if (!ach || !ach.completed || ach.claimed) return false;

    ach.claimed = true;
    if (rewardCoins) addCoins(rewardCoins);
    if (rewardItem) addItem(rewardItem, rewardCount);
    events.emit('achievementClaimed', achievementId);
    save();
    return true;
  }

  function updateQuestProgress(questId, amount = 1) {
    if (!state || !state.dailyQuests) return;
    checkDailyReset();
    const q = state.dailyQuests.quests.find(x => x.id === questId);
    if (q && !q.claimed) {
      q.current = Math.min(q.target, q.current + amount);
      events.emit('questsUpdated', state.dailyQuests);
      save();
    }
  }

  function claimQuestReward(questId) {
    if (!state || !state.dailyQuests) return false;
    const q = state.dailyQuests.quests.find(x => x.id === questId);
    if (!q || q.current < q.target || q.claimed) return false;

    q.claimed = true;
    if (q.rewardCoins) addCoins(q.rewardCoins);
    if (q.rewardItem) addItem(q.rewardItem, q.rewardCount || 1);
    events.emit('questsUpdated', state.dailyQuests);
    save();
    return true;
  }

  // --- Area Unlocks ---
  function unlockArea(areaId) {
    if (!state) getState();
    if (!state.player.unlockedAreas.includes(areaId)) {
      state.player.unlockedAreas.push(areaId);
      events.emit('areaUnlocked', areaId);
      save();
      return true;
    }
    return false;
  }

  function addBadge(badgeName) {
    if (!state) getState();
    if (!state.player.badges.includes(badgeName)) {
      state.player.badges.push(badgeName);
      events.emit('badgeEarned', badgeName);
      save();
      return true;
    }
    return false;
  }

  return {
    events,
    init,
    getState,
    save,
    load,
    exportSave,
    importSave,
    resetGame,
    addPokemon,
    swapPartyOrder,
    depositToBox,
    withdrawFromBox,
    healAllParty,
    getItemCount,
    addItem,
    removeItem,
    addCoins,
    removeCoins,
    recordPokedexEncounter,
    recordPokedexDefeat,
    recordPokedexCatch,
    triggerAchievement,
    claimAchievementReward,
    updateQuestProgress,
    claimQuestReward,
    unlockArea,
    addBadge
  };
});
