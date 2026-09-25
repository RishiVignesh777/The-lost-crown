export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  quantity: number;
  category: 'relic' | 'key' | 'scroll' | 'material';
  lore?: string;
}

export const GAME_ITEMS: Record<string, InventoryItem> = {
  ancient_coins: {
    id: 'ancient_coins',
    name: 'Ancient Dinars',
    description: 'Gold stamped coins depicting the rising solar disk of Suryagarh.',
    icon: 'ancient_coins',
    quantity: 1,
    category: 'material',
    lore: 'Minted in the third century of Suryagarh. Merchants across the subcontinent prized their purity.'
  },
  royal_seal: {
    id: 'royal_seal',
    name: 'Royal Seal of Suryagarh',
    description: 'The golden signet of the solar dynasty, capable of unlocking royal palace vaults.',
    icon: 'royal_seal',
    quantity: 1,
    category: 'relic',
    lore: 'Carved from meteoric gold, bearing the sunburst and lion that commanded the kingdom’s armies.'
  },
  temple_key: {
    id: 'temple_key',
    name: 'Temple Key',
    description: 'A heavy bronze key adorned with lotus petals, unlocking temple sanctum gates.',
    icon: 'temple_key',
    quantity: 1,
    category: 'key',
    lore: 'Bestowed only upon High Keepers sworn to protect the eternal flame of the Sun.'
  },
  sun_stone: {
    id: 'sun_stone',
    name: 'Sun Stone',
    description: 'A luminous amber jewel warm to the touch, humming with solar energy.',
    icon: 'sun_stone',
    quantity: 1,
    category: 'relic',
    lore: 'Legend holds that the stone retains the daylight of Suryagarh’s golden era.'
  },
  ancient_scroll: {
    id: 'ancient_scroll',
    name: 'Ancient Scroll of Kings',
    description: 'A weathered papyrus manuscript recording the rituals of the Solar Crown.',
    icon: 'ancient_scroll',
    quantity: 1,
    category: 'scroll',
    lore: 'Written by the Royal Astronomer Rishi, recording the alignment needed to awaken the Sun Altar.'
  },
  bronze_emblem: {
    id: 'bronze_emblem',
    name: 'Bronze Emblem',
    description: 'A circular military badge carried by the Guardians of Suryagarh.',
    icon: 'bronze_emblem',
    quantity: 1,
    category: 'relic',
    lore: 'Aren recognizes this emblem—it is identical to the one pinned to his guardian armor.'
  },
  crystal_fragment: {
    id: 'crystal_fragment',
    name: 'Luminescent Crystal Fragment',
    description: 'A glowing cyan crystal harvested from the deep subterranean chambers.',
    icon: 'crystal_fragment',
    quantity: 1,
    category: 'material',
    lore: 'Its internal refraction matches the optics needed to direct the cave puzzle beams.'
  },
  solar_crown: {
    id: 'solar_crown',
    name: 'The Solar Crown',
    description: 'The lost sacred crown of Suryagarh. Its return will reignite the kingdom’s eternal light.',
    icon: 'solar_crown',
    quantity: 1,
    category: 'relic',
    lore: 'Worn by King Harsha at the apex of Suryagarh. When the crown fell into darkness, the kingdom crumbled.'
  }
};
