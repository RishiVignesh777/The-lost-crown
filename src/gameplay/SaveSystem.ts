import { STORAGE_SAVE_KEY } from '../utils/constants';
import { InventoryItem } from '../data/items';
import { Quest } from '../data/quests';

export interface SaveData3D {
  location: string;
  playerPosition: {
    x: number;
    y: number;
    z: number;
  };
  playerRotation: number;
  health: number;
  maxHealth: number;
  inventory: InventoryItem[];
  quests: Quest[];
  solvedPuzzles: string[];
  discoveredLocations: string[];
  solarCrownClaimed: boolean;
  lastSavedAt: number;
}

export class SaveSystem {
  public static saveGame(data: SaveData3D): boolean {
    try {
      localStorage.setItem(STORAGE_SAVE_KEY, JSON.stringify(data));
      return true;
    } catch (err) {
      console.error('Failed to save 3D game state:', err);
      return false;
    }
  }

  public static loadGame(): SaveData3D | null {
    try {
      const raw = localStorage.getItem(STORAGE_SAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as SaveData3D;
    } catch (err) {
      console.error('Failed to load 3D game state:', err);
      return null;
    }
  }

  public static hasSave(): boolean {
    return !!localStorage.getItem(STORAGE_SAVE_KEY);
  }

  public static clearSave(): void {
    localStorage.removeItem(STORAGE_SAVE_KEY);
  }
}
