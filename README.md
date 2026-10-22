# Pokémon Adventure: Complete Edition

A cohesive, expansive, and feature-rich Pokémon RPG gaming experience built with modern HTML5 Canvas, responsive DOM interfaces, dual-layer audio, and decoupled game simulation engines.

---

## 🎮 Key Features

### 🗺️ World Exploration & Tiled Map System Overhaul
- **7 Authentic Tiled Maps (`maps/`)**:
  - **Pellet Town** (`maps/pelletTown.json`): Peaceful home settlement with Professor's Lab, Pokémon Center, and PokéMart.
  - **Verdant Route** (`maps/verdantRoute.json`): Open meadows with beginner wild encounters, fences, and dirt trails.
  - **Whispering Woods** (`maps/whisperingWoods.json`): Dense ancient forest with wild Eevee, Bulbasaur, Butterfree, and falling leaf weather.
  - **Ember Crag & Caverns** (`maps/emberCrag.json`): Smoldering volcanic cliffs with Fire/Rock encounters and floating embers.
  - **Cerulean Coast** (`maps/ceruleanCoast.json`): Ocean beaches with Water/Ice encounters, sea cliffs, and wooden pier.
  - **Haunted Crypt** (`maps/hauntedCrypt.json`): Supernatural catacombs with Ghost/Psychic Pokémon and purple fog.
  - **Indigo Summit** (`maps/indigoSummit.json`): Sacred mountain where Champion Lance and elite dragons battle in the grand arena.
- **Physical Route Warps & Seamless Traversal (`src/engine/mapManager.js`)**:
  - Walk between connected regions by stepping on route boundary transitions (e.g. north of Pellet Town directly into Verdant Route).
  - High-performance offscreen canvas layer caching for silky smooth 60 FPS rendering.
  - On-screen arrival banners and Gym Badge gates preventing entry into high-level areas prematurely.
- **Fast Travel & World Map**: Interactive map with badge requirements, level guides, and instant travel.
- **Dynamic Weather & Ambient Particles**: Animated falling leaves, fire embers, water mist, supernatural fog, and victory starbursts.

### ⚔️ Robust Turn-Based Battle Engine
- **Decoupled Battle Simulation (`src/engine/battleEngine.js`)**:
  - Full 18-type effectiveness chart with STAB (1.5x) and immunities (0x).
  - Physical vs. Special damage calculations, critical hits (1.5x), accuracy, and PP tracking.
  - Primary Status Ailments: Burn (BRN), Poison (PSN), Paralysis (PAR), Sleep (SLP), and Freeze (FRZ).
  - Struggle fallback attack with recoil damage when all move PP is depleted.
  - Smart Enemy AI that prioritizes knockouts, type advantages, and strategic status afflictions.
  - Smooth animated health bars (green ➔ yellow ➔ red) and animated EXP progress bars.
  - Floating combat text and multi-element visual attack effects (Fireball, Water Torrent, Leaf Slash, Lightning Bolt, Shadow Mist).

### 🔴 Engaging Catching Mechanics (`src/engine/catchEngine.js`)
- **Gen 3/4 Capture Formula**:
  - Probability scales based on remaining target HP, species catch rate, ball multiplier, and status ailments.
  - Authentic Poké Ball wobble animation: 0, 1, 2, or 3 shakes before break-free, or 4 shakes for capture success!
  - Multiple Poké Ball variants: Standard Poké Ball, Great Ball (1.5x), Ultra Ball (2.0x), Net Ball (3.0x vs Water/Bug), Dusk Ball (3.0x in caves/crypts), and Master Ball (100% guaranteed).

### 📖 National Pokédex & 40 Pokémon Roster
- Full roster of 40 Pokémon across all 18 types.
- Pokédex search, filtering by type, seen/caught badges, and silhouette mystery states for unencountered species.
- Individual species profile: lore, base stat radar/bars, learnable moves, and evolution trees.
- Shiny Variants: 2% shiny encounter chance with golden sparkles and alternate shiny color palettes.

### 👥 Team Management & PC Box Storage
- Maintain an active party of up to 6 Pokémon.
- Unlimited PC Storage Box for surplus caught Pokémon.
- Party reordering, stat comparison, and team type-weakness / coverage analyzer.
- Free healing at any Pokémon Center desk or using Potions, Revives, and Status Heals from your bag.

### 📈 Evolution & Progression
- Level-up evolutions (e.g. Charmander ➔ Charmeleon ➔ Charizard, Emby ➔ Emberon ➔ Infernodra).
- Element Stone evolutions (Eevee ➔ Vaporeon / Jolteon / Flareon, Pikachu ➔ Raichu).
- Gym Badges: Boulder Badge, Cascade Badge, Thunder Badge, Rainbow Badge, Soul Badge, and Champion Trophy.
- 20+ persistent achievements with coin and item rewards.
- Daily Quests with automatic date-based reset and duplicate claim safeguards.

### 🗼 Endless Battle Tower Gauntlet
- Climb successive floors with scaling trainer difficulty.
- Boss battles every 5 floors against elite teams.
- Floor rewards, streak record tracking, and high score persistence.

### 🎒 Economy & PokéMart
- Earn Poké dollars from winning battles, clearing tower floors, and claiming achievements.
- PokéMart shop with buying and selling for Poké Balls, Potions, Evolution Stones, and Treasures (Nuggets).

