import express, { Express, Request, Response } from 'express';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ============================================================================
// DATABASE - In-Memory (Production: upgrade to PostgreSQL)
// ============================================================================

interface Player {
  id: string;
  name: string;
  score: number;
  kills: number;
  deaths: number;
  level: number;
  joinedAt: Date;
  lastActive: Date;
  socketId?: string;
}

interface GameRoom {
  id: string;
  name: string;
  players: Player[];
  maxPlayers: number;
  wave: number;
  isActive: boolean;
  createdAt: Date;
}

interface GameState {
  players: Map<string, Player>;
  rooms: Map<string, GameRoom>;
  leaderboard: Player[];
  activeGames: number;
}

const gameState: GameState = {
  players: new Map(),
  rooms: new Map(),
  leaderboard: [],
  activeGames: 0
};

// ============================================================================
// REST API ENDPOINTS
// ============================================================================

/**
 * GET /api/health - Проверка здоровья сервера
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    activePlayers: gameState.players.size,
    activeGames: gameState.activeGames,
    uptime: process.uptime()
  });
});

/**
 * GET /api/players - Получить всех игроков
 */
app.get('/api/players', (req: Request, res: Response) => {
  const players = Array.from(gameState.players.values());
  res.json({
    count: players.length,
    players: players.map(p => ({
      id: p.id,
      name: p.name,
      score: p.score,
      kills: p.kills,
      level: p.level
    }))
  });
});

/**
 * GET /api/leaderboard - Получить таблицу лидеров
 */
app.get('/api/leaderboard', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 100;
  const leaderboard = Array.from(gameState.players.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((p, index) => ({
      rank: index + 1,
      name: p.name,
      score: p.score,
      kills: p.kills,
      level: p.level
    }));

  res.json({ leaderboard });
});

/**
 * POST /api/players - Создать нового игрока
 */
app.post('/api/players', (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  const player: Player = {
    id: 'player-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
    name,
    score: 0,
    kills: 0,
    deaths: 0,
    level: 1,
    joinedAt: new Date(),
    lastActive: new Date()
  };

  gameState.players.set(player.id, player);

  res.status(201).json({
    success: true,
    player: {
      id: player.id,
      name: player.name,
      score: player.score
    }
  });
});

/**
 * GET /api/players/:playerId - Получить информацию об игроке
 */
app.get('/api/players/:playerId', (req: Request, res: Response) => {
  const player = gameState.players.get(req.params.playerId);

  if (!player) {
    res.status(404).json({ error: 'Player not found' });
    return;
  }

  res.json({
    id: player.id,
    name: player.name,
    score: player.score,
    kills: player.kills,
    deaths: player.deaths,
    level: player.level,
    joinedAt: player.joinedAt,
    lastActive: player.lastActive
  });
});

/**
 * POST /api/rooms - Создать новую игровую комнату
 */
app.post('/api/rooms', (req: Request, res: Response) => {
  const { name, maxPlayers } = req.body;

  const room: GameRoom = {
    id: 'room-' + Date.now(),
    name: name || 'New Game',
    players: [],
    maxPlayers: maxPlayers || 4,
    wave: 1,
    isActive: false,
    createdAt: new Date()
  };

  gameState.rooms.set(room.id, room);

  res.status(201).json({
    success: true,
    room: {
      id: room.id,
      name: room.name,
      maxPlayers: room.maxPlayers,
      createdAt: room.createdAt
    }
  });
});

/**
 * GET /api/rooms - Получить все комнаты
 */
app.get('/api/rooms', (req: Request, res: Response) => {
  const rooms = Array.from(gameState.rooms.values()).map(r => ({
    id: r.id,
    name: r.name,
    players: r.players.length,
    maxPlayers: r.maxPlayers,
    wave: r.wave,
    isActive: r.isActive
  }));

  res.json({ rooms });
});

// ============================================================================
// WEBSOCKET EVENTS
// ============================================================================

