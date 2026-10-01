export class HUD {
  private container: HTMLDivElement;
  private promptEl: HTMLDivElement;
  private toastEl: HTMLDivElement;
  private healthFillEl: HTMLDivElement;
  private healthValEl: HTMLDivElement;
  private questTitleEl: HTMLDivElement;
  private questObjEl: HTMLDivElement;
  private locationBadgeEl: HTMLDivElement;
  private toastTimer?: number;

  // Radar
  private radarCanvas?: HTMLCanvasElement;
  private radarCtx?: CanvasRenderingContext2D | null;
  private coordsEl?: HTMLDivElement;

  // Joystick
  private joyKnob?: HTMLDivElement;
  private joyActive = false;
  private joyTouchId: number | null = null;
  private joyOrigin = { x: 0, y: 0 };
  private defeatOverlay?: HTMLDivElement;

  constructor(
    private onOpenInventory: () => void,
    private onOpenMap: () => void,
    private onOpenQuests: () => void,
    private onOpenMenu: () => void,
    private onAttack: () => void,
    private onInteract: () => void,
    private onJump: () => void,
    private onVirtualMove?: (x: number, z: number) => void
  ) {
    const root = document.getElementById('ui-root') || document.body;
    this.container = document.createElement('div');
    this.container.className = 'w-full h-full relative pointer-events-none select-none';
    root.appendChild(this.container);

    this.container.innerHTML = `
      <!-- TOP LEFT: AREN STATUS -->
      <div class="absolute top-4 left-4 pointer-events-auto bg-[#18110b]/90 border border-[#d4af37]/80 rounded p-3 shadow-lg min-w-[220px]">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-xs font-bold tracking-widest text-[#f5c542] font-serif">AREN • ROYAL GUARDIAN</span>
          <span id="hud-hp-val" class="text-xs font-mono text-[#ffe599]">100 HP</span>
        </div>
        <div class="w-full h-2.5 bg-[#3a1010] rounded overflow-hidden">
          <div id="hud-hp-fill" class="h-full bg-[#d93838] transition-all duration-200" style="width: 100%"></div>
        </div>
        <div id="hud-location-badge" class="mt-2 text-[11px] text-[#cfbe9e] border-t border-[#4d3b24] pt-1">
          Ancient Kingdom Gate
        </div>
      </div>

      <!-- 3D COMPASS & RADAR MINI-MAP -->
      <div id="hud-minimap-container" class="absolute top-28 left-4 pointer-events-auto bg-[#18110b]/92 border-2 border-[#d4af37] rounded-lg p-2 shadow-2xl flex flex-col items-center cursor-pointer hover:border-[#ffd700] transition group">
        <div class="flex items-center justify-between w-full px-1 mb-1">
          <span class="text-[9px] font-serif font-bold text-[#d4af37] uppercase tracking-wider">3D RADAR</span>
          <span id="hud-coords" class="text-[9px] font-mono text-[#ffe599]">X: 0 Z: -45</span>
        </div>
        <div class="relative w-28 h-28 rounded-full bg-[#120a05] border border-[#8c6d36] overflow-hidden flex items-center justify-center shadow-inner">
          <canvas id="hud-radar-canvas" width="112" height="112" class="w-full h-full block"></canvas>
          <div class="absolute inset-0 pointer-events-none rounded-full border border-[#d4af37]/30"></div>
          <span class="absolute top-0.5 text-[8px] font-bold text-[#f5c542] font-mono pointer-events-none">N</span>
          <span class="absolute bottom-0.5 text-[8px] font-bold text-[#8c6d36] font-mono pointer-events-none">S</span>
          <span class="absolute right-1 text-[8px] font-bold text-[#8c6d36] font-mono pointer-events-none">E</span>
          <span class="absolute left-1 text-[8px] font-bold text-[#8c6d36] font-mono pointer-events-none">W</span>
        </div>
        <div class="text-[9px] text-[#ffe599] font-serif mt-1 group-hover:text-white transition flex items-center space-x-1">
          <span>🗺️ [M] 3D Realm Map</span>
        </div>
      </div>

      <!-- TOP RIGHT: QUEST TRACKER -->
      <div class="absolute top-4 right-4 pointer-events-auto bg-[#18110b]/90 border border-[#d4af37]/80 rounded p-3 shadow-lg max-w-[320px]">
        <div class="text-[10px] tracking-widest uppercase text-[#d4af37] font-serif mb-0.5">CURRENT QUEST</div>
        <div id="hud-quest-title" class="text-sm font-bold text-[#f5c542] font-serif mb-1">The Broken Gate</div>
        <div id="hud-quest-obj" class="text-xs text-[#e8d7b8] leading-tight">Find the mechanism to open the kingdom gate</div>
      </div>

      <!-- CENTER INTERACTION PROMPT -->
      <div class="absolute inset-x-0 bottom-28 flex justify-center pointer-events-none">
        <div id="hud-prompt" class="hidden pointer-events-auto bg-[#1a120b]/95 border-2 border-[#f5c542] rounded-full px-6 py-2 shadow-2xl animate-pulse text-[#ffe599] font-serif text-sm tracking-wide">
          [E] Examine
        </div>
      </div>

      <!-- ITEM PICKUP TOAST -->
      <div class="absolute top-20 inset-x-0 flex justify-center pointer-events-none">
        <div id="hud-toast" class="hidden pointer-events-auto bg-[#24180d]/95 border border-[#ffd700] rounded px-6 py-2.5 shadow-xl text-[#f5c542] font-serif text-sm tracking-wide">
          Discovered Ancient Item!
        </div>
      </div>

      <!-- BOTTOM RIGHT QUICK SHORTCUTS -->
      <div class="absolute bottom-4 right-4 pointer-events-auto flex items-center space-x-2 bg-[#18110b]/90 border border-[#8c6d36] rounded px-3 py-1.5 shadow">
        <button id="btn-bag" class="px-2.5 py-1 text-xs font-serif text-[#f5c542] hover:text-white bg-[#2b1e12] hover:bg-[#4d3824] rounded transition cursor-pointer">[I] Bag</button>
        <button id="btn-map" class="px-2.5 py-1 text-xs font-serif text-[#f5c542] hover:text-white bg-[#2b1e12] hover:bg-[#4d3824] rounded transition cursor-pointer">[M] Map</button>
        <button id="btn-log" class="px-2.5 py-1 text-xs font-serif text-[#f5c542] hover:text-white bg-[#2b1e12] hover:bg-[#4d3824] rounded transition cursor-pointer">[J] Quests</button>
        <button id="btn-pause" class="px-2.5 py-1 text-xs font-serif text-[#f5c542] hover:text-white bg-[#2b1e12] hover:bg-[#4d3824] rounded transition cursor-pointer">[ESC] Menu</button>
      </div>

      <!-- MOBILE / TOUCH VIRTUAL JOYSTICK (BOTTOM LEFT) -->
      <div id="virtual-joystick-base" class="md:hidden absolute bottom-6 left-6 w-28 h-28 rounded-full border-2 border-[#d4af37]/60 bg-black/40 backdrop-blur-sm pointer-events-auto flex items-center justify-center touch-none">
        <div id="virtual-joystick-knob" class="w-12 h-12 rounded-full bg-[#f5c542] border-2 border-white shadow-lg pointer-events-none transform transition-transform duration-75"></div>
      </div>

      <!-- MOBILE ACTION BUTTONS (VISIBLE ON TOUCH/SMALL SCREENS) -->
      <div class="md:hidden absolute bottom-16 right-4 pointer-events-auto flex flex-col space-y-2">
        <button id="btn-touch-attack" class="w-14 h-14 rounded-full bg-[#8e1b1b] border-2 border-[#ffd700] text-white font-serif text-xs font-bold shadow-lg flex items-center justify-center active:scale-95 cursor-pointer">ATTACK</button>
        <button id="btn-touch-interact" class="w-14 h-14 rounded-full bg-[#b8860b] border-2 border-[#ffd700] text-white font-serif text-xs font-bold shadow-lg flex items-center justify-center active:scale-95 cursor-pointer">ACT</button>
        <button id="btn-touch-jump" class="w-14 h-14 rounded-full bg-[#2c3e50] border-2 border-[#d4af37] text-white font-serif text-xs font-bold shadow-lg flex items-center justify-center active:scale-95 cursor-pointer">JUMP</button>
      </div>
    `;

    this.promptEl = this.container.querySelector('#hud-prompt') as HTMLDivElement;
    this.toastEl = this.container.querySelector('#hud-toast') as HTMLDivElement;
    this.healthFillEl = this.container.querySelector('#hud-hp-fill') as HTMLDivElement;
    this.healthValEl = this.container.querySelector('#hud-hp-val') as HTMLDivElement;
    this.questTitleEl = this.container.querySelector('#hud-quest-title') as HTMLDivElement;
    this.questObjEl = this.container.querySelector('#hud-quest-obj') as HTMLDivElement;
    this.locationBadgeEl = this.container.querySelector('#hud-location-badge') as HTMLDivElement;
    this.radarCanvas = this.container.querySelector('#hud-radar-canvas') as HTMLCanvasElement;
    this.coordsEl = this.container.querySelector('#hud-coords') as HTMLDivElement;
    if (this.radarCanvas) {
      this.radarCtx = this.radarCanvas.getContext('2d');
    }

    // Attach button events
    this.container.querySelector('#hud-minimap-container')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onOpenMap();
    });

    this.container.querySelector('#btn-bag')?.addEventListener('click', (e) => { e.stopPropagation(); this.onOpenInventory(); });
    this.container.querySelector('#btn-map')?.addEventListener('click', (e) => { e.stopPropagation(); this.onOpenMap(); });
    this.container.querySelector('#btn-log')?.addEventListener('click', (e) => { e.stopPropagation(); this.onOpenQuests(); });
    this.container.querySelector('#btn-pause')?.addEventListener('click', (e) => { e.stopPropagation(); this.onOpenMenu(); });

    this.container.querySelector('#btn-touch-attack')?.addEventListener('click', (e) => { e.stopPropagation(); this.onAttack(); });
    this.container.querySelector('#btn-touch-interact')?.addEventListener('click', (e) => { e.stopPropagation(); this.onInteract(); });
    this.container.querySelector('#btn-touch-jump')?.addEventListener('click', (e) => { e.stopPropagation(); this.onJump(); });

    // Setup Virtual Joystick
    this.setupJoystick();
  }

  private setupJoystick(): void {
    const joyBase = this.container.querySelector('#virtual-joystick-base') as HTMLDivElement;
    this.joyKnob = this.container.querySelector('#virtual-joystick-knob') as HTMLDivElement;
    if (!joyBase || !this.joyKnob) return;

    const maxRadius = 40;

    const handlePointerDown = (e: PointerEvent) => {
      e.stopPropagation();
      this.joyActive = true;
      this.joyTouchId = e.pointerId;
      const rect = joyBase.getBoundingClientRect();
      this.joyOrigin = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      joyBase.setPointerCapture(e.pointerId);
      handlePointerMove(e);
    };

    const handlePointerMove = (e: PointerEvent) => {
      e.stopPropagation();
      if (!this.joyActive || e.pointerId !== this.joyTouchId) return;

      let dx = e.clientX - this.joyOrigin.x;
      let dy = e.clientY - this.joyOrigin.y;
      const distance = Math.hypot(dx, dy);

      if (distance > maxRadius) {
        dx = (dx / distance) * maxRadius;
        dy = (dy / distance) * maxRadius;
      }

      if (this.joyKnob) {
        this.joyKnob.style.transform = `translate(${dx}px, ${dy}px)`;
      }

      // Normalized input: dx maps to right/left, -dy maps to forward/back
      const normX = dx / maxRadius;
      const normZ = -dy / maxRadius;

      if (this.onVirtualMove) {
        this.onVirtualMove(normX, normZ);
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (e.pointerId !== this.joyTouchId) return;
      this.joyActive = false;
      this.joyTouchId = null;
      if (this.joyKnob) {
        this.joyKnob.style.transform = 'translate(0px, 0px)';
      }
      if (this.onVirtualMove) {
        this.onVirtualMove(0, 0);
      }
    };

    joyBase.addEventListener('pointerdown', handlePointerDown);
    joyBase.addEventListener('pointermove', handlePointerMove);
    joyBase.addEventListener('pointerup', handlePointerUp);
    joyBase.addEventListener('pointercancel', handlePointerUp);
  }

  public setHealth(health: number, maxHealth: number): void {
    this.healthValEl.innerText = `${Math.ceil(health)} HP`;
    const pct = Math.max(0, Math.min(100, (health / maxHealth) * 100));
    this.healthFillEl.style.width = `${pct}%`;
    this.healthFillEl.style.backgroundColor = pct > 30 ? '#d93838' : '#8a1818';
  }

  public setLocation(name: string, regionTitle: string): void {
    this.locationBadgeEl.innerHTML = `<span class="text-[#f5c542] font-semibold">${name}</span> • ${regionTitle}`;
  }

  public setQuest(title: string, objective: string): void {
    this.questTitleEl.innerText = title;
    this.questObjEl.innerText = objective;
  }

  public setPrompt(promptText: string | null): void {
    if (promptText) {
      this.promptEl.innerText = promptText;
      this.promptEl.classList.remove('hidden');
    } else {
      this.promptEl.classList.add('hidden');
    }
  }

  public showToast(message: string, duration = 3000): void {
    this.toastEl.innerText = message;
    this.toastEl.classList.remove('hidden');
    if (this.toastTimer) {
      window.clearTimeout(this.toastTimer);
    }
    this.toastTimer = window.setTimeout(() => {
      this.toastEl.classList.add('hidden');
    }, duration);
  }

  public showDefeatScreen(onRespawn: () => void): void {
    if (this.defeatOverlay) return;

    this.defeatOverlay = document.createElement('div');
    this.defeatOverlay.className = 'absolute inset-0 bg-[#0e0b08]/90 backdrop-blur-md flex items-center justify-center pointer-events-auto z-50 p-6';
    this.defeatOverlay.innerHTML = `
      <div class="w-[520px] max-w-full bg-[#1b0e0e] border-2 border-[#b02a2a] rounded-lg p-8 shadow-2xl text-center">
        <h1 class="text-3xl font-bold font-serif text-[#e74c3c] tracking-wider mb-2">GUARDIAN FELLED</h1>
        <p class="text-sm text-[#e8b4b4] leading-relaxed mb-6 font-serif">
          The shadows of Suryagarh tested your resolve. But the blood of ancient guardians still pulses within you.
        </p>
        <button id="btn-respawn" class="px-8 py-3 bg-[#8b1e1e] hover:bg-[#b02a2a] text-white font-serif font-bold text-sm tracking-widest uppercase rounded shadow cursor-pointer transition">
          RISE AGAIN
        </button>
      </div>
    `;

    this.container.appendChild(this.defeatOverlay);
    this.defeatOverlay.querySelector('#btn-respawn')?.addEventListener('click', () => {
      this.defeatOverlay?.remove();
      this.defeatOverlay = undefined;
      onRespawn();
    });
  }

  public setVisible(visible: boolean): void {
    this.container.style.display = visible ? 'block' : 'none';
  }

  public updateRadar(
    playerPos: { x: number; z: number },
    playerRotY: number,
    blips: Array<{ x: number; z: number; type: 'npc' | 'enemy' | 'portal' | 'objective' }> = []
  ): void {
    if (this.coordsEl) {
      this.coordsEl.innerText = `X: ${Math.round(playerPos.x)} Z: ${Math.round(playerPos.z)}`;
    }
    if (!this.radarCtx || !this.radarCanvas) return;

    const ctx = this.radarCtx;
    const w = this.radarCanvas.width;
    const h = this.radarCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radarRange = 45; // meters radius
    const scale = (cx - 8) / radarRange;

    ctx.clearRect(0, 0, w, h);

    // Dark parchment background
    ctx.fillStyle = '#120a05';
    ctx.beginPath();
    ctx.arc(cx, cy, cx - 2, 0, Math.PI * 2);
    ctx.fill();

    // Concentric range rings
    ctx.strokeStyle = '#5c4323';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, (cx - 8) * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, cx - 8, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshairs
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.2)';
    ctx.beginPath();
    ctx.moveTo(cx, 6);
    ctx.lineTo(cx, h - 6);
    ctx.moveTo(6, cy);
    ctx.lineTo(w - 6, cy);
    ctx.stroke();

    // Draw blips
    blips.forEach(b => {
      const dx = b.x - playerPos.x;
      const dz = b.z - playerPos.z;
      const dist = Math.hypot(dx, dz);
      if (dist > radarRange) return;

      const screenX = cx + dx * scale;
      const screenY = cy - dz * scale; // Invert Z for top-down canvas

      ctx.beginPath();
      if (b.type === 'enemy') {
        ctx.fillStyle = '#e74c3c';
        ctx.arc(screenX, screenY, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (b.type === 'npc') {
        ctx.fillStyle = '#f1c40f';
        ctx.arc(screenX, screenY, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (b.type === 'portal') {
        ctx.strokeStyle = '#e67e22';
        ctx.lineWidth = 1.5;
        ctx.arc(screenX, screenY, 4, 0, Math.PI * 2);
        ctx.stroke();
      } else if (b.type === 'objective') {
        ctx.fillStyle = '#1abc9c';
        ctx.arc(screenX, screenY, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw Player Pointer in center
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-playerRotY); // Rotate arrow to match 3D player heading

    ctx.fillStyle = '#f5c542';
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(4, 5);
    ctx.lineTo(0, 3);
    ctx.lineTo(-4, 5);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }
}
