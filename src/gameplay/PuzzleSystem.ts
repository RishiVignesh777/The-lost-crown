import {
  Scene,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  Mesh,
  TransformNode,
  PointLight
} from '@babylonjs/core';
import { InteractionSystem } from './InteractionSystem';
import { playSound } from '../utils/helpers';
import { AUDIO_PATHS } from '../utils/constants';

export class PuzzleSystem {
  private puzzleNodes: TransformNode[] = [];

  // Gate Lever states
  public gateLeversActive = [false, false, false];
  private leverMeshes: Mesh[] = [];

  // Cave crystal sequence
  public caveCrystalOrder: number[] = [];

  // Sun Temple Celestial Dials
  public celestialDials = [1, 1, 1, 1];
  public readonly targetCelestial = [3, 1, 4, 2];
  private dialMeshes: Mesh[] = [];

  constructor(public scene: Scene) {}

  public setupPuzzlesForLocation(
    locationId: string,
    interaction: InteractionSystem,
    onPuzzleSolved: (puzzleId: string) => void
  ): void {
    this.clear();
    const scene = this.scene;

    // -------------------------------------------------------------
    // 1. KINGDOM GATE: THE THREE SOLAR WHEELS (LEVERS)
    // -------------------------------------------------------------
    if (locationId === 'kingdom_gate') {
      const leverNames = ['Dawn Wheel', 'Zenith Wheel', 'Twilight Wheel'];
      const leverPositions = [
        new Vector3(-8, 0, -2),
        new Vector3(0, 0, -2),
        new Vector3(8, 0, -2)
      ];

      const goldMat = new StandardMaterial('mat_lever_gold', scene);
      goldMat.diffuseColor = Color3.FromHexString('#ffd700');

      const stoneMat = new StandardMaterial('mat_lever_stone', scene);
      stoneMat.diffuseColor = Color3.FromHexString('#754f24');

      leverPositions.forEach((pos, idx) => {
        const root = new TransformNode(`LeverRoot_${idx}`, scene);
        root.position.copyFrom(pos);
        this.puzzleNodes.push(root);

        // Stone pedestal
        const ped = MeshBuilder.CreateBox(`LeverPed_${idx}`, { width: 1.2, height: 1.2, depth: 1.2 }, scene);
        ped.material = stoneMat;
        ped.position.y = 0.6;
        ped.parent = root;

        // Lever arm
        const arm = MeshBuilder.CreateCylinder(`LeverArm_${idx}`, { diameter: 0.15, height: 1.6, tessellation: 8 }, scene);
        arm.material = goldMat;
        arm.position.y = 1.6;
        arm.rotation.z = -0.4;
        arm.parent = root;
        this.leverMeshes.push(arm);

        interaction.register({
          id: `gate_lever_${idx}`,
          interactionText: `Engage ${leverNames[idx]}`,
          position: pos,
          radius: 3.5,
          interact: () => {
            if (this.gateLeversActive.every(v => v)) return;

            this.gateLeversActive[idx] = !this.gateLeversActive[idx];
            playSound(AUDIO_PATHS.DOOR, 0.4);

            arm.rotation.z = this.gateLeversActive[idx] ? 0.4 : -0.4;
            arm.material = this.gateLeversActive[idx] ? goldMat : stoneMat;

            if (this.gateLeversActive.every(v => v)) {
              playSound(AUDIO_PATHS.PUZZLE, 0.9);
              onPuzzleSolved('gate_levers');
            }
          }
        });
      });
    }

    // -------------------------------------------------------------
    // 2. TEMPLE DISTRICT: WHISPERS OF THE TEMPLE (3 INSCRIBED PILLARS)
    // -------------------------------------------------------------
    if (locationId === 'temple_district') {
      const pillars = [
        { name: 'Pillar of Dawn', key: 'inscription_1', pos: new Vector3(-12, 0, 0) },
        { name: 'Pillar of Justice', key: 'inscription_2', pos: new Vector3(0, 0, 18) },
        { name: 'Pillar of Eternity', key: 'inscription_3', pos: new Vector3(12, 0, 0) }
      ];

      const runeMat = new StandardMaterial('mat_rune_pillar', scene);
      runeMat.diffuseColor = Color3.FromHexString('#ffd700');
      runeMat.emissiveColor = Color3.FromHexString('#b7950b');

      pillars.forEach(p => {
        const root = new TransformNode(`Pillar_${p.key}`, scene);
        root.position.copyFrom(p.pos);
        this.puzzleNodes.push(root);

        const pillarMesh = MeshBuilder.CreateCylinder(`Mesh_${p.key}`, { diameter: 1.6, height: 6.5, tessellation: 16 }, scene);
        pillarMesh.material = runeMat;
        pillarMesh.position.y = 3.25;
        pillarMesh.parent = root;

        interaction.register({
          id: `pillar_${p.key}`,
          interactionText: `Decode ${p.name}`,
          position: p.pos,
          radius: 3.8,
          interact: () => {
            playSound(AUDIO_PATHS.PICKUP, 0.5);
            onPuzzleSolved(p.key);
          }
        });
      });
    }

    // -------------------------------------------------------------
    // 3. ANCIENT CAVE: LIGHT REFRACTION CRYSTALS
    // -------------------------------------------------------------
    if (locationId === 'ancient_cave') {
      const crystals = [
        { id: 1, name: 'Amber Crystal', pos: new Vector3(-8, 0, 10), color: '#f39c12' },
        { id: 2, name: 'Cyan Crystal', pos: new Vector3(0, 0, 14), color: '#1abc9c' },
        { id: 3, name: 'Golden Crystal', pos: new Vector3(8, 0, 10), color: '#ffd700' }
      ];

      crystals.forEach(c => {
        const root = new TransformNode(`CaveCrystal_${c.id}`, scene);
        root.position.copyFrom(c.pos);
        this.puzzleNodes.push(root);

        const mat = new StandardMaterial(`mat_c_${c.id}`, scene);
        mat.diffuseColor = Color3.FromHexString(c.color);
        mat.emissiveColor = Color3.FromHexString(c.color);

        const crystal = MeshBuilder.CreatePolyhedron(`C_Mesh_${c.id}`, { type: 2, size: 1.2 }, scene);
        crystal.material = mat;
        crystal.position.y = 1.8;
        crystal.parent = root;

        interaction.register({
          id: `cave_crystal_${c.id}`,
          interactionText: `Align ${c.name} Beam`,
          position: c.pos,
          radius: 3.6,
          interact: () => {
            playSound(AUDIO_PATHS.PICKUP, 0.5);
            this.caveCrystalOrder.push(c.id);

            // Rotate on interact
            crystal.rotation.y += Math.PI / 4;

            if (this.caveCrystalOrder.length === 3) {
              const [a, b, c] = this.caveCrystalOrder;
              if (a === 2 && b === 1 && c === 3) {
                // Correct sequence: Cyan -> Amber -> Golden
                playSound(AUDIO_PATHS.PUZZLE, 0.9);
                onPuzzleSolved('cave_crystals');
              } else {
                playSound(AUDIO_PATHS.HIT, 0.4);
                this.caveCrystalOrder = [];
              }
            }
          }
        });
      });
    }

    // -------------------------------------------------------------
    // 4. SUN TEMPLE: THE FOUR CELESTIAL DIALS OF THE SUN ALTAR
    // -------------------------------------------------------------
    if (locationId === 'sun_temple') {
      const dialPositions = [
        { name: 'Dial of Dawn', pos: new Vector3(-10, 1.2, -6) },
        { name: 'Dial of Zenith', pos: new Vector3(-4, 1.2, 8) },
        { name: 'Dial of Solstice', pos: new Vector3(4, 1.2, 8) },
        { name: 'Dial of Twilight', pos: new Vector3(10, 1.2, -6) }
      ];

      const goldMat = new StandardMaterial('mat_dial_gold', scene);
      goldMat.diffuseColor = Color3.FromHexString('#f1c40f');
      goldMat.emissiveColor = Color3.FromHexString('#5c4308');

      dialPositions.forEach((dp, idx) => {
        const root = new TransformNode(`DialRoot_${idx}`, scene);
        root.position.copyFrom(dp.pos);
        this.puzzleNodes.push(root);

        const dialDisc = MeshBuilder.CreateCylinder(`DialDisc_${idx}`, { diameter: 2.8, height: 0.4, tessellation: 24 }, scene);
        dialDisc.material = goldMat;
        dialDisc.position.y = 0.5;
        dialDisc.parent = root;
        this.dialMeshes.push(dialDisc);

        interaction.register({
          id: `celestial_dial_${idx}`,
          interactionText: `Turn ${dp.name} (Currently [ ${this.celestialDials[idx]} ])`,
          position: dp.pos,
          radius: 3.8,
          interact: () => {
            playSound(AUDIO_PATHS.DOOR, 0.4);
            this.celestialDials[idx] = (this.celestialDials[idx] % 4) + 1;
            dialDisc.rotation.y += Math.PI / 2;

            // Check if dials match target [3, 1, 4, 2]
            const solved = this.celestialDials.every((v, i) => v === this.targetCelestial[i]);
            if (solved) {
              playSound(AUDIO_PATHS.PUZZLE, 1.0);
              onPuzzleSolved('celestial_dials');
            }
          }
        });
      });
    }
  }

  public clear(): void {
    this.puzzleNodes.forEach(n => n.dispose());
    this.puzzleNodes = [];
    this.leverMeshes = [];
    this.dialMeshes = [];
  }
}
