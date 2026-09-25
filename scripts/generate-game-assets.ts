import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

// Ensure directories
const DIRS = [
  'public/assets/characters',
  'public/assets/environments',
  'public/assets/tilesets',
  'public/assets/objects',
  'public/assets/ui',
  'public/assets/audio',
  'public/assets/fonts'
];

DIRS.forEach(d => {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  }
});

// Helper for pixel drawing
function setPixel(png: PNG, x: number, y: number, r: number, g: number, b: number, a = 255) {
  if (x < 0 || x >= png.width || y < 0 || y >= png.height) return;
  const idx = (png.width * y + x) << 2;
  // Alpha blend
  const prevA = png.data[idx + 3] / 255;
  const curA = a / 255;
  const outA = curA + prevA * (1 - curA);
  if (outA > 0) {
    png.data[idx] = Math.round((r * curA + png.data[idx] * prevA * (1 - curA)) / outA);
    png.data[idx + 1] = Math.round((g * curA + png.data[idx + 1] * prevA * (1 - curA)) / outA);
    png.data[idx + 2] = Math.round((b * curA + png.data[idx + 2] * prevA * (1 - curA)) / outA);
    png.data[idx + 3] = Math.round(outA * 255);
  }
}

function fillRect(png: PNG, x: number, y: number, w: number, h: number, r: number, g: number, b: number, a = 255) {
  for (let py = y; py < y + h; py++) {
    for (let px = x; px < x + w; px++) {
      setPixel(png, px, py, r, g, b, a);
    }
  }
}

function fillCircle(png: PNG, cx: number, cy: number, radius: number, r: number, g: number, b: number, a = 255) {
  const r2 = radius * radius;
  for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y++) {
    for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) {
        setPixel(png, x, y, r, g, b, a);
      }
    }
  }
}

function savePng(png: PNG, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    png.pack()
      .pipe(fs.createWriteStream(filepath))
      .on('finish', () => resolve())
      .on('error', reject);
  });
}

