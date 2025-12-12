import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common'
import { TokenService } from './token.service'
import { AuthGuard } from '@nestjs/passport'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@Controller('economy')
@UseGuards(AuthGuard('jwt'))
export class EconomyController {
  constructor(private tokenService: TokenService) {}

  @Get('balance')
  async getBalance(@CurrentUser() user: any) {
    const balance = await this.tokenService.getBalance(user.id)
    return {
      address: user.tonAddress,
      balance,
      formatted: (balance / Math.pow(10, 9)).toFixed(2),
    }
  }

  @Get('history')
  async getHistory(@CurrentUser() user: any) {
    return this.tokenService.getTransactionHistory(user.id)
  }

  @Post('transfer')
  async transfer(
    @CurrentUser() user: any,
    @Body() body: { toAddress: string; amount: number },
  ) {
    const result = await this.tokenService.transfer(user.id, body.toAddress, body.amount)
    return result
  }

  @Post('stake')
  async stake(@CurrentUser() user: any, @Body() body: { amount: number; period: number }) {
    const result = await this.tokenService.stakeTokens(user.id, body.amount, body.period)
    return result
  }

  @Post('unstake/:stakeId')
  async unstake(@CurrentUser() user: any) {
    // Implementation
    return { success: true }
  }

  @Get('stats')
  async getStats() {
    return this.tokenService.getStats()
  }
}
