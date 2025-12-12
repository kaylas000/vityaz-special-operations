/**
 * Server-side Combat Engine
 * Validates all client actions and applies anti-cheat measures
 */

import { Injectable } from '@nestjs/common'

interface BulletTrajectory {
  startX: number
  startY: number
  endX: number
  endY: number
  timestamp: number
}

interface PlayerShot {
  playerId: string
  timestamp: number
  position: { x: number; y: number }
  trajectory: BulletTrajectory
  hitPlayers: string[]
}

@Injectable()
export class CombatEngineService {
  private recentShots: Map<string, PlayerShot[]> = new Map()
  private readonly MAX_SHOTS_PER_SECOND = 15 // Fire rate limiter
  private readonly SHOT_HISTORY_MS = 1000

  /**
   * Validate and process player shot
   */
  validateShot(
    playerId: string,
    position: { x: number; y: number },
    trajectory: BulletTrajectory,
  ): { valid: boolean; reason?: string } {
    // Get player's recent shots
    const now = Date.now()
    let shots = this.recentShots.get(playerId) || []

    // Remove shots older than 1 second
    shots = shots.filter((s) => now - s.timestamp < this.SHOT_HISTORY_MS)

    // Check fire rate
    if (shots.length >= this.MAX_SHOTS_PER_SECOND) {
      return { valid: false, reason: 'Fire rate exceeded (possible cheat)' }
    }

    // Check for impossible trajectory
    if (!this.isValidTrajectory(trajectory)) {
      return { valid: false, reason: 'Invalid trajectory (possible cheat)' }
    }

    // Check for position teleport
    if (shots.length > 0) {
      const lastShot = shots[shots.length - 1]
      const distance = Math.sqrt(
        Math.pow(position.x - lastShot.position.x, 2) +
          Math.pow(position.y - lastShot.position.y, 2),
      )
      const timeDiff = (now - lastShot.timestamp) / 1000 // seconds
      const maxPossibleDistance = timeDiff * 500 // Max player speed

      if (distance > maxPossibleDistance) {
        return { valid: false, reason: 'Position teleport detected (possible cheat)' }
      }
    }

    // Store validated shot
    const shot: PlayerShot = {
      playerId,
      timestamp: now,
      position,
      trajectory,
      hitPlayers: [],
    }

    shots.push(shot)
    this.recentShots.set(playerId, shots)

    return { valid: true }
  }

  /**
   * Check if trajectory is physically possible
   */
  private isValidTrajectory(trajectory: BulletTrajectory): boolean {
    const distance = Math.sqrt(
      Math.pow(trajectory.endX - trajectory.startX, 2) +
        Math.pow(trajectory.endY - trajectory.startY, 2),
    )

    // Bullets travel at ~400 px/s, max reasonable distance per frame
    const maxDistance = 1000

    return distance <= maxDistance && distance >= 0
  }

  /**
   * Calculate damage with armor
   */
  calculateDamage(
    weaponType: string,
    distance: number,
    bodyPart: 'head' | 'chest' | 'legs',
    targetArmor: number,
  ): number {
    // Base weapon damages
    const weaponDamages: Record<string, number> = {
      'AK-74M': 33,
      SVD: 95,
      PN: 25,
    }

    let damage = weaponDamages[weaponType] || 25

    // Distance falloff
    const distanceMultiplier = Math.max(0.3, 1 - distance / 1000)
    damage *= distanceMultiplier

    // Body part multiplier
    const bodyPartMultipliers: Record<string, number> = {
      head: 4,
      chest: 1,
      legs: 0.75,
    }
    damage *= bodyPartMultipliers[bodyPart] || 1

    // Armor reduction
    const armorReduction = Math.min(targetArmor / 100, 0.8) // Max 80% reduction
    damage *= 1 - armorReduction

    return Math.round(damage)
  }

  /**
   * Detect suspicious behavior
   */
  detectCheat(playerId: string): string[] {
    const cheats: string[] = []
    const shots = this.recentShots.get(playerId) || []

    if (shots.length === 0) return cheats

    // Check for perfect aim (all headshots)
    const headshots = shots.filter((s) => s.hitPlayers.length > 0).length
    if (headshots > 20 && headshots === shots.length) {
      cheats.push('Suspicious: 100% headshot rate')
    }

    // Check for aim assistance pattern
    if (shots.length >= 5) {
      let consistentPattern = true
      for (let i = 1; i < Math.min(5, shots.length); i++) {
        const angle1 = Math.atan2(
          shots[i - 1].trajectory.endY - shots[i - 1].trajectory.startY,
          shots[i - 1].trajectory.endX - shots[i - 1].trajectory.startX,
        )
        const angle2 = Math.atan2(
          shots[i].trajectory.endY - shots[i].trajectory.startY,
          shots[i].trajectory.endX - shots[i].trajectory.startX,
        )

        // If all angles are nearly identical, suspicious
        if (Math.abs(angle1 - angle2) > 0.1) {
          consistentPattern = false
          break
        }
      }

      if (consistentPattern) {
        cheats.push('Suspicious: Perfect aim pattern detected')
      }
    }

    return cheats
  }

  /**
   * Clear old shots to prevent memory leak
   */
  cleanup() {
    const now = Date.now()
    for (const [playerId, shots] of this.recentShots.entries()) {
      const recentShots = shots.filter((s) => now - s.timestamp < 60000) // 60s history
      if (recentShots.length === 0) {
        this.recentShots.delete(playerId)
      } else {
        this.recentShots.set(playerId, recentShots)
      }
    }
  }
}
