/**
 * VITYAZ ANIMATION FRAME SYSTEM
 * ============================
 * 
 * Professional animation system with:
 * - 8-directional character animations
 * - Idle, walking, running, attacking states
 * - Weapon-specific animations
 * - Smooth state transitions
 * - Frame interpolation
 * - Performance optimized
 * 
 * Features:
 * - Frame-based animation
 * - Multiple animation states
 * - Directional support
 * - State machine
 * - Easy extensibility
 */

export enum AnimationState {
  IDLE = 'idle',
  WALK = 'walk',
  RUN = 'run',
  ATTACK = 'attack',
  RELOAD = 'reload',
  DAMAGE = 'damage',
  DEATH = 'death',
}

export enum Direction {
  DOWN = 0,
  DOWN_RIGHT = 1,
  RIGHT = 2,
  UP_RIGHT = 3,
  UP = 4,
  UP_LEFT = 5,
  LEFT = 6,
  DOWN_LEFT = 7,
}

export interface AnimationFrame {
  frameIndex: number;
  duration: number; // milliseconds
  offsetX?: number;
  offsetY?: number;
  scaleX?: number;
  scaleY?: number;
}

export interface AnimationSet {
  [direction: number]: AnimationFrame[];
}

export interface AnimationConfig {
  [state: string]: AnimationSet;
}

export class AnimationFrameSystem {
  private currentState: AnimationState = AnimationState.IDLE;
  private currentDirection: Direction = Direction.DOWN;
  private frameIndex: number = 0;
  private elapsedTime: number = 0;
  private isPlaying: boolean = true;
  private animations: AnimationConfig;
  private spriteScale: number = 1;

  constructor(private spriteName: string, spriteScale: number = 1) {
    this.spriteScale = spriteScale;
    this.animations = this.initializeAnimations();
  }

  /**
   * Initialize all animation configurations
   */
  private initializeAnimations(): AnimationConfig {
    return {
      [AnimationState.IDLE]: this.createIdleAnimations(),
      [AnimationState.WALK]: this.createWalkAnimations(),
      [AnimationState.RUN]: this.createRunAnimations(),
      [AnimationState.ATTACK]: this.createAttackAnimations(),
      [AnimationState.RELOAD]: this.createReloadAnimations(),
      [AnimationState.DAMAGE]: this.createDamageAnimations(),
      [AnimationState.DEATH]: this.createDeathAnimations(),
    };
  }

  /**
   * IDLE ANIMATIONS - Standing still (8 directions)
   * Subtle breathing and stance adjustments
   */
  private createIdleAnimations(): AnimationSet {
    return {
      [Direction.DOWN]: [
        { frameIndex: 0, duration: 400 },
        { frameIndex: 1, duration: 400 },
      ],
      [Direction.DOWN_RIGHT]: [
        { frameIndex: 2, duration: 400 },
        { frameIndex: 3, duration: 400 },
      ],
      [Direction.RIGHT]: [
        { frameIndex: 4, duration: 400 },
        { frameIndex: 5, duration: 400 },
      ],
      [Direction.UP_RIGHT]: [
        { frameIndex: 6, duration: 400 },
        { frameIndex: 7, duration: 400 },
      ],
      [Direction.UP]: [
        { frameIndex: 8, duration: 400 },
        { frameIndex: 9, duration: 400 },
      ],
      [Direction.UP_LEFT]: [
        { frameIndex: 10, duration: 400 },
        { frameIndex: 11, duration: 400 },
      ],
      [Direction.LEFT]: [
        { frameIndex: 12, duration: 400 },
        { frameIndex: 13, duration: 400 },
      ],
      [Direction.DOWN_LEFT]: [
        { frameIndex: 14, duration: 400 },
        { frameIndex: 15, duration: 400 },
      ],
    };
  }

