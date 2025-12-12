import Phaser from 'phaser'

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' })
  }

  preload() {
    // Load assets here
  }

  create() {
    // Add background
    this.add.rectangle(512, 384, 1024, 768, 0x1a1a2e)

    // Title
    this.add.text(512, 150, '🥊 VITYAZ', {
      fontSize: '64px',
      color: '#8B0000',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    this.add.text(512, 220, 'Special Operations', {
      fontSize: '32px',
      color: '#FFFFFF',
    }).setOrigin(0.5)

    // Start button
    const startBtn = this.add.rectangle(512, 400, 200, 60, 0x8B0000)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.start('BattleScene')
      })

    this.add.text(512, 400, 'START GAME', {
      fontSize: '24px',
      color: '#FFFFFF',
    }).setOrigin(0.5)

    // Tagline
    this.add.text(512, 650, '"If not me, then who? If not now, then when?"', {
      fontSize: '16px',
      color: '#C0C0C0',
      style: 'italic',
    }).setOrigin(0.5)
  }

  update() {
    // Update logic here
  }
}
