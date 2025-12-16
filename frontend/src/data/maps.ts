/**
 * Map System - All combat arenas and level data
 */

export interface Vector2 {
  x: number;
  y: number;
}

export interface SpawnPoint {
  position: Vector2;
  team?: 'russian' | 'international' | 'any';
}

export interface MapObject {
  id: string;
  type: 'wall' | 'cover' | 'spawn' | 'flag' | 'objective' | 'hazard';
  position: Vector2;
  size: Vector2;
  rotation?: number;
  properties?: Record<string, any>;
}

export interface Map {
  id: string;
  name: string;
  description: string;
  size: Vector2;
  difficulty: 'easy' | 'normal' | 'hard';
  environment: 'urban' | 'forest' | 'industrial' | 'desert' | 'arctic';
  maxPlayers: number;
  recommendedPlayers: number;
  objects: MapObject[];
  spawnPoints: SpawnPoint[];
  objectives?: Objective[];
  hazards?: Hazard[];
  lightingType: 'day' | 'night' | 'dusk';
}

export interface Objective {
  id: string;
  type: 'control' | 'escort' | 'retrieve';
  position: Vector2;
  radius: number;
  team?: string;
  description: string;
}

export interface Hazard {
  id: string;
  type: 'electric' | 'toxic' | 'fire' | 'radiation';
  position: Vector2;
  radius: number;
  damage: number;
  damageInterval: number; // ms
}

// ============ MAP DEFINITIONS ============

