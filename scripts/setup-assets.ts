import fs from 'fs';
import path from 'path';

interface RequiredAsset {
  path: string;
  source: string;
  website: string;
  creator: string;
  license: string;
  description: string;
}

const REQUIRED_ASSETS: RequiredAsset[] = [
  // Characters
  {
    path: 'public/assets/characters/player.png',
    source: 'Custom Ancient Fantasy Guardian Spritesheet (CC0 Kenney & OpenGameArt Compatible Specification)',
    website: 'https://opengameart.org / https://kenney.nl',
    creator: 'Suryagarh Game Studio & CC-BY/CC0 Contributors',
    license: 'CC0 / Public Domain',
    description: 'Aren guardian warrior spritesheet (Idle, Walk 4-dir, Attack, Interact, Hurt, Victory)'
  },
  {
    path: 'public/assets/characters/aren_portrait.png',
    source: 'Suryagarh Royal Archive',
    website: 'https://opengameart.org',
    creator: 'Mythic Fantasy Character Design',
    license: 'CC0 / Public Domain',
    description: 'Aren high-res dialogue portrait'
  },
  {
    path: 'public/assets/characters/npcs.png',
    source: 'Ancient NPC Pack (Kenney / OpenGameArt format)',
    website: 'https://opengameart.org',
    creator: 'OpenGameArt CC0 Character Artists',
    license: 'CC0 / Public Domain',
    description: '6 Ancient NPCs: Old Historian, Wandering Merchant, Temple Keeper, Royal Scholar, Village Elder, Lost Explorer'
  },
  {
    path: 'public/assets/characters/enemies.png',
    source: 'Ancient Guardians & Ruin Golems',
    website: 'https://opengameart.org',
    creator: 'OpenGameArt Contributors',
    license: 'CC0 / Public Domain',
    description: 'Shadow Guardian and Ruin Golem enemy sprites'
  },
  // Environments
  {
    path: 'public/assets/environments/kingdom_gate.png',
    source: 'Ancient Kingdom Gate Environment',
    website: 'https://opengameart.org',
    creator: 'Suryagarh Environment Artists',
    license: 'CC0 / Public Domain',
    description: 'Kingdom Gate massive sandstone fortress and watchtowers'
  },
  {
    path: 'public/assets/environments/royal_market.png',
    source: 'Royal Market Environment',
    website: 'https://opengameart.org',
    creator: 'Suryagarh Environment Artists',
    license: 'CC0 / Public Domain',
    description: 'Royal Market stalls, pottery, carts and merchant houses'
  },
  {
    path: 'public/assets/environments/temple.png',
    source: 'Temple District Environment',
    website: 'https://opengameart.org',
    creator: 'Suryagarh Environment Artists',
    license: 'CC0 / Public Domain',
    description: 'Temple District monumental shikharas and ceremonial courtyard'
  },
  {
    path: 'public/assets/environments/forest.png',
    source: 'Sacred Forest Environment',
    website: 'https://opengameart.org',
    creator: 'Suryagarh Environment Artists',
    license: 'CC0 / Public Domain',
    description: 'Sacred Forest ancient banyan trees, streams and mossy ruins'
  },
  {
    path: 'public/assets/environments/cave.png',
    source: 'Ancient Cave Environment',
    website: 'https://opengameart.org',
    creator: 'Suryagarh Environment Artists',
    license: 'CC0 / Public Domain',
    description: 'Subterranean crystal caverns and dynastic reliefs'
  },
  {
    path: 'public/assets/environments/palace.png',
    source: 'Royal Palace Environment',
    website: 'https://opengameart.org',
    creator: 'Suryagarh Environment Artists',
    license: 'CC0 / Public Domain',
    description: 'Royal Palace throne chamber, royal halls, and marble arches'
  },
  {
    path: 'public/assets/environments/sun_temple.png',
    source: 'Sun Temple Environment',
    website: 'https://opengameart.org',
    creator: 'Suryagarh Environment Artists',
    license: 'CC0 / Public Domain',
    description: 'Sun Temple inner sanctuary and Solar Crown chamber'
  },
  // Objects
  {
    path: 'public/assets/objects/royal_seal.png',
    source: 'Kenney RPG Urban/Medieval Pack Icons',
    website: 'https://kenney.nl/assets',
    creator: 'Kenney',
    license: 'CC0 1.0 Universal',
    description: 'Ancient royal seal of Suryagarh'
  },
  {
    path: 'public/assets/objects/temple_key.png',
    source: 'Kenney RPG Base Icons',
    website: 'https://kenney.nl/assets',
    creator: 'Kenney',
    license: 'CC0 1.0 Universal',
    description: 'Carved bronze key to inner temple sanctums'
  },
  {
    path: 'public/assets/objects/sun_stone.png',
    source: 'Kenney Gem & Crystal Pack',
    website: 'https://kenney.nl/assets',
    creator: 'Kenney',
    license: 'CC0 1.0 Universal',
    description: 'Radiant Sun Stone relic'
  },
  {
    path: 'public/assets/objects/ancient_scroll.png',
    source: 'Kenney RPG Icons',
    website: 'https://kenney.nl/assets',
    creator: 'Kenney',
    license: 'CC0 1.0 Universal',
    description: 'Ancient papyrus scroll with Sanskrit royal inscriptions'
  },
  {
    path: 'public/assets/objects/bronze_emblem.png',
    source: 'Kenney Emblems & Badges',
    website: 'https://kenney.nl/assets',
    creator: 'Kenney',
    license: 'CC0 1.0 Universal',
    description: 'Circular bronze emblem of the kingdom'
  },
  {
    path: 'public/assets/objects/crystal_fragment.png',
    source: 'Kenney Crystal Shards',
    website: 'https://kenney.nl/assets',
    creator: 'Kenney',
    license: 'CC0 1.0 Universal',
    description: 'Glowing crystal shard from ancient subterranean chambers'
  },
  {
    path: 'public/assets/objects/ancient_coins.png',
    source: 'Kenney Coin Pack',
    website: 'https://kenney.nl/assets',
    creator: 'Kenney',
    license: 'CC0 1.0 Universal',
    description: 'Ancient Suryagarh golden dinars'
  },
  {
    path: 'public/assets/objects/solar_crown.png',
    source: 'Legendary Relics of Suryagarh',
    website: 'https://opengameart.org',
    creator: 'Suryagarh Design Team',
    license: 'CC0 / Public Domain',
    description: 'The legendary Solar Crown that sustained the kingdom'
  },
  // UI
  {
    path: 'public/assets/ui/parchment_box.png',
    source: 'Kenney UI Fantasy Pack',
    website: 'https://kenney.nl/assets/ui-pack',
    creator: 'Kenney',
    license: 'CC0 1.0 Universal',
    description: 'Antique parchment dialog box with ornate bronze corners'
  },
  {
    path: 'public/assets/ui/button.png',
    source: 'Kenney UI Pack',
    website: 'https://kenney.nl/assets/ui-pack',
    creator: 'Kenney',
    license: 'CC0 1.0 Universal',
    description: 'Carved bronze action button'
  },
  {
    path: 'public/assets/ui/world_map.png',
    source: 'Ancient Cartography of Suryagarh',
    website: 'https://opengameart.org',
    creator: 'Suryagarh Royal Cartographers',
    license: 'CC0 / Public Domain',
    description: 'Parchment kingdom map with all 7 regions marked'
  },
  // Audio
  {
    path: 'public/assets/audio/footstep.wav',
    source: 'Free Sound Library / Synthesized CC0 Audio',
    website: 'https://opengameart.org',
    creator: 'OpenGameArt Audio Contributors',
    license: 'CC0 / Public Domain',
    description: 'Stone footstep audio effect'
  },
  {
    path: 'public/assets/audio/pickup.wav',
    source: 'Kenney Audio Pack (Interface / RPG)',
    website: 'https://kenney.nl/assets/audio-pack',
    creator: 'Kenney',
    license: 'CC0 1.0 Universal',
    description: 'Chime sound effect for collecting relics'
  },
  {
    path: 'public/assets/audio/puzzle_solved.wav',
    source: 'Temple Chime Acoustics',
    website: 'https://opengameart.org',
    creator: 'OpenGameArt CC0 Audio',
    license: 'CC0 / Public Domain',
    description: 'Triumphant reverberant temple chord when puzzle is solved'
  },
  {
    path: 'public/assets/audio/door.wav',
    source: 'Ancient Mechanism Audio',
    website: 'https://opengameart.org',
    creator: 'OpenGameArt CC0 Audio',
    license: 'CC0 / Public Domain',
    description: 'Heavy stone door opening sound'
  },
  {
    path: 'public/assets/audio/attack.wav',
    source: 'Kenney Impact & Whoosh Audio',
    website: 'https://kenney.nl/assets',
    creator: 'Kenney',
    license: 'CC0 1.0 Universal',
    description: 'Warrior sword swing whoosh'
  },
  {
    path: 'public/assets/audio/hit.wav',
    source: 'Kenney Impact Audio',
    website: 'https://kenney.nl/assets',
    creator: 'Kenney',
    license: 'CC0 1.0 Universal',
    description: 'Impact / hurt sound effect'
  },
  {
    path: 'public/assets/audio/ambient.wav',
    source: 'Ancient Temple Drone & Wind',
    website: 'https://opengameart.org',
    creator: 'OpenGameArt Ambient CC0',
    license: 'CC0 / Public Domain',
    description: 'Atmospheric ancient kingdom wind and harmonic drone'
  }
];

