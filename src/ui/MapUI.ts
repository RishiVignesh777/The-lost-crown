import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  DirectionalLight,
  Vector3,
  Color3,
  Color4,
  MeshBuilder,
  StandardMaterial,
  Mesh,
  TransformNode,
  ActionManager,
  ExecuteCodeAction
} from '@babylonjs/core';
import { ANCIENT_LOCATIONS_3D, AncientLocation3DConfig } from '../data/locations';
import { playSound } from '../utils/helpers';
import { AUDIO_PATHS } from '../utils/constants';

interface MapNodeData {
  id: string;
  name: string;
  title: string;
  description: string;
  pos: Vector3;
  mesh: Mesh;
  beacon: Mesh;
  labelMesh: Mesh;
}

export class MapUI {
  private container: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private engine: Engine | null = null;
  private scene: Scene | null = null;
  private camera: ArcRotateCamera | null = null;

  public isOpen = false;
  private nodes: Map<string, MapNodeData> = new Map();
  private selectedLocId = 'kingdom_gate';
  private currentLocId = 'kingdom_gate';
  private discoveredLocations: Set<string> = new Set(['kingdom_gate']);

  // UI Panels
  private regionTitleEl: HTMLDivElement;
  private regionSubtitleEl: HTMLDivElement;
  private regionDescEl: HTMLDivElement;
  private regionStatusEl: HTMLDivElement;
  private regionChronicleTitleEl: HTMLDivElement;
  private regionChronicleTextEl: HTMLDivElement;
  private travelBtn: HTMLButtonElement;
  private currentLocBadgeEl: HTMLDivElement;

