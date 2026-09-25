import {
  Scene,
  TransformNode,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  AbstractMesh,
  Mesh,
  PointLight
} from '@babylonjs/core';
import { PlayerAnimation, PlayerRigs } from './PlayerAnimation';
import { playSound } from '../utils/helpers';
import { AUDIO_PATHS } from '../utils/constants';

export class Player {
  public root: TransformNode;
  public animation: PlayerAnimation;
  public rigs: PlayerRigs;
  public health = 100;
  public maxHealth = 100;
  public isAttacking = false;
  public isHurt = false;
  public isVictorious = false;

  private meshes: AbstractMesh[] = [];
  private crownMesh?: Mesh;
  private auraLight?: PointLight;

  constructor(public scene: Scene, startPos = new Vector3(0, 0, 0)) {
    this.root = new TransformNode('Player_Aren', scene);
    this.root.position.copyFrom(startPos);

    this.rigs = this.buildCharacterMeshes();
    this.animation = new PlayerAnimation(this.rigs);
  }

  private buildCharacterMeshes(): PlayerRigs {
    const scene = this.scene;
    const root = this.root;

    // Materials
    // 1. Skin
    const skinMat = new StandardMaterial('mat_skin', scene);
    skinMat.diffuseColor = Color3.FromHexString('#d79c6d');

    // 2. Crimson Tunic
    const tunicMat = new StandardMaterial('mat_tunic', scene);
    tunicMat.diffuseColor = Color3.FromHexString('#8b1e1e');

    // 3. Bronze Armor
    const bronzeMat = new StandardMaterial('mat_bronze', scene);
    bronzeMat.diffuseColor = Color3.FromHexString('#b8860b');
    bronzeMat.specularColor = Color3.FromHexString('#ffd700');
    bronzeMat.specularPower = 32;

    // 4. Gold Trim / Emblem
    const goldMat = new StandardMaterial('mat_gold', scene);
    goldMat.diffuseColor = Color3.FromHexString('#f5c542');
    goldMat.emissiveColor = Color3.FromHexString('#5c4308');

    // 5. Hair
    const hairMat = new StandardMaterial('mat_hair', scene);
    hairMat.diffuseColor = Color3.FromHexString('#20150d');

    // 6. Saffron Cloak
    const cloakMat = new StandardMaterial('mat_cloak', scene);
    cloakMat.diffuseColor = Color3.FromHexString('#d97724');
    cloakMat.backFaceCulling = false;

    // 7. Leather Boots
    const leatherMat = new StandardMaterial('mat_leather', scene);
    leatherMat.diffuseColor = Color3.FromHexString('#4a2e18');

    // 8. Steel Blade
    const steelMat = new StandardMaterial('mat_steel', scene);
    steelMat.diffuseColor = Color3.FromHexString('#e0e0eb');
    steelMat.specularColor = Color3.FromHexString('#ffffff');

    // --- NODES HIERARCHY ---
    const torso = new TransformNode('Rig_Torso', scene);
    torso.parent = root;
    torso.position.y = 1.1;

    // Torso Mesh
    const torsoMesh = MeshBuilder.CreateBox('Aren_Torso', { width: 0.6, height: 0.7, depth: 0.35 }, scene);
    torsoMesh.material = tunicMat;
    torsoMesh.parent = torso;
    torsoMesh.position.y = 0.35;
    this.meshes.push(torsoMesh);

    // Bronze Chestplate
    const chestMesh = MeshBuilder.CreateBox('Aren_Chestplate', { width: 0.62, height: 0.45, depth: 0.38 }, scene);
    chestMesh.material = bronzeMat;
    chestMesh.parent = torso;
    chestMesh.position.y = 0.45;
    this.meshes.push(chestMesh);

    // Royal Sun Emblem on chest
    const emblem = MeshBuilder.CreateCylinder('Aren_Emblem', { diameter: 0.18, height: 0.05, tessellation: 16 }, scene);
    emblem.material = goldMat;
    emblem.parent = torso;
    emblem.rotation.x = Math.PI / 2;
    emblem.position.set(0, 0.48, 0.2);
    this.meshes.push(emblem);

    // Leather Belt & Buckle
    const belt = MeshBuilder.CreateBox('Aren_Belt', { width: 0.63, height: 0.12, depth: 0.37 }, scene);
    belt.material = leatherMat;
    belt.parent = torso;
    belt.position.y = 0.06;
    this.meshes.push(belt);

    const buckle = MeshBuilder.CreateBox('Aren_Buckle', { width: 0.14, height: 0.14, depth: 0.39 }, scene);
    buckle.material = goldMat;
    buckle.parent = torso;
    buckle.position.y = 0.06;
    this.meshes.push(buckle);

    // Head Node
    const head = new TransformNode('Rig_Head', scene);
    head.parent = torso;
    head.position.y = 0.75;

    const headMesh = MeshBuilder.CreateBox('Aren_Head', { width: 0.35, height: 0.38, depth: 0.35 }, scene);
    headMesh.material = skinMat;
    headMesh.parent = head;
    headMesh.position.y = 0.22;
    this.meshes.push(headMesh);

    // Hair
    const hairTop = MeshBuilder.CreateBox('Aren_Hair', { width: 0.38, height: 0.18, depth: 0.38 }, scene);
    hairTop.material = hairMat;
    hairTop.parent = head;
    hairTop.position.set(0, 0.36, -0.02);
    this.meshes.push(hairTop);

    // Bronze Circlet Headband
    const circlet = MeshBuilder.CreateBox('Aren_Circlet', { width: 0.39, height: 0.06, depth: 0.39 }, scene);
    circlet.material = goldMat;
    circlet.parent = head;
    circlet.position.y = 0.28;
    this.meshes.push(circlet);

    // Cloak
    const cloak = new TransformNode('Rig_Cloak', scene);
    cloak.parent = torso;
    cloak.position.set(0, 0.68, -0.18);

    const cloakMesh = MeshBuilder.CreateBox('Aren_CloakMesh', { width: 0.7, height: 1.05, depth: 0.04 }, scene);
    cloakMesh.material = cloakMat;
    cloakMesh.parent = cloak;
    cloakMesh.position.y = -0.5;
    this.meshes.push(cloakMesh);

    // Left Arm
    const armL = new TransformNode('Rig_ArmL', scene);
    armL.parent = torso;
    armL.position.set(-0.4, 0.65, 0);

    const armLMesh = MeshBuilder.CreateBox('Aren_ArmLMesh', { width: 0.16, height: 0.65, depth: 0.16 }, scene);
    armLMesh.material = tunicMat;
    armLMesh.parent = armL;
    armLMesh.position.y = -0.3;
    this.meshes.push(armLMesh);

    const bracerL = MeshBuilder.CreateBox('Aren_BracerL', { width: 0.19, height: 0.25, depth: 0.19 }, scene);
    bracerL.material = bronzeMat;
    bracerL.parent = armL;
    bracerL.position.y = -0.4;
    this.meshes.push(bracerL);

    // Right Arm
    const armR = new TransformNode('Rig_ArmR', scene);
    armR.parent = torso;
    armR.position.set(0.4, 0.65, 0);

    const armRMesh = MeshBuilder.CreateBox('Aren_ArmRMesh', { width: 0.16, height: 0.65, depth: 0.16 }, scene);
    armRMesh.material = tunicMat;
    armRMesh.parent = armR;
    armRMesh.position.y = -0.3;
    this.meshes.push(armRMesh);

    const bracerR = MeshBuilder.CreateBox('Aren_BracerR', { width: 0.19, height: 0.25, depth: 0.19 }, scene);
    bracerR.material = bronzeMat;
    bracerR.parent = armR;
    bracerR.position.y = -0.4;
    this.meshes.push(bracerR);

    // Weapon: Talwar curved blade attached to Right Arm
    const weapon = new TransformNode('Rig_Weapon', scene);
    weapon.parent = armR;
    weapon.position.set(0, -0.6, 0.15);

    const swordHilt = MeshBuilder.CreateCylinder('Aren_SwordHilt', { diameter: 0.05, height: 0.2 }, scene);
    swordHilt.material = goldMat;
    swordHilt.parent = weapon;
    this.meshes.push(swordHilt);

    const swordGuard = MeshBuilder.CreateBox('Aren_SwordGuard', { width: 0.16, height: 0.04, depth: 0.08 }, scene);
    swordGuard.material = bronzeMat;
    swordGuard.parent = weapon;
    swordGuard.position.y = 0.1;
    this.meshes.push(swordGuard);

    const swordBlade = MeshBuilder.CreateBox('Aren_SwordBlade', { width: 0.08, height: 0.8, depth: 0.02 }, scene);
    swordBlade.material = steelMat;
    swordBlade.parent = weapon;
    swordBlade.position.y = 0.5;
    this.meshes.push(swordBlade);

    // Legs
    const legL = new TransformNode('Rig_LegL', scene);
    legL.parent = root;
    legL.position.set(-0.18, 1.0, 0);

    const legLMesh = MeshBuilder.CreateBox('Aren_LegLMesh', { width: 0.2, height: 0.65, depth: 0.2 }, scene);
    legLMesh.material = tunicMat;
    legLMesh.parent = legL;
    legLMesh.position.y = -0.32;
    this.meshes.push(legLMesh);

    const bootL = MeshBuilder.CreateBox('Aren_BootL', { width: 0.22, height: 0.4, depth: 0.28 }, scene);
    bootL.material = leatherMat;
    bootL.parent = legL;
    bootL.position.set(0, -0.7, 0.04);
    this.meshes.push(bootL);

    const legR = new TransformNode('Rig_LegR', scene);
    legR.parent = root;
    legR.position.set(0.18, 1.0, 0);

    const legRMesh = MeshBuilder.CreateBox('Aren_LegRMesh', { width: 0.2, height: 0.65, depth: 0.2 }, scene);
    legRMesh.material = tunicMat;
    legRMesh.parent = legR;
    legRMesh.position.y = -0.32;
    this.meshes.push(legRMesh);

    const bootR = MeshBuilder.CreateBox('Aren_BootR', { width: 0.22, height: 0.4, depth: 0.28 }, scene);
    bootR.material = leatherMat;
    bootR.parent = legR;
    bootR.position.set(0, -0.7, 0.04);
    this.meshes.push(bootR);

    return {
      root,
      torso,
      head,
      cloak,
      armL,
      armR,
      weapon,
      legL,
      legR
    };
  }

