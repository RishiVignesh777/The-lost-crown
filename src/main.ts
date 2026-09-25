import { BootScene } from './scenes/BootScene';
import { LoadingScene } from './scenes/LoadingScene';
import { MenuScene } from './scenes/MenuScene';
import { KingdomScene } from './scenes/KingdomScene';
import { SaveSystem } from './gameplay/SaveSystem';

async function bootstrap() {
  await BootScene.init();

  const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
  if (!canvas) {
    throw new Error('Canvas #renderCanvas not found in DOM.');
  }

  // Show loading screen while initializing engine
  const loading = new LoadingScene();
  loading.setProgress(30, 'Awakening the 3D Kingdom...');

  setTimeout(async () => {
    loading.setProgress(70, 'Loading ancient relics and architecture...');

    setTimeout(async () => {
      await loading.finish();

      // Launch Menu Scene
      new MenuScene((isNewGame) => {
        if (isNewGame) {
          SaveSystem.clearSave();
        }
        new KingdomScene(canvas);
      });
    }, 400);
  }, 400);
}

window.addEventListener('DOMContentLoaded', () => {
  bootstrap().catch(err => {
    console.error('Fatal initialization error in Suryagarh 3D:', err);
  });
});
