import { Vector3 } from '@babylonjs/core';

export interface PuzzleDefinition3D {
  id: string;
  name: string;
  locationId: string;
  description: string;
  hint: string;
  solved: boolean;
}

export const PUZZLES_DATA: Record<string, PuzzleDefinition3D> = {
  gate_levers: {
    id: 'gate_levers',
    name: 'The Three Solar Wheels',
    locationId: 'kingdom_gate',
    description: 'Three mechanical counterweight levers built into the ancient stone ramparts. Align Dawn, Zenith, and Twilight to raise the massive portcullis.',
    hint: 'Pull all three levers along the stone gateway rampart to release the ancient weights.',
    solved: false
  },
  temple_inscriptions: {
    id: 'temple_inscriptions',
    name: 'Whispers of the Temple',
    locationId: 'temple_district',
    description: 'Three sacred pillars inscribed with the solar virtues: Pillar of Dawn, Pillar of Justice, and Pillar of Eternity.',
    hint: 'Inspect the three stone pillars in the temple courtyard and recount them to Keeper Somesh.',
    solved: false
  },
  cave_crystals: {
    id: 'cave_crystals',
    name: 'The Refracting Crystals of Suryagarh',
    locationId: 'ancient_cave',
    description: 'Three ancient prism crystals focusing light onto the dynastic treasure vault. The alignment order is Cyan, Amber, then Golden.',
    hint: 'Align the crystals in order of wavelength: Cyan first, then Amber, then Golden.',
    solved: false
  },
  celestial_dials: {
    id: 'celestial_dials',
    name: 'The Four Celestial Dials of the Sun Altar',
    locationId: 'sun_temple',
    description: 'Four monumental solar dials encircling the central dais. According to the Ancient Scroll of Kings, the sacred celestial harmonics are 3 - 1 - 4 - 2.',
    hint: 'Rotate the four dials to match the Scroll of Kings: Dial 1 = 3, Dial 2 = 1, Dial 3 = 4, Dial 4 = 2.',
    solved: false
  }
};
