import { Injectable } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'

interface TransactionRecord {
  userId: string
  amount: number
  type: 'REWARD' | 'TRANSFER' | 'STAKE' | 'UNSTAKE' | 'BURN'
  reason: string
  timestamp: Date
}

@Injectable()
export class TokenService {
  private totalSupply: number = 1_000_000_000 * Math.pow(10, 9) // 1B with 9 decimals
  private circulating: number = 0
  private transactions: TransactionRecord[] = []

  constructor(private prisma: PrismaService) {}

  /**
   * Reward player with $VITYAZ tokens
   */
  async rewardPlayer(
    userId: string,
    amount: number,
    reason: string,
  ): Promise<{ balance: number; transaction: TransactionRecord }> {
    // Get current balance
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { vityazBalance: true },
    })

    if (!user) throw new Error('User not found')

    // Check if emission limit exceeded
    if (this.circulating + amount > this.totalSupply) {
      throw new Error('Emission limit exceeded')
    }

    // Update balance
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        vityazBalance: {
          increment: amount,
        },
      },
    })

    // Record transaction
    const transaction: TransactionRecord = {
      userId,
      amount,
      type: 'REWARD',
      reason,
      timestamp: new Date(),
    }
    this.transactions.push(transaction)
    this.circulating += amount

    return {
      balance: updatedUser.vityazBalance,
      transaction,
    }
  }

  /**
   * Transfer tokens between users
   */
  async transfer(
    fromUserId: string,
    toUserId: string,
    amount: number,
  ): Promise<{ success: boolean }> {
    // Check source balance
    const fromUser = await this.prisma.user.findUnique({
      where: { id: fromUserId },
    })

    if (!fromUser || fromUser.vityazBalance < amount) {
      throw new Error('Insufficient balance')
    }

    // Deduct from sender
    await this.prisma.user.update({
      where: { id: fromUserId },
      data: {
        vityazBalance: {
          decrement: amount,
        },
      },
    })

    // Add to recipient
    await this.prisma.user.update({
      where: { id: toUserId },
      data: {
        vityazBalance: {
          increment: amount,
        },
      },
    })

    // Record transaction
    this.transactions.push({
      userId: fromUserId,
      amount,
      type: 'TRANSFER',
      reason: `Transfer to ${toUserId}`,
      timestamp: new Date(),
    })

    return { success: true }
  }

  /**
   * Stake tokens for passive income
   */
  async stakeTokens(
    userId: string,
    amount: number,
    lockPeriodDays: number,
  ): Promise<{ stakeId: string; apy: number; unlockDate: Date }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || user.vityazBalance < amount) {
      throw new Error('Insufficient balance')
    }

    // Calculate APY based on lock period
    let apy: number
    switch (lockPeriodDays) {
      case 30:
        apy = 25
        break
      case 90:
        apy = 50
        break
      case 180:
        apy = 75
        break
      case 365:
        apy = 100
        break
      default:
        throw new Error('Invalid lock period')
    }

    // Deduct from balance
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        vityazBalance: {
          decrement: amount,
        },
      },
    })

    // Create stake record
    const unlockDate = new Date(Date.now() + lockPeriodDays * 24 * 60 * 60 * 1000)
    const stakeId = `stake_${userId}_${Date.now()}`

    this.transactions.push({
      userId,
      amount,
      type: 'STAKE',
      reason: `Stake for ${lockPeriodDays} days at ${apy}% APY`,
      timestamp: new Date(),
    })

    return { stakeId, apy, unlockDate }
  }

  /**
   * Claim staking rewards
   */
  async claimStakeRewards(userId: string, stakeId: string, apy: number, days: number): Promise<number> {
    // Calculate rewards
    const dailyReward = (1 * apy) / 365 // Assuming 1 token staked
    const totalReward = Math.floor(dailyReward * days)

    // Add rewards to balance
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        vityazBalance: {
          increment: totalReward,
        },
      },
    })

    this.transactions.push({
      userId,
      amount: totalReward,
      type: 'UNSTAKE',
      reason: `Unstake + rewards from ${stakeId}`,
      timestamp: new Date(),
    })

    return totalReward
  }

  /**
   * Burn tokens (deflationary)
   */
  async burnTokens(userId: string, amount: number, reason: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || user.vityazBalance < amount) {
      throw new Error('Insufficient balance')
    }

    // Deduct from balance
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        vityazBalance: {
          decrement: amount,
        },
      },
    })

    // Record burn
    this.transactions.push({
      userId,
      amount,
      type: 'BURN',
      reason,
      timestamp: new Date(),
    })

    // Reduce circulating supply
    this.circulating -= amount

    return true
  }

  /**
   * Get user balance
   */
  async getBalance(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { vityazBalance: true },
    })

    return user?.vityazBalance || 0
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(userId: string, limit: number = 50): Promise<TransactionRecord[]> {
    return this.transactions
      .filter((t) => t.userId === userId)
      .slice(-limit)
      .reverse()
  }

  /**
   * Get token statistics
   */
  getStats() {
    return {
      totalSupply: this.totalSupply,
      circulating: this.circulating,
      burned: this.totalSupply - this.circulating,
      transactions: this.transactions.length,
    }
  }
}