// -------------------------------------------------------------
// 1. GENERATE PLAYER SPRITESHEET (Aren)
// 64x64 frame size. 4 columns x 9 rows = 256 x 576 px
// Rows:
// 0: Idle (4 frames)
// 1: Walk Down (4 frames)
// 2: Walk Up (4 frames)
// 3: Walk Left (4 frames)
// 4: Walk Right (4 frames)
// 5: Attack (4 frames)
// 6: Interact (4 frames)
// 7: Hurt (4 frames)
// 8: Victory (4 frames)
// -------------------------------------------------------------
async function generatePlayerSpriteSheet() {
  const FRAME_W = 64;
  const FRAME_H = 64;
  const COLS = 4;
  const ROWS = 9;
  const png = new PNG({ width: FRAME_W * COLS, height: FRAME_H * ROWS });

  // Clear transparent
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i + 3] = 0;
  }

  // Draw Aren in each frame
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const ox = col * FRAME_W;
      const oy = row * FRAME_H;
      const bob = (col % 2 === 1) ? 2 : 0;
      const walkShift = (col === 1 ? -2 : col === 3 ? 2 : 0);

      // Shadow at feet
      fillCircle(png, ox + 32, oy + 56, 12, 10, 8, 5, 80);

      // Colors for Aren:
      // Skin: [210, 155, 110]
      // Hair: [35, 25, 20]
      // Tunic (Ancient Royal Crimson & Gold): [165, 42, 42], [220, 160, 40]
      // Armor/Guards (Bronze): [190, 130, 60]
      // Boots: [75, 45, 25]
      // Cloak (Deep saffron/amber): [205, 120, 30]

      let skinColor = [215, 160, 115];
      if (row === 7) {
        // Hurt: flash red
        skinColor = [255, 100, 100];
      }

      // Legs / Boots
      const legY = oy + 42 - bob;
      if (row === 1 || row === 2) {
        // walk vertical
        fillRect(png, ox + 24 + walkShift, legY, 6, 14, 75, 45, 25);
        fillRect(png, ox + 34 - walkShift, legY, 6, 14, 75, 45, 25);
      } else if (row === 3) {
        // walk left
        fillRect(png, ox + 26 + walkShift, legY, 7, 14, 75, 45, 25);
        fillRect(png, ox + 31 - walkShift, legY, 6, 13, 60, 35, 20);
      } else if (row === 4) {
        // walk right
        fillRect(png, ox + 26 - walkShift, legY, 6, 13, 60, 35, 20);
        fillRect(png, ox + 31 + walkShift, legY, 7, 14, 75, 45, 25);
      } else {
        fillRect(png, ox + 25, legY, 6, 14, 75, 45, 25);
        fillRect(png, ox + 33, legY, 6, 14, 75, 45, 25);
      }

      // Cloak back if walking up or idle
      if (row === 2) {
        fillRect(png, ox + 22, oy + 26 - bob, 20, 20, 190, 100, 25);
      }

      // Torso / Ancient Royal Armor
      const torsoY = oy + 24 - bob;
      fillRect(png, ox + 22, torsoY, 20, 18, 160, 40, 40); // crimson tunic
      fillRect(png, ox + 24, torsoY + 2, 16, 10, 190, 135, 55); // bronze chestplate
      // Royal Sun Emblem on chest
      fillCircle(png, ox + 32, torsoY + 7, 3, 245, 190, 50);

      // Belt
      fillRect(png, ox + 22, torsoY + 14, 20, 4, 110, 70, 30);
      fillRect(png, ox + 30, torsoY + 14, 4, 4, 230, 180, 50); // gold buckle

      // Arms & Bronze Arm Guards
      if (row === 5) {
        // Attack frame!
        const slashOffset = col * 6;
        fillRect(png, ox + 38, torsoY + 2, 10, 6, skinColor[0], skinColor[1], skinColor[2]);
        fillRect(png, ox + 42, torsoY + 2, 8, 6, 190, 130, 60); // bracer
        // Blade (ancient curved talwar)
        fillRect(png, ox + 44 + slashOffset, torsoY - 8 + col * 4, 14, 4, 220, 220, 230);
        fillRect(png, ox + 42 + slashOffset, torsoY - 6 + col * 4, 16, 3, 240, 200, 80);
        // Golden slash arc
        if (col >= 1) {
          fillCircle(png, ox + 48 + slashOffset, torsoY + 2, 8, 255, 215, 80, 140);
        }
      } else if (row === 6) {
        // Interact / reach
        fillRect(png, ox + 36, torsoY + 4, 12, 6, skinColor[0], skinColor[1], skinColor[2]);
        // magical glow
        fillCircle(png, ox + 46, torsoY + 6, 6, 255, 220, 100, 120);
      } else if (row === 8) {
        // Victory! Holding Crown high
        fillRect(png, ox + 20, torsoY - 8, 6, 14, skinColor[0], skinColor[1], skinColor[2]);
        fillRect(png, ox + 38, torsoY - 8, 6, 14, skinColor[0], skinColor[1], skinColor[2]);
        // Crown above head
        fillRect(png, ox + 26, oy + 4 - bob, 12, 6, 255, 215, 0);
        fillCircle(png, ox + 32, oy + 6 - bob, 4, 255, 140, 0);
      } else {
        // Normal arms
        fillRect(png, ox + 18, torsoY + 2, 5, 14, skinColor[0], skinColor[1], skinColor[2]);
        fillRect(png, ox + 17, torsoY + 8, 6, 6, 190, 130, 60); // bracer
        fillRect(png, ox + 41, torsoY + 2, 5, 14, skinColor[0], skinColor[1], skinColor[2]);
        fillRect(png, ox + 41, torsoY + 8, 6, 6, 190, 130, 60); // bracer
      }

      // Head
      const headY = oy + 12 - bob;
      fillRect(png, ox + 26, headY, 12, 13, skinColor[0], skinColor[1], skinColor[2]);

      // Face features
      if (row !== 2) { // not walking up
        // Eyes
        fillRect(png, ox + 28, headY + 5, 2, 2, 40, 25, 15);
        fillRect(png, ox + 34, headY + 5, 2, 2, 40, 25, 15);
        // Royal forehead tilak/bindu
        fillRect(png, ox + 31, headY + 3, 2, 3, 200, 40, 30);
      }

      // Hair (dark warrior locks)
      fillRect(png, ox + 25, headY - 3, 14, 5, 30, 20, 15);
      fillRect(png, ox + 24, headY - 1, 3, 8, 30, 20, 15);
      fillRect(png, ox + 37, headY - 1, 3, 8, 30, 20, 15);

      // Royal bronze circlet headband
      fillRect(png, ox + 25, headY + 1, 14, 2, 220, 170, 50);
      fillCircle(png, ox + 32, headY + 2, 1.5, 255, 215, 80);
    }
  }

  await savePng(png, 'public/assets/characters/player.png');
}

