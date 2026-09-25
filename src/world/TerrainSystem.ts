import {
  Scene,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  Mesh,
  TransformNode
} from '@babylonjs/core';
import { createProceduralSandstoneTexture } from '../utils/helpers';

export class TerrainSystem {
  private terrainMeshes: Mesh[] = [];
  private root: TransformNode;

  constructor(public scene: Scene) {
    this.root = new TransformNode('TerrainRoot', scene);
  }

  public buildTerrain(locationId: string, radius = 90): void {
    this.clear();
    const scene = this.scene;

    switch (locationId) {
      case 'kingdom_gate':
        this.buildKingdomGateTerrain(radius);
        break;
      case 'royal_market':
        this.buildRoyalMarketTerrain(radius);
        break;
      case 'temple_district':
        this.buildTempleDistrictTerrain(radius);
        break;
      case 'sacred_forest':
        this.buildSacredForestTerrain(radius);
        break;
      case 'ancient_cave':
        this.buildAncientCaveTerrain(radius);
        break;
      case 'royal_palace':
        this.buildRoyalPalaceTerrain(radius);
        break;
      case 'sun_temple':
        this.buildSunTempleTerrain(radius);
        break;
      default:
        this.buildKingdomGateTerrain(radius);
    }
  }

  private buildKingdomGateTerrain(radius: number): void {
    const scene = this.scene;
    // Desert Sand & Crag Ground
    const groundMat = new StandardMaterial('mat_gate_ground', scene);
    groundMat.diffuseTexture = createProceduralSandstoneTexture(scene, '#a5793e', '#754f24');
    (groundMat.diffuseTexture as any).uScale = 18;
    (groundMat.diffuseTexture as any).vScale = 18;

    const ground = MeshBuilder.CreateGround('Gate_Ground', { width: radius * 2, height: radius * 2, subdivisions: 32 }, scene);
    ground.material = groundMat;
    ground.parent = this.root;
    ground.checkCollisions = true;
    this.terrainMeshes.push(ground);

    // Ancient Sandstone Paved Road down center (Z: -60 to +60)
    const roadMat = new StandardMaterial('mat_gate_road', scene);
    roadMat.diffuseTexture = createProceduralSandstoneTexture(scene, '#cf9c58', '#4d3012');
    (roadMat.diffuseTexture as any).uScale = 4;
    (roadMat.diffuseTexture as any).vScale = 24;

    const road = MeshBuilder.CreateBox('Gate_Road', { width: 14, height: 0.15, depth: radius * 2 - 10 }, scene);
    road.material = roadMat;
    road.position.y = 0.08;
    road.parent = this.root;
    road.checkCollisions = true;
    this.terrainMeshes.push(road);

    // Flanking stone curbs
    for (const sign of [-1, 1]) {
      const curb = MeshBuilder.CreateBox(`Gate_Curb_${sign}`, { width: 0.8, height: 0.35, depth: radius * 2 - 10 }, scene);
      curb.material = roadMat;
      curb.position.set(sign * 7.4, 0.18, 0);
      curb.parent = this.root;
      this.terrainMeshes.push(curb);
    }
  }

  private buildRoyalMarketTerrain(radius: number): void {
    const scene = this.scene;
    const groundMat = new StandardMaterial('mat_market_ground', scene);
    groundMat.diffuseTexture = createProceduralSandstoneTexture(scene, '#b8864b', '#6b461f');
    (groundMat.diffuseTexture as any).uScale = 22;
    (groundMat.diffuseTexture as any).vScale = 22;

    const ground = MeshBuilder.CreateGround('Market_Ground', { width: radius * 2, height: radius * 2, subdivisions: 24 }, scene);
    ground.material = groundMat;
    ground.parent = this.root;
    ground.checkCollisions = true;
    this.terrainMeshes.push(ground);

    // Grand Bazaar Circular Central Plaza
    const plazaMat = new StandardMaterial('mat_market_plaza', scene);
    plazaMat.diffuseTexture = createProceduralSandstoneTexture(scene, '#e0ab67', '#8a5c27');
    (plazaMat.diffuseTexture as any).uScale = 6;
    (plazaMat.diffuseTexture as any).vScale = 6;

    const centralPlaza = MeshBuilder.CreateCylinder('Market_Plaza', { diameter: 44, height: 0.25, tessellation: 32 }, scene);
    centralPlaza.material = plazaMat;
    centralPlaza.position.y = 0.12;
    centralPlaza.parent = this.root;
    centralPlaza.checkCollisions = true;
    this.terrainMeshes.push(centralPlaza);
  }