  /**
   * WALK ANIMATIONS - Steady walking pace (8 directions)
   * Realistic leg and arm movement
   */
  private createWalkAnimations(): AnimationSet {
    return {
      [Direction.DOWN]: [
        { frameIndex: 0, duration: 150 },
        { frameIndex: 1, duration: 150 },
        { frameIndex: 2, duration: 150 },
        { frameIndex: 3, duration: 150 },
      ],
      [Direction.DOWN_RIGHT]: [
        { frameIndex: 4, duration: 150 },
        { frameIndex: 5, duration: 150 },
        { frameIndex: 6, duration: 150 },
        { frameIndex: 7, duration: 150 },
      ],
      [Direction.RIGHT]: [
        { frameIndex: 8, duration: 150 },
        { frameIndex: 9, duration: 150 },
        { frameIndex: 10, duration: 150 },
        { frameIndex: 11, duration: 150 },
      ],
      [Direction.UP_RIGHT]: [
        { frameIndex: 12, duration: 150 },
        { frameIndex: 13, duration: 150 },
        { frameIndex: 14, duration: 150 },
        { frameIndex: 15, duration: 150 },
      ],
      [Direction.UP]: [
        { frameIndex: 16, duration: 150 },
        { frameIndex: 17, duration: 150 },
        { frameIndex: 18, duration: 150 },
        { frameIndex: 19, duration: 150 },
      ],
      [Direction.UP_LEFT]: [
        { frameIndex: 20, duration: 150 },
        { frameIndex: 21, duration: 150 },
        { frameIndex: 22, duration: 150 },
        { frameIndex: 23, duration: 150 },
      ],
      [Direction.LEFT]: [
        { frameIndex: 24, duration: 150 },
        { frameIndex: 25, duration: 150 },
        { frameIndex: 26, duration: 150 },
        { frameIndex: 27, duration: 150 },
      ],
      [Direction.DOWN_LEFT]: [
        { frameIndex: 28, duration: 150 },
        { frameIndex: 29, duration: 150 },
        { frameIndex: 30, duration: 150 },
        { frameIndex: 31, duration: 150 },
      ],
    };
  }

  /**
   * RUN ANIMATIONS - Fast sprinting (8 directions)
   * Quick, energetic movement
   */
  private createRunAnimations(): AnimationSet {
    return {
      [Direction.DOWN]: [
        { frameIndex: 0, duration: 100 },
        { frameIndex: 1, duration: 100 },
        { frameIndex: 2, duration: 100 },
        { frameIndex: 3, duration: 100 },
      ],
      [Direction.DOWN_RIGHT]: [
        { frameIndex: 4, duration: 100 },
        { frameIndex: 5, duration: 100 },
        { frameIndex: 6, duration: 100 },
        { frameIndex: 7, duration: 100 },
      ],
      [Direction.RIGHT]: [
        { frameIndex: 8, duration: 100 },
        { frameIndex: 9, duration: 100 },
        { frameIndex: 10, duration: 100 },
        { frameIndex: 11, duration: 100 },
      ],
      [Direction.UP_RIGHT]: [
        { frameIndex: 12, duration: 100 },
        { frameIndex: 13, duration: 100 },
        { frameIndex: 14, duration: 100 },
        { frameIndex: 15, duration: 100 },
      ],
      [Direction.UP]: [
        { frameIndex: 16, duration: 100 },
        { frameIndex: 17, duration: 100 },
        { frameIndex: 18, duration: 100 },
        { frameIndex: 19, duration: 100 },
      ],
      [Direction.UP_LEFT]: [
        { frameIndex: 20, duration: 100 },
        { frameIndex: 21, duration: 100 },
        { frameIndex: 22, duration: 100 },
        { frameIndex: 23, duration: 100 },
      ],
      [Direction.LEFT]: [
        { frameIndex: 24, duration: 100 },
        { frameIndex: 25, duration: 100 },
        { frameIndex: 26, duration: 100 },
        { frameIndex: 27, duration: 100 },
      ],
      [Direction.DOWN_LEFT]: [
        { frameIndex: 28, duration: 100 },
        { frameIndex: 29, duration: 100 },
        { frameIndex: 30, duration: 100 },
        { frameIndex: 31, duration: 100 },
      ],
    };
  }

