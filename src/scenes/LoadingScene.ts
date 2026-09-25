export class LoadingScene {
  private overlay: HTMLDivElement;

  constructor() {
    const root = document.getElementById('ui-root') || document.body;
    this.overlay = document.createElement('div');
    this.overlay.className = 'absolute inset-0 bg-[#0e0b08] flex flex-col items-center justify-center pointer-events-auto z-50 transition-opacity duration-700';
    this.overlay.innerHTML = `
      <div class="text-center p-8 max-w-md">
        <h1 class="text-3xl font-bold font-serif text-[#f5c542] tracking-wider mb-2">THE LOST CROWN</h1>
        <div class="text-xs tracking-widest text-[#d4af37] font-serif uppercase mb-8">FALL OF SURYAGARH • 3D</div>
        
        <div class="w-64 h-2 bg-[#2a1b0e] border border-[#8c6d36] rounded overflow-hidden mx-auto mb-4">
          <div id="loading-bar" class="h-full bg-[#f5c542] w-0 transition-all duration-300"></div>
        </div>
        <div id="loading-status" class="text-xs text-[#ffe599] font-serif">Awakening the 3D Kingdom of Suryagarh...</div>
      </div>
    `;
    root.appendChild(this.overlay);
  }

  public setProgress(percent: number, status?: string): void {
    const bar = this.overlay.querySelector('#loading-bar') as HTMLDivElement;
    const statusEl = this.overlay.querySelector('#loading-status') as HTMLDivElement;
    if (bar) bar.style.width = `${percent}%`;
    if (statusEl && status) statusEl.innerText = status;
  }

  public finish(): Promise<void> {
    return new Promise(resolve => {
      this.setProgress(100, 'Kingdom Awakened.');
      setTimeout(() => {
        this.overlay.style.opacity = '0';
        setTimeout(() => {
          this.overlay.remove();
          resolve();
        }, 700);
      }, 400);
    });
  }
}
