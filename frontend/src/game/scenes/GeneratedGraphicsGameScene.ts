import Phaser from 'phaser';

/**
 * Game Scene with Automated Graphics Integration
 * 
 * This scene demonstrates full integration of generated graphics:
 * - Character sprites with animations
 * - Weapon sprites
 * - UI elements (HUD)
 * - Visual effects
 * - Particle systems
 */
export class GeneratedGraphicsGameScene extends Phaser.Scene {
  private player: Phaser.Physics.Arcade.Sprite | null = null;
  private weapon: Phaser.Physics.Arcade.Sprite | null = null;
  private healthBar: Phaser.GameObjects.Graphics | null = null;
  private muzzleFlash: Phaser.GameObjects.Sprite | null = null;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private health: number = 100;
  private ammo: number = 30;
  private maxAmmo: number = 30;

  constructor() {
    super({ key: 'GeneratedGraphicsGameScene' });
  }

  /**
   * Create all game animations
   */
  private createAnimations() {
    // Character idle animation (breathing)
    this.anims.create({
      key: 'operator_idle',
      frames: this.anims.generateFrameNumbers('vityaz_operator', {
        start: 0,
        end: 3,
      }),
      frameRate: 4,
      repeat: -1,
    });

    // Character walk animation
    this.anims.create({
      key: 'operator_walk',
      frames: this.anims.generateFrameNumbers('vityaz_operator', {
        start: 4,
        end: 7,
      }),
      frameRate: 10,
      repeat: -1,
    });

    // Muzzle flash effect
    this.anims.create({
      key: 'muzzle_flash',
      frames: this.anims.generateFrameNumbers('muzzle_flash', {
        start: 0,
        end: 2,
      }),
      frameRate: 15,
      repeat: 0,
    });
  }

  /**
   * Create the game world
   */
  create() {
    console.log('🎮 GeneratedGraphicsGameScene started');

    // Create animations from loaded assets
    this.createAnimations();

    // Create background
    this.createBackground();

    // Create player character
    this.createPlayer();

    // Create weapon
    this.createWeapon();

    // Create UI
    this.createUI();

    // Create input
    this.cursors = this.input.keyboard?.createCursorKeys() || null;

    // Setup camera
    this.setupCamera();

    console.log('✅ Game scene created successfully');
  }

  /**
   * Create background/map
   */
  private createBackground() {
    // Create tilemap background (simple for demo)
    const graphicsBackground = this.make.graphics({
      x: 0,
      y: 0,
      add: true,
    });

    // Draw ground tiles (simulated)
    const tileSize = 32;
    for (let x = 0; x < 800; x += tileSize) {
      for (let y = 0; y < 600; y += tileSize) {
        // Alternate tile colors for checkerboard
        const isEvenX = (x / tileSize) % 2 === 0;
        const isEvenY = (y / tileSize) % 2 === 0;
        const color = isEvenX === isEvenY ? 0x3d4a3d : 0x4a5c4a;
        graphicsBackground.fillStyle(color, 1);
        graphicsBackground.fillRect(x, y, tileSize, tileSize);
        graphicsBackground.lineStyle(1, 0x2a2a2a, 0.5);
        graphicsBackground.strokeRect(x, y, tileSize, tileSize);
      }
    }
  }

  /**
   * Create player character
   */
  private createPlayer() {
    this.player = this.physics.add.sprite(400, 300, 'vityaz_operator');
    this.player.setScale(2); // Scale up the sprite
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.player.play('operator_idle');

    // Add glow effect (optional)
    // this.player.setTint(0xffffff);

    console.log('✅ Player created:', this.player);
  }

  /**
   * Create weapon sprite
   */
  private createWeapon() {
    if (!this.player) return;

    // Create weapon sprite at player position
    this.weapon = this.add.sprite(this.player.x + 20, this.player.y, 'ak74m');
    this.weapon.setScale(2);
    this.weapon.setDepth(1); // Render on top

    console.log('✅ Weapon created:', this.weapon);
  }

  /**
   * Create UI elements
   */
  private createUI() {
    // Health bar background
    this.add
      .rectangle(100, 30, 200, 30, 0x1a1a1a, 0.8)
      .setOrigin(0, 0);

    // Health bar
    this.healthBar = this.make.graphics(
      {
        x: 102,
        y: 32,
        add: true,
      },
      false
    );
    this.updateHealthBar();

    // Health text
    this.add.text(310, 30, `HP: ${this.health}`, {
      fontSize: '16px',
      color: '#ffffff',
    });

    // Ammo counter
    this.add.text(400, 30, `Ammo: ${this.ammo}/${this.maxAmmo}`, {
      fontSize: '16px',
      color: '#ffd700',
    }).setName('ammo_text');

    // Crosshair
    const crosshair = this.add.sprite(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      'crosshair'
    );
    crosshair.setDepth(100);
    crosshair.setScale(1.5);

    // Mini HUD info
    this.add.text(10, 10, 'VITYAZ: Special Operations', {
      fontSize: '12px',
      color: '#8b1538',
      fontStyle: 'bold',
    });

    console.log('✅ UI created');
  }