  private buildTempleDistrictTerrain(radius: number): void {
    const scene = this.scene;
    const groundMat = new StandardMaterial('mat_temple_ground', scene);
    groundMat.diffuseTexture = createProceduralSandstoneTexture(scene, '#d1a868', '#523719');
    (groundMat.diffuseTexture as any).uScale = 16;
    (groundMat.diffuseTexture as any).vScale = 16;

    const ground = MeshBuilder.CreateGround('Temple_Ground', { width: radius * 2, height: radius * 2 }, scene);
    ground.material = groundMat;
    ground.parent = this.root;
    ground.checkCollisions = true;
    this.terrainMeshes.push(ground);

    // Stepped Ceremonial Courtyard
    const marbleMat = new StandardMaterial('mat_temple_marble', scene);
    marbleMat.diffuseColor = Color3.FromHexString('#f7e6c4');
    marbleMat.specularColor = Color3.FromHexString('#ffffff');

    // Multi-tier stone terrace
    for (let tier = 1; tier <= 3; tier++) {
      const size = 68 - tier * 14;
      const height = 0.45;
      const terrace = MeshBuilder.CreateBox(`Temple_Terrace_${tier}`, { width: size, height, depth: size }, scene);
      terrace.material = marbleMat;
      terrace.position.y = tier * height - height / 2;
      terrace.parent = this.root;
      terrace.checkCollisions = true;
      this.terrainMeshes.push(terrace);
    }
  }

  private buildSacredForestTerrain(radius: number): void {
    const scene = this.scene;
    // Lush moss and rich ancient soil
    const groundMat = new StandardMaterial('mat_forest_ground', scene);
    groundMat.diffuseColor = Color3.FromHexString('#2d4a22');
    groundMat.specularColor = Color3.Black();

    const ground = MeshBuilder.CreateGround('Forest_Ground', { width: radius * 2, height: radius * 2, subdivisions: 32 }, scene);
    ground.material = groundMat;
    ground.parent = this.root;
    ground.checkCollisions = true;
    this.terrainMeshes.push(ground);

    // Sacred Stream bed cutting across forest
    const waterMat = new StandardMaterial('mat_forest_stream', scene);
    waterMat.diffuseColor = Color3.FromHexString('#2980b9');
    waterMat.alpha = 0.85;

    const stream = MeshBuilder.CreateBox('Forest_Stream', { width: 8, height: 0.1, depth: radius * 1.8 }, scene);
    stream.material = waterMat;
    stream.position.set(16, 0.05, 0);
    stream.rotation.y = 0.2;
    stream.parent = this.root;
    this.terrainMeshes.push(stream);
  }

