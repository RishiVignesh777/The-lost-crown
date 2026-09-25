import { Quest } from '../data/quests';

export class QuestUI {
  private container: HTMLDivElement;
  private listEl: HTMLDivElement;
  public isOpen = false;

  constructor(private onClose: () => void) {
    const root = document.getElementById('ui-root') || document.body;
    this.container = document.createElement('div');
    this.container.className = 'hidden absolute inset-0 bg-[#0e0b08]/85 backdrop-blur-md flex items-center justify-center pointer-events-auto z-50 p-4';
    root.appendChild(this.container);

    this.container.innerHTML = `
      <div class="w-[740px] max-w-full bg-[#1b130a] border-2 border-[#d4af37] rounded-lg p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        <button id="quest-close" class="absolute top-4 right-4 text-[#d4af37] hover:text-white font-serif text-lg font-bold cursor-pointer">✕</button>
        <div class="text-center mb-4 shrink-0">
          <h2 class="text-xl font-bold font-serif text-[#f5c542] tracking-wider">CHRONICLES OF SURYAGARH • QUEST LOG</h2>
          <div class="h-0.5 w-36 bg-[#8c6d36] mx-auto mt-2"></div>
        </div>

        <div id="quest-list" class="overflow-y-auto space-y-4 pr-2 flex-1"></div>
      </div>
    `;

    this.listEl = this.container.querySelector('#quest-list') as HTMLDivElement;
    this.container.querySelector('#quest-close')?.addEventListener('click', () => this.onClose());
  }

  public show(quests: Quest[]): void {
    this.isOpen = true;
    this.listEl.innerHTML = '';

    quests.forEach(q => {
      const qCard = document.createElement('div');
      qCard.className = `p-3.5 rounded border ${q.completed ? 'bg-[#142617]/70 border-[#27ae60]/60' : 'bg-[#22160d] border-[#8c6d36]'}`;

      const statusTag = q.completed
        ? `<span class="text-xs font-serif text-[#2ecc71] font-bold">✓ COMPLETED</span>`
        : `<span class="text-xs font-serif text-[#f5c542] font-bold">▶ ACTIVE</span>`;

      const objectivesHtml = q.objectives
        .map(o => `
          <div class="flex items-center space-x-2 text-xs mt-1 ${o.completed ? 'text-[#2ecc71]' : 'text-[#d6c7b0]'}">
            <span>${o.completed ? '☑' : '☐'}</span>
            <span>${o.text}</span>
          </div>
        `)
        .join('');

      qCard.innerHTML = `
        <div class="flex items-center justify-between mb-1">
          <h3 class="font-serif font-bold text-sm ${q.completed ? 'text-[#82e0aa]' : 'text-[#f5c542]'}">${q.title}</h3>
          ${statusTag}
        </div>
        <p class="text-xs text-[#a89f91] mb-2 leading-relaxed">${q.description}</p>
        <div class="pl-2 border-l-2 border-[#5c4323] space-y-0.5">
          ${objectivesHtml}
        </div>
      `;

      this.listEl.appendChild(qCard);
    });

    this.container.classList.remove('hidden');
  }

  public hide(): void {
    this.isOpen = false;
    this.container.classList.add('hidden');
  }
}
