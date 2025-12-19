import Phaser from "phaser"

export default class CompleteGameScene extends Phaser.Scene {
  private player: Phaser.Physics.Arcade.Sprite | null = null
  private enemies: Phaser.Physics.Arcade.Group | null = null
  private bullets: Phaser.Physics.Arcade.Group | null = null
  private playerHealth: number = 100
  private playerMaxHealth: number = 100
  private playerScore: number = 0
  private wave: number = 1
  private enemyCount: number = 0
  private gameActive: boolean = true
  private healthText: Phaser.GameObjects.Text | null = null
  private scoreText: Phaser.GameObjects.Text | null = null
  private waveText: Phaser.GameObjects.Text | null = null
  private keys: any = {}
  private mousePos: { x: number; y: number } = { x: 0, y: 0 }
  private lastShotTime: number = 0
  private shotCooldown: number = 200

  constructor() {
    super("CompleteGame")
  }

  preload(): void {
    // No assets to load - we create sprites procedurally
  }

  create(): void {
    this.physics.world.setBounds(0, 0, 800, 600)
    this.cameras.main.setBackgroundColor("#1a1a2e")

    this.createPlayer()
    this.createEnemyGroup()
    this.createBulletGroup()
    this.createUI()
    this.setupInput()
    this.spawnEnemies(3)
  }

  private createPlayer(): void {
    // Create player as green square
    const graphics = this.make.graphics({ x: 0, y: 0, add: false })
    graphics.fillStyle(0x00ff00, 1)
    graphics.fillRect(0, 0, 32, 32)
    graphics.generateTexture("playerTexture", 32, 32)
    graphics.destroy()

    this.player = this.physics.add.sprite(400, 300, "playerTexture")
    this.player.setBounce(0)
    this.player.setCollideWorldBounds(true)
    this.player.setMaxVelocity(300, 300)
  }

  private createEnemyGroup(): void {
    this.enemies = this.physics.add.group()
  }

  private createBulletGroup(): void {
    this.bullets = this.physics.add.group()
  }

  private createUI(): void {
    this.healthText = this.add.text(10, 10, `HP: ${this.playerHealth}/${this.playerMaxHealth}`, {
      font: "16px Arial",
      color: "#00ff00",
      fontFamily: "monospace"
    })
    this.healthText.setScrollFactor(0)

    this.scoreText = this.add.text(10, 35, `SCORE: ${this.playerScore}`, {
      font: "16px Arial",
      color: "#ffff00",
      fontFamily: "monospace"
    })
    this.scoreText.setScrollFactor(0)

    this.waveText = this.add.text(10, 60, `WAVE: ${this.wave}`, {
      font: "16px Arial",
      color: "#ff0000",
      fontFamily: "monospace"
    })
    this.waveText.setScrollFactor(0)
  }

