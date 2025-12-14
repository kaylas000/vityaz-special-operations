import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import MainMenuScene from './scenes/MainMenuScene'
import MenuScene from './scenes/MenuScene'
import BattleScene from './scenes/BattleScene'
import TrainingScene from './scenes/TrainingScene'
import CompleteGameScene from './scenes/CompleteGameScene'
import GameHUD from './components/GameHUD'
import './App.css'

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 300 },
          debug: false,
        },
      },
      scene: [MainMenuScene, MenuScene, BattleScene, TrainingScene, CompleteGameScene],
      render: {
        pixelArt: false,
        antialias: true,
      },
    }

    gameRef.current = new Phaser.Game(config)

    const handleResize = () => {
      if (gameRef.current) {
        gameRef.current.scale.resize(window.innerWidth, window.innerHeight)
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      gameRef.current?.destroy(true)
    }
  }, [])

  return (
    <div className="vityaz-container">
      <div ref={containerRef} className="game-container" />
      <GameHUD />
    </div>
  )
}
