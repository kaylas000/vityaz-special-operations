import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import BattleScene from './scenes/BattleScene'
import MainMenuScene from './scenes/MainMenuScene'
import CompleteGameScene from './scenes/CompleteGameScene'
import './App.css'

declare global {
  interface Window {
    game?: Phaser.Game
  }
}

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      physics: {
        default: 'arcade',
        arcade: { gravity: { y: 300 } },
      },
      scene: [MainMenuScene, BattleScene, CompleteGameScene],
    }

    const game = new Phaser.Game(config)
    window.game = game
    game.scene.start('MainMenuScene')

    return () => { game.destroy(true) }
  }, [])

  return <div className="vityaz-container"><div ref={containerRef} className="game-container" /></div>
}