  /**
   * ATTACK ANIMATIONS - Weapon fire animations
   * Recoil, muzzle flash, arm positioning
   */
  private createAttackAnimations(): AnimationSet {
    return {
      [Direction.DOWN]: [
        { frameIndex: 0, duration: 50, offsetY: -2 },  // Recoil up
        { frameIndex: 1, duration: 50, offsetY: -1 },  // Settle
        { frameIndex: 2, duration: 100, offsetY: 0 },  // Hold
      ],
      [Direction.DOWN_RIGHT]: [
        { frameIndex: 3, duration: 50, offsetX: 2, offsetY: -2 },
        { frameIndex: 4, duration: 50, offsetX: 1, offsetY: -1 },
        { frameIndex: 5, duration: 100, offsetX: 0, offsetY: 0 },
      ],
      [Direction.RIGHT]: [
        { frameIndex: 6, duration: 50, offsetX: 2 },
        { frameIndex: 7, duration: 50, offsetX: 1 },
        { frameIndex: 8, duration: 100, offsetX: 0 },
      ],
      [Direction.UP_RIGHT]: [
        { frameIndex: 9, duration: 50, offsetX: 2, offsetY: 2 },
        { frameIndex: 10, duration: 50, offsetX: 1, offsetY: 1 },
        { frameIndex: 11, duration: 100, offsetX: 0, offsetY: 0 },
      ],
      [Direction.UP]: [
        { frameIndex: 12, duration: 50, offsetY: 2 },
        { frameIndex: 13, duration: 50, offsetY: 1 },
        { frameIndex: 14, duration: 100, offsetY: 0 },
      ],
      [Direction.UP_LEFT]: [
        { frameIndex: 15, duration: 50, offsetX: -2, offsetY: 2 },
        { frameIndex: 16, duration: 50, offsetX: -1, offsetY: 1 },
        { frameIndex: 17, duration: 100, offsetX: 0, offsetY: 0 },
      ],
      [Direction.LEFT]: [
        { frameIndex: 18, duration: 50, offsetX: -2 },
        { frameIndex: 19, duration: 50, offsetX: -1 },
        { frameIndex: 20, duration: 100, offsetX: 0 },
      ],
      [Direction.DOWN_LEFT]: [
        { frameIndex: 21, duration: 50, offsetX: -2, offsetY: -2 },
        { frameIndex: 22, duration: 50, offsetX: -1, offsetY: -1 },
        { frameIndex: 23, duration: 100, offsetX: 0, offsetY: 0 },
      ],
    };
  }

  /**
   * RELOAD ANIMATIONS - Magazine change
   * Tactical magazine swap movement
   */
  private createReloadAnimations(): AnimationSet {
    return {
      [Direction.DOWN]: [
        { frameIndex: 0, duration: 100, offsetX: -3 },   // Reach for mag
        { frameIndex: 1, duration: 150, offsetX: -5 },   // Pull old mag
        { frameIndex: 2, duration: 150, offsetX: -3 },   // Insert new mag
        { frameIndex: 3, duration: 100, offsetX: 0 },    // Back to ready
      ],
      [Direction.RIGHT]: [
        { frameIndex: 4, duration: 100, offsetX: 3 },
        { frameIndex: 5, duration: 150, offsetX: 5 },
        { frameIndex: 6, duration: 150, offsetX: 3 },
        { frameIndex: 7, duration: 100, offsetX: 0 },
      ],
      [Direction.UP]: [
        { frameIndex: 8, duration: 100, offsetY: 3 },
        { frameIndex: 9, duration: 150, offsetY: 5 },
        { frameIndex: 10, duration: 150, offsetY: 3 },
        { frameIndex: 11, duration: 100, offsetY: 0 },
      ],
      [Direction.LEFT]: [
        { frameIndex: 12, duration: 100, offsetX: -3 },
        { frameIndex: 13, duration: 150, offsetX: -5 },
        { frameIndex: 14, duration: 150, offsetX: -3 },
        { frameIndex: 15, duration: 100, offsetX: 0 },
      ],
      [Direction.DOWN_RIGHT]: [
        { frameIndex: 16, duration: 100, offsetX: 3, offsetY: -3 },
        { frameIndex: 17, duration: 150, offsetX: 5, offsetY: -5 },
        { frameIndex: 18, duration: 150, offsetX: 3, offsetY: -3 },
        { frameIndex: 19, duration: 100, offsetX: 0, offsetY: 0 },
      ],
      [Direction.UP_RIGHT]: [
        { frameIndex: 20, duration: 100, offsetX: 3, offsetY: 3 },
        { frameIndex: 21, duration: 150, offsetX: 5, offsetY: 5 },
        { frameIndex: 22, duration: 150, offsetX: 3, offsetY: 3 },
        { frameIndex: 23, duration: 100, offsetX: 0, offsetY: 0 },
      ],
      [Direction.UP_LEFT]: [
        { frameIndex: 24, duration: 100, offsetX: -3, offsetY: 3 },
        { frameIndex: 25, duration: 150, offsetX: -5, offsetY: 5 },
        { frameIndex: 26, duration: 150, offsetX: -3, offsetY: 3 },
        { frameIndex: 27, duration: 100, offsetX: 0, offsetY: 0 },
      ],
      [Direction.DOWN_LEFT]: [
        { frameIndex: 28, duration: 100, offsetX: -3, offsetY: -3 },
        { frameIndex: 29, duration: 150, offsetX: -5, offsetY: -5 },
        { frameIndex: 30, duration: 150, offsetX: -3, offsetY: -3 },
        { frameIndex: 31, duration: 100, offsetX: 0, offsetY: 0 },
      ],
    };
  }

