import Phaser from 'phaser'

/**
 * Main Menu Scene - Professional military-themed main menu
 * Features:
 * - VITYAZ logo with military aesthetic
 * - Play, Settings, Exit buttons
 * - Krapoovy (khaki/brown) color scheme for Spetsnaz unit
 * - Russian/English support
 */
export default class MainMenuScene extends Phaser.Scene {
  private isHovering = {
    play: false,
    settings: false,
    exit: false,
  }

  constructor() {
    super({ key: 'MainMenuScene' })
  }

  preload() {
    // Load any assets if needed
  }

  create() {
    const centerX = this.game.config.width as number / 2
    const centerY = this.game.config.height as number / 2

    // Background - dark military theme
    this.add
      .rectangle(centerX, centerY, this.game.config.width as number, this.game.config.height as number, 0x0f0f1e)
      .setOrigin(0.5, 0.5)

    // Top accent bar - krapoovy color (khaki/brown)
    this.add
      .rectangle(centerX, 40, this.game.config.width as number, 80, 0x6b5d4f) // Krapoovy color
      .setOrigin(0.5, 0.5)

    // VITYAZ Main Title
    const titleText = this.add
      .text(centerX, 100, '🥊 VITYAZ', {
        fontSize: '96px',
        fontStyle: 'bold',
        color: '#e8d4b0', // Light khaki text
      })
      .setOrigin(0.5, 0.5)

    // Subtitle
    this.add
      .text(centerX, 180, 'SPECIAL OPERATIONS', {
        fontSize: '32px',
        color: '#b8a885', // Medium khaki
        fontStyle: 'bold',
        letterSpacing: 2,
      })
      .setOrigin(0.5, 0.5)

    // Unit motto/tagline
    this.add
      .text(centerX, 230, '«Если не я, то кто? Если не сейчас, то когда?»', {
        fontSize: '16px',
        color: '#8b7d6b', // Darker khaki
        fontStyle: 'italic',
      })
      .setOrigin(0.5, 0.5)

    // Version badge
    this.add
      .text(centerX, centerY - 180, 'v0.1.0 ALPHA', {
        fontSize: '14px',
        color: '#6b5d4f',
      })
      .setOrigin(0.5, 0.5)

    // ===== BUTTONS SECTION =====
    const buttonWidth = 240
    const buttonHeight = 60
    const buttonSpacing = 90
    const startY = centerY + 30

    // PLAY Button
    const playButton = this.createButton(
      centerX,
      startY,
      buttonWidth,
      buttonHeight,
      'PLAY',
      () => {
        // Fade out and transition to game
        this.cameras.main.fade(300, 0, 0, 0)
        this.time.delayedCall(300, () => {
          this.scene.start('CompleteGame')
        })
      },
      'play'
    )

    // SETTINGS Button
    const settingsButton = this.createButton(
      centerX,
      startY + buttonSpacing,
      buttonWidth,
      buttonHeight,
      'SETTINGS',
      () => {
        // For now, just show a message
        console.log('Settings scene coming soon')
        // Later: this.scene.start('SettingsScene')
      },
      'settings'
    )

    // EXIT Button
    const exitButton = this.createButton(
      centerX,
      startY + buttonSpacing * 2,
      buttonWidth,
      buttonHeight,
      'EXIT',
      () => {
        window.location.href = '/'
      },
      'exit'
    )

    // Bottom decoration line
    this.add
      .line(centerX - 200, centerY + 280, 0, 0, 400, 0, 0x6b5d4f)
      .setOrigin(0, 0)

    // Footer text
    this.add
      .text(centerX, (this.game.config.height as number) - 30, '© 2025 VITYAZ Project | Powered by Phaser', {
        fontSize: '12px',
        color: '#4a4238',
      })
      .setOrigin(0.5, 0.5)
  }

  /**
   * Create a styled button with hover effects
   */
  private createButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    callback: () => void,
    key: 'play' | 'settings' | 'exit'
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y)

    // Button background
    const bg = this.add
      .rectangle(0, 0, width, height, 0x6b5d4f) // Krapoovy background
      .setStrokeStyle(2, 0xe8d4b0) // Light khaki border

    // Button text
    const text = this.add
      .text(0, 0, label, {
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5, 0.5)

    container.add([bg, text])
    container.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains)

    // Hover effects
    container.on('pointerover', () => {
      this.isHovering[key] = true
      bg.setFillStyle(0x8b7d6b) // Lighter khaki on hover
      bg.setStrokeStyle(3, 0xffffff) // Brighter border
      text.setColor('#ffd700') // Gold text
      container.setScale(1.05)
    })

    container.on('pointerout', () => {
      this.isHovering[key] = false
      bg.setFillStyle(0x6b5d4f) // Back to normal
      bg.setStrokeStyle(2, 0xe8d4b0)
      text.setColor('#ffffff')
      container.setScale(1)
    })

    // Click handler
    container.on('pointerdown', () => {
      // Click animation
      container.setScale(0.95)
      this.time.delayedCall(100, () => {
        container.setScale(1.05)
        callback()
      })
    })

    return container
  }

  update() {
    // Can add animations here later
  }
}