// -------------------------------------------------------------
// 2. GENERATE NPCS SPRITESHEET (6 Unique Ancient Characters)
// Each NPC is 48x48, 4 frames idle
// -------------------------------------------------------------
async function generateNpcSpriteSheet() {
  const FRAME_W = 48;
  const FRAME_H = 48;
  const NPCS = [
    { id: 'historian', robes: [140, 110, 80], scarf: [200, 170, 120], beard: true, item: 'scroll' },
    { id: 'merchant', robes: [60, 100, 120], scarf: [210, 140, 40], turban: true, item: 'pack' },
    { id: 'keeper', robes: [220, 110, 30], scarf: [240, 200, 60], tilak: true, item: 'staff' },
    { id: 'scholar', robes: [90, 50, 110], scarf: [210, 180, 80], stole: true, item: 'book' },
    { id: 'elder', robes: [170, 160, 150], scarf: [120, 100, 80], beard: true, hairWhite: true, item: 'cane' },
    { id: 'explorer', robes: [80, 70, 50], scarf: [160, 120, 70], hat: true, item: 'torch' },
  ];

  const png = new PNG({ width: FRAME_W * 4, height: FRAME_H * NPCS.length });
  // clear
  for (let i = 0; i < png.data.length; i += 4) png.data[i + 3] = 0;

  for (let nIdx = 0; nIdx < NPCS.length; nIdx++) {
    const npc = NPCS[nIdx];
    for (let frame = 0; frame < 4; frame++) {
      const ox = frame * FRAME_W;
      const oy = nIdx * FRAME_H;
      const breathe = frame === 1 || frame === 2 ? 1 : 0;

      // Shadow
      fillCircle(png, ox + 24, oy + 42, 10, 15, 10, 8, 90);

      // Robes / Body
      fillRect(png, ox + 16, oy + 20 - breathe, 16, 22 + breathe, npc.robes[0], npc.robes[1], npc.robes[2]);
      fillRect(png, ox + 18, oy + 22 - breathe, 12, 16, npc.scarf[0], npc.scarf[1], npc.scarf[2]);

      // Head
      const skin = [215, 165, 125];
      fillRect(png, ox + 20, oy + 10 - breathe, 9, 10, skin[0], skin[1], skin[2]);

      // Eyes
      fillRect(png, ox + 21, oy + 14 - breathe, 2, 2, 40, 30, 20);
      fillRect(png, ox + 26, oy + 14 - breathe, 2, 2, 40, 30, 20);

      if (npc.beard) {
        const bColor = npc.hairWhite ? [220, 220, 220] : [70, 60, 50];
        fillRect(png, ox + 20, oy + 17 - breathe, 9, 5, bColor[0], bColor[1], bColor[2]);
      }
      if (npc.turban) {
        fillRect(png, ox + 18, oy + 6 - breathe, 13, 6, npc.scarf[0], npc.scarf[1], npc.scarf[2]);
        fillCircle(png, ox + 24, oy + 7 - breathe, 2, 240, 200, 50);
      } else if (npc.hairWhite) {
        fillRect(png, ox + 19, oy + 8 - breathe, 11, 4, 215, 215, 215);
      } else {
        fillRect(png, ox + 19, oy + 8 - breathe, 11, 4, 40, 30, 25);
      }

      // Item in hand
      if (npc.item === 'staff') {
        fillRect(png, ox + 34, oy + 6, 2, 34, 180, 140, 60);
        fillCircle(png, ox + 35, oy + 6, 4, 255, 215, 80);
      } else if (npc.item === 'torch') {
        fillRect(png, ox + 33, oy + 16, 2, 16, 120, 70, 30);
        fillCircle(png, ox + 34, oy + 14, 4, 255, 140, 30);
      } else if (npc.item === 'scroll') {
        fillRect(png, ox + 32, oy + 24 - breathe, 5, 8, 235, 220, 180);
      } else if (npc.item === 'cane') {
        fillRect(png, ox + 33, oy + 20, 2, 22, 140, 100, 60);
      }
    }
  }

  await savePng(png, 'public/assets/characters/npcs.png');
}

