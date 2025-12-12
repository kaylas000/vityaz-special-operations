import { Controller, Post, Body } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../database/prisma.service'

@Controller('auth')
export class AuthController {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  @Post('ton-login')
  async loginWithTON(@Body() body: { address: string; signature: string }) {
    // Verify TON signature (in production, use ton/ton-crypto library)
    // For now, we'll trust the address from the client

    let user = await this.prisma.user.findUnique({
      where: { tonAddress: body.address },
    })

    if (!user) {
      // Create new user
      user = await this.prisma.user.create({
        data: {
          tonAddress: body.address,
          username: `player_${body.address.slice(0, 8)}`,
          email: `${body.address.slice(0, 8)}@vityaz.game`,
          vityazBalance: 0,
        },
      })
    }

    // Generate JWT token
    const token = this.jwtService.sign(
      {
        id: user.id,
        tonAddress: user.tonAddress,
        username: user.username,
      },
      { expiresIn: '7d' },
    )

    return {
      access_token: token,
      user: {
        id: user.id,
        username: user.username,
        tonAddress: user.tonAddress,
      },
    }
  }
}
