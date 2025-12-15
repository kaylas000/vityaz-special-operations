import Phaser from 'phaser';
import VityazGraphicsGenerator from '../../graphics/VityazGraphicsGenerator';
import { AudioManager } from '../../audio/AudioManager';
import AnimationFrameSystem, { AnimationState, Direction } from '../../animations/AnimationFrameSystem';

/**
 * VITYAZ ANIMATED GAME SCENE
 * ========================
 * 
 * Complete game implementation with:
 * - Professional character animations (8-directional)
 * - Weapon animations
 * - State machine
 * - Smooth transitions
 * - Full audio integration
 * - Complete game mechanics
 */

interface Enemy extends Phaser.Physics.Arcade.Sprite {
  health: number;
  speed: number;
  damage: number;
  animation?: AnimationFrameSystem;
}

export class AnimatedGameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerAnimation!: AnimationFrameSystem;
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

  // Movement tracking
  private lastDirection: Direction = Direction.DOWN;
  private isMoving: boolean = false;
  private isAttacking: boolean = false;

  // UI
  private healthText!: Phaser.GameObjects.Text;
  private ammoText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private weaponText!: Phaser.GameObjects.Text;
  private fpsText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'AnimatedGameScene' });
  }

  preload(): void {
    this.audioManager = new AudioManager();
  }

  create(): void {
    this.graphics = new VityazGraphicsGenerator();

    // Create player sprite
    const playerCanvas = this.graphics.generatePlayerSprite(64, 64);
    const playerTexture = this.textures.createCanvas('player-animated', 64, 64);
    playerTexture.draw(0, 0, playerCanvas);

    this.player = this.physics.add.sprite(
      this.scale.width / 2,
      this.scale.height - 100,
      'player-animated'
    );
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);

    // Initialize animation system for player
    this.playerAnimation = new AnimationFrameSystem('player-animated', 1);
    this.playerAnimation.setState(AnimationState.IDLE);

    // Initialize ammo
    this.playerAmmo.set('AK74M', 300);
    this.playerAmmo.set('SVD', 100);
    this.playerAmmo.set('RPK74', 250);
    this.playerAmmo.set('PMM', 120);

    // Create groups
    this.enemies = this.physics.add.group();
    this.projectiles = this.physics.add.group();

    // Setup input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.input.keyboard!.on('keydown-W', () => this.switchWeapon('AK74M'));
    this.input.keyboard!.on('keydown-E', () => this.switchWeapon('SVD'));
    this.input.keyboard!.on('keydown-R', () => this.switchWeapon('RPK74'));
    this.input.keyboard!.on('keydown-Q', () => this.switchWeapon('PMM'));
    this.input.keyboard!.on('keydown-M', () => this.audioManager.toggleMute());
    this.input.keyboard!.on('keydown-P', () => this.togglePause());
    this.input.keyboard!.on('keydown-SHIFT', () => this.startRunning());
    this.input.keyboard!.on('keyup-SHIFT', () => this.stopRunning());

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

  update(time: number, deltaTime: number): void {
    if (!this.player.active) return;

    // Update animation
    this.playerAnimation.update(deltaTime);
    const currentFrame = this.playerAnimation.getCurrentFrame();
    if (currentFrame.offsetX || currentFrame.offsetY) {
      this.player.setPosition(
        this.player.x + (currentFrame.offsetX || 0),
        this.player.y + (currentFrame.offsetY || 0)
      );
    }

    // Player movement and animation
    this.handleMovement();

    // Shooting
    if (this.input.activePointer.isDown) {
      this.shoot(time);
      if (this.playerAnimation.getState() !== AnimationState.ATTACK) {
        this.playerAnimation.setState(AnimationState.ATTACK);
        this.isAttacking = true;
      }
    } else if (this.isAttacking) {
      this.isAttacking = false;
      if (this.isMoving) {
        this.playerAnimation.setState(AnimationState.WALK);
      } else {
        this.playerAnimation.setState(AnimationState.IDLE);
      }
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

        // Simple animation: use walk animation
        if (enemy.animation) {
          const dir = this.getDirectionFromAngle(angle);
          enemy.animation.setDirection(dir);
          enemy.animation.setState(AnimationState.WALK);
          enemy.animation.update(deltaTime);
        }
      }
    });

    // Check wave completion
    if (this.enemies.children.length === 0 && this.enemiesDefeated >= this.enemiesPerWave) {
      this.wave++;
      this.enemiesPerWave += 2;
      this.enemiesDefeated = 0;
      this.spawnWave();
    }

    // Update UI
    this.updateUI();
  }

  private handleMovement(): void {
    this.player.setVelocity(0, 0);
    this.isMoving = false;
    let newDirection: Direction | null = null;

    // Determine direction and movement
    const up = this.cursors.up.isDown;
    const down = this.cursors.down.isDown;
    const left = this.cursors.left.isDown;
    const right = this.cursors.right.isDown;

    if (up && right) {
      newDirection = Direction.UP_RIGHT;
      this.player.setVelocity(150, -150);
      this.isMoving = true;
    } else if (up && left) {
      newDirection = Direction.UP_LEFT;
      this.player.setVelocity(-150, -150);
      this.isMoving = true;
    } else if (down && right) {
      newDirection = Direction.DOWN_RIGHT;
      this.player.setVelocity(150, 150);
      this.isMoving = true;
    } else if (down && left) {
      newDirection = Direction.DOWN_LEFT;
      this.player.setVelocity(-150, 150);
      this.isMoving = true;
    } else if (up) {
      newDirection = Direction.UP;
      this.player.setVelocity(0, -200);
      this.isMoving = true;
    } else if (down) {
      newDirection = Direction.DOWN;
      this.player.setVelocity(0, 200);
      this.isMoving = true;
    } else if (left) {
      newDirection = Direction.LEFT;
      this.player.setVelocity(-200, 0);
      this.isMoving = true;
    } else if (right) {
      newDirection = Direction.RIGHT;
      this.player.setVelocity(200, 0);
      this.isMoving = true;
    }

    // Update animation
    if (newDirection !== null) {
      this.lastDirection = newDirection;
      this.playerAnimation.setDirection(newDirection);
      if (!this.isAttacking) {
        this.playerAnimation.setState(AnimationState.WALK);
      }
    } else {
      this.playerAnimation.setDirection(this.lastDirection);
      if (!this.isAttacking) {
        this.playerAnimation.setState(AnimationState.IDLE);
      }
    }
  }

  private startRunning(): void {
    this.playerAnimation.setState(AnimationState.RUN);
  }

  private stopRunning(): void {
    if (this.isMoving) {
      this.playerAnimation.setState(AnimationState.WALK);
    } else {
      this.playerAnimation.setState(AnimationState.IDLE);
    }
  }

  private getDirectionFromAngle(angle: number): Direction {
    // Convert angle to direction
    const dirs = [
      Direction.RIGHT,      // 0°
      Direction.DOWN_RIGHT, // 45°
      Direction.DOWN,       // 90°
      Direction.DOWN_LEFT,  // 135°
      Direction.LEFT,       // 180°
      Direction.UP_LEFT,    // 225°
      Direction.UP,         // 270°
      Direction.UP_RIGHT,   // 315°
    ];
    const normalized = (angle + Math.PI) / (2 * Math.PI);
    const index = Math.round(normalized * 8) % 8;
    return dirs[index];
  }

  private shoot(time: number): void {
    if (time - this.lastShot < this.shootCooldown) return;
    this.lastShot = time;

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

    // Play damage animation
    if (enemy.animation) {
      enemy.animation.setState(AnimationState.DAMAGE);
    }

    if (enemy.health <= 0) {
      this.score += 100;
      this.kills++;
      this.enemiesDefeated++;
      this.audioManager.playSound('death');

      // Play death animation
      if (enemy.animation) {
        enemy.animation.setState(AnimationState.DEATH);
        // Destroy after animation completes
        this.time.delayedCall(800, () => enemy.destroy());
      } else {
        enemy.destroy();
      }
    }
  }

  private damagePlayer(damage: number): void {
    this.playerHealth -= damage;
    this.audioManager.playSound('damage');

    // Play damage animation
    this.playerAnimation.setState(AnimationState.DAMAGE);

    if (this.playerHealth <= 0) {
      this.gameOver();
    }
  }

  private spawnWave(): void {
    for (let i = 0; i < this.enemiesPerWave; i++) {
      const x = Phaser.Math.Between(50, this.scale.width - 50);
      const y = Phaser.Math.Between(50, 200);

      const enemyCanvas = this.graphics.generateEnemySprite(64, 64);
      const enemyTexture = this.textures.createCanvas(`enemy-anim-${i}`, 64, 64);
      enemyTexture.draw(0, 0, enemyCanvas);

      const enemy = this.enemies.create(x, y, `enemy-anim-${i}`) as Enemy;
      enemy.health = 20;
      enemy.speed = 80 + this.wave * 10;
      enemy.damage = 10;
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);

      // Add animation to enemy
      enemy.animation = new AnimationFrameSystem(`enemy-anim-${i}`, 1);
      enemy.animation.setState(AnimationState.IDLE);
    }
  }

  private switchWeapon(weapon: string): void {
    if (this.playerAmmo.get(weapon)! > 0) {
      this.currentWeapon = weapon;
      this.audioManager.playSound('click');
      this.playerAnimation.setState(AnimationState.RELOAD);
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

    // FPS
    this.fpsText = this.add.text(16, this.scale.height - 70, '', {
      fontSize: '14px',
      color: '#AAAAAA',
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
      `W:AK74M  E:SVD  R:RPK74  Q:PMM  SHIFT:RUN  M:MUTE  P:PAUSE`
    );
    this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
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

export default AnimatedGameScene;
