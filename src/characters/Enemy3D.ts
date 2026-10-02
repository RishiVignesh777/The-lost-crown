import {
  Scene,
  TransformNode,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  AbstractMesh,
  Mesh
} from '@babylonjs/core';
import { Player } from '../player/Player';
import { playSound } from '../utils/helpers';
import { AUDIO_PATHS } from '../utils/constants';

export type EnemyType3D = 'shadow_guardian' | 'ruin_golem' | 'void_crawler';

export interface EnemyConfig3D {
  id: string;
  name: string;
  type: EnemyType3D;
  position: Vector3;
  patrolRadius?: number;
  hitsToDie?: number;
}

export class Enemy3D {
  public root: TransformNode;
  public id: string;
  public name: string;
  public type: EnemyType3D;
  public maxHealth: number;
  public health: number;
  public damage: number;
  public moveSpeed: number;
  public isDead = false;
  public hitsToDie?: number;

  private hpPipMeshes: Mesh[] = [];
  private hpBarRoot?: TransformNode;
  private activePipMat?: StandardMaterial;
  private emptyPipMat?: StandardMaterial;

  private startPos: Vector3;
  private patrolRadius: number;
  private aggroRange = 16.0;
  private attackRange = 2.8;
  private attackCooldown = 1.6;
  private lastAttackTime = 0;
  private hurtTimer = 0;
  private meshes: AbstractMesh[] = [];

  // Animation nodes
  private torso!: TransformNode;
  private head!: TransformNode;
  private armL!: TransformNode;
  private armR!: TransformNode;
  private legL?: TransformNode;
  private legR?: TransformNode;
  private weapon?: TransformNode;
  private animTimer = Math.random() * 10;
  private isAttacking = false;

  constructor(
    public scene: Scene,
    config: EnemyConfig3D,
    private onDeath?: (enemy: Enemy3D) => void
  ) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type;
    this.hitsToDie = config.hitsToDie;
    this.startPos = config.position.clone();
    this.patrolRadius = config.patrolRadius ?? 8.0;

    this.root = new TransformNode(`Enemy_${config.id}`, scene);
    this.root.position.copyFrom(config.position);

    if (this.type === 'void_crawler') {
      this.maxHealth = this.hitsToDie ?? 2;
      this.health = this.hitsToDie ?? 2;
      this.damage = 10;
      this.moveSpeed = 4.2;
      this.buildVoidCrawler();
    } else if (this.type === 'shadow_guardian') {
      this.maxHealth = 60;
      this.health = 60;
      this.damage = 14;
      this.moveSpeed = 4.6;
      this.buildShadowGuardian();
    } else {
      this.maxHealth = 120;
      this.health = 120;
      this.damage = 22;
      this.moveSpeed = 3.2;
      this.buildRuinGolem();
    }