// -------------------------------------------------------------
// 3. GENERATE ENEMY SPRITES (Shadow Guardian, Ruin Golem)
// -------------------------------------------------------------
async function generateEnemiesSpriteSheet() {
  const FRAME_W = 64;
  const FRAME_H = 64;
  const png = new PNG({ width: FRAME_W * 4, height: FRAME_H * 2 });
  for (let i = 0; i < png.data.length; i += 4) png.data[i + 3] = 0;

  // Row 0: Shadow Guardian (ancient cursed royal sentry)
  for (let f = 0; f < 4; f++) {
    const ox = f * FRAME_W;
    const oy = 0;
    const bob = f % 2 === 1 ? 2 : 0;

    fillCircle(png, ox + 32, oy + 54, 12, 10, 0, 20, 120);

    // Dark spectral aura
    fillCircle(png, ox + 32, oy + 32 - bob, 20, 45, 15, 60, 70);

    // Obsidian Armor
    fillRect(png, ox + 24, oy + 24 - bob, 16, 22, 30, 25, 40);
    // Horned helmet
    fillRect(png, ox + 26, oy + 12 - bob, 12, 14, 40, 35, 50);
    fillRect(png, ox + 22, oy + 8 - bob, 4, 8, 60, 40, 70);
    fillRect(png, ox + 38, oy + 8 - bob, 4, 8, 60, 40, 70);

    // Glowing Crimson Eyes
    fillRect(png, ox + 28, oy + 18 - bob, 2, 2, 255, 40, 50);
    fillRect(png, ox + 34, oy + 18 - bob, 2, 2, 255, 40, 50);

    // Dark cursed blade
    fillRect(png, ox + 42, oy + 18 - bob, 3, 26, 120, 50, 150);
  }

  // Row 1: Ruin Golem (living ancient sandstone construct)
  for (let f = 0; f < 4; f++) {
    const ox = f * FRAME_W;
    const oy = FRAME_H;
    const bob = f % 2 === 1 ? 2 : 0;

    fillCircle(png, ox + 32, oy + 56, 16, 20, 15, 10, 100);

    // Chunky stone body
    fillRect(png, ox + 20, oy + 22 - bob, 24, 24, 165, 140, 105);
    fillRect(png, ox + 18, oy + 28 - bob, 28, 14, 140, 115, 85);

    // Glowing carved ancient glyph core
    fillCircle(png, ox + 32, oy + 32 - bob, 5, 255, 180, 50);

    // Head block
    fillRect(png, ox + 25, oy + 12 - bob, 14, 12, 175, 150, 115);
    // Golden eye slit
    fillRect(png, ox + 28, oy + 17 - bob, 8, 2, 255, 215, 80);

    // Heavy stone fist
    fillRect(png, ox + 12, oy + 30 - bob, 8, 16, 140, 115, 85);
    fillRect(png, ox + 44, oy + 30 - bob, 8, 16, 140, 115, 85);
  }

  await savePng(png, 'public/assets/characters/enemies.png');
}

