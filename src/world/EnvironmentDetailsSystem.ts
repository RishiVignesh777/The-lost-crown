import {
  Scene,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  Mesh,
  TransformNode,
  PointLight,
  DynamicTexture
} from '@babylonjs/core';
import { InteractionSystem } from '../gameplay/InteractionSystem';
import { playSound, createProceduralSandstoneTexture } from '../utils/helpers';
import { AUDIO_PATHS } from '../utils/constants';

export class EnvironmentDetailsSystem {
  private detailMeshes: Mesh[] = [];
  private detailLights: PointLight[] = [];
  private root: TransformNode;

  constructor(public scene: Scene) {
    this.root = new TransformNode('EnvDetailsRoot', scene);
  }

  public buildLocationDetails(
    locationId: string,
    interaction: InteractionSystem,
    onReadChronicle: (key: string, title: string) => void
  ): void {
    this.clear();

    switch (locationId) {
      case 'kingdom_gate':
        this.buildKingdomGateDetails(interaction, onReadChronicle);
        break;
      case 'royal_market':
        this.buildRoyalMarketDetails(interaction, onReadChronicle);
        break;
      case 'temple_district':
        this.buildTempleDistrictDetails(interaction, onReadChronicle);
        break;
      case 'sacred_forest':
        this.buildSacredForestDetails(interaction, onReadChronicle);
        break;
      case 'ancient_cave':
        this.buildAncientCaveDetails(interaction, onReadChronicle);
        break;
      case 'royal_palace':
        this.buildRoyalPalaceDetails(interaction, onReadChronicle);
        break;
      case 'sun_temple':
        this.buildSunTempleDetails(interaction, onReadChronicle);
        break;
    }
  }

  // -------------------------------------------------------------------------
  // 1. KINGDOM GATE DETAILS: Desert Palms, Agave Shrubs, Chariot & Chronicle I
  // -------------------------------------------------------------------------
  private buildKingdomGateDetails(
    interaction: InteractionSystem,
    onReadChronicle: (key: string, title: string) => void
  ): void {
    // Ancient desert palms along the road approach
    const palmPositions = [
      new Vector3(-12, 0, -35),
      new Vector3(12, 0, -35),
      new Vector3(-14, 0, -15),
      new Vector3(14, 0, -15),
      new Vector3(-15, 0, 15),
      new Vector3(15, 0, 15),
      new Vector3(-12, 0, 35),
      new Vector3(12, 0, 35)
    ];
    palmPositions.forEach((pos, idx) => {
      this.createDesertPalm(pos, 0.9 + (idx % 3) * 0.15, idx * 0.7);
    });

    // Desert shrubs and thorny succulents scattered along dunes
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const dist = 18 + (i % 5) * 6;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      if (Math.abs(x) < 8) continue; // Don't block road
      this.createDesertSucculent(new Vector3(x, 0, z), 0.8 + (i % 3) * 0.3);
    }

    // Incense Braziers flanking the Great Bastions
    const brazierPositions = [
      new Vector3(-6, 0, -10),
      new Vector3(6, 0, -10),
      new Vector3(-6, 0, 10),
      new Vector3(6, 0, 10)
    ];
    brazierPositions.forEach(pos => this.createIncenseBrazier(pos, '#ff9900'));

    // Broken Royal War Chariot half-swallowed by sand dunes
    this.createBrokenChariot(
      new Vector3(-9, 0, -30),
      0.4,
      interaction,
      () => onReadChronicle('inspect_chariot', 'Shattered Royal Chariot')
    );

    // Prayer Flags between the Twin Bastions
    this.createPrayerFlags(new Vector3(-14, 18, 0), new Vector3(14, 18, 0));

