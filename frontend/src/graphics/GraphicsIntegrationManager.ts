/**
 * 🏐 GRAPHICS INTEGRATION MANAGER - VITYAZ
 * Central coordinator for all graphics systems
 * Manages procedural graphics, animations, effects, and UI rendering
 * 
 * @author VITYAZ Development Team
 * @version 1.0.0
 * @date 2025-12-14
 */

import { Scene, Physics } from 'phaser';
import ProceduralGraphics from './ProceduralGraphics';
import AnimationSystem, {
  DirectionalAnimationController,
  ParticleAnimationSystem,
} from './AnimationSystem';
import VisualEffectsEngine from './VisualEffectsEngine';
import { UIGraphicsEngine } from './UIGraphicsEngine';

/**
 * Main graphics integration manager
 */
export class GraphicsIntegrationManager {
  private scene: Scene;
  private proceduralgraphics: typeof ProceduralGraphics;
  private animationSystem: typeof AnimationSystem;
  private visualEffects: VisualEffectsEngine;
  private uiEngine: UIGraphicsEngine;
  private particleSystem: ParticleAnimationSystem;
  private spriteCache: Map<string, any> = new Map();

  // State tracking
  private playerSprite: any;
  private enemySprites: Map<string, any> = new Map();
  private gameState: GameState = {
    health: 100,
    maxHealth: 100,
    ammo: 30,
    maxAmmo: 30,
    score: 0,
    kills: 0,
    wave: 1,
    enemiesRemaining: 10,
  };

  constructor(scene: Scene) {
    this.scene = scene;
    this.proceduralgraphics = ProceduralGraphics;
    this.animationSystem = AnimationSystem;
    this.visualEffects = new VisualEffectsEngine(scene);
    this.uiEngine = new UIGraphicsEngine(scene, {
      width: scene.cameras.main.width,
      height: scene.cameras.main.height,
      theme: 'military',
      accentColor: '#00ff00',
    });
    this.particleSystem = new ParticleAnimationSystem();

    this.initialize();
  }