  private setupInput(): void {
    this.keys = this.input.keyboard?.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE
    })

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      this.mousePos = { x: pointer.x, y: pointer.y }
    })

    this.input.on("pointerdown", () => this.shootBullet())
  }

  private spawnEnemies(count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const distance = 250
      const x = this.player!.x + Math.cos(angle) * distance
      const y = this.player!.y + Math.sin(angle) * distance

      // Create enemy as red square
      const graphics = this.make.graphics({ x: 0, y: 0, add: false })
      graphics.fillStyle(0xff0000, 1)
      graphics.fillRect(0, 0, 24, 24)
      graphics.generateTexture(`enemyTexture${Date.now()}_${i}`, 24, 24)
      graphics.destroy()

      const enemy = this.physics.add.sprite(x, y, `enemyTexture${Date.now()}_${i}`) as any
      enemy.setBounce(0.5)
      enemy.setCollideWorldBounds(true)
      enemy.health = 20
      enemy.maxHealth = 20
      enemy.speed = 100

      this.enemies?.add(enemy)
      this.enemyCount++
    }
  }

  update(time: number): void {
    if (!this.gameActive || !this.player) return

    // Player movement
    this.player.setVelocity(0, 0)
    const speed = 200

    if (this.keys.W?.isDown) this.player.setVelocityY(-speed)
    if (this.keys.S?.isDown) this.player.setVelocityY(speed)
    if (this.keys.A?.isDown) this.player.setVelocityX(-speed)
    if (this.keys.D?.isDown) this.player.setVelocityX(speed)

    // Player rotation towards mouse
    const targetX = this.mousePos.x || this.input.activePointer.x
    const targetY = this.mousePos.y || this.input.activePointer.y

    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      targetX,
      targetY
    )
    this.player.rotation = angle

    // Enemy AI
    if (this.enemies) {
      this.enemies.children.entries.forEach((enemy: any) => {
        if (!enemy.active) return

        const distance = Phaser.Math.Distance.Between(
          enemy.x, enemy.y,
          this.player!.x, this.player!.y
        )

        if (distance > 0) {
          const vx = ((this.player!.x - enemy.x) / distance) * enemy.speed
          const vy = ((this.player!.y - enemy.y) / distance) * enemy.speed
          enemy.setVelocity(vx, vy)

          enemy.rotation = Phaser.Math.Angle.Between(
            enemy.x, enemy.y,
            this.player!.x, this.player!.y
          )
        }
      })
    }

    // Clean up bullets that left screen
    if (this.bullets) {
      this.bullets.children.entries.forEach((bullet: any) => {
        if (bullet.x < 0 || bullet.x > 800 || bullet.y < 0 || bullet.y > 600) {
          bullet.destroy()
        }
      })
    }

    // Collision checks
    if (this.enemies && this.bullets && this.player) {
      this.physics.overlap(this.bullets, this.enemies, this.bulletHitEnemy, null, this)
      this.physics.overlap(this.player, this.enemies, this.enemyHitPlayer, null, this)
    }

    // Update UI
    if (this.healthText) this.healthText.setText(`HP: ${this.playerHealth}/${this.playerMaxHealth}`)
    if (this.scoreText) this.scoreText.setText(`SCORE: ${this.playerScore}`)
    if (this.waveText) this.waveText.setText(`WAVE: ${this.wave}`)
  }

  private shootBullet(): void {
    if (!this.gameActive || !this.player || !this.bullets) return

    const now = Date.now()
    if (now - this.lastShotTime < this.shotCooldown) return

    this.lastShotTime = now

    // Create bullet as yellow circle
    const graphics = this.make.graphics({ x: 0, y: 0, add: false })
    graphics.fillStyle(0xffff00, 1)
    graphics.fillCircle(4, 4, 4)
    graphics.generateTexture(`bulletTexture${now}`, 8, 8)
    graphics.destroy()

    const bullet = this.physics.add.sprite(this.player.x, this.player.y, `bulletTexture${now}`) as any

    const targetX = this.mousePos.x || this.input.activePointer.x
    const targetY = this.mousePos.y || this.input.activePointer.y

    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      targetX,
      targetY
    )

    const speed = 500
    bullet.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed)
    bullet.setData("damage", 20)
    this.bullets.add(bullet)
  }

  private bulletHitEnemy(bullet: any, enemy: any): void {
    if (!bullet.active || !enemy.active) return

    const damage = bullet.getData("damage") || 20
    bullet.destroy()
    enemy.health -= damage

    if (enemy.health <= 0) {
      enemy.destroy()
      this.enemyCount--
      this.playerScore += 100

      if (this.enemyCount === 0) {
        this.wave++
        const newEnemyCount = 3 + Math.floor(this.wave / 2)
        this.spawnEnemies(newEnemyCount)
      }
    }
  }

  private enemyHitPlayer(player: any, enemy: any): void {
    if (!enemy.active) return

    this.playerHealth -= 10

    if (this.playerHealth <= 0) {
      this.gameOver()
    }
  }

  private gameOver(): void {
    this.gameActive = false
    this.physics.pause()

    const gameOverText = this.add.text(400, 200, "GAME OVER", {
      fontSize: "60px",
      color: "#ff0000",
      fontFamily: "monospace"
    }).setOrigin(0.5)
    gameOverText.setScrollFactor(0)

    const scoreText = this.add.text(400, 300, `FINAL SCORE: ${this.playerScore}`, {
      fontSize: "32px",
      color: "#ffff00",
      fontFamily: "monospace"
    }).setOrigin(0.5)
    scoreText.setScrollFactor(0)

    const waveText = this.add.text(400, 360, `WAVES SURVIVED: ${this.wave}`, {
      fontSize: "24px",
      color: "#00ff00",
      fontFamily: "monospace"
    }).setOrigin(0.5)
    waveText.setScrollFactor(0)

    const restartText = this.add.text(400, 450, "Press F5 to restart", {
      fontSize: "20px",
      color: "#00ff00",
      fontFamily: "monospace"
    }).setOrigin(0.5)
    restartText.setScrollFactor(0)
  }
}