    // Story Stele: Chronicle I
    this.createLoreStele(
      'stele_gate',
      new Vector3(-9, 0, -18),
      'chronicle_1_gate',
      'Chronicle I: The Shattered Bastion',
      interaction,
      onReadChronicle
    );
  }

  // -------------------------------------------------------------------------
  // 2. ROYAL MARKET DETAILS: Date Palms, Spice Baskets, Urns & Chronicle II
  // -------------------------------------------------------------------------
  private buildRoyalMarketDetails(
    interaction: InteractionSystem,
    onReadChronicle: (key: string, title: string) => void
  ): void {
    // Palms shading the market perimeter and central well
    this.createDesertPalm(new Vector3(-5, 0, 6), 1.1, 0.2);
    this.createDesertPalm(new Vector3(6, 0, 5), 1.0, 1.4);
    this.createDesertPalm(new Vector3(0, 0, -7), 0.9, 2.5);

    // Flowering desert planters around bazaar stalls
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = Math.cos(angle) * 22;
      const z = Math.sin(angle) * 22;
      this.createFloweringLotusBush(new Vector3(x, 0, z), i % 2 === 0 ? '#f39c12' : '#e74c3c');
    }

    // Incense Braziers illuminating the central plaza
    this.createIncenseBrazier(new Vector3(-4, 0, -4), '#ffaa33');
    this.createIncenseBrazier(new Vector3(4, 0, -4), '#ffaa33');
    this.createIncenseBrazier(new Vector3(-4, 0, 4), '#ffaa33');
    this.createIncenseBrazier(new Vector3(4, 0, 4), '#ffaa33');

    // Ancient Inscription Stele: Chronicle II
    this.createLoreStele(
      'stele_market',
      new Vector3(-8, 0, -2),
      'chronicle_2_market',
      'Chronicle II: The Gilded Bazaar',
      interaction,
      onReadChronicle
    );
  }

  // -------------------------------------------------------------------------
  // 3. TEMPLE DISTRICT DETAILS: Sacred Lotus Pond, Shikhara Cypresses & Chronicle III
  // -------------------------------------------------------------------------
  private buildTempleDistrictDetails(
    interaction: InteractionSystem,
    onReadChronicle: (key: string, title: string) => void
  ): void {
    // Sacred Lotus Pond in the ceremonial courtyard (West side)
    this.createSacredLotusPond(
      new Vector3(-14, 0, -6),
      4.2,
      interaction,
      () => onReadChronicle('inspect_lotus_pond', 'Sacred Lotus Pond of Suryagarh')
    );

    // Weathered colossal statue of King Harsha on East side
    this.createKingStatue(
      new Vector3(14, 0, -6),
      -Math.PI / 4,
      interaction,
      () => onReadChronicle('inspect_statue', 'Monument of King Harsha')
    );

    // Temple Cypress Trees lining the sacred colonnade
    for (let z of [-18, -6, 6, 18]) {
      this.createCeremonialPalaceCypress(new Vector3(-12, 0, z), 1.0);
      this.createCeremonialPalaceCypress(new Vector3(12, 0, z), 1.0);
    }

    // Sacred Incense Altars flanking the main Shikhara steps
    this.createIncenseBrazier(new Vector3(-5, 1.2, 24), '#ffd700');
    this.createIncenseBrazier(new Vector3(5, 1.2, 24), '#ffd700');

    // Prayer Flags strung across the high temple colonnade
    this.createPrayerFlags(new Vector3(-16, 8, 10), new Vector3(16, 8, 10));

    // Story Stele: Chronicle III
    this.createLoreStele(
      'stele_temple',
      new Vector3(0, 0, -14),
      'chronicle_3_temple',
      'Chronicle III: The Priests of the Noon Day',
      interaction,
      onReadChronicle
    );
  }

  // -------------------------------------------------------------------------
  // 4. SACRED FOREST DETAILS: Ancient Banyan Groves, Lotus Bushes & Chronicle IV
  // -------------------------------------------------------------------------
  private buildSacredForestDetails(
    interaction: InteractionSystem,
    onReadChronicle: (key: string, title: string) => void
  ): void {
    // Additional towering Ancient Banyan Trees with sprawling aerial roots
    const banyanPositions = [
      new Vector3(-18, 0, -22),
      new Vector3(20, 0, -20),
      new Vector3(-24, 0, 8),
      new Vector3(22, 0, 24),
      new Vector3(-14, 0, 28)
    ];
    banyanPositions.forEach((pos, idx) => {
      this.createAncientBanyan(pos, 1.2 + (idx % 2) * 0.3);
    });

    // Flowering sacred wild lotus bushes along stream edges
    for (let i = 0; i < 16; i++) {
      const z = -35 + i * 5;
      const xOffset = Math.sin(i * 0.8) * 4;
      this.createFloweringLotusBush(
        new Vector3(16 + xOffset, 0, z),
        i % 3 === 0 ? '#ff69b4' : i % 3 === 1 ? '#ffd700' : '#1abc9c'
      );
    }

    // Sacred Ferns & Undergrowth patches
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const dist = 14 + (i % 4) * 5;
      this.createDesertSucculent(new Vector3(Math.cos(angle) * dist, 0, Math.sin(angle) * dist), 1.1);
    }

    // Forest Stone Lanterns
    this.createIncenseBrazier(new Vector3(-2, 0, -8), '#2ecc71');
    this.createIncenseBrazier(new Vector3(2, 0, 20), '#2ecc71');

    // Story Stele: Chronicle IV
    this.createLoreStele(
      'stele_forest',
      new Vector3(-5, 0, 4),
      'chronicle_4_forest',
      'Chronicle IV: The Heart of the Banyan',
      interaction,
      onReadChronicle
    );
  }

  // -------------------------------------------------------------------------
  // 5. ANCIENT CAVE DETAILS: Bioluminescent Fungi, Stalagmites & Chronicle V
  // -------------------------------------------------------------------------
  private buildAncientCaveDetails(
    interaction: InteractionSystem,
    onReadChronicle: (key: string, title: string) => void
  ): void {
    // Bioluminescent mushroom patches glowing in cyan and amethyst
    const mushroomPositions = [
      new Vector3(-8, 0, -12),
      new Vector3(10, 0, -10),
      new Vector3(-15, 0, 10),
      new Vector3(14, 0, 16),
      new Vector3(-6, 0, 22),
      new Vector3(8, 0, -26)
    ];
    mushroomPositions.forEach((pos, idx) => {
      this.createBioluminescentMushrooms(pos, idx % 2 === 0 ? '#1abc9c' : '#9b59b6');
    });

    // Stalagmites rising from ground
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const dist = 20 + (i % 3) * 6;
      this.createStalagmite(new Vector3(Math.cos(angle) * dist, 0, Math.sin(angle) * dist));
    }

    // Cave Braziers with pale cyan fire
    this.createIncenseBrazier(new Vector3(-4, 0, 0), '#16a085');
    this.createIncenseBrazier(new Vector3(4, 0, 0), '#16a085');

    // Story Stele: Chronicle V
    this.createLoreStele(
      'stele_cave',
      new Vector3(-7, 0, 6),
      'chronicle_5_cave',
      'Chronicle V: The Crystal Lament',
      interaction,
      onReadChronicle
    );
  }

  // -------------------------------------------------------------------------
  // 6. ROYAL PALACE DETAILS: Marble Planters, Royal Banners & Chronicle VI
  // -------------------------------------------------------------------------
  private buildRoyalPalaceDetails(
    interaction: InteractionSystem,
    onReadChronicle: (key: string, title: string) => void
  ): void {
    // Marble urns with stately cypress trees along the red carpet
    for (let z of [-28, -14, 0, 14, 28]) {
      this.createCeremonialPalaceCypress(new Vector3(-8, 0, z), 1.2);
      this.createCeremonialPalaceCypress(new Vector3(8, 0, z), 1.2);
    }

    // Golden lion braziers flanking the throne dais
    this.createIncenseBrazier(new Vector3(-6, 0.9, 38), '#ffd700');
    this.createIncenseBrazier(new Vector3(6, 0.9, 38), '#ffd700');
    this.createIncenseBrazier(new Vector3(-3, 1.8, 44), '#f39c12');
    this.createIncenseBrazier(new Vector3(3, 1.8, 44), '#f39c12');

    // Royal Silk Banners hanging in the colonnade
    for (let z of [-20, 0, 20]) {
      this.createRoyalSilkBanner(new Vector3(-14.5, 9, z));
      this.createRoyalSilkBanner(new Vector3(14.5, 9, z));
    }

    // Story Stele: Chronicle VI
    this.createLoreStele(
      'stele_palace',
      new Vector3(-5, 0, 26),
      'chronicle_6_palace',
      'Chronicle VI: Harsha’s Final Stand',
      interaction,
      onReadChronicle
    );
  }

  // -------------------------------------------------------------------------
  // 7. SUN TEMPLE DETAILS: Solar Mandalas, Celestial Urns & Chronicle VII
  // -------------------------------------------------------------------------
  private buildSunTempleDetails(
    interaction: InteractionSystem,
    onReadChronicle: (key: string, title: string) => void
  ): void {
    // 8 Golden Solar Flame Braziers encircling the altar ring
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = Math.cos(angle) * 16;
      const z = Math.sin(angle) * 16;
      this.createIncenseBrazier(new Vector3(x, 1.2, z), '#f5c542');
    }

    // Ceremonial Cypress Trees surrounding outer sanctum
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const x = Math.cos(angle) * 36;
      const z = Math.sin(angle) * 36;
      this.createCeremonialPalaceCypress(new Vector3(x, 0, z), 1.4);
    }

    // Sacred Lotus Bushes around the outer solar boundary
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 + 0.3;
      const x = Math.cos(angle) * 26;
      const z = Math.sin(angle) * 26;
      this.createFloweringLotusBush(new Vector3(x, 0, z), '#f1c40f');
    }

    // Story Stele: Chronicle VII
    this.createLoreStele(
      'stele_suntemple',
      new Vector3(0, 1.2, -12),
      'chronicle_7_suntemple',
      'Chronicle VII: The Awakening of Dawn',
      interaction,
      onReadChronicle
    );
  }

  // =========================================================================
  // BUILDER PRIMITIVES: PROCEDURAL 3D MESH GENERATORS
  // =========================================================================

  public createDesertPalm(pos: Vector3, scale = 1.0, rotY = 0): Mesh {
    const scene = this.scene;
    const root = MeshBuilder.CreateBox(`PalmRoot_${pos.x}_${pos.z}`, { size: 0.1 }, scene);
    root.position.copyFrom(pos);
    root.parent = this.root;
    this.detailMeshes.push(root);

    const trunkMat = new StandardMaterial('mat_palm_trunk', scene);
    trunkMat.diffuseColor = Color3.FromHexString('#8d6e63');

    const frondMat = new StandardMaterial('mat_palm_frond', scene);
    frondMat.diffuseColor = Color3.FromHexString('#388e3c');

    const height = 9 * scale;
    // Curved segmented trunk
    const trunk = MeshBuilder.CreateCylinder('Palm_Trunk', {
      diameterTop: 0.8 * scale,
      diameterBottom: 1.4 * scale,
      height,
      tessellation: 8
    }, scene);
    trunk.position.set(0, height / 2, 0);
    trunk.rotation.z = 0.08;
    trunk.material = trunkMat;
    trunk.parent = root;
    trunk.checkCollisions = true;

    // Palm Crown: 8 arching fronds
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + rotY;
      const frond = MeshBuilder.CreateBox(`Palm_Frond_${i}`, {
        width: 1.2 * scale,
        height: 0.15,
        depth: 5.5 * scale
      }, scene);
      frond.material = frondMat;
      frond.position.set(Math.sin(angle) * 2.2 * scale, height - 0.2, Math.cos(angle) * 2.2 * scale);
      frond.rotation.y = angle;
      frond.rotation.x = 0.45; // Droop downward
      frond.parent = root;
    }

    return root;
  }

  public createDesertSucculent(pos: Vector3, scale = 1.0): Mesh {
    const scene = this.scene;
    const root = MeshBuilder.CreateBox(`SucculentRoot_${pos.x}_${pos.z}`, { size: 0.1 }, scene);
    root.position.copyFrom(pos);
    root.parent = this.root;
    this.detailMeshes.push(root);

    const mat = new StandardMaterial('mat_succulent', scene);
    mat.diffuseColor = Color3.FromHexString('#558b2f');

    // Rosette of 6 spiky agave leaves
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const blade = MeshBuilder.CreateCylinder(`Agave_Blade_${i}`, {
        diameterTop: 0,
        diameterBottom: 0.7 * scale,
        height: 2.2 * scale,
        tessellation: 4
      }, scene);
      blade.material = mat;
      blade.position.set(Math.sin(angle) * 0.6 * scale, 0.7 * scale, Math.cos(angle) * 0.6 * scale);
      blade.rotation.x = 0.6;
      blade.rotation.y = angle;
      blade.parent = root;
    }

    // Solid collision barrier
    const succCol = MeshBuilder.CreateCylinder('Succulent_Collider', {
      diameter: 1.8 * scale,
      height: 2.0 * scale
    }, scene);
    succCol.position.y = 1.0 * scale;
    succCol.isVisible = false;
    succCol.checkCollisions = true;
    succCol.parent = root;

    return root;
  }

  public createAncientBanyan(pos: Vector3, scale = 1.0): Mesh {
    const scene = this.scene;
    const root = MeshBuilder.CreateBox(`BanyanRoot_${pos.x}_${pos.z}`, { size: 0.1 }, scene);
    root.position.copyFrom(pos);
    root.parent = this.root;
    this.detailMeshes.push(root);

    const woodMat = new StandardMaterial('mat_banyan_wood', scene);
    woodMat.diffuseColor = Color3.FromHexString('#4e342e');

    const foliageMat = new StandardMaterial('mat_banyan_foliage', scene);
    foliageMat.diffuseColor = Color3.FromHexString('#1b5e20');

    const height = 12 * scale;
    const trunk = MeshBuilder.CreateCylinder('Banyan_Trunk', {
      diameterTop: 2.5 * scale,
      diameterBottom: 4.0 * scale,
      height,
      tessellation: 10
    }, scene);
    trunk.position.set(0, height / 2, 0);
    trunk.material = woodMat;
    trunk.parent = root;
    trunk.checkCollisions = true;

    // Aerial roots dropping down
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const rootPillar = MeshBuilder.CreateCylinder(`Aerial_Root_${i}`, {
        diameter: 0.5 * scale,
        height: height * 0.8
      }, scene);
      rootPillar.position.set(Math.cos(angle) * 3.2 * scale, (height * 0.8) / 2, Math.sin(angle) * 3.2 * scale);
      rootPillar.material = woodMat;
      rootPillar.parent = root;
    }

    // Dense Canopy
    const canopy = MeshBuilder.CreateSphere('Banyan_Canopy', {
      diameterX: 14 * scale,
      diameterY: 7 * scale,
      diameterZ: 14 * scale
    }, scene);
    canopy.position.set(0, height + 1.5, 0);
    canopy.material = foliageMat;
    canopy.parent = root;

    return root;
  }

  public createFloweringLotusBush(pos: Vector3, flowerColor = '#f39c12'): Mesh {
    const scene = this.scene;
    const root = MeshBuilder.CreateBox(`LotusBush_${pos.x}_${pos.z}`, { size: 0.1 }, scene);
    root.position.copyFrom(pos);
    root.parent = this.root;
    this.detailMeshes.push(root);

    const bushMat = new StandardMaterial('mat_bush_leaf', scene);
    bushMat.diffuseColor = Color3.FromHexString('#2e7d32');

    const flowerMat = new StandardMaterial(`mat_flower_${flowerColor}`, scene);
    flowerMat.diffuseColor = Color3.FromHexString(flowerColor);
    flowerMat.emissiveColor = Color3.FromHexString(flowerColor).scale(0.3);

    // Green rounded bush
    const foliage = MeshBuilder.CreateSphere('Bush_Foliage', { diameter: 2.2 }, scene);
    foliage.position.set(0, 0.9, 0);
    foliage.material = bushMat;
    foliage.checkCollisions = true;
    foliage.parent = root;

    // Blooming flowers scattered on bush
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const flower = MeshBuilder.CreateSphere(`Lotus_Blossom_${i}`, { diameter: 0.4 }, scene);
      flower.position.set(Math.cos(angle) * 0.9, 1.2 + (i % 2) * 0.3, Math.sin(angle) * 0.9);
      flower.material = flowerMat;
      flower.parent = root;
    }
    return root;
  }

  public createSacredLotusPond(
    pos: Vector3,
    radius = 4.0,
    interaction?: InteractionSystem,
    onInspect?: () => void
  ): Mesh {
    const scene = this.scene;
    const root = MeshBuilder.CreateBox(`LotusPond_${pos.x}_${pos.z}`, { size: 0.1 }, scene);
    root.position.copyFrom(pos);
    root.parent = this.root;
    this.detailMeshes.push(root);

    const stoneMat = new StandardMaterial('mat_pond_rim', scene);
    stoneMat.diffuseColor = Color3.FromHexString('#b8860b');

    const waterMat = new StandardMaterial('mat_pond_water', scene);
    waterMat.diffuseColor = Color3.FromHexString('#0288d1');
    waterMat.specularColor = Color3.White();
    waterMat.alpha = 0.85;

    const padMat = new StandardMaterial('mat_lilypad', scene);
    padMat.diffuseColor = Color3.FromHexString('#2e7d32');

    const lotusMat = new StandardMaterial('mat_pink_lotus', scene);
    lotusMat.diffuseColor = Color3.FromHexString('#ff4081');
    lotusMat.emissiveColor = Color3.FromHexString('#c2185b');

    // Stone Basin Rim
    const rim = MeshBuilder.CreateCylinder('Pond_Rim', {
      diameter: radius * 2,
      height: 0.8,
      tessellation: 32
    }, scene);
    rim.position.y = 0.4;
    rim.material = stoneMat;
    rim.checkCollisions = true;
    rim.parent = root;

    // Solid basin collision cylinder
    const pondCol = MeshBuilder.CreateCylinder('Pond_Collider', {
      diameter: radius * 1.95,
      height: 1.8
    }, scene);
    pondCol.position.y = 0.9;
    pondCol.isVisible = false;
    pondCol.checkCollisions = true;
    pondCol.parent = root;

    // Water surface
    const water = MeshBuilder.CreateCylinder('Pond_Water', {
      diameter: (radius - 0.4) * 2,
      height: 0.1,
      tessellation: 32
    }, scene);
    water.position.y = 0.35;
    water.material = waterMat;
    water.parent = root;

    // Floating Lilypads and Lotus flowers
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const r = (radius * 0.5) * (0.6 + (i % 3) * 0.3);
      const pad = MeshBuilder.CreateCylinder(`Pad_${i}`, { diameter: 0.9, height: 0.04 }, scene);
      pad.position.set(Math.cos(angle) * r, 0.42, Math.sin(angle) * r);
      pad.material = padMat;
      pad.parent = root;

      // Lotus flower on pad
      const flower = MeshBuilder.CreateSphere(`Lotus_${i}`, { diameter: 0.35 }, scene);
      flower.position.set(pad.position.x, 0.52, pad.position.z);
      flower.material = lotusMat;
      flower.parent = root;
    }

    if (interaction && onInspect) {
      interaction.register({
        id: 'inspect_lotus_pond',
        interactionText: 'Examine Sacred Lotus Pond',
        position: pos,
        radius: 4.5,
        interact: () => {
          playSound(AUDIO_PATHS.PUZZLE, 0.5);
          onInspect();
        }
      });
    }

    return root;
  }

  public createBioluminescentMushrooms(pos: Vector3, glowHex = '#1abc9c'): Mesh {
    const scene = this.scene;
    const root = MeshBuilder.CreateBox(`FungiRoot_${pos.x}_${pos.z}`, { size: 0.1 }, scene);
    root.position.copyFrom(pos);
    root.parent = this.root;
    this.detailMeshes.push(root);

    const stemMat = new StandardMaterial('mat_fungi_stem', scene);
    stemMat.diffuseColor = Color3.FromHexString('#eceff1');

    const capMat = new StandardMaterial(`mat_fungi_cap_${glowHex}`, scene);
    capMat.diffuseColor = Color3.FromHexString(glowHex);
    capMat.emissiveColor = Color3.FromHexString(glowHex).scale(0.8);

    // Cluster of 4 glowing mushrooms
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const h = 0.8 + (i % 3) * 0.4;
      const stem = MeshBuilder.CreateCylinder(`Fungi_Stem_${i}`, {
        diameter: 0.15,
        height: h
      }, scene);
      stem.position.set(Math.cos(angle) * 0.6, h / 2, Math.sin(angle) * 0.6);
      stem.material = stemMat;
      stem.parent = root;

      const cap = MeshBuilder.CreateSphere(`Fungi_Cap_${i}`, {
        diameterX: 0.7,
        diameterY: 0.4,
        diameterZ: 0.7
      }, scene);
      cap.position.set(stem.position.x, h + 0.1, stem.position.z);
      cap.material = capMat;
      cap.parent = root;
    }

    // Soft local point light
    const light = new PointLight(`FungiLight_${pos.x}_${pos.z}`, new Vector3(pos.x, 1.2, pos.z), scene);
    light.diffuse = Color3.FromHexString(glowHex);
    light.intensity = 0.8;
    light.range = 8;
    this.detailLights.push(light);

    // Solid collision barrier
    const fungiCol = MeshBuilder.CreateCylinder('Fungi_Collider', {
      diameter: 1.6,
      height: 1.8
    }, scene);
    fungiCol.position.y = 0.9;
    fungiCol.isVisible = false;
    fungiCol.checkCollisions = true;
    fungiCol.parent = root;

    return root;
  }

  public createCeremonialPalaceCypress(pos: Vector3, scale = 1.0): Mesh {
    const scene = this.scene;
    const root = MeshBuilder.CreateBox(`CypressRoot_${pos.x}_${pos.z}`, { size: 0.1 }, scene);
    root.position.copyFrom(pos);
    root.parent = this.root;
    this.detailMeshes.push(root);

    const planterMat = new StandardMaterial('mat_palace_planter', scene);
    planterMat.diffuseColor = Color3.FromHexString('#fdf6e2');
    planterMat.specularColor = Color3.FromHexString('#ffd700');

    const foliageMat = new StandardMaterial('mat_cypress_leaf', scene);
    foliageMat.diffuseColor = Color3.FromHexString('#145a32');

    // Carved Marble Planter Urn
    const planter = MeshBuilder.CreateCylinder('Planter_Urn', {
      diameterTop: 1.4 * scale,
      diameterBottom: 1.0 * scale,
      height: 1.2 * scale,
      tessellation: 12
    }, scene);
    planter.position.y = 0.6 * scale;
    planter.material = planterMat;
    planter.checkCollisions = true;
    planter.parent = root;

    // Conical Slender Cypress Foliage
    const height = 7 * scale;
    const tree = MeshBuilder.CreateCylinder('Cypress_Cone', {
      diameterTop: 0.2,
      diameterBottom: 1.8 * scale,
      height,
      tessellation: 10
    }, scene);
    tree.position.y = 1.2 * scale + height / 2;
    tree.material = foliageMat;
    tree.checkCollisions = true;
    tree.parent = root;

    return root;
  }

  public createIncenseBrazier(pos: Vector3, lightHex = '#ff9900'): Mesh {
    const scene = this.scene;
    const root = MeshBuilder.CreateBox(`Brazier_${pos.x}_${pos.z}`, { size: 0.1 }, scene);
    root.position.copyFrom(pos);
    root.parent = this.root;
    this.detailMeshes.push(root);

    const stoneMat = new StandardMaterial('mat_brazier_stone', scene);
    stoneMat.diffuseColor = Color3.FromHexString('#5c3818');

    const flameMat = new StandardMaterial('mat_brazier_fire', scene);
    flameMat.diffuseColor = Color3.FromHexString('#ff5722');
    flameMat.emissiveColor = Color3.FromHexString('#ff9800');

    // Stone Brazier Stand
    const stand = MeshBuilder.CreateCylinder('Brazier_Stand', {
      diameterTop: 1.1,
      diameterBottom: 1.3,
      height: 1.5,
      tessellation: 12
    }, scene);
    stand.position.y = 0.75;
    stand.material = stoneMat;
    stand.checkCollisions = true;
    stand.parent = root;

    // Glowing Flame Core
    const fire = MeshBuilder.CreateSphere('Brazier_Flame', { diameter: 0.6 }, scene);
    fire.position.y = 1.65;
    fire.material = flameMat;
    fire.parent = root;

    // Flickering Warm Light
    const light = new PointLight(`FireLight_${pos.x}_${pos.z}`, new Vector3(pos.x, 2.2, pos.z), scene);
    light.diffuse = Color3.FromHexString(lightHex);
    light.intensity = 1.1;
    light.range = 10;
    this.detailLights.push(light);

    return root;
  }

  public createBrokenChariot(
    pos: Vector3,
    rotY = 0,
    interaction?: InteractionSystem,
    onInspect?: () => void
  ): Mesh {
    const scene = this.scene;
    const root = MeshBuilder.CreateBox(`ChariotRoot_${pos.x}_${pos.z}`, { size: 0.1 }, scene);
    root.position.copyFrom(pos);
    root.rotation.y = rotY;
    root.parent = this.root;
    this.detailMeshes.push(root);

    const woodMat = new StandardMaterial('mat_chariot_wood', scene);
    woodMat.diffuseColor = Color3.FromHexString('#4a2e12');

    const goldMat = new StandardMaterial('mat_chariot_gold', scene);
    goldMat.diffuseColor = Color3.FromHexString('#d4af37');

    // Overturned Chassis
    const chassis = MeshBuilder.CreateBox('Chariot_Body', { width: 3.5, height: 0.6, depth: 4.0 }, scene);
    chassis.position.set(0, 0.4, 0);
    chassis.rotation.z = 0.35;
    chassis.material = woodMat;
    chassis.checkCollisions = true;
    chassis.parent = root;

    // Gilded Spoked Wheel sticking out of sand
    const wheel = MeshBuilder.CreateTorus('Chariot_Wheel', { diameter: 2.8, thickness: 0.3, tessellation: 24 }, scene);
    wheel.position.set(1.4, 1.2, 0);
    wheel.rotation.x = Math.PI / 2;
    wheel.rotation.y = 0.2;
    wheel.material = goldMat;
    wheel.checkCollisions = true;
    wheel.parent = root;

    if (interaction && onInspect) {
      interaction.register({
        id: 'inspect_royal_chariot',
        interactionText: 'Examine Shattered Royal Chariot',
        position: pos,
        radius: 4.2,
        interact: () => {
          playSound(AUDIO_PATHS.PUZZLE, 0.5);
          onInspect();
        }
      });
    }

    return root;
  }

  public createKingStatue(
    pos: Vector3,
    rotY = 0,
    interaction?: InteractionSystem,
    onInspect?: () => void
  ): Mesh {
    const scene = this.scene;
    const root = MeshBuilder.CreateBox(`StatueRoot_${pos.x}_${pos.z}`, { size: 0.1 }, scene);
    root.position.copyFrom(pos);
    root.rotation.y = rotY;
    root.parent = this.root;
    this.detailMeshes.push(root);

    const stoneMat = new StandardMaterial('mat_statue_stone', scene);
    stoneMat.diffuseTexture = createProceduralSandstoneTexture(scene, '#cf9c58', '#523719');

    // Monumental Pedestal
    const base = MeshBuilder.CreateBox('Statue_Base', { width: 3.2, height: 1.8, depth: 3.2 }, scene);
    base.position.y = 0.9;
    base.material = stoneMat;
    base.checkCollisions = true;
    base.parent = root;

    // King Figure
    const torso = MeshBuilder.CreateBox('Statue_Torso', { width: 1.4, height: 2.6, depth: 1.0 }, scene);
    torso.position.y = 3.1;
    torso.material = stoneMat;
    torso.checkCollisions = true;
    torso.parent = root;
    torso.parent = root;

    const head = MeshBuilder.CreateSphere('Statue_Head', { diameter: 1.0 }, scene);
    head.position.y = 4.8;
    head.material = stoneMat;
    head.parent = root;

    // Crown on statue head
    const crown = MeshBuilder.CreateCylinder('Statue_Crown', { diameterTop: 1.1, diameterBottom: 0.9, height: 0.6 }, scene);
    crown.position.y = 5.4;
    crown.material = stoneMat;
    crown.parent = root;

    if (interaction && onInspect) {
      interaction.register({
        id: 'inspect_king_statue',
        interactionText: 'Read Statue of King Harsha',
        position: pos,
        radius: 4.5,
        interact: () => {
          playSound(AUDIO_PATHS.PUZZLE, 0.5);
          onInspect();
        }
      });
    }

    return root;
  }

  public createPrayerFlags(startPos: Vector3, endPos: Vector3): Mesh {
    const scene = this.scene;
    const root = MeshBuilder.CreateBox('FlagsRoot', { size: 0.1 }, scene);
    root.parent = this.root;
    this.detailMeshes.push(root);

    const colors = ['#f39c12', '#c0392b', '#ffd700', '#27ae60', '#2980b9'];
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const pos = Vector3.Lerp(startPos, endPos, t);
      // Slight sag in middle
      pos.y -= Math.sin(t * Math.PI) * 1.5;

      const flagMat = new StandardMaterial(`flag_mat_${i}`, scene);
      flagMat.diffuseColor = Color3.FromHexString(colors[i % colors.length]);

      const flag = MeshBuilder.CreatePlane(`Flag_${i}`, { width: 0.9, height: 1.3 }, scene);
      flag.position.copyFrom(pos);
      flag.position.y -= 0.65;
      flag.material = flagMat;
      flag.parent = root;
    }
    return root;
  }

  public createRoyalSilkBanner(pos: Vector3): Mesh {
    const scene = this.scene;
    const root = MeshBuilder.CreateBox('BannerRoot', { size: 0.1 }, scene);
    root.position.copyFrom(pos);
    root.parent = this.root;
    this.detailMeshes.push(root);

    const bannerMat = new StandardMaterial('mat_royal_banner', scene);
    bannerMat.diffuseColor = Color3.FromHexString('#8e1b1b');
    bannerMat.emissiveColor = Color3.FromHexString('#4a0808');

    const cloth = MeshBuilder.CreatePlane('Banner_Cloth', { width: 2.2, height: 6.5 }, scene);
    cloth.material = bannerMat;
    cloth.parent = root;

    // Gold solar emblem medallion
    const goldMat = new StandardMaterial('mat_banner_gold', scene);
    goldMat.diffuseColor = Color3.FromHexString('#f5c542');
    goldMat.emissiveColor = Color3.FromHexString('#997214');

    const sunDisc = MeshBuilder.CreateDisc('Banner_Sun', { radius: 0.6 }, scene);
    sunDisc.position.z = -0.02;
    sunDisc.material = goldMat;
    sunDisc.parent = cloth;

    return root;
  }

  public createStalagmite(pos: Vector3): Mesh {
    const scene = this.scene;
    const stoneMat = new StandardMaterial('mat_stalagmite', scene);
    stoneMat.diffuseColor = Color3.FromHexString('#2c3e50');

    const h = 2.5 + Math.random() * 3.0;
    const cone = MeshBuilder.CreateCylinder(`Stalagmite_${pos.x}_${pos.z}`, {
      diameterTop: 0,
      diameterBottom: 1.2 + Math.random() * 0.8,
      height: h,
      tessellation: 6
    }, scene);
    cone.position.set(pos.x, h / 2, pos.z);
    cone.material = stoneMat;
    cone.checkCollisions = true;
    cone.parent = this.root;
    this.detailMeshes.push(cone);
    return cone;
  }

  public createLoreStele(
    id: string,
    pos: Vector3,
    chronicleKey: string,
    chapterTitle: string,
    interaction: InteractionSystem,
    onReadChronicle: (key: string, title: string) => void
  ): Mesh {
    const scene = this.scene;
    const root = MeshBuilder.CreateBox(`Stele_${id}`, { size: 0.1 }, scene);
    root.position.copyFrom(pos);
    root.parent = this.root;
    this.detailMeshes.push(root);

    const stoneMat = new StandardMaterial(`stele_stone_${id}`, scene);
    stoneMat.diffuseTexture = createProceduralSandstoneTexture(scene, '#d4af37', '#573d09');

    const runeMat = new StandardMaterial(`stele_rune_${id}`, scene);
    runeMat.diffuseColor = Color3.FromHexString('#ffd700');
    runeMat.emissiveColor = Color3.FromHexString('#f39c12');

    // Tall Sandstone Tablet
    const tablet = MeshBuilder.CreateBox(`Tablet_${id}`, { width: 1.6, height: 3.8, depth: 0.6 }, scene);
    tablet.position.y = 1.9;
    tablet.material = stoneMat;
    tablet.checkCollisions = true;
    tablet.parent = root;

    // Glowing Sun Glyph carved onto tablet face
    const glyph = MeshBuilder.CreateCylinder(`Glyph_${id}`, { diameter: 0.8, height: 0.05 }, scene);
    glyph.position.set(0, 2.6, 0.32);
    glyph.rotation.x = Math.PI / 2;
    glyph.material = runeMat;
    glyph.parent = root;

    // Floating sacred solar particle beacon above stele
    const orb = MeshBuilder.CreateSphere(`Orb_${id}`, { diameter: 0.4 }, scene);
    orb.position.set(0, 4.4, 0);
    orb.material = runeMat;
    orb.parent = root;

    // Register Interaction
    interaction.register({
      id: `stele_${id}`,
      interactionText: `Decipher ${chapterTitle}`,
      position: pos,
      radius: 4.2,
      interact: () => {
        playSound(AUDIO_PATHS.PUZZLE, 0.6);
        onReadChronicle(chronicleKey, chapterTitle);
      }
    });

    return root;
  }

  public clear(): void {
    this.detailMeshes.forEach(m => m.dispose());
    this.detailMeshes = [];
    this.detailLights.forEach(l => l.dispose());
    this.detailLights = [];
  }
}
