import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { NFTService } from './nft.service'

@Controller('nft')
@UseGuards(AuthGuard('jwt'))
export class NFTController {
  constructor(private nftService: NFTService) {}

  @Get('inventory')
  async getInventory(@CurrentUser() user: any) {
    return this.nftService.getInventory(user.id)
  }

  @Post('mint')
  async mintNFT(
    @CurrentUser() user: any,
    @Body() body: { type: string; name: string; rarity: string },
  ) {
    return this.nftService.mintNFT(user.id, body.type as any, body.name, body.rarity as any)
  }

  @Post(':nftId/list')
  async listNFT(
    @CurrentUser() user: any,
    @Body() body: { price: number },
  ) {
    // Verify ownership
    const inventory = await this.nftService.getInventory(user.id)
    const nft = inventory.find((n) => n.id === body)

    if (!nft) throw new Error('NFT not found in inventory')

    return this.nftService.listNFT(body, body.price)
  }

  @Post('buy/:listingId')
  async buyNFT(@CurrentUser() user: any) {
    // Buy NFT from marketplace
    return { success: true }
  }

  @Get('marketplace')
  async getMarketplace() {
    return this.nftService.getMarketplace()
  }
}