// -------------------------------------------------------------
// 4. GENERATE OBJECT ICONS (64x64 each)
// -------------------------------------------------------------
async function generateObjectIcons() {
  const ICONS: Record<string, (png: PNG) => void> = {
    royal_seal: (png) => {
      // Golden wax seal with carved sun and ribbon
      fillRect(png, 28, 40, 8, 18, 180, 30, 30);
      fillCircle(png, 32, 28, 20, 220, 160, 40);
      fillCircle(png, 32, 28, 16, 175, 30, 30);
      fillCircle(png, 32, 28, 9, 230, 180, 50);
      // Sun rays
      for (let angle = 0; angle < 8; angle++) {
        const rad = (angle * Math.PI) / 4;
        const rx = Math.round(32 + Math.cos(rad) * 12);
        const ry = Math.round(28 + Math.sin(rad) * 12);
        fillCircle(png, rx, ry, 2, 255, 215, 80);
      }
    },
    temple_key: (png) => {
      // Carved bronze ornate temple key
      fillCircle(png, 24, 24, 12, 210, 160, 60);
      fillCircle(png, 24, 24, 6, 0, 0, 0, 0); // hole
      fillRect(png, 32, 22, 22, 5, 210, 160, 60);
      fillRect(png, 46, 27, 4, 8, 210, 160, 60);
      fillRect(png, 51, 27, 3, 5, 210, 160, 60);
    },
    sun_stone: (png) => {
      // Glowing radiant sun gemstone
      fillCircle(png, 32, 32, 18, 255, 140, 30, 140);
      fillCircle(png, 32, 32, 12, 255, 200, 60);
      fillCircle(png, 30, 28, 5, 255, 255, 200);
      // Gem facets
      fillRect(png, 24, 24, 16, 2, 255, 230, 100);
      fillRect(png, 24, 38, 16, 2, 210, 110, 20);
    },
    ancient_scroll: (png) => {
      // Tied papyrus parchment scroll
      fillRect(png, 18, 16, 28, 32, 230, 210, 170);
      fillRect(png, 16, 14, 32, 4, 180, 150, 110);
      fillRect(png, 16, 46, 32, 4, 180, 150, 110);
      // Red seal ribbon
      fillRect(png, 28, 16, 8, 32, 180, 40, 40);
      fillCircle(png, 32, 32, 5, 220, 170, 50);
      // Ancient runes text lines
      fillRect(png, 20, 22, 7, 2, 90, 70, 50);
      fillRect(png, 37, 22, 7, 2, 90, 70, 50);
      fillRect(png, 20, 26, 6, 2, 90, 70, 50);
      fillRect(png, 37, 26, 7, 2, 90, 70, 50);
    },
    bronze_emblem: (png) => {
      // Heavy circular bronze kingdom crest
      fillCircle(png, 32, 32, 22, 160, 110, 50);
      fillCircle(png, 32, 32, 18, 190, 140, 70);
      fillCircle(png, 32, 32, 14, 140, 95, 40);
      // Vedic lion / sun cross
      fillRect(png, 24, 30, 16, 4, 230, 180, 80);
      fillRect(png, 30, 24, 4, 16, 230, 180, 80);
      fillCircle(png, 32, 32, 4, 255, 215, 100);
    },
    crystal_fragment: (png) => {
      // Glowing cyan crystal cluster
      fillCircle(png, 32, 32, 20, 40, 220, 230, 80);
      fillRect(png, 28, 14, 8, 36, 100, 235, 245);
      fillRect(png, 20, 24, 10, 22, 60, 200, 220);
      fillRect(png, 34, 26, 10, 20, 70, 210, 230);
      fillCircle(png, 31, 22, 3, 255, 255, 255);
    },
    ancient_coins: (png) => {
      // Golden dinars with Suryagarh insignia
      fillCircle(png, 26, 38, 12, 190, 140, 30);
      fillCircle(png, 26, 38, 9, 240, 185, 50);
      fillCircle(png, 38, 34, 12, 210, 155, 35);
      fillCircle(png, 38, 34, 9, 250, 195, 55);
      fillCircle(png, 32, 22, 12, 220, 165, 40);
      fillCircle(png, 32, 22, 9, 255, 215, 70);
    },
    torch: (png) => {
      // Flaming ancient wall torch
      fillRect(png, 30, 28, 4, 26, 110, 65, 30); // handle
      fillRect(png, 27, 24, 10, 6, 80, 80, 85); // iron sconce
      fillCircle(png, 32, 18, 12, 255, 120, 20, 160); // fire aura
      fillCircle(png, 32, 16, 7, 255, 200, 40); // core
      fillCircle(png, 32, 14, 3, 255, 255, 180);
    },
    chest: (png) => {
      // Carved royal treasury chest
      fillRect(png, 12, 22, 40, 26, 125, 75, 40); // wood
      fillRect(png, 10, 20, 44, 8, 150, 95, 50); // lid
      // Gold trim
      fillRect(png, 12, 22, 6, 26, 215, 165, 50);
      fillRect(png, 46, 22, 6, 26, 215, 165, 50);
      fillRect(png, 28, 26, 8, 10, 230, 180, 60); // lock
      fillCircle(png, 32, 31, 2, 60, 40, 20); // keyhole
    }
  };

  for (const [name, drawFn] of Object.entries(ICONS)) {
    const png = new PNG({ width: 64, height: 64 });
    for (let i = 0; i < png.data.length; i += 4) png.data[i + 3] = 0;
    drawFn(png);
    await savePng(png, `public/assets/objects/${name}.png`);
  }
}