  public attack(): void {
    if (this.isAttacking || this.isHurt || this.isVictorious) return;
    this.isAttacking = true;
    playSound(AUDIO_PATHS.ATTACK, 0.6);

    this.animation.setState('attack', 0.4, () => {
      this.isAttacking = false;
    });
  }

  public takeDamage(amount: number): void {
    if (this.isHurt || this.isVictorious) return;
    this.health = Math.max(0, this.health - amount);
    this.isHurt = true;

    playSound(AUDIO_PATHS.HIT, 0.7);

    // Flash meshes
    this.meshes.forEach(m => {
      if (m.material instanceof StandardMaterial) {
        m.material.emissiveColor = Color3.Red();
      }
    });

    this.animation.setState('hurt', 0.35, () => {
      this.isHurt = false;
      this.meshes.forEach(m => {
        if (m.material instanceof StandardMaterial) {
          m.material.emissiveColor = Color3.Black();
        }
      });
    });
  }

  public setVictory(): void {
    this.isVictorious = true;
    this.animation.setState('victory');

    // Attach glorious glowing Solar Crown above head
    if (!this.crownMesh) {
      const crownMat = new StandardMaterial('mat_solar_crown_aren', this.scene);
      crownMat.diffuseColor = Color3.FromHexString('#ffd700');
      crownMat.emissiveColor = Color3.FromHexString('#ffb703');

      this.crownMesh = MeshBuilder.CreateTorus('Aren_HeldCrown', { diameter: 0.4, thickness: 0.08, tessellation: 24 }, this.scene);
      this.crownMesh.material = crownMat;
      this.crownMesh.parent = this.rigs.torso;
      this.crownMesh.position.set(0, 1.4, 0);

      this.auraLight = new PointLight('Aren_CrownAura', new Vector3(0, 2.5, 0), this.scene);
      this.auraLight.diffuse = Color3.FromHexString('#ffd700');
      this.auraLight.intensity = 2.0;
      this.auraLight.parent = this.root;
    }
  }

  public update(deltaTime: number): void {
    this.animation.update(deltaTime);
  }
}
