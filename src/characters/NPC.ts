import {
  Scene,
  TransformNode,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  AbstractMesh
} from '@babylonjs/core';
import { NPCConfig3D } from '../data/npcs';

export class NPC {
  public root: TransformNode;
  public config: NPCConfig3D;
  private meshes: AbstractMesh[] = [];
  private torso!: TransformNode;
  private head!: TransformNode;
  private animTimer = Math.random() * 10;

  constructor(public scene: Scene, config: NPCConfig3D) {
    this.config = config;
    this.root = new TransformNode(`NPC_${config.id}`, scene);
    this.root.position.copyFrom(config.position);
    this.root.rotation.y = config.rotationY;

    this.buildMeshes();
  }

  private buildMeshes(): void {
    const scene = this.scene;
    const root = this.root;

    // Materials
    const skinMat = new StandardMaterial(`skin_${this.config.id}`, scene);
    skinMat.diffuseColor = Color3.FromHexString('#d29a67');

    const robeMat = new StandardMaterial(`robe_${this.config.id}`, scene);
    robeMat.diffuseColor = Color3.FromHexString(this.config.clothesColor);

    const goldMat = new StandardMaterial(`gold_${this.config.id}`, scene);
    goldMat.diffuseColor = Color3.FromHexString('#f5c542');

    const darkMat = new StandardMaterial(`dark_${this.config.id}`, scene);
    darkMat.diffuseColor = Color3.FromHexString('#251c14');

    // Torso Node
    this.torso = new TransformNode(`Torso_${this.config.id}`, scene);
    this.torso.parent = root;
    this.torso.position.y = 1.0;

    // Flowing Robes
    const robeMesh = MeshBuilder.CreateCylinder(`Robe_${this.config.id}`, {
      diameterTop: 0.55,
      diameterBottom: 0.85,
      height: 1.4,
      tessellation: 16
    }, scene);
    robeMesh.material = robeMat;
    robeMesh.parent = this.torso;
    robeMesh.position.y = 0.3;
    this.meshes.push(robeMesh);

    // Stole / Sash
    const sash = MeshBuilder.CreateBox(`Sash_${this.config.id}`, { width: 0.22, height: 1.2, depth: 0.58 }, scene);
    sash.material = goldMat;
    sash.parent = this.torso;
    sash.position.set(0, 0.4, 0.02);
    this.meshes.push(sash);

    // Head
    this.head = new TransformNode(`Head_${this.config.id}`, scene);
    this.head.parent = this.torso;
    this.head.position.y = 1.05;

    const headMesh = MeshBuilder.CreateBox(`HeadMesh_${this.config.id}`, { width: 0.34, height: 0.36, depth: 0.34 }, scene);
    headMesh.material = skinMat;
    headMesh.parent = this.head;
    headMesh.position.y = 0.18;
    this.meshes.push(headMesh);

    // Role-specific accessories:
    if (this.config.role === 'merchant') {
      // Royal Turban
      const turban = MeshBuilder.CreateCylinder(`Turban_${this.config.id}`, { diameter: 0.48, height: 0.22, tessellation: 16 }, scene);
      turban.material = goldMat;
      turban.parent = this.head;
      turban.position.y = 0.36;
      this.meshes.push(turban);
    } else if (this.config.role === 'historian' || this.config.role === 'elder') {
      // Sage beard
      const beard = MeshBuilder.CreateBox(`Beard_${this.config.id}`, { width: 0.26, height: 0.28, depth: 0.16 }, scene);
      beard.material = this.config.role === 'elder' ? goldMat : darkMat;
      beard.parent = this.head;
      beard.position.set(0, 0.04, 0.16);
      this.meshes.push(beard);
    } else if (this.config.role === 'keeper') {
      // Temple staff
      const staff = MeshBuilder.CreateCylinder(`Staff_${this.config.id}`, { diameter: 0.05, height: 2.2, tessellation: 8 }, scene);
      staff.material = goldMat;
      staff.parent = this.torso;
      staff.position.set(0.45, 0.2, 0.2);
      this.meshes.push(staff);

      const staffOrb = MeshBuilder.CreateSphere(`StaffOrb_${this.config.id}`, { diameter: 0.2 }, scene);
      staffOrb.material = goldMat;
      staffOrb.parent = staff;
      staffOrb.position.y = 1.1;
      this.meshes.push(staffOrb);
    }
  }

  public lookAt(targetPos: Vector3): void {
    const dx = targetPos.x - this.root.position.x;
    const dz = targetPos.z - this.root.position.z;
    const angle = Math.atan2(dx, dz);
    this.root.rotation.y = angle;
  }

  public update(deltaTime: number): void {
    this.animTimer += deltaTime;
    // Gentle breathing idle
    this.torso.position.y = 1.0 + Math.sin(this.animTimer * 2.2) * 0.02;
    this.head.rotation.x = Math.sin(this.animTimer * 2.2) * 0.02;
  }

  public dispose(): void {
    this.meshes.forEach(m => m.dispose());
    this.root.dispose();
  }
}
