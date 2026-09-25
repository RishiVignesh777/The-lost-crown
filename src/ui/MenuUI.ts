export class MenuUI {
  private container: HTMLDivElement;
  public isOpen = false;

  constructor(
    private onResume: () => void,
    private onSave: () => void,
    private onRestart: () => void
  ) {
    const root = document.getElementById('ui-root') || document.body;
    this.container = document.createElement('div');
    this.container.className = 'hidden absolute inset-0 bg-[#0e0b08]/90 backdrop-blur-md flex items-center justify-center pointer-events-auto z-50 p-4';
    root.appendChild(this.container);

    this.container.innerHTML = `
      <div class="w-[520px] max-w-full bg-[#1b130a] border-2 border-[#d4af37] rounded-lg p-6 shadow-2xl text-center">
        <h2 class="text-2xl font-bold font-serif text-[#f5c542] tracking-wider mb-1">THE LOST CROWN</h2>
        <div class="text-xs tracking-widest text-[#d4af37] font-serif uppercase mb-6">FALL OF SURYAGARH • 3D ARCHIVE</div>

        <div class="space-y-3.5 mb-8">
          <button id="menu-resume" class="w-full py-2.5 bg-[#2c1d10] hover:bg-[#4a341f] border border-[#d4af37] text-[#ffe599] font-serif text-sm tracking-wide rounded cursor-pointer transition">RESUME EXPLORATION</button>
          <button id="menu-save" class="w-full py-2.5 bg-[#2c1d10] hover:bg-[#4a341f] border border-[#d4af37] text-[#ffe599] font-serif text-sm tracking-wide rounded cursor-pointer transition">INSCRIBE TO ARCHIVE (SAVE)</button>
          <button id="menu-controls" class="w-full py-2.5 bg-[#2c1d10] hover:bg-[#4a341f] border border-[#d4af37] text-[#ffe599] font-serif text-sm tracking-wide rounded cursor-pointer transition">CONTROLS & LORE GUIDE</button>
          <button id="menu-restart" class="w-full py-2.5 bg-[#3a1515] hover:bg-[#5c2323] border border-[#e74c3c] text-white font-serif text-sm tracking-wide rounded cursor-pointer transition">RESTART FROM KINGDOM GATE</button>
        </div>

        <div id="menu-guide" class="hidden text-left bg-[#100a06] border border-[#5c4323] rounded p-4 text-xs text-[#d6c7b0] space-y-2 mb-4">
          <div class="font-bold text-[#f5c542] font-serif">KEYBOARD & MOUSE CONTROLS:</div>
          <div>• Movement: <span class="text-white">W / A / S / D</span> or <span class="text-white">Arrow Keys</span></div>
          <div>• Camera: <span class="text-white">Mouse Drag / Look</span></div>
          <div>• Sprint: Hold <span class="text-white">SHIFT</span></div>
          <div>• Jump: <span class="text-white">SPACE</span></div>
          <div>• Interact / Talk / Align: <span class="text-white">E</span></div>
          <div>• Talwar Blade Strike: <span class="text-white">Click</span> / Touch Button</div>
          <div>• Inventory & Relics: <span class="text-white">I</span></div>
          <div>• Ancient Kingdom Map: <span class="text-white">M</span></div>
          <div>• Quest Log: <span class="text-white">J</span></div>
        </div>

        <div class="text-[11px] text-[#7f715e] font-serif">Ancient Mythical Kingdom of Suryagarh • Babylon.js 3D Engine</div>
      </div>
    `;

    this.container.querySelector('#menu-resume')?.addEventListener('click', () => this.onResume());
    this.container.querySelector('#menu-save')?.addEventListener('click', () => this.onSave());
    this.container.querySelector('#menu-restart')?.addEventListener('click', () => this.onRestart());

    const guideEl = this.container.querySelector('#menu-guide') as HTMLDivElement;
    this.container.querySelector('#menu-controls')?.addEventListener('click', () => {
      guideEl.classList.toggle('hidden');
    });
  }

  public show(): void {
    this.isOpen = true;
    this.container.classList.remove('hidden');
  }

  public hide(): void {
    this.isOpen = false;
    this.container.classList.add('hidden');
  }
}
