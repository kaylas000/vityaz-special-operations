import { Injectable, Logger } from '@nestjs/common';
import { MatchmakingQueueDto, MatchFoundDto, RoomGameMode } from '../dto/room-advanced.dto';

export interface QueuedPlayer extends MatchmakingQueueDto {
  queuedAt: number;
  regionCode?: string;
}

export interface MatchmakingStats {
  playerId: string;
  eloRating: number;
  wins: number;
  losses: number;
  totalMatches: number;
  winRate: number;
  lastMatchTime: number;
}

@Injectable()
export class MatchmakingService {
  private readonly logger = new Logger(MatchmakingService.name);
  private playerQueue: Map<string, QueuedPlayer[]> = new Map();
  private playerStats: Map<string, MatchmakingStats> = new Map();
  private readonly SEARCH_RANGE = 100; // ELO range for matching
  private readonly MAX_WAIT_TIME = 30000; // 30 seconds
  private readonly ELO_K_FACTOR = 32; // Standard chess K-factor
  private readonly BASE_ELO = 1000;

  /**
   * Add player to matchmaking queue
   */
  addPlayerToQueue(queueDto: MatchmakingQueueDto): void {
    const gameMode = queueDto.preferredGameMode || RoomGameMode.DEATHMATCH;

    if (!this.playerQueue.has(gameMode)) {
      this.playerQueue.set(gameMode, []);
    }

    const queue = this.playerQueue.get(gameMode)!;
    const existingPlayerIndex = queue.findIndex(
      (p) => p.playerId === queueDto.playerId,
    );

    if (existingPlayerIndex >= 0) {
      this.logger.warn(`Player ${queueDto.playerId} already in queue`);
      return;
    }

    // Initialize stats if new player
    if (!this.playerStats.has(queueDto.playerId)) {
      this.playerStats.set(queueDto.playerId, {
        playerId: queueDto.playerId,
        eloRating: this.BASE_ELO,
        wins: 0,
        losses: 0,
        totalMatches: 0,
        winRate: 0,
        lastMatchTime: 0,
      });
    }

    const queuedPlayer: QueuedPlayer = {
      ...queueDto,
      queuedAt: Date.now(),
      estimatedSkillLevel: this.getPlayerElo(queueDto.playerId),
    };

    queue.push(queuedPlayer);
    this.logger.log(
      `Player ${queueDto.playerId} added to queue for ${gameMode}`,
    );
  }

  /**
   * Remove player from queue
   */
  removePlayerFromQueue(playerId: string, gameMode?: RoomGameMode): void {
    const gameModes = gameMode
      ? [gameMode]
      : Array.from(this.playerQueue.keys());

    for (const mode of gameModes) {
      const queue = this.playerQueue.get(mode);
      if (queue) {
        const index = queue.findIndex((p) => p.playerId === playerId);
        if (index >= 0) {
          queue.splice(index, 1);
          this.logger.log(`Player ${playerId} removed from queue for ${mode}`);
        }
      }
    }
  }

  /**
   * Find matches for waiting players
   */
  findMatches(gameMode: RoomGameMode): MatchedPlayers[] {
    const queue = this.playerQueue.get(gameMode);
    if (!queue || queue.length < 2) {
      return [];
    }

    const matches: MatchedPlayers[] = [];

    // Sort by queue time (FIFO)
    queue.sort((a, b) => a.queuedAt - b.queuedAt);

    const processedPlayers = new Set<string>();

    for (let i = 0; i < queue.length; i++) {
      if (processedPlayers.has(queue[i].playerId)) continue;

      const player1 = queue[i];
      const timeWaited = Date.now() - player1.queuedAt;

      // Expand search range based on wait time
      const searchRange = this.calculateSearchRange(
        timeWaited,
        player1.maxWaitTime || this.MAX_WAIT_TIME,
      );

      const candidates = queue
        .slice(i + 1)
        .filter(
          (p) =>
            !processedPlayers.has(p.playerId) &&
            this.isEloCompatible(player1.estimatedSkillLevel || this.BASE_ELO, p.estimatedSkillLevel || this.BASE_ELO, searchRange),
        );

      if (candidates.length > 0) {
        // Select best match (closest ELO)
        const bestMatch = candidates.reduce((prev, current) =>
          Math.abs(
            (current.estimatedSkillLevel || this.BASE_ELO) -
              (player1.estimatedSkillLevel || this.BASE_ELO),
          ) <
          Math.abs(
            (prev.estimatedSkillLevel || this.BASE_ELO) -
              (player1.estimatedSkillLevel || this.BASE_ELO),
          )
            ? current
            : prev,
        );

        matches.push({
          player1Id: player1.playerId,
          player2Id: bestMatch.playerId,
          matchTime: Date.now(),
        });

        processedPlayers.add(player1.playerId);
        processedPlayers.add(bestMatch.playerId);
      }
    }

    // Remove matched players from queue
    for (const match of matches) {
      this.removePlayerFromQueue(match.player1Id, gameMode);
      this.removePlayerFromQueue(match.player2Id, gameMode);
    }

    return matches;
  }