io.on('connection', (socket: Socket) => {
  console.log(`🎮 Player connected: ${socket.id}`);

  /**
   * Player joined the game
   */
  socket.on('playerJoined', (data: any) => {
    const player = gameState.players.get(data.playerId);

    if (player) {
      player.socketId = socket.id;
      player.lastActive = new Date();
      console.log(`✅ Player ${player.name} joined`);

      // Broadcast to all clients
      io.emit('playerCountUpdate', {
        count: gameState.players.size
      });
    }
  });

  /**
   * Player update
   */
  socket.on('playerUpdate', (data: any) => {
    const player = gameState.players.get(data.playerId);

    if (player) {
      player.lastActive = new Date();
      // Broadcast to room
      socket.broadcast.emit('playerStateUpdate', {
        playerId: player.id,
        x: data.x,
        y: data.y,
        health: data.health,
        score: data.score
      });
    }
  });

  /**
   * Enemy killed
   */
  socket.on('enemyKilled', (data: any) => {
    const player = gameState.players.get(data.playerId);

    if (player) {
      player.score += data.score;
      player.kills++;
      player.level = Math.floor(player.score / 1000) + 1;

      // Update leaderboard
      gameState.leaderboard = Array.from(gameState.players.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 100);

      // Broadcast
      io.emit('leaderboardUpdate', {
        playerId: player.id,
        newScore: player.score,
        newKills: player.kills,
        newLevel: player.level
      });
    }
  });

  /**
   * Player died
   */
  socket.on('playerDied', (data: any) => {
    const player = gameState.players.get(data.playerId);

    if (player) {
      player.deaths++;

      io.emit('playerDeathEvent', {
        playerId: player.id,
        playerName: player.name,
        score: player.score,
        kills: player.kills
      });
    }
  });

  /**
   * Wave progression
   */
  socket.on('waveCompleted', (data: any) => {
    io.emit('waveUpdate', {
      wave: data.wave,
      enemyCount: data.enemyCount,
      difficulty: data.difficulty
    });
  });

  /**
   * Spawn enemy (triggered by backend)
   */
  socket.on('requestEnemySpawn', (data: any) => {
    // Backend spawns enemy for all players
    io.emit('enemySpawned', {
      x: Math.random() * 800 + 100,
      y: Math.random() * 600 + 100,
      type: Math.floor(Math.random() * 4)
    });
  });

  /**
   * Chat message
   */
  socket.on('chatMessage', (data: any) => {
    const player = gameState.players.get(data.playerId);

    if (player) {
      io.emit('chatMessage', {
        playerId: player.id,
        playerName: player.name,
        message: data.message,
        timestamp: new Date()
      });
    }
  });

  /**
   * Player disconnected
   */
  socket.on('disconnect', () => {
    // Find and remove player
    for (const [id, player] of gameState.players.entries()) {
      if (player.socketId === socket.id) {
        console.log(`❌ Player ${player.name} disconnected`);
        gameState.players.delete(id);

        io.emit('playerCountUpdate', {
          count: gameState.players.size
        });
        break;
      }
    }
  });
});

// ============================================================================
// GAME LOGIC ENGINE
// ============================================================================

class GameEngine {
  private io: SocketIOServer;
  private waveInterval: NodeJS.Timer | null = null;
  private enemySpawnInterval: NodeJS.Timer | null = null;
  private currentWave = 1;

  constructor(socketIO: SocketIOServer) {
    this.io = socketIO;
  }

  start() {
    console.log('🎮 Game Engine started');

    // Spawn enemies every 2 seconds
    this.enemySpawnInterval = setInterval(() => {
      this.spawnEnemy();
    }, 2000);

    // Wave progression every 30 seconds
    this.waveInterval = setInterval(() => {
      this.progressWave();
    }, 30000);
  }

  private spawnEnemy() {
    if (gameState.activeGames === 0) return;

    const enemyType = Math.floor(Math.random() * Math.min(4, this.currentWave));
    this.io.emit('enemySpawned', {
      x: Math.random() * 800 + 100,
      y: Math.random() * 600 + 100,
      type: enemyType
    });
  }

  private progressWave() {
    this.currentWave++;
    this.io.emit('waveUpdate', {
      wave: this.currentWave,
      enemyCount: 5 + this.currentWave * 2
    });
  }

  stop() {
    if (this.waveInterval) clearInterval(this.waveInterval);
    if (this.enemySpawnInterval) clearInterval(this.enemySpawnInterval);
  }
}

const gameEngine = new GameEngine(io);

// ============================================================================
// SERVER STARTUP
// ============================================================================

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🚀 VITYAZ Server started on http://localhost:${PORT}`);
  console.log(`${'='.repeat(70)}`);
  console.log(`\n📊 Server Information:`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   WebSocket: enabled`);
  console.log(`   CORS: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`   Database: In-Memory (upgrade to PostgreSQL)`);
  console.log(`   Cache: Ready (upgrade to Redis)`);
  console.log(`\n🎮 Game Engine: ${process.env.ENABLE_GAME_ENGINE !== 'false' ? 'Active' : 'Disabled'}`);
  console.log(`\n📝 API Endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/players`);
  console.log(`   POST /api/players`);
  console.log(`   GET  /api/players/:playerId`);
  console.log(`   GET  /api/leaderboard`);
  console.log(`   GET  /api/rooms`);
  console.log(`   POST /api/rooms`);
  console.log(`\n${'='.repeat(70)}\n`);

  // Start game engine if enabled
  if (process.env.ENABLE_GAME_ENGINE !== 'false') {
    gameEngine.start();
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM received. Shutting down gracefully...');
  gameEngine.stop();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default server;
