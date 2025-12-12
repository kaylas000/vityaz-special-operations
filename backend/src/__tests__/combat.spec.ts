import { describe, it, expect, beforeEach } from '@jest/globals';
import { CombatService } from '../modules/combat/combat.service';

describe('CombatService', () => {
  let combatService: CombatService;

  beforeEach(() => {
    combatService = new CombatService();
  });

  describe('calculateDamage', () => {
    it('should calculate base damage correctly', () => {
      const damage = combatService.calculateDamage({
        baseDamage: 25,
        distance: 5,
        bodyPart: 'torso',
        armor: 0,
      });
      expect(damage).toBe(25);
    });

    it('should apply distance modifier', () => {
      const damage = combatService.calculateDamage({
        baseDamage: 25,
        distance: 15,
        bodyPart: 'torso',
        armor: 0,
      });
      expect(damage).toBeLessThan(25);
    });

    it('should apply body part multiplier for headshot', () => {
      const bodyDamage = combatService.calculateDamage({
        baseDamage: 25,
        distance: 5,
        bodyPart: 'torso',
        armor: 0,
      });
      const headDamage = combatService.calculateDamage({
        baseDamage: 25,
        distance: 5,
        bodyPart: 'head',
        armor: 0,
      });
      expect(headDamage).toBeGreaterThan(bodyDamage);
    });

    it('should reduce damage with armor', () => {
      const noDamage = combatService.calculateDamage({
        baseDamage: 25,
        distance: 5,
        bodyPart: 'torso',
        armor: 0,
      });
      const armoredDamage = combatService.calculateDamage({
        baseDamage: 25,
        distance: 5,
        bodyPart: 'torso',
        armor: 10,
      });
      expect(armoredDamage).toBeLessThan(noDamage);
    });

    it('should not exceed 100% damage reduction', () => {
      const damage = combatService.calculateDamage({
        baseDamage: 25,
        distance: 5,
        bodyPart: 'torso',
        armor: 100,
      });
      expect(damage).toBeGreaterThan(0);
    });
  });

  describe('calculateReward', () => {
    it('should reward kill correctly', () => {
      const reward = combatService.calculateReward({
        type: 'kill',
        playerLevel: 5,
        victimLevel: 5,
      });
      expect(reward).toBeGreaterThan(0);
    });

    it('should give more reward for higher level kills', () => {
      const lowReward = combatService.calculateReward({
        type: 'kill',
        playerLevel: 5,
        victimLevel: 5,
      });
      const highReward = combatService.calculateReward({
        type: 'kill',
        playerLevel: 5,
        victimLevel: 10,
      });
      expect(highReward).toBeGreaterThan(lowReward);
    });
  });
});
