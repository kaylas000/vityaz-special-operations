import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { PrismaService } from '../database/prisma.service'
import { TokenService } from '../economy/token.service'

@Controller('battles')
@UseGuards(AuthGuard('jwt'))
export class BattleController {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
  ) {}

  @Post('start')
  async startBattle(@CurrentUser() user: any, @Body() body: { difficulty: string }) {
    const battle = await this.prisma.battle.create({
      data: {
        playerId: user.id,
        difficulty: body.difficulty,
        score: 0,
        kills: 0,
        deaths: 0,
        duration: 0,
        tokensEarned: 0,
        experienceGained: 0,
      },
    })

    return {
      battleId: battle.id,
      startedAt: battle.createdAt,
    }
  }

  @Post(':battleId/end')
  async endBattle(
    @CurrentUser() user: any,
    @Param('battleId') battleId: string,
    @Body() body: { score: number; kills: number; deaths?: number; duration?: number },
  ) {
    // Update battle record
    const battle = await this.prisma.battle.update({
      where: { id: battleId },
      data: {
        score: body.score,
        kills: body.kills,
        deaths: body.deaths || 0,
        duration: body.duration || 0,
      },
    })

    // Calculate reward (tokens)
    const baseReward = body.kills * 50
    const scoreReward = Math.floor(body.score / 10)
    const totalReward = baseReward + scoreReward

    // Award tokens
    await this.tokenService.rewardPlayer(
      user.id,
      totalReward,
      `Battle: ${body.kills} kills, score ${body.score}`,
    )

    // Update user stats
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        kills: { increment: body.kills },
        totalEarned: { increment: totalReward },
      },
    })

    return {
      battleId,
      tokensEarned: totalReward,
      completed: true,
    }
  }

  @Get('history')
  async getBattleHistory(@CurrentUser() user: any) {
    const battles = await this.prisma.battle.findMany({
      where: { playerId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return battles
  }

  @Get('stats')
  async getStats(@CurrentUser() user: any) {
    const battles = await this.prisma.battle.findMany({
      where: { playerId: user.id },
    })

    const totalKills = battles.reduce((sum, b) => sum + b.kills, 0)
    const totalDeaths = battles.reduce((sum, b) => sum + b.deaths, 0)
    const totalScore = battles.reduce((sum, b) => sum + b.score, 0)

    return {
      battlesPlayed: battles.length,
      totalKills,
      totalDeaths,
      totalScore,
      averageKillsPerBattle: (totalKills / battles.length).toFixed(2),
      kdRatio: (totalKills / (totalDeaths || 1)).toFixed(2),
    }
  }
}
