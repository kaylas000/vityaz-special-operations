/**
 * ProgressManager - Manages game statistics and player progression
 * Handles: High scores, kill stats, weapon usage, achievements
 * Persistence: localStorage + IndexedDB (for large datasets)
 */

export interface GameSession {
  id: string
  timestamp: number
  duration: number // in seconds
  score: number
  kills: number
  deaths: number
  maxWave: number
  weaponStats: Record<string, WeaponStat>
  waveStats: WaveStat[]
}

export interface WeaponStat {
  name: string
  kills: number
  shots: number
  accuracy: number // percentage
  damage: number
}

export interface WaveStat {
  waveNumber: number
  enemyCount: number
  killCount: number
  timeSpent: number // seconds
  difficulty: number
}

export interface PlayerStats {
  totalSessions: number
  totalKills: number
  totalDeaths: number
  totalPlayTime: number // seconds
  highScore: number
  averageScore: number
  averageWave: number
  favoriteWeapon: string
  achievements: Achievement[]
}

export interface Achievement {
  id: string
  name: string
  description: string
  unlockedAt?: number // timestamp
  points: number
}

export class ProgressManager {
  private static readonly DB_NAME = 'VITYAZ_GameDB'
  private static readonly STORE_NAME = 'sessions'
  private static readonly STATS_KEY = 'vityaz_stats'
  private static readonly ACHIEVEMENTS_KEY = 'vityaz_achievements'

  private db: IDBDatabase | null = null
  private sessionCache: GameSession | null = null

  // Predefined achievements
  private static readonly ACHIEVEMENTS: Achievement[] = [
    {
      id: 'first_blood',
      name: '🩸 Первая кровь',
      description: 'Убить первого врага',
      points: 10,
    },
    {
      id: 'wave_5',
      name: '📈 Волна 5',
      description: 'Достичь волны 5',
      points: 25,
    },
    {
      id: 'wave_10',
      name: '📈 Волна 10',
      description: 'Достичь волны 10',
      points: 50,
    },
    {
      id: 'wave_20',
      name: '🎖️ Волна 20',
      description: 'Достичь волны 20',
      points: 100,
    },
    {
      id: 'hundred_kills',
      name: '💯 Сотня',
      description: 'Получить 100 убийств в одной игре',
      points: 75,
    },
    {
      id: 'perfect_accuracy',
      name: '🎯 Точный стрелок',
      description: 'Достичь 80% точности с оружием',
      points: 50,
    },
    {
      id: 'survive_minute',
      name: '⏱️ Минута выживания',
      description: 'Пройти 1 минуту без урона',
      points: 30,
    },
    {
      id: 'high_score_1000',
      name: '🏆 Тысяча очков',
      description: 'Набрать 1000 очков',
      points: 50,
    },
  ]

  constructor() {
    this.initializeDB()
  }

