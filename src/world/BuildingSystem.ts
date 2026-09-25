import {
  Scene,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  Mesh,
  TransformNode,
  PointLight
} from '@babylonjs/core';
import { createProceduralSandstoneTexture, createCarvedRuneTexture } from '../utils/helpers';

export class BuildingSystem {
  private buildings: Mesh[] = [];
  private lights: PointLight[] = [];
  private root: TransformNode;

  constructor(public scene: Scene) {
    this.root = new TransformNode('BuildingRoot', scene);
  }

  public buildStructures(locationId: string): void {
    this.clear();
    switch (locationId) {
      case 'kingdom_gate':
        this.buildKingdomGateStructures();
        break;
      case 'royal_market':
        this.buildRoyalMarketStructures();
        break;
      case 'temple_district':
        this.buildTempleDistrictStructures();
        break;
      case 'sacred_forest':
        this.buildSacredForestStructures();
        break;
      case 'ancient_cave':
        this.buildAncientCaveStructures();
        break;
      case 'royal_palace':
        this.buildRoyalPalaceStructures();
        break;
      case 'sun_temple':
        this.buildSunTempleStructures();
        break;
    }
  }

  // -----------------------------------------------------------
  // 1. ANCIENT KINGDOM GATE STRUCTURES
  // -----------------------------------------------------------
  private buildKingdomGateStructures(): void {
    const scene = this.scene;
    const stoneMat = new StandardMaterial('mat_bldg_sandstone', scene);
    stoneMat.diffuseTexture = createProceduralSandstoneTexture(scene, '#c49a62', '#754f24');
    (stoneMat.diffuseTexture as any).uScale = 4;
    (stoneMat.diffuseTexture as any).vScale = 8;

    // Colossal Main Gate Arch (Z = 0)
    // Left & Right Towering Bastions
    const bastionL = MeshBuilder.CreateBox('Gate_Bastion_L', { width: 12, height: 26, depth: 16 }, scene);
    bastionL.material = stoneMat;
    bastionL.position.set(-14, 13, 0);
    bastionL.checkCollisions = true;
    bastionL.parent = this.root;
    this.buildings.push(bastionL);

    const bastionR = MeshBuilder.CreateBox('Gate_Bastion_R', { width: 12, height: 26, depth: 16 }, scene);
    bastionR.material = stoneMat;
    bastionR.position.set(14, 13, 0);
    bastionR.checkCollisions = true;
    bastionR.parent = this.root;
    this.buildings.push(bastionR);

    // Archway Lintel Beam spanning above road
    const lintel = MeshBuilder.CreateBox('Gate_Lintel', { width: 40, height: 6, depth: 14 }, scene);
    lintel.material = stoneMat;
    lintel.position.set(0, 23, 0);
    lintel.checkCollisions = true;
    lintel.parent = this.root;
    this.buildings.push(lintel);

    // Flanking Fortress Walls running East and West
    for (let i = 1; i <= 3; i++) {
      const wallL = MeshBuilder.CreateBox(`Gate_Wall_L_${i}`, { width: 16, height: 16, depth: 8 }, scene);
      wallL.material = stoneMat;
      wallL.position.set(-20 - i * 16, 8, 0);
      wallL.checkCollisions = true;
      wallL.parent = this.root;
      this.buildings.push(wallL);

      const wallR = MeshBuilder.CreateBox(`Gate_Wall_R_${i}`, { width: 16, height: 16, depth: 8 }, scene);
      wallR.material = stoneMat;
      wallR.position.set(20 + i * 16, 8, 0);
      wallR.checkCollisions = true;
      wallR.parent = this.root;
      this.buildings.push(wallR);
    }

    // Carved Vedic Lions flanking the avenue
    this.createCarvedPillar(new Vector3(-6, 0, -25));
    this.createCarvedPillar(new Vector3(6, 0, -25));
    this.createCarvedPillar(new Vector3(-6, 0, 25));
    this.createCarvedPillar(new Vector3(6, 0, 25));
  }

