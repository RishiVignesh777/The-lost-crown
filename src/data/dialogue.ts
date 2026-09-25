export interface DialogueLine {
  speaker: string;
  text: string;
  portrait?: string;
  options?: {
    text: string;
    nextDialogueId?: string;
    action?: string;
  }[];
}

export interface DialogueNode {
  id: string;
  lines: DialogueLine[];
}

export const DIALOGUE_DATA: Record<string, DialogueLine[]> = {
  gate_inscription: [
    {
      speaker: 'Ancient Gate Inscription',
      text: '“Let none enter Suryagarh with darkness in their hearts. When the gate falls silent, align the three solar wheels: Dawn, Zenith, and Twilight.”'
    }
  ],
  old_historian_intro: [
    {
      speaker: 'Old Historian Devavrata',
      text: 'Guardian Aren... By the Sun, you are alive! I believed the order of guardians had vanished with the fall of Suryagarh centuries ago.'
    },
    {
      speaker: 'Aren',
      text: 'My memories are fractured. I awakened near the outer walls. What happened to our great kingdom?'
    },
    {
      speaker: 'Old Historian Devavrata',
      text: 'The kingdom withered on the night the Solar Crown vanished from the Sun Temple. Without its radiance, the sacred rivers dried, shadows stirred, and the people fled.'
    },
    {
      speaker: 'Old Historian Devavrata',
      text: 'The kingdom gate mechanism ahead is jammed. Restore the gate counterweights, and make your way to the Royal Market. Find the Merchant and the Temple Keeper!'
    }
  ],
  wandering_merchant_intro: [
    {
      speaker: 'Wandering Merchant Kavi',
      text: 'Namaste, traveler! Or should I say... Guardian? Ah, that armor is unmistakable!'
    },
    {
      speaker: 'Aren',
      text: 'Do you know where the path to the Royal Palace lies?'
    },
    {
      speaker: 'Wandering Merchant Kavi',
      text: 'The palace courtyard is sealed by ancient wards, my friend! You will need the Royal Seal of the Solar Dynasty. Rumor says a royal convoy took it deep into the Ancient Caves beyond the Sacred Forest.'
    },
    {
      speaker: 'Wandering Merchant Kavi',
      text: 'Take this Temple Key I salvaged from the market ruins. It will grant you passage into the Temple District’s sacred inner sanctums!'
    }
  ],
  temple_keeper_intro: [
    {
      speaker: 'Temple Keeper Somesh',
      text: 'Peace to your spirit, Guardian Aren. The temple bells have hung silent for generations.'
    },
    {
      speaker: 'Aren',
      text: 'Keeper, how can the Sun Temple be reopened?'
    },
    {
      speaker: 'Temple Keeper Somesh',
      text: 'The Sun Temple requires the Sun Stone and the three Inscriptions of Truth decoded from our ceremonial pillars.'
    },
    {
      speaker: 'Temple Keeper Somesh',
      text: 'Read the three stone inscriptions around this courtyard. When their wisdom is reunited, the ancient seal upon the Sacred Forest and Palace will yield.'
    }
  ],
  royal_scholar_intro: [
    {
      speaker: 'Royal Scholar Ananya',
      text: 'A guardian of Suryagarh! The ancient manuscripts spoke of one who would awaken when the kingdom called for salvation.'
    },
    {
      speaker: 'Aren',
      text: 'Scholar, what do your scrolls say of the final days?'
    },
    {
      speaker: 'Royal Scholar Ananya',
      text: 'The last King, Harsha, did not destroy the crown. In his dying hour, he placed it within the Sun Temple’s crystalline celestial lock, awaiting a guardian pure of spirit.'
    },
    {
      speaker: 'Royal Scholar Ananya',
      text: 'Take this Ancient Scroll of Kings. It reveals the celestial frequency: 3 - 1 - 4 - 2. Remember this well when you reach the altar!'
    }
  ],
  village_elder_intro: [
    {
      speaker: 'Village Elder Vedashri',
      text: 'Blessings of Surya upon you, my child. The darkness in the ruins grows restless as the solar solstice nears.'
    },
    {
      speaker: 'Village Elder Vedashri',
      text: 'Keep your talwar blade sharp. Cursed sentries bound to the forgotten vaults still patrol the corridors of our past.'
    }
  ],
  lost_explorer_intro: [
    {
      speaker: 'Lost Explorer Vikram',
      text: 'Ha! Another living soul in these subterranean caves! I came looking for gemstones and found myself trapped by ancient pressure plates.'
    },
    {
      speaker: 'Aren',
      text: 'Did you find anything related to the Royal Seal?'
    },
    {
      speaker: 'Lost Explorer Vikram',
      text: 'Indeed! In the deepest chamber rests the golden chest of the Solar Dynasty. Take these crystal fragments—they refract light onto the chest’s locking eye!'
    }
  ],
  inscription_1: [
    {
      speaker: 'First Pillar of Suryagarh',
      text: '“In the first era, the Sun bathed the stone lions in dawn light. Truth is born from vigilance.” [Glyph 1: DAWN - Recorded in Quest Log]'
    }
  ],
  inscription_2: [
    {
      speaker: 'Second Pillar of Suryagarh',
      text: '“In the second era, the kingdom’s granaries flourished as justice reigned over the courts.” [Glyph 2: JUSTICE - Recorded in Quest Log]'
    }
  ],
  inscription_3: [
    {
      speaker: 'Third Pillar of Suryagarh',
      text: '“In the third era, kings surrendered their ego to the solar flame, uniting mortal strength with eternity.” [Glyph 3: ETERNITY - Recorded in Quest Log]'
    }
  ],
  palace_throne_inscription: [
    {
      speaker: 'Throne of King Harsha',
      text: '“To the Guardian who stands before this empty throne: Place the Royal Seal upon the altar, and the golden stairs to the Sun Temple shall awaken.”'
    }
  ],
  solar_crown_altar: [
    {
      speaker: 'The Sun Altar of Suryagarh',
      text: 'The golden dais hums with primordial warmth. Four radiant solar dials orbit the crystal pedestal of the Solar Crown.'
    }
  ]
};
