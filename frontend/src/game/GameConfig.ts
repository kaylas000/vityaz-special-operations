import Phaser from 'phaser';
import { GeneratedGraphicsGameScene, GeneratedGraphicsPreloadScene } from './scenes/GeneratedGraphicsGameScene';
import { PlayerSpriteGenerator } from '../graphics/PlayerSpriteGenerator';

/**
 * Game Configuration
 * Defines all Phaser game settings and scenes
 */
export const createGameConfig = (parentElement: HTMLElement): Phaser.Types.Core.GameConfig => {
  return {
    title: 'VITYAZ: Special Operations',
    type: Phaser.AUTO,
    parent: parentElement,
    width: 800,
    height: 600,
    backgroundColor: '#1a1a1a',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false,
        debugShowBody: false,
        debugShowStaticBody: false,
      },
    },
    scene: [GeneratedGraphicsPreloadScene, GeneratedGraphicsGameScene],
    render: {
      pixelArt: false,
      antialias: true,
      antialiasGL: true,
      roundPixels: false,
      transparent: false,
      clearBeforeRender: true,
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      fullscreenTarget: 'game',
      expandParent: true,
    },
  };
};

/**
 * Graphics Configuration
 * Settings for sprite generation and visual style
 */
export const graphicsConfig = {
  // Player sprite settings
  player: {
    width: 64,
    height: 64,
    scale: 2,
    textureKey: 'playerSprite',
    // Krapoovy beret settings
    beret: {
      color: 0x8b4513, // Maroon-brown (authentic Vityaz color)
      positionLeft: true, // Position on left side
      starColor: 0xffd700, // Gold star
      starSize: 5, // 5-pointed star
    },
    // Military uniform
    uniform: {
      primaryColor: 0x2d5a2d, // Dark military green
      secondaryColor: 0x1a3d1a, // Darker green for sleeves
      accentColor: 0x5a7a5a, // Tactical straps
    },
    // Tactical gear
    gear: {
      helmetColor: 0x333333,
      armorColor: 0x2d5a2d,
      armorAccent: 0x5a7a5a,
    },
    // Boot/legs
    legs: {
      pantsColor: 0x1a1a1a, // Black tactical pants
      bootColor: 0x0d0d0d, // Very dark boots
    },
    // Head
    head: {
      skinColor: 0xd9a97a, // Military tan
      eyeColor: 0x000000, // Black pupils
      highlightColor: 0xffffff, // White highlights
    },
  },

  // Enemy sprite settings
  enemy: {
    width: 56,
    height: 56,
    scale: 1.8,
    textureKey: 'enemySprite',
    uniformColor: 0xaa0000, // Red uniform
    helmetColor: 0x333333,
    skinColor: 0xc9a17a,
    eyeColor: 0xff0000, // Hostile red glow
  },

  // Weapon sprite settings
  weapon: {
    width: 48,
    height: 12,
    scale: 2.5,
    textureKey: 'weaponSprite',
    barrelColor: 0x1a1a1a, // Black steel
    stockColor: 0x5a4a3a, // Brown wood
    muzzleColor: 0x2a2a2a, // Dark steel
  },

  // Visual effects
  effects: {
    blood: {
      color: 0x660000,
      size: 16,
      opacity: 0.8,
      textureKey: 'effect_blood',
    },
    explosion: {
      colors: [0xff8800, 0xffaa00, 0xffff00],
      size: 32,
      textureKey: 'effect_explosion',
    },
    smoke: {
      colors: [0x888888, 0xaaaaaa],
      size: 24,
      textureKey: 'effect_smoke',
    },
  },

  // HUD colors
  hud: {
    // Primary brand color (Krapoovy beret)
    brandColor: '#8b4513',
    // Health bar colors
    healthColors: {
      good: '#22c55e', // Green (100-50%)
      warning: '#eab308', // Yellow (50-25%)
      critical: '#ef4444', // Red (25-0%)
    },
    // UI accent colors
    accentColors: {
      gold: '#ffd700', // Ammunition
      red: '#ff6b6b', // Danger/enemy
      black: '#1a1a1a', // Background
      white: '#ffffff', // Text/borders
    },
    // Text styling
    text: {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: 14,
      fontBold: 'bold',
    },
    // Health bar
    healthBar: {
      width: 196,
      height: 26,
      borderWidth: 1,
      borderColor: '#ffffff',
    },
  },

  // Animation settings
  animations: {
    player: {
      idle: {
        frameRate: 4,
        repeat: -1,
      },
      walk: {
        frameRate: 10,
        repeat: -1,
      },
    },
    effects: {
      muzzleFlash: {
        duration: 100,
      },
      bloodSplatter: {
        duration: 600,
      },
    },
  },
};

