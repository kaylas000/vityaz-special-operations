import Phaser from 'phaser';
import { PlaceholderGraphics } from '../components/Graphics/PlaceholderGraphics';

export class BattleScene extends Phaser.Scene {
  private player: Phaser.Physics.Arcade.Sprite | null = null;
  private enemies: Phaser.Physics.Arcade.Sprite[] = [];
  private bullets: Phaser.Physics.Arcade.Sprite[] = [];
  private keys: any;
  private score: number = 0;
  private health: number = 100;
  private ammo: number = 30;
  private healthBar: any;
  private scoreText: Phaser.GameObjects.Text | null = null;
  private ammoText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super('BattleScene');
  }

  preload() {
    // Create placeholder graphics
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Player sprite
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 32, 64);
    graphics.generateTexture('player', 32, 64);
    
    // Enemy sprite
    graphics.clear();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 32, 64);
    graphics.generateTexture('enemy', 32, 64);
    
    // Bullet
    graphics.clear();
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('bullet', 8, 8);
    
    graphics.destroy();
  }

  create() {
    // Background
    this.add.rectangle(512, 384, 1024, 768, 0x222222);
    this.add.grid(512, 384, 1024, 768, 64, 64, 0x444444, 1);

    // Create player
    this.player = this.physics.add.sprite(512, 384, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.1);

    // Create enemies
    for (let i = 0; i < 3; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 768;
      const enemy = this.physics.add.sprite(x, y, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      );
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
      this.enemies.push(enemy);
    }

    // Input
    this.keys = this.input.keyboard?.createCursorKeys();

    // UI
    this.scoreText = this.add.text(10, 10, `Score: ${this.score}`, {
      fontSize: '20px',
      color: '#ffffff',
    });

    this.ammoText = this.add.text(10, 40, `Ammo: ${this.ammo}`, {
      fontSize: '20px',
      color: '#ffff00',
    });

    // Health bar
    this.healthBar = this.add.rectangle(1024 - 150, 20, 140, 20, 0x00ff00);
    this.add.rectangle(1024 - 150, 20, 140, 20).setStrokeStyle(2, 0xffffff);

    // Click to shoot
    this.input.on('pointerdown', () => this.shoot());
  }

  update() {
    if (!this.player) return;

    // Player movement
    this.player.setVelocity(0, 0);
    if (this.keys?.left.isDown || this.keys?.a.isDown) {
      this.player.setVelocityX(-200);
    }
    if (this.keys?.right.isDown || this.keys?.d.isDown) {
      this.player.setVelocityX(200);
    }
    if (this.keys?.up.isDown || this.keys?.w.isDown) {
      this.player.setVelocityY(-200);
    }
    if (this.keys?.down.isDown || this.keys?.s.isDown) {
      this.player.setVelocityY(200);
    }

    // Update bullets
    this.bullets.forEach((bullet, index) => {
      if (bullet.y < 0 || bullet.y > 768 || bullet.x < 0 || bullet.x > 1024) {
        bullet.destroy();
        this.bullets.splice(index, 1);
      }
    });

    // Update UI
    if (this.scoreText) {
      this.scoreText.setText(`Score: ${this.score}`);
    }
    if (this.ammoText) {
      this.ammoText.setText(`Ammo: ${this.ammo}`);
    }

    // Health bar
    const healthPercent = (this.health / 100) * 140;
    this.healthBar.setDisplaySize(Math.max(0, healthPercent), 20);
  }

  private shoot() {
    if (this.ammo <= 0 || !this.player) return;

    const bullet = this.physics.add.sprite(
      this.player.x,
      this.player.y,
      'bullet'
    );

    // Get mouse position
    const mouseX = this.input.mousePointer.x;
    const mouseY = this.input.mousePointer.y;

    // Calculate direction
    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      mouseX,
      mouseY
    );

    bullet.setVelocity(
      Math.cos(angle) * 300,
      Math.sin(angle) * 300
    );

    this.bullets.push(bullet);
    this.ammo--;
  }

  takeDamage(amount: number) {
    this.health -= amount;
    if (this.health <= 0) {
      this.gameOver();
    }
  }

  addScore(points: number) {
    this.score += points;
  }

  private gameOver() {
    this.scene.pause();
    this.add.text(512, 384, 'GAME OVER', {
      fontSize: '40px',
      color: '#ff0000',
      align: 'center',
    }).setOrigin(0.5);
  }
}