export const MAPS: Record<string, Map> = {
  // Map 1: Urban Conflict Zone
  'urban-downtown': {
    id: 'urban-downtown',
    name: '🏢 Downtown Conflict',
    description: 'High-rise urban environment with tight corridors and multi-level combat',
    size: { x: 1024, y: 1024 },
    difficulty: 'normal',
    environment: 'urban',
    maxPlayers: 16,
    recommendedPlayers: 8,
    lightingType: 'day',
    spawnPoints: [
      // Russian spawn
      { position: { x: 100, y: 100 }, team: 'russian' },
      { position: { x: 150, y: 100 }, team: 'russian' },
      { position: { x: 100, y: 150 }, team: 'russian' },
      // International spawn
      { position: { x: 900, y: 900 }, team: 'international' },
      { position: { x: 850, y: 900 }, team: 'international' },
      { position: { x: 900, y: 850 }, team: 'international' },
    ],
    objects: [
      // Arena boundaries
      { id: 'wall-north', type: 'wall', position: { x: 0, y: 0 }, size: { x: 1024, y: 20 } },
      { id: 'wall-south', type: 'wall', position: { x: 0, y: 1004 }, size: { x: 1024, y: 20 } },
      { id: 'wall-west', type: 'wall', position: { x: 0, y: 0 }, size: { x: 20, y: 1024 } },
      { id: 'wall-east', type: 'wall', position: { x: 1004, y: 0 }, size: { x: 20, y: 1024 } },

      // Buildings as cover
      { id: 'building-1', type: 'cover', position: { x: 300, y: 300 }, size: { x: 200, y: 200 } },
      { id: 'building-2', type: 'cover', position: { x: 700, y: 300 }, size: { x: 200, y: 200 } },
      { id: 'building-3', type: 'cover', position: { x: 300, y: 700 }, size: { x: 200, y: 200 } },
      { id: 'building-4', type: 'cover', position: { x: 700, y: 700 }, size: { x: 200, y: 200 } },

      // Center objective
      { id: 'obj-center', type: 'objective', position: { x: 512, y: 512 }, size: { x: 100, y: 100 } },
    ],
    objectives: [
      {
        id: 'obj-1',
        type: 'control',
        position: { x: 512, y: 512 },
        radius: 50,
        description: 'Control the central plaza',
      },
    ],
  },

  // Map 2: Forest Ambush
  'forest-ambush': {
    id: 'forest-ambush',
    name: '🌲 Forest Ambush',
    description: 'Dense woodland with natural cover and vertical gameplay',
    size: { x: 1200, y: 1200 },
    difficulty: 'normal',
    environment: 'forest',
    maxPlayers: 12,
    recommendedPlayers: 6,
    lightingType: 'dusk',
    spawnPoints: [
      { position: { x: 150, y: 150 }, team: 'russian' },
      { position: { x: 200, y: 150 }, team: 'russian' },
      { position: { x: 1050, y: 1050 }, team: 'international' },
      { position: { x: 1000, y: 1050 }, team: 'international' },
    ],
    objects: [
      // Boundaries
      { id: 'wall-n', type: 'wall', position: { x: 0, y: 0 }, size: { x: 1200, y: 20 } },
      { id: 'wall-s', type: 'wall', position: { x: 0, y: 1180 }, size: { x: 1200, y: 20 } },
      { id: 'wall-w', type: 'wall', position: { x: 0, y: 0 }, size: { x: 20, y: 1200 } },
      { id: 'wall-e', type: 'wall', position: { x: 1180, y: 0 }, size: { x: 20, y: 1200 } },

      // Trees as cover (scattered)
      { id: 'tree-1', type: 'cover', position: { x: 300, y: 300 }, size: { x: 50, y: 50 } },
      { id: 'tree-2', type: 'cover', position: { x: 600, y: 200 }, size: { x: 50, y: 50 } },
      { id: 'tree-3', type: 'cover', position: { x: 400, y: 500 }, size: { x: 50, y: 50 } },
      { id: 'tree-4', type: 'cover', position: { x: 800, y: 700 }, size: { x: 50, y: 50 } },
      { id: tree-5', type: 'cover', position: { x: 900, y: 400 }, size: { x: 50, y: 50 } },
      { id: 'tree-6', type: 'cover', position: { x: 500, y: 900 }, size: { x: 50, y: 50 } },

      // Hazard: toxic gas
      { id: 'hazard-gas', type: 'hazard', position: { x: 600, y: 600 }, size: { x: 200, y: 200 } },
    ],
    hazards: [
      {
        id: 'gas-1',
        type: 'toxic',
        position: { x: 600, y: 600 },
        radius: 100,
        damage: 5,
        damageInterval: 500,
      },
    ],
  },

  // Map 3: Industrial Complex
  'industrial-complex': {
    id: 'industrial-complex',
    name: '🏭 Industrial Complex',
    description: 'Factory with machinery, tight passages, and hazardous areas',
    size: { x: 1024, y: 1024 },
    difficulty: 'hard',
    environment: 'industrial',
    maxPlayers: 12,
    recommendedPlayers: 8,
    lightingType: 'night',
    spawnPoints: [
      { position: { x: 100, y: 500 }, team: 'russian' },
      { position: { x: 150, y: 500 }, team: 'russian' },
      { position: { x: 900, y: 500 }, team: 'international' },
      { position: { x: 850, y: 500 }, team: 'international' },
    ],
    objects: [
      // Boundaries
      { id: 'wall-n', type: 'wall', position: { x: 0, y: 0 }, size: { x: 1024, y: 20 } },
      { id: 'wall-s', type: 'wall', position: { x: 0, y: 1004 }, size: { x: 1024, y: 20 } },
      { id: 'wall-w', type: 'wall', position: { x: 0, y: 0 }, size: { x: 20, y: 1024 } },
      { id: 'wall-e', type: 'wall', position: { x: 1004, y: 0 }, size: { x: 20, y: 1024 } },

      // Machinery as cover
      { id: 'machine-1', type: 'cover', position: { x: 200, y: 200 }, size: { x: 150, y: 150 } },
      { id: 'machine-2', type: 'cover', position: { x: 800, y: 200 }, size: { x: 150, y: 150 } },
      { id: 'machine-3', type: 'cover', position: { x: 200, y: 800 }, size: { x: 150, y: 150 } },
      { id: 'machine-4', type: 'cover', position: { x: 800, y: 800 }, size: { x: 150, y: 150 } },

      // Hazard: electric area
      { id: 'elec-hazard', type: 'hazard', position: { x: 512, y: 512 }, size: { x: 150, y: 150 } },
    ],
    hazards: [
      {
        id: 'elec-1',
        type: 'electric',
        position: { x: 512, y: 512 },
        radius: 75,
        damage: 10,
        damageInterval: 1000,
      },
    ],
  },

  // Map 4: Desert Stronghold
  'desert-stronghold': {
    id: 'desert-stronghold',
    name: '🏜️ Desert Stronghold',
    description: 'Open desert with minimal cover and fortified positions',
    size: { x: 1500, y: 1500 },
    difficulty: 'hard',
    environment: 'desert',
    maxPlayers: 10,
    recommendedPlayers: 6,
    lightingType: 'day',
    spawnPoints: [
      { position: { x: 200, y: 200 }, team: 'russian' },
      { position: { x: 1300, y: 1300 }, team: 'international' },
    ],
    objects: [
      // Boundaries
      { id: 'wall-n', type: 'wall', position: { x: 0, y: 0 }, size: { x: 1500, y: 20 } },
      { id: 'wall-s', type: 'wall', position: { x: 0, y: 1480 }, size: { x: 1500, y: 20 } },
      { id: 'wall-w', type: 'wall', position: { x: 0, y: 0 }, size: { x: 20, y: 1500 } },
      { id: 'wall-e', type: 'wall', position: { x: 1480, y: 0 }, size: { x: 20, y: 1500 } },

      // Sand dunes (low cover)
      { id: 'dune-1', type: 'cover', position: { x: 300, y: 400 }, size: { x: 100, y: 100 } },
      { id: 'dune-2', type: 'cover', position: { x: 900, y: 300 }, size: { x: 100, y: 100 } },
      { id: 'dune-3', type: 'cover', position: { x: 500, y: 900 }, size: { x: 100, y: 100 } },

      // Fortifications
      { id: 'fort-1', type: 'cover', position: { x: 750, y: 750 }, size: { x: 200, y: 100 } },
    ],
  },

  // Map 5: Arctic Base
  'arctic-base': {
    id: 'arctic-base',
    name: '❄️ Arctic Base',
    description: 'Frozen facility with slippery surfaces and dynamic weather',
    size: { x: 800, y: 800 },
    difficulty: 'easy',
    environment: 'arctic',
    maxPlayers: 8,
    recommendedPlayers: 4,
    lightingType: 'night',
    spawnPoints: [
      { position: { x: 100, y: 100 }, team: 'russian' },
      { position: { x: 700, y: 700 }, team: 'international' },
    ],
    objects: [
      // Boundaries
      { id: 'wall-n', type: 'wall', position: { x: 0, y: 0 }, size: { x: 800, y: 20 } },
      { id: 'wall-s', type: 'wall', position: { x: 0, y: 780 }, size: { x: 800, y: 20 } },
      { id: 'wall-w', type: 'wall', position: { x: 0, y: 0 }, size: { x: 20, y: 800 } },
      { id: 'wall-e', type: 'wall', position: { x: 780, y: 0 }, size: { x: 20, y: 800 } },

      // Ice formations
      { id: 'ice-1', type: 'cover', position: { x: 200, y: 300 }, size: { x: 100, y: 80 } },
      { id: 'ice-2', type: 'cover', position: { x: 600, y: 250 }, size: { x: 100, y: 80 } },
      { id: 'ice-3', type: 'cover', position: { x: 300, y: 600 }, size: { x: 100, y: 80 } },

      // Base structures
      { id: 'base-1', type: 'cover', position: { x: 400, y: 400 }, size: { x: 100, y: 100 } },
    ],
  },
};

/**
 * Get all available maps
 */
export function getAllMaps(): Map[] {
  return Object.values(MAPS);
}

/**
 * Get map by ID
 */
export function getMapById(mapId: string): Map | null {
  return MAPS[mapId] || null;
}

/**
 * Get random map
 */
export function getRandomMap(): Map {
  const maps = getAllMaps();
  return maps[Math.floor(Math.random() * maps.length)];
}

/**
 * Get maps by environment
 */
export function getMapsByEnvironment(env: string): Map[] {
  return getAllMaps().filter((m) => m.environment === env);
}

/**
 * Get maps by difficulty
 */
export function getMapsByDifficulty(difficulty: string): Map[] {
  return getAllMaps().filter((m) => m.difficulty === difficulty);
}
