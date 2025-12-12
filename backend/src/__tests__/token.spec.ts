import { describe, it, expect, beforeEach } from '@jest/globals';
import { TokenService } from '../modules/economy/token.service';

describe('TokenService', () => {
  let tokenService: TokenService;

  beforeEach(() => {
    tokenService = new TokenService();
  });

  describe('calculateReward', () => {
    it('should reward player with tokens', () => {
      const reward = tokenService.calculateReward({
        kills: 5,
        deaths: 2,
        score: 500,
      });
      expect(reward).toBeGreaterThan(0);
    });

    it('should reward based on kills', () => {
      const reward1 = tokenService.calculateReward({
        kills: 5,
        deaths: 0,
        score: 500,
      });
      const reward2 = tokenService.calculateReward({
        kills: 10,
        deaths: 0,
        score: 500,
      });
      expect(reward2).toBeGreaterThan(reward1);
    });
  });

  describe('calculateStakingReward', () => {
    it('should calculate staking APY correctly', () => {
      const reward = tokenService.calculateStakingReward({
        stakedAmount: 1000,
        apy: 50,
        days: 365,
      });
      expect(reward).toBeCloseTo(500, 0);
    });

    it('should handle different stake amounts', () => {
      const reward1 = tokenService.calculateStakingReward({
        stakedAmount: 1000,
        apy: 50,
        days: 365,
      });
      const reward2 = tokenService.calculateStakingReward({
        stakedAmount: 2000,
        apy: 50,
        days: 365,
      });
      expect(reward2).toBeCloseTo(reward1 * 2, 0);
    });
  });

  describe('transfer', () => {
    it('should not allow transfer without balance', () => {
      const result = tokenService.validateTransfer({
        from: 'user1',
        to: 'user2',
        amount: 1000,
        balance: 500,
      });
      expect(result.success).toBe(false);
    });

    it('should allow transfer with sufficient balance', () => {
      const result = tokenService.validateTransfer({
        from: 'user1',
        to: 'user2',
        amount: 500,
        balance: 1000,
      });
      expect(result.success).toBe(true);
    });
  });
});
