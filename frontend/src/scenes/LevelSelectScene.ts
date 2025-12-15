import Phaser from 'phaser'
import { getProgressManager } from '../services/ProgressManager'

/**
 * Level configuration
 */
interface LevelConfig {
  id: string
  name: string
  difficulty: 'Easy' | 'Normal' | 'Hard' | 'Insane'
  difficultyLevel: number // 1-4
  description: string
  initialEnemies: number
  enemyWaveMultiplier: number // per wave increase
  enemyDamageMultiplier: number
  rewardMultiplier: number // score multiplier
  mapColor: string
}

/**
 * Level Select Scene - Map/Difficulty selection before gameplay
 * Shows available levels with difficulty, best scores, and descriptions
 */
export default class LevelSelectScene extends Phaser.Scene {
  private levels: LevelConfig[] = [
    {
      id: 'training',
      name: '🟢 ТРЕНИРОВКА',
      difficulty: 'Easy',
      difficultyLevel: 1,
      description: 'Идеально для новичков. Низкая сложность, много времени.',
      initialEnemies: 3,
      enemyWaveMultiplier: 1.3,
      enemyDamageMultiplier: 0.7,
      rewardMultiplier: 0.8,
      mapColor: '#4a9e4a',
    },
    {
      id: 'standard',
      name: '🟡 СТАНДАРТ',
      difficulty: 'Normal',
      difficultyLevel: 2,
      description: 'Сбалансированный уровень. Подходит для большинства игроков.',
      initialEnemies: 5,
      enemyWaveMultiplier: 1.5,
      enemyDamageMultiplier: 1.0,
      rewardMultiplier: 1.0,
      mapColor: '#4a7a9e',
    },
    {
      id: 'hardcore',
      name: '🔴 ЖЕСТКИЙ',
      difficulty: 'Hard',
      difficultyLevel: 3,
      description: 'Сложно. Враги наносят больше урона и их больше.',
      initialEnemies: 8,
      enemyWaveMultiplier: 1.7,
      enemyDamageMultiplier: 1.3,
      rewardMultiplier: 1.5,
      mapColor: '#9e6b4a',
    },
    {
      id: 'nightmare',
      name: '💀 КОШМАР',
      difficulty: 'Insane',
      difficultyLevel: 4,
      description: 'Только для профессионалов. Экстремальная сложность!',
      initialEnemies: 12,
      enemyWaveMultiplier: 2.0,
      enemyDamageMultiplier: 1.5,
      rewardMultiplier: 2.0,
      mapColor: '#9e4a4a',
    },
  ]

  private selectedLevel: LevelConfig | null = null
  private bestScores: Record<string, number> = {}

  constructor() {
    super({ key: 'LevelSelectScene' })
  }

