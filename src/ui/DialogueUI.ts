export class DialogueUI {
  private container: HTMLDivElement;
  private speakerEl: HTMLDivElement;
  private bodyEl: HTMLDivElement;
  private portraitEl: HTMLImageElement;
  public isOpen = false;

  constructor(private onAdvance: () => void) {
    const root = document.getElementById('ui-root') || document.body;
    this.container = document.createElement('div');
    this.container.className = 'hidden absolute inset-x-0 bottom-8 flex justify-center pointer-events-auto z-40';
    root.appendChild(this.container);

    this.container.innerHTML = `
      <div class="w-[860px] max-w-[94vw] bg-[#1a120b]/95 border-2 border-[#d4af37] rounded-lg p-5 shadow-2xl flex items-center space-x-5 cursor-pointer backdrop-blur-sm">
        <div class="w-20 h-20 rounded border border-[#ffd700] overflow-hidden shrink-0 bg-[#0e0a07] flex items-center justify-center">
          <img id="dlg-portrait" src="/assets/characters/aren_portrait.png" class="w-full h-full object-cover" />
        </div>
        <div class="flex-1">
          <div id="dlg-speaker" class="text-base font-bold font-serif text-[#f5c542] mb-1">Speaker</div>
          <div id="dlg-text" class="text-sm font-serif text-[#e8d7b8] leading-relaxed">Dialogue text goes here...</div>
          <div class="mt-2 text-right text-[11px] text-[#d4af37] tracking-wider uppercase font-serif">[ Click / Space to continue ]</div>
        </div>
      </div>
    `;

    this.speakerEl = this.container.querySelector('#dlg-speaker') as HTMLDivElement;
    this.bodyEl = this.container.querySelector('#dlg-text') as HTMLDivElement;
    this.portraitEl = this.container.querySelector('#dlg-portrait') as HTMLImageElement;

    this.container.addEventListener('click', () => {
      this.onAdvance();
    });
  }

  public show(speaker: string, text: string): void {
    this.isOpen = true;
    this.speakerEl.innerText = speaker;
    this.bodyEl.innerText = text;

    if (speaker.toLowerCase().includes('aren')) {
      this.portraitEl.src = '/assets/characters/aren_portrait.png';
    } else {
      this.portraitEl.src = '/assets/ui/parchment_box.png';
    }

    this.container.classList.remove('hidden');
  }

  public hide(): void {
    this.isOpen = false;
    this.container.classList.add('hidden');
  }
}
