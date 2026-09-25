import { Scene, Vector3, Sound, DynamicTexture, StandardMaterial, Color3, PBRMaterial } from '@babylonjs/core';

// Cache sounds for low latency
const soundCache: Map<string, HTMLAudioElement> = new Map();

export function playSound(path: string, volume = 0.5): void {
  try {
    let audio = soundCache.get(path);
    if (!audio) {
      audio = new Audio(path);
      soundCache.set(path, audio);
    }
    audio.currentTime = 0;
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.play().catch(() => {
      // Audio autoplay restrictions might catch here until user interacts
    });
  } catch (err) {
    console.debug('Audio play prevented:', err);
  }
}

let ambientAudio: HTMLAudioElement | null = null;

export function startAmbientLoop(path: string, volume = 0.3): void {
  if (ambientAudio) {
    ambientAudio.pause();
  }
  try {
    ambientAudio = new Audio(path);
    ambientAudio.loop = true;
    ambientAudio.volume = volume;
    ambientAudio.play().catch(() => {});
  } catch (err) {
    console.debug('Ambient audio prevented:', err);
  }
}

export function stopAmbientLoop(): void {
  if (ambientAudio) {
    ambientAudio.pause();
    ambientAudio = null;
  }
}

export function getDistance2D(p1: Vector3, p2: Vector3): number {
  const dx = p1.x - p2.x;
  const dz = p1.z - p2.z;
  return Math.sqrt(dx * dx + dz * dz);
}

export function createProceduralSandstoneTexture(scene: Scene, baseColor = '#c49a62', grainColor = '#8e6c3d'): DynamicTexture {
  const size = 512;
  const texture = new DynamicTexture(`sandstone_${baseColor}`, { width: size, height: size }, scene, true);
  const ctx = texture.getContext();

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  // Add sandstone weathered grain
  ctx.fillStyle = grainColor;
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const w = 1 + Math.random() * 4;
    const h = 1 + Math.random() * 3;
    ctx.globalAlpha = 0.15 + Math.random() * 0.2;
    ctx.fillRect(x, y, w, h);
  }

  // Stone brick grooves
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = '#3a2717';
  ctx.lineWidth = 2;
  const brickH = 64;
  for (let y = 0; y <= size; y += brickH) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();

    const row = Math.floor(y / brickH);
    const shift = (row % 2) * 64;
    for (let x = shift; x <= size; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + brickH);
      ctx.stroke();
    }
  }

  ctx.globalAlpha = 1.0;
  texture.update();
  return texture;
}

export function createCarvedRuneTexture(scene: Scene, runeColor = '#ffd700'): DynamicTexture {
  const size = 512;
  const texture = new DynamicTexture('carved_runes', { width: size, height: size }, scene, true);
  const ctx = texture.getContext();

  ctx.fillStyle = '#221a12';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = runeColor;
  ctx.lineWidth = 4;
  ctx.shadowColor = runeColor;
  ctx.shadowBlur = 12;

  // Draw ancient Vedic / Solar radial glyphs
  const cx = size / 2;
  const cy = size / 2;

  ctx.beginPath();
  ctx.arc(cx, cy, 180, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, 120, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, 60, 0, Math.PI * 2);
  ctx.stroke();

  // 12 solar rays
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * 70, cy + Math.sin(angle) * 70);
    ctx.lineTo(cx + Math.cos(angle) * 170, cy + Math.sin(angle) * 170);
    ctx.stroke();
  }

  texture.update();
  return texture;
}