  /**
   * Update health bar display
   */
  private updateHealthBar() {
    if (!this.healthBar) return;

    this.healthBar.clear();

    // Health bar color based on health percentage
    let barColor = 0x22c55e; // Green
    if (this.health < 50) {
      barColor = 0xeab308; // Yellow
    }
    if (this.health < 25) {
      barColor = 0xef4444; // Red
    }

    const barWidth = 196 * (this.health / 100);
    this.healthBar.fillStyle(barColor, 1);
    this.healthBar.fillRect(0, 0, barWidth, 26);

    // Border
    this.healthBar.lineStyle(1, 0xffffff, 1);
    this.healthBar.strokeRect(0, 0, 196, 26);
  }

  /**
   * Setup game camera
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
   * Handle weapon firing
   */
  private handleFiring() {
    if (!this.input.activePointer.isDown || this.ammo <= 0) return;

    // Show muzzle flash
    this.showMuzzleFlash();

    // Use ammo
    this.ammo = Math.max(0, this.ammo - 1);
    const ammoText = this.children.getByName('ammo_text') as Phaser.GameObjects.Text;
    if (ammoText) {
      ammoText.setText(`Ammo: ${this.ammo}/${this.maxAmmo}`);
    }

    // Weapon recoil (visual feedback)
    if (this.weapon) {
      this.tweens.add({
        targets: this.weapon,
        x: this.weapon.x - 10,
        duration: 50,
        yoyo: true,
      });
    }

    // Play firing sound (if available)
    // this.sound.play('ak74m_fire');
  }

  /**
   * Show muzzle flash effect
   */
  private showMuzzleFlash() {
    if (!this.weapon) return;

    // Create muzzle flash at weapon tip
    if (!this.muzzleFlash) {
      this.muzzleFlash = this.add.sprite(
        this.weapon.x + 20,
        this.weapon.y,
        'muzzle_flash'
      );
      this.muzzleFlash.setScale(1.5);
    }

    this.muzzleFlash.setPosition(this.weapon.x + 20, this.weapon.y);
    this.muzzleFlash.play('muzzle_flash');
  }

  /**
   * Handle damage
   */
  private takeDamage(amount: number = 10) {
    this.health = Math.max(0, this.health - amount);
    this.updateHealthBar();

    // Flash screen on damage
    this.cameras.main.flash(200, 255, 0, 0);

    if (this.health <= 0) {
      this.handleDeath();
    }
  }

  /**
   * Handle player death
   */
  private handleDeath() {
    if (!this.player) return;

    console.log('💀 Player defeated!');
    this.player.setTint(0x8b1538); // Krapovy color tint
    this.physics.pause();
  }

  /**
   * Update game state
   */
  update() {
    this.handleMovement();
    this.handleFiring();

    // Keep weapon in hand
    if (this.player && this.weapon) {
      this.weapon.setPosition(this.player.x + 30, this.player.y - 5);
    }

    // Demo: take damage on spacebar
    if (this.input.keyboard?.addKey('SPACE').isDown) {
      // this.takeDamage(1);
    }
  }
}

/**
 * Preload Scene with Generated Graphics
 */
export class GeneratedGraphicsPreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GeneratedGraphicsPreloadScene' });
  }

  preload() {
    console.log('📦 Loading generated graphics...');

    // Create progress bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(
      width / 2 - 160,
      height / 2 - 25,
      320,
      50
    );

    // Character sprites
    this.load.spritesheet('vityaz_operator', 'assets/sprites/characters/vityaz_operator.png', {
      frameWidth: 64,
      frameHeight: 64,
    });

    // Weapons
    this.load.image('ak74m', 'assets/sprites/weapons/ak74m.png');
    this.load.image('svd', 'assets/sprites/weapons/svd.png');
    this.load.image('pmm', 'assets/sprites/weapons/pmm.png');

    // UI
    this.load.image('emblem', 'assets/ui/vityaz_emblem.png');
    this.load.image('crosshair', 'assets/ui/hud/crosshair.png');

    // Effects
    this.load.spritesheet('muzzle_flash', 'assets/effects/particles/muzzle_flash_01.png', {
      frameWidth: 16,
      frameHeight: 16,
    });

    // Update progress
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x8b1538, 1); // Krapovy maroon
      progressBar.fillRect(
        width / 2 - 150,
        height / 2 - 15,
        300 * value,
        30
      );
    });

    this.load.on('complete', () => {
      console.log('✅ All graphics loaded!');
      progressBox.destroy();
      progressBar.destroy();
    });
  }

  create() {
    this.scene.start('GeneratedGraphicsGameScene');
  }
}
