import { SaveSystem } from '../gameplay/SaveSystem';

export class MenuScene {
  private overlay: HTMLDivElement;

  constructor(private onStartGame: (isNew: boolean) => void) {
    const root = document.getElementById('ui-root') || document.body;
    this.overlay = document.createElement('div');
    this.overlay.className = 'absolute inset-0 bg-[#0e0b08]/92 flex items-center justify-center pointer-events-auto z-40 p-4 transition-opacity duration-500';

    const hasSave = SaveSystem.hasSave();

    this.overlay.innerHTML = `
      <div class="w-[580px] max-w-full bg-[#1b130a] border-2 border-[#d4af37] rounded-lg p-8 shadow-2xl text-center">
        <h1 class="text-4xl font-bold font-serif text-[#f5c542] tracking-wider mb-1">THE LOST CROWN</h1>
        <div class="text-sm tracking-widest text-[#d4af37] font-serif uppercase mb-8">FALL OF SURYAGARH • 3D EDITION</div>

        <div class="space-y-4 max-w-sm mx-auto mb-8">
          <button id="menu-btn-new" class="w-full py-3 bg-[#b8860b] hover:bg-[#d4af37] text-black font-serif font-bold text-sm tracking-widest uppercase rounded shadow cursor-pointer transition">
            NEW GAME
          </button>
          
          <button id="menu-btn-cont" class="w-full py-3 ${hasSave ? 'bg-[#2c1d10] hover:bg-[#4a341f] text-[#ffe599]' : 'bg-[#1e1711] text-[#695b4c] cursor-not-allowed'} border border-[#d4af37] font-serif font-bold text-sm tracking-widest uppercase rounded shadow cursor-pointer transition" ${hasSave ? '' : 'disabled'}>
            CONTINUE EXPEDITION
          </button>

          <button id="menu-btn-lore" class="w-full py-2.5 bg-[#20150b] hover:bg-[#382615] border border-[#8c6d36] text-[#e8d7b8] font-serif text-xs tracking-wider uppercase rounded cursor-pointer transition">
            LORE & GUARDIAN GUIDE
          </button>
        </div>

        <div id="menu-lore-panel" class="hidden text-left bg-[#100a06] border border-[#5c4323] rounded p-4 text-xs text-[#d6c7b0] leading-relaxed space-y-2 mb-6">
          <div class="font-bold text-[#f5c542] font-serif">THE LEGEND OF SURYAGARH:</div>
          <div>Centuries ago, Suryagarh shone as the radiant crown of the realm under King Harsha. When the ancient Solar Crown vanished, the kingdom fell to silence and dust.</div>
          <div>Awakened near the ruined outer gate, Guardian Aren must retrace the sacred path through 7 connected ancient regions, align the celestial mechanisms, and bring dawn back to Suryagarh.</div>
        </div>

        <div class="text-xs text-[#8c7a65] font-serif">A 3D Third-Person Mythical Adventure • Built with Babylon.js & TypeScript</div>
      </div>
    `;

    root.appendChild(this.overlay);

    this.overlay.querySelector('#menu-btn-new')?.addEventListener('click', () => {
      this.close();
      this.onStartGame(true);
    });

    this.overlay.querySelector('#menu-btn-cont')?.addEventListener('click', () => {
      if (hasSave) {
        this.close();
        this.onStartGame(false);
      }
    });

    const lorePanel = this.overlay.querySelector('#menu-lore-panel') as HTMLDivElement;
    this.overlay.querySelector('#menu-btn-lore')?.addEventListener('click', () => {
      lorePanel.classList.toggle('hidden');
    });
  }

  public close(): void {
    this.overlay.style.opacity = '0';
    setTimeout(() => {
      this.overlay.remove();
    }, 500);
  }
}
