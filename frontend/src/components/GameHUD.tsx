import { useState, useEffect } from 'react'
import { Wallet, Settings, Menu } from 'lucide-react'

export default function GameHUD() {
  const [health, setHealth] = useState(100)
  const [ammo, setAmmo] = useState(30)
  const [score, setScore] = useState(0)
  const [vityazBalance, setVityazBalance] = useState(0)

  useEffect(() => {
    // Connect to backend
    // const socket = io('http://localhost:3001')
    // socket.on('health_update', (data) => setHealth(data))
    // return () => socket.disconnect()
  }, [])

  return (
    <div className="game-hud">
      {/* Top Bar */}
      <div className="hud-top">
        <div className="hud-section">
          <span className="label">🥊 VITYAZ</span>
        </div>
        <div className="hud-center">
          <span>Score: {score}</span>
        </div>
        <div className="hud-section right">
          <div className="wallet-balance">
            <Wallet size={20} />
            <span>{vityazBalance.toLocaleString()} $VITYAZ</span>
          </div>
        </div>
      </div>

      {/* Health Bar */}
      <div className="hud-left">
        <div className="stat-box">
          <div className="stat-label">HP</div>
          <div className="health-bar">
            <div className="health-fill" style={{ width: `${health}%` }} />
          </div>
          <div className="stat-value">{health}/100</div>
        </div>
      </div>

      {/* Ammo Counter */}
      <div className="hud-left bottom">
        <div className="stat-box">
          <div className="stat-label">AMMO</div>
          <div className="ammo-display">{ammo}</div>
          <div className="stat-value">30 in mag</div>
        </div>
      </div>

      {/* Bottom Right Controls */}
      <div className="hud-right bottom">
        <button className="hud-btn" title="Settings">
          <Settings size={24} />
        </button>
        <button className="hud-btn" title="Menu">
          <Menu size={24} />
        </button>
      </div>
    </div>
  )
}
