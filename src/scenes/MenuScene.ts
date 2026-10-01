import { SaveSystem } from '../gameplay/SaveSystem';

export class MenuScene {
  private overlay: HTMLDivElement;

  constructor(private onStartGame: (isNew: boolean) => void) {
    const root = document.getElementById('ui-root') || document.body;
    this.overlay = document.createElement('div');
    this.overlay.className = 'absolute inset-0 bg-[#0e0b08]/65 backdrop-blur-[2px] flex items-center justify-center pointer-events-auto z-40 p-4 transition-all duration-500';

    const hasSave = SaveSystem.hasSave();

    this.overlay.innerHTML = `
      <div class="w-[620px] max-w-full bg-[#18110a]/92 border-2 border-[#d4af37] rounded-xl p-8 shadow-2xl text-center relative overflow-hidden backdrop-blur-md">
        <!-- Sun Embellishment -->
        <div class="w-16 h-16 rounded-full border-2 border-[#f5c542] flex items-center justify-center mx-auto mb-3 bg-[#24170a] text-[#f5c542] text-2xl shadow-lg animate-pulse">
          ☀️
        </div>

        <h1 class="text-3xl sm:text-4xl font-black font-serif text-[#f5c542] tracking-wider mb-1 drop-shadow-md">THE LOST CROWN</h1>
        <div class="text-xs sm:text-sm tracking-widest text-[#d4af37] font-serif uppercase mb-6">FALL OF SURYAGARH • 3D ACTION-ADVENTURE</div>

        <div class="space-y-3.5 max-w-md mx-auto mb-6">
          <button id="menu-btn-play" class="w-full py-3.5 bg-gradient-to-r from-[#b8860b] via-[#f5c542] to-[#b8860b] hover:from-[#d4af37] hover:to-[#ffd700] text-black font-serif font-black text-sm tracking-widest uppercase rounded-lg shadow-xl cursor-pointer transition transform active:scale-98 flex items-center justify-center space-x-2">
            <span>⚔️</span>
            <span>${hasSave ? 'CONTINUE 3D EXPEDITION' : 'ENTER 3D SURYAGARH'}</span>
          </button>
          
          ${hasSave ? `
            <button id="menu-btn-new" class="w-full py-2.5 bg-[#2c1d10] hover:bg-[#4a341f] border border-[#d4af37] text-[#ffe599] font-serif font-bold text-xs tracking-widest uppercase rounded-lg shadow cursor-pointer transition">
              START NEW EXPEDITION (RESET PROGRESS)
            </button>
          ` : ''}

          <button id="menu-btn-lore" class="w-full py-2 bg-[#1f150b] hover:bg-[#382615] border border-[#8c6d36] text-[#e8d7b8] font-serif text-xs tracking-wider uppercase rounded-lg cursor-pointer transition">
            📜 LORE & CONTROLS GUIDE
          </button>
        </div>

        <!-- CONTROLS & LORE GUIDE (EXPANDABLE) -->
        <div id="menu-lore-panel" class="hidden text-left bg-[#100a06]/95 border border-[#5c4323] rounded-lg p-4 text-xs text-[#d6c7b0] leading-relaxed space-y-2 mb-4 shadow-inner">
          <div class="font-bold text-[#f5c542] font-serif flex items-center space-x-2">
            <span>🎮 3D CONTROLS:</span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-[11px]">
            <div>• <span class="text-white font-bold">W / A / S / D</span>: Move Aren</div>
            <div>• <span class="text-white font-bold">Mouse Drag</span>: 3D Camera Look</div>
            <div>• <span class="text-white font-bold">Left Click / Tap</span>: Talwar Strike</div>
            <div>• <span class="text-white font-bold">Spacebar</span>: Jump</div>
            <div>• <span class="text-white font-bold">E Key</span>: Interact / Mechanism</div>
            <div>• <span class="text-white font-bold">M Key</span>: 3D Realm Map</div>
          </div>
          <div class="w-full h-px bg-[#3d2a14] my-2"></div>
          <div class="text-[11px] text-[#cfbe9e]">
            <span class="font-bold text-[#f5c542]">THE QUEST:</span> Reclaim the Solar Crown across 7 connected 3D realms: Kingdom Gate, Royal Market, Temple District, Sacred Forest, Ancient Cave, Royal Palace, and Sun Temple.
          </div>
        </div>

        <div class="text-[11px] text-[#a8937b] font-serif flex items-center justify-center space-x-2">
          <span>Click button or press <kbd class="px-1.5 py-0.5 bg-[#2b1f13] border border-[#73582d] rounded text-[#ffe599]">SPACE</kbd> / <kbd class="px-1.5 py-0.5 bg-[#2b1f13] border border-[#73582d] rounded text-[#ffe599]">ENTER</kbd> to begin</span>
        </div>
      </div>
    `;

    root.appendChild(this.overlay);

    const startGame = (isNew: boolean) => {
      this.close();
      this.onStartGame(isNew);
    };

    this.overlay.querySelector('#menu-btn-play')?.addEventListener('click', () => {
      startGame(!hasSave);
    });

    this.overlay.querySelector('#menu-btn-new')?.addEventListener('click', () => {
      startGame(true);
    });

    const lorePanel = this.overlay.querySelector('#menu-lore-panel') as HTMLDivElement;
    this.overlay.querySelector('#menu-btn-lore')?.addEventListener('click', () => {
      lorePanel.classList.toggle('hidden');
    });

    // Space or Enter to quickly jump into 3D action
    const keyHandler = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        window.removeEventListener('keydown', keyHandler);
        startGame(!hasSave);
      }
    };
    window.addEventListener('keydown', keyHandler);
  }

  public close(): void {
    this.overlay.style.opacity = '0';
    setTimeout(() => {
      this.overlay.remove();
    }, 450);
  }
}
