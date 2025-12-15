import Phaser from 'phaser';

/**
 * Main Menu Scene for VITYAZ
 * 
 * Features:
 * - Professional UI with Vityaz branding
 * - Animated background
 * - Menu buttons with hover effects
 * - Settings display
 * - Leaderboard preview
 * - Official Vityaz colors (Crimson + Gold)
 */

export class MainMenuScene extends Phaser.Scene {
  private vityazLogo?: Phaser.GameObjects.Graphics;
  private buttons: Map<string, MenuButton> = new Map();
  private selectedButtonIndex: number = 0;

  // Vityaz Official Colors
  readonly VITYAZ_CRIMSON = 0xA01030;
  readonly VITYAZ_GOLD = 0xD4AF37;
  readonly MILITARY_GRAY = 0x4A5568;
  readonly BACKGROUND_DARK = 0x1A1A1A;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create animated background
    this.createAnimatedBackground();

    // Create Vityaz logo and title
    this.createVityazBranding(width, height);

    // Create menu buttons
    this.createMenuButtons(width, height);

    // Create bottom info panel
    this.createInfoPanel(width, height);

    // Setup input
    this.setupInputHandlers();
  }

  /**
   * Create animated background with military aesthetic
   */
  private createAnimatedBackground(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Main background
    const bg = this.add.graphics();
    bg.fillStyle(this.BACKGROUND_DARK, 1);
    bg.fillRect(0, 0, width, height);

    // Add tactical grid pattern
    this.createTacticalGrid(width, height);

    // Add animated scan lines (cyberpunk effect)
    this.createScanLines();
  }

  /**
   * Create tactical grid background pattern
   */
  private createTacticalGrid(width: number, height: number): void {
    const grid = this.add.graphics();
    grid.lineStyle(1, this.MILITARY_GRAY, 0.1);

    const gridSize = 50;

    // Vertical lines
    for (let x = 0; x < width; x += gridSize) {
      grid.lineBetween(x, 0, x, height);
    }

    // Horizontal lines
    for (let y = 0; y < height; y += gridSize) {
      grid.lineBetween(0, y, width, y);
    }

    // Corner markers
    grid.fillStyle(this.VITYAZ_CRIMSON, 0.3);
    grid.fillCircle(20, 20, 10);
    grid.fillCircle(width - 20, 20, 10);
    grid.fillCircle(20, height - 20, 10);
    grid.fillCircle(width - 20, height - 20, 10);
  }

  /**
   * Create animated scan lines effect
   */
  private createScanLines(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const scanLines = this.add.graphics();
    scanLines.lineStyle(2, 0x00FF00, 0.05);

    for (let y = 0; y < height; y += 4) {
      scanLines.lineBetween(0, y, width, y);
    }

    // Animate scan lines
    this.tweens.add({
      targets: scanLines,
      y: height,
      duration: 4000,
      repeat: -1,
      ease: 'Linear',
    });
  }

  /**
   * Create Vityaz logo and title branding
   */
  private createVityazBranding(width: number, height: number): void {
    // Draw Crimson Beret Symbol
    this.vityazLogo = this.add.graphics();
    this.drawCrimsonBeret(this.vityazLogo, width / 2, height * 0.15, 60);

    // Title text
    const titleStyle = {
      fontFamily: 'Arial, sans-serif',
      fontSize: '64px',
      fontStyle: 'bold',
      color: '#FFFFFF',
      stroke: '#A01030',
      strokeThickness: 3,
    };

    this.add.text(width / 2, height * 0.3, 'VITYAZ', {
      ...titleStyle,
      align: 'center',
    }).setOrigin(0.5);

    // Subtitle
    const subtitleStyle = {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#D4AF37',
      align: 'center',
    };

    this.add.text(
      width / 2,
      height * 0.37,
      'Special Operations - Tactical FPS',
      { ...subtitleStyle }
    ).setOrigin(0.5);

    // Version info
    this.add.text(
      width / 2,
      height * 0.42,
      'v0.1.0 - Alpha Build',
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        color: '#888888',
        align: 'center',
      }
    ).setOrigin(0.5);
  }

  /**
   * Draw Crimson Beret Symbol
   */
  private drawCrimsonBeret(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    size: number
  ): void {
    // Beret base (tilted left)
    graphics.save();
    graphics.translate(x, y);
    graphics.rotate(-0.3);

    graphics.fillStyle(this.VITYAZ_CRIMSON, 1);
    graphics.beginPath();
    graphics.arc(0, 0, size * 0.7, 0, Math.PI, true);
    graphics.lineTo(size * 0.7, 0);
    graphics.closePath();
    graphics.fillPath();

    // Beret band
    graphics.fillStyle(0x1A1A1A, 1);
    graphics.fillRect(-size * 0.75, size * 0.6, size * 1.5, size * 0.2);

    // Gold star insignia
    graphics.fillStyle(this.VITYAZ_GOLD, 1);
    graphics.fillStar(0, -size * 0.3, 5, size * 0.25, size * 0.15);

    graphics.restore();

    // Decorative circles
    graphics.lineStyle(2, this.VITYAZ_GOLD, 0.8);
    graphics.strokeCircleShape(new Phaser.Geom.Circle(x, y, size + 10));
  }

  /**
   * Create main menu buttons
   */
  private createMenuButtons(width: number, height: number): void {
    const centerX = width / 2;
    const startY = height * 0.5;
    const buttonSpacing = 70;

    const menuItems = [
      { label: 'START GAME', action: 'startGame' },
      { label: 'MAP SELECTION', action: 'mapSelection' },
      { label: 'SETTINGS', action: 'settings' },
      { label: 'LEADERBOARD', action: 'leaderboard' },
      { label: 'EXIT', action: 'exit' },
    ];

    menuItems.forEach((item, index) => {
      const y = startY + index * buttonSpacing;
      const button = new MenuButton(
        this,
        centerX,
        y,
        item.label,
        item.action,
        index === 0
      );
      this.buttons.set(item.action, button);
    });
  }

  /**
   * Create info panel at bottom
   */
  private createInfoPanel(width: number, height: number): void {
    const panelHeight = 100;
    const panelY = height - panelHeight;

    // Panel background
    const panel = this.add.graphics();
    panel.fillStyle(this.MILITARY_GRAY, 0.3);
    panel.fillRect(0, panelY, width, panelHeight);

    // Top border
    panel.lineStyle(2, this.VITYAZ_GOLD, 0.8);
    panel.lineBetween(0, panelY, width, panelY);

    // Status text
    this.add.text(20, panelY + 15, 'Status: READY', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#00FF00',
    });

    // Controls info
    this.add.text(20, panelY + 50, 'Arrow Keys: Navigate | Enter: Select | ESC: Exit', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#888888',
    });
  }

  /**
   * Setup keyboard input handlers
   */
  private setupInputHandlers(): void {
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      const buttons = Array.from(this.buttons.values());

      switch (event.key.toLowerCase()) {
        case 'arrowup':
          this.selectButton(
            (this.selectedButtonIndex - 1 + buttons.length) % buttons.length
          );
          break;

        case 'arrowdown':
          this.selectButton((this.selectedButtonIndex + 1) % buttons.length);
          break;

        case 'enter':
          buttons[this.selectedButtonIndex].activate();
          break;

        case 'escape':
          this.handleExit();
          break;
      }
    });
  }

  /**
   * Select button by index
   */
  private selectButton(index: number): void {
    const buttons = Array.from(this.buttons.values());
    if (this.selectedButtonIndex !== index && buttons[this.selectedButtonIndex]) {
      buttons[this.selectedButtonIndex].deselect();
    }

    this.selectedButtonIndex = index;
    if (buttons[index]) {
      buttons[index].select();
    }
  }

  /**
   * Handle menu actions
   */
  handleMenuAction(action: string): void {
    switch (action) {
      case 'startGame':
        this.handleStartGame();
        break;

      case 'mapSelection':
        this.handleMapSelection();
        break;

      case 'settings':
        this.handleSettings();
        break;

      case 'leaderboard':
        this.handleLeaderboard();
        break;

      case 'exit':
        this.handleExit();
        break;
    }
  }

  private handleStartGame(): void {
    console.log('[MainMenuScene] Starting game...');
    this.scene.start('MapSelectionScene');
  }

  private handleMapSelection(): void {
    console.log('[MainMenuScene] Opening map selection...');
    this.scene.start('MapSelectionScene');
  }

  private handleSettings(): void {
    console.log('[MainMenuScene] Opening settings...');
    this.showNotification('Settings panel coming soon!');
  }

  private handleLeaderboard(): void {
    console.log('[MainMenuScene] Opening leaderboard...');
    this.showNotification('Leaderboard coming soon!');
  }

  private handleExit(): void {
    console.log('[MainMenuScene] Exiting game');
    this.game.destroy(true);
  }

  private showNotification(message: string): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const notification = this.add.text(
      width / 2,
      height / 2,
      message,
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: '32px',
        color: '#FFD700',
        align: 'center',
        backgroundColor: '#1A1A1A',
        padding: { x: 20, y: 10 },
      }
    ).setOrigin(0.5);

    this.tweens.add({
      targets: notification,
      alpha: 0,
      duration: 2000,
      delay: 1000,
      onComplete: () => notification.destroy(),
    });
  }
}

