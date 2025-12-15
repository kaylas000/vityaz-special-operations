import Phaser from 'phaser';
import { PlayerSpriteGenerator } from '../../graphics/PlayerSpriteGenerator';
import { AudioManager } from '../audio/AudioManager';

/**
 * Game Scene with Full Audio Integration
 * 
 * Features:
 * - Procedural sound generation (Web Audio API)
 * - Dynamic audio feedback
 * - Background music
 * - Volume controls
 * - Mute/unmute functionality
 */
export class AudioIntegratedGameScene extends Phaser.Scene {
  private player: Phaser.Physics.Arcade.Sprite | null = null;
  private weapon: Phaser.Physics.Arcade.Sprite | null = null;
  private healthBar: Phaser.GameObjects.Graphics | null = null;
  private audioManager: AudioManager | null = null;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private health: number = 100;
  private ammo: number = 30;
  private maxAmmo: number = 30;
  private score: number = 0;
  private wave: number = 1;
  private enemies: Phaser.Physics.Arcade.Sprite[] = [];
  private enemyGroup: Phaser.Physics.Arcade.Group | null = null;
  private lastShotTime: number = 0;
  private shotDelay: number = 100; // ms between shots

  constructor() {
    super({ key: 'AudioIntegratedGameScene' });
  }

