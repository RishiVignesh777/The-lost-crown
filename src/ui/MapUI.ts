export class MapUI {
  private container: HTMLDivElement;
  private currentLocEl: HTMLDivElement;
  public isOpen = false;

  constructor(private onClose: () => void) {
    const root = document.getElementById('ui-root') || document.body;
    this.container = document.createElement('div');
    this.container.className = 'hidden absolute inset-0 bg-[#0e0b08]/85 backdrop-blur-md flex items-center justify-center pointer-events-auto z-50 p-4';
    root.appendChild(this.container);

    this.container.innerHTML = `
      <div class="w-[880px] max-w-full bg-[#1b130a] border-2 border-[#d4af37] rounded-lg p-5 shadow-2xl relative">
        <button id="map-close" class="absolute top-4 right-4 text-[#d4af37] hover:text-white font-serif text-lg font-bold cursor-pointer">✕</button>
        <div class="text-center mb-3">
          <h2 class="text-lg font-bold font-serif text-[#f5c542] tracking-wider">ANCIENT CARTOGRAPHY OF SURYAGARH</h2>
          <div id="map-current-loc" class="text-xs text-[#ffe599] font-serif mt-0.5">CURRENT LOCATION: ANCIENT KINGDOM GATE</div>
        </div>

        <div class="relative w-full aspect-[16/9] max-h-[62vh] rounded overflow-hidden border border-[#8c6d36] bg-[#22160d]">
          <img src="/assets/ui/world_map.png" class="w-full h-full object-cover" />
          
          <!-- Location Markers -->
          <div id="marker-kingdom_gate" class="absolute bottom-[20%] left-[16%] flex flex-col items-center">
            <div class="w-3.5 h-3.5 rounded-full bg-[#f5c542] border-2 border-white shadow"></div>
            <span class="text-[11px] font-serif bg-black/75 text-[#f5c542] px-1.5 py-0.5 rounded mt-1">Kingdom Gate</span>
          </div>

          <div id="marker-royal_market" class="absolute bottom-[35%] left-[32%] flex flex-col items-center">
            <div class="w-3.5 h-3.5 rounded-full bg-[#f5c542] border-2 border-white shadow"></div>
            <span class="text-[11px] font-serif bg-black/75 text-[#f5c542] px-1.5 py-0.5 rounded mt-1">Royal Market</span>
          </div>

          <div id="marker-temple_district" class="absolute top-[45%] left-[48%] flex flex-col items-center">
            <div class="w-3.5 h-3.5 rounded-full bg-[#f5c542] border-2 border-white shadow"></div>
            <span class="text-[11px] font-serif bg-black/75 text-[#f5c542] px-1.5 py-0.5 rounded mt-1">Temple District</span>
          </div>

          <div id="marker-sacred_forest" class="absolute top-[52%] right-[22%] flex flex-col items-center">
            <div class="w-3.5 h-3.5 rounded-full bg-[#f5c542] border-2 border-white shadow"></div>
            <span class="text-[11px] font-serif bg-black/75 text-[#f5c542] px-1.5 py-0.5 rounded mt-1">Sacred Forest</span>
          </div>

          <div id="marker-ancient_cave" class="absolute bottom-[20%] right-[14%] flex flex-col items-center">
            <div class="w-3.5 h-3.5 rounded-full bg-[#f5c542] border-2 border-white shadow"></div>
            <span class="text-[11px] font-serif bg-black/75 text-[#f5c542] px-1.5 py-0.5 rounded mt-1">Ancient Cave</span>
          </div>

          <div id="marker-royal_palace" class="absolute top-[22%] left-[40%] flex flex-col items-center">
            <div class="w-3.5 h-3.5 rounded-full bg-[#f5c542] border-2 border-white shadow"></div>
            <span class="text-[11px] font-serif bg-black/75 text-[#f5c542] px-1.5 py-0.5 rounded mt-1">Royal Palace</span>
          </div>

          <div id="marker-sun_temple" class="absolute top-[18%] right-[38%] flex flex-col items-center">
            <div class="w-3.5 h-3.5 rounded-full bg-[#ffd700] border-2 border-white shadow animate-bounce"></div>
            <span class="text-[11px] font-serif bg-black/75 text-[#ffd700] font-bold px-1.5 py-0.5 rounded mt-1">Sun Temple</span>
          </div>
        </div>
      </div>
    `;

    this.currentLocEl = this.container.querySelector('#map-current-loc') as HTMLDivElement;
    this.container.querySelector('#map-close')?.addEventListener('click', () => this.onClose());
  }

  public show(currentLocationId: string, locationName: string): void {
    this.isOpen = true;
    this.currentLocEl.innerText = `YOU ARE CURRENTLY AT: ${locationName.toUpperCase()}`;

    // Highlight active pin
    const allMarkers = this.container.querySelectorAll('[id^="marker-"]');
    allMarkers.forEach(m => {
      const dot = m.querySelector('div');
      if (dot) {
        dot.className = 'w-3.5 h-3.5 rounded-full bg-[#f5c542] border-2 border-white shadow';
      }
    });

    const activeMarker = this.container.querySelector(`#marker-${currentLocationId}`);
    if (activeMarker) {
      const activeDot = activeMarker.querySelector('div');
      if (activeDot) {
        activeDot.className = 'w-5 h-5 rounded-full bg-[#e74c3c] border-2 border-white shadow-lg animate-pulse';
      }
    }

    this.container.classList.remove('hidden');
  }

  public hide(): void {
    this.isOpen = false;
    this.container.classList.add('hidden');
  }
}
