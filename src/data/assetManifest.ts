export interface AssetManifestEntry {
  key: string;
  type: 'image' | 'spritesheet' | 'audio';
  path: string;
  config?: {
    frameWidth?: number;
    frameHeight?: number;
  };
  category: 'character' | 'environment' | 'object' | 'ui' | 'audio' | 'tileset';
}

export const ASSET_MANIFEST: AssetManifestEntry[] = [
  // Environments
  { key: 'kingdom_gate', type: 'image', path: 'assets/environments/kingdom_gate.png', category: 'environment' },
  { key: 'royal_market', type: 'image', path: 'assets/environments/royal_market.png', category: 'environment' },
  { key: 'temple', type: 'image', path: 'assets/environments/temple.png', category: 'environment' },
  { key: 'forest', type: 'image', path: 'assets/environments/forest.png', category: 'environment' },
  { key: 'cave', type: 'image', path: 'assets/environments/cave.png', category: 'environment' },
  { key: 'palace', type: 'image', path: 'assets/environments/palace.png', category: 'environment' },
  { key: 'sun_temple', type: 'image', path: 'assets/environments/sun_temple.png', category: 'environment' },

  // Characters
  {
    key: 'player',
    type: 'spritesheet',
    path: 'assets/characters/player.png',
    config: { frameWidth: 64, frameHeight: 64 },
    category: 'character'
  },
  {
    key: 'npcs',
    type: 'spritesheet',
    path: 'assets/characters/npcs.png',
    config: { frameWidth: 48, frameHeight: 48 },
    category: 'character'
  },
  {
    key: 'enemies',
    type: 'spritesheet',
    path: 'assets/characters/enemies.png',
    config: { frameWidth: 64, frameHeight: 64 },
    category: 'character'
  },
  { key: 'aren_portrait', type: 'image', path: 'assets/characters/aren_portrait.png', category: 'character' },

  // Objects & Relics
  { key: 'royal_seal', type: 'image', path: 'assets/objects/royal_seal.png', category: 'object' },
  { key: 'temple_key', type: 'image', path: 'assets/objects/temple_key.png', category: 'object' },
  { key: 'sun_stone', type: 'image', path: 'assets/objects/sun_stone.png', category: 'object' },
  { key: 'ancient_scroll', type: 'image', path: 'assets/objects/ancient_scroll.png', category: 'object' },
  { key: 'bronze_emblem', type: 'image', path: 'assets/objects/bronze_emblem.png', category: 'object' },
  { key: 'crystal_fragment', type: 'image', path: 'assets/objects/crystal_fragment.png', category: 'object' },
  { key: 'ancient_coins', type: 'image', path: 'assets/objects/ancient_coins.png', category: 'object' },
  { key: 'solar_crown', type: 'image', path: 'assets/objects/solar_crown.png', category: 'object' },
  { key: 'torch', type: 'image', path: 'assets/objects/torch.png', category: 'object' },
  { key: 'chest', type: 'image', path: 'assets/objects/chest.png', category: 'object' },

  // UI
  { key: 'parchment_box', type: 'image', path: 'assets/ui/parchment_box.png', category: 'ui' },
  { key: 'button', type: 'image', path: 'assets/ui/button.png', category: 'ui' },
  { key: 'world_map', type: 'image', path: 'assets/ui/world_map.png', category: 'ui' },
  { key: 'joy_base', type: 'image', path: 'assets/ui/joy_base.png', category: 'ui' },
  { key: 'joy_knob', type: 'image', path: 'assets/ui/joy_knob.png', category: 'ui' },

  // Tilesets
  { key: 'ancient_tileset', type: 'image', path: 'assets/tilesets/ancient_tileset.png', category: 'tileset' },

  // Audio
  { key: 'sfx_step', type: 'audio', path: 'assets/audio/footstep.wav', category: 'audio' },
  { key: 'sfx_pickup', type: 'audio', path: 'assets/audio/pickup.wav', category: 'audio' },
  { key: 'sfx_attack', type: 'audio', path: 'assets/audio/attack.wav', category: 'audio' },
  { key: 'sfx_hit', type: 'audio', path: 'assets/audio/hit.wav', category: 'audio' },
  { key: 'sfx_puzzle', type: 'audio', path: 'assets/audio/puzzle_solved.wav', category: 'audio' },
  { key: 'sfx_door', type: 'audio', path: 'assets/audio/door.wav', category: 'audio' },
  { key: 'bgm_ambient', type: 'audio', path: 'assets/audio/ambient.wav', category: 'audio' }
];
