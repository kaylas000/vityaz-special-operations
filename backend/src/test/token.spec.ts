import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from '../services/token.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TokenService', () => {
  let service: TokenService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            tokenTransaction: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
            staking: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('Reward System', () => {
    it('should reward player with tokens', async () => {
      const userId = 'user123';
      const amount = 100;

      const result = await service.rewardPlayer(userId, amount);

      expect(result).toBeDefined();
      expect(result.balance).toBeGreaterThanOrEqual(amount);
    });

    it('should calculate kill rewards correctly', () => {
      const killReward = service.calculateKillReward({
        kills: 5,
        deaths: 2,
        headshotKills: 2,
        baseReward: 50,
      });

      // Base 50 + kill multiplier + headshot bonus
      expect(killReward).toBeGreaterThan(50);
    });

    it('should calculate headshot bonus correctly', () => {
      const normalKill = service.calculateKillReward({
        kills: 1,
        headshotKills: 0,
        baseReward: 50,
      });

      const headshotKill = service.calculateKillReward({
        kills: 1,
        headshotKills: 1,
        baseReward: 50,
      });

      expect(headshotKill).toBeGreaterThan(normalKill);
    });

    it('should calculate victory rewards', () => {
      const reward = service.calculateVictoryReward({
        place: 1,
        playersCount: 10,
        baseReward: 100,
      });

      expect(reward).toBeGreaterThan(50);
    });

    it('should reward participation', async () => {
      const reward = service.calculateParticipationReward({
        battleDuration: 600, // 10 minutes
        baseReward: 25,
      });

      expect(reward).toBeGreaterThan(0);
    });
  });

  describe('Token Transfer', () => {
    it('should transfer tokens between users', async () => {
      const fromUserId = 'user1';
      const toUserId = 'user2';
      const amount = 100;

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: fromUserId,
        balance: 1000,
      });

      const result = await service.transfer(fromUserId, toUserId, amount);

      expect(result).toBeDefined();
      expect(prisma.tokenTransaction.create).toHaveBeenCalled();
    });

    it('should prevent transfer without sufficient balance', async () => {
      const fromUserId = 'user1';
      const toUserId = 'user2';
      const amount = 1000;

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: fromUserId,
        balance: 100, // Not enough
      });

      await expect(
        service.transfer(fromUserId, toUserId, amount)
      ).rejects.toThrow('Insufficient balance');
    });

    it('should not allow negative transfers', async () => {
      const fromUserId = 'user1';
      const toUserId = 'user2';

      await expect(
        service.transfer(fromUserId, toUserId, -100)
      ).rejects.toThrow();
    });

    it('should not allow transfer to self', async () => {
      const userId = 'user1';

      await expect(
        service.transfer(userId, userId, 100)
      ).rejects.toThrow();
    });

    it('should record transaction', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user1',
        balance: 1000,
      });

      await service.transfer('user1', 'user2', 100);

      expect(prisma.tokenTransaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          fromUserId: 'user1',
          toUserId: 'user2',
          amount: 100,
        }),
      });
    });
  });

  describe('Staking', () => {
    it('should stake tokens', async () => {
      const userId = 'user1';
      const amount = 100;

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        balance: 500,
      });

      const result = await service.stake(userId, amount);

      expect(result).toBeDefined();
      expect(result.stakedAmount).toBe(amount);
    });

    it('should calculate staking rewards', () => {
      const reward = service.calculateStakingReward({
        stakedAmount: 1000,
        stakingDays: 30,
        apy: 0.50, // 50% APY
      });

      // 1000 * 0.50 * (30/365) ≈ 41
      expect(reward).toBeCloseTo(41, 0);
    });

    it('should apply APY correctly for 365 days', () => {
      const reward = service.calculateStakingReward({
        stakedAmount: 1000,
        stakingDays: 365,
        apy: 0.50, // 50% APY
      });

      // 1000 * 0.50 = 500
      expect(reward).toBeCloseTo(500, 0);
    });

    it('should prevent unstaking before lockup period', async () => {
      (prisma.staking.findUnique as jest.Mock).mockResolvedValue({
        id: 'stake1',
        userId: 'user1',
        amount: 100,
        createdAt: new Date(),
        lockupDays: 30,
      });

      await expect(
        service.unstake('user1', 'stake1')
      ).rejects.toThrow('Lockup period not complete');
    });

    it('should allow unstaking after lockup period', async () => {
      const lockupDate = new Date();
      lockupDate.setDate(lockupDate.getDate() - 31);

      (prisma.staking.findUnique as jest.Mock).mockResolvedValue({
        id: 'stake1',
        userId: 'user1',
        amount: 100,
        createdAt: lockupDate,
        lockupDays: 30,
      });

      const result = await service.unstake('user1', 'stake1');

      expect(result).toBeDefined();
    });

    it('should compound staking rewards', () => {
      const reward = service.calculateCompoundedReward({
        stakedAmount: 1000,
        stakingDays: 365,
        apy: 0.25, // 25% APY
        compoundingPeriod: 'daily',
      });

      // With daily compounding, should be slightly more than simple interest
      expect(reward).toBeGreaterThan(1000 * 0.25);
    });
  });

  describe('Balance Management', () => {
    it('should get user balance', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user1',
        balance: 500,
      });

      const balance = await service.getBalance('user1');

      expect(balance).toBe(500);
    });

    it('should handle balance for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const balance = await service.getBalance('nonexistent');

      expect(balance).toBe(0);
    });

    it('should not allow negative balance', async () => {
      const userId = 'user1';

      await expect(
        service.setBalance(userId, -100)
      ).rejects.toThrow();
    });

    it('should burn tokens correctly', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user1',
        balance: 500,
      });

      const result = await service.burn('user1', 100);

      expect(result.balance).toBe(400);
    });
  });

  describe('Transaction History', () => {
    it('should retrieve transaction history', async () => {
      (prisma.tokenTransaction.findMany as jest.Mock).mockResolvedValue([
        { id: '1', fromUserId: 'user1', toUserId: 'user2', amount: 100 },
        { id: '2', fromUserId: 'user1', toUserId: 'user3', amount: 50 },
      ]);

      const history = await service.getTransactionHistory('user1');

      expect(history).toHaveLength(2);
      expect(history[0].amount).toBe(100);
    });

    it('should filter transactions by type', async () => {
      (prisma.tokenTransaction.findMany as jest.Mock).mockResolvedValue([
        { id: '1', type: 'transfer', amount: 100 },
      ]);

      const transfers = await service.getTransactionHistory('user1', {
        type: 'transfer',
      });

      expect(transfers).toHaveLength(1);
      expect(transfers[0].type).toBe('transfer');
    });

    it('should filter transactions by date range', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-12-31');

      (prisma.tokenTransaction.findMany as jest.Mock).mockResolvedValue([]);

      await service.getTransactionHistory('user1', {
        startDate,
        endDate,
      });

      expect(prisma.tokenTransaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          }),
        })
      );
    });
  });

  describe('Token Economics', () => {
    it('should calculate inflation rate', () => {
      const inflation = service.calculateInflation({
        totalSupply: 1000000,
        mintedThisMonth: 50000,
      });

      // 50000 / 1000000 = 0.05 = 5%
      expect(inflation).toBeCloseTo(0.05, 2);
    });

    it('should enforce max supply cap', async () => {
      const maxSupply = 100000000;
      const currentSupply = 99999900;

      const canMint = service.canMint(1000, currentSupply, maxSupply);

      expect(canMint).toBe(true);
    });

    it('should prevent minting beyond max supply', async () => {
      const maxSupply = 100000000;
      const currentSupply = 99999900;

      const canMint = service.canMint(10000, currentSupply, maxSupply);

      expect(canMint).toBe(false);
    });
  });
});