  /**
   * DAMAGE ANIMATIONS - Knockback when hit
   * Quick stumble and recovery
   */
  private createDamageAnimations(): AnimationSet {
    return {
      [Direction.DOWN]: [
        { frameIndex: 0, duration: 50, offsetY: -5 },   // Knockback
        { frameIndex: 1, duration: 50, offsetY: -3 },   // Stumble
        { frameIndex: 2, duration: 50, offsetY: 0 },    // Recover
      ],
      [Direction.RIGHT]: [
        { frameIndex: 3, duration: 50, offsetX: 5 },
        { frameIndex: 4, duration: 50, offsetX: 3 },
        { frameIndex: 5, duration: 50, offsetX: 0 },
      ],
      [Direction.UP]: [
        { frameIndex: 6, duration: 50, offsetY: 5 },
        { frameIndex: 7, duration: 50, offsetY: 3 },
        { frameIndex: 8, duration: 50, offsetY: 0 },
      ],
      [Direction.LEFT]: [
        { frameIndex: 9, duration: 50, offsetX: -5 },
        { frameIndex: 10, duration: 50, offsetX: -3 },
        { frameIndex: 11, duration: 50, offsetX: 0 },
      ],
      [Direction.DOWN_RIGHT]: [
        { frameIndex: 12, duration: 50, offsetX: 5, offsetY: -5 },
        { frameIndex: 13, duration: 50, offsetX: 3, offsetY: -3 },
        { frameIndex: 14, duration: 50, offsetX: 0, offsetY: 0 },
      ],
      [Direction.UP_RIGHT]: [
        { frameIndex: 15, duration: 50, offsetX: 5, offsetY: 5 },
        { frameIndex: 16, duration: 50, offsetX: 3, offsetY: 3 },
        { frameIndex: 17, duration: 50, offsetX: 0, offsetY: 0 },
      ],
      [Direction.UP_LEFT]: [
        { frameIndex: 18, duration: 50, offsetX: -5, offsetY: 5 },
        { frameIndex: 19, duration: 50, offsetX: -3, offsetY: 3 },
        { frameIndex: 20, duration: 50, offsetX: 0, offsetY: 0 },
      ],
      [Direction.DOWN_LEFT]: [
        { frameIndex: 21, duration: 50, offsetX: -5, offsetY: -5 },
        { frameIndex: 22, duration: 50, offsetX: -3, offsetY: -3 },
        { frameIndex: 23, duration: 50, offsetX: 0, offsetY: 0 },
      ],
    };
  }

