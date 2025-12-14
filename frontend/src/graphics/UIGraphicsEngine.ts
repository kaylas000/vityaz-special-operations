/**
 * 🏑 UI GRAPHICS ENGINE - VITYAZ
 * Professional HUD, menus, and interface graphics
 * Tactical overlay, weapon stats, and tactical information display
 * 
 * @author VITYAZ Development Team
 * @version 1.0.0
 * @date 2025-12-14
 */

import { Scene, GameObjects } from 'phaser';
import ProceduralGraphics from './ProceduralGraphics';

/**
 * UI Configuration
 */
interface UIConfig {
  width: number;
  height: number;
  theme: 'dark' | 'military';
  accentColor: string;
}

/**
 * UI Graphics Engine
 */
export class UIGraphicsEngine {
  private scene: Scene;
  private config: UIConfig;
  private uiElements: Map<string, GameObjects.GameObject> = new Map();

  constructor(scene: Scene, config: UIConfig) {
    this.scene = scene;
    this.config = config;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TACTICAL HUD
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Create main HUD overlay (bottom-left health, ammo, etc.)
   */
  createMainHUD(): void {
    // Background panel
    const hudBackground = this.scene.add.graphics();
    hudBackground.fillStyle(0x000000, 0.6);
    hudBackground.fillRoundedRect(10, this.config.height - 120, 200, 110, 8);
    hudBackground.lineStyle(2, 0x00ff00, 1);
    hudBackground.strokeRoundedRect(10, this.config.height - 120, 200, 110, 8);
    hudBackground.setDepth(100);
    this.uiElements.set('hud-background', hudBackground);
  }

  /**
   * Create health bar with text
   */
  createHealthBar(
    x: number = 30,
    y: number = 0,
    health: number = 100
  ): GameObjects.Container {
    const container = this.scene.add.container(x, y);
    const healthPercentage = health / 100;

    // Background bar
    const barBg = this.scene.add.rectangle(0, y, 80, 8, 0x330000);
    barBg.setOrigin(0, 0);

    // Health bar (green)
    const barColor = health > 50 ? 0x00ff00 : health > 25 ? 0xffff00 : 0xff0000;
    const bar = this.scene.add.rectangle(0, y, 80 * healthPercentage, 8, barColor);
    bar.setOrigin(0, 0);

    // Border
    const border = this.scene.add.graphics();
    border.lineStyle(1, 0xffffff);
    border.strokeRect(0, y, 80, 8);

    // Health text
    const healthText = this.scene.add.text(85, y + 1, `${health}/100`, {
      font: '10px Arial',
      color: '#00ff00',
    });

    container.add([barBg, bar, border, healthText]);
    return container;
  }

  /**
   * Create ammo counter
   */
  createAmmoCounter(
    x: number = 30,
    y: number = 20,
    ammo: number = 30,
    maxAmmo: number = 30
  ): GameObjects.Text {
    const text = this.scene.add.text(x, y, `AMMO: ${ammo}/${maxAmmo}`, {
      font: 'bold 12px Arial',
      color: '#00ff00',
    });
    text.setDepth(101);
    return text;
  }

  /**
   * Create wave indicator
   */
  createWaveIndicator(
    wave: number = 1,
    enemiesRemaining: number = 10
  ): GameObjects.Text {
    const text = this.scene.add.text(
      this.config.width / 2 - 80,
      20,
      `WAVE ${wave} | ENEMIES: ${enemiesRemaining}`,
      {
        font: 'bold 14px Arial',
        color: '#ffff00',
      }
    );
    text.setDepth(101);
    return text;
  }

  /**
   * Create weapon status panel
   */
  createWeaponStatus(
    weaponName: string = 'AK-74M',
    damage: number = 25,
    fireRate: number = 10
  ): GameObjects.Text {
    const text = this.scene.add.text(
      this.config.width - 150,
      this.config.height - 100,
      `[${weaponName}]\nDMG: ${damage} | FIRE RATE: ${fireRate}`,
      {
        font: '10px Arial',
        color: '#ff9900',
      }
    );
    text.setDepth(101);
    return text;
  }

  /**
   * Create minimap in corner
   */
  createMinimap(
    mapWidth: number = 100,
    mapHeight: number = 100
  ): GameObjects.Graphics {
    const minimap = this.scene.add.graphics();
    minimap.fillStyle(0x000000, 0.8);
    minimap.fillRoundedRect(
      this.config.width - 120,
      10,
      110,
      110,
      8
    );
    minimap.lineStyle(2, 0x00ff00);
    minimap.strokeRoundedRect(
      this.config.width - 120,
      10,
      110,
      110,
      8
    );
    minimap.setDepth(100);
    return minimap;
  }

  /**
   * Create compass at top
   */
  createCompass(
    playerRotation: number = 0
  ): GameObjects.Graphics {
    const compass = this.scene.add.graphics();
    const centerX = this.config.width / 2;
    const centerY = 30;
    const radius = 20;

    // Circle background
    compass.fillStyle(0x000000, 0.7);
    compass.fillCircle(centerX, centerY, radius);
    compass.lineStyle(2, 0x00ff00);
    compass.strokeCircle(centerX, centerY, radius);

    // Cardinal directions
    compass.fillStyle(0xffffff);
    compass.lineStyle(1, 0xffffff);
    // North
    compass.fillPointShape([{ x: centerX, y: centerY - radius }, { x: centerX - 2, y: centerY - radius + 3 }, { x: centerX + 2, y: centerY - radius + 3 }]);

    // Pointer for player direction
    compass.lineStyle(2, 0xff0000);
    const pointerX = centerX + Math.cos(playerRotation - Math.PI / 2) * (radius - 2);
    const pointerY = centerY + Math.sin(playerRotation - Math.PI / 2) * (radius - 2);
    compass.lineBetween(centerX, centerY, pointerX, pointerY);

    compass.setDepth(100);
    return compass;
  }

  /**
   * Create score display
   */
  createScoreDisplay(
    kills: number = 0,
    score: number = 0,
    multiplier: number = 1
  ): GameObjects.Text {
    const multiplierText = multiplier > 1 ? ` x${multiplier.toFixed(1)}` : '';
    const text = this.scene.add.text(
      20,
      20,
      `KILLS: ${kills} | SCORE: ${score}${multiplierText}`,
      {
        font: 'bold 14px Arial',
        color: multiplier > 1 ? '#ff00ff' : '#00ff00',
      }
    );
    text.setDepth(101);
    return text;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MENUS & DIALOGS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Create main menu
   */
  createMainMenu(): void {
    // Semi-transparent background
    const bg = this.scene.add.rectangle(
      this.config.width / 2,
      this.config.height / 2,
      this.config.width,
      this.config.height,
      0x000000,
      0.9
    );
    bg.setDepth(200);

    // Title
    const title = this.scene.add.text(
      this.config.width / 2,
      100,
      '🧠 VITYAZ: SPECIAL OPERATIONS',
      {
        font: 'bold 40px Arial',
        color: '#00ff00',
      }
    );
    title.setOrigin(0.5);
    title.setDepth(201);

    // Subtitle
    const subtitle = this.scene.add.text(
      this.config.width / 2,
      160,
      'Тактический FPS с крипто-экономикой',
      {
        font: '16px Arial',
        color: '#aaaaaa',
      }
    );
    subtitle.setOrigin(0.5);
    subtitle.setDepth(201);

    // Menu buttons
    const buttons = ['START GAME', 'SETTINGS', 'HELP', 'EXIT'];
    buttons.forEach((buttonText, index) => {
      const y = 250 + index * 50;
      this.createMenuButton(buttonText, this.config.width / 2, y, 201);
    });
  }

  /**
   * Create styled menu button
   */
  private createMenuButton(
    text: string,
    x: number,
    y: number,
    depth: number
  ): GameObjects.Container {
    const container = this.scene.add.container(x, y);

    // Button background
    const bg = this.scene.add.rectangle(0, 0, 200, 40, 0x1a1a1a);
    bg.setStrokeStyle(2, 0x00ff00);

    // Button text
    const buttonText = this.scene.add.text(0, 0, text, {
      font: 'bold 16px Arial',
      color: '#00ff00',
    });
    buttonText.setOrigin(0.5);

    // Hover effect
    bg.setInteractive();
    bg.on('pointerover', () => {
      bg.setFillStyle(0x003300);
      buttonText.setColor('#ffff00');
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(0x1a1a1a);
      buttonText.setColor('#00ff00');
    });

    container.add([bg, buttonText]);
    container.setDepth(depth);
    return container;
  }

  /**
   * Create pause menu
   */
  createPauseMenu(): void {
    // Full-screen overlay
    const overlay = this.scene.add.rectangle(
      this.config.width / 2,
      this.config.height / 2,
      this.config.width,
      this.config.height,
      0x000000,
      0.8
    );
    overlay.setDepth(250);

    // Pause text
    const pauseText = this.scene.add.text(
      this.config.width / 2,
      this.config.height / 2 - 80,
      '|| PAUSED',
      {
        font: 'bold 48px Arial',
        color: '#ff0000',
      }
    );
    pauseText.setOrigin(0.5);
    pauseText.setDepth(251);

    // Resume button
    this.createMenuButton('RESUME', this.config.width / 2, this.config.height / 2, 251);

    // Settings button
    this.createMenuButton('SETTINGS', this.config.width / 2, this.config.height / 2 + 60, 251);

    // Exit button
    this.createMenuButton('MAIN MENU', this.config.width / 2, this.config.height / 2 + 120, 251);
  }

  /**
   * Create game over screen
   */
  createGameOverScreen(
    finalScore: number = 0,
    killCount: number = 0,
    waveReached: number = 1
  ): void {
    const bg = this.scene.add.rectangle(
      this.config.width / 2,
      this.config.height / 2,
      this.config.width,
      this.config.height,
      0x000000,
      1
    );
    bg.setDepth(300);

    // Game Over text
    const gameOverText = this.scene.add.text(
      this.config.width / 2,
      100,
      'GAME OVER',
      {
        font: 'bold 60px Arial',
        color: '#ff0000',
      }
    );
    gameOverText.setOrigin(0.5);
    gameOverText.setDepth(301);

    // Stats
    const statsText = this.scene.add.text(
      this.config.width / 2,
      250,
      `FINAL SCORE: ${finalScore}\nKILLS: ${killCount}\nWAVE: ${waveReached}`,
      {
        font: '24px Arial',
        color: '#00ff00',
        align: 'center',
      }
    );
    statsText.setOrigin(0.5);
    statsText.setDepth(301);

    // Restart button
    this.createMenuButton('RESTART', this.config.width / 2, this.config.height / 2 + 100, 301);

    // Main menu button
    this.createMenuButton('MAIN MENU', this.config.width / 2, this.config.height / 2 + 160, 301);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Update HUD elements
   */
  updateHUD(
    health: number,
    ammo: number,
    maxAmmo: number,
    score: number,
    kills: number,
    wave: number,
    enemiesRemaining: number
  ): void {
    // Update methods would be implemented here
  }

  /**
   * Show floating damage number
   */
  showDamageNumber(x: number, y: number, damage: number, critical: boolean = false): void {
    const color = critical ? '#ff0000' : '#ffff00';
    const text = this.scene.add.text(x, y, damage.toString(), {
      font: `bold ${critical ? '16' : '12'}px Arial`,
      color: color,
    });
    text.setDepth(102);

    // Float upward and fade
    this.scene.tweens.add({
      targets: text,
      y: y - 30,
      alpha: 0,
      duration: 1000,
      onComplete: () => text.destroy(),
    });
  }

  /**
   * Show status notification
   */
  showNotification(message: string, duration: number = 3000): void {
    const bg = this.scene.add.rectangle(
      this.config.width / 2,
      this.config.height / 2 - 100,
      300,
      50,
      0x000000,
      0.8
    );
    bg.setDepth(150);

    const text = this.scene.add.text(
      this.config.width / 2,
      this.config.height / 2 - 100,
      message,
      {
        font: '14px Arial',
        color: '#00ff00',
      }
    );
    text.setOrigin(0.5);
    text.setDepth(151);

    this.scene.time.delayedCall(duration, () => {
      bg.destroy();
      text.destroy();
    });
  }
}

export default UIGraphicsEngine;
