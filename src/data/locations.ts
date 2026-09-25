import { Vector3, Color3 } from '@babylonjs/core';

export interface LocationConnection3D {
  targetId: string;
  label: string;
  triggerPosition: Vector3;
  triggerRadius: number;
  targetSpawnPosition: Vector3;
  targetSpawnRotationY: number;
}

export interface AncientLocation3DConfig {
  id: string;
  name: string;
  regionTitle: string;
  description: string;
  spawnPosition: Vector3;
  spawnRotationY: number;
  worldRadius: number;
  environment: {
    skyColor: Color3;
    groundColor: Color3;
    sunColor: Color3;
    sunIntensity: number;
    sunDirection: Vector3;
    fogDensity: number;
    fogColor: Color3;
    ambientDustColor: Color3;
    ambientTheme: string;
  };
  connectedLocations: LocationConnection3D[];
}

export const ANCIENT_LOCATIONS_3D: Record<string, AncientLocation3DConfig> = {
  kingdom_gate: {
    id: 'kingdom_gate',
    name: 'Ancient Kingdom Gate',
    regionTitle: 'The Outer Bulwark of Suryagarh',
    description: 'The monumental stone gate that once stood as the shield of Suryagarh. Towering sandstone bastions and watchtowers flank the ancient entrance.',
    spawnPosition: new Vector3(0, 0, -45),
    spawnRotationY: 0,
    worldRadius: 80,
    environment: {
      skyColor: Color3.FromHexString('#f5b041'),
      groundColor: Color3.FromHexString('#5c3818'),
      sunColor: Color3.FromHexString('#ffdf9e'),
      sunIntensity: 1.4,
      sunDirection: new Vector3(-0.5, -1, 0.7).normalize(),
      fogDensity: 0.008,
      fogColor: Color3.FromHexString('#573b23'),
      ambientDustColor: Color3.FromHexString('#ffd700'),
      ambientTheme: 'wind_and_dust'
    },
    connectedLocations: [
      {
        targetId: 'royal_market',
        label: 'Pass into the Royal Market',
        triggerPosition: new Vector3(0, 0, 52),
        triggerRadius: 4.5,
        targetSpawnPosition: new Vector3(0, 0, -50),
        targetSpawnRotationY: 0
      }
    ]
  },
  royal_market: {
    id: 'royal_market',
    name: 'Royal Market',
    regionTitle: 'The Bazaar of Spices & Gold',
    description: 'The historic commercial plaza where merchants traded silks, spices, and pottery. Clay amphorae, stalls, and stone shops stand quiet in the afternoon sun.',
    spawnPosition: new Vector3(0, 0, -48),
    spawnRotationY: 0,
    worldRadius: 90,
    environment: {
      skyColor: Color3.FromHexString('#e59866'),
      groundColor: Color3.FromHexString('#6e4722'),
      sunColor: Color3.FromHexString('#ffecb3'),
      sunIntensity: 1.3,
      sunDirection: new Vector3(-0.3, -1, 0.5).normalize(),
      fogDensity: 0.006,
      fogColor: Color3.FromHexString('#4a321e'),
      ambientDustColor: Color3.FromHexString('#f5c542'),
      ambientTheme: 'market_echoes'
    },
    connectedLocations: [
      {
        targetId: 'kingdom_gate',
        label: 'Return to Kingdom Gate',
        triggerPosition: new Vector3(0, 0, -56),
        triggerRadius: 4.5,
        targetSpawnPosition: new Vector3(0, 0, 45),
        targetSpawnRotationY: Math.PI
      },
      {
        targetId: 'temple_district',
        label: 'Ascend to Temple District',
        triggerPosition: new Vector3(0, 0, 56),
        triggerRadius: 4.5,
        targetSpawnPosition: new Vector3(0, 0, -52),
        targetSpawnRotationY: 0
      },
      {
        targetId: 'sacred_forest',
        label: 'Follow Path to Sacred Forest',
        triggerPosition: new Vector3(56, 0, 0),
        triggerRadius: 4.5,
        targetSpawnPosition: new Vector3(-50, 0, 0),
        targetSpawnRotationY: Math.PI / 2
      }
    ]
  },
  temple_district: {
    id: 'temple_district',
    name: 'Temple District',
    regionTitle: 'The Sacred Shrines of Surya',
    description: 'A grand ceremonial complex enclosed by soaring stone shikharas, monumental stairs, lotus fountains, and ancient inscribed pillars.',
    spawnPosition: new Vector3(0, 0, -50),
    spawnRotationY: 0,
    worldRadius: 100,
    environment: {
      skyColor: Color3.FromHexString('#d4ac0d'),
      groundColor: Color3.FromHexString('#4d3916'),
      sunColor: Color3.FromHexString('#fff3cc'),
      sunIntensity: 1.5,
      sunDirection: new Vector3(-0.2, -1, 0.3).normalize(),
      fogDensity: 0.007,
      fogColor: Color3.FromHexString('#453216'),
      ambientDustColor: Color3.FromHexString('#ffd700'),
      ambientTheme: 'temple_bells'
    },
    connectedLocations: [
      {
        targetId: 'royal_market',
        label: 'Descend to Royal Market',
        triggerPosition: new Vector3(0, 0, -58),
        triggerRadius: 4.5,
        targetSpawnPosition: new Vector3(0, 0, 48),
        targetSpawnRotationY: Math.PI
      },
      {
        targetId: 'royal_palace',
        label: 'Approach the Royal Palace',
        triggerPosition: new Vector3(0, 0, 60),
        triggerRadius: 4.5,
        targetSpawnPosition: new Vector3(0, 0, -52),
        targetSpawnRotationY: 0
      }
    ]
  },
  sacred_forest: {
    id: 'sacred_forest',
    name: 'Sacred Forest',
    regionTitle: 'The Ancient Banyan Woods',
    description: 'Dense canopy of towering banyan and sal trees, mossy stones, small babbling brooks, and secluded ruins where hermits once studied the heavens.',
    spawnPosition: new Vector3(-48, 0, 0),
    spawnRotationY: Math.PI / 2,
    worldRadius: 95,
    environment: {
      skyColor: Color3.FromHexString('#52be80'),
      groundColor: Color3.FromHexString('#19381f'),
      sunColor: Color3.FromHexString('#e8f8f5'),
      sunIntensity: 1.1,
      sunDirection: new Vector3(-0.6, -1, 0.4).normalize(),
      fogDensity: 0.015,
      fogColor: Color3.FromHexString('#142b1a'),
      ambientDustColor: Color3.FromHexString('#82e0aa'),
      ambientTheme: 'forest_rustle'
    },
    connectedLocations: [
      {
        targetId: 'royal_market',
        label: 'Return to Royal Market',
        triggerPosition: new Vector3(-56, 0, 0),
        triggerRadius: 4.5,
        targetSpawnPosition: new Vector3(48, 0, 0),
        targetSpawnRotationY: -Math.PI / 2
      },
      {
        targetId: 'ancient_cave',
        label: 'Enter the Ancient Cave',
        triggerPosition: new Vector3(54, 0, 0),
        triggerRadius: 4.5,
        targetSpawnPosition: new Vector3(-45, 0, 0),
        targetSpawnRotationY: Math.PI / 2
      }
    ]
  },
  ancient_cave: {
    id: 'ancient_cave',
    name: 'Ancient Cave',
    regionTitle: 'The Subterranean Crystal Vaults',
    description: 'A subterranean cavern system studded with luminescent turquoise and amber crystals, ancient royal dynastic reliefs, and hidden treasure chambers.',
    spawnPosition: new Vector3(-42, 0, 0),
    spawnRotationY: Math.PI / 2,
    worldRadius: 85,
    environment: {
      skyColor: Color3.FromHexString('#0e2b38'),
      groundColor: Color3.FromHexString('#0a161c'),
      sunColor: Color3.FromHexString('#48c9b0'),
      sunIntensity: 0.4,
      sunDirection: new Vector3(0, -1, 0),
      fogDensity: 0.02,
      fogColor: Color3.FromHexString('#081820'),
      ambientDustColor: Color3.FromHexString('#1abc9c'),
      ambientTheme: 'cave_drips'
    },
    connectedLocations: [
      {
        targetId: 'sacred_forest',
        label: 'Ascend to Sacred Forest',
        triggerPosition: new Vector3(-50, 0, 0),
        triggerRadius: 4.5,
        targetSpawnPosition: new Vector3(46, 0, 0),
        targetSpawnRotationY: -Math.PI / 2
      }
    ]
  },
  royal_palace: {
    id: 'royal_palace',
    name: 'Royal Palace',
    regionTitle: 'The Halls of the Solar Dynasty',
    description: 'The monumental seat of King Harsha. Colossal archways, marble columns, gilded banners, royal dais, and royal library chambers.',
    spawnPosition: new Vector3(0, 0, -50),
    spawnRotationY: 0,
    worldRadius: 100,
    environment: {
      skyColor: Color3.FromHexString('#b7950b'),
      groundColor: Color3.FromHexString('#4a3b19'),
      sunColor: Color3.FromHexString('#ffeaa7'),
      sunIntensity: 1.4,
      sunDirection: new Vector3(-0.4, -1, 0.6).normalize(),
      fogDensity: 0.006,
      fogColor: Color3.FromHexString('#3a2c0f'),
      ambientDustColor: Color3.FromHexString('#ffd700'),
      ambientTheme: 'palace_halls'
    },
    connectedLocations: [
      {
        targetId: 'temple_district',
        label: 'Exit to Temple District',
        triggerPosition: new Vector3(0, 0, -58),
        triggerRadius: 4.5,
        targetSpawnPosition: new Vector3(0, 0, 52),
        targetSpawnRotationY: Math.PI
      },
      {
        targetId: 'sun_temple',
        label: 'Ascend to the Sun Temple',
        triggerPosition: new Vector3(0, 0, 62),
        triggerRadius: 4.5,
        targetSpawnPosition: new Vector3(0, 0, -50),
        targetSpawnRotationY: 0
      }
    ]
  },
  sun_temple: {
    id: 'sun_temple',
    name: 'Sun Temple',
    regionTitle: 'The Golden Zenith of Suryagarh',
    description: 'The supreme celestial sanctuary. Radiant pure golden stone architecture, the Sacred Solar Altar, four celestial dials, and the resting place of the Solar Crown.',
    spawnPosition: new Vector3(0, 0, -48),
    spawnRotationY: 0,
    worldRadius: 90,
    environment: {
      skyColor: Color3.FromHexString('#f39c12'),
      groundColor: Color3.FromHexString('#5c4108'),
      sunColor: Color3.FromHexString('#fff9e6'),
      sunIntensity: 1.8,
      sunDirection: new Vector3(-0.1, -1, 0.2).normalize(),
      fogDensity: 0.005,
      fogColor: Color3.FromHexString('#4a3508'),
      ambientDustColor: Color3.FromHexString('#fff3b0'),
      ambientTheme: 'celestial_drone'
    },
    connectedLocations: [
      {
        targetId: 'royal_palace',
        label: 'Return to Royal Palace',
        triggerPosition: new Vector3(0, 0, -56),
        triggerRadius: 4.5,
        targetSpawnPosition: new Vector3(0, 0, 54),
        targetSpawnRotationY: Math.PI
      }
    ]
  }
};

export function getLocationConfig3D(id: string): AncientLocation3DConfig {
  return ANCIENT_LOCATIONS_3D[id] || ANCIENT_LOCATIONS_3D['kingdom_gate'];
}
