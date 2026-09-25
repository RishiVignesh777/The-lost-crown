import { Vector3 } from '@babylonjs/core';

export interface NPCConfig3D {
  id: string;
  name: string;
  title: string;
  role: 'historian' | 'merchant' | 'keeper' | 'scholar' | 'elder' | 'explorer';
  locationId: string;
  position: Vector3;
  rotationY: number;
  dialogueKey: string;
  clothesColor: string;
  accessory: 'scroll' | 'bag' | 'staff' | 'book' | 'cane' | 'torch';
}

export const NPCS_DATA_3D: NPCConfig3D[] = [
  {
    id: 'historian',
    name: 'Historian Devavrata',
    title: 'Guardian Archivist of Suryagarh',
    role: 'historian',
    locationId: 'kingdom_gate',
    position: new Vector3(8, 0, -22),
    rotationY: -Math.PI / 3,
    dialogueKey: 'old_historian_intro',
    clothesColor: '#8c6d3b',
    accessory: 'scroll'
  },
  {
    id: 'merchant',
    name: 'Merchant Kavi',
    title: 'Purveyor of Desert Curiosities',
    role: 'merchant',
    locationId: 'royal_market',
    position: new Vector3(12, 0, -10),
    rotationY: -Math.PI / 2,
    dialogueKey: 'wandering_merchant_intro',
    clothesColor: '#2980b9',
    accessory: 'bag'
  },
  {
    id: 'keeper',
    name: 'Temple Keeper Somesh',
    title: 'Custodian of the Solar Flame',
    role: 'keeper',
    locationId: 'temple_district',
    position: new Vector3(-8, 0, 15),
    rotationY: Math.PI / 4,
    dialogueKey: 'temple_keeper_intro',
    clothesColor: '#d35400',
    accessory: 'staff'
  },
  {
    id: 'elder',
    name: 'Village Elder Vedashri',
    title: 'Keeper of Oral Dynasties',
    role: 'elder',
    locationId: 'temple_district',
    position: new Vector3(14, 0, 18),
    rotationY: -Math.PI / 4,
    dialogueKey: 'village_elder_intro',
    clothesColor: '#7f8c8d',
    accessory: 'cane'
  },
  {
    id: 'scholar',
    name: 'Royal Scholar Ananya',
    title: 'Astronomer of the Sun Altar',
    role: 'scholar',
    locationId: 'sacred_forest',
    position: new Vector3(6, 0, 12),
    rotationY: -Math.PI / 3,
    dialogueKey: 'royal_scholar_intro',
    clothesColor: '#8e44ad',
    accessory: 'book'
  },
  {
    id: 'explorer',
    name: 'Explorer Vikram',
    title: 'Cave Delver & Relic Seeker',
    role: 'explorer',
    locationId: 'ancient_cave',
    position: new Vector3(5, 0, 8),
    rotationY: -Math.PI / 2,
    dialogueKey: 'lost_explorer_intro',
    clothesColor: '#27ae60',
    accessory: 'torch'
  }
];