  // -----------------------------------------------------------
  // 2. ROYAL MARKET STRUCTURES
  // -----------------------------------------------------------
  private buildRoyalMarketStructures(): void {
    const scene = this.scene;
    const stoneMat = new StandardMaterial('mat_market_shop', scene);
    stoneMat.diffuseTexture = createProceduralSandstoneTexture(scene, '#b8864b', '#5c3818');

    const woodMat = new StandardMaterial('mat_market_wood', scene);
    woodMat.diffuseColor = Color3.FromHexString('#5d4037');

    const clothMat = new StandardMaterial('mat_market_cloth', scene);
    clothMat.diffuseColor = Color3.FromHexString('#d35400');

    // Merchant Stalls along market perimeter
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 28;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Stall base
      const stall = MeshBuilder.CreateBox(`Stall_Base_${i}`, { width: 5.5, height: 1.2, depth: 3.5 }, scene);
      stall.material = stoneMat;
      stall.position.set(x, 0.6, z);
      stall.rotation.y = -angle + Math.PI / 2;
      stall.checkCollisions = true;
      stall.parent = this.root;
      this.buildings.push(stall);

      // Wooden awning posts
      const canopy = MeshBuilder.CreateBox(`Stall_Canopy_${i}`, { width: 6.2, height: 0.2, depth: 4.2 }, scene);
      canopy.material = clothMat;
      canopy.position.set(x, 3.2, z);
      canopy.rotation.y = -angle + Math.PI / 2;
      canopy.parent = this.root;
      this.buildings.push(canopy);

      // Clay Amphorae / Pots around stall
      const pot = MeshBuilder.CreateCylinder(`Stall_Pot_${i}`, { diameter: 0.7, height: 1.1, tessellation: 12 }, scene);
      pot.material = clothMat;
      pot.position.set(x + 2.2, 0.55, z);
      pot.parent = this.root;
      this.buildings.push(pot);
    }

