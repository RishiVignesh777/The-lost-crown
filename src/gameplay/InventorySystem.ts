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
import { InventoryItem, GAME_ITEMS } from '../data/items';
import { playSound } from '../utils/helpers';
import { AUDIO_PATHS } from '../utils/constants';

export interface WorldPickupItem {
  id: string;
  itemId: string;
  mesh: Mesh;
  light?: PointLight;
  position: Vector3;
}

export class InventorySystem {
  private items: Map<string, InventoryItem> = new Map();
  private worldPickups: Map<string, WorldPickupItem> = new Map();
  private pickupTime = 0;

  constructor(public scene?: Scene, initialItems?: InventoryItem[]) {
    if (initialItems && initialItems.length > 0) {
      initialItems.forEach(i => this.items.set(i.id, { ...i }));
    } else {
      // Aren starts with his guardian bronze badge and a few dinars
      this.addItem('bronze_emblem', 1);
      this.addItem('ancient_coins', 15);
    }
  }

  public addItem(id: string, quantity = 1): InventoryItem {
    const existing = this.items.get(id);
    if (existing) {
      existing.quantity += quantity;
      return existing;
    }

    const template = GAME_ITEMS[id] || {
      id,
      name: id.replace(/_/g, ' '),
      description: 'An ancient relic of unknown origin.',
      icon: id,
      quantity: 1,
      category: 'relic'
    };

    const newItem: InventoryItem = { ...template, quantity };
    this.items.set(id, newItem);
    return newItem;
  }

  public removeItem(id: string, quantity = 1): boolean {
    const existing = this.items.get(id);
    if (!existing || existing.quantity < quantity) return false;
    existing.quantity -= quantity;
    if (existing.quantity <= 0) {
      this.items.delete(id);
    }
    return true;
  }

  public hasItem(id: string, quantity = 1): boolean {
    const existing = this.items.get(id);
    return !!existing && existing.quantity >= quantity;
  }

  public getItems(): InventoryItem[] {
    return Array.from(this.items.values());
  }

  // --- 3D World Pickable Relics ---
  public spawnWorldPickup(scene: Scene, itemId: string, position: Vector3): WorldPickupItem {
    const root = new TransformNode(`PickupRoot_${itemId}`, scene);
    root.position.copyFrom(position);

    const goldMat = new StandardMaterial(`mat_relic_${itemId}`, scene);
    goldMat.diffuseColor = Color3.FromHexString('#ffd700');
    goldMat.emissiveColor = Color3.FromHexString('#f39c12');
    goldMat.specularPower = 32;

    let mesh: Mesh;
    if (itemId === 'solar_crown') {
      mesh = MeshBuilder.CreateTorus(`RelicMesh_${itemId}`, { diameter: 1.1, thickness: 0.22, tessellation: 32 }, scene);
    } else if (itemId === 'sun_stone' || itemId === 'crystal_fragment') {
      mesh = MeshBuilder.CreatePolyhedron(`RelicMesh_${itemId}`, { type: 1, size: 0.5 }, scene);
    } else {
      mesh = MeshBuilder.CreateCylinder(`RelicMesh_${itemId}`, { diameter: 0.8, height: 0.15, tessellation: 20 }, scene);
      mesh.rotation.x = Math.PI / 2;
    }

    mesh.material = goldMat;
    mesh.position.y = 1.2;
    mesh.parent = root;

    const light = new PointLight(`RelicLight_${itemId}`, new Vector3(0, 1.5, 0), scene);
    light.diffuse = Color3.FromHexString('#ffd700');
    light.intensity = 1.4;
    light.range = 7;
    light.parent = root;

    const pickupItem: WorldPickupItem = {
      id: `pickup_${itemId}_${Date.now()}`,
      itemId,
      mesh,
      light,
      position
    };

    this.worldPickups.set(pickupItem.id, pickupItem);
    return pickupItem;
  }

  public removeWorldPickup(pickupId: string): void {
    const item = this.worldPickups.get(pickupId);
    if (item) {
      playSound(AUDIO_PATHS.PICKUP, 0.7);
      if (item.light) item.light.dispose();
      item.mesh.parent?.dispose();
      item.mesh.dispose();
      this.worldPickups.delete(pickupId);
    }
  }

  public updateWorldPickups(deltaTime: number): void {
    this.pickupTime += deltaTime;
    this.worldPickups.forEach(item => {
      // Bob and rotate in 3D
      item.mesh.position.y = 1.2 + Math.sin(this.pickupTime * 3) * 0.15;
      item.mesh.rotation.y += deltaTime * 2.0;
    });
  }

  public clearWorldPickups(): void {
    this.worldPickups.forEach(item => {
      if (item.light) item.light.dispose();
      item.mesh.parent?.dispose();
      item.mesh.dispose();
    });
    this.worldPickups.clear();
  }
}
