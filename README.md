# THE LOST CROWN: FALL OF SURYAGARH (3D EDITION)

An immersive 3D third-person ancient kingdom action-adventure game built with **Babylon.js**, **TypeScript**, **Vite**, **WebGL**, and **HTML5/CSS3**.

Explore the ancient ruins of **Suryagarh** as **Aren**, the awakened royal guardian. Centuries after the disappearance of the sacred **Solar Crown**, navigate seven interconnected ancient 3D regions, converse with surviving scholars, historians, and merchants, solve physical mechanism puzzles, collect forgotten relics, and restore dawn to the kingdom at the Sun Altar!

---

## 1. Features

- **3D Third-Person Exploration**: Fully modeled third-person camera following Aren with smooth mouse orbit, collision detection, and obstacle avoidance.
- **7 Interconnected 3D Regions**:
  1. **Ancient Kingdom Gate**: Towering sandstone bastions, broken fortress walls, watchtowers, and the Three Solar Wheels lever mechanism.
  2. **Royal Market**: Abandoned bazaar stalls, pottery, Merchant Kavi, and the Temple Key.
  3. **Temple District**: Ceremonial stepped courtyards, soaring stone shikharas, lotus fountains, and the three decoded Inscriptions of Truth.
  4. **Sacred Forest**: Dense banyan and sal canopy, mossy stone trails, sacred streams, and the Ancient Scroll of Kings.
  5. **Ancient Cave**: Subterranean vaults, stalagmites, glowing crystals, light refraction puzzle, and the Royal Seal.
  6. **Royal Palace**: Colonnaded marble halls, the Throne of King Harsha, and the radiant Sun Stone.
  7. **Sun Temple (Final Sanctuary)**: Monumental golden platforms, the Four Celestial Dials (Code: `3 - 1 - 4 - 2`), the descending Solar Crown, and the grand dawn victory sequence.
- **Animated 3D Character (Aren)**:
  - Articulated character model with ancient guardian armor, bronze chestplate, royal sun crest, flowing saffron cloak, arm bracers, and curved talwar blade.
  - Skeletal animation states: idle breathing, walking, sprinting, jumping, blade attack slash, interaction reach, hurt recoil, and crown victory celebration.
- **Physical 3D Puzzles**:
  - Lever arms that rotate on stone pedestals.
  - Glowing inscribed pillars with ancient Vedic runes.
  - Prismatic light refraction crystals aligning beams.
  - Four rotating celestial dials encircling the Sun Altar.
- **Atmospheric Ancient Environment**:
  - Region-specific lighting, PBR materials, sandstone and marble textures, fog, and floating golden dust motes.
  - Ambient temple drone, footstep sounds, sword whooshes, and temple chime acoustics.
- **Parchment UI & Save System**:
  - Health bar, active quest tracking, contextual prompt `[E] Action`.
  - Full-screen Relic Inventory (`I`), Ancient Kingdom Map (`M`), Quest Journal (`J`), and Pause/Archive (`ESC`).
  - Persistent browser `localStorage` saving and checkpoint resumption.
  - Mobile touch support with virtual touch controls.

---

## 2. Quickstart & Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build

# Type check
npm run lint
```

---

## 3. Controls

### Desktop:
- **Movement**: `W` / `A` / `S` / `D` or `Arrow Keys`
- **Camera Look**: Mouse drag or move
- **Sprint**: Hold `Shift`
- **Jump**: `Space`
- **Interact / Talk / Align**: `E`
- **Talwar Blade Strike (Attack)**: `Click` / `Space` (during combat)
- **Inventory & Relics**: `I`
- **Kingdom Map**: `M`
- **Quest Journal**: `J`
- **Pause & Save**: `ESC`

### Mobile & Touch:
- Drag on screen to orbit camera.
- Dedicated touch action buttons: `ATTACK`, `ACT`, `JUMP`.
- Quick-access overlay buttons for Bag, Map, Quests, and Menu.

---

## 4. Project Architecture

```text
src/
    main.ts

    scenes/
        BootScene.ts
        LoadingScene.ts
        MenuScene.ts
        KingdomScene.ts
        InteriorScene.ts
        GameOverScene.ts

    player/
        Player.ts
        PlayerController.ts
        PlayerAnimation.ts

    world/
        WorldManager.ts
        LocationManager.ts
        TerrainSystem.ts
        BuildingSystem.ts
        EnvironmentSystem.ts

    characters/
        NPC.ts
        NPCManager.ts

    gameplay/
        InteractionSystem.ts
        QuestSystem.ts
        InventorySystem.ts
        PuzzleSystem.ts
        DialogueSystem.ts
        SaveSystem.ts

    ui/
        HUD.ts
        InventoryUI.ts
        QuestUI.ts
        DialogueUI.ts
        MapUI.ts
        MenuUI.ts

    data/
        locations.ts
        quests.ts
        items.ts
        npcs.ts
        puzzles.ts

    utils/
        constants.ts
        helpers.ts
        AssetLoader.ts
```

---

## 5. Licensing & Assets

All external audio, icons, and 3D architectural specifications adhere to **CC0 (Public Domain)**:
- Kenney (UI, icons, sounds)
- OpenGameArt (character portraits, ambient audio)
- Poly Haven (PBR material models)
- Quaternius (character models and rigs)

Detailed records and links are provided in `ASSET_SOURCES.md`.