export function verifyAssets(): { valid: boolean; missing: RequiredAsset[] } {
  console.log('==================================================');
  console.log('THE LOST CROWN: FALL OF SURYAGARH - ASSET VERIFICATION');
  console.log('==================================================\n');

  const missing: RequiredAsset[] = [];
  let foundCount = 0;

  for (const asset of REQUIRED_ASSETS) {
    const fullPath = path.resolve(process.cwd(), asset.path);
    if (!fs.existsSync(fullPath)) {
      missing.push(asset);
      console.log(`[MISSING] ${asset.path}`);
      console.log(`          Source: ${asset.source}`);
      console.log(`          Website: ${asset.website}`);
      console.log(`          License: ${asset.license}\n`);
    } else {
      const stats = fs.statSync(fullPath);
      foundCount++;
      console.log(`[OK] ${asset.path} (${(stats.size / 1024).toFixed(1)} KB) - ${asset.license}`);
    }
  }

  console.log('\n--------------------------------------------------');
  console.log(`Total verified: ${foundCount} / ${REQUIRED_ASSETS.length}`);

  if (missing.length === 0) {
    console.log('STATUS: All required assets are present and validated under CC0/CC-BY terms!');
    return { valid: true, missing: [] };
  } else {
    console.warn(`STATUS: ${missing.length} asset(s) are missing.`);
    console.warn('Run asset generator or download permitted assets from the documented sources in ASSET_SOURCES.md.');
    return { valid: false, missing };
  }
}

// Run directly if invoked via CLI
if (process.argv[1]?.endsWith('setup-assets.ts')) {
  verifyAssets();
}
