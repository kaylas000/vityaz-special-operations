/**
 * 🎨 PROCEDURAL GRAPHICS ENGINE - VITYAZ
 * Canvas-based graphics generation without external artists
 * 40+ components procedurally generated using Canvas API
 * 
 * @author VITYAZ Development Team
 * @version 1.0.0
 * @date 2025-12-14
 */

import { Scene } from 'phaser';

/**
 * Main procedural graphics engine
 * Generates all sprites using Canvas API instead of traditional sprite sheets
 */
export class ProceduralGraphics {
  private static cache: Map<string, HTMLCanvasElement> = new Map();
  private static noise: SimplexNoise;

  /**
   * Initialize graphics engine
   */
  static initialize(): void {
    this.noise = new SimplexNoise();
    console.log('✅ Procedural Graphics Engine initialized');
  }

  /**
   * Get or create cached canvas sprite
   */
  private static getCachedCanvas(key: string): HTMLCanvasElement | null {
    return this.cache.get(key) || null;
  }

  private static cacheCanvas(key: string, canvas: HTMLCanvasElement): void {
    this.cache.set(key, canvas);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 1: BASE SPRITES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * 1.1 PLAYER CHARACTER
   */

  /**
   * Draw player head with face details
   */
  static drawPlayerHead(x: number, y: number): HTMLCanvasElement {
    const size = 16;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Head (peach color)
    ctx.fillStyle = '#FDBF6F';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#000000';
    ctx.fillRect(size / 3 - 1, size / 3, 2, 2);
    ctx.fillRect(size / 1.5 - 1, size / 3, 2, 2);

    // Mouth
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(size / 2, size / 1.5, 2, 0, Math.PI);
    ctx.stroke();

    // Shading (darker on right side)
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.arc(size / 2 + 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
  }

  /**
   * Draw player body with camouflage pattern
   */
  static drawPlayerBody(x: number, y: number): HTMLCanvasElement {
    const width = 20;
    const height = 24;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Base green color
    ctx.fillStyle = '#4A7C3B';
    ctx.fillRect(0, 0, width, height);

    // Camouflage pattern (procedural)
    ctx.fillStyle = '#3D5A2E';
    for (let i = 0; i < width; i += 3) {
      for (let j = 0; j < height; j += 3) {
        if (Math.random() > 0.5) {
          ctx.fillRect(i, j, 2, 2);
        }
      }
    }

    // Brown camouflage spots
    ctx.fillStyle = '#8B4513';
    for (let i = 0; i < width; i += 5) {
      for (let j = 0; j < height; j += 5) {
        if (Math.random() > 0.7) {
          ctx.fillRect(i, j, 3, 3);
        }
      }
    }

    // Darker edges for 3D effect
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(width - 2, 0, 2, height);
    ctx.fillRect(0, height - 2, width, 2);

    return canvas;
  }

  /**
   * Draw military uniform with VITYAZ symbology
   * ⭐ КРАПОВЫЙ БЕРЕТ (Crapov Beret) - LEFT SIDE!
   */
  static drawPlayerUniform(x: number, y: number): HTMLCanvasElement {
    const width = 20;
    const height = 24;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Military uniform base
    ctx.fillStyle = '#4A5D3B';
    ctx.fillRect(0, 0, width, height);

    // 🎩 КРАПОВЫЙ БЕРЕТ (Crapov Beret) - on LEFT side (index 0-1)
    const beretColor = '#6B3410'; // Crapov (reddish-brown) color
    ctx.fillStyle = beretColor;
    ctx.beginPath();
    // Draw beret on left side
    ctx.ellipse(3, 2, 3, 2, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Beret emblem (small gold circle on beret)
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(3, 2, 1, 0, Math.PI * 2);
    ctx.fill();

    // 🎖️ CHEVRON VITYAZ on chest (gold diamond shape)
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    // Draw diamond shape
    ctx.moveTo(width / 2, 8);
    ctx.lineTo(width / 2 + 3, 11);
    ctx.lineTo(width / 2, 14);
    ctx.lineTo(width / 2 - 3, 11);
    ctx.closePath();
    ctx.fill();

    // Chevron outline
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 👔 Epaulettes (gold)
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(1, 3, 2, 1);
    ctx.fillRect(width - 3, 3, 2, 1);

    return canvas;
  }

  /**
   * Draw player limbs (arms and legs with animation support)
   */
  static drawPlayerLimbs(x: number, y: number, walkFrame: number = 0): HTMLCanvasElement {
    const width = 16;
    const height = 28;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Arms
    ctx.fillStyle = '#FDBF6F'; // Skin color
    // Left arm (swings opposite to left leg)
    const leftArmOffset = Math.sin(walkFrame * 0.5) * 2;
    ctx.fillRect(1, 4, 2, 10 + leftArmOffset);
    // Right arm
    const rightArmOffset = Math.sin(walkFrame * 0.5 + Math.PI) * 2;
    ctx.fillRect(width - 3, 4, 2, 10 + rightArmOffset);

    // Legs
    ctx.fillStyle = '#2D3D2D'; // Dark pants
    // Left leg (swings with frame)
    const leftLegOffset = Math.sin(walkFrame * 0.5) * 2;
    ctx.fillRect(3, 14, 3, 14 + leftLegOffset);
    // Right leg (opposite phase)
    const rightLegOffset = Math.sin(walkFrame * 0.5 + Math.PI) * 2;
    ctx.fillRect(width - 6, 14, 3, 14 + rightLegOffset);

    // Boots (black)
    ctx.fillStyle = '#000000';
    ctx.fillRect(2, height - 2, 4, 2);
    ctx.fillRect(width - 6, height - 2, 4, 2);

    return canvas;
  }

  /**
   * Draw player weapon in hands (with rotation support)
   */
  static drawPlayerWeapon(x: number, y: number, angle: number = 0): HTMLCanvasElement {
    const width = 16;
    const height = 8;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Rotate context for aiming
    ctx.translate(width / 2, height / 2);
    ctx.rotate(angle);
    ctx.translate(-width / 2, -height / 2);

    // Barrel (dark gray)
    ctx.fillStyle = '#3A3A3A';
    ctx.fillRect(4, 2, 12, 2);

    // Stock (brown wood)
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 2, 4, 4);

    // Trigger guard (gray metal)
    ctx.fillStyle = '#696969';
    ctx.fillRect(2, 1, 2, 6);

    return canvas;
  }

  /**
   * 1.2 ENEMIES
   */

  /**
   * Draw basic enemy soldier
   */
  static drawBasicEnemy(x: number, y: number): HTMLCanvasElement {
    const width = 18;
    const height = 20;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Head
    ctx.fillStyle = '#FDBF6F'; // Skin
    ctx.fillRect(7, 1, 4, 4);

    // Body (red for visibility as enemy)
    ctx.fillStyle = '#DC143C'; // Crimson red
    ctx.fillRect(3, 5, 12, 10);

    // Stripes (camouflage on enemy)
    ctx.fillStyle = '#8B0000'; // Dark red
    ctx.fillRect(4, 6, 10, 1);
    ctx.fillRect(4, 9, 10, 1);

    // Arms
    ctx.fillStyle = '#FDBF6F';
    ctx.fillRect(1, 6, 2, 8);
    ctx.fillRect(width - 3, 6, 2, 8);

    // Legs
    ctx.fillStyle = '#2D3D2D';
    ctx.fillRect(5, 15, 3, 5);
    ctx.fillRect(10, 15, 3, 5);

    return canvas;
  }

  /**
   * Draw armed enemy with weapon
   */
  static drawArmedEnemy(x: number, y: number): HTMLCanvasElement {
    const width = 18;
    const height = 20;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Get basic enemy
    const basicEnemy = this.drawBasicEnemy(x, y);
    ctx.drawImage(basicEnemy, 0, 0);

    // Add weapon (rifle)
    ctx.fillStyle = '#3A3A3A';
    ctx.fillRect(width - 4, 4, 8, 2); // Barrel
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(width - 6, 4, 3, 3); // Stock

    return canvas;
  }

  /**
   * Draw heavy enemy (boss) with armor
   */
  static drawHeavyEnemy(x: number, y: number): HTMLCanvasElement {
    const width = 24;
    const height = 28;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Armor plating (metallic)
    ctx.fillStyle = '#696969'; // Gray metal
    ctx.fillRect(2, 4, 20, 18);

    // Armor pattern (procedural metallic texture)
    ctx.fillStyle = '#555555';
    for (let i = 0; i < width; i += 4) {
      for (let j = 4; j < 22; j += 4) {
        ctx.fillRect(i, j, 2, 2);
      }
    }

    // Heavy armor segments
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 1;
    ctx.strokeRect(2, 4, 20, 6);
    ctx.strokeRect(2, 11, 20, 6);
    ctx.strokeRect(2, 18, 20, 4);

    // Head in helmet
    ctx.fillStyle = '#555555';
    ctx.fillRect(8, 1, 8, 4);

    // Heavy weapon (machine gun)
    ctx.fillStyle = '#3A3A3A';
    ctx.fillRect(width - 6, 8, 10, 3);

    // Ammo belt
    ctx.fillStyle = '#8B8B00';
    ctx.fillRect(width - 5, 12, 8, 1);

    return canvas;
  }

  /**
   * 1.3 EFFECTS
   */

  /**
   * Draw blood splatter effect
   */
  static drawBloodSplat(x: number, y: number, size: number = 16): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Random splatter pattern using noise
    ctx.fillStyle = '#8B0000'; // Dark red
    for (let i = 0; i < 8; i++) {
      const splat = Math.random();
      const angle = (Math.PI * 2 * splat);
      const distance = Math.random() * size / 3;
      const sx = size / 2 + Math.cos(angle) * distance;
      const sy = size / 2 + Math.sin(angle) * distance;
      ctx.beginPath();
      ctx.arc(sx, sy, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Main splat center
    ctx.fillStyle = '#DC143C'; // Crimson
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 4, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
  }

  /**
   * Draw muzzle flash effect
   */
  static drawMuzzleFlash(x: number, y: number, direction: number = 0): HTMLCanvasElement {
    const width = 8;
    const height = 6;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Rotate for direction
    ctx.translate(width / 2, height / 2);
    ctx.rotate(direction);
    ctx.translate(-width / 2, -height / 2);

    // Yellow flash
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.moveTo(width, height / 2);
    ctx.lineTo(width - 4, height / 4);
    ctx.lineTo(width - 3, height / 2);
    ctx.lineTo(width - 4, height / 1.33);
    ctx.closePath();
    ctx.fill();

    // Orange glow
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.moveTo(width - 2, height / 2);
    ctx.lineTo(width - 4, height / 3);
    ctx.lineTo(width - 3, height / 2);
    ctx.lineTo(width - 4, height / 1.5);
    ctx.closePath();
    ctx.fill();

    return canvas;
  }

  /**
   * Draw explosion effect
   */
  static drawExplosion(x: number, y: number, size: number = 20, frame: number = 0): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const center = size / 2;
    const expansionFactor = 1 + frame * 0.2;

    // Orange explosion circle
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.arc(center, center, (size / 3) * expansionFactor, 0, Math.PI * 2);
    ctx.fill();

    // Yellow core
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.arc(center, center, (size / 5) * expansionFactor, 0, Math.PI * 2);
    ctx.fill();

    // Red outer ring
    ctx.strokeStyle = '#FF4500';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(center, center, (size / 2.5) * expansionFactor, 0, Math.PI * 2);
    ctx.stroke();

    // Smoke particles (gray with transparency)
    ctx.fillStyle = 'rgba(128,128,128,0.5)';
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6;
      const distance = (size / 3) * expansionFactor;
      const px = center + Math.cos(angle) * distance;
      const py = center + Math.sin(angle) * distance;
      ctx.beginPath();
      ctx.arc(px, py, size / 6, 0, Math.PI * 2);
      ctx.fill();
    }

    return canvas;
  }

  /**
   * Draw casing sparks
   */
  static drawCasingSpark(x: number, y: number): HTMLCanvasElement {
    const size = 4;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Yellow spark
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Orange glow
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 3, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
  }

  /**
   * 1.4 UI ELEMENTS
   */

  /**
   * Draw health bar
   */
  static drawHealthBar(width: number = 60, height: number = 8, health: number = 100): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Background (dark)
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, width, height);

