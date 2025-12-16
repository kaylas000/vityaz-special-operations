import React, { useEffect, useState } from 'react';
import TouchJoystick from './TouchJoystick';
import { useResponsive, useIsMobile } from '../../hooks/useResponsive';
import '../../styles/mobile.css';

export interface GameState {
  health: number;
  maxHealth: number;
  ammo: number;
  maxAmmo: number;
  score: number;
  kills: number;
  deaths: number;
  level: string;
}

export interface MobileControlsProps {
  gameState: GameState;
  onMove?: (x: number, y: number) => void;
  onLook?: (x: number, y: number) => void;
  onShoot?: () => void;
  onReload?: () => void;
  onJump?: () => void;
  onCrouch?: () => void;
  onMelee?: () => void;
  onAbility?: () => void;
  onPause?: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  gameState,
  onMove,
  onLook,
  onShoot,
  onReload,
  onJump,
  onCrouch,
  onMelee,
  onAbility,
  onPause,
}) => {
  const responsive = useResponsive();
  const isMobile = useIsMobile();
  const [healthPercent, setHealthPercent] = useState(100);
  const [ammoPercent, setAmmoPercent] = useState(100);

  useEffect(() => {
    setHealthPercent((gameState.health / gameState.maxHealth) * 100);
    setAmmoPercent((gameState.ammo / gameState.maxAmmo) * 100);
  }, [gameState.health, gameState.maxHealth, gameState.ammo, gameState.maxAmmo]);

  if (!isMobile) {
    return null; // Don't render on desktop
  }

  const joystickSize = responsive.width < 480 ? 100 : 120;
  const buttonSize = responsive.width < 480 ? 40 : 48;

  return (
    <div className="mobile-hud">
      {/* Top HUD - Info Panels */}
      <div className="hud-top">
        {/* Health Panel */}
        <div className="hud-panel hud-health">
          <span>❤️</span>
          <div className="health-bar">
            <div
              className="health-bar-fill"
              style={{
                width: `${healthPercent}%`,
                backgroundColor: healthPercent > 50 ? '#42a5f5' : healthPercent > 25 ? '#ffa726' : '#ef5350',
              }}
            />
          </div>
          <span>{gameState.health}</span>
        </div>

        {/* Ammo Panel */}
        <div className="hud-panel hud-ammo">
          <span>🔫</span>
          <span className="ammo-counter">{gameState.ammo}</span>
        </div>

        {/* Score Panel */}
        <div className="hud-panel hud-score">
          <span>🎯 {gameState.score}</span>
        </div>

        {/* Level/Status */}
        <div className="hud-panel">
          <span>{gameState.level}</span>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="hud-bottom">
        {/* Left Joystick - Movement */}
        <TouchJoystick
          size={joystickSize}
          onMove={(pos) => {
            if (onMove) {
              onMove(pos.x, pos.y);
            }
          }}
          style={{
            margin: `${responsive.safeAreaInsets.left}px 0 0 0`,
          }}
        />

        {/* Action Buttons - Center */}
        <div className="mobile-buttons">
          {/* Row 1 */}
          <button
            className="mobile-button secondary"
            style={{ minHeight: buttonSize, minWidth: buttonSize }}
            onPointerDown={onCrouch}
            title="Crouch (C)"
          >
            ⬇️
          </button>
          <button
            className="mobile-button"
            style={{ minHeight: buttonSize, minWidth: buttonSize }}
            onPointerDown={onJump}
            title="Jump (Space)"
          >
            ⬆️
          </button>

          {/* Row 2 */}
          <button
            className="mobile-button secondary"
            style={{ minHeight: buttonSize, minWidth: buttonSize }}
            onPointerDown={onReload}
            title="Reload (R)"
          >
            🔄
          </button>
          <button
            className="mobile-button"
            style={{ minHeight: buttonSize, minWidth: buttonSize }}
            onPointerDown={onAbility}
            title="Ability (E)"
          >
            ⚡
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="mobile-buttons">
          {/* Large Shoot Button */}
          <button
            className="mobile-button large"
            style={{ minHeight: buttonSize * 1.2, minWidth: buttonSize * 2.2 }}
            onPointerDown={onShoot}
            onPointerUp={() => {}} // Stop shooting on release
            title="Shoot (LMB)"
          >
            🔫 FIRE
          </button>

          {/* Melee + Pause Row */}
          <button
            className="mobile-button secondary"
            style={{ minHeight: buttonSize, minWidth: buttonSize }}
            onPointerDown={onMelee}
            title="Melee (F)"
          >
            👊
          </button>
          <button
            className="mobile-button secondary"
            style={{ minHeight: buttonSize, minWidth: buttonSize }}
            onPointerDown={onPause}
            title="Pause (ESC)"
          >
            ⏸
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileControls;