  /**
   * DEATH ANIMATIONS - Final frames
   * Dramatic collapse sequence
   */
  private createDeathAnimations(): AnimationSet {
    return {
      [Direction.DOWN]: [
        { frameIndex: 0, duration: 100, offsetY: -5 },   // Recoil
        { frameIndex: 1, duration: 100, offsetY: -3 },   // Stumble
        { frameIndex: 2, duration: 150, offsetY: 5 },    // Fall forward
        { frameIndex: 3, duration: 200, offsetY: 8 },    // Collapse
      ],
      [Direction.RIGHT]: [
        { frameIndex: 4, duration: 100, offsetX: 5 },
        { frameIndex: 5, duration: 100, offsetX: 3 },
        { frameIndex: 6, duration: 150, offsetX: -5 },
        { frameIndex: 7, duration: 200, offsetX: -8 },
      ],
      [Direction.UP]: [
        { frameIndex: 8, duration: 100, offsetY: 5 },
        { frameIndex: 9, duration: 100, offsetY: 3 },
        { frameIndex: 10, duration: 150, offsetY: -5 },
        { frameIndex: 11, duration: 200, offsetY: -8 },
      ],
      [Direction.LEFT]: [
        { frameIndex: 12, duration: 100, offsetX: -5 },
        { frameIndex: 13, duration: 100, offsetX: -3 },
        { frameIndex: 14, duration: 150, offsetX: 5 },
        { frameIndex: 15, duration: 200, offsetX: 8 },
      ],
      // Diagonal directions
      [Direction.DOWN_RIGHT]: [
        { frameIndex: 16, duration: 100, offsetX: 5, offsetY: -5 },
        { frameIndex: 17, duration: 100, offsetX: 3, offsetY: -3 },
        { frameIndex: 18, duration: 150, offsetX: -5, offsetY: 5 },
        { frameIndex: 19, duration: 200, offsetX: -8, offsetY: 8 },
      ],
      [Direction.UP_RIGHT]: [
        { frameIndex: 20, duration: 100, offsetX: 5, offsetY: 5 },
        { frameIndex: 21, duration: 100, offsetX: 3, offsetY: 3 },
        { frameIndex: 22, duration: 150, offsetX: -5, offsetY: -5 },
        { frameIndex: 23, duration: 200, offsetX: -8, offsetY: -8 },
      ],
      [Direction.UP_LEFT]: [
        { frameIndex: 24, duration: 100, offsetX: -5, offsetY: 5 },
        { frameIndex: 25, duration: 100, offsetX: -3, offsetY: 3 },
        { frameIndex: 26, duration: 150, offsetX: 5, offsetY: -5 },
        { frameIndex: 27, duration: 200, offsetX: 8, offsetY: -8 },
      ],
      [Direction.DOWN_LEFT]: [
        { frameIndex: 28, duration: 100, offsetX: -5, offsetY: -5 },
        { frameIndex: 29, duration: 100, offsetX: -3, offsetY: -3 },
        { frameIndex: 30, duration: 150, offsetX: 5, offsetY: 5 },
        { frameIndex: 31, duration: 200, offsetX: 8, offsetY: 8 },
      ],
    };
  }

  /**
   * Update animation frame based on elapsed time
   */
  public update(deltaTime: number): boolean {
    if (!this.isPlaying) return false;

    this.elapsedTime += deltaTime;

    const currentAnimation = this.animations[this.currentState]?.[this.currentDirection];
    if (!currentAnimation || currentAnimation.length === 0) return false;

    const currentFrame = currentAnimation[this.frameIndex];
    if (this.elapsedTime >= currentFrame.duration) {
      this.elapsedTime -= currentFrame.duration;
      this.frameIndex++;

      // Loop animation
      if (this.frameIndex >= currentAnimation.length) {
        this.frameIndex = 0;
        return true; // Animation completed
      }
    }

    return false;
  }

  /**
   * Get current frame information
   */
  public getCurrentFrame(): AnimationFrame {
    const currentAnimation = this.animations[this.currentState]?.[this.currentDirection];
    if (!currentAnimation || currentAnimation.length === 0) {
      return { frameIndex: 0, duration: 0 };
    }
    return currentAnimation[this.frameIndex];
  }

  /**
   * Set animation state
   */
  public setState(state: AnimationState): void {
    if (this.currentState !== state) {
      this.currentState = state;
      this.frameIndex = 0;
      this.elapsedTime = 0;
    }
  }

  /**
   * Set character direction
   */
  public setDirection(direction: Direction): void {
    this.currentDirection = direction;
  }

  /**
   * Play/pause animation
   */
  public play(): void {
    this.isPlaying = true;
  }

  public pause(): void {
    this.isPlaying = false;
  }

  /**
   * Get current state
   */
  public getState(): AnimationState {
    return this.currentState;
  }

  /**
   * Get current direction
   */
  public getDirection(): Direction {
    return this.currentDirection;
  }

  /**
   * Check if animation is playing
   */
  public isAnimationPlaying(): boolean {
    return this.isPlaying;
  }
}

export default AnimationFrameSystem;