  private buildAncientCaveTerrain(radius: number): void {
    const scene = this.scene;
    const caveMat = new StandardMaterial('mat_cave_rock', scene);
    caveMat.diffuseColor = Color3.FromHexString('#16222b');
    caveMat.specularColor = Color3.FromHexString('#1abc9c');
    caveMat.specularPower = 16;

    const ground = MeshBuilder.CreateGround('Cave_Ground', { width: radius * 2, height: radius * 2 }, scene);
    ground.material = caveMat;
    ground.parent = this.root;
    ground.checkCollisions = true;
    this.terrainMeshes.push(ground);

    // Cave vaulted ceiling
    const ceiling = MeshBuilder.CreateGround('Cave_Ceiling', { width: radius * 2, height: radius * 2 }, scene);
    ceiling.material = caveMat;
    ceiling.position.y = 22;
    ceiling.rotation.x = Math.PI;
    ceiling.parent = this.root;
    this.terrainMeshes.push(ceiling);

    // Cavern rocky ridges & crystal chasms
    for (let i = 0; i < 18; i++) {
      const rock = MeshBuilder.CreateBox(`Cave_Rock_${i}`, {
        width: 3 + Math.random() * 5,
        height: 2 + Math.random() * 6,
        depth: 3 + Math.random() * 5
      }, scene);
      rock.material = caveMat;
      const angle = (i / 18) * Math.PI * 2;
      const dist = 28 + Math.random() * 25;
      rock.position.set(Math.cos(angle) * dist, rock.scaling.y / 2, Math.sin(angle) * dist);
      rock.rotation.y = Math.random() * Math.PI;
      rock.parent = this.root;
      rock.checkCollisions = true;
      this.terrainMeshes.push(rock);
    }
  }

  private buildRoyalPalaceTerrain(radius: number): void {
    const scene = this.scene;
    // Polished Royal Marble & Gilded Inlays
    const palaceMat = new StandardMaterial('mat_palace_floor', scene);
    palaceMat.diffuseColor = Color3.FromHexString('#f5e6cc');
    palaceMat.specularColor = Color3.FromHexString('#ffd700');
    palaceMat.specularPower = 48;

    const ground = MeshBuilder.CreateGround('Palace_Ground', { width: radius * 2, height: radius * 2 }, scene);
    ground.material = palaceMat;
    ground.parent = this.root;
    ground.checkCollisions = true;
    this.terrainMeshes.push(ground);

    // Royal Crimson Carpet to Throne
    const carpetMat = new StandardMaterial('mat_palace_carpet', scene);
    carpetMat.diffuseColor = Color3.FromHexString('#8e1b1b');
    carpetMat.specularColor = Color3.Black();

    const carpet = MeshBuilder.CreateBox('Palace_Carpet', { width: 7, height: 0.1, depth: radius * 1.5 }, scene);
    carpet.material = carpetMat;
    carpet.position.set(0, 0.06, 0);
    carpet.parent = this.root;
    this.terrainMeshes.push(carpet);
  }

  private buildSunTempleTerrain(radius: number): void {
    const scene = this.scene;
    // Monumental Solar Golden Platform
    const sunStoneMat = new StandardMaterial('mat_suntemple_stone', scene);
    sunStoneMat.diffuseColor = Color3.FromHexString('#e09f26');
    sunStoneMat.specularColor = Color3.FromHexString('#ffe599');
    sunStoneMat.specularPower = 64;

    const ground = MeshBuilder.CreateGround('SunTemple_Ground', { width: radius * 2, height: radius * 2 }, scene);
    ground.material = sunStoneMat;
    ground.parent = this.root;
    ground.checkCollisions = true;
    this.terrainMeshes.push(ground);

    // Monumental Raised Concentric Solar Platform
    const goldMat = new StandardMaterial('mat_suntemple_gold', scene);
    goldMat.diffuseColor = Color3.FromHexString('#f1c40f');
    goldMat.emissiveColor = Color3.FromHexString('#5e4802');

    const centralDais = MeshBuilder.CreateCylinder('SunTemple_Dais', { diameter: 48, height: 1.2, tessellation: 48 }, scene);
    centralDais.material = goldMat;
    centralDais.position.set(0, 0.6, 0);
    centralDais.parent = this.root;
    centralDais.checkCollisions = true;
    this.terrainMeshes.push(centralDais);

    // Inner sacred altar ring
    const altarRing = MeshBuilder.CreateTorus('SunTemple_AltarRing', { diameter: 22, thickness: 0.6, tessellation: 36 }, scene);
    altarRing.material = sunStoneMat;
    altarRing.position.set(0, 1.3, 0);
    altarRing.parent = this.root;
    this.terrainMeshes.push(altarRing);
  }

  public clear(): void {
    this.terrainMeshes.forEach(m => m.dispose());
    this.terrainMeshes = [];
  }
}
