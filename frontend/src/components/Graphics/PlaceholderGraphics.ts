/**
 * Placeholder Graphics Generator
 * Creates simple placeholder graphics for game assets
 */

export class PlaceholderGraphics {
  /**
   * Create player sprite placeholder
   */
  static createPlayerSprite(scene: Phaser.Scene): Phaser.Physics.Arcade.Sprite {
    // Create graphics object
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

    // Draw green rectangle for player
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 32, 64);

    // Add outline
    graphics.lineStyle(2, 0xffffff);
    graphics.strokeRect(0, 0, 32, 64);

    // Create texture from graphics
    graphics.generateTexture('player-sprite', 32, 64);
    graphics.destroy();

    // Create sprite
    return scene.physics.add.sprite(512, 384, 'player-sprite');
  }

  /**
   * Create enemy sprite placeholder
   */
  static createEnemySprite(scene: Phaser.Scene, x: number, y: number) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

    // Draw red rectangle for enemy
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 32, 64);

    // Add outline
    graphics.lineStyle(2, 0xffffff);
    graphics.strokeRect(0, 0, 32, 64);

    graphics.generateTexture('enemy-sprite', 32, 64);
    graphics.destroy();

    return scene.physics.add.sprite(x, y, 'enemy-sprite');
  }

  /**
   * Create background placeholder
   */
  static createBackground(scene: Phaser.Scene) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

    // Dark background
    graphics.fillStyle(0x333333, 1);
    graphics.fillRect(0, 0, 1024, 768);

    // Grid pattern
    graphics.lineStyle(1, 0x444444);
    const gridSize = 64;
    for (let x = 0; x < 1024; x += gridSize) {
      graphics.lineBetween(x, 0, x, 768);
    }
    for (let y = 0; y < 768; y += gridSize) {
      graphics.lineBetween(0, y, 1024, y);
    }

    graphics.generateTexture('background', 1024, 768);
    graphics.destroy();

    return scene.add.image(512, 384, 'background');
  }

  /**
   * Create bullet placeholder
   */
  static createBullet(scene: Phaser.Scene, x: number, y: number) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

    // Small yellow circle for bullet
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(4, 4, 4);

    graphics.generateTexture('bullet', 8, 8);
    graphics.destroy();

    return scene.physics.add.sprite(x, y, 'bullet');
  }

  /**
   * Create UI elements
   */
  static createHealthBar(scene: Phaser.Scene, x: number, y: number, width: number = 100) {
    const background = scene.add.rectangle(x, y, width, 10, 0x333333);
    const fill = scene.add.rectangle(x - width / 2 + 50, y, width - 4, 6, 0x00ff00);
    return { background, fill };
  }
}