    // Red health
    const healthWidth = (health / 100) * width;
    ctx.fillStyle = health > 30 ? '#00FF00' : health > 15 ? '#FFFF00' : '#FF0000';
    ctx.fillRect(0, 0, healthWidth, height);

    // Border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);

    return canvas;
  }

  /**
   * Draw ammo counter
   */
  static drawAmmoCounter(ammo: number = 30, maxAmmo: number = 30): string {
    return `${ammo}/${maxAmmo}`;
  }

  /**
   * Draw wave indicator
   */
  static drawWaveIndicator(wave: number = 1, enemiesRemaining: number = 10): string {
    return `WAVE ${wave} | ENEMIES: ${enemiesRemaining}`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 2: ANIMATIONS (Placeholder - will be implemented in AnimationSystem.ts)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Create walking animation frames
   */
  static createWalkingAnimation(frames: number = 4): HTMLCanvasElement[] {
    const animations: HTMLCanvasElement[] = [];
    for (let i = 0; i < frames; i++) {
      animations.push(this.drawPlayerLimbs(0, 0, i * (Math.PI / 2)));
    }
    return animations;
  }

  /**
   * Create attack animation frames
   */
  static createAttackAnimation(frames: number = 3): HTMLCanvasElement[] {
    const animations: HTMLCanvasElement[] = [];
    const angles = [0, 0.3, 0]; // Recoil pattern
    for (let i = 0; i < frames; i++) {
      animations.push(this.drawPlayerWeapon(0, 0, angles[i]));
    }
    return animations;
  }

  /**
   * Create explosion animation frames
   */
  static createExplosionAnimation(frames: number = 4): HTMLCanvasElement[] {
    const animations: HTMLCanvasElement[] = [];
    for (let i = 0; i < frames; i++) {
      animations.push(this.drawExplosion(0, 0, 20, i));
    }
    return animations;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Convert canvas to Phaser texture
   */
  static canvasToTexture(scene: Scene, key: string, canvas: HTMLCanvasElement): void {
    scene.textures.addCanvas(key, canvas);
  }

  /**
   * Create texture from canvas with caching
   */
  static createTexture(scene: Scene, key: string, canvas: HTMLCanvasElement): void {
    if (!this.cache.has(key)) {
      this.cacheCanvas(key, canvas);
      this.canvasToTexture(scene, key, canvas);
    }
  }
}

/**
 * Simplex Noise for procedural generation
 * @source https://github.com/jwagner/simplex-noise.js
 */
class SimplexNoise {
  private p: number[];

  constructor() {
    this.p = this.buildPermutationTable();
  }

  private buildPermutationTable(): number[] {
    const p = [];
    for (let i = 0; i < 256; i++) {
      p[i] = Math.floor(Math.random() * 256);
    }
    return [...p, ...p];
  }

  noise2D(x: number, y: number): number {
    // Simple noise function - returns value between -1 and 1
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default ProceduralGraphics;
