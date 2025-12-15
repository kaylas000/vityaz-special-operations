import Phaser from 'phaser'

/**
 * Generate player sprite with Krapoovy beret (Vityaz special forces unit)
 * Krapoovy beret is maroon-brown color (#8B4513) positioned on LEFT side
 */
export class PlayerSpriteGenerator {
  /**
   * Create a high-quality player sprite with military gear
   * @param scene Phaser scene
   * @param width Sprite width
   * @param height Sprite height
   * @returns Texture key for the sprite
   */
  static generatePlayerSprite(
    scene: Phaser.Scene,
    width: number = 48,
    height: number = 48
  ): string {
    const textureKey = 'playerSprite'

    // Check if texture already exists
    if (scene.textures.exists(textureKey)) {
      return textureKey
    }

    // Create graphics object
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false })

    // ===== BODY (Military Uniform - Dark Green) =====
    // Main torso
    graphics.fillStyle(0x2d5a2d, 1) // Dark military green
    graphics.fillRectShape(new Phaser.Geom.Rectangle(10, 16, 28, 20))

    // Arms
    graphics.fillStyle(0x1a3d1a, 1) // Darker green for sleeves
    graphics.fillRect(8, 18, 4, 14) // Left arm
    graphics.fillRect(36, 18, 4, 14) // Right arm

    // Tactical vest straps
    graphics.lineStyle(1, 0x5a7a5a, 1)
    graphics.strokeRect(10, 16, 28, 20)
    graphics.lineBetween(24, 16, 24, 36) // Center strap

    // ===== LEGS (Dark Pants) =====
    graphics.fillStyle(0x1a1a1a, 1) // Black tactical pants
    graphics.fillRect(12, 36, 10, 8) // Left leg
    graphics.fillRect(26, 36, 10, 8) // Right leg

    // ===== HEAD (Skin tone) =====
    graphics.fillStyle(0xd9a97a, 1) // Military tan skin tone
    graphics.fillCircle(24, 12, 5) // Head circle

    // ===== KRAPOOVY BERET (Maroon-Brown on LEFT side) =====
    // This is the signature of Vityaz special forces
    // Positioned on LEFT side (tilted left)
    graphics.fillStyle(0x8b4513, 1) // Krapoovy maroon-brown

    // Main beret shape - ellipse tilted LEFT
    // Center at x=18 (left side), y=9 (above head)
    graphics.save()

    // Draw beret as ellipse
    const beret_cx = 18 // Left side
    const beret_cy = 8 // Top of head
    const beret_rx = 8 // Horizontal radius
    const beret_ry = 6 // Vertical radius

    // Draw beret ellipse using arc approximation
    graphics.beginPath()
    for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
      const x = beret_cx + Math.cos(angle) * beret_rx
      const y = beret_cy + Math.sin(angle) * beret_ry
      if (angle === 0) {
        graphics.moveTo(x, y)
      } else {
        graphics.lineTo(x, y)
      }
    }
    graphics.closePath()
    graphics.fillPath()

    // Beret outline
    graphics.lineStyle(1, 0x5a2d0c, 1) // Dark brown outline
    graphics.beginPath()
    for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
      const x = beret_cx + Math.cos(angle) * beret_rx
      const y = beret_cy + Math.sin(angle) * beret_ry
      if (angle === 0) {
        graphics.moveTo(x, y)
      } else {
        graphics.lineTo(x, y)
      }
    }
    graphics.closePath()
    graphics.strokePath()

    graphics.restore()

    // ===== BERET BADGE (Gold Star) =====
    // Vityaz emblem - gold star on beret
    graphics.fillStyle(0xffd700, 1) // Gold color
    this.drawStar(graphics, beret_cx, beret_cy - 1, 5, 2.5, 1.2)

    // ===== EYES (Combat Alert) =====
    graphics.fillStyle(0x000000, 1) // Black pupils
    graphics.fillCircle(21, 10, 1.5) // Left eye
    graphics.fillCircle(27, 10, 1.5) // Right eye

    // Eye whites
    graphics.fillStyle(0xffffff, 1)
    graphics.fillCircle(21, 10, 0.8)
    graphics.fillCircle(27, 10, 0.8)

    // ===== WEAPON (Rifle outline) =====
    graphics.lineStyle(2, 0x4a4a4a, 1) // Gray weapon
    graphics.lineBetween(6, 24, 6, 32) // Rifle barrel pointing left
    graphics.lineBetween(6, 28, 10, 28) // Rifle stock

    // ===== TACTICAL GEAR (Pouches) =====
    graphics.fillStyle(0x3d4a3d, 1) // Darker pouch color
    graphics.fillRect(12, 24, 3, 6) // Left ammo pouch
    graphics.fillRect(33, 24, 3, 6) // Right ammo pouch

    // ===== BOOTS (Dark military) =====
    graphics.fillStyle(0x0d0d0d, 1) // Very dark
    graphics.fillRect(12, 44, 10, 2) // Left boot
    graphics.fillRect(26, 44, 10, 2) // Right boot

    // Generate texture from graphics
    graphics.generateTexture(textureKey, width, height)
    graphics.destroy()

    return textureKey
  }

  /**
   * Create enemy sprite (Red soldier)
   */
  static generateEnemySprite(
    scene: Phaser.Scene,
    width: number = 40,
    height: number = 40
  ): string {
    const textureKey = 'enemySprite'

    if (scene.textures.exists(textureKey)) {
      return textureKey
    }

    const graphics = scene.make.graphics({ x: 0, y: 0, add: false })

    // Body - Red uniform
    graphics.fillStyle(0xaa0000, 1)
    graphics.fillRect(8, 12, 24, 18)

    // Head
    graphics.fillStyle(0xc9a17a, 1)
    graphics.fillCircle(20, 10, 4)

    // Eyes (hostile)
    graphics.fillStyle(0xff0000, 1)
    graphics.fillCircle(17, 9, 1)
    graphics.fillCircle(23, 9, 1)

    // Helmet
    graphics.fillStyle(0x333333, 1)
    graphics.beginPath()
    graphics.arc(20, 7, 5, Math.PI, 0, false)
    graphics.fillPath()

    // Arms
    graphics.fillStyle(0x660000, 1)
    graphics.fillRect(6, 14, 3, 12)
    graphics.fillRect(31, 14, 3, 12)

    // Legs
    graphics.fillStyle(0x1a1a1a, 1)
    graphics.fillRect(10, 30, 8, 8)
    graphics.fillRect(22, 30, 8, 8)

    graphics.generateTexture(textureKey, width, height)
    graphics.destroy()

    return textureKey
  }

  /**
   * Create weapon sprite
   */
  static generateWeaponSprite(
    scene: Phaser.Scene,
    width: number = 32,
    height: number = 8
  ): string {
    const textureKey = 'weaponSprite'

    if (scene.textures.exists(textureKey)) {
      return textureKey
    }

    const graphics = scene.make.graphics({ x: 0, y: 0, add: false })

    // Barrel
    graphics.fillStyle(0x1a1a1a, 1) // Black steel
    graphics.fillRect(0, 2, 24, 4)

    // Stock
    graphics.fillStyle(0x5a4a3a, 1) // Brown wood
    graphics.fillRect(20, 0, 12, 8)

    // Muzzle brake
    graphics.fillStyle(0x2a2a2a, 1)
    graphics.fillRect(24, 1, 4, 6)

    graphics.generateTexture(textureKey, width, height)
    graphics.destroy()

    return textureKey
  }

  /**
   * Draw a star shape
   */
  private static drawStar(
    graphics: Phaser.GameObjects.Graphics,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number
  ): void {
    let rot = (Math.PI / 2) * 3
    const step = Math.PI / spikes

    graphics.beginPath()
    graphics.moveTo(cx, cy - outerRadius)

    for (let i = 0; i < spikes; i++) {
      const x1 = cx + Math.cos(rot) * outerRadius
      const y1 = cy + Math.sin(rot) * outerRadius
      graphics.lineTo(x1, y1)
      rot += step

      const x2 = cx + Math.cos(rot) * innerRadius
      const y2 = cy + Math.sin(rot) * innerRadius
      graphics.lineTo(x2, y2)
      rot += step
    }

    graphics.lineTo(cx, cy - outerRadius)
    graphics.closePath()
    graphics.fillPath()
  }

  /**
   * Create effect sprite (bullet hit, explosion)
   */
  static generateEffectSprite(
    scene: Phaser.Scene,
    type: 'blood' | 'explosion' | 'smoke',
    size: number = 16
  ): string {
    const textureKey = `effect_${type}`

    if (scene.textures.exists(textureKey)) {
      return textureKey
    }

    const graphics = scene.make.graphics({ x: 0, y: 0, add: false })

    if (type === 'blood') {
      graphics.fillStyle(0x660000, 0.8)
      graphics.fillCircle(size / 2, size / 2, size / 3)
      graphics.fillCircle(size / 3, size / 3, size / 4)
      graphics.fillCircle((size * 2) / 3, (size * 2) / 3, size / 4)
    } else if (type === 'explosion') {
      graphics.fillStyle(0xff8800, 1)
      graphics.fillCircle(size / 2, size / 2, size / 2.5)
      graphics.fillStyle(0xffaa00, 0.7)
      graphics.fillCircle(size / 2, size / 2, size / 3)
      graphics.fillStyle(0xffff00, 0.5)
      graphics.fillCircle(size / 2, size / 2, size / 4)
    } else if (type === 'smoke') {
      graphics.fillStyle(0x888888, 0.6)
      graphics.fillCircle(size / 2, size / 2, size / 2.5)
      graphics.fillStyle(0xaaaaaa, 0.4)
      graphics.fillCircle(size / 3, size / 3, size / 3)
      graphics.fillCircle((size * 2) / 3, (size * 2) / 3, size / 3)
    }

    graphics.generateTexture(textureKey, size, size)
    graphics.destroy()

    return textureKey
  }
}
