import { InventoryItem } from '../data/items';

export class InventoryUI {
  private container: HTMLDivElement;
  private gridEl: HTMLDivElement;
  private itemNameEl: HTMLDivElement;
  private itemDescEl: HTMLDivElement;
  private itemLoreEl: HTMLDivElement;
  public isOpen = false;

  constructor(private onClose: () => void) {
    const root = document.getElementById('ui-root') || document.body;
    this.container = document.createElement('div');
    this.container.className = 'hidden absolute inset-0 bg-[#0e0b08]/85 backdrop-blur-md flex items-center justify-center pointer-events-auto z-50 p-4';
    root.appendChild(this.container);

    this.container.innerHTML = `
      <div class="w-[780px] max-w-full bg-[#1b130a] border-2 border-[#d4af37] rounded-lg p-6 shadow-2xl relative">
        <button id="inv-close" class="absolute top-4 right-4 text-[#d4af37] hover:text-white font-serif text-lg font-bold cursor-pointer">✕</button>
        <div class="text-center mb-5">
          <h2 class="text-xl font-bold font-serif text-[#f5c542] tracking-wider">ROYAL GUARDIAN INVENTORY & RELICS</h2>
          <div class="h-0.5 w-36 bg-[#8c6d36] mx-auto mt-2"></div>
        </div>

        <!-- 8 Grid Slots -->
        <div id="inv-grid" class="grid grid-cols-4 gap-4 mb-6"></div>

        <!-- Item Detail Card -->
        <div class="bg-[#120c06] border border-[#d4af37]/60 rounded p-4">
          <div id="inv-detail-name" class="text-base font-bold font-serif text-[#f5c542] mb-1">Select an item to inspect its history</div>
          <div id="inv-detail-desc" class="text-xs text-[#e8d7b8] mb-2 leading-relaxed"></div>
          <div id="inv-detail-lore" class="text-xs italic text-[#a89f91]"></div>
        </div>
      </div>
    `;

    this.gridEl = this.container.querySelector('#inv-grid') as HTMLDivElement;
    this.itemNameEl = this.container.querySelector('#inv-detail-name') as HTMLDivElement;
    this.itemDescEl = this.container.querySelector('#inv-detail-desc') as HTMLDivElement;
    this.itemLoreEl = this.container.querySelector('#inv-detail-lore') as HTMLDivElement;

    this.container.querySelector('#inv-close')?.addEventListener('click', () => this.onClose());
  }

  public show(items: InventoryItem[]): void {
    this.isOpen = true;
    this.gridEl.innerHTML = '';

    for (let i = 0; i < 8; i++) {
      const item = items[i];
      const slot = document.createElement('div');
      slot.className = 'h-20 bg-[#24180d] border border-[#8c6d36] rounded flex flex-col items-center justify-center p-2 relative hover:border-[#f5c542] cursor-pointer transition';

      if (item) {
        slot.innerHTML = `
          <img src="/assets/objects/${item.icon}.png" class="w-10 h-10 object-contain mb-1" onerror="this.src='/assets/objects/royal_seal.png'" />
          <span class="text-[10px] text-[#ffe599] font-serif text-center truncate w-full">${item.name}</span>
          <span class="absolute bottom-1 right-1.5 text-[10px] font-mono text-white bg-black/60 px-1 rounded">x${item.quantity}</span>
        `;
        slot.addEventListener('click', () => {
          this.itemNameEl.innerText = `${item.name} (x${item.quantity})`;
          this.itemDescEl.innerText = item.description;
          this.itemLoreEl.innerText = item.lore ? `“${item.lore}”` : '';
        });
      } else {
        slot.innerHTML = `<span class="text-[10px] text-[#554332] font-serif">Empty Slot</span>`;
      }

      this.gridEl.appendChild(slot);
    }

    if (items.length > 0) {
      const first = items[0];
      this.itemNameEl.innerText = `${first.name} (x${first.quantity})`;
      this.itemDescEl.innerText = first.description;
      this.itemLoreEl.innerText = first.lore ? `“${first.lore}”` : '';
    }

    this.container.classList.remove('hidden');
  }

  public hide(): void {
    this.isOpen = false;
    this.container.classList.add('hidden');
  }
}
