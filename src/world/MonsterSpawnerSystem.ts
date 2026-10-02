import {
  Scene,
  TransformNode,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  Mesh,
  PointLight,
  DynamicTexture
} from '@babylonjs/core';
import { EnemyManager } from '../characters/EnemyManager';
import { Player } from '../player/Player';
import { playSound } from '../utils/helpers';
import { AUDIO_PATHS } from '../utils/constants';

export interface SpawnerPoint {
  id: string;
  name: string;
  direction: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';
  position: Vector3;
  root: TransformNode;
  crystal: Mesh;
  energyRing: Mesh;
  light: PointLight;
}

export class MonsterSpawnerSystem {
  public spawners: SpawnerPoint[] = [];
  public spawnTimer = 10.0;
  public readonly spawnInterval = 10.0;
  public totalSpawned = 0;
  private root: TransformNode;
  public onWaveSpawned?: (waveCount: number) => void;

  constructor(
    public scene: Scene,
    private enemyManager: EnemyManager
  ) {
    this.root = new TransformNode('MonsterSpawnersRoot', scene);
  }

  public setupSpawners(center = new Vector3(0, 0, 0), distance = 32): void {
    this.clear();

    const configs: Array<{ id: string; name: string; dir: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST'; offset: Vector3 }> = [
      { id: 'spawner_n', name: 'North Void Rift', dir: 'NORTH', offset: new Vector3(0, 0, distance) },
      { id: 'spawner_s', name: 'South Void Rift', dir: 'SOUTH', offset: new Vector3(0, 0, -distance) },
      { id: 'spawner_e', name: 'East Void Rift', dir: 'EAST', offset: new Vector3(distance, 0, 0) },
      { id: 'spawner_w', name: 'West Void Rift', dir: 'WEST', offset: new Vector3(-distance, 0, 0) }
    ];

    configs.forEach(cfg => {
      const pos = center.add(cfg.offset);
      const spawner = this.createSpawnerMesh(cfg.id, cfg.name, cfg.dir, pos);
      this.spawners.push(spawner);
    });

    this.spawnTimer = this.spawnInterval;
  }

