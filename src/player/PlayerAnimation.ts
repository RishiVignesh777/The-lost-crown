import { TransformNode, Vector3 } from '@babylonjs/core';

export type PlayerAnimState = 'idle' | 'walk' | 'run' | 'jump' | 'attack' | 'interact' | 'hurt' | 'victory';

export interface PlayerRigs {
  root: TransformNode;
  torso: TransformNode;
  head: TransformNode;
  cloak: TransformNode;
  armL: TransformNode;
  armR: TransformNode;
  weapon: TransformNode;
  legL: TransformNode;
  legR: TransformNode;
}

export class PlayerAnimation {
  public currentState: PlayerAnimState = 'idle';
  private animTime = 0;
  private rigs: PlayerRigs;
  private actionTimer = 0;
  private onActionComplete?: () => void;

  constructor(rigs: PlayerRigs) {
    this.rigs = rigs;
  }

  public setState(state: PlayerAnimState, duration = 0, onComplete?: () => void): void {
    if (this.currentState === 'victory') return; // Victory is persistent until game end
    if (this.currentState === state && !onComplete) return;

    this.currentState = state;
    this.animTime = 0;
    this.actionTimer = duration;
    this.onActionComplete = onComplete;
  }

  public update(deltaTime: number): void {
    this.animTime += deltaTime;

    if (this.actionTimer > 0) {
      this.actionTimer -= deltaTime;
      if (this.actionTimer <= 0) {
        const cb = this.onActionComplete;
        this.onActionComplete = undefined;
        this.currentState = 'idle';
        if (cb) cb();
      }
    }

    const t = this.animTime;
    const { torso, head, cloak, armL, armR, weapon, legL, legR } = this.rigs;

    switch (this.currentState) {
      case 'idle': {
        const breath = Math.sin(t * 2.5) * 0.04;
        torso.position.y = 1.1 + breath;
        torso.rotation.x = 0;
        head.rotation.x = breath * 0.5;

        // Gentle arm resting
        armL.rotation.x = Math.sin(t * 2.5) * 0.06;
        armR.rotation.x = -Math.sin(t * 2.5) * 0.06;
        armL.rotation.z = 0.15;
        armR.rotation.z = -0.15;

        weapon.rotation.x = 0.2;
        weapon.rotation.z = 0;

        legL.rotation.x = 0;
        legR.rotation.x = 0;

        // Cloak sway
        cloak.rotation.x = 0.1 + Math.sin(t * 3.0) * 0.06;
        cloak.rotation.z = Math.cos(t * 2.0) * 0.04;
        break;
      }

      case 'walk': {
        const strideSpeed = 9.0;
        const bob = Math.abs(Math.sin(t * strideSpeed)) * 0.08;
        torso.position.y = 1.1 + bob;
        torso.rotation.x = 0.05;

        const cycle = Math.sin(t * strideSpeed);
        legL.rotation.x = cycle * 0.65;
        legR.rotation.x = -cycle * 0.65;

        armL.rotation.x = -cycle * 0.55;
        armR.rotation.x = cycle * 0.55;
        armL.rotation.z = 0.15;
        armR.rotation.z = -0.15;

        cloak.rotation.x = 0.35 + Math.sin(t * strideSpeed) * 0.15;
        break;
      }

      case 'run': {
        const strideSpeed = 14.0;
        const bob = Math.abs(Math.sin(t * strideSpeed)) * 0.14;
        torso.position.y = 1.1 + bob;
        torso.rotation.x = 0.2; // lean forward into sprint

        const cycle = Math.sin(t * strideSpeed);
        legL.rotation.x = cycle * 0.95;
        legR.rotation.x = -cycle * 0.95;

        armL.rotation.x = -cycle * 0.85;
        armR.rotation.x = cycle * 0.85;

        cloak.rotation.x = 0.65 + Math.sin(t * strideSpeed) * 0.2;
        break;
      }

      case 'jump': {
        torso.position.y = 1.25;
        torso.rotation.x = -0.1;
        legL.rotation.x = 0.5;
        legR.rotation.x = -0.3;
        armL.rotation.x = -1.2;
        armR.rotation.x = -1.2;
        cloak.rotation.x = -0.3;
        break;
      }

      case 'attack': {
        // High talwar slash
        const progress = Math.min(1, t / 0.4);
        torso.rotation.y = (progress - 0.5) * 1.5;
        armR.rotation.x = -1.8 + progress * 2.6;
        armR.rotation.z = -0.4 + progress * 0.8;
        weapon.rotation.x = progress * 1.2;
        cloak.rotation.x = 0.4;
        break;
      }

      case 'interact': {
        // Reaching hand out with ancient guardian reverence
        armR.rotation.x = -1.4;
        armR.rotation.z = -0.2;
        torso.rotation.x = 0.08;
        break;
      }

      case 'hurt': {
        // Recoil
        torso.rotation.x = -0.35;
        head.rotation.x = -0.4;
        armL.rotation.x = -0.8;
        armR.rotation.x = -0.8;
        break;
      }

      case 'victory': {
        // Hold Crown high above head with both arms
        const breath = Math.sin(t * 3.0) * 0.05;
        torso.position.y = 1.15 + breath;
        armL.rotation.x = -2.8;
        armR.rotation.x = -2.8;
        armL.rotation.z = 0.25;
        armR.rotation.z = -0.25;
        head.rotation.x = -0.4; // Look up to the heavens
        cloak.rotation.x = 0.35 + Math.sin(t * 4.0) * 0.1;
        break;
      }
    }
  }
}
