import {
  Engine,
  Scene,
  Vector3
} from '@babylonjs/core';
import { Player } from '../player/Player';
import { PlayerController } from '../player/PlayerController';
import { WorldManager } from '../world/WorldManager';
import { LocationManager } from '../world/LocationManager';
import { InteractionSystem } from '../gameplay/InteractionSystem';
import { InventorySystem } from '../gameplay/InventorySystem';
import { QuestSystem } from '../gameplay/QuestSystem';
import { DialogueSystem } from '../gameplay/DialogueSystem';
import { SaveSystem, SaveData3D } from '../gameplay/SaveSystem';
import { HUD } from '../ui/HUD';
import { DialogueUI } from '../ui/DialogueUI';
import { InventoryUI } from '../ui/InventoryUI';
import { QuestUI } from '../ui/QuestUI';
import { MapUI } from '../ui/MapUI';
import { MenuUI } from '../ui/MenuUI';
import { playSound, startAmbientLoop } from '../utils/helpers';
import { AUDIO_PATHS } from '../utils/constants';

export class KingdomScene {
  public engine: Engine;
  public scene: Scene;

  // Player & Controls
  public player!: Player;
  public controller!: PlayerController;

  // Systems
  public worldManager!: WorldManager;
  public locationManager!: LocationManager;
  public interactionSystem!: InteractionSystem;
  public inventorySystem!: InventorySystem;
  public questSystem!: QuestSystem;
  public dialogueSystem!: DialogueSystem;

  // UIs
  public hud!: HUD;
  public dialogueUI!: DialogueUI;
  public inventoryUI!: InventoryUI;
  public questUI!: QuestUI;
  public mapUI!: MapUI;
  public menuUI!: MenuUI;

  private isPaused = false;
  private isDefeated = false;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    this.scene = new Scene(this.engine);
    this.scene.collisionsEnabled = true;

    // Force immediate resize
    this.engine.resize();

