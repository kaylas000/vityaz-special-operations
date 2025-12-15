import { UrbanEnvironment, MapConfig, TacticalPosition } from './UrbanEnvironment';
import { IndustrialComplex } from './IndustrialComplex';

/**
 * Map Manager for VITYAZ Game
 * 
 * Handles:
 * - Map selection and switching
 * - Difficulty scaling
 * - Enemy wave configuration per map
 * - Tactical positions and spawn points
 * - Environmental hazards and special mechanics
 */

export enum GameMap {
  URBAN = 'urban',
  INDUSTRIAL = 'industrial',
  DESERT = 'desert',
  ARCTIC = 'arctic',
  UNDERGROUND = 'underground',
}

export interface MapDifficulty {
  mapId: GameMap;
  level: number; // 1-10
  enemyCount: number;
  enemyHealth: number;
  enemyDamage: number;
  waveBonus: number; // health/damage bonus per wave
}

export interface EnemyWave {
  waveNumber: number;
  enemyCount: number;
  enemyTypes: string[];
  difficulty: number;
  spawnPoints: { x: number; y: number }[];
  bossSpawn?: { x: number; y: number };
}

export class MapManager {
  private scene: Phaser.Scene;
  private currentMap: GameMap = GameMap.URBAN;
  private difficulty: number = 1;
  private waves: EnemyWave[] = [];
  private mapConfig: MapConfig = {
    width: 1200,
    height: 800,
    tileSize: 32,
    difficulty: 1,
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Initialize a specific map
   */
  loadMap(mapId: GameMap, difficultyLevel: number = 1): void {
    this.currentMap = mapId;
    this.difficulty = Math.min(difficultyLevel, 10);
    this.mapConfig.difficulty = this.difficulty;

    console.log(`[MapManager] Loading ${mapId} at difficulty ${difficultyLevel}`);

    switch (mapId) {
      case GameMap.URBAN:
        this.loadUrbanEnvironment();
        break;
      case GameMap.INDUSTRIAL:
        this.loadIndustrialComplex();
        break;
      case GameMap.DESERT:
        this.loadDesertTerrain();
        break;
      case GameMap.ARCTIC:
        this.loadArcticBase();
        break;
      case GameMap.UNDERGROUND:
        this.loadUndergroundFacility();
        break;
      default:
        this.loadUrbanEnvironment();
    }

    // Generate enemy waves for this map and difficulty
    this.generateEnemyWaves();
  }

  /**
   * Load Urban Environment map
   */
  private loadUrbanEnvironment(): void {
    const urban = new UrbanEnvironment(this.scene, this.mapConfig);
    urban.create();
  }

  /**
   * Load Industrial Complex map
   */
  private loadIndustrialComplex(): void {
    const industrial = new IndustrialComplex(
      this.scene,
      this.mapConfig.width,
      this.mapConfig.height
    );
    industrial.create();
  }

  /**
   * Load Desert Terrain map (placeholder)
   */
  private loadDesertTerrain(): void {
    const graphics = this.scene.make.graphics({ x: 0, y: 0, add: true });

    // Sand background
    graphics.fillStyle(0xDEB887, 1);
    graphics.fillRect(0, 0, this.mapConfig.width, this.mapConfig.height);

    // Rock formations
    graphics.fillStyle(0xA0826D, 1);
    graphics.fillCircle(200, 300, 80);
    graphics.fillCircle(500, 250, 100);
    graphics.fillCircle(this.mapConfig.width - 300, 350, 90);

    // Sand dunes (wave pattern)
    graphics.lineStyle(3, 0xCDAA7D, 1);
    for (let i = 0; i < 5; i++) {
      const centerY = 400 + i * 100;
      graphics.beginPath();
      for (let x = 0; x <= this.mapConfig.width; x += 50) {
        const y = centerY + Math.sin(x / 100) * 40;
        if (x === 0) {
          graphics.moveTo(x, y);
        } else {
          graphics.lineTo(x, y);
        }
      }
      graphics.strokePath();
    }

    // Sun (harsh desert lighting)
    graphics.fillStyle(0xFFD700, 0.8);
    graphics.fillCircle(this.mapConfig.width - 100, 50, 50);

    // Heat haze
    graphics.fillStyle(0xFFFFFF, 0.1);
    graphics.fillRect(0, this.mapConfig.height - 200, this.mapConfig.width, 200);
  }

  /**
   * Load Arctic Base map (placeholder)
   */
  private loadArcticBase(): void {
    const graphics = this.scene.make.graphics({ x: 0, y: 0, add: true });

    // Snow background
    graphics.fillStyle(0xF0F8FF, 1);
    graphics.fillRect(0, 0, this.mapConfig.width, this.mapConfig.height);

    // Ice formations
    graphics.fillStyle(0xB0E0E6, 0.8);
    graphics.fillCircle(300, 250, 100);
    graphics.fillCircle(800, 300, 120);
    graphics.fillCircle(this.mapConfig.width - 250, 200, 80);

    // Military base structures
    graphics.fillStyle(0x4A4A4A, 1);
    graphics.fillRect(200, 400, 150, 120);
    graphics.fillRect(500, 380, 140, 140);
    graphics.fillRect(this.mapConfig.width - 350, 420, 160, 100);

    // Vityaz colors on structures
    graphics.fillStyle(0xA01030, 0.6);
    graphics.fillRect(250, 450, 50, 70);
    graphics.fillRect(550, 440, 40, 80);

    // Snow particles
    graphics.fillStyle(0xFFFFFF, 0.3);
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * this.mapConfig.width;
      const y = Math.random() * this.mapConfig.height;
      graphics.fillCircle(x, y, 1 + Math.random() * 2);
    }
  }