  private createSpawnerMesh(
    id: string,
    name: string,
    direction: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST',
    position: Vector3
  ): SpawnerPoint {
    const scene = this.scene;
    const spawnerRoot = new TransformNode(`SpawnerNode_${id}`, scene);
    spawnerRoot.position.copyFrom(position);
    spawnerRoot.parent = this.root;

    // Materials
    const baseMat = new StandardMaterial(`mat_spawner_base_${id}`, scene);
    baseMat.diffuseColor = Color3.FromHexString('#1c0f2b');
    baseMat.emissiveColor = Color3.FromHexString('#2a1240');

    const crystalMat = new StandardMaterial(`mat_spawner_crys_${id}`, scene);
    crystalMat.diffuseColor = Color3.FromHexString('#8e44ad');
    crystalMat.emissiveColor = Color3.FromHexString('#a55eea');
    crystalMat.specularColor = Color3.White();

    const ringMat = new StandardMaterial(`mat_spawner_ring_${id}`, scene);
    ringMat.diffuseColor = Color3.FromHexString('#ff007f');
    ringMat.emissiveColor = Color3.FromHexString('#d63031');

    // 1. Carved Obsidian Base Monolith (Solid collision so player cannot walk through)
    const base = MeshBuilder.CreateBox(`Spawner_Base_${id}`, { width: 3.2, height: 1.2, depth: 3.2 }, scene);
    base.position.y = 0.6;
    base.material = baseMat;
    base.checkCollisions = true;
    base.parent = spawnerRoot;

    // 4 Corner Spire Pillars
    for (let x of [-1.3, 1.3]) {
      for (let z of [-1.3, 1.3]) {
        const pillar = MeshBuilder.CreateCylinder(`Spire_${x}_${z}_${id}`, {
          diameterTop: 0.15,
          diameterBottom: 0.45,
          height: 2.4,
          tessellation: 6
        }, scene);
        pillar.position.set(x, 1.8, z);
        pillar.material = baseMat;
        pillar.checkCollisions = true;
        pillar.parent = spawnerRoot;
      }
    }

    // 2. Hovering, Rotating Dark Crystal Spire
    const crystal = MeshBuilder.CreatePolyhedron(`Crystal_${id}`, {
      type: 1, // Octahedron
      size: 0.95
    }, scene);
    crystal.position.y = 2.4;
    crystal.material = crystalMat;
    crystal.parent = spawnerRoot;

    // 3. Charging Energy Rune Ring on the floor
    const energyRing = MeshBuilder.CreateTorus(`Ring_${id}`, {
      diameter: 3.8,
      thickness: 0.18,
      tessellation: 32
    }, scene);
    energyRing.position.y = 0.05;
    energyRing.material = ringMat;
    energyRing.parent = spawnerRoot;

    // 4. Direction Sign / Rune Marker Plane
    const signPlane = MeshBuilder.CreatePlane(`Sign_${id}`, { width: 2.2, height: 0.55 }, scene);
    signPlane.position.set(0, 3.4, 0);
    signPlane.parent = spawnerRoot;

    const signTex = new DynamicTexture(`SignTex_${id}`, { width: 256, height: 64 }, scene, false);
    const ctx = signTex.getContext() as CanvasRenderingContext2D;
    ctx.fillStyle = '#1c0f2b';
    ctx.fillRect(0, 0, 256, 64);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 252, 60);
    ctx.fillStyle = '#ff7675';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`⚡ ${direction} RIFT`, 128, 32);
    signTex.update();

    const signMat = new StandardMaterial(`SignMat_${id}`, scene);
    signMat.diffuseTexture = signTex;
    signMat.emissiveColor = Color3.FromHexString('#ff7675').scale(0.8);
    signPlane.material = signMat;

    // 5. Void Rift Pulsing Point Light
    const light = new PointLight(`SpawnerLight_${id}`, new Vector3(0, 2.5, 0), scene);
    light.diffuse = Color3.FromHexString('#9b59b6');
    light.intensity = 1.4;
    light.range = 14;
    light.parent = spawnerRoot;

    return {
      id,
      name,
      direction,
      position,
      root: spawnerRoot,
      crystal,
      energyRing,
      light
    };
  }

  public update(deltaTime: number, player: Player): void {
    if (this.spawners.length === 0) return;

    // Countdown 10-second timer
    this.spawnTimer -= deltaTime;

    // Visual animation of spawners: rotate crystal and charge energy ring
    const chargeRatio = Math.max(0, 1 - this.spawnTimer / this.spawnInterval);

    this.spawners.forEach(s => {
      // Rotate crystal
      s.crystal.rotation.y += deltaTime * 2.0;
      s.crystal.rotation.x = Math.sin(Date.now() * 0.003) * 0.25;

      // Pulse energy ring size and color
      const scale = 1.0 + chargeRatio * 0.4 + Math.sin(Date.now() * 0.008) * 0.08;
      s.energyRing.scaling.set(scale, 1, scale);

      // Light pulsates faster as timer nears 0
      const pulseSpeed = 2 + chargeRatio * 8;
      s.light.intensity = 1.0 + Math.sin(Date.now() * 0.005 * pulseSpeed) * 0.5 + chargeRatio * 0.8;
    });

    if (this.spawnTimer <= 0) {
      this.spawnTimer = this.spawnInterval;
      this.triggerSpawnWave(player);
    }
  }

  private triggerSpawnWave(player: Player): void {
    // Only spawn if total living enemies under max capacity
    const currentLiving = this.enemyManager.getLivingEnemies();
    const maxActiveMonsters = 12;

    if (currentLiving.length >= maxActiveMonsters) {
      return;
    }

    this.totalSpawned++;
    playSound(AUDIO_PATHS.ATTACK, 0.9);

    // Each of the 4 spawners at opposite directions spawns a monster that takes 2 hits to die!
    this.spawners.forEach((spawner, idx) => {
      // Flash spawner light
      spawner.light.intensity = 3.5;
      setTimeout(() => {
        if (spawner.light) spawner.light.intensity = 1.4;
      }, 350);

      // Slight offset so monsters don't spawn stuck in the base
      const angle = (idx / 4) * Math.PI * 2;
      const spawnPos = spawner.position.add(new Vector3(Math.cos(angle) * 3.5, 0, Math.sin(angle) * 3.5));

      const monsterId = `void_stalker_${this.totalSpawned}_${idx}`;
      this.enemyManager.spawnEnemy({
        id: monsterId,
        name: `Void Stalker [${spawner.direction[0]}]`,
        type: 'void_crawler',
        position: spawnPos,
        hitsToDie: 2 // EXACTLY 2 HITS TO DIE!
      });
    });

    if (this.onWaveSpawned) {
      this.onWaveSpawned(this.totalSpawned);
    }
  }

  public getTimeRemaining(): number {
    return Math.max(0, this.spawnTimer);
  }

  public clear(): void {
    this.spawners.forEach(s => {
      s.light.dispose();
      s.crystal.dispose();
      s.energyRing.dispose();
      s.root.dispose();
    });
    this.spawners = [];
  }
}