### 🎵 Dual-Layer Audio Engine (`src/engine/audioEngine.js`)
- Native Howler.js integration for soundtrack BGM and sound effects.
- Web Audio API 8-bit synthetic sound generator fallback: ensures 100% reliable SFX (menu blips, ball shakes, fanfares, hit impacts) across all browsers even if local audio files are blocked by autoplay policies.
- Master, BGM, and SFX volume sliders, plus persistent mute toggle.

### 📱 Responsive Design & Cross-Platform Controls
- Fluid canvas scaling maintaining a crisp 16:9 aspect ratio (`image-rendering: pixelated;`).
- Full Keyboard Controls:
  - Movement: `W`, `A`, `S`, `D` or `Arrow Keys`
  - Sprint: Hold `Shift` (5px/s speed)
  - Action / Confirm / Dialogue: `Space`, `Enter`, or `Z`
  - Back / Cancel: `Escape` or `X`
  - Hotkeys: `M` (Map), `P` (Dex), `T` (Team), `B` (Bag), `C` (Badges/Quests)
  - Battle Shortcuts: `1`, `2`, `3`, `4` for direct move selection
- Mobile & Tablet Touch Controls: On-screen touch D-Pad and Action buttons (A, B, Run, HUD) with haptic vibration feedback.

---

## 🏗️ Architecture & Codebase Overview

```
pokemon/
├── index.html                   # Responsive main entry point and UI HUD overlays
├── style.css                    # Game styling, pixel font, modals, and animations
├── index.js                     # Map exploration loop, movement, collisions, and encounters
├── battleScene.js               # Battle animation loop, action menu, and turn sequencing
├── classes.js                   # Sprite, Monster, PokeballActor, and Boundary classes
├── serve.js                     # Zero-dependency Node.js HTTP server with audio range streaming
├── package.json                 # Scripts for test, start, and build
├── scripts/
│   └── verify.js                # Build and integrity verification script
├── src/
│   ├── core/
│   │   └── gameState.js         # Central state manager, save/load, and event bus
│   ├── data/
│   │   ├── typeChart.js         # 18-type effectiveness matrix and color codes
│   │   ├── movesData.js         # 48 move definitions with accuracy, power, and PP
│   │   ├── pokemonData.js       # 40 species definitions, base stats, and learnsets
│   │   ├── itemsData.js         # 26 item definitions (Balls, Medicine, Stones)
│   │   ├── worldAreas.js        # 7 exploration zones and encounter tables
│   │   └── trainersData.js      # NPC trainers, Gym Leaders, and Champion teams
│   ├── engine/
│   │   ├── battleEngine.js      # Pure, decoupled turn-based battle calculations
│   │   ├── catchEngine.js       # Gen 3/4 catch probability calculations
│   │   ├── battleTower.js       # Endless tower opponent and reward scaling
│   │   └── audioEngine.js       # Dual-layer audio with Web Audio synth fallback
│   ├── graphics/
│   │   ├── particleSystem.js    # Weather particles and combat visual bursts
│   │   └── spriteRenderer.js    # Retro procedural sprites and shiny sparkle rendering
│   └── ui/
│       ├── modalManager.js      # Accessible modals for Dex, Team, Bag, Map, Quests, Tower
│       └── touchControls.js     # On-screen touch D-Pad and action buttons
└── test/
    ├── typeChart.test.js        # Type effectiveness unit tests
    ├── movesData.test.js        # Moves database integrity unit tests
    ├── pokemonData.test.js      # Pokémon species and stat growth unit tests
    ├── battleEngine.test.js     # Damage formula, STAB, critical hits, and leveling unit tests
    ├── catchEngine.test.js      # Catch rate and shake probability unit tests
    ├── gameState.test.js        # Party limits, inventory safety, and save migration tests
    ├── worldAndTrainers.test.js # Exploration zones and trainer rosters unit tests
    └── battleTower.test.js      # Tower floor generation and reward scaling unit tests
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended; built-in test runner works on Node 20/22/24 with zero external dependencies)

### Installation & Launch
```bash
# Clone the repository and navigate into the folder
cd pokemon

# Run the local game server
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Running Automated Tests
```bash
npm test
```
Executes all 30 automated unit tests testing damage formulas, capture probabilities, leveling, storage, and persistence.

### Running Build Verification
```bash
npm run build
```
Validates asset existence, data integrity across all 40 species, 48 moves, 26 items, 7 areas, and 7 trainers.

---

## 💾 Save & Backup System

- Saves are automatically stored in your browser's `localStorage` under `pokemon_adventure_save_v2`.
- Autosaves occur on battle completions, catches, item purchases, and healing.
- **Manual Backups**: Open the Settings menu (`⚙️`) to export your save as a JSON string or file. You can import your backup anytime to restore your exact progress.
- **Corrupted Save Protection**: If invalid save data is detected, the game creates an automatic safety backup and initializes a clean adventure state without crashing.

---

## 📜 Attribution & Legal Notice

This project is a fan-made, non-commercial game development project created for educational and entertainment purposes. Pokémon and Pokémon character names are trademarks of Nintendo, Creatures Inc., and Game Freak.