    // Use ResizeObserver for iframe responsive scaling
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        this.engine.resize();
      });
      ro.observe(canvas);
    }

    this.initGame();
  }

  public resetToStart(): void {
    SaveSystem.clearSave();
    this.player.health = this.player.maxHealth;
    this.hud.setHealth(this.player.health, this.player.maxHealth);
    this.locationManager.changeLocation('kingdom_gate', new Vector3(0, 0, -45), 0);
    this.updateHUDQuest();
    this.hud.showToast('Awakened at the Ancient Kingdom Gate');
  }

  private initGame(): void {
    // 1. Initialize Gameplay Systems
    const existingSave = SaveSystem.loadGame();

    this.interactionSystem = new InteractionSystem();
    this.inventorySystem = new InventorySystem(this.scene, existingSave?.inventory);
    this.questSystem = new QuestSystem(existingSave?.quests);
    this.dialogueSystem = new DialogueSystem();

    // 2. Initialize Player & World
    const startLoc = existingSave?.location || 'kingdom_gate';
    const startPos = existingSave?.playerPosition
      ? new Vector3(existingSave.playerPosition.x, existingSave.playerPosition.y, existingSave.playerPosition.z)
      : new Vector3(0, 0, -45);

    this.player = new Player(this.scene, startPos);
    this.controller = new PlayerController(this.scene, this.player, this.canvas);

    this.worldManager = new WorldManager(
      this.scene,
      this.interactionSystem,
      this.inventorySystem,
      (deadEnemy) => {
        this.hud.showToast(`Defeated ${deadEnemy.name}! Found relics.`);
      }
    );
    this.locationManager = new LocationManager(
      this.scene,
      this.worldManager,
      this.player,
      this.interactionSystem,
      this.questSystem,
      this.inventorySystem,
      (config) => {
        this.hud.setLocation(config.name, config.regionTitle);
        this.hud.showToast(`Entering ${config.name}`);
      },
      (msg) => {
        this.hud.showToast(msg);
      },
      (chronicleKey, title) => {
        this.startDialogue(chronicleKey, title, () => {
          this.questSystem.addChronicle(chronicleKey);
          this.hud.showToast(`Deciphered ${title}! Royal archive updated.`);
        });
      }
    );

    // 3. Initialize UI overlays
    this.initUI();

    // 4. Setup Key Bindings
    this.setupKeyBindings();

    // 5. Load Initial Location
    this.locationManager.changeLocation(startLoc, startPos, existingSave?.playerRotation);

    // 6. Start Ambient Audio
    startAmbientLoop(AUDIO_PATHS.AMBIENT, 0.35);

    // 7. Engine Render Loop
    this.engine.runRenderLoop(() => {
      if (!this.isPaused) {
        const delta = this.engine.getDeltaTime() / 1000;
        this.update(delta);
      }
      this.scene.render();
    });

    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  private initUI(): void {
    this.hud = new HUD(
      () => this.toggleInventory(),
      () => this.toggleMap(),
      () => this.toggleQuests(),
      () => this.toggleMenu(),
      () => this.handlePlayerAttack(),
      () => this.handleInteraction(),
      () => this.controller.tryJump(),
      (x, z) => this.controller.virtualInput.set(x, 0, z)
    );

    this.dialogueUI = new DialogueUI(() => {
      this.advanceDialogue();
    });

    this.inventoryUI = new InventoryUI(() => {
      this.inventoryUI.hide();
    });

    this.questUI = new QuestUI(() => {
      this.questUI.hide();
    });

    this.mapUI = new MapUI(
      () => this.mapUI.hide(),
      (targetLocId) => {
        this.locationManager.changeLocation(targetLocId);
        this.hud.showToast(`Celestial Passage to ${this.locationManager.currentConfig.name}!`);
      }
    );

    this.menuUI = new MenuUI(
      () => this.menuUI.hide(),
      () => this.saveGame(),
      () => {
        SaveSystem.clearSave();
        window.location.reload();
      }
    );

    this.updateHUDQuest();
  }

  public handlePlayerAttack(): void {
    if (this.player.isAttacking || this.player.isHurt || this.player.isVictorious || this.isDefeated) return;
    this.player.attack();
    const hitEnemy = this.worldManager.enemyManager.checkPlayerAttack(this.player);
    if (hitEnemy) {
      this.hud.showToast(`Struck ${hitEnemy.name}! (${Math.max(0, hitEnemy.health)} HP)`);
    }
  }

  private setupKeyBindings(): void {
    window.addEventListener('keydown', (e) => {
      if (this.dialogueUI.isOpen) {
        if (e.code === 'Space' || e.code === 'KeyE') {
          this.advanceDialogue();
        }
        return;
      }

      switch (e.code) {
        case 'KeyF':
          this.handlePlayerAttack();
          break;
        case 'KeyE':
          this.handleInteraction();
          break;
        case 'KeyI':
          this.toggleInventory();
          break;
        case 'KeyM':
          this.toggleMap();
          break;
        case 'KeyJ':
          this.toggleQuests();
          break;
        case 'Escape':
          this.toggleMenu();
          break;
      }
    });

    this.canvas.addEventListener('pointerdown', (e) => {
      if (e.button === 0 && !this.isAnyUIOpen()) {
        this.handlePlayerAttack();
      }
    });
  }

  private isAnyUIOpen(): boolean {
    return (
      this.dialogueUI.isOpen ||
      this.inventoryUI.isOpen ||
      this.questUI.isOpen ||
      this.mapUI.isOpen ||
      this.menuUI.isOpen
    );
  }

  public handleInteraction(): void {
    // 1. Check NPC interaction
    const closestNPC = this.worldManager.npcManager.getClosestNPC(this.player.root.position, 4.2);
    if (closestNPC) {
      closestNPC.lookAt(this.player.root.position);
      this.startDialogue(closestNPC.config.dialogueKey, closestNPC.config.name, () => {
        this.handleDialogueReward(closestNPC.config.id);
      });
      return;
    }

    // 2. Check registered 3D trigger interaction
    if (this.interactionSystem.triggerInteract()) {
      return;
    }

    // 3. Check item pickups
    // Automatically handled if close
  }

  private startDialogue(key: string, speaker: string, onComplete?: () => void): void {
    const firstLine = this.dialogueSystem.startDialogue(key, onComplete);
    this.dialogueUI.show(firstLine.speaker || speaker, firstLine.text);
  }

  private advanceDialogue(): void {
    const res = this.dialogueSystem.advance();
    if (res.finished) {
      this.dialogueUI.hide();
    } else {
      this.dialogueUI.show(res.speaker, res.text);
    }
  }

  private handleDialogueReward(npcId: string): void {
    if (npcId === 'historian') {
      this.questSystem.completeObjective('quest_1_broken_gate', 'talk_historian');
    } else if (npcId === 'merchant') {
      this.questSystem.completeObjective('quest_3_lost_merchant', 'find_kavi');
      if (!this.inventorySystem.hasItem('temple_key')) {
        this.inventorySystem.addItem('temple_key', 1);
        this.questSystem.completeObjective('quest_3_lost_merchant', 'obtain_temple_key');
        this.hud.showToast('Received Temple Key from Merchant Kavi!');
      }
    } else if (npcId === 'keeper') {
      const allPillarsRead =
        this.questSystem.isObjectiveCompleted('quest_2_whispers_temple', 'read_pillar_1') &&
        this.questSystem.isObjectiveCompleted('quest_2_whispers_temple', 'read_pillar_2') &&
        this.questSystem.isObjectiveCompleted('quest_2_whispers_temple', 'read_pillar_3');

      if (allPillarsRead) {
        this.questSystem.completeObjective('quest_2_whispers_temple', 'speak_keeper');
        this.questSystem.completeQuest('quest_2_whispers_temple');
        this.hud.showToast('Keeper Somesh blesses your passage into the Sacred Forest!');
      }
    } else if (npcId === 'scholar') {
      if (!this.inventorySystem.hasItem('ancient_scroll')) {
        this.inventorySystem.addItem('ancient_scroll', 1);
        this.hud.showToast('Received Scroll of Kings! Celestial Code: 3 - 1 - 4 - 2');
      }
    } else if (npcId === 'explorer') {
      this.questSystem.completeObjective('quest_4_royal_seal', 'speak_explorer');
    }

    this.updateHUDQuest();
  }

  public toggleInventory(): void {
    if (this.inventoryUI.isOpen) {
      this.inventoryUI.hide();
    } else {
      this.closeOtherUIs();
      this.inventoryUI.show(this.inventorySystem.getItems());
    }
  }

  public toggleMap(): void {
    if (this.mapUI.isOpen) {
      this.mapUI.hide();
    } else {
      this.closeOtherUIs();
      this.mapUI.show(
        this.locationManager.getLocation(),
        this.locationManager.currentConfig.name,
        this.locationManager.discoveredLocations
      );
    }
  }

  public toggleQuests(): void {
    if (this.questUI.isOpen) {
      this.questUI.hide();
    } else {
      this.closeOtherUIs();
      this.questUI.show(this.questSystem.getQuests(), this.questSystem.discoveredChronicles);
    }
  }

  public toggleMenu(): void {
    if (this.menuUI.isOpen) {
      this.menuUI.hide();
    } else {
      this.closeOtherUIs();
      this.menuUI.show();
    }
  }

  private closeOtherUIs(): void {
    this.dialogueUI.hide();
    this.inventoryUI.hide();
    this.mapUI.hide();
    this.questUI.hide();
    this.menuUI.hide();
  }

  public saveGame(): void {
    const p = this.player.root.position;
    const saveData: SaveData3D = {
      location: this.locationManager.getLocation(),
      playerPosition: { x: p.x, y: p.y, z: p.z },
      playerRotation: this.player.root.rotation.y,
      health: this.player.health,
      maxHealth: this.player.maxHealth,
      inventory: this.inventorySystem.getItems(),
      quests: this.questSystem.getQuests(),
      solvedPuzzles: [],
      discoveredLocations: Array.from(this.locationManager.discoveredLocations),
      solarCrownClaimed: this.player.isVictorious,
      lastSavedAt: Date.now()
    };
    SaveSystem.saveGame(saveData);
    this.hud.showToast('Progress Inscribed to Royal Archive!');
    playSound(AUDIO_PATHS.PICKUP, 0.4);
  }

  private updateHUDQuest(): void {
    const activeQ = this.questSystem.getActiveQuest();
    if (activeQ) {
      const activeObj = activeQ.objectives.find(o => !o.completed);
      this.hud.setQuest(activeQ.title, activeObj ? `• ${activeObj.text}` : 'Quest Objectives Complete');
    } else {
      this.hud.setQuest('Kingdom Restored', 'The Solar Crown reigns eternal upon Suryagarh');
    }
  }

  private update(deltaTime: number): void {
    // Check if player is defeated
    if (this.player.health <= 0 && !this.isDefeated) {
      this.isDefeated = true;
      this.hud.showDefeatScreen(() => {
        this.player.health = this.player.maxHealth;
        this.hud.setHealth(this.player.health, this.player.maxHealth);
        this.player.root.position.copyFrom(this.locationManager.currentConfig.spawnPosition);
        this.isDefeated = false;
        this.hud.showToast('Rise, Guardian! The Sun of Suryagarh awaits.');
      });
      return;
    }

    // Check if dialogue limits player movement
    if (this.dialogueUI.isOpen) {
      this.player.update(deltaTime);
      return;
    }

    this.controller.update(deltaTime);
    this.worldManager.update(deltaTime, this.player);
    this.hud.setHealth(this.player.health, this.player.maxHealth);

    // Update interaction system with player position
    this.interactionSystem.update(this.player.root.position);
    this.hud.setPrompt(this.interactionSystem.activePrompt);

    // Update 3D Mini-Map Radar blips
    const pPos = this.player.root.position;
    const blips: Array<{ x: number; z: number; type: 'npc' | 'enemy' | 'portal' | 'objective' }> = [];

    this.worldManager.npcManager.getNPCs().forEach(npc => {
      blips.push({ x: npc.root.position.x, z: npc.root.position.z, type: 'npc' });
    });

    this.worldManager.enemyManager.getLivingEnemies().forEach(e => {
      blips.push({ x: e.root.position.x, z: e.root.position.z, type: 'enemy' });
    });

    this.locationManager.currentConfig.connectedLocations.forEach(c => {
      blips.push({ x: c.triggerPosition.x, z: c.triggerPosition.z, type: 'portal' });
    });

    this.hud.updateRadar(
      { x: pPos.x, z: pPos.z },
      this.player.root.rotation.y,
      blips
    );

    // Check proximity to world pickups
    this.checkWorldPickupProximity();
  }

  private checkWorldPickupProximity(): void {
    // Check if player walks over world relics
    const pPos = this.player.root.position;
    // Iterate through items
    const items = (this.inventorySystem as any).worldPickups;
    if (items) {
      items.forEach((item: any, id: string) => {
        if (Vector3.Distance(pPos, item.position) <= 2.2) {
          const collectedItem = this.inventorySystem.addItem(item.itemId, 1);
          this.inventorySystem.removeWorldPickup(id);
          this.hud.showToast(`Acquired ${collectedItem.name}!`);

          if (item.itemId === 'royal_seal') {
            this.questSystem.completeObjective('quest_4_royal_seal', 'retrieve_royal_seal');
            this.questSystem.completeQuest('quest_4_royal_seal');
            this.updateHUDQuest();
          } else if (item.itemId === 'sun_stone') {
            this.questSystem.completeObjective('quest_5_last_king', 'obtain_sun_stone');
            this.questSystem.completeQuest('quest_5_last_king');
            this.updateHUDQuest();
          } else if (item.itemId === 'solar_crown') {
            this.handleVictory();
          }
        }
      });
    }
  }

  private handleVictory(): void {
    this.player.setVictory();
    this.questSystem.completeObjective('quest_6_solar_crown', 'recover_crown');
    this.questSystem.completeQuest('quest_6_solar_crown');
    this.updateHUDQuest();

    playSound(AUDIO_PATHS.PUZZLE, 1.0);
    this.hud.showToast('THE SOLAR CROWN HAS RETURNED! DAWN BLESSES SURYAGARH!', 6000);

    setTimeout(() => {
      this.showVictoryModal();
    }, 3000);
  }

  private showVictoryModal(): void {
    const root = document.getElementById('ui-root') || document.body;
    const modal = document.createElement('div');
    modal.className = 'absolute inset-0 bg-[#0e0b08]/90 backdrop-blur-md flex items-center justify-center pointer-events-auto z-50 p-6';
    modal.innerHTML = `
      <div class="w-[640px] max-w-full bg-[#1b130a] border-2 border-[#ffd700] rounded-lg p-8 shadow-2xl text-center">
        <div class="w-20 h-20 mx-auto mb-3">
          <img src="/assets/objects/solar_crown.png" class="w-full h-full object-contain animate-bounce" />
        </div>
        <h1 class="text-3xl font-bold font-serif text-[#ffd700] tracking-wider mb-2">THE SOLAR CROWN RESTORED</h1>
        <h2 class="text-sm font-serif text-[#e8d7b8] tracking-widest uppercase mb-6">DAWN RETURNS TO SURYAGARH</h2>
        <p class="text-sm text-[#ffe599] leading-relaxed mb-6 font-serif">
          Through steadfast courage, wisdom, and the sacred code of the ancients, Guardian Aren has reignited the Sun Altar.
          The golden warmth spreads across the seven regions of Suryagarh, restoring the royal rivers and banishing the darkness forever.
        </p>
        <button id="btn-replay" class="px-8 py-3 bg-[#b8860b] hover:bg-[#d4af37] text-black font-serif font-bold text-sm tracking-widest uppercase rounded shadow cursor-pointer transition">
          EXPLORE ANEW
        </button>
      </div>
    `;

    root.appendChild(modal);
    modal.querySelector('#btn-replay')?.addEventListener('click', () => {
      SaveSystem.clearSave();
      window.location.reload();
    });
  }
}