  /**
   * Initialize IndexedDB
   */
  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(ProgressManager.DB_NAME, 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(ProgressManager.STORE_NAME)) {
          db.createObjectStore(ProgressManager.STORE_NAME, { keyPath: 'id' })
        }
      }
    })
  }

  /**
   * Create a new game session
   */
  public startNewSession(): void {
    this.sessionCache = {
      id: this.generateSessionId(),
      timestamp: Date.now(),
      duration: 0,
      score: 0,
      kills: 0,
      deaths: 0,
      maxWave: 1,
      weaponStats: {},
      waveStats: [],
    }
  }

  /**
   * Update current session with game stats
   */
  public updateSessionStats(stats: {
    score: number
    kills: number
    deaths: number
    maxWave: number
    weaponStats: Record<string, WeaponStat>
    waveStats: WaveStat[]
    duration: number
  }): void {
    if (!this.sessionCache) return

    this.sessionCache.score = stats.score
    this.sessionCache.kills = stats.kills
    this.sessionCache.deaths = stats.deaths
    this.sessionCache.maxWave = stats.maxWave
    this.sessionCache.weaponStats = stats.weaponStats
    this.sessionCache.waveStats = stats.waveStats
    this.sessionCache.duration = stats.duration
  }

  /**
   * End current session and save to storage
   */
  public async endSession(): Promise<GameSession | null> {
    if (!this.sessionCache) return null

    const session = this.sessionCache
    this.sessionCache = null

    // Save to IndexedDB
    if (this.db) {
      await this.saveSessionToIDB(session)
    }

    // Update high score in localStorage
    this.updateHighScore(session.score)

    // Check and unlock achievements
    await this.checkAchievements(session)

    return session
  }

  /**
   * Save session to IndexedDB
   */
  private async saveSessionToIDB(session: GameSession): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([ProgressManager.STORE_NAME], 'readwrite')
      const store = transaction.objectStore(ProgressManager.STORE_NAME)
      const request = store.add(session)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  /**
   * Update high score
   */
  private updateHighScore(score: number): void {
    const current = localStorage.getItem('vityaz_highscore')
    const currentScore = current ? parseInt(current) : 0

    if (score > currentScore) {
      localStorage.setItem('vityaz_highscore', score.toString())
    }
  }

  /**
   * Get high score
   */
  public getHighScore(): number {
    const score = localStorage.getItem('vityaz_highscore')
    return score ? parseInt(score) : 0
  }

  /**
   * Get all saved sessions
   */
  public async getAllSessions(): Promise<GameSession[]> {
    if (!this.db) return []

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([ProgressManager.STORE_NAME], 'readonly')
      const store = transaction.objectStore(ProgressManager.STORE_NAME)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || [])
    })
  }

  /**
   * Get player statistics summary
   */
  public async getPlayerStats(): Promise<PlayerStats> {
    const sessions = await this.getAllSessions()

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalKills: 0,
        totalDeaths: 0,
        totalPlayTime: 0,
        highScore: 0,
        averageScore: 0,
        averageWave: 0,
        favoriteWeapon: 'N/A',
        achievements: [],
      }
    }

    let totalKills = 0
    let totalDeaths = 0
    let totalPlayTime = 0
    let totalScore = 0
    let totalWave = 0
    const weaponKills: Record<string, number> = {}

    for (const session of sessions) {
      totalKills += session.kills
      totalDeaths += session.deaths
      totalPlayTime += session.duration
      totalScore += session.score
      totalWave += session.maxWave

      // Track favorite weapon
      for (const [weapon, stat] of Object.entries(session.weaponStats)) {
        weaponKills[weapon] = (weaponKills[weapon] || 0) + stat.kills
      }
    }

    const favoriteWeapon =
      Object.entries(weaponKills).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'

    const achievements = this.getUnlockedAchievements()

    return {
      totalSessions: sessions.length,
      totalKills,
      totalDeaths,
      totalPlayTime,
      highScore: this.getHighScore(),
      averageScore: Math.round(totalScore / sessions.length),
      averageWave: Math.round(totalWave / sessions.length),
      favoriteWeapon,
      achievements,
    }
  }

  /**
   * Check and unlock achievements
   */
  private async checkAchievements(session: GameSession): Promise<void> {
    const achievements = this.getUnlockedAchievements()
    const unlockedIds = new Set(achievements.map((a) => a.id))

    // First blood
    if (session.kills > 0 && !unlockedIds.has('first_blood')) {
      this.unlockAchievement('first_blood')
    }

    // Wave milestones
    if (session.maxWave >= 5 && !unlockedIds.has('wave_5')) {
      this.unlockAchievement('wave_5')
    }
    if (session.maxWave >= 10 && !unlockedIds.has('wave_10')) {
      this.unlockAchievement('wave_10')
    }
    if (session.maxWave >= 20 && !unlockedIds.has('wave_20')) {
      this.unlockAchievement('wave_20')
    }

    // Hundred kills
    if (session.kills >= 100 && !unlockedIds.has('hundred_kills')) {
      this.unlockAchievement('hundred_kills')
    }

    // Perfect accuracy (80%+)
    const accurateWeapons = Object.values(session.weaponStats).filter((w) => w.accuracy >= 80)
    if (accurateWeapons.length > 0 && !unlockedIds.has('perfect_accuracy')) {
      this.unlockAchievement('perfect_accuracy')
    }

    // High score 1000
    if (session.score >= 1000 && !unlockedIds.has('high_score_1000')) {
      this.unlockAchievement('high_score_1000')
    }
  }

  /**
   * Unlock achievement
   */
  private unlockAchievement(achievementId: string): void {
    const achievements = this.getUnlockedAchievements()
    const achievement = ProgressManager.ACHIEVEMENTS.find((a) => a.id === achievementId)

    if (achievement && !achievements.find((a) => a.id === achievementId)) {
      const unlockedAchievement = {
        ...achievement,
        unlockedAt: Date.now(),
      }
      achievements.push(unlockedAchievement)
      localStorage.setItem(
        ProgressManager.ACHIEVEMENTS_KEY,
        JSON.stringify(achievements)
      )
    }
  }

  /**
   * Get all unlocked achievements
   */
  public getUnlockedAchievements(): Achievement[] {
    const stored = localStorage.getItem(ProgressManager.ACHIEVEMENTS_KEY)
    return stored ? JSON.parse(stored) : []
  }

  /**
   * Get all available achievements
   */
  public getAllAchievements(): Achievement[] {
    return ProgressManager.ACHIEVEMENTS
  }

  /**
   * Get achievement progress percentage
   */
  public getAchievementProgress(): number {
    const unlocked = this.getUnlockedAchievements().length
    const total = ProgressManager.ACHIEVEMENTS.length
    return Math.round((unlocked / total) * 100)
  }

  /**
   * Clear all data (for testing)
   */
  public async clearAllData(): Promise<void> {
    localStorage.removeItem('vityaz_highscore')
    localStorage.removeItem(ProgressManager.ACHIEVEMENTS_KEY)
    localStorage.removeItem('vityazSettings')

    if (this.db) {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([ProgressManager.STORE_NAME], 'readwrite')
        const store = transaction.objectStore(ProgressManager.STORE_NAME)
        const request = store.clear()

        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      })
    }
  }

  /**
   * Export stats as JSON
   */
  public async exportStats(): Promise<string> {
    const sessions = await this.getAllSessions()
    const playerStats = await this.getPlayerStats()
    const achievements = this.getUnlockedAchievements()

    const exportData = {
      exportDate: new Date().toISOString(),
      playerStats,
      achievements,
      sessionCount: sessions.length,
      sessions: sessions.slice(-10), // Last 10 sessions
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * Get recent sessions (last N)
   */
  public async getRecentSessions(count: number = 5): Promise<GameSession[]> {
    const sessions = await this.getAllSessions()
    return sessions.slice(-count).reverse()
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Singleton instance
let progressManagerInstance: ProgressManager | null = null

export function getProgressManager(): ProgressManager {
  if (!progressManagerInstance) {
    progressManagerInstance = new ProgressManager()
  }
  return progressManagerInstance
}
