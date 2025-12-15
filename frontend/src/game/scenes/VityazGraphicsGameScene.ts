import Phaser from 'phaser';
import VityazGraphicsGenerator from '../../graphics/VityazGraphicsGenerator';
import { AudioManager } from '../../audio/AudioManager';

/**
 * VITYAZ GRAPHICS INTEGRATED GAME SCENE
 * ====================================
 * 
 * Complete game scene using professional Canvas-generated graphics:
 * - Player with maroon Vityaz beret (left side)
 * - Enemy soldiers with tactical uniforms
 * - Professional weapon sprites
 * - High-quality visual effects
 * - Smooth animations
 * - Complete audio integration
 */

interface Enemy extends Phaser.Physics.Arcade.Sprite {
  health: number;
  speed: number;
  damage: number;
  lastShot?: number;
}

export class VityazGraphicsGameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private enemies!: Phaser.Physics.Arcade.Group;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private graphics!: VityazGraphicsGenerator;
  private audioManager!: AudioManager;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  // Game state
  private playerHealth: number = 100;
  private playerAmmo: Map<string, number> = new Map();
  private currentWeapon: string = 'AK74M';
  private score: number = 0;
  private kills: number = 0;
  private wave: number = 1;
  private enemiesDefeated: number = 0;
  private enemiesPerWave: number = 5;
  private lastShot: number = 0;
  private shootCooldown: number = 150;

  // UI
  private healthText!: Phaser.GameObjects.Text;
  private ammoText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private weaponText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'VityazGraphicsGameScene' });
  }

  preload(): void {
    // Load audio
    this.audioManager = new AudioManager();
  }

  create(): void {
    this.graphics = new VityazGraphicsGenerator();

    // Create player sprite from generated canvas
    const playerCanvas = this.graphics.generatePlayerSprite(64, 64);
    const playerTexture = this.textures.createCanvas('player', 64, 64);
    playerTexture.draw(0, 0, playerCanvas);

    this.player = this.physics.add.sprite(
      this.scale.width / 2,
      this.scale.height - 100,
      'player'
    );
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);

    // Initialize ammo
    this.playerAmmo.set('AK74M', 300);
    this.playerAmmo.set('SVD', 100);
    this.playerAmmo.set('RPK74', 250);
    this.playerAmmo.set('PMM', 120);

    // Create enemy group
    this.enemies = this.physics.add.group();

    // Create projectile group
    this.projectiles = this.physics.add.group();

    // Setup input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.input.keyboard!.on('keydown-W', () => this.switchWeapon('AK74M'));
    this.input.keyboard!.on('keydown-E', () => this.switchWeapon('SVD'));
    this.input.keyboard!.on('keydown-R', () => this.switchWeapon('RPK74'));
    this.input.keyboard!.on('keydown-Q', () => this.switchWeapon('PMM'));
    this.input.keyboard!.on('keydown-M', () => this.audioManager.toggleMute());
    this.input.keyboard!.on('keydown-P', () => this.togglePause());

    // Setup collisions
    this.physics.add.overlap(
      this.projectiles,
      this.enemies,
      (projectile, enemy) => this.hitEnemy(projectile as any, enemy as any),
      undefined,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.enemies,
      () => this.damagePlayer(10),
      undefined,
      this
    );

    // Create UI
    this.createUI();

    // Spawn initial enemies
    this.spawnWave();
  }

  update(): void {
    if (!this.player.active) return;

    // Player movement
    this.player.setVelocity(0, 0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(200);
    }

    // Shooting
    if (this.input.activePointer.isDown) {
      this.shoot();
    }

    // Enemy AI
    this.enemies.children.forEach((enemy: any) => {
      if (!enemy.active) return;

      const distance = Phaser.Math.Distance.Between(
        enemy.x,
        enemy.y,
        this.player.x,
        this.player.y
      );

      // Chase player if close
      if (distance < 300) {
        const angle = Phaser.Math.Angle.Between(
          enemy.x,
          enemy.y,
          this.player.x,
          this.player.y
        );
        enemy.setVelocity(
          Math.cos(angle) * enemy.speed,
          Math.sin(angle) * enemy.speed
        );
      }
    });

    // Check wave completion
    if (this.enemies.children.length === 0 && this.enemiesDefeated >= this.enemiesPerWave) {
      this.wave++;
      this.enemyPerWave += 2;
      this.enemiesDefeated = 0;
      this.spawnWave();
    }

    // Update UI
    this.updateUI();
  }

  private shoot(): void {
    const now = this.time.now;
    if (now - this.lastShot < this.shootCooldown) return;
    this.lastShot = now;

    const ammo = this.playerAmmo.get(this.currentWeapon) || 0;
    if (ammo <= 0) {
      this.audioManager.playSound('click');
      return;
    }

    this.playerAmmo.set(this.currentWeapon, ammo - 1);

    // Calculate direction to mouse
    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      this.input.activePointer.worldX,
      this.input.activePointer.worldY
    );

    // Create projectile
    const projectile = this.projectiles.create(
      this.player.x,
      this.player.y,
      'projectile'
    ) as any;

    projectile.setVelocity(
      Math.cos(angle) * 400,
      Math.sin(angle) * 400
    );
    projectile.damage = this.getWeaponDamage(this.currentWeapon);

    // Play weapon sound
    this.audioManager.playWeaponSound(this.currentWeapon);

    // Remove projectile when off-screen
    this.time.delayedCall(5000, () => projectile.destroy());
  }

  private getWeaponDamage(weapon: string): number {
    const damages: Record<string, number> = {
      AK74M: 10,
      SVD: 25,
      RPK74: 8,
      PMM: 15,
    };
    return damages[weapon] || 10;
  }

  private hitEnemy(projectile: any, enemy: any): void {
    projectile.destroy();
    enemy.health -= projectile.damage;

    this.audioManager.playSound('hit');

    if (enemy.health <= 0) {
      this.score += 100;
      this.kills++;
      this.enemiesDefeated++;
      this.audioManager.playSound('death');
      enemy.destroy();
    }
  }

  private damagePlayer(damage: number): void {
    this.playerHealth -= damage;
    this.audioManager.playSound('damage');

    if (this.playerHealth <= 0) {
      this.gameOver();
    }
  }

  private spawnWave(): void {
    for (let i = 0; i < this.enemiesPerWave; i++) {
      const x = Phaser.Math.Between(50, this.scale.width - 50);
      const y = Phaser.Math.Between(50, 200);

      const enemyCanvas = this.graphics.generateEnemySprite(64, 64);
      const enemyTexture = this.textures.createCanvas(`enemy-${i}`, 64, 64);
      enemyTexture.draw(0, 0, enemyCanvas);

      const enemy = this.enemies.create(x, y, `enemy-${i}`) as Enemy;
      enemy.health = 20;
      enemy.speed = 80 + this.wave * 10;
      enemy.damage = 10;
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
    }
  }

  private switchWeapon(weapon: string): void {
    if (this.playerAmmo.get(weapon)! > 0) {
      this.currentWeapon = weapon;
      this.audioManager.playSound('click');
    }
  }

  private createUI(): void {
    // Health
    this.healthText = this.add.text(16, 16, '', {
      fontSize: '20px',
      color: '#FF0000',
    });

    // Ammo
    this.ammoText = this.add.text(16, 50, '', {
      fontSize: '20px',
      color: '#00FF00',
    });

    // Score
    this.scoreText = this.add.text(
      this.scale.width - 200,
      16,
      '',
      {
        fontSize: '20px',
        color: '#FFFF00',
      }
    );

    // Wave
    this.waveText = this.add.text(
      this.scale.width / 2 - 50,
      16,
      '',
      {
        fontSize: '24px',
        color: '#00FFFF',
      }
    );

    // Weapon
    this.weaponText = this.add.text(16, this.scale.height - 40, '', {
      fontSize: '16px',
      color: '#FFFFFF',
    });
  }

  private updateUI(): void {
    this.healthText.setText(`HP: ${Math.max(0, this.playerHealth)}`);
    this.ammoText.setText(
      `AMMO: ${this.playerAmmo.get(this.currentWeapon)} [${this.currentWeapon}]`
    );
    this.scoreText.setText(`SCORE: ${this.score}\nKILLS: ${this.kills}`);
    this.waveText.setText(`WAVE ${this.wave}`);
    this.weaponText.setText(
      `W:AK74M  E:SVD  R:RPK74  Q:PMM  M:MUTE  P:PAUSE`
    );
  }

  private togglePause(): void {
    this.physics.pause();
    const pauseText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      'PAUSED\n\nPress P to Resume',
      {
        fontSize: '40px',
        color: '#FFFFFF',
        align: 'center',
      }
    );
    pauseText.setOrigin(0.5);
    pauseText.setDepth(100);

    this.input.keyboard!.once('keydown-P', () => {
      pauseText.destroy();
      this.physics.resume();
    });
  }

  private gameOver(): void {
    this.player.destroy();
    this.physics.pause();

    const gameOverText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 40,
      `GAME OVER\n\nScore: ${this.score}\nKills: ${this.kills}\nWave: ${this.wave}\n\nPress SPACE to Restart`,
      {
        fontSize: '32px',
        color: '#FF0000',
        align: 'center',
      }
    );
    gameOverText.setOrigin(0.5);
    gameOverText.setDepth(100);

    this.input.keyboard!.once('keydown-SPACE', () => {
      this.scene.restart();
    });
  }
}

export default VityazGraphicsGameScene;
