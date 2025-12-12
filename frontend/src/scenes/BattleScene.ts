import Phaser from 'phaser'

export default class BattleScene extends Phaser.Scene {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null
  private player: Phaser.Physics.Arcade.Sprite | null = null
  private health: number = 100
  private ammo: number = 30

  constructor() {
    super({ key: 'BattleScene' })
  }

  preload() {
    // Load game assets
  }

  create() {
    // Create game world
    const graphics = this.make.graphics({ x: 0, y: 0, add: false })
    graphics.fillStyle(0x2a2a4a, 1)
    graphics.fillRect(0, 0, 1024, 768)
    graphics.generateTexture('background', 1024, 768)
    graphics.destroy()

    this.add.image(0, 0, 'background').setOrigin(0)

    // Create player
    this.player = this.physics.add.sprite(512, 400, null)
    this.player.setCollideWorldBounds(true)
    this.player.setBounce(0.2)

    // Setup controls
    this.cursors = this.input.keyboard?.createCursorKeys()

    // HUD text
    this.add.text(16, 16, `HP: ${this.health}`, {
      fontSize: '20px',
      color: '#00FF00',
    })

    this.add.text(16, 50, `Ammo: ${this.ammo}`, {
      fontSize: '20px',
      color: '#00FF00',
    })

    this.add.text(512, 50, 'BATTLE SCENE', {
      fontSize: '24px',
      color: '#8B0000',
    }).setOrigin(0.5)
  }

  update() {
    if (!this.player || !this.cursors) return

    // Simple movement
    this.player.setVelocity(0, 0)

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160)
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160)
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-160)
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(160)
    }
  }
}
