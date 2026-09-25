import { Scene, Vector3 } from '@babylonjs/core';
import { TerrainSystem } from './TerrainSystem';
import { BuildingSystem } from './BuildingSystem';
import { EnvironmentSystem } from './EnvironmentSystem';
import { getLocationConfig3D, AncientLocation3DConfig } from '../data/locations';
import { InteractionSystem } from '../gameplay/InteractionSystem';
import { PuzzleSystem } from '../gameplay/PuzzleSystem';
import { InventorySystem } from '../gameplay/InventorySystem';
import { NPCManager } from '../characters/NPCManager';
import { EnemyManager } from '../characters/EnemyManager';
import { Player } from '../player/Player';

export class WorldManager {
  public terrainSystem: TerrainSystem;
  public buildingSystem: BuildingSystem;
  public environmentSystem: EnvironmentSystem;
  public puzzleSystem: PuzzleSystem;
  public npcManager: NPCManager;
  public enemyManager: EnemyManager;

  constructor(
    public scene: Scene,
    public interactionSystem: InteractionSystem,
    public inventorySystem: InventorySystem,
    onEnemyKilled?: (enemy: any) => void
  ) {
    this.terrainSystem = new TerrainSystem(scene);
    this.buildingSystem = new BuildingSystem(scene);
    this.environmentSystem = new EnvironmentSystem(scene);
    this.puzzleSystem = new PuzzleSystem(scene);
    this.npcManager = new NPCManager(scene);
    this.enemyManager = new EnemyManager(scene, inventorySystem, onEnemyKilled);
  }

  public loadLocation(
    locationId: string,
    onPuzzleSolved: (puzzleId: string) => void
  ): AncientLocation3DConfig {
    const config = getLocationConfig3D(locationId);

    // 1. Setup Environment & Lighting
    this.environmentSystem.applyLocationEnvironment(config);

    // 2. Build 3D Terrain
    this.terrainSystem.buildTerrain(locationId, config.worldRadius);

    // 3. Build 3D Architecture & Structures
    this.buildingSystem.buildStructures(locationId);

    // 4. Spawn NPCs
    this.npcManager.spawnNPCsForLocation(locationId);

    // 5. Spawn 3D Enemies
    this.enemyManager.spawnEnemiesForLocation(locationId);

    // 6. Setup Interactive Puzzles
    this.puzzleSystem.setupPuzzlesForLocation(locationId, this.interactionSystem, onPuzzleSolved);

    // 7. Spawn World Pickups for this location
    this.spawnLocationPickups(locationId);

    return config;
  }

  private spawnLocationPickups(locationId: string): void {
    this.inventorySystem.clearWorldPickups();

    if (locationId === 'royal_market') {
      this.inventorySystem.spawnWorldPickup(this.scene, 'ancient_coins', new Vector3(-6, 0, 10));
    } else if (locationId === 'temple_district') {
      this.inventorySystem.spawnWorldPickup(this.scene, 'ancient_coins', new Vector3(8, 0, -12));
    } else if (locationId === 'sacred_forest') {
      this.inventorySystem.spawnWorldPickup(this.scene, 'ancient_coins', new Vector3(-12, 0, 18));
    } else if (locationId === 'ancient_cave') {
      this.inventorySystem.spawnWorldPickup(this.scene, 'crystal_fragment', new Vector3(0, 0, -15));
    } else if (locationId === 'royal_palace') {
      this.inventorySystem.spawnWorldPickup(this.scene, 'sun_stone', new Vector3(0, 1.2, 40));
    }
  }

  public update(deltaTime: number, player: Player): void {
    this.npcManager.update(deltaTime);
    this.enemyManager.update(deltaTime, player);
    this.inventorySystem.updateWorldPickups(deltaTime);
  }

  public clear(): void {
    this.terrainSystem.clear();
    this.buildingSystem.clear();
    this.puzzleSystem.clear();
    this.npcManager.clear();
    this.enemyManager.clear();
    this.inventorySystem.clearWorldPickups();
  }
}