  /**
   * Load Underground Facility map (placeholder)
   */
  private loadUndergroundFacility(): void {
    const graphics = this.scene.make.graphics({ x: 0, y: 0, add: true });

    // Rock walls
    graphics.fillStyle(0x3A3A3A, 1);
    graphics.fillRect(0, 0, this.mapConfig.width, this.mapConfig.height);

    // Cavern formations
    graphics.fillStyle(0x2A2A2A, 1);
    graphics.fillCircle(300, 200, 120);
    graphics.fillCircle(800, 300, 140);

    // Underground structures
    graphics.fillStyle(0x5A5A7A, 1);
    graphics.fillRect(150, 350, 200, 150);
    graphics.fillRect(550, 330, 220, 170);
    graphics.fillRect(this.mapConfig.width - 350, 380, 200, 120);

    // Bioluminescent lighting
    graphics.fillStyle(0x00FF00, 0.2);
    graphics.fillCircle(300, 350, 150);
    graphics.fillCircle(800, 400, 180);

    // Vityaz tactical lights
    graphics.fillStyle(0xA01030, 0.4);
    graphics.fillCircle(this.mapConfig.width / 2, this.mapConfig.height / 2, 100);

    // Moisture/dripping effect
    graphics.lineStyle(1, 0x4A6A8A, 0.5);
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * this.mapConfig.width;
      const startY = 0;
      const endY = startY + 50 + Math.random() * 100;
      graphics.lineBetween(x, startY, x, endY);
    }
  }

  /**
   * Generate enemy waves based on map and difficulty
   */
  private generateEnemyWaves(): void {
    this.waves = [];
    const baseWaves = 10; // Total waves per map

    for (let waveNum = 1; waveNum <= baseWaves; waveNum++) {
      const difficulty = this.difficulty + Math.floor(waveNum / 2);
      const enemyCount = 3 + waveNum + this.difficulty * 2;

      const wave: EnemyWave = {
        waveNumber: waveNum,
        enemyCount: Math.min(enemyCount, 25), // Cap at 25 enemies
        enemyTypes: this.getEnemyTypes(waveNum, difficulty),
        difficulty: Math.min(difficulty, 15),
        spawnPoints: this.getSpawnPoints(waveNum),
        bossSpawn: waveNum % 5 === 0 ? this.getBossSpawn() : undefined,
      };

      this.waves.push(wave);
    }

    console.log(`[MapManager] Generated ${this.waves.length} waves for ${this.currentMap}`);
  }

  /**
   * Get enemy types for a wave
   */
  private getEnemyTypes(waveNum: number, difficulty: number): string[] {
    const types: string[] = [];

    // Gradually introduce harder enemy types
    types.push('soldier'); // Basic enemy

    if (waveNum > 2) types.push('elite');
    if (waveNum > 4) types.push('sniper');
    if (waveNum > 6) types.push('heavy');
    if (waveNum > 8) types.push('commander');

    return types;
  }

  /**
   * Get spawn points for enemies
   */
  private getSpawnPoints(
    waveNum: number
  ): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];

    // Different spawn patterns based on map
    switch (this.currentMap) {
      case GameMap.URBAN:
        points.push(
          { x: 50, y: 300 },
          { x: this.mapConfig.width - 50, y: 250 },
          { x: this.mapConfig.width / 2, y: 50 },
          { x: 100, y: this.mapConfig.height - 100 }
        );
        break;

      case GameMap.INDUSTRIAL:
        points.push(
          { x: 100, y: 300 },
          { x: this.mapConfig.width - 100, y: 350 },
          { x: this.mapConfig.width / 2, y: 100 },
          { x: 200, y: this.mapConfig.height - 150 }
        );
        break;

      case GameMap.DESERT:
        points.push(
          { x: 100, y: 200 },
          { x: this.mapConfig.width - 100, y: 200 },
          { x: this.mapConfig.width / 2 - 100, y: 100 },
          { x: this.mapConfig.width / 2 + 100, y: 150 }
        );
        break;

      case GameMap.ARCTIC:
        points.push(
          { x: 150, y: 250 },
          { x: this.mapConfig.width - 150, y: 300 },
          { x: 200, y: 100 },
          { x: this.mapConfig.width - 200, y: 100 }
        );
        break;

      case GameMap.UNDERGROUND:
        points.push(
          { x: 200, y: 300 },
          { x: this.mapConfig.width - 200, y: 350 },
          { x: this.mapConfig.width / 2, y: 100 },
          { x: this.mapConfig.width / 3, y: this.mapConfig.height - 150 }
        );
        break;
    }

    return points;
  }

  /**
   * Get boss spawn location
   */
  private getBossSpawn(): { x: number; y: number } {
    return {
      x: this.mapConfig.width / 2,
      y: this.mapConfig.height / 2,
    };
  }

  /**
   * Get difficulty scaling parameters
   */
  getDifficultyStats(): MapDifficulty {
    const baseHealth = 100;
    const baseDamage = 10;
    const healthMultiplier = 1 + this.difficulty * 0.15;
    const damageMultiplier = 1 + this.difficulty * 0.1;

    return {
      mapId: this.currentMap,
      level: this.difficulty,
      enemyCount: 5 + this.difficulty * 2,
      enemyHealth: Math.floor(baseHealth * healthMultiplier),
      enemyDamage: Math.floor(baseDamage * damageMultiplier),
      waveBonus: 1 + this.difficulty * 0.05,
    };
  }

  /**
   * Get current wave configuration
   */
  getWave(waveNumber: number): EnemyWave | null {
    return this.waves[waveNumber - 1] || null;
  }

  /**
   * Get all waves for this map
   */
  getWaves(): EnemyWave[] {
    return this.waves;
  }

  /**
   * Get available maps
   */
  getAvailableMaps(): GameMap[] {
    return Object.values(GameMap);
  }

  /**
   * Get current map
   */
  getCurrentMap(): GameMap {
    return this.currentMap;
  }

  /**
   * Get current difficulty
   */
  getDifficulty(): number {
    return this.difficulty;
  }
}
