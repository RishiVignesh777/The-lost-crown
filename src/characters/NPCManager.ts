import { Scene, Vector3 } from '@babylonjs/core';
import { NPC } from './NPC';
import { NPCS_DATA_3D, NPCConfig3D } from '../data/npcs';

export class NPCManager {
  private npcs: Map<string, NPC> = new Map();

  constructor(public scene: Scene) {}

  public spawnNPCsForLocation(locationId: string): void {
    this.clear();
    const configs = NPCS_DATA_3D.filter(n => n.locationId === locationId);
    configs.forEach(cfg => {
      const npc = new NPC(this.scene, cfg);
      this.npcs.set(cfg.id, npc);
    });
  }

  public getNPCs(): NPC[] {
    return Array.from(this.npcs.values());
  }

  public getClosestNPC(playerPos: Vector3, maxRadius = 4.0): NPC | null {
    let closest: NPC | null = null;
    let closestDist = maxRadius;

    this.npcs.forEach(npc => {
      const dist = Vector3.Distance(playerPos, npc.root.position);
      if (dist < closestDist) {
        closestDist = dist;
        closest = npc;
      }
    });

    return closest;
  }

  public update(deltaTime: number): void {
    this.npcs.forEach(npc => npc.update(deltaTime));
  }

  public clear(): void {
    this.npcs.forEach(npc => npc.dispose());
    this.npcs.clear();
  }
}