// -------------------------------------------------------------
// 5. GENERATE KENNEY-STYLE UI ELEMENTS
// Buttons, Parchment Panels, Joy Controls, Icons
// -------------------------------------------------------------
async function generateUiElements() {
  // 1. Parchment Panel (256x256 9-sliceable / bordered)
  const panel = new PNG({ width: 256, height: 256 });
  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 256; x++) {
      // Border: bronze/gold ancient filigree
      const isBorder = x < 8 || x >= 248 || y < 8 || y >= 248;
      const isInnerBorder = (x >= 12 && x < 14) || (x >= 242 && x < 244) || (y >= 12 && y < 14) || (y >= 242 && y < 244);
      if (isBorder) {
        setPixel(panel, x, y, 160, 120, 60, 255);
      } else if (isInnerBorder) {
        setPixel(panel, x, y, 200, 160, 80, 220);
      } else {
        // Parchment interior with gentle gradient/texture
        const grain = ((x * 13 + y * 29) % 7) - 3;
        setPixel(panel, x, y, 28 + grain, 22 + grain, 17 + grain, 240);
      }
    }
  }
  // Corner ornaments
  fillCircle(panel, 8, 8, 6, 230, 180, 60);
  fillCircle(panel, 248, 8, 6, 230, 180, 60);
  fillCircle(panel, 8, 248, 6, 230, 180, 60);
  fillCircle(panel, 248, 248, 6, 230, 180, 60);
  await savePng(panel, 'public/assets/ui/parchment_box.png');

  // 2. Button (192 x 48)
  const btn = new PNG({ width: 192, height: 48 });
  for (let y = 0; y < 48; y++) {
    for (let x = 0; x < 192; x++) {
      const isEdge = x < 3 || x >= 189 || y < 3 || y >= 45;
      if (isEdge) {
        setPixel(btn, x, y, 210, 160, 60, 255);
      } else {
        // gradient
        const t = y / 48;
        const r = Math.round(110 * (1 - t) + 60 * t);
        const g = Math.round(80 * (1 - t) + 40 * t);
        const b = Math.round(40 * (1 - t) + 20 * t);
        setPixel(btn, x, y, r, g, b, 245);
      }
    }
  }
  await savePng(btn, 'public/assets/ui/button.png');

  // 3. Virtual Joystick (Base 128x128, Knob 64x64)
  const joyBase = new PNG({ width: 128, height: 128 });
  for (let i = 0; i < joyBase.data.length; i += 4) joyBase.data[i + 3] = 0;
  fillCircle(joyBase, 64, 64, 58, 200, 160, 80, 60);
  fillCircle(joyBase, 64, 64, 54, 30, 25, 20, 140);
  await savePng(joyBase, 'public/assets/ui/joy_base.png');

  const joyKnob = new PNG({ width: 64, height: 64 });
  for (let i = 0; i < joyKnob.data.length; i += 4) joyKnob.data[i + 3] = 0;
  fillCircle(joyKnob, 32, 32, 28, 230, 180, 70, 180);
  fillCircle(joyKnob, 32, 32, 22, 170, 120, 50, 220);
  fillCircle(joyKnob, 32, 32, 8, 255, 220, 100, 240);
  await savePng(joyKnob, 'public/assets/ui/joy_knob.png');
}

