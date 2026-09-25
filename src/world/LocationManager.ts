import { Vector3, Scene } from '@babylonjs/core';
import { WorldManager } from './WorldManager';
import { Player } from '../player/Player';
import { AncientLocation3DConfig, getLocationConfig3D } from '../data/locations';
import { InteractionSystem } from '../gameplay/InteractionSystem';
import { QuestSystem } from '../gameplay/QuestSystem';
import { InventorySystem } from '../gameplay/InventorySystem';
import { playSound } from '../utils/helpers';
import { AUDIO_PATHS } from '../utils/constants';

export class LocationManager {
  private currentLocationId = 'kingdom_gate';
  public currentConfig!: AncientLocation3DConfig;
  public discoveredLocations: Set<string> = new Set(['kingdom_gate']);
  public isTransitioning = false;

  constructor(
    public scene: Scene,
    public worldManager: WorldManager,
    public player: Player,
    public interactionSystem: InteractionSystem,
    public questSystem: QuestSystem,
    public inventorySystem: InventorySystem,
    public onLocationChanged?: (config: AncientLocation3DConfig) => void,
    public onFeedback?: (msg: string) => void
  ) {
    this.currentConfig = getLocationConfig3D(this.currentLocationId);
  }

  public async changeLocation(
    targetLocationId: string,
    spawnPos?: Vector3,
    spawnRotationY?: number
  ): Promise<void> {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    playSound(AUDIO_PATHS.DOOR, 0.6);

    // Fade out overlay will be handled by UI
    const targetConfig = getLocationConfig3D(targetLocationId);
    this.currentLocationId = targetLocationId;
    this.currentConfig = targetConfig;
    this.discoveredLocations.add(targetLocationId);

    // Clear previous location interactables and structures
    this.interactionSystem.clear();
    this.worldManager.clear();

    // Load new location
    this.worldManager.loadLocation(targetLocationId, (puzzleId) => {
      this.handlePuzzleSolved(puzzleId);
    });

    // Position player
    const targetPos = spawnPos || targetConfig.spawnPosition;
    this.player.root.position.copyFrom(targetPos);
    this.player.root.rotation.y = spawnRotationY !== undefined ? spawnRotationY : targetConfig.spawnRotationY;

    // Register physical connection portal triggers
    this.setupConnectionTriggers();

    if (this.onLocationChanged) {
      this.onLocationChanged(targetConfig);
    }

    setTimeout(() => {
      this.isTransitioning = false;
    }, 600);
  }

  public setupConnectionTriggers(): void {
    const loc = this.currentConfig;

    loc.connectedLocations.forEach(conn => {
      this.interactionSystem.register({
        id: `portal_${conn.targetId}`,
        interactionText: conn.label,
        position: conn.triggerPosition,
        radius: conn.triggerRadius,
        interact: () => {
          // Gate check: Gate requires puzzle 1 solved
          if (loc.id === 'kingdom_gate' && conn.targetId === 'royal_market') {
            const gateSolved = this.questSystem.isObjectiveCompleted('quest_1_broken_gate', 'activate_gate_mechanism');
            if (!gateSolved) {
              playSound(AUDIO_PATHS.HIT, 0.4);
              if (this.onFeedback) {
                this.onFeedback('The Great Gate is sealed! Align the three Solar Wheel Levers first.');
              }
              return;
            }
          }

          // Palace check: requires Temple Key or Royal Seal
          if (conn.targetId === 'royal_palace') {
            if (!this.inventorySystem.hasItem('temple_key') && !this.inventorySystem.hasItem('royal_seal')) {
              playSound(AUDIO_PATHS.HIT, 0.4);
              if (this.onFeedback) {
                this.onFeedback('The Royal Palace is sealed. Acquire the Temple Key or Royal Seal first.');
              }
              return;
            }
          }

          // Sun Temple check: requires Royal Seal
          if (conn.targetId === 'sun_temple') {
            if (!this.inventorySystem.hasItem('royal_seal')) {
              playSound(AUDIO_PATHS.HIT, 0.4);
              if (this.onFeedback) {
                this.onFeedback('The Sun Temple requires the Royal Seal of King Harsha to unseal!');
              }
              return;
            }
          }

          this.changeLocation(conn.targetId, conn.targetSpawnPosition, conn.targetSpawnRotationY);
        }
      });
    });
  }

  public handlePuzzleSolved(puzzleId: string): void {
    if (puzzleId === 'gate_levers') {
      this.questSystem.completeObjective('quest_1_broken_gate', 'activate_gate_mechanism');
    } else if (puzzleId === 'inscription_1') {
      this.questSystem.completeObjective('quest_2_whispers_temple', 'read_pillar_1');
    } else if (puzzleId === 'inscription_2') {
      this.questSystem.completeObjective('quest_2_whispers_temple', 'read_pillar_2');
    } else if (puzzleId === 'inscription_3') {
      this.questSystem.completeObjective('quest_2_whispers_temple', 'read_pillar_3');
    } else if (puzzleId === 'cave_crystals') {
      this.questSystem.completeObjective('quest_4_royal_seal', 'open_royal_chest');
      // Spawn Royal Seal in front of player
      this.inventorySystem.spawnWorldPickup(this.scene, 'royal_seal', new Vector3(0, 0, 18));
    } else if (puzzleId === 'celestial_dials') {
      this.questSystem.completeObjective('quest_6_solar_crown', 'solve_celestial_dials');
      // Spawn descending Solar Crown right on the central altar!
      this.inventorySystem.spawnWorldPickup(this.scene, 'solar_crown', new Vector3(0, 1.6, 0));
    }
  }

  public getLocation(): string {
    return this.currentLocationId;
  }
}