  /**
   * Record match result and update ELO
   */
  recordMatchResult(
    winnerId: string,
    loserId: string,
  ): { winnerNewElo: number; loserNewElo: number } {
    const winnerStats = this.playerStats.get(winnerId);
    const loserStats = this.playerStats.get(loserId);

    if (!winnerStats || !loserStats) {
      this.logger.error('Player stats not found');
      return { winnerNewElo: 0, loserNewElo: 0 };
    }

    const [newWinnerElo, newLoserElo] = this.calculateEloChange(
      winnerStats.eloRating,
      loserStats.eloRating,
    );

    // Update stats
    winnerStats.eloRating = newWinnerElo;
    winnerStats.wins++;
    winnerStats.totalMatches++;
    winnerStats.lastMatchTime = Date.now();
    winnerStats.winRate = (winnerStats.wins / winnerStats.totalMatches) * 100;

    loserStats.eloRating = newLoserElo;
    loserStats.losses++;
    loserStats.totalMatches++;
    loserStats.lastMatchTime = Date.now();
    loserStats.winRate = (loserStats.wins / loserStats.totalMatches) * 100;

    this.logger.log(
      `Match recorded: ${winnerId} (${newWinnerElo}) vs ${loserId} (${newLoserElo})`,
    );

    return { winnerNewElo: newWinnerElo, loserNewElo: newLoserElo };
  }

  /**
   * Get player's current ELO rating
   */
  getPlayerElo(playerId: string): number {
    return this.playerStats.get(playerId)?.eloRating || this.BASE_ELO;
  }

  /**
   * Get player's matchmaking stats
   */
  getPlayerStats(playerId: string): MatchmakingStats | null {
    return this.playerStats.get(playerId) || null;
  }

  /**
   * Get queue status
   */
  getQueueStatus(gameMode: RoomGameMode): QueueStatus {
    const queue = this.playerQueue.get(gameMode) || [];
    const avgWaitTime =
      queue.length > 0
        ? queue.reduce((sum, p) => sum + (Date.now() - p.queuedAt), 0) /
          queue.length
        : 0;

    return {
      gameMode,
      playersWaiting: queue.length,
      averageWaitTime: Math.round(avgWaitTime),
      estimatedWaitTime: this.estimateWaitTime(queue.length),
    };
  }

  /**
   * Get top players by ELO
   */
  getLeaderboard(limit: number = 100): MatchmakingStats[] {
    return Array.from(this.playerStats.values())
      .sort((a, b) => b.eloRating - a.eloRating)
      .slice(0, limit);
  }

  private isEloCompatible(
    elo1: number,
    elo2: number,
    searchRange: number,
  ): boolean {
    return Math.abs(elo1 - elo2) <= searchRange;
  }

  private calculateSearchRange(
    timeWaited: number,
    maxWaitTime: number,
  ): number {
    // Expand search range as wait time increases
    const waitRatio = Math.min(timeWaited / maxWaitTime, 1);
    return this.SEARCH_RANGE + waitRatio * 200; // Max 300 ELO range
  }

  private calculateEloChange(
    winnerElo: number,
    loserElo: number,
  ): [number, number] {
    const expectedScoreWinner =
      1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
    const expectedScoreLoser = 1 - expectedScoreWinner;

    const newWinnerElo = Math.round(
      winnerElo + this.ELO_K_FACTOR * (1 - expectedScoreWinner),
    );
    const newLoserElo = Math.round(
      loserElo + this.ELO_K_FACTOR * (0 - expectedScoreLoser),
    );

    return [newWinnerElo, newLoserElo];
  }

  private estimateWaitTime(queueLength: number): number {
    // Very rough estimation: assume match takes 2-3 seconds to organize per player
    return Math.max(1000, Math.ceil(queueLength / 10) * 2000);
  }
}

export interface MatchedPlayers {
  player1Id: string;
  player2Id: string;
  matchTime: number;
}

export interface QueueStatus {
  gameMode: RoomGameMode;
  playersWaiting: number;
  averageWaitTime: number;
  estimatedWaitTime: number;
}