// -------------------------------------------------------------
// 6. GENERATE AUDIO FILES (Pure synthesized WAV PCM)
// -------------------------------------------------------------
function createWavBuffer(samples: Float32Array, sampleRate = 22050): Buffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const subChunk2Size = samples.length * (bitsPerSample / 8);
  const chunkSize = 36 + subChunk2Size;

  const buffer = Buffer.alloc(44 + subChunk2Size);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(chunkSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk1 size
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(subChunk2Size, 40);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const val = s < 0 ? s * 32768 : s * 32767;
    buffer.writeInt16LE(Math.round(val), offset);
    offset += 2;
  }

  return buffer;
}

function generateAudioFiles() {
  const SR = 22050;

  // 1. Footstep (0.12s low frequency scuff)
  const stepLen = Math.floor(SR * 0.12);
  const stepSamples = new Float32Array(stepLen);
  for (let i = 0; i < stepLen; i++) {
    const t = i / SR;
    const env = Math.exp(-t * 35);
    const noise = (Math.random() * 2 - 1) * 0.4;
    const tone = Math.sin(2 * Math.PI * 120 * t);
    stepSamples[i] = (tone * 0.6 + noise) * env * 0.5;
  }
  fs.writeFileSync('public/assets/audio/footstep.wav', createWavBuffer(stepSamples, SR));

  // 2. Pickup chime (0.45s rising pentatonic arpeggio)
  const pickupLen = Math.floor(SR * 0.45);
  const pickupSamples = new Float32Array(pickupLen);
  const freqs = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
  for (let i = 0; i < pickupLen; i++) {
    const t = i / SR;
    let s = 0;
    freqs.forEach((f, idx) => {
      const noteStart = idx * 0.08;
      if (t >= noteStart) {
        const noteT = t - noteStart;
        const env = Math.exp(-noteT * 9);
        s += Math.sin(2 * Math.PI * f * noteT) * env * 0.25;
        // add sparkle octave
        s += Math.sin(2 * Math.PI * f * 2 * noteT) * env * 0.1;
      }
    });
    pickupSamples[i] = s;
  }
  fs.writeFileSync('public/assets/audio/pickup.wav', createWavBuffer(pickupSamples, SR));

  // 3. Attack sword swing (0.22s whoosh)
  const swingLen = Math.floor(SR * 0.22);
  const swingSamples = new Float32Array(swingLen);
  for (let i = 0; i < swingLen; i++) {
    const t = i / SR;
    const env = Math.sin((Math.PI * i) / swingLen);
    const noise = Math.random() * 2 - 1;
    const pitch = 300 + Math.sin(t * 20) * 150;
    const sine = Math.sin(2 * Math.PI * pitch * t);
    swingSamples[i] = (noise * 0.7 + sine * 0.3) * env * 0.45;
  }
  fs.writeFileSync('public/assets/audio/attack.wav', createWavBuffer(swingSamples, SR));

  // 4. Hit impact (0.2s heavy strike)
  const hitLen = Math.floor(SR * 0.2);
  const hitSamples = new Float32Array(hitLen);
  for (let i = 0; i < hitLen; i++) {
    const t = i / SR;
    const env = Math.exp(-t * 22);
    const low = Math.sin(2 * Math.PI * (160 - t * 400) * t);
    const noise = (Math.random() * 2 - 1) * 0.5;
    hitSamples[i] = (low * 0.7 + noise * 0.3) * env * 0.6;
  }
  fs.writeFileSync('public/assets/audio/hit.wav', createWavBuffer(hitSamples, SR));

  // 5. Puzzle solved (1.2s grand mystical temple chime chord)
  const puzLen = Math.floor(SR * 1.4);
  const puzSamples = new Float32Array(puzLen);
  const chord = [440, 554.37, 659.25, 880, 1108.73, 1318.51]; // A major ancient chord
  for (let i = 0; i < puzLen; i++) {
    const t = i / SR;
    let s = 0;
    chord.forEach((f, idx) => {
      const delay = idx * 0.07;
      if (t >= delay) {
        const noteT = t - delay;
        const env = Math.exp(-noteT * 3.5);
        s += Math.sin(2 * Math.PI * f * noteT) * env * 0.16;
        s += Math.sin(2 * Math.PI * f * 3 * noteT) * env * 0.05; // harmonic
      }
    });
    puzSamples[i] = s;
  }
  fs.writeFileSync('public/assets/audio/puzzle_solved.wav', createWavBuffer(puzSamples, SR));

  // 6. Stone door opening (0.9s deep grinding rumble)
  const doorLen = Math.floor(SR * 0.9);
  const doorSamples = new Float32Array(doorLen);
  for (let i = 0; i < doorLen; i++) {
    const t = i / SR;
    const env = Math.sin((Math.PI * i) / doorLen);
    const rumble = Math.sin(2 * Math.PI * 65 * t) * 0.5;
    const scrape = (Math.random() * 2 - 1) * 0.4;
    doorSamples[i] = (rumble + scrape) * env * 0.55;
  }
  fs.writeFileSync('public/assets/audio/door.wav', createWavBuffer(doorSamples, SR));

  // 7. Ambient wind/temple drone loop (3.0s seamless mystical drone)
  const ambLen = Math.floor(SR * 3.0);
  const ambSamples = new Float32Array(ambLen);
  for (let i = 0; i < ambLen; i++) {
    const t = i / SR;
    // Harmonic drone at 110Hz (A2) + 165Hz (E3) + 220Hz (A3)
    const d1 = Math.sin(2 * Math.PI * 110 * t) * 0.18;
    const d2 = Math.sin(2 * Math.PI * 165 * t) * 0.12;
    const d3 = Math.sin(2 * Math.PI * 220 * t + Math.sin(t * 2)) * 0.08;
    const wind = (Math.random() * 2 - 1) * 0.04 * (1 + 0.3 * Math.sin(t * 1.5));
    ambSamples[i] = d1 + d2 + d3 + wind;
  }
  fs.writeFileSync('public/assets/audio/ambient.wav', createWavBuffer(ambSamples, SR));
}

// -------------------------------------------------------------
// EXECUTE GENERATION
// -------------------------------------------------------------
async function run() {
  console.log('Generating player spritesheet...');
  await generatePlayerSpriteSheet();
  console.log('Generating NPC spritesheet...');
  await generateNpcSpriteSheet();
  console.log('Generating enemy sprites...');
  await generateEnemiesSpriteSheet();
  console.log('Generating object icons...');
  await generateObjectIcons();
  console.log('Generating UI elements...');
  await generateUiElements();
  console.log('Generating audio WAV files...');
  generateAudioFiles();
  console.log('All game assets generated successfully!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
