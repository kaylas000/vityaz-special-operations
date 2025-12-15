# 📊 VITYAZ Progress System

## Overview

The Progress System tracks player statistics, achievements, and game sessions with persistent local storage using IndexedDB and localStorage.

## Components

### 1. ProgressManager Service

Core service managing all player progression data.

#### Key Features

- **High Score Tracking**: Automatic tracking and persistence of best score
- **Session Management**: Record detailed game sessions with all metrics
- **Achievements**: Unlock achievements based on gameplay milestones
- **Weapon Statistics**: Per-weapon kill counts, accuracy, damage
- **Wave Statistics**: Track performance across difficulty waves
- **Data Export**: Export statistics as JSON for backups

#### Usage

```typescript
import { getProgressManager } from './services/ProgressManager'

const progressManager = getProgressManager()

// Start new game session
progressManager.startNewSession()

// Update during gameplay
progressManager.updateSessionStats({
  score: 5000,
  kills: 150,
  deaths: 5,
  maxWave: 15,
  weaponStats: {
    'AK-74M': { name: 'AK-74M', kills: 80, shots: 200, accuracy: 75, damage: 2400 },
    'SVD': { name: 'SVD', kills: 50, shots: 80, accuracy: 85, damage: 2000 },
  },
  waveStats: [
    { waveNumber: 1, enemyCount: 5, killCount: 5, timeSpent: 45, difficulty: 1 },
    // ... more waves
  ],
  duration: 180,
})

// End session and save
const session = await progressManager.endSession()
```

### 2. StatsScene

Post-game statistics display screen showing:

- **Score Box**: Total score achieved
- **Kills Display**: Number of kills in session
- **Wave Progress**: Highest wave reached
- **Duration**: Time spent in game
- **Accuracy**: Average weapon accuracy
- **K/D Ratio**: Kill/Death ratio
- **Weapon Stats**: Performance metrics per weapon
- **Achievements**: Recently unlocked achievements
- **Action Buttons**: Play Again / Back to Menu

#### Rendering StatsScene

```typescript
this.scene.start('StatsScene', { session: gameSession })
```

## Achievement System

### Available Achievements

| ID | Name | Description | Points |
|----|------|-------------|--------|
| `first_blood` | 🧛 Первая кровь | Kill first enemy | 10 |
| `wave_5` | 📈 Волна 5 | Reach wave 5 | 25 |
| `wave_10` | 📈 Волна 10 | Reach wave 10 | 50 |
| `wave_20` | 🏖️ Волна 20 | Reach wave 20 | 100 |
| `hundred_kills` | 💯 Сотня | Get 100 kills in one game | 75 |
| `perfect_accuracy` | 🏹 Точный стрелок | Achieve 80%+ accuracy | 50 |
| `survive_minute` | ⏱️ Минута выживания | Survive 1 minute without damage | 30 |
| `high_score_1000` | 🏆 Тысяча очков | Score 1000 points | 50 |

### Achievement Unlock Logic

Achievements are automatically checked and unlocked after each game session. The system checks:

1. **Wave Milestones**: `maxWave >= 5, 10, 20`
2. **Kill Counts**: `kills >= 100`
3. **Accuracy**: Weapon accuracy `>= 80%`
4. **Score Thresholds**: `score >= 1000`
5. **First Blood**: `kills > 0` (first game)

## Data Persistence

### Storage Methods

1. **IndexedDB** (Primary)
   - Stores complete game sessions
   - Supports large datasets
   - Indexed by session ID
   - Automatic cleanup of old sessions (optional)

2. **localStorage** (Secondary)
   - High score (key: `vityaz_highscore`)
   - Settings (key: `vityazSettings`)
   - Unlocked achievements (key: `vityaz_achievements`)
   - Fast access to frequently used data

### Data Structure

```typescript
interface GameSession {
  id: string
  timestamp: number
  duration: number
  score: number
  kills: number
  deaths: number
  maxWave: number
  weaponStats: Record<string, WeaponStat>
  waveStats: WaveStat[]
}

interface WeaponStat {
  name: string
  kills: number
  shots: number
  accuracy: number
  damage: number
}
```

## API Reference

### ProgressManager Methods

#### `startNewSession(): void`
Initialize a new game session.

#### `updateSessionStats(stats: GameStats): void`
Update current session with game statistics.

#### `endSession(): Promise<GameSession | null>`
Finalize session, save to storage, and check achievements.

#### `getHighScore(): number`
Retrieve current high score from localStorage.

#### `getAllSessions(): Promise<GameSession[]>`
Fetch all saved sessions from IndexedDB.

#### `getPlayerStats(): Promise<PlayerStats>`
Calculate aggregate player statistics:
- Total sessions played
- Total kills/deaths
- Average score and wave
- Most used weapon
- Unlocked achievements

#### `getUnlockedAchievements(): Achievement[]`
Get list of all unlocked achievements.

#### `getAllAchievements(): Achievement[]`
Get all available achievements (locked and unlocked).

#### `getAchievementProgress(): number`
Get completion percentage (0-100).

#### `getRecentSessions(count: number): Promise<GameSession[]>`
Fetch last N sessions.

#### `exportStats(): Promise<string>`
Export all statistics as JSON string.

#### `clearAllData(): Promise<void>`
Wipe all saved data (for testing/reset).

## Integration Guide

### Step 1: Initialize Progress Manager

```typescript
import { getProgressManager } from './services/ProgressManager'

const progressManager = getProgressManager()
```

### Step 2: Start Tracking Game

In game start (CompleteGameScene.create):

```typescript
progressManager.startNewSession()
```

### Step 3: Update Stats During Gameplay

In game loop or at regular intervals:

```typescript
progressManager.updateSessionStats({
  score: this.score,
  kills: this.playerKills,
  deaths: this.playerDeaths,
  maxWave: this.currentWave,
  weaponStats: this.getWeaponStats(),
  waveStats: this.getWaveStats(),
  duration: this.gameTime,
})
```

### Step 4: Handle Game Over

When player dies:

```typescript
const session = await progressManager.endSession()
this.scene.start('StatsScene', { session })
```

## Statistics Dashboard (Future)

Planned features:
- Overall statistics screen
- Leaderboard (local)
- Statistics comparison graphs
- Session replay data
- Seasonal leaderboards

## Performance Notes

- IndexedDB operations are asynchronous (non-blocking)
- localStorage is synchronous (fast, limited size)
- Session data is cached in memory during gameplay
- Achievements are checked only at session end
- Maximum 100 sessions stored by default (configurable)

## Testing

### Clear All Data

```typescript
await progressManager.clearAllData()
```

### Export Statistics

```typescript
const json = await progressManager.exportStats()
console.log(json)
```

### Check Achievement Progress

```typescript
const progress = progressManager.getAchievementProgress()
console.log(`${progress}% achievements unlocked`)
```

## Future Enhancements

- [ ] Cloud save sync (Firebase, Supabase)
- [ ] Multiplayer leaderboards
- [ ] Season-based progression
- [ ] Battle pass integration
- [ ] Special events and limited-time achievements
- [ ] Weapon mastery tracking
- [ ] Map-specific statistics
- [ ] Replay system
- [ ] Statistics sharing/comparison

## Security Considerations

- All data is stored locally (no server communication by default)
- No sensitive information in localStorage
- Achievement unlocking verified client-side
- Consider server-side validation for multiplayer

---

**Last Updated**: December 15, 2025  
**Status**: ✅ Complete