    // Central Ancient Well
    const well = MeshBuilder.CreateCylinder('Market_Well', { diameter: 5.5, height: 1.4, tessellation: 24 }, scene);
    well.material = stoneMat;
    well.position.set(0, 0.7, 0);
    well.checkCollisions = true;
    well.parent = this.root;
    this.buildings.push(well);
  }

  // -----------------------------------------------------------
  // 3. TEMPLE DISTRICT STRUCTURES
  // -----------------------------------------------------------
  private buildTempleDistrictStructures(): void {
    const scene = this.scene;
    const templeMat = new StandardMaterial('mat_temple_shikhara', scene);
    templeMat.diffuseTexture = createProceduralSandstoneTexture(scene, '#d4ac0d', '#573d09');
    (templeMat.diffuseTexture as any).uScale = 4;
    (templeMat.diffuseTexture as any).vScale = 8;

    // Grand Shikhara (Main Temple Tower at center North Z=38)
    const towerBase = MeshBuilder.CreateBox('Temple_Tower_Base', { width: 22, height: 18, depth: 22 }, scene);
    towerBase.material = templeMat;
    towerBase.position.set(0, 9, 38);
    towerBase.checkCollisions = true;
    towerBase.parent = this.root;
    this.buildings.push(towerBase);

    // Pyramidal Shikhara Spire
    const towerSpire = MeshBuilder.CreateCylinder('Temple_Spire', {
      diameterTop: 3,
      diameterBottom: 20,
      height: 32,
      tessellation: 4
    }, scene);
    towerSpire.material = templeMat;
    towerSpire.position.set(0, 34, 38);
    towerSpire.rotation.y = Math.PI / 4;
    towerSpire.parent = this.root;
    this.buildings.push(towerSpire);

    // Symmetrical Colonnade of Sacred Pillars
    for (let x of [-16, 16]) {
      for (let z = -20; z <= 20; z += 10) {
        this.createCarvedPillar(new Vector3(x, 0, z), 8.5);
      }
    }
  }

  // -----------------------------------------------------------
  // 4. SACRED FOREST STRUCTURES
  // -----------------------------------------------------------
  private buildSacredForestStructures(): void {
    const scene = this.scene;
    const woodMat = new StandardMaterial('mat_tree_trunk', scene);
    woodMat.diffuseColor = Color3.FromHexString('#3e2723');

    const foliageMat = new StandardMaterial('mat_tree_foliage', scene);
    foliageMat.diffuseColor = Color3.FromHexString('#229954');

    // Ancient Giant Banyan & Sal Trees
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2 + (Math.random() * 0.3);
      const dist = 18 + Math.random() * 32;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      // Don't spawn right on spawn or path
      if (Math.abs(x) < 8 && Math.abs(z) < 8) continue;

      const trunkHeight = 10 + Math.random() * 6;
      const trunk = MeshBuilder.CreateCylinder(`Tree_Trunk_${i}`, {
        diameterTop: 1.2,
        diameterBottom: 2.2,
        height: trunkHeight,
        tessellation: 8
      }, scene);
      trunk.material = woodMat;
      trunk.position.set(x, trunkHeight / 2, z);
      trunk.checkCollisions = true;
      trunk.parent = this.root;
      this.buildings.push(trunk);

      // Lush leafy canopy
      const canopy = MeshBuilder.CreateSphere(`Tree_Canopy_${i}`, {
        diameterX: 10 + Math.random() * 5,
        diameterY: 6 + Math.random() * 3,
        diameterZ: 10 + Math.random() * 5
      }, scene);
      canopy.material = foliageMat;
      canopy.position.set(x, trunkHeight + 2, z);
      canopy.parent = this.root;
      this.buildings.push(canopy);
    }
  }

  // -----------------------------------------------------------
  // 5. ANCIENT CAVE STRUCTURES
  // -----------------------------------------------------------
  private buildAncientCaveStructures(): void {
    const scene = this.scene;
    // Glowing Turquoise & Amber Crystals
    const cyanCrystalMat = new StandardMaterial('mat_crystal_cyan', scene);
    cyanCrystalMat.diffuseColor = Color3.FromHexString('#1abc9c');
    cyanCrystalMat.emissiveColor = Color3.FromHexString('#16a085');

    const amberCrystalMat = new StandardMaterial('mat_crystal_amber', scene);
    amberCrystalMat.diffuseColor = Color3.FromHexString('#f39c12');
    amberCrystalMat.emissiveColor = Color3.FromHexString('#d35400');

    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const dist = 22 + Math.random() * 18;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      const isCyan = i % 2 === 0;
      const crystal = MeshBuilder.CreateCylinder(`Cave_Crystal_${i}`, {
        diameterTop: 0,
        diameterBottom: 1.4,
        height: 4 + Math.random() * 3,
        tessellation: 6
      }, scene);
      crystal.material = isCyan ? cyanCrystalMat : amberCrystalMat;
      crystal.position.set(x, 2, z);
      crystal.rotation.set(Math.random() * 0.3, Math.random() * Math.PI, Math.random() * 0.3);
      crystal.parent = this.root;
      this.buildings.push(crystal);

      // Add soft point light to prominent crystals
      if (i % 4 === 0) {
        const light = new PointLight(`Crystal_Light_${i}`, new Vector3(x, 3.5, z), scene);
        light.diffuse = isCyan ? Color3.FromHexString('#1abc9c') : Color3.FromHexString('#f39c12');
        light.intensity = 1.2;
        light.range = 14;
        this.lights.push(light);
      }
    }
  }

  // -----------------------------------------------------------
  // 6. ROYAL PALACE STRUCTURES
  // -----------------------------------------------------------
  private buildRoyalPalaceStructures(): void {
    const scene = this.scene;
    const marbleMat = new StandardMaterial('mat_palace_marble', scene);
    marbleMat.diffuseColor = Color3.FromHexString('#fdf6e2');
    marbleMat.specularColor = Color3.FromHexString('#ffd700');

    const goldMat = new StandardMaterial('mat_palace_gold', scene);
    goldMat.diffuseColor = Color3.FromHexString('#f1c40f');

    // Colonnade of Grand Royal Marble Columns along North-South axis
    for (let x of [-15, 15]) {
      for (let z = -35; z <= 35; z += 12) {
        this.createCarvedPillar(new Vector3(x, 0, z), 12, 1.8);
      }
    }

    // Throne Dais of King Harsha at Z = 42
    const dais = MeshBuilder.CreateBox('Throne_Dais', { width: 14, height: 1.8, depth: 10 }, scene);
    dais.material = marbleMat;
    dais.position.set(0, 0.9, 42);
    dais.checkCollisions = true;
    dais.parent = this.root;
    this.buildings.push(dais);

    // Carved Royal Throne Chair
    const throneBack = MeshBuilder.CreateBox('Throne_Back', { width: 3.5, height: 5.5, depth: 0.8 }, scene);
    throneBack.material = goldMat;
    throneBack.position.set(0, 4.5, 45);
    throneBack.parent = this.root;
    this.buildings.push(throneBack);

    const throneSeat = MeshBuilder.CreateBox('Throne_Seat', { width: 3.5, height: 1.2, depth: 2.2 }, scene);
    throneSeat.material = goldMat;
    throneSeat.position.set(0, 2.4, 44);
    throneSeat.parent = this.root;
    this.buildings.push(throneSeat);
  }

  // -----------------------------------------------------------
  // 7. SUN TEMPLE STRUCTURES
  // -----------------------------------------------------------
  private buildSunTempleStructures(): void {
    const scene = this.scene;
    const goldMat = new StandardMaterial('mat_sun_gold', scene);
    goldMat.diffuseColor = Color3.FromHexString('#f39c12');
    goldMat.emissiveColor = Color3.FromHexString('#7d5604');

    // Giant 8 Outer Solar Pillars surrounding the Altar
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = Math.cos(angle) * 32;
      const z = Math.sin(angle) * 32;
      this.createCarvedPillar(new Vector3(x, 0, z), 16, 2.2);
    }

    // Central Radiant Solar Pedestal at origin (0, 0, 0)
    const pedestal = MeshBuilder.CreateCylinder('Altar_Pedestal', { diameter: 4.5, height: 2.5, tessellation: 24 }, scene);
    pedestal.material = goldMat;
    pedestal.position.set(0, 1.85, 0);
    pedestal.checkCollisions = true;
    pedestal.parent = this.root;
    this.buildings.push(pedestal);
  }

  public createCarvedPillar(pos: Vector3, height = 7, diameter = 1.2): Mesh {
    const scene = this.scene;
    const mat = new StandardMaterial(`pillar_${pos.x}_${pos.z}`, scene);
    mat.diffuseTexture = createProceduralSandstoneTexture(scene, '#cf9c58', '#633e14');

    const column = MeshBuilder.CreateCylinder(`Column_${pos.x}_${pos.z}`, {
      diameter,
      height,
      tessellation: 16
    }, scene);
    column.material = mat;
    column.position.set(pos.x, height / 2, pos.z);
    column.checkCollisions = true;
    column.parent = this.root;
    this.buildings.push(column);

    // Lotus Capital on top
    const capital = MeshBuilder.CreateBox(`Capital_${pos.x}_${pos.z}`, {
      width: diameter * 1.5,
      height: 0.6,
      depth: diameter * 1.5
    }, scene);
    capital.material = mat;
    capital.position.set(pos.x, height + 0.3, pos.z);
    capital.parent = this.root;
    this.buildings.push(capital);

    return column;
  }

  public clear(): void {
    this.buildings.forEach(b => b.dispose());
    this.buildings = [];
    this.lights.forEach(l => l.dispose());
    this.lights = [];
  }
}
