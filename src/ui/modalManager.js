(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const GameState = require('../core/gameState');
    const PokemonData = require('../data/pokemonData');
    const ItemsData = require('../data/itemsData');
    const WorldAreas = require('../data/worldAreas');
    const TypeChart = require('../data/typeChart');
    const SpriteRenderer = require('../graphics/spriteRenderer');
    const AudioEngine = require('../engine/audioEngine');
    module.exports = factory(GameState, PokemonData, ItemsData, WorldAreas, TypeChart, SpriteRenderer, AudioEngine);
  } else {
    root.ModalManager = factory(
      root.GameState,
      root.PokemonData,
      root.ItemsData,
      root.WorldAreas,
      root.TypeChart,
      root.SpriteRenderer,
      root.AudioEngine
    );
  }
})(typeof self !== 'undefined' ? self : this, function (GameState, PokemonData, ItemsData, WorldAreas, TypeChart, SpriteRenderer, AudioEngine) {
  'use strict';

  let activeModal = null;
  let modalBackdrop = null;

  function init() {
    if (typeof document === 'undefined') return;

    // Create modal backdrop container if not exists
    if (!document.getElementById('modalBackdrop')) {
      modalBackdrop = document.createElement('div');
      modalBackdrop.id = 'modalBackdrop';
      modalBackdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(4px);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 200;
        padding: 16px;
        box-sizing: border-box;
      `;
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) closeModal();
      });

      // Escape key to close modal
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && activeModal) {
          closeModal();
        }
      });

      document.body.appendChild(modalBackdrop);
    } else {
      modalBackdrop = document.getElementById('modalBackdrop');
    }

    renderHud();
  }

  function playSound(type) {
    if (AudioEngine && AudioEngine.playSfx) {
      AudioEngine.playSfx(type);
    }
  }

  function closeModal() {
    if (!modalBackdrop) return;
    modalBackdrop.style.display = 'none';
    modalBackdrop.innerHTML = '';
    activeModal = null;
    playSound('cancel');
  }

  function openModal(modalId, title, contentHtml) {
    if (!modalBackdrop) init();
    playSound('select');
    activeModal = modalId;

    modalBackdrop.innerHTML = `
      <div role="dialog" aria-modal="true" aria-labelledby="modalTitle" class="pokemon-modal" style="
        background: #1E293B;
        color: #F8FAFC;
        border: 4px solid #38BDF8;
        border-radius: 12px;
        width: 100%;
        max-width: 760px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 40px rgba(0,0,0,0.8);
        overflow: hidden;
        animation: modalPop 0.2s ease-out;
      ">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 20px;
          background: #0F172A;
          border-bottom: 3px solid #334155;
        ">
          <h2 id="modalTitle" style="margin: 0; font-size: 15px; color: #38BDF8; font-family: 'Press Start 2P', monospace;">
            ${title}
          </h2>
          <button id="modalCloseBtn" type="button" aria-label="Close" style="
            background: #EF4444;
            color: white;
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 6px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          ">✕</button>
        </div>
        <div id="modalContent" style="
          padding: 18px 20px;
          overflow-y: auto;
          flex: 1;
        ">
          ${contentHtml}
        </div>
      </div>
    `;

    document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
    modalBackdrop.style.display = 'flex';
  }

  // --- HUD Rendering ---
  function renderHud() {
    let hud = document.getElementById('gameHud');
    if (!hud) {
      hud = document.createElement('div');
      hud.id = 'gameHud';
      hud.style.cssText = `
        position: absolute;
        top: 10px;
        left: 10px;
        right: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        pointer-events: none;
        z-index: 50;
      `;
      const container = document.querySelector('#gameContainer') || document.body;
      container.appendChild(hud);
    }

    const state = GameState.getState();
    const currentArea = WorldAreas.getArea(state.player.currentArea || 'pelletTown');

    hud.innerHTML = `
      <div style="display: flex; gap: 8px; align-items: center; pointer-events: auto;">
        <span style="
          background: rgba(15, 23, 42, 0.85);
          color: #38BDF8;
          padding: 6px 12px;
          border-radius: 6px;
          border: 2px solid #38BDF8;
          font-family: 'Press Start 2P', monospace;
          font-size: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
        ">
          📍 <span id="hudAreaName">${currentArea.name}</span>
        </span>
        <span style="
          background: rgba(15, 23, 42, 0.85);
          color: #FACC15;
          padding: 6px 12px;
          border-radius: 6px;
          border: 2px solid #FACC15;
          font-family: 'Press Start 2P', monospace;
          font-size: 10px;
        ">
          🪙 <span id="hudCoins">${state.player.coins}</span>
        </span>
      </div>

      <div style="display: flex; gap: 6px; pointer-events: auto;" class="hud-buttons">
        <button id="hudMapBtn" title="World Map (M)" class="hud-btn">🗺️ Map</button>
        <button id="hudDexBtn" title="Pokédex (P)" class="hud-btn">📖 Dex</button>
        <button id="hudTeamBtn" title="Team (T)" class="hud-btn">👥 Team</button>
        <button id="hudBagBtn" title="Bag (B)" class="hud-btn">🎒 Bag</button>
        <button id="hudQuestsBtn" title="Badges & Quests (C)" class="hud-btn">🏆 Badges</button>
        <button id="hudTowerBtn" title="Battle Tower" class="hud-btn">🗼 Tower</button>
        <button id="hudSettingsBtn" title="Settings" class="hud-btn">⚙️</button>
      </div>
    `;

    document.getElementById('hudMapBtn').addEventListener('click', openWorldMapModal);
    document.getElementById('hudDexBtn').addEventListener('click', openPokedexModal);
    document.getElementById('hudTeamBtn').addEventListener('click', openTeamModal);
    document.getElementById('hudBagBtn').addEventListener('click', openBagModal);
    document.getElementById('hudQuestsBtn').addEventListener('click', openQuestsModal);
    document.getElementById('hudTowerBtn').addEventListener('click', openTowerModal);
    document.getElementById('hudSettingsBtn').addEventListener('click', openSettingsModal);
  }

  function updateHudValues() {
    const state = GameState.getState();
    const area = WorldAreas.getArea(state.player.currentArea || 'pelletTown');
    const areaEl = document.getElementById('hudAreaName');
    const coinsEl = document.getElementById('hudCoins');
    if (areaEl) areaEl.textContent = area.name;
    if (coinsEl) coinsEl.textContent = state.player.coins;
  }

  // --- 1. Pokedex Modal ---
  function openPokedexModal() {
    const state = GameState.getState();
    const allSpecies = PokemonData.getAllSpecies();
    const pokedex = state.pokedex || {};

    let seenCount = 0;
    let caughtCount = 0;
    allSpecies.forEach(sp => {
      const entry = pokedex[sp.id];
      if (entry && entry.seen) seenCount++;
      if (entry && entry.caught) caughtCount++;
    });

    const percent = Math.floor((caughtCount / allSpecies.length) * 100);

    const html = `
      <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; background: #0F172A; padding: 12px; border-radius: 8px;">
        <span style="font-family: 'Press Start 2P', monospace; font-size: 11px;">
          CAUGHT: <span style="color: #4ADE80;">${caughtCount}</span> / ${allSpecies.length} (${percent}%)
        </span>
        <span style="font-family: 'Press Start 2P', monospace; font-size: 11px; color: #94A3B8;">
          SEEN: ${seenCount}
        </span>
      </div>

      <div style="margin-bottom: 14px; display: flex; gap: 8px;">
        <input id="dexSearch" type="text" placeholder="Search by name or type..." style="
          flex: 1;
          padding: 8px 12px;
          background: #0F172A;
          color: white;
          border: 2px solid #334155;
          border-radius: 6px;
          font-family: 'Press Start 2P', monospace;
          font-size: 10px;
        " />
      </div>

      <div id="dexGrid" style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
        gap: 10px;
      ">
        ${renderPokedexGrid(allSpecies, pokedex, '')}
      </div>

      <div id="dexDetailView" style="display: none; margin-top: 16px;"></div>
    `;

    openModal('pokedex', '📖 NATIONAL POKÉDEX', html);

    const searchInput = document.getElementById('dexSearch');
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      document.getElementById('dexGrid').innerHTML = renderPokedexGrid(allSpecies, pokedex, q);
      attachDexCardEvents();
    });

    attachDexCardEvents();
  }

  function renderPokedexGrid(speciesList, pokedex, filterQuery) {
    return speciesList
      .filter(sp => {
        if (!filterQuery) return true;
        const nameMatch = sp.name.toLowerCase().includes(filterQuery);
        const typeMatch = sp.types.some(t => t.toLowerCase().includes(filterQuery));
        return nameMatch || typeMatch;
      })
      .map(sp => {
        const entry = pokedex[sp.id] || { seen: false, caught: false };
        const isDiscovered = entry.seen || entry.caught;
        const avatarUrl = isDiscovered && SpriteRenderer ? SpriteRenderer.getPokemonAvatarUrl(sp.id, false) : '';

        return `
          <div class="dex-card" data-species="${sp.id}" style="
            background: ${entry.caught ? '#1E3A5F' : (entry.seen ? '#1E293B' : '#0F172A')};
            border: 2px solid ${entry.caught ? '#38BDF8' : '#334155'};
            border-radius: 8px;
            padding: 8px;
            text-align: center;
            cursor: pointer;
            transition: transform 0.1s;
          ">
            <div style="font-family: 'Press Start 2P', monospace; font-size: 8px; color: #94A3B8; margin-bottom: 4px;">
              #${String(sp.num).padStart(3, '0')}
            </div>
            <div style="width: 56px; height: 56px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
              ${isDiscovered && avatarUrl ? `<img src="${avatarUrl}" alt="${sp.name}" style="width: 56px; height: 56px; image-rendering: pixelated;" />` : `<span style="font-size: 28px; opacity: 0.25;">❓</span>`}
            </div>
            <div style="font-family: 'Press Start 2P', monospace; font-size: 9px; margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${isDiscovered ? sp.name : '???'}
            </div>
            <div style="margin-top: 4px;">
              ${entry.caught ? '<span style="font-size: 8px; color: #4ADE80; font-family: monospace;">★ CAUGHT</span>' : (entry.seen ? '<span style="font-size: 8px; color: #FACC15; font-family: monospace;">SEEN</span>' : '<span style="font-size: 8px; color: #64748B; font-family: monospace;">UNKNOWN</span>')}
            </div>
          </div>
        `;
      }).join('');
  }

  function attachDexCardEvents() {
    document.querySelectorAll('.dex-card').forEach(card => {
      card.addEventListener('click', () => {
        const speciesId = card.getAttribute('data-species');
        showSpeciesDetail(speciesId);
      });
    });
  }

  function showSpeciesDetail(speciesId) {
    const sp = PokemonData.getPokemonSpecies(speciesId);
    if (!sp) return;

    const state = GameState.getState();
    const entry = state.pokedex[speciesId] || { seen: false, caught: false };
    const isDiscovered = entry.seen || entry.caught;

    const detailEl = document.getElementById('dexDetailView');
    if (!detailEl) return;

    playSound('select');
    detailEl.style.display = 'block';

    if (!isDiscovered) {
      detailEl.innerHTML = `
        <div style="background: #0F172A; padding: 16px; border-radius: 8px; text-align: center; border: 2px dashed #475569;">
          <p style="font-family: 'Press Start 2P', monospace; font-size: 11px; color: #94A3B8;">This Pokémon has not yet been discovered in the wild!</p>
        </div>
      `;
      return;
    }

    const avatarUrl = SpriteRenderer ? SpriteRenderer.getPokemonAvatarUrl(sp.id, false) : '';
    const typesHtml = sp.types.map(t => {
      const col = TypeChart ? TypeChart.getTypeColor(t) : '#666';
      return `<span style="background: ${col}; color: white; padding: 3px 8px; border-radius: 4px; font-size: 9px; font-family: 'Press Start 2P', monospace;">${t}</span>`;
    }).join(' ');

    const stats = sp.baseStats;
    const statBars = [
      { name: 'HP', val: stats.hp, max: 160, col: '#EF4444' },
      { name: 'ATK', val: stats.attack, max: 140, col: '#F97316' },
      { name: 'DEF', val: stats.defense, max: 140, col: '#FACC15' },
      { name: 'SP.A', val: stats.spAttack, max: 160, col: '#38BDF8' },
      { name: 'SP.D', val: stats.spDefense, max: 140, col: '#4ADE80' },
      { name: 'SPD', val: stats.speed, max: 140, col: '#A855F7' }
    ].map(s => {
      const pct = Math.min(100, Math.floor((s.val / s.max) * 100));
      return `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; font-family: monospace; font-size: 10px;">
          <span style="width: 40px; font-weight: bold;">${s.name}</span>
          <span style="width: 30px; text-align: right;">${s.val}</span>
          <div style="flex: 1; height: 8px; background: #334155; border-radius: 4px; overflow: hidden;">
            <div style="width: ${pct}%; height: 100%; background: ${s.col};"></div>
          </div>
        </div>
      `;
    }).join('');

    detailEl.innerHTML = `
      <div style="background: #0F172A; padding: 16px; border-radius: 8px; border: 2px solid #38BDF8;">
        <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 12px;">
          <img src="${avatarUrl}" alt="${sp.name}" style="width: 80px; height: 80px; image-rendering: pixelated; background: #1E293B; border-radius: 8px; padding: 4px;" />
          <div>
            <div style="font-family: 'Press Start 2P', monospace; font-size: 14px; color: #38BDF8; margin-bottom: 6px;">
              #${String(sp.num).padStart(3, '0')} ${sp.name}
            </div>
            <div style="margin-bottom: 6px;">${typesHtml}</div>
            <div style="font-family: monospace; font-size: 11px; color: #94A3B8;">
              Rarity: <strong style="color: #F8FAFC;">${sp.rarity}</strong> | Catch Rate: ${sp.catchRate}
            </div>
          </div>
        </div>

        <p style="font-size: 12px; line-height: 1.5; color: #E2E8F0; background: #1E293B; padding: 10px; border-radius: 6px; margin: 0 0 12px 0;">
          "${sp.description}"
        </p>

        <h3 style="font-family: 'Press Start 2P', monospace; font-size: 10px; color: #FACC15; margin: 0 0 8px 0;">BASE STATS</h3>
        ${statBars}
      </div>
    `;
    detailEl.scrollIntoView({ behavior: 'smooth' });
  }

  // --- 2. Team & PC Box Modal ---
  function openTeamModal() {
    renderTeamModalContent('party');
  }

  function renderTeamModalContent(activeTab = 'party') {
    const state = GameState.getState();
    const party = state.party || [];
    const box = state.box || [];

    const partyHtml = party.map((pk, idx) => {
      const avatarUrl = SpriteRenderer ? SpriteRenderer.getPokemonAvatarUrl(pk.speciesId, pk.isShiny) : '';
      const hpPct = Math.max(0, Math.floor((pk.currentHp / pk.maxHp) * 100));
      const hpColor = hpPct > 50 ? '#4ADE80' : hpPct > 20 ? '#FACC15' : '#EF4444';

      return `
        <div style="
          background: #0F172A;
          border: 2px solid ${idx === 0 ? '#FACC15' : '#334155'};
          border-radius: 8px;
          padding: 12px;
          display: flex;
          gap: 12px;
          align-items: center;
          margin-bottom: 10px;
        ">
          <img src="${avatarUrl}" alt="${pk.name}" style="width: 56px; height: 56px; image-rendering: pixelated; background: #1E293B; border-radius: 6px;" />
          <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-family: 'Press Start 2P', monospace; font-size: 11px; color: ${pk.isShiny ? '#FFD700' : '#F8FAFC'};">
                ${pk.name} ${pk.isShiny ? '★' : ''}
              </span>
              <span style="font-family: 'Press Start 2P', monospace; font-size: 9px; color: #38BDF8;">
                Lv. ${pk.level}
              </span>
            </div>

            <!-- Health Bar -->
            <div style="margin-bottom: 6px;">
              <div style="display: flex; justify-content: space-between; font-size: 9px; font-family: monospace; color: #94A3B8; margin-bottom: 2px;">
                <span>HP: ${pk.currentHp} / ${pk.maxHp}</span>
                <span>${pk.status ? `<strong style="color: #EF4444;">${pk.status}</strong>` : ''}</span>
              </div>
              <div style="height: 6px; background: #334155; border-radius: 3px; overflow: hidden;">
                <div style="width: ${hpPct}%; height: 100%; background: ${hpColor}; transition: width 0.3s;"></div>
              </div>
            </div>

            <!-- Moves badges -->
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
              ${pk.moves.map(m => `<span style="font-size: 8px; font-family: monospace; background: #334155; padding: 2px 6px; border-radius: 3px;">${m.name} (${m.currentPp}/${m.maxPp})</span>`).join('')}
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 4px;">
            ${idx > 0 ? `<button class="team-move-up-btn" data-idx="${idx}" style="padding: 4px 8px; font-size: 10px; background: #38BDF8; color: black; border: none; border-radius: 4px; cursor: pointer;">▲</button>` : ''}
            ${idx < party.length - 1 ? `<button class="team-move-down-btn" data-idx="${idx}" style="padding: 4px 8px; font-size: 10px; background: #38BDF8; color: black; border: none; border-radius: 4px; cursor: pointer;">▼</button>` : ''}
            ${party.length > 1 ? `<button class="team-deposit-btn" data-idx="${idx}" style="padding: 4px 8px; font-size: 9px; background: #F97316; color: white; border: none; border-radius: 4px; cursor: pointer;">Deposit</button>` : ''}
          </div>
        </div>
      `;
    }).join('');

    const boxHtml = box.length === 0 ? `
      <div style="padding: 24px; text-align: center; color: #94A3B8; font-family: monospace;">No Pokémon stored in PC Box yet. Caught Pokémon beyond your party of 6 are safely stored here!</div>
    ` : `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px;">
        ${box.map((pk, idx) => {
          const avatarUrl = SpriteRenderer ? SpriteRenderer.getPokemonAvatarUrl(pk.speciesId, pk.isShiny) : '';
          return `
            <div style="background: #0F172A; border: 2px solid #334155; border-radius: 8px; padding: 10px; text-align: center;">
              <img src="${avatarUrl}" alt="${pk.name}" style="width: 56px; height: 56px; image-rendering: pixelated; margin-bottom: 6px;" />
              <div style="font-family: 'Press Start 2P', monospace; font-size: 9px; color: #F8FAFC; margin-bottom: 4px;">${pk.name}</div>
              <div style="font-family: monospace; font-size: 10px; color: #38BDF8; margin-bottom: 8px;">Lv. ${pk.level}</div>
              ${party.length < 6 ? `<button class="box-withdraw-btn" data-idx="${idx}" style="width: 100%; padding: 4px; font-size: 9px; background: #4ADE80; color: black; border: none; border-radius: 4px; font-family: 'Press Start 2P', monospace; cursor: pointer;">WITHDRAW</button>` : '<span style="font-size: 8px; color: #94A3B8;">Party Full</span>'}
            </div>
          `;
        }).join('')}
      </div>
    `;

    const html = `
      <div style="display: flex; gap: 8px; margin-bottom: 16px;">
        <button id="tabPartyBtn" style="flex: 1; padding: 10px; font-family: 'Press Start 2P', monospace; font-size: 10px; background: ${activeTab === 'party' ? '#38BDF8' : '#0F172A'}; color: ${activeTab === 'party' ? '#0F172A' : '#F8FAFC'}; border: 2px solid #38BDF8; border-radius: 6px; cursor: pointer;">
          PARTY (${party.length}/6)
        </button>
        <button id="tabBoxBtn" style="flex: 1; padding: 10px; font-family: 'Press Start 2P', monospace; font-size: 10px; background: ${activeTab === 'box' ? '#38BDF8' : '#0F172A'}; color: ${activeTab === 'box' ? '#0F172A' : '#F8FAFC'}; border: 2px solid #38BDF8; border-radius: 6px; cursor: pointer;">
          PC STORAGE (${box.length})
        </button>
      </div>

      <div id="teamTabContent">
        ${activeTab === 'party' ? partyHtml : boxHtml}
      </div>
    `;

    openModal('team', '👥 TEAM MANAGEMENT & STORAGE', html);

    document.getElementById('tabPartyBtn').addEventListener('click', () => renderTeamModalContent('party'));
    document.getElementById('tabBoxBtn').addEventListener('click', () => renderTeamModalContent('box'));

    // Attach button events
    document.querySelectorAll('.team-move-up-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        GameState.swapPartyOrder(idx, idx - 1);
        renderTeamModalContent('party');
      });
    });

    document.querySelectorAll('.team-move-down-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        GameState.swapPartyOrder(idx, idx + 1);
        renderTeamModalContent('party');
      });
    });

    document.querySelectorAll('.team-deposit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        GameState.depositToBox(idx);
        renderTeamModalContent('party');
      });
    });

    document.querySelectorAll('.box-withdraw-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        GameState.withdrawFromBox(idx);
        renderTeamModalContent('box');
      });
    });
  }

  // --- 3. Bag & Shop Modal ---
  function openBagModal() {
    renderBagModalContent('bag');
  }

  function renderBagModalContent(activeTab = 'bag') {
    const state = GameState.getState();
    const inv = state.inventory || {};
    const itemIds = Object.keys(inv).filter(id => inv[id] > 0);

    const bagHtml = itemIds.length === 0 ? `
      <div style="padding: 24px; text-align: center; color: #94A3B8; font-family: monospace;">Your bag is currently empty! Win battles or visit the PokéMart to obtain items.</div>
    ` : `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">
        ${itemIds.map(id => {
          const item = ItemsData.getItem(id) || { name: id, description: '', icon: '📦' };
          const count = inv[id];
          return `
            <div style="background: #0F172A; border: 2px solid #334155; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="font-size: 20px;">${item.icon || '📦'}</span>
                  <span style="font-family: 'Press Start 2P', monospace; font-size: 10px; color: #38BDF8;">x${count}</span>
                </div>
                <div style="font-family: 'Press Start 2P', monospace; font-size: 10px; margin-bottom: 6px;">${item.name}</div>
                <p style="font-size: 10px; color: #94A3B8; margin: 0 0 10px 0; line-height: 1.4;">${item.description}</p>
              </div>
              <button class="use-item-btn" data-item="${id}" style="
                width: 100%;
                padding: 6px;
                background: #4ADE80;
                color: black;
                font-family: 'Press Start 2P', monospace;
                font-size: 9px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
              ">USE</button>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Shop purchase catalog
    const shopCatalog = [
      'pokeBall', 'greatBall', 'ultraBall', 'potion', 'superPotion',
      'hyperPotion', 'revive', 'antidote', 'burnHeal', 'paralyzeHeal',
      'fireStone', 'waterStone', 'thunderStone', 'leafStone', 'rareCandy', 'escapeRope'
    ];

    const shopHtml = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">
        ${shopCatalog.map(id => {
          const item = ItemsData.getItem(id);
          if (!item) return '';
          const canAfford = state.player.coins >= item.price;
          return `
            <div style="background: #0F172A; border: 2px solid #334155; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="font-size: 20px;">${item.icon || '📦'}</span>
                  <span style="font-family: 'Press Start 2P', monospace; font-size: 9px; color: #FACC15;">🪙 ${item.price}</span>
                </div>
                <div style="font-family: 'Press Start 2P', monospace; font-size: 10px; margin-bottom: 6px;">${item.name}</div>
                <p style="font-size: 10px; color: #94A3B8; margin: 0 0 10px 0; line-height: 1.4;">${item.description}</p>
              </div>
              <button class="buy-item-btn" data-item="${id}" ${canAfford ? '' : 'disabled'} style="
                width: 100%;
                padding: 6px;
                background: ${canAfford ? '#38BDF8' : '#475569'};
                color: ${canAfford ? 'black' : '#94A3B8'};
                font-family: 'Press Start 2P', monospace;
                font-size: 9px;
                border: none;
                border-radius: 4px;
                cursor: ${canAfford ? 'pointer' : 'not-allowed'};
              ">BUY</button>
            </div>
          `;
        }).join('')}
      </div>
    `;

    const html = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: #0F172A; padding: 10px 14px; border-radius: 8px;">
        <div style="display: flex; gap: 8px;">
          <button id="tabBagBtn" style="padding: 8px 14px; font-family: 'Press Start 2P', monospace; font-size: 10px; background: ${activeTab === 'bag' ? '#38BDF8' : '#1E293B'}; color: ${activeTab === 'bag' ? '#0F172A' : '#F8FAFC'}; border: none; border-radius: 6px; cursor: pointer;">
            BAG
          </button>
          <button id="tabShopBtn" style="padding: 8px 14px; font-family: 'Press Start 2P', monospace; font-size: 10px; background: ${activeTab === 'shop' ? '#38BDF8' : '#1E293B'}; color: ${activeTab === 'shop' ? '#0F172A' : '#F8FAFC'}; border: none; border-radius: 6px; cursor: pointer;">
            POKÉMART SHOP
          </button>
        </div>
        <div style="font-family: 'Press Start 2P', monospace; font-size: 11px; color: #FACC15;">
          🪙 ${state.player.coins}
        </div>
      </div>

      <div id="bagTabContent">
        ${activeTab === 'bag' ? bagHtml : shopHtml}
      </div>
    `;

    openModal('bag', '🎒 INVENTORY & POKÉMART', html);

    document.getElementById('tabBagBtn').addEventListener('click', () => renderBagModalContent('bag'));
    document.getElementById('tabShopBtn').addEventListener('click', () => renderBagModalContent('shop'));

    // Handle Buy
    document.querySelectorAll('.buy-item-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = e.currentTarget.getAttribute('data-item');
        const item = ItemsData.getItem(itemId);
        if (item && GameState.removeCoins(item.price)) {
          GameState.addItem(itemId, 1);
          playSound('coins');
          renderBagModalContent('shop');
          updateHudValues();
        }
      });
    });

    // Handle Use Item out of battle
    document.querySelectorAll('.use-item-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = e.currentTarget.getAttribute('data-item');
        handleItemUseOnParty(itemId);
      });
    });
  }

  function handleItemUseOnParty(itemId) {
    const item = ItemsData.getItem(itemId);
    if (!item) return;

    const state = GameState.getState();
    const party = state.party || [];

    // Escape rope case
    if (item.escapeToHome) {
      GameState.removeItem(itemId, 1);
      state.player.currentArea = 'pelletTown';
      GameState.save();
      playSound('heal');
      updateHudValues();
      closeModal();
      return;
    }

    // Prompt user to pick a party member
    const modalContent = document.getElementById('modalContent');
    if (!modalContent) return;

    modalContent.innerHTML = `
      <div style="margin-bottom: 12px; font-family: 'Press Start 2P', monospace; font-size: 10px; color: #FACC15;">
        USE ${item.name} ON WHICH POKÉMON?
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${party.map((pk, idx) => `
          <div class="use-target-card" data-idx="${idx}" style="
            background: #0F172A;
            border: 2px solid #38BDF8;
            border-radius: 6px;
            padding: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
          ">
            <span style="font-family: 'Press Start 2P', monospace; font-size: 10px;">${pk.name} (Lv. ${pk.level})</span>
            <span style="font-family: monospace; font-size: 11px; color: #94A3B8;">HP: ${pk.currentHp}/${pk.maxHp}</span>
          </div>
        `).join('')}
      </div>
      <button id="cancelItemUseBtn" style="margin-top: 14px; padding: 8px; width: 100%; background: #EF4444; color: white; border: none; border-radius: 6px; font-family: 'Press Start 2P', monospace; font-size: 9px; cursor: pointer;">
        CANCEL
      </button>
    `;

    document.getElementById('cancelItemUseBtn').addEventListener('click', () => renderBagModalContent('bag'));

    document.querySelectorAll('.use-target-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        const pk = party[idx];
        let used = false;

        if (item.healHp) {
          if (pk.currentHp < pk.maxHp) {
            const healAmt = item.healHp === 'all' ? pk.maxHp : item.healHp;
            pk.currentHp = Math.min(pk.maxHp, pk.currentHp + healAmt);
            used = true;
          }
        } else if (item.revivePercent && pk.currentHp <= 0) {
          pk.currentHp = Math.floor(pk.maxHp * item.revivePercent);
          pk.status = null;
          used = true;
        } else if (item.cureStatus && pk.status && item.cureStatus.includes(pk.status)) {
          pk.status = null;
          used = true;
        } else if (item.levelUp && pk.level < 100) {
          pk.level++;
          // Recalculate stats
          const species = PokemonData.getPokemonSpecies(pk.speciesId);
          if (species) {
            pk.maxHp = PokemonData.calculateStat(species.baseStats.hp, pk.level, true);
            pk.currentHp = pk.maxHp;
            pk.stats = {
              hp: pk.maxHp,
              attack: PokemonData.calculateStat(species.baseStats.attack, pk.level),
              defense: PokemonData.calculateStat(species.baseStats.defense, pk.level),
              spAttack: PokemonData.calculateStat(species.baseStats.spAttack, pk.level),
              spDefense: PokemonData.calculateStat(species.baseStats.spDefense, pk.level),
              speed: PokemonData.calculateStat(species.baseStats.speed, pk.level)
            };
          }
          used = true;
          playSound('levelUp');
        } else if (item.category === 'evolution') {
          // Check stone evolutions
          const stoneMap = PokemonData.STONE_EVOLUTIONS[pk.speciesId];
          if (stoneMap && stoneMap[itemId]) {
            const targetSpeciesId = stoneMap[itemId];
            pk.speciesId = targetSpeciesId;
            const newSpecies = PokemonData.getPokemonSpecies(targetSpeciesId);
            pk.name = newSpecies.name;
            pk.maxHp = PokemonData.calculateStat(newSpecies.baseStats.hp, pk.level, true);
            pk.currentHp = pk.maxHp;
            used = true;
            GameState.recordPokedexCatch(targetSpeciesId);
            GameState.triggerAchievement('evolution_master');
            playSound('levelUp');
          }
        }

        if (used) {
          GameState.removeItem(itemId, 1);
          GameState.save();
          playSound('heal');
        }
        renderBagModalContent('bag');
      });
    });
  }

  // --- 4. World Map Modal ---
  function openWorldMapModal() {
    const state = GameState.getState();
    const areas = WorldAreas.getAllAreas();
    const unlocked = state.player.unlockedAreas || ['pelletTown'];

    const html = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px;">
        ${areas.map(a => {
          const isUnlocked = unlocked.includes(a.id);
          const isCurrent = state.player.currentArea === a.id;

          return `
            <div style="
              background: #0F172A;
              border: 3px solid ${isCurrent ? '#FACC15' : (isUnlocked ? '#38BDF8' : '#334155')};
              border-radius: 8px;
              padding: 14px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              opacity: ${isUnlocked ? 1 : 0.6};
            ">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="font-family: 'Press Start 2P', monospace; font-size: 11px; color: ${a.themeColor};">
                    ${a.name}
                  </span>
                  ${isCurrent ? '<span style="font-size: 8px; font-family: monospace; background: #FACC15; color: black; padding: 2px 4px; border-radius: 3px;">HERE</span>' : ''}
                </div>
                <div style="font-family: monospace; font-size: 10px; color: #94A3B8; margin-bottom: 8px;">
                  Level Range: Lv. ${a.levelRange[0]} - ${a.levelRange[1]}
                </div>
                <p style="font-size: 10px; color: #E2E8F0; margin: 0 0 12px 0; line-height: 1.4;">
                  ${a.subtitle}
                </p>
              </div>

              ${isUnlocked ? `
                <button class="travel-btn" data-area="${a.id}" ${isCurrent ? 'disabled' : ''} style="
                  padding: 8px;
                  background: ${isCurrent ? '#475569' : '#38BDF8'};
                  color: ${isCurrent ? '#94A3B8' : '#0F172A'};
                  font-family: 'Press Start 2P', monospace;
                  font-size: 9px;
                  border: none;
                  border-radius: 4px;
                  cursor: ${isCurrent ? 'default' : 'pointer'};
                ">
                  ${isCurrent ? 'CURRENT LOCATION' : 'FAST TRAVEL'}
                </button>
              ` : `
                <div style="font-family: monospace; font-size: 10px; color: #EF4444; text-align: center;">
                  🔒 Requires Badge ${a.badgeRequired}
                </div>
              `}
            </div>
          `;
        }).join('')}
      </div>
    `;

    openModal('map', '🗺️ WORLD MAP & FAST TRAVEL', html);

    document.querySelectorAll('.travel-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const areaId = e.currentTarget.getAttribute('data-area');
        closeModal();

        if (typeof MapManager !== 'undefined') {
          MapManager.transitionToArea(areaId, null, (targetAreaId, spawn) => {
            if (typeof window.repositionToArea === 'function') {
              window.repositionToArea(targetAreaId, spawn);
            }
          });
        } else {
          state.player.currentArea = areaId;
          GameState.save();

          // Update weather in ParticleSystem
          const area = WorldAreas.getArea(areaId);
          if (typeof window !== 'undefined' && window.particleSystem && area.weather) {
            window.particleSystem.setWeather(area.weather);
          }

          playSound('heal');
          updateHudValues();
        }
      });
    });
  }

  // --- 5. Quests & Badges Modal ---
  function openQuestsModal() {
    const state = GameState.getState();
    const badges = state.player.badges || [];
    const quests = state.dailyQuests ? state.dailyQuests.quests : [];
    const achievements = state.achievements || {};

    const ALL_ACHIEVEMENTS = [
      { id: 'first_catch', title: 'First Friend', desc: 'Catch your very first wild Pokémon.', reward: 500, rewardItem: 'greatBall', count: 2 },
      { id: 'team_six', title: 'Full Squad', desc: 'Form a complete party of 6 Pokémon.', reward: 1000, rewardItem: 'ultraBall', count: 3 },
      { id: 'evolution_master', title: 'Evolution Pioneer', desc: 'Evolve a Pokémon through training or an Element Stone.', reward: 1500, rewardItem: 'rareCandy', count: 2 },
      { id: 'boulder_badge', title: 'Solid as a Rock', desc: 'Defeat Gym Leader Brock and earn the Boulder Badge.', reward: 2000, rewardItem: 'hyperPotion', count: 2 },
      { id: 'cascade_badge', title: 'Cascade Surge', desc: 'Defeat Gym Leader Misty and earn the Cascade Badge.', reward: 2500, rewardItem: 'waterStone', count: 1 },
      { id: 'tower_climber', title: 'Tower Prodigy', desc: 'Reach Floor 5 in the Battle Tower.', reward: 1500, rewardItem: 'ultraBall', count: 5 },
      { id: 'champion_lance', title: 'Indigo Champion', desc: 'Defeat Champion Lance and reign victorious!', reward: 10000, rewardItem: 'masterBall', count: 1 }
    ];

    const badgesHtml = `
      <div style="background: #0F172A; padding: 14px; border-radius: 8px; margin-bottom: 16px;">
        <h3 style="font-family: 'Press Start 2P', monospace; font-size: 11px; color: #FACC15; margin: 0 0 10px 0;">GYM BADGES</h3>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          ${['Boulder Badge', 'Cascade Badge', 'Thunder Badge', 'Rainbow Badge', 'Soul Badge', 'Champion Trophy'].map(b => {
            const hasBadge = badges.includes(b);
            return `
              <div style="
                background: ${hasBadge ? '#1E293B' : '#0B0F19'};
                border: 2px solid ${hasBadge ? '#FACC15' : '#334155'};
                padding: 8px 12px;
                border-radius: 6px;
                font-family: 'Press Start 2P', monospace;
                font-size: 8px;
                color: ${hasBadge ? '#FACC15' : '#64748B'};
              ">
                ${hasBadge ? '🏅' : '🔒'} ${b}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    const questsHtml = `
      <div style="background: #0F172A; padding: 14px; border-radius: 8px; margin-bottom: 16px;">
        <h3 style="font-family: 'Press Start 2P', monospace; font-size: 11px; color: #38BDF8; margin: 0 0 10px 0;">DAILY QUESTS</h3>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${quests.map(q => {
            const isReady = q.current >= q.target && !q.claimed;
            return `
              <div style="background: #1E293B; padding: 10px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-family: 'Press Start 2P', monospace; font-size: 9px; margin-bottom: 4px;">${q.title}</div>
                  <div style="font-family: monospace; font-size: 10px; color: #94A3B8;">Progress: ${q.current}/${q.target} | Reward: 🪙 ${q.rewardCoins}</div>
                </div>
                <button class="claim-quest-btn" data-quest="${q.id}" ${isReady ? '' : 'disabled'} style="
                  padding: 6px 10px;
                  background: ${q.claimed ? '#475569' : (isReady ? '#4ADE80' : '#334155')};
                  color: ${q.claimed ? '#94A3B8' : (isReady ? 'black' : '#64748B')};
                  font-family: 'Press Start 2P', monospace;
                  font-size: 8px;
                  border: none;
                  border-radius: 4px;
                  cursor: ${isReady ? 'pointer' : 'default'};
                ">
                  ${q.claimed ? 'CLAIMED' : (isReady ? 'CLAIM' : 'LOCKED')}
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    const achHtml = `
      <div style="background: #0F172A; padding: 14px; border-radius: 8px;">
        <h3 style="font-family: 'Press Start 2P', monospace; font-size: 11px; color: #4ADE80; margin: 0 0 10px 0;">ACHIEVEMENTS</h3>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${ALL_ACHIEVEMENTS.map(a => {
            const record = achievements[a.id];
            const isCompleted = record && record.completed;
            const isClaimed = record && record.claimed;
            const canClaim = isCompleted && !isClaimed;

            return `
              <div style="background: #1E293B; padding: 10px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-family: 'Press Start 2P', monospace; font-size: 9px; color: ${isCompleted ? '#F8FAFC' : '#64748B'}; margin-bottom: 4px;">
                    ${isCompleted ? '🏆' : '🔒'} ${a.title}
                  </div>
                  <p style="font-size: 10px; color: #94A3B8; margin: 0; line-height: 1.3;">${a.desc}</p>
                </div>
                <button class="claim-ach-btn" data-ach="${a.id}" data-coins="${a.reward}" data-item="${a.rewardItem}" data-count="${a.count}" ${canClaim ? '' : 'disabled'} style="
                  padding: 6px 10px;
                  background: ${isClaimed ? '#475569' : (canClaim ? '#FACC15' : '#334155')};
                  color: ${isClaimed ? '#94A3B8' : (canClaim ? 'black' : '#64748B')};
                  font-family: 'Press Start 2P', monospace;
                  font-size: 8px;
                  border: none;
                  border-radius: 4px;
                  cursor: ${canClaim ? 'pointer' : 'default'};
                ">
                  ${isClaimed ? 'CLAIMED' : (canClaim ? 'CLAIM' : 'LOCKED')}
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    openModal('quests', '🏆 TRAINER BADGES & QUESTS', badgesHtml + questsHtml + achHtml);

    document.querySelectorAll('.claim-quest-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const questId = e.currentTarget.getAttribute('data-quest');
        if (GameState.claimQuestReward(questId)) {
          playSound('coins');
          openQuestsModal();
          updateHudValues();
        }
      });
    });

    document.querySelectorAll('.claim-ach-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const achId = e.currentTarget.getAttribute('data-ach');
        const coins = parseInt(e.currentTarget.getAttribute('data-coins'), 10);
        const item = e.currentTarget.getAttribute('data-item');
        const count = parseInt(e.currentTarget.getAttribute('data-count'), 10);
        if (GameState.claimAchievementReward(achId, coins, item, count)) {
          playSound('coins');
          openQuestsModal();
          updateHudValues();
        }
      });
    });
  }

  // --- 6. Battle Tower Modal ---
  function openTowerModal() {
    const state = GameState.getState();
    const stats = state.towerStats || { currentFloor: 1, highestStreak: 0, totalWins: 0 };

    const html = `
      <div style="text-align: center; padding: 10px 0;">
        <span style="font-size: 40px;">🗼</span>
        <h3 style="font-family: 'Press Start 2P', monospace; font-size: 14px; color: #38BDF8; margin: 10px 0;">
          ENDLESS BATTLE TOWER
        </h3>
        <p style="font-size: 11px; color: #94A3B8; max-width: 480px; margin: 0 auto 16px auto; line-height: 1.5;">
          Test your skills against waves of increasingly powerful trainers! Win consecutive battles to earn scaling rewards and prove your ultimate mastery.
        </p>

        <div style="background: #0F172A; padding: 14px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-around;">
          <div>
            <div style="font-size: 10px; color: #94A3B8; font-family: monospace;">CURRENT FLOOR</div>
            <div style="font-family: 'Press Start 2P', monospace; font-size: 16px; color: #FACC15; margin-top: 4px;">${stats.currentFloor}</div>
          </div>
          <div>
            <div style="font-size: 10px; color: #94A3B8; font-family: monospace;">HIGHEST STREAK</div>
            <div style="font-family: 'Press Start 2P', monospace; font-size: 16px; color: #4ADE80; margin-top: 4px;">${stats.highestStreak}</div>
          </div>
          <div>
            <div style="font-size: 10px; color: #94A3B8; font-family: monospace;">TOTAL WINS</div>
            <div style="font-family: 'Press Start 2P', monospace; font-size: 16px; color: #38BDF8; margin-top: 4px;">${stats.totalWins}</div>
          </div>
        </div>

        <button id="startTowerBattleBtn" style="
          padding: 12px 28px;
          background: #4ADE80;
          color: black;
          font-family: 'Press Start 2P', monospace;
          font-size: 12px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(74, 222, 128, 0.4);
        ">
          ⚔️ ENTER TOWER BATTLE
        </button>
      </div>
    `;

    openModal('tower', '🗼 BATTLE TOWER', html);

    document.getElementById('startTowerBattleBtn').addEventListener('click', () => {
      closeModal();
      if (root.startTowerEncounter) {
        root.startTowerEncounter(stats.currentFloor);
      }
    });
  }

  // --- 7. Settings Modal ---
  function openSettingsModal() {
    const state = GameState.getState();
    const settings = state.settings || {};

    const html = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="background: #0F172A; padding: 14px; border-radius: 8px;">
          <h4 style="font-family: 'Press Start 2P', monospace; font-size: 10px; color: #38BDF8; margin: 0 0 10px 0;">AUDIO SETTINGS</h4>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <label style="display: flex; justify-content: space-between; font-size: 11px; font-family: monospace;">
              <span>Master Volume</span>
              <input id="masterVolSlider" type="range" min="0" max="1" step="0.05" value="${settings.masterVolume !== undefined ? settings.masterVolume : 0.8}" />
            </label>
            <label style="display: flex; justify-content: space-between; font-size: 11px; font-family: monospace;">
              <span>Music Volume</span>
              <input id="bgmVolSlider" type="range" min="0" max="1" step="0.05" value="${settings.bgmVolume !== undefined ? settings.bgmVolume : 0.6}" />
            </label>
            <label style="display: flex; justify-content: space-between; font-size: 11px; font-family: monospace;">
              <span>Sound Effects</span>
              <input id="sfxVolSlider" type="range" min="0" max="1" step="0.05" value="${settings.sfxVolume !== undefined ? settings.sfxVolume : 0.8}" />
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 11px; font-family: monospace; cursor: pointer;">
              <input id="muteCheckbox" type="checkbox" ${settings.muted ? 'checked' : ''} />
              <span>Mute All Audio</span>
            </label>
          </div>
        </div>

        <div style="background: #0F172A; padding: 14px; border-radius: 8px;">
          <h4 style="font-family: 'Press Start 2P', monospace; font-size: 10px; color: #4ADE80; margin: 0 0 10px 0;">GAMEPLAY & COMFORT</h4>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 11px; font-family: monospace; cursor: pointer;">
              <input id="fastBattleCheckbox" type="checkbox" ${settings.fastBattle ? 'checked' : ''} />
              <span>Fast Battle Mode (Snappier animations)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 11px; font-family: monospace; cursor: pointer;">
              <input id="reducedMotionCheckbox" type="checkbox" ${settings.reducedMotion ? 'checked' : ''} />
              <span>Reduced Motion (Disable screen shakes)</span>
            </label>
          </div>
        </div>

        <div style="background: #0F172A; padding: 14px; border-radius: 8px;">
          <h4 style="font-family: 'Press Start 2P', monospace; font-size: 10px; color: #FACC15; margin: 0 0 10px 0;">SAVE & BACKUP</h4>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button id="saveGameManualBtn" style="padding: 8px 12px; background: #4ADE80; color: black; border: none; border-radius: 4px; font-family: 'Press Start 2P', monospace; font-size: 9px; cursor: pointer;">
              SAVE GAME
            </button>
            <button id="exportSaveBtn" style="padding: 8px 12px; background: #38BDF8; color: black; border: none; border-radius: 4px; font-family: 'Press Start 2P', monospace; font-size: 9px; cursor: pointer;">
              EXPORT BACKUP
            </button>
            <button id="resetGameBtn" style="padding: 8px 12px; background: #EF4444; color: white; border: none; border-radius: 4px; font-family: 'Press Start 2P', monospace; font-size: 9px; cursor: pointer;">
              NEW GAME / RESET
            </button>
          </div>
        </div>
      </div>
    `;

    openModal('settings', '⚙️ SETTINGS & PREFERENCES', html);

    document.getElementById('masterVolSlider').addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      settings.masterVolume = val;
      if (AudioEngine) AudioEngine.setMasterVolume(val);
      GameState.save();
    });

    document.getElementById('bgmVolSlider').addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      settings.bgmVolume = val;
      if (AudioEngine) AudioEngine.setBgmVolume(val);
      GameState.save();
    });

    document.getElementById('sfxVolSlider').addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      settings.sfxVolume = val;
      if (AudioEngine) AudioEngine.setSfxVolume(val);
      GameState.save();
    });

    document.getElementById('muteCheckbox').addEventListener('change', (e) => {
      settings.muted = e.target.checked;
      if (AudioEngine) AudioEngine.setMuted(e.target.checked);
      GameState.save();
    });

    document.getElementById('fastBattleCheckbox').addEventListener('change', (e) => {
      settings.fastBattle = e.target.checked;
      GameState.save();
    });

    document.getElementById('reducedMotionCheckbox').addEventListener('change', (e) => {
      settings.reducedMotion = e.target.checked;
      GameState.save();
    });

    document.getElementById('saveGameManualBtn').addEventListener('click', () => {
      GameState.save();
      playSound('coins');
      alert('Game progress saved successfully!');
    });

    document.getElementById('exportSaveBtn').addEventListener('click', () => {
      const jsonStr = GameState.exportSave();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(jsonStr).then(() => {
          alert('Save backup copied to clipboard! You can also paste it into any text file.');
        });
      } else {
        prompt('Copy your save data below:', jsonStr);
      }
    });

    document.getElementById('resetGameBtn').addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all game progress and start a new adventure?')) {
        GameState.resetGame(PokemonData);
        playSound('faint');
        updateHudValues();
        closeModal();
      }
    });
  }

  function toggleQuickMenu() {
    if (activeModal) {
      closeModal();
    } else {
      openPokedexModal();
    }
  }

  return {
    init,
    openModal,
    closeModal,
    renderHud,
    updateHudValues,
    openPokedexModal,
    openTeamModal,
    openBagModal,
    openWorldMapModal,
    openQuestsModal,
    openTowerModal,
    openSettingsModal,
    toggleQuickMenu
  };
});