    if (this.hitsToDie) {
      this.buildOverheadHealthPips();
    }
  }

  private buildVoidCrawler(): void {
    const scene = this.scene;
    const root = this.root;

    const voidMat = new StandardMaterial(`mat_void_${this.id}`, scene);
    voidMat.diffuseColor = Color3.FromHexString('#1a0933');
    voidMat.emissiveColor = Color3.FromHexString('#4a154b');

    const eyeMat = new StandardMaterial(`mat_void_eye_${this.id}`, scene);
    eyeMat.diffuseColor = Color3.FromHexString('#ff0055');
    eyeMat.emissiveColor = Color3.FromHexString('#ff0033');

    const bladeMat = new StandardMaterial(`mat_void_blade_${this.id}`, scene);
    bladeMat.diffuseColor = Color3.FromHexString('#0b0416');
    bladeMat.emissiveColor = Color3.FromHexString('#8e44ad');

    // Torso
    this.torso = new TransformNode(`Torso_${this.id}`, scene);
    this.torso.parent = root;
    this.torso.position.y = 1.0;

    const body = MeshBuilder.CreateSphere(`Body_${this.id}`, { diameterX: 0.8, diameterY: 0.9, diameterZ: 0.8 }, scene);
    body.material = voidMat;
    body.parent = this.torso;
    this.meshes.push(body);

    // Spines along spine
    for (let i = 0; i < 3; i++) {
      const spine = MeshBuilder.CreateCylinder(`Spine_${i}_${this.id}`, { diameterTop: 0, diameterBottom: 0.2, height: 0.5 }, scene);
      spine.material = bladeMat;
      spine.position.set(0, 0.2 + i * 0.2, -0.35);
      spine.rotation.x = -0.6;
      spine.parent = this.torso;
      this.meshes.push(spine);
    }

    // Head
    this.head = new TransformNode(`Head_${this.id}`, scene);
    this.head.parent = this.torso;
    this.head.position.set(0, 0.7, 0.2);

    const skull = MeshBuilder.CreateBox(`Skull_${this.id}`, { width: 0.45, height: 0.45, depth: 0.5 }, scene);
    skull.material = voidMat;
    skull.parent = this.head;
    this.meshes.push(skull);

    // Glowing menacing red eyes
    const eyeL = MeshBuilder.CreateSphere(`EyeL_${this.id}`, { diameter: 0.12 }, scene);
    eyeL.material = eyeMat;
    eyeL.position.set(-0.12, 0.05, 0.26);
    eyeL.parent = this.head;
    this.meshes.push(eyeL);

    const eyeR = MeshBuilder.CreateSphere(`EyeR_${this.id}`, { diameter: 0.12 }, scene);
    eyeR.material = eyeMat;
    eyeR.position.set(0.12, 0.05, 0.26);
    eyeR.parent = this.head;
    this.meshes.push(eyeR);

    // Mantis Blades (Arms)
    this.armL = new TransformNode(`ArmL_${this.id}`, scene);
    this.armL.parent = this.torso;
    this.armL.position.set(-0.55, 0.3, 0.2);

    const bladeL = MeshBuilder.CreateCylinder(`BladeL_${this.id}`, { diameterTop: 0.02, diameterBottom: 0.15, height: 1.1 }, scene);
    bladeL.material = bladeMat;
    bladeL.rotation.z = -0.6;
    bladeL.position.set(-0.25, -0.4, 0.1);
    bladeL.parent = this.armL;
    this.meshes.push(bladeL);

    this.armR = new TransformNode(`ArmR_${this.id}`, scene);
    this.armR.parent = this.torso;
    this.armR.position.set(0.55, 0.3, 0.2);

    const bladeR = MeshBuilder.CreateCylinder(`BladeR_${this.id}`, { diameterTop: 0.02, diameterBottom: 0.15, height: 1.1 }, scene);
    bladeR.material = bladeMat;
    bladeR.rotation.z = 0.6;
    bladeR.position.set(0.25, -0.4, 0.1);
    bladeR.parent = this.armR;
    this.meshes.push(bladeR);

    // 2 Insectoid Legs
    this.legL = new TransformNode(`LegL_${this.id}`, scene);
    this.legL.parent = root;
    this.legL.position.set(-0.3, 0.9, 0);

    const limbL = MeshBuilder.CreateCylinder(`LimbL_${this.id}`, { diameter: 0.14, height: 0.9 }, scene);
    limbL.material = voidMat;
    limbL.position.y = -0.45;
    limbL.parent = this.legL;
    this.meshes.push(limbL);

    this.legR = new TransformNode(`LegR_${this.id}`, scene);
    this.legR.parent = root;
    this.legR.position.set(0.3, 0.9, 0);

    const limbR = MeshBuilder.CreateCylinder(`LimbR_${this.id}`, { diameter: 0.14, height: 0.9 }, scene);
    limbR.material = voidMat;
    limbR.position.y = -0.45;
    limbR.parent = this.legR;
    this.meshes.push(limbR);
  }

  private buildOverheadHealthPips(): void {
    const scene = this.scene;
    this.hpBarRoot = new TransformNode(`HpBarRoot_${this.id}`, scene);
    this.hpBarRoot.parent = this.root;
    this.hpBarRoot.position.set(0, 2.3, 0);

    this.activePipMat = new StandardMaterial(`mat_hp_active_${this.id}`, scene);
    this.activePipMat.diffuseColor = Color3.FromHexString('#ff3838');
    this.activePipMat.emissiveColor = Color3.FromHexString('#ff2222');

    this.emptyPipMat = new StandardMaterial(`mat_hp_empty_${this.id}`, scene);
    this.emptyPipMat.diffuseColor = Color3.FromHexString('#333333');
    this.emptyPipMat.alpha = 0.5;

    const totalPips = this.hitsToDie ?? 2;
    const pipW = 0.32;
    const gap = 0.08;
    const totalW = totalPips * pipW + (totalPips - 1) * gap;
    const startX = -totalW / 2 + pipW / 2;

    for (let i = 0; i < totalPips; i++) {
      const pip = MeshBuilder.CreateBox(`HpPip_${i}_${this.id}`, { width: pipW, height: 0.1, depth: 0.05 }, scene);
      pip.position.set(startX + i * (pipW + gap), 0, 0);
      pip.material = this.activePipMat;
      pip.parent = this.hpBarRoot;
      this.hpPipMeshes.push(pip);
    }
  }

  public updateHpPips(): void {
    if (!this.hpPipMeshes.length || !this.activePipMat || !this.emptyPipMat) return;
    for (let i = 0; i < this.hpPipMeshes.length; i++) {
      if (i < this.health) {
        this.hpPipMeshes[i].material = this.activePipMat;
      } else {
        this.hpPipMeshes[i].material = this.emptyPipMat;
      }
    }
  }

  private buildShadowGuardian(): void {
    const scene = this.scene;
    const root = this.root;

    // Dark spectral material
    const shadowMat = new StandardMaterial(`mat_shadow_${this.id}`, scene);
    shadowMat.diffuseColor = Color3.FromHexString('#150d24');
    shadowMat.emissiveColor = Color3.FromHexString('#2c103e');

    // Glowing eyes/runes
    const glowMat = new StandardMaterial(`mat_glow_${this.id}`, scene);
    glowMat.diffuseColor = Color3.FromHexString('#e74c3c');
    glowMat.emissiveColor = Color3.FromHexString('#ff3333');

    // Blade
    const bladeMat = new StandardMaterial(`mat_blade_${this.id}`, scene);
    bladeMat.diffuseColor = Color3.FromHexString('#111116');
    bladeMat.emissiveColor = Color3.FromHexString('#8e44ad');

    // Torso
    this.torso = new TransformNode(`Torso_${this.id}`, scene);
    this.torso.parent = root;
    this.torso.position.y = 1.1;

    const chest = MeshBuilder.CreateBox(`Chest_${this.id}`, { width: 0.65, height: 0.75, depth: 0.4 }, scene);
    chest.material = shadowMat;
    chest.parent = this.torso;
    chest.position.y = 0.35;
    this.meshes.push(chest);

    // Glowing core
    const core = MeshBuilder.CreateSphere(`Core_${this.id}`, { diameter: 0.25 }, scene);
    core.material = glowMat;
    core.parent = this.torso;
    core.position.set(0, 0.4, 0.2);
    this.meshes.push(core);

    // Head
    this.head = new TransformNode(`Head_${this.id}`, scene);
    this.head.parent = this.torso;
    this.head.position.y = 0.8;

    const helmet = MeshBuilder.CreateBox(`HeadMesh_${this.id}`, { width: 0.4, height: 0.45, depth: 0.4 }, scene);
    helmet.material = shadowMat;
    helmet.parent = this.head;
    helmet.position.y = 0.22;
    this.meshes.push(helmet);

    // Glowing eyes
    const eyeL = MeshBuilder.CreateBox(`EyeL_${this.id}`, { width: 0.08, height: 0.04, depth: 0.05 }, scene);
    eyeL.material = glowMat;
    eyeL.parent = this.head;
    eyeL.position.set(-0.1, 0.22, 0.21);
    this.meshes.push(eyeL);

    const eyeR = MeshBuilder.CreateBox(`EyeR_${this.id}`, { width: 0.08, height: 0.04, depth: 0.05 }, scene);
    eyeR.material = glowMat;
    eyeR.parent = this.head;
    eyeR.position.set(0.1, 0.22, 0.21);
    this.meshes.push(eyeR);

    // Arms
    this.armL = new TransformNode(`ArmL_${this.id}`, scene);
    this.armL.parent = this.torso;
    this.armL.position.set(-0.45, 0.6, 0);

    const armLMesh = MeshBuilder.CreateBox(`ArmLMesh_${this.id}`, { width: 0.18, height: 0.7, depth: 0.18 }, scene);
    armLMesh.material = shadowMat;
    armLMesh.parent = this.armL;
    armLMesh.position.y = -0.35;
    this.meshes.push(armLMesh);

    this.armR = new TransformNode(`ArmR_${this.id}`, scene);
    this.armR.parent = this.torso;
    this.armR.position.set(0.45, 0.6, 0);

    const armRMesh = MeshBuilder.CreateBox(`ArmRMesh_${this.id}`, { width: 0.18, height: 0.7, depth: 0.18 }, scene);
    armRMesh.material = shadowMat;
    armRMesh.parent = this.armR;
    armRMesh.position.y = -0.35;
    this.meshes.push(armRMesh);

    // Dark Scythe/Blade
    this.weapon = new TransformNode(`Wep_${this.id}`, scene);
    this.weapon.parent = this.armR;
    this.weapon.position.set(0, -0.65, 0.2);

    const blade = MeshBuilder.CreateBox(`Blade_${this.id}`, { width: 0.09, height: 1.1, depth: 0.04 }, scene);
    blade.material = bladeMat;
    blade.parent = this.weapon;
    blade.position.y = 0.5;
    this.meshes.push(blade);

    // Legs
    this.legL = new TransformNode(`LegL_${this.id}`, scene);
    this.legL.parent = root;
    this.legL.position.set(-0.2, 0.95, 0);

    const legLMesh = MeshBuilder.CreateBox(`LegLMesh_${this.id}`, { width: 0.2, height: 0.9, depth: 0.2 }, scene);
    legLMesh.material = shadowMat;
    legLMesh.parent = this.legL;
    legLMesh.position.y = -0.45;
    this.meshes.push(legLMesh);

    this.legR = new TransformNode(`LegR_${this.id}`, scene);
    this.legR.parent = root;
    this.legR.position.set(0.2, 0.95, 0);

    const legRMesh = MeshBuilder.CreateBox(`LegRMesh_${this.id}`, { width: 0.2, height: 0.9, depth: 0.2 }, scene);
    legRMesh.material = shadowMat;
    legRMesh.parent = this.legR;
    legRMesh.position.y = -0.45;
    this.meshes.push(legRMesh);
  }

  private buildRuinGolem(): void {
    const scene = this.scene;
    const root = this.root;

    // Ancient mossy stone
    const stoneMat = new StandardMaterial(`mat_golem_stone_${this.id}`, scene);
    stoneMat.diffuseColor = Color3.FromHexString('#5c5042');
    stoneMat.emissiveColor = Color3.FromHexString('#1a1612');

    // Ancient sun rune gold
    const runeMat = new StandardMaterial(`mat_golem_rune_${this.id}`, scene);
    runeMat.diffuseColor = Color3.FromHexString('#f39c12');
    runeMat.emissiveColor = Color3.FromHexString('#d35400');

    // Heavy Boulder Torso
    this.torso = new TransformNode(`Torso_${this.id}`, scene);
    this.torso.parent = root;
    this.torso.position.y = 1.5;

    const chest = MeshBuilder.CreateBox(`Chest_${this.id}`, { width: 1.4, height: 1.2, depth: 0.9 }, scene);
    chest.material = stoneMat;
    chest.parent = this.torso;
    chest.position.y = 0.5;
    this.meshes.push(chest);

    // Glowing sun glyph in chest
    const rune = MeshBuilder.CreateCylinder(`Rune_${this.id}`, { diameter: 0.5, height: 0.1, tessellation: 8 }, scene);
    rune.material = runeMat;
    rune.parent = this.torso;
    rune.rotation.x = Math.PI / 2;
    rune.position.set(0, 0.5, 0.48);
    this.meshes.push(rune);

    // Head
    this.head = new TransformNode(`Head_${this.id}`, scene);
    this.head.parent = this.torso;
    this.head.position.y = 1.15;

    const headMesh = MeshBuilder.CreateBox(`HeadMesh_${this.id}`, { width: 0.6, height: 0.5, depth: 0.6 }, scene);
    headMesh.material = stoneMat;
    headMesh.parent = this.head;
    headMesh.position.y = 0.25;
    this.meshes.push(headMesh);

    const eyeL = MeshBuilder.CreateBox(`EyeL_${this.id}`, { width: 0.1, height: 0.08, depth: 0.05 }, scene);
    eyeL.material = runeMat;
    eyeL.parent = this.head;
    eyeL.position.set(-0.16, 0.25, 0.31);
    this.meshes.push(eyeL);

    const eyeR = MeshBuilder.CreateBox(`EyeR_${this.id}`, { width: 0.1, height: 0.08, depth: 0.05 }, scene);
    eyeR.material = runeMat;
    eyeR.parent = this.head;
    eyeR.position.set(0.16, 0.25, 0.31);
    this.meshes.push(eyeR);

    // Massive Stone Fists
    this.armL = new TransformNode(`ArmL_${this.id}`, scene);
    this.armL.parent = this.torso;
    this.armL.position.set(-0.95, 0.9, 0);

    const armLMesh = MeshBuilder.CreateBox(`ArmLMesh_${this.id}`, { width: 0.45, height: 1.2, depth: 0.45 }, scene);
    armLMesh.material = stoneMat;
    armLMesh.parent = this.armL;
    armLMesh.position.y = -0.55;
    this.meshes.push(armLMesh);

    this.armR = new TransformNode(`ArmR_${this.id}`, scene);
    this.armR.parent = this.torso;
    this.armR.position.set(0.95, 0.9, 0);

    const armRMesh = MeshBuilder.CreateBox(`ArmRMesh_${this.id}`, { width: 0.45, height: 1.2, depth: 0.45 }, scene);
    armRMesh.material = stoneMat;
    armRMesh.parent = this.armR;
    armRMesh.position.y = -0.55;
    this.meshes.push(armRMesh);

    // Legs
    this.legL = new TransformNode(`LegL_${this.id}`, scene);
    this.legL.parent = root;
    this.legL.position.set(-0.4, 1.2, 0);

    const legLMesh = MeshBuilder.CreateBox(`LegLMesh_${this.id}`, { width: 0.45, height: 1.2, depth: 0.45 }, scene);
    legLMesh.material = stoneMat;
    legLMesh.parent = this.legL;
    legLMesh.position.y = -0.6;
    this.meshes.push(legLMesh);

    this.legR = new TransformNode(`LegR_${this.id}`, scene);
    this.legR.parent = root;
    this.legR.position.set(0.4, 1.2, 0);

    const legRMesh = MeshBuilder.CreateBox(`LegRMesh_${this.id}`, { width: 0.45, height: 1.2, depth: 0.45 }, scene);
    legRMesh.material = stoneMat;
    legRMesh.parent = this.legR;
    legRMesh.position.y = -0.6;
    this.meshes.push(legRMesh);
  }

  public takeDamage(amount: number): boolean {
    if (this.isDead) return false;

    if (this.hitsToDie !== undefined && this.hitsToDie > 0) {
      // Exactly 1 hit deducted per player attack
      this.health = Math.max(0, this.health - 1);
    } else {
      this.health = Math.max(0, this.health - amount);
    }

    this.updateHpPips();
    this.hurtTimer = 0.35;
    playSound(AUDIO_PATHS.HIT, 0.9);

    // Stagger knockback slightly away from player facing
    this.root.position.addInPlace(new Vector3(
      -Math.sin(this.root.rotation.y) * 0.45,
      0,
      -Math.cos(this.root.rotation.y) * 0.45
    ));

    // Flash meshes red
    this.meshes.forEach(m => {
      if (m.material instanceof StandardMaterial) {
        m.material.emissiveColor = Color3.Red();
      }
    });

    if (this.health <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  private die(): void {
    this.isDead = true;
    playSound(AUDIO_PATHS.HIT, 1.0);

    // Fall animation
    const startTime = Date.now();
    const startY = this.root.position.y;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed >= 0.8) {
        clearInterval(interval);
        if (this.onDeath) this.onDeath(this);
        this.dispose();
      } else {
        this.root.rotation.x = (elapsed / 0.8) * (Math.PI / 2);
        this.root.position.y = startY - (elapsed / 0.8) * 0.5;
      }
    }, 20);
  }

  public update(deltaTime: number, player: Player): void {
    if (this.isDead) return;

    this.animTimer += deltaTime;

    // Reset hurt flash
    if (this.hurtTimer > 0) {
      this.hurtTimer -= deltaTime;
      if (this.hurtTimer <= 0) {
        this.meshes.forEach(m => {
          if (m.material instanceof StandardMaterial) {
            m.material.emissiveColor = this.type === 'shadow_guardian'
              ? Color3.FromHexString('#2c103e')
              : Color3.FromHexString('#1a1612');
          }
        });
      }
    }

    const playerPos = player.root.position;
    const distToPlayer = Vector3.Distance(this.root.position, playerPos);

    if (distToPlayer <= this.aggroRange && !player.isVictorious && player.health > 0) {
      // Chase player
      const dir = playerPos.subtract(this.root.position);
      dir.y = 0;
      dir.normalize();

      // Rotate to face player
      const targetAngle = Math.atan2(dir.x, dir.z);
      this.root.rotation.y = targetAngle;

      if (distToPlayer > this.attackRange) {
        // Move towards player
        this.root.position.addInPlace(dir.scale(this.moveSpeed * deltaTime));

        // Walk cycle animation
        const walkCycle = Math.sin(this.animTimer * 8);
        if (this.legL && this.legR) {
          this.legL.rotation.x = walkCycle * 0.4;
          this.legR.rotation.x = -walkCycle * 0.4;
        }
        if (this.armL && this.armR && !this.isAttacking) {
          this.armL.rotation.x = -walkCycle * 0.4;
          this.armR.rotation.x = walkCycle * 0.4;
        }
      } else {
        // In attack range
        const now = this.animTimer;
        if (now - this.lastAttackTime > this.attackCooldown) {
          this.performAttack(player);
          this.lastAttackTime = now;
        }
      }
    } else {
      // Gentle idle breathing
      this.torso.position.y = (this.type === 'shadow_guardian' ? 1.1 : 1.5) + Math.sin(this.animTimer * 2.5) * 0.04;
    }
  }

  private performAttack(player: Player): void {
    this.isAttacking = true;
    playSound(AUDIO_PATHS.ATTACK, 0.7);

    // Lunge weapon/arm forward
    if (this.armR) {
      this.armR.rotation.x = -Math.PI / 2.2;
    }

    setTimeout(() => {
      if (!this.isDead && Vector3.Distance(this.root.position, player.root.position) <= this.attackRange + 1.0) {
        player.takeDamage(this.damage);
      }
      if (this.armR) {
        this.armR.rotation.x = 0;
      }
      this.isAttacking = false;
    }, 280);
  }

  public dispose(): void {
    this.meshes.forEach(m => m.dispose());
    this.root.dispose();
  }
}