  /**
   * Initialize all graphics systems
   */
  private initialize(): void {
    console.log('🏐 Initializing Graphics Integration Manager...');

    // Initialize procedural graphics
    ProceduralGraphics.initialize();

    // Initialize animation system
    AnimationSystem.initialize();

    // Create game HUD
    this.uiEngine.createMainHUD();
    this.uiEngine.createScoreDisplay(0, 0, 1);
    this.uiEngine.createAmmoCounter(30, 20, this.gameState.ammo, this.gameState.maxAmmo);
    this.uiEngine.createWaveIndicator(this.gameState.wave, this.gameState.enemiesRemaining);
    this.uiEngine.createCompass(0);
    this.uiEngine.createMinimap();

    console.log('✅ Graphics Integration Manager initialized successfully');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PLAYER SPRITE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Create player sprite with all components
   */
  createPlayerSprite(x: number, y: number): any {
    // Create composite player sprite
    const playerGroup = this.scene.add.container(x, y);

    // Head
    const head = this.scene.add.image(0, -8, '');
    const headCanvas = ProceduralGraphics.drawPlayerHead(0, 0);
    this.createTextureFromCanvas('player-head', headCanvas);
    // head.setTexture('player-head');

    // Body with uniform (including CRAPOV beret symbol)
    const body = this.scene.add.image(0, 0, '');
    const bodyCanvas = ProceduralGraphics.drawPlayerUniform(0, 0);
    this.createTextureFromCanvas('player-uniform', bodyCanvas);
    // body.setTexture('player-uniform');

    // Limbs
    const limbs = this.scene.add.image(0, 0, '');
    const limbsCanvas = ProceduralGraphics.drawPlayerLimbs(0, 0);
    this.createTextureFromCanvas('player-limbs', limbsCanvas);
    // limbs.setTexture('player-limbs');

    // Weapon
    const weapon = this.scene.add.image(6, -4, '');
    const weaponCanvas = ProceduralGraphics.drawPlayerWeapon(0, 0);
    this.createTextureFromCanvas('player-weapon', weaponCanvas);
    // weapon.setTexture('player-weapon');

    playerGroup.add([head, body, limbs, weapon]);
    playerGroup.setDepth(10);
    this.playerSprite = playerGroup;

    return playerGroup;
  }

  /**
   * Create enemy sprite
   */
  createEnemySprite(
    enemyId: string,
    x: number,
    y: number,
    type: 'basic' | 'armed' | 'heavy' = 'basic'
  ): any {
    const enemyGroup = this.scene.add.container(x, y);

    let enemyCanvas;
    let textureKey = `enemy-${type}`;

    switch (type) {
      case 'armed':
        enemyCanvas = ProceduralGraphics.drawArmedEnemy(0, 0);
        break;
      case 'heavy':
        enemyCanvas = ProceduralGraphics.drawHeavyEnemy(0, 0);
        textureKey = 'enemy-heavy';
        break;
      case 'basic':
      default:
        enemyCanvas = ProceduralGraphics.drawBasicEnemy(0, 0);
    }

    this.createTextureFromCanvas(textureKey, enemyCanvas);

    const sprite = this.scene.add.image(0, 0, '');
    // sprite.setTexture(textureKey);
    enemyGroup.add(sprite);
    enemyGroup.setDepth(9);

    this.enemySprites.set(enemyId, enemyGroup);
    return enemyGroup;
  }

  /**
   * Remove enemy sprite
   */
  removeEnemySprite(enemyId: string): void {
    const sprite = this.enemySprites.get(enemyId);
    if (sprite) {
      sprite.destroy();
      this.enemySprites.delete(enemyId);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EFFECTS & ANIMATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Play player attack animation with muzzle flash
   */
  playPlayerAttackAnimation(direction: number): void {
    if (!this.playerSprite) return;

    // Play attack animation
    AnimationSystem.playAnimation(this.playerSprite as any, 'player-attack');

    // Calculate muzzle position based on direction
    const muzzleX = this.playerSprite.x + Math.cos(direction) * 10;
    const muzzleY = this.playerSprite.y + Math.sin(direction) * 10;

    // Show muzzle flash
    this.visualEffects.muzzleFlash({
      x: muzzleX,
      y: muzzleY,
      direction,
    });
  }

  /**
   * Play enemy damage effect
   */
  playEnemyDamageEffect(enemyId: string, x: number, y: number, damage: number): void {
    // Blood splat
    this.visualEffects.bloodSplat({
      x,
      y,
      intensity: Math.min(damage / 50, 2),
    });

    // Damage number
    this.uiEngine.showDamageNumber(x, y, damage);

    // Knockback animation on enemy
    const enemy = this.enemySprites.get(enemyId);
    if (enemy) {
      this.scene.tweens.add({
        targets: enemy,
        x: enemy.x + (Math.random() - 0.5) * 10,
        y: enemy.y + (Math.random() - 0.5) * 10,
        duration: 100,
      });
    }
  }

  /**
   * Play enemy death effect
   */
  playEnemyDeathEffect(enemyId: string, x: number, y: number): void {
    // Explosion effect
    this.visualEffects.explosion({
      x,
      y,
      intensity: 1,
    });

    // Particle burst
    this.particleSystem.createParticles(x, y, 'blood', 8);

    // Blood pool on ground
    this.visualEffects.createBloodPool(x, y);

    // Death animation
    const enemy = this.enemySprites.get(enemyId);
    if (enemy) {
      this.scene.tweens.add({
        targets: enemy,
        scale: 0.5,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          this.removeEnemySprite(enemyId);
        },
      });
    }
  }

  /**
   * Play bullet impact effect
   */
  playBulletImpactEffect(x: number, y: number): void {
    this.visualEffects.bulletImpact({
      x,
      y,
      intensity: 0.5,
    });
  }

  /**
   * Play player damage effect
   */
  playPlayerDamageEffect(damage: number): void {
    if (!this.playerSprite) return;

    // Screen shake
    this.visualEffects.explosion({
      x: this.playerSprite.x,
      y: this.playerSprite.y,
      intensity: Math.min(damage / 25, 1),
    });

    // Red screen tint
    this.visualEffects.screenFlash(0xff0000, 200);

    // Knockback
    this.scene.tweens.add({
      targets: this.playerSprite,
      x: this.playerSprite.x + (Math.random() - 0.5) * 15,
      y: this.playerSprite.y + (Math.random() - 0.5) * 15,
      duration: 150,
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HUD UPDATES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Update game state and HUD
   */
  updateGameState(updates: Partial<GameState>): void {
    Object.assign(this.gameState, updates);
    this.uiEngine.updateHUD(
      this.gameState.health,
      this.gameState.ammo,
      this.gameState.maxAmmo,
      this.gameState.score,
      this.gameState.kills,
      this.gameState.wave,
      this.gameState.enemiesRemaining
    );
  }

  /**
   * Show notification on screen
   */
  showNotification(message: string): void {
    this.uiEngine.showNotification(message);
  }

  /**
   * Update main update loop
   */
  update(delta: number): void {
    // Update animation system
    AnimationSystem.update(delta);

    // Update visual effects
    this.visualEffects.update(delta);

    // Update particles
    this.particleSystem.update(delta);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Create texture from canvas
   */
  private createTextureFromCanvas(
    key: string,
    canvas: HTMLCanvasElement
  ): void {
    if (!this.spriteCache.has(key)) {
      this.scene.textures.addCanvas(key, canvas);
      this.spriteCache.set(key, canvas);
    }
  }

  /**
   * Get game state
   */
  getGameState(): GameState {
    return { ...this.gameState };
  }

  /**
   * Get player sprite
   */
  getPlayerSprite(): any {
    return this.playerSprite;
  }

  /**
   * Get UI engine
   */
  getUIEngine(): UIGraphicsEngine {
    return this.uiEngine;
  }
}

/**
 * Game state interface
 */
interface GameState {
  health: number;
  maxHealth: number;
  ammo: number;
  maxAmmo: number;
  score: number;
  kills: number;
  wave: number;
  enemiesRemaining: number;
}

export default GraphicsIntegrationManager;
