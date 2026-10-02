import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { KingdomScene } from './scenes/KingdomScene';

async function bootstrap() {
  await BootScene.init();

  const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
  if (!canvas) {
    throw new Error('Canvas #renderCanvas not found in DOM.');
  }

  // Immediately initialize the 3D Kingdom Engine so the 3D game appears on screen right away
  const kingdomScene = new KingdomScene(canvas);

  // Display the 3D start & controls banner directly over the live 3D world
  new MenuScene((isNewGame) => {
    kingdomScene.musicSystem.initAudio();
    if (isNewGame) {
      kingdomScene.resetToStart();
    }
  });
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', () => {
    bootstrap().catch(err => {
      console.error('Fatal initialization error in Suryagarh 3D:', err);
    });
  });
} else {
  bootstrap().catch(err => {
    console.error('Fatal initialization error in Suryagarh 3D:', err);
  });
}