/**
 * Game Mechanics Configuration
 */
export const gameplayConfig = {
  player: {
    health: 100,
    maxHealth: 100,
    speed: 160,
    acceleration: 0,
    friction: 0,
  },

  weapons: {
    ak74m: {
      name: 'AK-74M',
      damage: 10,
      firerate: 100, // ms between shots
      ammo: 30,
      maxAmmo: 300,
      range: 300,
      accuracy: 0.85,
    },
    svd: {
      name: 'SVD Sniper',
      damage: 25,
      firerate: 500,
      ammo: 10,
      maxAmmo: 50,
      range: 600,
      accuracy: 0.95,
    },
    pmm: {
      name: 'PMM Pistol',
      damage: 5,
      firerate: 200,
      ammo: 15,
      maxAmmo: 90,
      range: 200,
      accuracy: 0.75,
    },
  },

  enemies: {
    baseHealth: 30,
    baseDamage: 5,
    baseSpeed: 80,
    healthIncreasePerWave: 5,
    speedIncreasePerWave: 10,
  },

  waves: {
    startEnemies: 3,
    maxEnemies: 20,
    enemyIncreasePerWave: 1,
  },
};

/**
 * Initialize PlayerSpriteGenerator for runtime
 */
export function initializeGraphics(scene: Phaser.Scene): void {
  // Generate all sprite textures
  PlayerSpriteGenerator.generatePlayerSprite(scene, 64, 64);
  PlayerSpriteGenerator.generateEnemySprite(scene, 56, 56);
  PlayerSpriteGenerator.generateWeaponSprite(scene, 48, 12);
  PlayerSpriteGenerator.generateEffectSprite(scene, 'blood', 16);
  PlayerSpriteGenerator.generateEffectSprite(scene, 'explosion', 32);
  PlayerSpriteGenerator.generateEffectSprite(scene, 'smoke', 24);

  console.log('✅ All game graphics initialized');
}

/**
 * Color Reference for Development
 */
export const colorPalette = {
  // Primary brand color
  krapovy: 0x8b4513, // Maroon-brown

  // Military colors
  militaryGreen: 0x2d5a2d,
  darkGreen: 0x1a3d1a,
  tacticGray: 0x5a7a5a,

  // Enemy colors
  enemyRed: 0xaa0000,
  hostileRed: 0xff0000,

  // Health colors
  healthGreen: 0x22c55e,
  healthYellow: 0xeab308,
  healthRed: 0xef4444,

  // UI colors
  gold: 0xffd700,
  brightRed: 0xff6b6b,
  black: 0x1a1a1a,
  white: 0xffffff,

  // Material colors
  steel: 0x1a1a1a,
  wood: 0x5a4a3a,
  skin: 0xd9a97a,
};

/**
 * Asset Paths
 */
export const assetPaths = {
  sprites: {
    characters: 'assets/sprites/characters/',
    weapons: 'assets/sprites/weapons/',
    effects: 'assets/effects/particles/',
  },
  ui: {
    hud: 'assets/ui/hud/',
    emblem: 'assets/ui/vityaz_emblem.png',
  },
  sounds: {
    weapons: 'assets/sounds/weapons/',
    effects: 'assets/sounds/effects/',
    ui: 'assets/sounds/ui/',
  },
};

export default createGameConfig;