  constructor(
    private onClose: () => void,
    private onTravel?: (targetLocationId: string) => void
  ) {
    const root = document.getElementById('ui-root') || document.body;
    this.container = document.createElement('div');
    this.container.className = 'hidden absolute inset-0 bg-[#070503]/90 backdrop-blur-md flex flex-col pointer-events-auto z-50 p-3 select-none transition-all duration-300';
    root.appendChild(this.container);

    this.container.innerHTML = `
      <!-- TOP NAVIGATION BAR -->
      <div class="flex items-center justify-between px-4 py-2.5 bg-[#171009]/95 border-b border-[#b8860b] shadow-md shrink-0">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 rounded border border-[#f5c542] flex items-center justify-center bg-[#24170a] text-[#f5c542] font-serif font-bold text-sm shadow">
            ☀️
          </div>
          <div>
            <h2 class="text-base font-bold font-serif text-[#f5c542] tracking-wider leading-none">3D CELESTIAL REALM MAP</h2>
            <div id="map-3d-cur-badge" class="text-[11px] text-[#e8d7b8] font-serif mt-0.5">CURRENT REGION: ANCIENT KINGDOM GATE</div>
          </div>
        </div>

        <!-- CAMERA CONTROLS -->
        <div class="flex items-center space-x-2">
          <button id="map-btn-orbit" class="px-3 py-1 bg-[#26190c] hover:bg-[#3d2914] border border-[#8c6d36] text-[#ffe599] text-xs font-serif rounded shadow cursor-pointer transition">
            🔄 ORBIT VIEW
          </button>
          <button id="map-btn-top" class="px-3 py-1 bg-[#26190c] hover:bg-[#3d2914] border border-[#8c6d36] text-[#ffe599] text-xs font-serif rounded shadow cursor-pointer transition">
            📐 TOP-DOWN
          </button>
          <button id="map-btn-focus-aren" class="px-3 py-1 bg-[#4a2e12] hover:bg-[#69421a] border border-[#f5c542] text-[#fff] text-xs font-serif font-bold rounded shadow cursor-pointer transition">
            📍 LOCATE AREN
          </button>
          <button id="map-3d-close" class="ml-4 px-3 py-1 bg-[#421414] hover:bg-[#631e1e] border border-[#d9534f] text-white font-serif font-bold text-xs rounded shadow cursor-pointer transition">
            ✕ CLOSE MAP
          </button>
        </div>
      </div>

      <!-- MAIN 3D VIEWPORT CONTAINER -->
      <div class="flex-1 relative overflow-hidden rounded-b-lg border-x border-b border-[#b8860b]/60 flex">
        <!-- 3D BABYLON CANVAS -->
        <div class="flex-1 relative h-full">
          <canvas id="realm-3d-canvas" class="w-full h-full block outline-none cursor-grab active:cursor-grabbing"></canvas>
          
          <!-- HINT OVERLAY -->
          <div class="absolute bottom-3 left-3 bg-[#120c06]/85 border border-[#8c6d36]/70 rounded px-3 py-1.5 text-[11px] font-serif text-[#d6c7b0] pointer-events-none shadow backdrop-blur-xs flex items-center space-x-2">
            <span>🖱️ Click & Drag to Orbit</span>
            <span>•</span>
            <span>Scroll / Pinch to Zoom</span>
            <span>•</span>
            <span>Click any 3D Landmark to Inspect</span>
          </div>
        </div>

        <!-- RIGHT-HAND REGION INSPECTION PANEL -->
        <div class="w-80 max-w-[35vw] bg-[#140e08]/95 border-l border-[#8c6d36] p-4 flex flex-col justify-between shadow-2xl overflow-y-auto">
          <div>
            <div class="flex items-center space-x-2 mb-2">
              <span id="region-status-badge" class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#382b13] text-[#f5c542] border border-[#8c6d36]">
                DISCOVERED
              </span>
            </div>

            <h3 id="region-info-title" class="text-xl font-bold font-serif text-[#f5c542] leading-tight mb-1">Ancient Kingdom Gate</h3>
            <div id="region-info-subtitle" class="text-xs text-[#d4af37] font-serif uppercase tracking-wider mb-3">The Outer Bulwark of Suryagarh</div>

            <div class="w-full h-px bg-[#4d3a22] my-2"></div>

            <div class="text-xs font-serif text-[#dcd1be] leading-relaxed mb-4" id="region-info-desc">
              The monumental stone gate that once stood as the shield of Suryagarh.
            </div>

            <div class="bg-[#1c120a] border border-[#523d24] rounded p-3 text-xs space-y-1.5 mb-3">
              <div class="text-[#f5c542] font-bold font-serif">REGIONAL CHARACTERISTICS:</div>
              <div id="region-climate" class="text-[#cfbe9e]">• Ancient Sandstone Architecture</div>
              <div id="region-guardians" class="text-[#cfbe9e]">• Solar Gate Guardians & Archivists</div>
            </div>

            <!-- REGION STORY CHRONICLE -->
            <div class="bg-[#24170a]/90 border border-[#d4af37]/50 rounded-lg p-3 text-xs space-y-1.5 mb-3 shadow">
              <div class="text-[#f5c542] font-bold font-serif flex items-center space-x-1.5">
                <span>📜</span>
                <span id="region-chronicle-title">Chronicle I: The Shattered Bastion</span>
              </div>
              <div id="region-chronicle-text" class="text-[#e8d7b8] text-[11px] leading-relaxed italic">
                “When skies darkened without rain, King Harsha stationed three hundred guardians upon these bastions.”
              </div>
            </div>
          </div>

          <!-- FAST TRAVEL BUTTON -->
          <div class="pt-4 border-t border-[#4d3a22]">
            <button id="btn-fast-travel" class="w-full py-2.5 bg-[#b8860b] hover:bg-[#d4af37] text-black font-serif font-bold text-xs uppercase tracking-widest rounded shadow-lg cursor-pointer transition active:scale-98">
              ⚡ FAST TRAVEL HERE
            </button>
            <div class="text-[10px] text-center text-[#8a7761] mt-1.5 font-serif">Instantaneous Celestial Passage</div>
          </div>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#realm-3d-canvas') as HTMLCanvasElement;
    this.regionTitleEl = this.container.querySelector('#region-info-title') as HTMLDivElement;
    this.regionSubtitleEl = this.container.querySelector('#region-info-subtitle') as HTMLDivElement;
    this.regionDescEl = this.container.querySelector('#region-info-desc') as HTMLDivElement;
    this.regionStatusEl = this.container.querySelector('#region-status-badge') as HTMLDivElement;
    this.regionChronicleTitleEl = this.container.querySelector('#region-chronicle-title') as HTMLDivElement;
    this.regionChronicleTextEl = this.container.querySelector('#region-chronicle-text') as HTMLDivElement;
    this.currentLocBadgeEl = this.container.querySelector('#map-3d-cur-badge') as HTMLDivElement;
    this.travelBtn = this.container.querySelector('#btn-fast-travel') as HTMLButtonElement;

    // Button Events
    this.container.querySelector('#map-3d-close')?.addEventListener('click', () => {
      this.hide();
      this.onClose();
    });

    this.container.querySelector('#map-btn-orbit')?.addEventListener('click', () => {
      if (this.camera) {
        this.camera.setTarget(new Vector3(0, 0, 0));
        this.camera.alpha = -Math.PI / 2;
        this.camera.beta = Math.PI / 3.2;
        this.camera.radius = 70;
      }
    });

    this.container.querySelector('#map-btn-top')?.addEventListener('click', () => {
      if (this.camera) {
        this.camera.setTarget(new Vector3(0, 0, 0));
        this.camera.alpha = -Math.PI / 2;
        this.camera.beta = 0.05; // Straight top-down
        this.camera.radius = 85;
      }
    });

    this.container.querySelector('#map-btn-focus-aren')?.addEventListener('click', () => {
      this.focusLocation(this.currentLocId);
    });

    this.travelBtn.addEventListener('click', () => {
      if (this.onTravel) {
        playSound(AUDIO_PATHS.DOOR, 0.6);
        this.hide();
        this.onTravel(this.selectedLocId);
      }
    });
  }

  public show(
    currentLocationId: string,
    locationName: string,
    discoveredLocations?: Set<string>
  ): void {
    this.isOpen = true;
    this.currentLocId = currentLocationId;
    this.selectedLocId = currentLocationId;
    if (discoveredLocations) {
      this.discoveredLocations = discoveredLocations;
    }

    this.currentLocBadgeEl.innerText = `CURRENT REGION: ${locationName.toUpperCase()}`;
    this.container.classList.remove('hidden');

    // Init 3D Engine if not already active
    if (!this.engine) {
      this.init3DMapScene();
    } else {
      this.engine.resize();
      this.updateNodeHighlights();
      this.selectRegion(this.currentLocId);
    }
  }

  public hide(): void {
    this.isOpen = false;
    this.container.classList.add('hidden');
  }

  private init3DMapScene(): void {
    this.engine = new Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true });
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.04, 0.03, 0.02, 1.0);

    // Setup 3D Orbit Camera
    this.camera = new ArcRotateCamera(
      'MapCamera',
      -Math.PI / 2,
      Math.PI / 3.2,
      72,
      new Vector3(0, 0, 0),
      this.scene
    );
    this.camera.lowerRadiusLimit = 25;
    this.camera.upperRadiusLimit = 110;
    this.camera.lowerBetaLimit = 0.05;
    this.camera.upperBetaLimit = Math.PI / 2.1;
    this.camera.attachControl(this.canvas, true);
    this.camera.wheelPrecision = 40;

    // Map Lighting
    const hemiLight = new HemisphericLight('MapHemiLight', new Vector3(0, 1, 0), this.scene);
    hemiLight.intensity = 0.85;
    hemiLight.diffuse = Color3.FromHexString('#ffdf9e');
    hemiLight.groundColor = Color3.FromHexString('#4a2e12');

    const dirLight = new DirectionalLight('MapDirLight', new Vector3(-0.5, -1, 0.5).normalize(), this.scene);
    dirLight.intensity = 1.3;
    dirLight.diffuse = Color3.FromHexString('#ffd700');

    // Build 3D Map Cartographic World
    this.buildMapTerrain();
    this.buildLandmarks();
    this.buildConnectingRoads();
    this.buildCelestialCompass();
    this.buildMiniatureFloraAndDetails();

    // Start 3D Render Loop
    this.engine.runRenderLoop(() => {
      if (this.isOpen && this.scene) {
        this.scene.render();
      }
    });

    window.addEventListener('resize', () => {
      this.engine?.resize();
    });

    // Auto-focus current location
    this.selectRegion(this.currentLocId);
    this.focusLocation(this.currentLocId);
  }

  private buildMapTerrain(): void {
    if (!this.scene) return;
    const scene = this.scene;

    // Ancient Sandstone Sculpted Realm Base (Plateau relief)
    const baseMat = new StandardMaterial('mat_map_base', scene);
    baseMat.diffuseColor = Color3.FromHexString('#875c32');
    baseMat.specularColor = Color3.FromHexString('#ffe599');
    baseMat.specularPower = 32;

    const mapPlateau = MeshBuilder.CreateCylinder('Map_Plateau', {
      diameterTop: 82,
      diameterBottom: 88,
      height: 4,
      tessellation: 48
    }, scene);
    mapPlateau.position.y = -2;
    mapPlateau.material = baseMat;

    // Gilded Brass Rim
    const rimMat = new StandardMaterial('mat_map_rim', scene);
    rimMat.diffuseColor = Color3.FromHexString('#d4af37');
    rimMat.emissiveColor = Color3.FromHexString('#574209');

    const rim = MeshBuilder.CreateTorus('Map_Rim', {
      diameter: 83.5,
      thickness: 1.2,
      tessellation: 48
    }, scene);
    rim.position.y = 0.1;
    rim.material = rimMat;

    // Topographical relief features
    // 1. Northern Sacred Mountain (Sun Temple & Palace)
    const northMountainMat = new StandardMaterial('mat_north_mtn', scene);
    northMountainMat.diffuseColor = Color3.FromHexString('#a67c48');
    const northMtn = MeshBuilder.CreateCylinder('North_Mtn', {
      diameterTop: 22,
      diameterBottom: 38,
      height: 3.5,
      tessellation: 24
    }, scene);
    northMtn.position.set(0, 1.2, 24);
    northMtn.material = northMountainMat;

    // 2. Western Forest Valley (Greenish soil)
    const forestBasinMat = new StandardMaterial('mat_forest_basin', scene);
    forestBasinMat.diffuseColor = Color3.FromHexString('#335e26');
    const forestBasin = MeshBuilder.CreateCylinder('Forest_Basin', {
      diameter: 28,
      height: 0.4,
      tessellation: 24
    }, scene);
    forestBasin.position.set(-22, 0.2, 14);
    forestBasin.material = forestBasinMat;

    // 3. Eastern Cavern Chasm (Dark crag)
    const caveChasmMat = new StandardMaterial('mat_cave_chasm', scene);
    caveChasmMat.diffuseColor = Color3.FromHexString('#1c2833');
    const caveChasm = MeshBuilder.CreateBox('Cave_Chasm', {
      width: 24,
      height: 0.5,
      depth: 20
    }, scene);
    caveChasm.position.set(22, 0.25, 4);
    caveChasm.rotation.y = 0.3;
    caveChasm.material = caveChasmMat;
  }

  private buildLandmarks(): void {
    if (!this.scene) return;
    const scene = this.scene;

    // 1. KINGDOM GATE (South, Z = -28)
    const gatePos = new Vector3(0, 0, -28);
    const gateMesh = this.createGateLandmark(gatePos);
    this.registerNode('kingdom_gate', gatePos, gateMesh);

    // 2. ROYAL MARKET (South-East, X = 16, Z = -14)
    const marketPos = new Vector3(16, 0.2, -14);
    const marketMesh = this.createMarketLandmark(marketPos);
    this.registerNode('royal_market', marketPos, marketMesh);

    // 3. TEMPLE DISTRICT (West, X = -14, Z = 0)
    const templePos = new Vector3(-14, 0.6, 0);
    const templeMesh = this.createTempleLandmark(templePos);
    this.registerNode('temple_district', templePos, templeMesh);

    // 4. SACRED FOREST (North-West, X = -24, Z = 16)
    const forestPos = new Vector3(-24, 0.4, 16);
    const forestMesh = this.createForestLandmark(forestPos);
    this.registerNode('sacred_forest', forestPos, forestMesh);

    // 5. ANCIENT CAVE (East, X = 24, Z = 6)
    const cavePos = new Vector3(24, 0.4, 6);
    const caveMesh = this.createCaveLandmark(cavePos);
    this.registerNode('ancient_cave', cavePos, caveMesh);

    // 6. ROYAL PALACE (North-Center, X = 0, Z = 14)
    const palacePos = new Vector3(0, 1.4, 14);
    const palaceMesh = this.createPalaceLandmark(palacePos);
    this.registerNode('royal_palace', palacePos, palaceMesh);

    // 7. SUN TEMPLE (Far North Peak, X = 0, Z = 30)
    const sunPos = new Vector3(0, 3.2, 30);
    const sunMesh = this.createSunTempleLandmark(sunPos);
    this.registerNode('sun_temple', sunPos, sunMesh);
  }

  private createGateLandmark(pos: Vector3): Mesh {
    const scene = this.scene!;
    const root = MeshBuilder.CreateBox('Landmark_Gate_Root', { size: 0.1 }, scene);
    root.position.copyFrom(pos);

    const stoneMat = new StandardMaterial('lm_gate_mat', scene);
    stoneMat.diffuseColor = Color3.FromHexString('#cfa15b');

    // Twin towers
    for (let x of [-4, 4]) {
      const tower = MeshBuilder.CreateCylinder(`Gate_Tower_${x}`, { diameter: 2.8, height: 6.5, tessellation: 12 }, scene);
      tower.position.set(x, 3.25, 0);
      tower.material = stoneMat;
      tower.parent = root;
    }
    // Main Arch Wall
    const arch = MeshBuilder.CreateBox('Gate_Wall', { width: 6, height: 4.5, depth: 2 }, scene);
    arch.position.set(0, 2.25, 0);
    arch.material = stoneMat;
    arch.parent = root;

    return root;
  }

  private createMarketLandmark(pos: Vector3): Mesh {
    const scene = this.scene!;
    const root = MeshBuilder.CreateBox('Landmark_Market_Root', { size: 0.1 }, scene);
    root.position.copyFrom(pos);

    const clothColors = ['#c0392b', '#2980b9', '#f39c12'];
    // 3 Bazaar Tents
    for (let i = 0; i < 3; i++) {
      const tentMat = new StandardMaterial(`lm_tent_${i}`, scene);
      tentMat.diffuseColor = Color3.FromHexString(clothColors[i]);

      const tent = MeshBuilder.CreateCylinder(`Tent_${i}`, { diameterTop: 0, diameterBottom: 4.2, height: 3.5, tessellation: 4 }, scene);
      const angle = (i / 3) * Math.PI * 2;
      tent.position.set(Math.cos(angle) * 3, 1.75, Math.sin(angle) * 3);
      tent.rotation.y = angle;
      tent.material = tentMat;
      tent.parent = root;
    }
    return root;
  }

  private createTempleLandmark(pos: Vector3): Mesh {
    const scene = this.scene!;
    const root = MeshBuilder.CreateBox('Landmark_Temple_Root', { size: 0.1 }, scene);
    root.position.copyFrom(pos);

    const goldStone = new StandardMaterial('lm_temple_mat', scene);
    goldStone.diffuseColor = Color3.FromHexString('#d4ac0d');

    // Stepped Shikhara Spire
    const tower = MeshBuilder.CreateCylinder('Shikhara_Spire', { diameterTop: 1.2, diameterBottom: 5.5, height: 8, tessellation: 4 }, scene);
    tower.position.set(0, 4, 0);
    tower.rotation.y = Math.PI / 4;
    tower.material = goldStone;
    tower.parent = root;

    // Small side spires
    for (let angle of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
      const spire = MeshBuilder.CreateCylinder(`Side_Spire_${angle}`, { diameterTop: 0.4, diameterBottom: 1.8, height: 4, tessellation: 4 }, scene);
      spire.position.set(Math.cos(angle) * 3.5, 2, Math.sin(angle) * 3.5);
      spire.rotation.y = Math.PI / 4;
      spire.material = goldStone;
      spire.parent = root;
    }
    return root;
  }

  private createForestLandmark(pos: Vector3): Mesh {
    const scene = this.scene!;
    const root = MeshBuilder.CreateBox('Landmark_Forest_Root', { size: 0.1 }, scene);
    root.position.copyFrom(pos);

    const foliageMat = new StandardMaterial('lm_foliage_mat', scene);
    foliageMat.diffuseColor = Color3.FromHexString('#229954');

    const trunkMat = new StandardMaterial('lm_trunk_mat', scene);
    trunkMat.diffuseColor = Color3.FromHexString('#4a2e12');

    // 4 Ancient Canopy Trees
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const x = Math.cos(angle) * 3;
      const z = Math.sin(angle) * 3;

      const trunk = MeshBuilder.CreateCylinder(`F_Trunk_${i}`, { diameter: 0.8, height: 3.5 }, scene);
      trunk.position.set(x, 1.75, z);
      trunk.material = trunkMat;
      trunk.parent = root;

      const canopy = MeshBuilder.CreateSphere(`F_Canopy_${i}`, { diameter: 4.5 }, scene);
      canopy.position.set(x, 4.2, z);
      canopy.material = foliageMat;
      canopy.parent = root;
    }
    return root;
  }

  private createCaveLandmark(pos: Vector3): Mesh {
    const scene = this.scene!;
    const root = MeshBuilder.CreateBox('Landmark_Cave_Root', { size: 0.1 }, scene);
    root.position.copyFrom(pos);

    const rockMat = new StandardMaterial('lm_cave_rock', scene);
    rockMat.diffuseColor = Color3.FromHexString('#2c3e50');

    const crystalMat = new StandardMaterial('lm_cave_gem', scene);
    crystalMat.diffuseColor = Color3.FromHexString('#1abc9c');
    crystalMat.emissiveColor = Color3.FromHexString('#16a085');

    // Cavern arch
    const arch = MeshBuilder.CreateCylinder('Cave_Mouth', { diameter: 6, height: 3.5, tessellation: 8 }, scene);
    arch.position.set(0, 2, 0);
    arch.material = rockMat;
    arch.parent = root;

    // Glowing Crystals
    for (let i = 0; i < 3; i++) {
      const gem = MeshBuilder.CreateCylinder(`Gem_${i}`, { diameterTop: 0, diameterBottom: 0.8, height: 3, tessellation: 6 }, scene);
      gem.position.set((i - 1) * 1.6, 2.5, 1.5);
      gem.material = crystalMat;
      gem.parent = root;
    }
    return root;
  }

  private createPalaceLandmark(pos: Vector3): Mesh {
    const scene = this.scene!;
    const root = MeshBuilder.CreateBox('Landmark_Palace_Root', { size: 0.1 }, scene);
    root.position.copyFrom(pos);

    const marbleMat = new StandardMaterial('lm_palace_marble', scene);
    marbleMat.diffuseColor = Color3.FromHexString('#f7f9f9');

    const goldMat = new StandardMaterial('lm_palace_gold', scene);
    goldMat.diffuseColor = Color3.FromHexString('#f1c40f');

    // Grand Palace Hall
    const hall = MeshBuilder.CreateBox('Palace_Hall', { width: 7.5, height: 4, depth: 5 }, scene);
    hall.position.set(0, 2, 0);
    hall.material = marbleMat;
    hall.parent = root;

    // Golden Central Dome
    const dome = MeshBuilder.CreateSphere('Palace_Dome', { diameter: 4 }, scene);
    dome.position.set(0, 4.5, 0);
    dome.material = goldMat;
    dome.parent = root;

    return root;
  }

  private createSunTempleLandmark(pos: Vector3): Mesh {
    const scene = this.scene!;
    const root = MeshBuilder.CreateBox('Landmark_Sun_Root', { size: 0.1 }, scene);
    root.position.copyFrom(pos);

    const solarGold = new StandardMaterial('lm_solar_gold', scene);
    solarGold.diffuseColor = Color3.FromHexString('#f39c12');
    solarGold.emissiveColor = Color3.FromHexString('#b77703');

    // Central Radiant Sun Pedestal
    const pedestal = MeshBuilder.CreateCylinder('Sun_Altar', { diameter: 4.8, height: 2 }, scene);
    pedestal.position.set(0, 1, 0);
    pedestal.material = solarGold;
    pedestal.parent = root;

    // Concentric orbiting solar halo ring
    const ring = MeshBuilder.CreateTorus('Sun_Halo_Ring', { diameter: 7, thickness: 0.4, tessellation: 36 }, scene);
    ring.position.set(0, 2.8, 0);
    ring.material = solarGold;
    ring.parent = root;

    // Golden Ray Light Beam
    const ray = MeshBuilder.CreateCylinder('Solar_Beam', { diameter: 1.4, height: 16 }, scene);
    ray.position.set(0, 9, 0);
    ray.material = solarGold;
    ray.parent = root;

    return root;
  }

  private registerNode(id: string, pos: Vector3, landmarkMesh: Mesh): void {
    const scene = this.scene!;
    const config = ANCIENT_LOCATIONS_3D[id];

    // Create 3D Beacon (Floating Glowing Orb)
    const beaconMat = new StandardMaterial(`beacon_mat_${id}`, scene);
    beaconMat.diffuseColor = Color3.FromHexString('#f5c542');
    beaconMat.emissiveColor = Color3.FromHexString('#d4af37');

    const beacon = MeshBuilder.CreateSphere(`Beacon_${id}`, { diameter: 2.2 }, scene);
    beacon.position.set(pos.x, pos.y + 7.5, pos.z);
    beacon.material = beaconMat;

    // Light column under beacon
    const beamMat = new StandardMaterial(`beam_mat_${id}`, scene);
    beamMat.diffuseColor = Color3.FromHexString('#f5c542');
    beamMat.emissiveColor = Color3.FromHexString('#997214');
    beamMat.alpha = 0.45;

    const beam = MeshBuilder.CreateCylinder(`Beam_${id}`, { diameter: 0.6, height: 6.5 }, scene);
    beam.position.set(pos.x, pos.y + 4.25, pos.z);
    beam.material = beamMat;
    beam.parent = beacon;

    // Label Disc
    const discMat = new StandardMaterial(`label_mat_${id}`, scene);
    discMat.diffuseColor = Color3.FromHexString('#ffffff');
    const labelDisc = MeshBuilder.CreatePlane(`Label_${id}`, { width: 5.5, height: 1.5 }, scene);
    labelDisc.position.set(pos.x, pos.y + 9.5, pos.z);
    labelDisc.billboardMode = Mesh.BILLBOARDMODE_ALL;
    labelDisc.parent = beacon;

    // Add Click Interaction to Landmark and Beacon
    beacon.actionManager = new ActionManager(scene);
    beacon.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
        this.selectRegion(id);
      })
    );

    landmarkMesh.actionManager = new ActionManager(scene);
    landmarkMesh.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
        this.selectRegion(id);
      })
    );

    this.nodes.set(id, {
      id,
      name: config.name,
      title: config.regionTitle,
      description: config.description,
      pos,
      mesh: landmarkMesh,
      beacon,
      labelMesh: labelDisc
    });
  }

  private buildConnectingRoads(): void {
    if (!this.scene) return;
    const scene = this.scene;

    const roadMat = new StandardMaterial('mat_map_road', scene);
    roadMat.diffuseColor = Color3.FromHexString('#e0ab67');
    roadMat.emissiveColor = Color3.FromHexString('#523910');

    const connections: [string, string][] = [
      ['kingdom_gate', 'royal_market'],
      ['royal_market', 'temple_district'],
      ['temple_district', 'sacred_forest'],
      ['temple_district', 'ancient_cave'],
      ['temple_district', 'royal_palace'],
      ['royal_palace', 'sun_temple']
    ];

    connections.forEach(([idA, idB], idx) => {
      const nodeA = this.nodes.get(idA);
      const nodeB = this.nodes.get(idB);
      if (!nodeA || !nodeB) return;

      const pA = nodeA.pos;
      const pB = nodeB.pos;

      const dist = Vector3.Distance(pA, pB);
      const road = MeshBuilder.CreateBox(`Road_${idx}`, { width: 1.6, height: 0.15, depth: dist }, scene);
      road.material = roadMat;

      const mid = pA.add(pB).scale(0.5);
      road.position.set(mid.x, Math.max(pA.y, pB.y) + 0.08, mid.z);
      road.lookAt(pB);
    });
  }

  private buildCelestialCompass(): void {
    if (!this.scene) return;
    const scene = this.scene;

    const goldMat = new StandardMaterial('compass_gold', scene);
    goldMat.diffuseColor = Color3.FromHexString('#d4af37');
    goldMat.emissiveColor = Color3.FromHexString('#664d08');

    // Ancient Sanskrit Celestial Ring surrounding the map
    const ring = MeshBuilder.CreateTorus('Celestial_Compass_Ring', { diameter: 78, thickness: 0.5, tessellation: 48 }, scene);
    ring.position.y = 0.2;
    ring.material = goldMat;

    // 4 Cardinal Direction Pointers (N, S, E, W)
    for (let angle of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
      const ptr = MeshBuilder.CreateCylinder(`Cardinal_Ptr_${angle}`, { diameterTop: 0, diameterBottom: 1.6, height: 4, tessellation: 3 }, scene);
      ptr.position.set(Math.sin(angle) * 40, 0.4, Math.cos(angle) * 40);
      ptr.rotation.y = angle;
      ptr.rotation.x = Math.PI / 2;
      ptr.material = goldMat;
    }
  }

  private buildMiniatureFloraAndDetails(): void {
    if (!this.scene) return;
    const scene = this.scene;

    // 1. Miniature Desert Palms around Southern Plains
    const palmMat = new StandardMaterial('mini_palm_leaf', scene);
    palmMat.diffuseColor = Color3.FromHexString('#2e7d32');
    const trunkMat = new StandardMaterial('mini_palm_trunk', scene);
    trunkMat.diffuseColor = Color3.FromHexString('#795548');

    const palmCoords = [
      [-6, -24], [6, -24], [-8, -32], [8, -32],
      [12, -18], [20, -18], [14, -8], [22, -8]
    ];
    palmCoords.forEach(([x, z], idx) => {
      const trunk = MeshBuilder.CreateCylinder(`Mini_Palm_${idx}`, { diameterTop: 0.2, diameterBottom: 0.4, height: 2.2 }, scene);
      trunk.position.set(x, 1.1, z);
      trunk.material = trunkMat;

      const fronds = MeshBuilder.CreateSphere(`Mini_Crown_${idx}`, { diameter: 1.6 }, scene);
      fronds.position.set(x, 2.2, z);
      fronds.material = palmMat;
    });

    // 2. Miniature Sacred Forest Canopy Trees in Western Basin
    const forestTreeMat = new StandardMaterial('mini_forest_tree', scene);
    forestTreeMat.diffuseColor = Color3.FromHexString('#1b5e20');

    const forestCoords = [
      [-20, 10], [-26, 12], [-28, 18], [-22, 22], [-18, 16], [-16, 24]
    ];
    forestCoords.forEach(([x, z], idx) => {
      const tree = MeshBuilder.CreateSphere(`Mini_FTree_${idx}`, { diameter: 2.8 }, scene);
      tree.position.set(x, 1.8, z);
      tree.material = forestTreeMat;
    });

    // 3. Miniature Cavern Crystals in Eastern Chasm
    const crystalMat = new StandardMaterial('mini_crystal_mat', scene);
    crystalMat.diffuseColor = Color3.FromHexString('#1abc9c');
    crystalMat.emissiveColor = Color3.FromHexString('#16a085');

    const crystalCoords = [
      [20, 2], [26, 4], [22, 8], [28, 8], [24, -2]
    ];
    crystalCoords.forEach(([x, z], idx) => {
      const crystal = MeshBuilder.CreateCylinder(`Mini_Crys_${idx}`, { diameterTop: 0, diameterBottom: 0.6, height: 1.8, tessellation: 5 }, scene);
      crystal.position.set(x, 1.2, z);
      crystal.material = crystalMat;
    });

    // 4. Miniature Royal Palace Cypresses
    const cypressMat = new StandardMaterial('mini_cypress_mat', scene);
    cypressMat.diffuseColor = Color3.FromHexString('#145a32');

    const cypressCoords = [
      [-5, 10], [5, 10], [-5, 18], [5, 18]
    ];
    cypressCoords.forEach(([x, z], idx) => {
      const cone = MeshBuilder.CreateCylinder(`Mini_Cyp_${idx}`, { diameterTop: 0.1, diameterBottom: 0.7, height: 2.6, tessellation: 8 }, scene);
      cone.position.set(x, 2.7, z);
      cone.material = cypressMat;
    });
  }

  public selectRegion(id: string): void {
    this.selectedLocId = id;
    const node = this.nodes.get(id);
    if (!node) return;

    this.regionTitleEl.innerText = node.name;
    this.regionSubtitleEl.innerText = node.title;
    this.regionDescEl.innerText = node.description;

    const regionChronicles: Record<string, { chapter: string; excerpt: string }> = {
      kingdom_gate: {
        chapter: 'Chronicle I: The Shattered Bastion',
        excerpt: '“When skies darkened without rain, three hundred solar shields held the outer walls until the solar eclipse.”'
      },
      royal_market: {
        chapter: 'Chronicle II: The Gilded Bazaar',
        excerpt: '“Caravans from seven kingdoms traded lapis lazuli and solar amber around the sacred sun-blessed well.”'
      },
      temple_district: {
        chapter: 'Chronicle III: Priests of the Noon Day',
        excerpt: '“On the solstice, the noon sun struck the Shikhara altar gem, illuminating the three pillars of Dawn, Justice, and Eternity.”'
      },
      sacred_forest: {
        chapter: 'Chronicle IV: Heart of the Banyan',
        excerpt: '“Ancient banyans drank subterranean liquid sunlight, sheltering royal artisans when the city fell to silence.”'
      },
      ancient_cave: {
        chapter: 'Chronicle V: The Crystal Lament',
        excerpt: '“Deep mineral veins resonated with the earth, where grieving royal sentinels bound their souls into shadow sentries.”'
      },
      royal_palace: {
        chapter: 'Chronicle VI: Harsha’s Final Stand',
        excerpt: '“King Harsha drew his consecrated talwar in the marble hall, scattering the celestial dials to seal the Solar Crown.”'
      },
      sun_temple: {
        chapter: 'Chronicle VII: The Awakening of Dawn',
        excerpt: '“At the zenith where sky meets stone, the harmonic code 3 - 1 - 4 - 2 shall awaken the eternal solar flame.”'
      }
    };

    const chronicle = regionChronicles[id];
    if (chronicle && this.regionChronicleTitleEl && this.regionChronicleTextEl) {
      this.regionChronicleTitleEl.innerText = chronicle.chapter;
      this.regionChronicleTextEl.innerText = chronicle.excerpt;
    }

    const isCurrent = id === this.currentLocId;
    const isDiscovered = this.discoveredLocations.has(id);

    if (isCurrent) {
      this.regionStatusEl.innerText = 'YOU ARE HERE';
      this.regionStatusEl.className = 'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#8e1b1b] text-white border border-[#ffd700]';
      this.travelBtn.innerText = 'YOU ARE ALREADY HERE';
      this.travelBtn.disabled = true;
      this.travelBtn.className = 'w-full py-2.5 bg-[#2c1d10] text-[#705e4c] font-serif font-bold text-xs uppercase tracking-widest rounded cursor-not-allowed';
    } else if (isDiscovered) {
      this.regionStatusEl.innerText = 'DISCOVERED REGION';
      this.regionStatusEl.className = 'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#1b4332] text-[#52b788] border border-[#2d6a4f]';
      this.travelBtn.innerText = `⚡ FAST TRAVEL TO ${node.name.toUpperCase()}`;
      this.travelBtn.disabled = false;
      this.travelBtn.className = 'w-full py-2.5 bg-[#b8860b] hover:bg-[#d4af37] text-black font-serif font-bold text-xs uppercase tracking-widest rounded shadow-lg cursor-pointer transition active:scale-98';
    } else {
      this.regionStatusEl.innerText = 'UNDISCOVERED SANCTUM';
      this.regionStatusEl.className = 'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#2c2013] text-[#cfbe9e] border border-[#5c4323]';
      this.travelBtn.innerText = `TRAVEL TO ${node.name.toUpperCase()}`;
      this.travelBtn.disabled = false;
      this.travelBtn.className = 'w-full py-2.5 bg-[#4a341f] hover:bg-[#6b4c2e] text-[#ffe599] font-serif font-bold text-xs uppercase tracking-widest rounded shadow cursor-pointer transition';
    }

    this.updateNodeHighlights();
  }

  private updateNodeHighlights(): void {
    this.nodes.forEach((n, id) => {
      const isSelected = id === this.selectedLocId;
      const isCurrent = id === this.currentLocId;
      const mat = (n.beacon.material as StandardMaterial);
      if (!mat) return;

      if (isCurrent) {
        mat.diffuseColor = Color3.FromHexString('#e74c3c');
        mat.emissiveColor = Color3.FromHexString('#c0392b');
        n.beacon.scaling.set(1.4, 1.4, 1.4);
      } else if (isSelected) {
        mat.diffuseColor = Color3.FromHexString('#2ecc71');
        mat.emissiveColor = Color3.FromHexString('#27ae60');
        n.beacon.scaling.set(1.3, 1.3, 1.3);
      } else {
        mat.diffuseColor = Color3.FromHexString('#f5c542');
        mat.emissiveColor = Color3.FromHexString('#b8860b');
        n.beacon.scaling.set(1.0, 1.0, 1.0);
      }
    });
  }

  public focusLocation(id: string): void {
    const node = this.nodes.get(id);
    if (!node || !this.camera) return;

    this.selectRegion(id);

    // Smoothly focus camera above target node
    this.camera.setTarget(new Vector3(node.pos.x, node.pos.y + 1, node.pos.z));
    this.camera.radius = 42;
    this.camera.beta = Math.PI / 3.4;
  }
}
