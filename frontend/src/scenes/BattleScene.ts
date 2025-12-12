import Phaser from 'phaser'
import { CombatEngine } from '../services/combat.engine'
import { io, Socket } from 'socket.io-client'

interface Player {
  id: string
  x: number
  y: number
  angle: number
  health: number
  ammo: number
  weapon: string
  isAlive: boolean
}

export default class BattleScene extends Phaser.Scene {
  private combatEngine: CombatEngine
  private socket: Socket
  private players: Map<string, Phaser.Physics.Arcade.Sprite> = new Map()
  private bullets: Phaser.Physics.Arcade.Group
  private player: Phaser.Physics.Arcade.Sprite
  private playerData: Player = {
    id: 'local_player',
    x: 512,
    y: 400,
    angle: 0,
    health: 100,
    ammo: 30,
    weapon: 'AK-74M',
    isAlive: true,
  }
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys
  private hud: {
    health: Phaser.GameObjects.Text
    ammo: Phaser.GameObjects.Text
    kills: Phaser.GameObjects.Text
    score: Phaser.GameObjects.Text
  }
  private kills: number = 0
  private score: number = 0
  private lastShotTime: number = 0
  private fireRate: number = 100 // ms between shots

  constructor() {
    super({ key: 'BattleScene' })
    this.combatEngine = new CombatEngine()
  }

  preload() {
    // Load assets
    this.load.image('ground', 'assets/ground.png')
    this.load.image('bullet', 'assets/bullet.png')
    this.load.image('player', 'assets/player.png')
    this.load.image('enemy', 'assets/enemy.png')
  }

  create() {
    // Create world
    const graphics = this.make.graphics({ x: 0, y: 0, add: false })
    graphics.fillStyle(0x2a4a4a, 1)
    graphics.fillRect(0, 0, 1024, 768)
    graphics.generateTexture('battleground', 1024, 768)
    graphics.destroy()

    this.add.image(0, 0, 'battleground').setOrigin(0)

    // Create player
    this.player = this.physics.add.sprite(512, 400, null)
    this.player.setCollideWorldBounds(true)
    this.player.setBounce(0.2)
    this.player.setDisplaySize(32, 64)

    // Create bullets group
    this.bullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
    })

    // Create enemies
    this.createEnemies()

    // Setup controls
    this.cursors = this.input.keyboard.createCursorKeys()
    this.input.keyboard.on('keydown-SPACE', () => this.fire())
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.playerData.angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        pointer.x,
        pointer.y,
      )
    })

    // Setup HUD
    this.setupHUD()

    // Setup WebSocket
    this.setupWebSocket()

    // Physics
    this.physics.add.collider(
      this.player,
      this.bullets,
      undefined,
      undefined,
      this,
    )
  }

  private createEnemies() {
    for (let i = 0; i < 3; i++) {
      const x = Phaser.Math.Between(100, 900)
      const y = Phaser.Math.Between(100, 700)

      const enemy = this.physics.add.sprite(x, y, null)
      enemy.setDisplaySize(32, 64)
      enemy.setCollideWorldBounds(true)
      enemy.setBounce(0.2)

      const playerId = `enemy_${i}`
      this.players.set(playerId, enemy)
    }
  }

  private setupHUD() {
    this.hud = {
      health: this.add.text(16, 16, '', {
        fontSize: '20px',
        color: '#00ff00',
        fontFamily: 'monospace',
      }),
      ammo: this.add.text(16, 50, '', {
        fontSize: '20px',
        color: '#00ff00',
        fontFamily: 'monospace',
      }),
      kills: this.add.text(16, 84, '', {
        fontSize: '20px',
        color: '#ffaa00',
        fontFamily: 'monospace',
      }),
      score: this.add.text(512 - 100, 16, '', {
        fontSize: '24px',
        color: '#8B0000',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      }),
    }
  }

  private setupWebSocket() {
    const apiUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'
    this.socket = io(apiUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    this.socket.on('connect', () => {
      console.log('✅ Connected to battle server')
      this.socket.emit('battle:join', { playerId: this.playerData.id })
    })

    this.socket.on('battle:player_update', (data: Player) => {
      if (data.id !== this.playerData.id) {
        let sprite = this.players.get(data.id)
        if (!sprite) {
          sprite = this.physics.add.sprite(data.x, data.y, null)
          sprite.setDisplaySize(32, 64)
          this.players.set(data.id, sprite)
        }
        sprite.x = data.x
        sprite.y = data.y
        sprite.rotation = data.angle
      }
    })

    this.socket.on('battle:shot', (data: { x: number; y: number; angle: number }) => {
      this.createRemoteShot(data.x, data.y, data.angle)
    })

    this.socket.on('battle:hit', (data: { playerId: string; damage: number }) => {
      if (data.playerId === this.playerData.id) {
        this.playerData.health -= data.damage
        if (this.playerData.health <= 0) {
          this.playerData.isAlive = false
          this.scene.restart()
        }
      }
    })
  }

  private fire() {
    const now = this.time.now
    if (now - this.lastShotTime < this.fireRate || this.playerData.ammo <= 0) {
      return
    }

    this.lastShotTime = now
    this.playerData.ammo--

    // Create bullet
    const bullet = this.bullets.create(
      this.player.x,
      this.player.y,
      null,
    ) as Phaser.Physics.Arcade.Image

    // Calculate velocity
    const speed = 400
    const vx = Math.cos(this.playerData.angle) * speed
    const vy = Math.sin(this.playerData.angle) * speed

    bullet.setVelocity(vx, vy)
    bullet.setRotation(this.playerData.angle)
    bullet.setDisplaySize(4, 4)

    // Check for hits
    this.physics.overlap(bullet, Array.from(this.players.values()), (b, e) => {
      if (bullet && e) {
        const damage = this.combatEngine.calculateDamage(
          this.playerData.weapon,
          'close', // range
        )
        this.kills++
        this.score += damage

        bullet.destroy()
        e.destroy()

        // Notify server
        this.socket.emit('battle:shot', {
          x: this.player.x,
          y: this.player.y,
          angle: this.playerData.angle,
        })
      }
    })
  }

  private createRemoteShot(x: number, y: number, angle: number) {
    const bullet = this.bullets.create(x, y, null) as Phaser.Physics.Arcade.Image
    const speed = 400
    const vx = Math.cos(angle) * speed
    const vy = Math.sin(angle) * speed

    bullet.setVelocity(vx, vy)
    bullet.setRotation(angle)
    bullet.setDisplaySize(4, 4)
  }

  update() {
    if (!this.playerData.isAlive) return

    // Movement
    this.player.setVelocity(0, 0)

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200)
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200)
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-200)
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(200)
    }

    // Update player data
    this.playerData.x = this.player.x
    this.playerData.y = this.player.y

    // Send update to server
    this.socket.emit('battle:update', this.playerData)

    // Update HUD
    this.hud.health.setText(`HP: ${Math.max(0, this.playerData.health)}/100`)
    this.hud.ammo.setText(`AMMO: ${this.playerData.ammo}`)
    this.hud.kills.setText(`KILLS: ${this.kills}`)
    this.hud.score.setText(`${this.score}`)

    // Rotate player towards mouse
    this.player.rotation = this.playerData.angle
  }
}