  /**
   * Create all game animations
   */
  private createAnimations() {
    this.anims.create({
      key: 'operator_idle',
      frames: this.anims.generateFrameNumbers('playerSprite', { start: 0, end: 0 }),
      frameRate: 4,
      repeat: -1,
    });

    this.anims.create({
      key: 'operator_walk',
      frames: this.anims.generateFrameNumbers('playerSprite', { start: 0, end: 0 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'enemy_idle',
      frames: this.anims.generateFrameNumbers('enemySprite', { start: 0, end: 0 }),
      frameRate: 4,
      repeat: -1,
    });
  }

  /**
   * Create the game world
   */
  create() {
    console.log('🎮 AudioIntegratedGameScene started');

    // Initialize audio manager
    this.audioManager = new AudioManager(this);
    console.log('✅ AudioManager initialized');

    // Generate sprites
    this.generateSprites();
    this.createAnimations();

    // Create background
    this.createBackground();
    this.createPlayer();
    this.createWeapon();
    this.createUI();

    // Create enemy group
    this.enemyGroup = this.physics.add.group();
    this.spawnWave();

    // Setup input
    this.cursors = this.input.keyboard?.createCursorKeys() || null;
    this.input.keyboard?.on('keydown-M', () => this.toggleMute());

    // Setup camera
    this.setupCamera();

    // Start background music
    if (this.audioManager) {
      this.audioManager.playBackgroundMusic();
    }

    console.log('✅ Game scene with audio created');
  }

  /**
   * Generate sprites using PlayerSpriteGenerator
   */
  private generateSprites() {
    PlayerSpriteGenerator.generatePlayerSprite(this, 64, 64);
    PlayerSpriteGenerator.generateEnemySprite(this, 56, 56);
    PlayerSpriteGenerator.generateWeaponSprite(this, 48, 12);
    PlayerSpriteGenerator.generateEffectSprite(this, 'blood', 16);
    PlayerSpriteGenerator.generateEffectSprite(this, 'explosion', 32);
    PlayerSpriteGenerator.generateEffectSprite(this, 'smoke', 24);
    console.log('✅ All sprites generated');
  }

  /**
   * Create background
   */
  private createBackground() {
    const graphicsBackground = this.make.graphics({ x: 0, y: 0, add: true }, false);

    const tileSize = 32;
    for (let x = 0; x < 800; x += tileSize) {
      for (let y = 0; y < 600; y += tileSize) {
        const isEvenX = (x / tileSize) % 2 === 0;
        const isEvenY = (y / tileSize) % 2 === 0;
        const color = isEvenX === isEvenY ? 0x3d4a3d : 0x4a5c4a;
        graphicsBackground.fillStyle(color, 1);
        graphicsBackground.fillRect(x, y, tileSize, tileSize);
        graphicsBackground.lineStyle(1, 0x2a2a2a, 0.5);
        graphicsBackground.strokeRect(x, y, tileSize, tileSize);
      }
    }

    graphicsBackground.lineStyle(2, 0x5a7a5a, 1);
    graphicsBackground.strokeRect(50, 50, 700, 500);
  }

  /**
   * Create player with krapoovy beret
   */
  private createPlayer() {
    this.player = this.physics.add.sprite(400, 300, 'playerSprite');
    this.player.setScale(2);
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.player.play('operator_idle');
    console.log('✅ Player created');
  }

  /**
   * Create weapon
   */
  private createWeapon() {
    if (!this.player) return;

    this.weapon = this.add.sprite(this.player.x + 20, this.player.y, 'weaponSprite');
    this.weapon.setScale(2.5);
    this.weapon.setDepth(1);
  }

  /**
   * Spawn wave of enemies
   */
  private spawnWave() {
    if (!this.enemyGroup) return;

    const enemyCount = 3 + this.wave;
    for (let i = 0; i < enemyCount; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);

      const enemy = this.enemyGroup.create(x, y, 'enemySprite') as Phaser.Physics.Arcade.Sprite;
      enemy.setScale(1.8);
      enemy.play('enemy_idle');
      enemy.setData('health', 30 + this.wave * 5);

      this.enemies.push(enemy);
    }

    console.log(`🌊 Wave ${this.wave} spawned with ${enemyCount} enemies`);
  }

  /**
   * Create UI elements
   */
  private createUI() {
    this.add.rectangle(400, 25, 800, 50, 0x1a1a1a, 0.9).setDepth(100);

    this.add.text(10, 8, '🥊 VITYAZ: SPECIAL OPERATIONS 🥊', {
      fontSize: '14px',
      color: '#8b4513',
      fontStyle: 'bold',
    }).setDepth(101);

    this.add.rectangle(100, 50, 200, 30, 0x1a1a1a, 0.8).setOrigin(0, 0).setDepth(100);

    this.healthBar = this.make.graphics({ x: 102, y: 52, add: true }, false);
    this.healthBar.setDepth(100);
    this.updateHealthBar();

    this.add.text(310, 35, `HP: ${this.health}`, {
      fontSize: '14px',
      color: '#22c55e',
      fontStyle: 'bold',
    }).setDepth(101).setName('health_text');

    this.add.text(400, 35, `Ammo: ${this.ammo}/${this.maxAmmo}`, {
      fontSize: '14px',
      color: '#ffd700',
      fontStyle: 'bold',
    }).setDepth(101).setName('ammo_text');

    this.add.text(600, 35, `Wave: ${this.wave}`, {
      fontSize: '14px',
      color: '#ff6b6b',
      fontStyle: 'bold',
    }).setDepth(101).setName('wave_text');

    this.add.text(700, 35, `Score: ${this.score}`, {
      fontSize: '14px',
      color: '#8b4513',
      fontStyle: 'bold',
    }).setDepth(101).setName('score_text');

    // Audio controls info
    this.add.text(10, 580, 'Press M to mute/unmute audio | Arrow Keys to move | Click to shoot', {
      fontSize: '11px',
      color: '#888888',
    }).setDepth(101);

    console.log('✅ UI created');
  }

  /**
   * Update health bar
   */
  private updateHealthBar() {
    if (!this.healthBar) return;

    this.healthBar.clear();

    let barColor = 0x22c55e;
    if (this.health < 50) barColor = 0xeab308;
    if (this.health < 25) barColor = 0xef4444;

    const barWidth = 196 * (this.health / 100);
    this.healthBar.fillStyle(barColor, 1);
    this.healthBar.fillRect(0, 0, barWidth, 26);
    this.healthBar.lineStyle(1, 0xffffff, 1);
    this.healthBar.strokeRect(0, 0, 196, 26);
  }

  /**
   * Setup camera
   */
  private setupCamera() {
    if (!this.player) return;

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(1.5);
    this.cameras.main.setBounds(0, 0, 800, 600);
  }

  /**
   * Handle player movement
   */
  private handleMovement() {
    if (!this.player || !this.cursors) return;

    this.player.setVelocity(0, 0);
    let isMoving = false;

    if (this.cursors.left?.isDown) {
      this.player.setVelocityX(-160);
      isMoving = true;
    }
    if (this.cursors.right?.isDown) {
      this.player.setVelocityX(160);
      isMoving = true;
    }
    if (this.cursors.up?.isDown) {
      this.player.setVelocityY(-160);
      isMoving = true;
    }
    if (this.cursors.down?.isDown) {
      this.player.setVelocityY(160);
      isMoving = true;
    }

    if (isMoving) {
      this.player.play('operator_walk', true);
    } else {
      this.player.play('operator_idle', true);
    }
  }

  /**
   * Handle weapon firing with audio
   */
  private handleFiring() {
    if (!this.input.activePointer.isDown || this.ammo <= 0) return;

    const now = Date.now();
    if (now - this.lastShotTime < this.shotDelay) return;

    this.lastShotTime = now;

    // Play weapon sound
    if (this.audioManager) {
      this.audioManager.playWeaponFire('ak74m');
    }

    // Show muzzle flash
    this.showMuzzleFlash();

    // Use ammo
    this.ammo = Math.max(0, this.ammo - 1);
    const ammoText = this.children.getByName('ammo_text') as Phaser.GameObjects.Text;
    if (ammoText) {
      ammoText.setText(`Ammo: ${this.ammo}/${this.maxAmmo}`);
    }

    // Weapon recoil
    if (this.weapon) {
      this.tweens.add({
        targets: this.weapon,
        x: this.weapon.x - 10,
        duration: 50,
        yoyo: true,
      });
    }

    // Check for enemy hits
    this.checkEnemyHits();
  }

  /**
   * Check for enemy hits
   */
  private checkEnemyHits() {
    if (!this.player || !this.audioManager) return;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);

      if (distance < 200) {
        const health = enemy.getData('health') - 10;
        if (health <= 0) {
          // Play death sound
          this.audioManager.playEnemyDeath();

          // Create blood effect
          this.createBloodEffect(enemy.x, enemy.y);
          enemy.destroy();
          this.enemies.splice(i, 1);
          this.score += 100;

          if (this.enemies.length === 0) {
            this.nextWave();
          }
        } else {
          // Play hit sound
          this.audioManager.playEnemyHit();
          enemy.setData('health', health);
          this.createBloodEffect(enemy.x, enemy.y);
        }
      }
    }
  }

  /**
   * Create blood effect
   */
  private createBloodEffect(x: number, y: number) {
    const blood = this.add.sprite(x, y, 'effect_blood');
    blood.setScale(1.5);

    this.tweens.add({
      targets: blood,
      alpha: 0,
      duration: 600,
      onComplete: () => blood.destroy(),
    });
  }

  /**
   * Show muzzle flash
   */
  private showMuzzleFlash() {
    if (!this.weapon) return;

    const flash = this.add.sprite(this.weapon.x + 20, this.weapon.y, 'effect_explosion');
    flash.setScale(0.8);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 100,
      onComplete: () => flash.destroy(),
    });
  }

  /**
   * Take damage
   */
  private takeDamage(amount: number = 10) {
    if (!this.audioManager) return;

    this.health = Math.max(0, this.health - amount);
    this.updateHealthBar();

    // Play damage sound
    this.audioManager.playPlayerDamage();

    const healthText = this.children.getByName('health_text') as Phaser.GameObjects.Text;
    if (healthText) {
      healthText.setText(`HP: ${this.health}`);
    }

    this.cameras.main.flash(200, 255, 0, 0);

    if (this.health <= 0) {
      this.handleDeath();
    }
  }

  /**
   * Next wave
   */
  private nextWave() {
    if (!this.audioManager) return;

    this.wave++;
    const waveText = this.children.getByName('wave_text') as Phaser.GameObjects.Text;
    if (waveText) {
      waveText.setText(`Wave: ${this.wave}`);
    }

    this.ammo = this.maxAmmo;
    const ammoText = this.children.getByName('ammo_text') as Phaser.GameObjects.Text;
    if (ammoText) {
      ammoText.setText(`Ammo: ${this.ammo}/${this.maxAmmo}`);
    }

    // Play UI sound
    this.audioManager.playUIClick();
    this.spawnWave();
  }

  /**
   * Handle death
   */
  private handleDeath() {
    if (!this.player || !this.audioManager) return;

    console.log('💀 Player defeated!');
    this.player.setTint(0x8b4513);
    this.physics.pause();

    // Play explosion on death
    this.audioManager.playExplosion();

    this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(200).setScrollFactor(0);
  }

  /**
   * Toggle mute
   */
  private toggleMute() {
    if (!this.audioManager) return;

    const isMuted = this.audioManager.toggleMute();
    const muteText = isMuted ? '🔇 MUTED' : '🔊 AUDIO ON';
    console.log(muteText);
  }

  /**
   * Update game state
   */
  update() {
    this.handleMovement();
    this.handleFiring();

    if (this.player && this.weapon) {
      this.weapon.setPosition(this.player.x + 30, this.player.y - 5);
    }

    const scoreText = this.children.getByName('score_text') as Phaser.GameObjects.Text;
    if (scoreText) {
      scoreText.setText(`Score: ${this.score}`);
    }

    // Enemy AI
    for (const enemy of this.enemies) {
      if (!this.player) continue;

      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        enemy.x,
        enemy.y
      );

      if (distance < 300) {
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        const speed = 80;
        enemy.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      } else {
        enemy.setVelocity(0, 0);
      }

      if (distance < 30) {
        this.takeDamage(1);
      }
    }
  }

  /**
   * Shutdown scene
   */
  shutdown() {
    if (this.audioManager) {
      this.audioManager.stopBackgroundMusic();
    }
  }
}

/**
 * Preload Scene with Audio
 */
export class AudioIntegratedPreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'AudioIntegratedPreloadScene' });
  }

  preload() {
    console.log('📦 Loading game with audio system...');

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x8b4513, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      console.log('✅ Audio system loaded successfully!');
      progressBox.destroy();
      progressBar.destroy();
    });
  }

  create() {
    this.scene.start('AudioIntegratedGameScene');
  }
}