  async create() {
    const width = this.game.config.width as number
    const height = this.game.config.height as number
    const centerX = width / 2
    const centerY = height / 2

    // Load best scores from progress manager
    const progressManager = getProgressManager()
    const playerStats = await progressManager.getPlayerStats()
    const recentSessions = await progressManager.getRecentSessions(20)

    // Calculate best score per level (placeholder for now)
    for (const level of this.levels) {
      this.bestScores[level.id] = playerStats.highScore
    }

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
      .text(centerX, 100, '🗺️ ВЫБОР БОЕВОЙ ЗОНЫ', {
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

    // ===== LEVEL CARDS =====
    const cardWidth = 280
    const cardHeight = 320
    const startX = centerX - (cardWidth + 30) * 1.5
    let cardX = startX

    for (let i = 0; i < this.levels.length; i++) {
      this.createLevelCard(
        cardX,
        centerY + 80,
        cardWidth,
        cardHeight,
        this.levels[i],
        this.bestScores[this.levels[i].id]
      )
      cardX += cardWidth + 30
    }

    // ===== SELECTED LEVEL DETAILS =====
    if (this.selectedLevel) {
      this.displayLevelDetails(centerX, height - 180, this.selectedLevel)
    }

    // ===== ACTION BUTTONS =====
    const buttonY = height - 80

    this.createActionButton(
      centerX - 200,
      buttonY,
      240,
      60,
      '▶️ НАЧАТЬ ОПЕРАЦИЮ',
      () => {
        if (this.selectedLevel) {
          this.cameras.main.fade(300, 0, 0, 0)
          this.time.delayedCall(300, () => {
            this.scene.start('CompleteGame', { level: this.selectedLevel })
          })
        }
      },
      '#4a7a4a',
      !this.selectedLevel // disabled if no level selected
    )

    this.createActionButton(
      centerX + 200,
      buttonY,
      240,
      60,
      '🏠 В МЕНЮ',
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
   * Create a level selection card
   */
  private createLevelCard(
    x: number,
    y: number,
    width: number,
    height: number,
    level: LevelConfig,
    bestScore: number
  ): void {
    const container = this.add.container(x, y).setAlpha(0)

    // Background
    const bg = this.add.graphics()
    const colorInt = parseInt(level.mapColor.replace('#', '0x'), 16)

    bg.fillStyle(0x2d4a2e, 0.8)
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8)
    bg.lineStyle(3, colorInt, 1)
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8)

    // Level name
    const nameText = this.add.text(-width / 2 + 15, -height / 2 + 25, level.name, {
      fontSize: '20px',
      color: level.mapColor,
      fontStyle: 'bold',
      fontFamily: 'Arial Black, sans-serif',
    }).setOrigin(0, 0.5)

    // Difficulty badge
    const difficultyText = this.add.text(
      width / 2 - 15,
      -height / 2 + 25,
      level.difficulty.toUpperCase(),
      {
        fontSize: '12px',
        color: '#000000',
        backgroundColor: level.mapColor,
        padding: { x: 8, y: 4 },
        fontStyle: 'bold',
        fontFamily: 'Arial, sans-serif',
      }
    ).setOrigin(1, 0.5)

    // Description
    const descText = this.add.text(
      -width / 2 + 15,
      -height / 2 + 70,
      level.description,
      {
        fontSize: '12px',
        color: '#b8a885',
        wordWrap: { width: width - 30 },
        fontFamily: 'Arial, sans-serif',
      }
    ).setOrigin(0, 0)

    // Stats
    const statsY = -height / 2 + 155
    const statColor = '#9eb89e'

    this.add.text(-width / 2 + 15, statsY, '👥 Враги:', {
      fontSize: '11px',
      color: statColor,
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0, 0.5)

    this.add.text(-width / 2 + 15, statsY + 20, `• Начало: ${level.initialEnemies}`, {
      fontSize: '11px',
      color: '#8b7d6b',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0, 0.5)

    this.add.text(-width / 2 + 15, statsY + 35, `• Волна: x${level.enemyWaveMultiplier.toFixed(1)}`, {
      fontSize: '11px',
      color: '#8b7d6b',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0, 0.5)

    // Rewards
    this.add.text(-width / 2 + 15, statsY + 60, `💰 Награда: x${level.rewardMultiplier.toFixed(1)}`, {
      fontSize: '11px',
      color: '#ffd700',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5)

    // Best score
    this.add.text(
      -width / 2 + 15,
      height / 2 - 25,
      `🏆 Best: ${bestScore}`,
      {
        fontSize: '13px',
        color: '#d4af37',
        fontStyle: 'bold',
        fontFamily: 'Arial, sans-serif',
      }
    ).setOrigin(0, 0.5)

    container.add([bg, nameText, difficultyText, descText])
    container.setSize(width, height)
    container.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    )

    // Selection handler
    container.on('pointerover', () => {
      bg.clear()
      bg.fillStyle(0x3d5a3d, 1)
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8)
      bg.lineStyle(4, colorInt, 1)
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8)
      container.setScale(1.05)
    })

    container.on('pointerout', () => {
      if (this.selectedLevel?.id !== level.id) {
        bg.clear()
        bg.fillStyle(0x2d4a2e, 0.8)
        bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8)
        bg.lineStyle(3, colorInt, 1)
        bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8)
        container.setScale(1)
      }
    })

    container.on('pointerdown', () => {
      this.selectedLevel = level
      // Update all cards visual state
      this.updateLevelSelection()
    })
  }

  /**
   * Display selected level details
   */
  private displayLevelDetails(
    x: number,
    y: number,
    level: LevelConfig
  ): void {
    const width = 500
    const height = 100

    const bg = this.add.graphics().setAlpha(0)
    bg.fillStyle(0x2d4a2e, 0.6)
    bg.fillRoundedRect(x - width / 2, y - height / 2, width, height, 8)
    bg.lineStyle(2, 0xd4af37, 1)
    bg.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 8)

    const titleText = this.add.text(x - width / 2 + 15, y - 35, `Выбрана: ${level.name}`, {
      fontSize: '18px',
      color: '#d4af37',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0, 0.5).setAlpha(0)

    const detailsText = this.add.text(
      x - width / 2 + 15,
      y + 10,
      `Сложность: ${level.difficulty} | Враги: x${level.enemyWaveMultiplier} | Урон: x${level.enemyDamageMultiplier} | Награда: x${level.rewardMultiplier}`,
      {
        fontSize: '13px',
        color: '#9eb89e',
        fontFamily: 'Arial, sans-serif',
      }
    ).setOrigin(0, 0.5).setAlpha(0)
  }

  /**
   * Update level selection state
   */
  private updateLevelSelection(): void {
    // This would update visual states of cards
    // Refresh the scene to show updated selection
    this.scene.restart()
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
    color: string,
    disabled: boolean = false
  ): void {
    const container = this.add.container(x, y).setAlpha(0)

    const bg = this.add.graphics()
    const colorInt = parseInt(color.replace('#', '0x'), 16)

    bg.fillStyle(colorInt, disabled ? 0.5 : 1)
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8)
    bg.lineStyle(2, 0xd4af37, 1)
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8)

    const text = this.add.text(0, 0, label, {
      fontSize: '18px',
      fontStyle: 'bold',
      color: disabled ? '#666666' : '#ffffff',
      fontFamily: 'Arial Black, sans-serif',
    }).setOrigin(0.5, 0.5)

    container.add([bg, text])
    container.setSize(width, height)
    container.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    )

    if (!disabled) {
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
