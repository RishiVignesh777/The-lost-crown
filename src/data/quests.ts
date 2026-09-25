export interface Quest {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  objectives: {
    id: string;
    text: string;
    completed: boolean;
  }[];
  rewardItem?: string;
  rewardExp?: number;
}

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'quest_1_broken_gate',
    title: 'The Broken Gate',
    description: 'The monumental stone gate into Suryagarh is jammed by fallen masonry and disconnected counterweight levers.',
    completed: false,
    objectives: [
      { id: 'talk_historian', text: 'Speak with Historian Devavrata at the Gate', completed: false },
      { id: 'activate_gate_mechanism', text: 'Solve the Gate Lever Mechanism', completed: false },
      { id: 'enter_market', text: 'Proceed through the Gate to the Royal Market', completed: false }
    ]
  },
  {
    id: 'quest_2_whispers_temple',
    title: 'Whispers of the Temple',
    description: 'Decipher the three ancient pillar inscriptions in the Temple District to unlock the sacred pathways.',
    completed: false,
    objectives: [
      { id: 'read_pillar_1', text: 'Decode Pillar of Dawn', completed: false },
      { id: 'read_pillar_2', text: 'Decode Pillar of Justice', completed: false },
      { id: 'read_pillar_3', text: 'Decode Pillar of Eternity', completed: false },
      { id: 'speak_keeper', text: 'Report the decoded wisdom to Temple Keeper Somesh', completed: false }
    ]
  },
  {
    id: 'quest_3_lost_merchant',
    title: 'The Lost Merchant',
    description: 'Locate Merchant Kavi in the Royal Market and inspect the trading stores.',
    completed: false,
    objectives: [
      { id: 'find_kavi', text: 'Speak to Merchant Kavi in the Royal Market', completed: false },
      { id: 'obtain_temple_key', text: 'Receive the Temple Key to enter sacred grounds', completed: false }
    ]
  },
  {
    id: 'quest_4_royal_seal',
    title: 'The Royal Seal',
    description: 'Explore the subterranean Ancient Caves beyond the Sacred Forest and recover the lost Royal Seal.',
    completed: false,
    objectives: [
      { id: 'reach_caves', text: 'Enter the Ancient Cave through the Sacred Forest', completed: false },
      { id: 'speak_explorer', text: 'Aid Explorer Vikram in the crystal cavern', completed: false },
      { id: 'open_royal_chest', text: 'Unlock the Golden Royal Chest with light alignment', completed: false },
      { id: 'retrieve_royal_seal', text: 'Obtain the Royal Seal of the Solar Dynasty', completed: false }
    ]
  },
  {
    id: 'quest_5_last_king',
    title: 'The Last King',
    description: 'Uncover the final resting truth of King Harsha and the mystery of the kingdom’s fall in the Royal Palace.',
    completed: false,
    objectives: [
      { id: 'enter_palace', text: 'Use the Royal Seal to open the Royal Palace gates', completed: false },
      { id: 'inspect_throne', text: 'Inspect the Throne of King Harsha', completed: false },
      { id: 'obtain_sun_stone', text: 'Claim the radiant Sun Stone from the royal altar', completed: false }
    ]
  },
  {
    id: 'quest_6_solar_crown',
    title: 'The Solar Crown',
    description: 'Ascend to the Sun Temple, align the four celestial dials according to the Scroll of Kings, and recover the Solar Crown.',
    completed: false,
    objectives: [
      { id: 'enter_sun_temple', text: 'Enter the Sun Temple Inner Sanctum', completed: false },
      { id: 'solve_celestial_dials', text: 'Align the Four Solar Dials (Code: 3 - 1 - 4 - 2)', completed: false },
      { id: 'recover_crown', text: 'Retrieve the Solar Crown and bring dawn to Suryagarh', completed: false }
    ]
  }
];
