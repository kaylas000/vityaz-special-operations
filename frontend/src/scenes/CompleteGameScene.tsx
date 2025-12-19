import Phaser from "phaser"

export default class CompleteGameScene extends Phaser.Scene {
  private player: Phaser.Physics.Arcade.Sprite | null = null
  private enemies: Phaser.Physics.Arcade.Group | null = null
  private bullets: Phaser.Physics.Arcade.Group | null = null
  private playerHealth: number = 100
  private playerScore: number = 0
  private wave: number = 1
  private enemyCount: number = 0
  private gameActive: boolean = true
  private healthText: Phaser.GameObjects.Text | null = null
  private scoreText: Phaser.GameObjects.Text | null = null
  private waveText: Phaser.GameObjects.Text | null = null
  private keys: any = {}
  private mousePos: { x: number; y: number } = { x: 0, y: 0 }

  constructor() {
    super("CompleteGame")
  }

  preload(): void {
    this.load.image("player", "./assets/sprites/player.png")
    this.load.image("enemy_basic", "./assets/sprites/enemy_basic.png")
    this.load.image("enemy_tank", "./assets/sprites/enemy_tank.png")
  }

  create(): void {
    this.physics.world.setBounds(0, 0, 800, 600)
    this.cameras.main.setBackgroundColor("#222222")

    this.createPlayer()
    this.createEnemyGroup()
    this.createBulletGroup()
    this.createUI()
    this.setupInput()
    this.spawnEnemies(3)
  }

  private createPlayer(): void {
    this.player = this.physics.add.sprite(400, 300, "player")
    this.player.setBounce(0)
    this.player.setCollideWorldBounds(true)
    this.player.setScale(0.05)
  }

  private createEnemyGroup(): void {
    this.enemies = this.physics.add.group()
  }

  private createBulletGroup(): void {
    this.bullets = this.physics.add.group()
  }

  private createUI(): void {
    this.healthText = this.add.text(10, 10, `HP: ${this.playerHealth}`, {
      font: "20px Arial",
      color: "#00ff00",
      fontFamily: "monospace"
    })
    this.healthText.setScrollFactor(0)

    this.scoreText = this.add.text(10, 40, `SCORE: ${this.playerScore}`, {
      font: "20px Arial",
      color: "#00ff00",
      fontFamily: "monospace"
    })
    this.scoreText.setScrollFactor(0)

    this.waveText = this.add.text(10, 70, `WAVE: ${this.wave}`, {
      font: "20px Arial",
      color: "#00ff00",
      fontFamily: "monospace"
    })
    this.waveText.setScrollFactor(0)
  }

  private setupInput(): void {
    this.keys = this.input.keyboard?.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D
    })

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      this.mousePos = { x: pointer.x, y: pointer.y }
    })

    this.input.on("pointerdown", () => this.shootBullet())
  }

  private spawnEnemies(count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const distance = 200
      const x = this.player!.x + Math.cos(angle) * distance
      const y = this.player!.y + Math.sin(angle) * distance

      const enemy = this.physics.add.sprite(x, y, "enemy_basic") as any
      enemy.setBounce(0.8)
      enemy.setCollideWorldBounds(true)
      enemy.health = 20
      enemy.speed = 150

      this.enemies?.add(enemy)
      this.enemyCount++
    }
  }

  update(): void {
    if (!this.gameActive || !this.player) return

    this.player.setVelocity(0, 0)
    const speed = 200
    if (this.keys.W?.isDown) this.player.setVelocityY(-speed)
    if (this.keys.S?.isDown) this.player.setVelocityY(speed)
    if (this.keys.A?.isDown) this.player.setVelocityX(-speed)
    if (this.keys.D?.isDown) this.player.setVelocityX(speed)

    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      this.mousePos.x || this.input.activePointer.x,
      this.mousePos.y || this.input.activePointer.y
    )
    this.player.rotation = angle

    this.enemies?.children.forEach((enemy: any) => {
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

    this.bullets?.children.forEach((bullet: any) => {
      if (bullet.x < 0 || bullet.x > 800 || bullet.y < 0 || bullet.y > 600) {
        bullet.destroy()
      }
    })

    this.physics.overlap(this.bullets, this.enemies, this.bulletHitEnemy, null, this)
    this.physics.overlap(this.player, this.enemies, this.enemyHitPlayer, null, this)

    if (this.healthText) this.healthText.setText(`HP: ${this.playerHealth}`)
    if (this.scoreText) this.scoreText.setText(`SCORE: ${this.playerScore}`)
    if (this.waveText) this.waveText.setText(`WAVE: ${this.wave}`)
  }

  private shootBullet(): void {
    if (!this.gameActive || !this.player || !this.bullets) return

    const bullet = this.physics.add.sprite(this.player.x, this.player.y, "enemy_basic")
    bullet.setTint(0xffff00)
    bullet.setScale(0.02)

    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      this.mousePos.x || this.input.activePointer.x,
      this.mousePos.y || this.input.activePointer.y
    )

    const speed = 600
    bullet.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed)
    this.bullets.add(bullet)
  }

  private bulletHitEnemy(bullet: any, enemy: any): void {
    bullet.destroy()
    enemy.health -= 20

    if (enemy.health <= 0) {
      enemy.destroy()
      this.enemyCount--
      this.playerScore += 100

      if (this.enemyCount === 0) {
        this.wave++
        this.spawnEnemies(3 + Math.floor(this.wave / 2))
      }
    }
  }

  private enemyHitPlayer(player: any, enemy: any): void {
    this.playerHealth -= 10

    if (this.playerHealth <= 0) {
      this.gameOver()
    }
  }

  private gameOver(): void {
    this.gameActive = false
    this.physics.pause()

    const gameOverText = this.add.text(400, 300, "GAME OVER", {
      fontSize: "60px",
      color: "#ff0000",
      fontFamily: "monospace"
    }).setOrigin(0.5)

    const scoreText = this.add.text(400, 380, `FINAL SCORE: ${this.playerScore}`, {
      fontSize: "30px",
      color: "#ffff00",
      fontFamily: "monospace"
    }).setOrigin(0.5)

    const restartText = this.add.text(400, 450, "Refresh page to restart", {
      fontSize: "20px",
      color: "#00ff00",
      fontFamily: "monospace"
    }).setOrigin(0.5)
  }
}
