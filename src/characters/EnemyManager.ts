import { Scene, Vector3 } from '@babylonjs/core';
import { Enemy3D, EnemyConfig3D } from './Enemy3D';
import { Player } from '../player/Player';
import { InventorySystem } from '../gameplay/InventorySystem';
import { playSound } from '../utils/helpers';
import { AUDIO_PATHS } from '../utils/constants';

export class EnemyManager {
  private enemies: Map<string, Enemy3D> = new Map();

  constructor(
    public scene: Scene,
    private inventorySystem: InventorySystem,
    private onEnemyKilled?: (enemy: Enemy3D) => void
  ) {}

  public spawnEnemiesForLocation(locationId: string): void {
    this.clear();

    const enemyConfigs: EnemyConfig3D[] = [];

    if (locationId === 'ancient_cave') {
      // 3 Shadow Guardians lurking in the ancient crystal cave
      enemyConfigs.push(
        {
          id: 'shadow_1',
          name: 'Shadow Stalker',
          type: 'shadow_guardian',
          position: new Vector3(-12, 0, 5)
        },
        {
          id: 'shadow_2',
          name: 'Shadow Wraith',
          type: 'shadow_guardian',
          position: new Vector3(12, 0, 8)
        },
        {
          id: 'shadow_3',
          name: 'Crypt Shadow',
          type: 'shadow_guardian',
          position: new Vector3(0, 0, -20)
        }
      );
    } else if (locationId === 'royal_palace') {
      // Ruin Golems guarding the palace corridors and King Harsha's Throne Approach
      enemyConfigs.push(
        {
          id: 'golem_1',
          name: 'Colossal Ruin Golem',
          type: 'ruin_golem',
          position: new Vector3(-14, 0, 15)
        },
        {
          id: 'golem_2',
          name: 'Ancient Stone Sentinel',
          type: 'ruin_golem',
          position: new Vector3(14, 0, 15)
        }
      );
    }

    enemyConfigs.forEach(cfg => {
      const enemy = new Enemy3D(this.scene, cfg, (deadEnemy) => {
        // Drop loot on death
        const dropItem = deadEnemy.type === 'shadow_guardian' ? 'crystal_fragment' : 'ancient_coins';
        this.inventorySystem.spawnWorldPickup(
          this.scene,
          dropItem,
          deadEnemy.root.position.clone()
        );
        this.enemies.delete(deadEnemy.id);

        if (this.onEnemyKilled) {
          this.onEnemyKilled(deadEnemy);
        }
      });
      this.enemies.set(cfg.id, enemy);
    });
  }

  public checkPlayerAttack(player: Player, attackRadius = 3.8): Enemy3D | null {
    const playerPos = player.root.position;
    const playerForward = new Vector3(
      Math.sin(player.root.rotation.y),
      0,
      Math.cos(player.root.rotation.y)
    ).normalize();

    let hitEnemy: Enemy3D | null = null;

    this.enemies.forEach(enemy => {
      if (enemy.isDead) return;

      const toEnemy = enemy.root.position.subtract(playerPos);
      const dist = toEnemy.length();

      if (dist <= attackRadius) {
        toEnemy.normalize();
        const dot = Vector3.Dot(playerForward, toEnemy);

        // Within 120 degree frontal arc
        if (dot > 0.1) {
          enemy.takeDamage(35);
          hitEnemy = enemy;
        }
      }
    });

    return hitEnemy;
  }

  public update(deltaTime: number, player: Player): void {
    this.enemies.forEach(enemy => {
      enemy.update(deltaTime, player);
    });
  }

  public getLivingEnemies(): Enemy3D[] {
    return Array.from(this.enemies.values()).filter(e => !e.isDead);
  }

  public clear(): void {
    this.enemies.forEach(enemy => enemy.dispose());
    this.enemies.clear();
  }
}
