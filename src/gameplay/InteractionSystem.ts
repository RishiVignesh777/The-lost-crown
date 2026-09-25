import { Vector3 } from '@babylonjs/core';

export interface Interactable {
  id: string;
  interactionText: string;
  position: Vector3;
  radius?: number;
  interact(): void;
}

export class InteractionSystem {
  private interactables: Map<string, Interactable> = new Map();
  public activePrompt: string | null = null;
  public currentTarget: Interactable | null = null;

  public register(interactable: Interactable): void {
    this.interactables.set(interactable.id, interactable);
  }

  public unregister(id: string): void {
    this.interactables.delete(id);
  }

  public clear(): void {
    this.interactables.clear();
    this.activePrompt = null;
    this.currentTarget = null;
  }

  public update(playerPos: Vector3): void {
    let closest: Interactable | null = null;
    let closestDist = 3.8;

    this.interactables.forEach(item => {
      const dist = Vector3.Distance(playerPos, item.position);
      const threshold = item.radius || 3.8;
      if (dist <= threshold && dist < closestDist) {
        closestDist = dist;
        closest = item;
      }
    });

    this.currentTarget = closest;
    if (closest) {
      this.activePrompt = `[E] ${(closest as Interactable).interactionText}`;
    } else {
      this.activePrompt = null;
    }
  }

  public triggerInteract(): boolean {
    if (this.currentTarget) {
      this.currentTarget.interact();
      return true;
    }
    return false;
  }
}
