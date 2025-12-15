import Phaser from 'phaser'
import {
  getProgressManager,
  GameSession,
  Achievement,
} from '../services/ProgressManager'

/**
 * Stats Scene - Post-game statistics and achievements display
 * Shows: Score, kills, weapons used, wave progression, achievements
 */
export default class StatsScene extends Phaser.Scene {
  private session: GameSession | null = null
  private scrollOffset = 0
  private scrollSpeed = 0

  constructor() {
    super({ key: 'StatsScene' })
  }

  init(data: { session?: GameSession }) {
    this.session = data?.session || null
  }

  async create() {
    const width = this.game.config.width as number
    const height = this.game.config.height as number
    const centerX = width / 2
    const centerY = height / 2

    // ===== BACKGROUND =====
    const bg = this.add
      .rectangle(centerX, centerY, width, height, 0x0d1117)
      .setOrigin(0.5, 0.5)
      .setAlpha(0)

    this.createCamouflagePattern(width, height)

    // ===== HEADER =====
    const headerBg = this.add
      .rectangle(centerX, 60, width, 120, 0x2d4a2e)
      .setOrigin(0.5, 0.5)
      .setAlpha(0)

    const titleText = this.add
      .text(centerX, 100, '🎖️ МИССИЯ ОКОНЧЕНА', {
        fontSize: '64px',
        fontStyle: 'bold',
        color: '#d4af37',
        fontFamily: 'Impact, Arial Black, sans-serif',
        stroke: '#1a1a1a',
        strokeThickness: 4,
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0)
      .setShadow(3, 3, '#000000', 6, true, true)

    // ===== STATS DISPLAY =====
    let statsY = 200

    // Score box
    this.createStatBox(
      centerX - 250,
      statsY,
      'СЧЁТ',
      this.session?.score.toString() || '0',
      '#ffd700'
    )

    // Kills box
    this.createStatBox(
      centerX + 50,
      statsY,
      'УБИЙСТВА',
      this.session?.kills.toString() || '0',
      '#ff6b6b'
    )

    // Wave box
    this.createStatBox(
      centerX + 350,
      statsY,
      'ВОЛНА',
      this.session?.maxWave.toString() || '1',
      '#4a9eff'
    )

    statsY += 120

    // Duration box
    const durationSeconds = this.session?.duration || 0
    const minutes = Math.floor(durationSeconds / 60)
    const seconds = durationSeconds % 60
    const durationStr = `${minutes}m ${seconds}s`

    this.createStatBox(
      centerX - 250,
      statsY,
      'ВРЕМЯ',
      durationStr,
      '#9eb89e'
    )

    // Accuracy box
    const accuracy = this.calculateAverageAccuracy()
    this.createStatBox(
      centerX + 50,
      statsY,
      'ТОЧНОСТЬ',
      `${accuracy}%`,
      '#a8d5a8'
    )

    // K/D Ratio
    const deaths = this.session?.deaths || 1
    const ratio = deaths > 0 ? (this.session?.kills || 0) / deaths : 0
    this.createStatBox(
      centerX + 350,
      statsY,
      'K/D',
      ratio.toFixed(2),
      '#ff9999'
    )

    statsY += 120

    // ===== WEAPON STATS =====
    this.add
      .text(centerX - 380, statsY, '🔫 ОРУЖИЕ', {
        fontSize: '22px',
        color: '#9eb89e',
        fontStyle: 'bold',
        fontFamily: 'Arial, sans-serif',
      })
      .setOrigin(0, 0.5)
      .setAlpha(0)

    statsY += 40

    if (this.session?.weaponStats) {
      for (const [weapon, stat] of Object.entries(this.session.weaponStats)) {
        if (stat.kills > 0) {
          this.createWeaponStatRow(centerX - 350, statsY, weapon, stat)
          statsY += 45
        }
      }
    }

    statsY += 20

    // ===== ACHIEVEMENTS =====
    const progressManager = getProgressManager()
    const unlockedAchievements = progressManager.getUnlockedAchievements()

    this.add
      .text(centerX - 380, statsY, '⭐ ДОСТИЖЕНИЯ', {
        fontSize: '22px',
        color: '#ffd700',
        fontStyle: 'bold',
        fontFamily: 'Arial, sans-serif',
      })
      .setOrigin(0, 0.5)
      .setAlpha(0)

    statsY += 40

    if (unlockedAchievements.length > 0) {
      const recentAchievements = unlockedAchievements.slice(-3)
      for (const achievement of recentAchievements) {
        this.createAchievementRow(
          centerX - 350,
          statsY,
          achievement
        )
        statsY += 50
      }

      if (unlockedAchievements.length > 3) {
        this.add
          .text(
            centerX - 350,
            statsY,
            `...и ещё ${unlockedAchievements.length - 3}`,
            {
              fontSize: '14px',
              color: '#8b7d6b',
              fontFamily: 'Arial, sans-serif',
            }
          )
          .setOrigin(0, 0.5)
          .setAlpha(0)
      }
    } else {
      this.add
        .text(centerX - 350, statsY, 'Достижений не разблокировано', {
          fontSize: '16px',
          color: '#8b7d6b',
          fontStyle: 'italic',
          fontFamily: 'Arial, sans-serif',
        })
        .setOrigin(0, 0.5)
        .setAlpha(0)
    }

    // ===== ACTION BUTTONS =====
    const buttonY = height - 80

    this.createActionButton(
      centerX - 200,
      buttonY,
      240,
      60,
      '▶️ ИГРАТЬ СНОВА',
      () => {
        this.cameras.main.fade(300, 0, 0, 0)
        this.time.delayedCall(300, () => {
          this.scene.start('CompleteGame')
        })
      },
      '#4a7a4a'
    )

    this.createActionButton(
      centerX + 200,
      buttonY,
      240,
      60,
      '🏠 МЕНЮ',
      () => {
        this.cameras.main.fade(300, 0, 0, 0)
        this.time.delayedCall(300, () => {
          this.scene.start('MainMenuScene')
        })
      },
      '#4a4a7a'
    )

    // ===== ANIMATIONS =====
    this.tweens.add({
      targets: [bg, headerBg],
      alpha: 1,
      duration: 500,
      ease: 'Power2',
    })

    this.tweens.add({
      targets: titleText,
      alpha: 1,
      duration: 600,
      delay: 200,
      ease: 'Back.easeOut',
    })

    this.tweens.add({
      targets: this.children.list.filter(
        (obj) => obj instanceof Phaser.GameObjects.Text && obj !== titleText
      ),
      alpha: 1,
      duration: 400,
      delay: 400,
      ease: 'Power2',
    })
  }

  /**
   * Create a statistic display box
   */
  private createStatBox(
    x: number,
    y: number,
    label: string,
    value: string,
    color: string
  ): void {
    const boxWidth = 160
    const boxHeight = 90

    const bg = this.add.graphics().setAlpha(0)
    const colorInt = parseInt(color.replace('#', '0x'), 16)

    bg.fillStyle(0x2d4a2e, 0.8)
    bg.fillRoundedRect(x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight, 6)
    bg.lineStyle(2, colorInt, 1)
    bg.strokeRoundedRect(x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight, 6)

    this.add
      .text(x, y - 20, label, {
        fontSize: '13px',
        color: '#8b7d6b',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0)

    this.add
      .text(x, y + 15, value, {
        fontSize: '32px',
        color: color,
        fontFamily: 'Arial Black, sans-serif',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0)
  }

  /**
   * Create weapon statistics row
   */
  private createWeaponStatRow(x: number, y: number, weapon: string, stat: any): void {
    const container = this.add.container(x, y).setAlpha(0)

    // Weapon name
    const nameText = this.add.text(-200, 0, weapon.toUpperCase(), {
      fontSize: '14px',
      color: '#e8f0e8',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5)

    // Kills
    const killsText = this.add.text(-80, 0, `🎯 ${stat.kills}`, {
      fontSize: '13px',
      color: '#ff9999',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0, 0.5)

    // Accuracy
    const accuracyText = this.add.text(30, 0, `${stat.accuracy}%`, {
      fontSize: '13px',
      color: '#a8d5a8',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0, 0.5)

    // Damage
    const damageText = this.add.text(100, 0, `DMG: ${stat.damage}`, {
      fontSize: '13px',
      color: '#ffd700',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0, 0.5)

    container.add([nameText, killsText, accuracyText, damageText])
  }

  /**
   * Create achievement row
   */
  private createAchievementRow(
    x: number,
    y: number,
    achievement: Achievement
  ): void {
    const container = this.add.container(x, y).setAlpha(0)

    // Background
    const bg = this.add.graphics()
    bg.fillStyle(0x3d5a3d, 0.5)
    bg.fillRoundedRect(-10, -20, 350, 40, 4)
    bg.lineStyle(1, 0x5a7a5a, 1)
    bg.strokeRoundedRect(-10, -20, 350, 40, 4)

    // Achievement name
    const nameText = this.add.text(0, -8, achievement.name, {
      fontSize: '14px',
      color: '#d4af37',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5)

    // Description
    const descText = this.add.text(0, 8, achievement.description, {
      fontSize: '12px',
      color: '#9eb89e',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0, 0.5)

    // Points
    const pointsText = this.add.text(330, 0, `+${achievement.points}`, {
      fontSize: '14px',
      color: '#ffd700',
      fontFamily: 'Arial Black, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(1, 0.5)

    container.add([bg, nameText, descText, pointsText])
  }

  /**
   * Create action button
   */
  private createActionButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    callback: () => void,
    color: string
  ): void {
    const container = this.add.container(x, y).setAlpha(0)

    const bg = this.add.graphics()
    const colorInt = parseInt(color.replace('#', '0x'), 16)

    bg.fillStyle(colorInt, 1)
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8)
    bg.lineStyle(2, 0xd4af37, 1)
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8)

    const text = this.add.text(0, 0, label, {
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff',
      fontFamily: 'Arial Black, sans-serif',
    }).setOrigin(0.5, 0.5)

    container.add([bg, text])
    container.setSize(width, height)
    container.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    )

    container.on('pointerover', () => {
      bg.clear()
      bg.fillStyle(colorInt, 0.8)
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8)
      bg.lineStyle(3, 0xffffff, 1)
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8)
      text.setColor('#ffd700')
      container.setScale(1.05)
    })

    container.on('pointerout', () => {
      bg.clear()
      bg.fillStyle(colorInt, 1)
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8)
      bg.lineStyle(2, 0xd4af37, 1)
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8)
      text.setColor('#ffffff')
      container.setScale(1)
    })

    container.on('pointerdown', () => {
      container.setScale(0.95)
      this.time.delayedCall(150, () => {
        container.setScale(1.05)
        callback()
      })
    })
  }

  /**
   * Calculate average accuracy from all weapons
   */
  private calculateAverageAccuracy(): number {
    if (!this.session?.weaponStats) return 0

    const accuracies = Object.values(this.session.weaponStats)
      .filter((w) => w.kills > 0)
      .map((w) => w.accuracy)

    if (accuracies.length === 0) return 0
    const sum = accuracies.reduce((a, b) => a + b, 0)
    return Math.round(sum / accuracies.length)
  }

  /**
   * Create camouflage pattern
   */
  private createCamouflagePattern(width: number, height: number): void {
    const pattern = this.add.graphics().setAlpha(0.15)
    const colors = [0x3a4d3a, 0x2d3d2d, 0x4a5a4a, 0x1a2a1a]

    for (let i = 0; i < 25; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const radius = 40 + Math.random() * 80
      const color = colors[Math.floor(Math.random() * colors.length)]

      pattern.fillStyle(color, 1)
      pattern.fillEllipse(x, y, radius, radius * 0.7)
    }
  }

  update() {
    // Placeholder for future updates
  }
}
