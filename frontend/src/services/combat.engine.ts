/**
 * Combat Engine - Handles damage calculations, hit detection, and weapon mechanics
 */

interface WeaponStats {
  baseDamage: number
  fireRate: number // shots per minute
  accuracy: number // 0-100
  armorPenetration: number // 0-100
  recoil: number
  headshotMultiplier: number
}

interface DamageContext {
  distance: 'close' | 'medium' | 'far'
  bodyPart: 'head' | 'chest' | 'legs'
  weaponType: string
  targetArmor: number
}

export class CombatEngine {
  private weaponStats: Map<string, WeaponStats> = new Map([
    [
      'AK-74M',
      {
        baseDamage: 33,
        fireRate: 600,
        accuracy: 85,
        armorPenetration: 75,
        recoil: 25,
        headshotMultiplier: 4,
      },
    ],
    [
      'SVD',
      {
        baseDamage: 95,
        fireRate: 300,
        accuracy: 95,
        armorPenetration: 90,
        recoil: 40,
        headshotMultiplier: 5,
      },
    ],
    [
      'PN',
      {
        baseDamage: 25,
        fireRate: 450,
        accuracy: 70,
        armorPenetration: 50,
        recoil: 15,
        headshotMultiplier: 3,
      },
    ],
  ])

  /**
   * Calculate damage with all modifiers
   */
  calculateDamage(
    weaponType: string,
    distance: 'close' | 'medium' | 'far',
    bodyPart: 'head' | 'chest' | 'legs' = 'chest',
    targetArmor: number = 0,
  ): number {
    const weapon = this.weaponStats.get(weaponType)
    if (!weapon) return 0

    let damage = weapon.baseDamage

    // Distance modifier
    const distanceModifier = this.getDistanceModifier(distance)
    damage *= distanceModifier

    // Body part modifier
    const bodyPartModifier = this.getBodyPartModifier(bodyPart, weapon)
    damage *= bodyPartModifier

    // Armor reduction
    const armorReduction = this.calculateArmorReduction(
      targetArmor,
      weapon.armorPenetration,
    )
    damage *= 1 - armorReduction

    return Math.round(damage)
  }

  /**
   * Distance modifier (falloff)
   */
  private getDistanceModifier(distance: string): number {
    switch (distance) {
      case 'close':
        return 1.2 // +20% at close range
      case 'medium':
        return 1.0 // No modifier
      case 'far':
        return 0.7 // -30% at far range
      default:
        return 1.0
    }
  }

  /**
   * Body part multiplier
   */
  private getBodyPartModifier(bodyPart: string, weapon: WeaponStats): number {
    switch (bodyPart) {
      case 'head':
        return weapon.headshotMultiplier // 3-5x damage
      case 'chest':
        return 1.0 // No modifier (default)
      case 'legs':
        return 0.75 // -25% damage
      default:
        return 1.0
    }
  }

  /**
   * Armor damage reduction
   */
  private calculateArmorReduction(
    armorLevel: number,
    armorPenetration: number,
  ): number {
    // Armor reduces damage by (armor_level - penetration) / 100
    const reduction = Math.max(0, armorLevel - armorPenetration) / 100
    return Math.min(reduction, 0.8) // Max 80% reduction
  }

  /**
   * Calculate hit chance
   */
  calculateHitChance(
    weaponAccuracy: number,
    playerSkill: number = 50,
    isMoving: boolean = false,
  ): number {
    let chance = (weaponAccuracy + playerSkill) / 2

    if (isMoving) {
      chance *= 0.5 // 50% penalty for moving
    }

    return Math.min(chance, 99) // Max 99% to avoid guaranteed hits
  }

  /**
   * Calculate recoil
   */
  calculateRecoil(weaponType: string): number {
    const weapon = this.weaponStats.get(weaponType)
    if (!weapon) return 0

    return weapon.recoil
  }

  /**
   * Get fire rate in milliseconds between shots
   */
  getFireRateMs(weaponType: string): number {
    const weapon = this.weaponStats.get(weaponType)
    if (!weapon) return 100

    return (60 / weapon.fireRate) * 1000 // Convert RPM to ms
  }

  /**
   * Simulate a shot
   */
  simulateShot(context: DamageContext): { hit: boolean; damage: number } {
    const weapon = this.weaponStats.get(context.weaponType)
    if (!weapon) return { hit: false, damage: 0 }

    // Calculate hit chance (skill modifier is random 40-100)
    const playerSkill = Math.random() * 60 + 40
    const hitChance = this.calculateHitChance(
      weapon.accuracy,
      playerSkill,
      false,
    )

    const isHit = Math.random() * 100 < hitChance

    if (!isHit) {
      return { hit: false, damage: 0 }
    }

    const damage = this.calculateDamage(
      context.weaponType,
      context.distance,
      context.bodyPart,
      context.targetArmor,
    )

    return { hit: true, damage }
  }
}