/**
 * Menu Button Class
 */
class MenuButton extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private isSelected: boolean = false;
  private action: string;
  private scene: MainMenuScene;

  readonly VITYAZ_CRIMSON = 0xA01030;
  readonly VITYAZ_GOLD = 0xD4AF37;
  readonly MILITARY_GRAY = 0x4A5568;

  constructor(
    scene: MainMenuScene,
    x: number,
    y: number,
    text: string,
    action: string,
    selected: boolean = false
  ) {
    super(scene, x, y);
    this.action = action;
    this.scene = scene;
    this.isSelected = selected;

    // Create background
    this.background = scene.add.graphics();
    this.add(this.background);

    // Create label
    this.label = scene.add.text(0, 0, text, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#FFFFFF',
      align: 'center',
    }).setOrigin(0.5);
    this.add(this.label);

    // Setup interaction
    this.setInteractive(
      new Phaser.Geom.Rectangle(-100, -25, 200, 50),
      Phaser.Geom.Rectangle.Contains
    );

    scene.add.existing(this);
    this.draw();
  }

  private draw(): void {
    this.background.clear();

    if (this.isSelected) {
      // Selected state
      this.background.fillStyle(this.VITYAZ_CRIMSON, 0.3);
      this.background.fillRect(-100, -25, 200, 50);

      this.background.lineStyle(2, this.VITYAZ_GOLD, 1);
      this.background.strokeRect(-100, -25, 200, 50);

      // Glow effect
      this.background.lineStyle(1, this.VITYAZ_CRIMSON, 0.5);
      this.background.strokeRect(-105, -30, 210, 60);

      this.label.setColor('#FFD700');
    } else {
      // Normal state
      this.background.fillStyle(this.MILITARY_GRAY, 0.2);
      this.background.fillRect(-100, -25, 200, 50);

      this.background.lineStyle(1, this.MILITARY_GRAY, 0.8);
      this.background.strokeRect(-100, -25, 200, 50);

      this.label.setColor('#FFFFFF');
    }
  }

  select(): void {
    this.isSelected = true;
    this.draw();
  }

  deselect(): void {
    this.isSelected = false;
    this.draw();
  }

  activate(): void {
    this.scene.handleMenuAction(this.action);
  }
}
