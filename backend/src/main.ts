import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { SocketIOAdapter } from './socket-io.adapter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  })

  // WebSocket adapter
  app.useWebSocketAdapter(new SocketIOAdapter(app))

  // Global prefix
  app.setGlobalPrefix('api')

  const port = process.env.PORT || 3001
  await app.listen(port)

  console.log(`🚀 VITYAZ API running on http://localhost:${port}`)
  console.log(`🎮 WebSocket gateway ready`)
  console.log(`🔗 Smart contract network: ${process.env.TON_NETWORK || 'testnet'}`)
}

bootstrap()
