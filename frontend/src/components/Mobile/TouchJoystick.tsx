import React, { useRef, useEffect, useState } from 'react';
import '../../../styles/mobile.css';

interface JoystickPosition {
  x: number;
  y: number;
  angle: number;
  distance: number;
  isActive: boolean;
}

interface TouchJoystickProps {
  size?: number;
  deadzone?: number;
  onMove?: (position: JoystickPosition) => void;
  onStart?: () => void;
  onEnd?: () => void;
  style?: React.CSSProperties;
}

export const TouchJoystick: React.FC<TouchJoystickProps> = ({
  size = 120,
  deadzone = 15,
  onMove,
  onStart,
  onEnd,
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const touchIdRef = useRef<number | null>(null);
  const [position, setPosition] = useState<JoystickPosition>({
    x: 0,
    y: 0,
    angle: 0,
    distance: 0,
    isActive: false,
  });

  const getJoystickData = (clientX: number, clientY: number): JoystickPosition => {
    if (!containerRef.current) {
      return { x: 0, y: 0, angle: 0, distance: 0, isActive: false };
    }

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const x = clientX - rect.left - centerX;
    const y = clientY - rect.top - centerY;

    const distance = Math.sqrt(x * x + y * y);
    const maxDistance = size / 2 - 10; // Knob size consideration

    const angle = Math.atan2(y, x);
    const isActive = distance > deadzone;

    let finalX = x;
    let finalY = y;
    let finalDistance = distance;

    // Clamp to joystick bounds
    if (distance > maxDistance) {
      finalX = (x / distance) * maxDistance;
      finalY = (y / distance) * maxDistance;
      finalDistance = maxDistance;
    }

    return {
      x: isActive ? finalX / maxDistance : 0,
      y: isActive ? finalY / maxDistance : 0,
      angle,
      distance: finalDistance,
      isActive,
    };
  };

  const updateKnobPosition = (data: JoystickPosition) => {
    if (knobRef.current) {
      const knobSize = size / 3;
      const x = (data.x * (size / 2 - knobSize / 2));
      const y = (data.y * (size / 2 - knobSize / 2));

      knobRef.current.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return; // Already tracking

    const touch = e.touches[0];
    touchIdRef.current = touch.identifier;

    containerRef.current?.classList.add('active');
    onStart?.();

    const data = getJoystickData(touch.clientX, touch.clientY);
    setPosition(data);
    updateKnobPosition(data);
    onMove?.(data);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = Array.from(e.touches).find(
      (t) => t.identifier === touchIdRef.current
    );

    if (!touch) return;

    e.preventDefault();

    const data = getJoystickData(touch.clientX, touch.clientY);
    setPosition(data);
    updateKnobPosition(data);
    onMove?.(data);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = Array.from(e.changedTouches).find(
      (t) => t.identifier === touchIdRef.current
    );

    if (!touch) return;

    touchIdRef.current = null;
    containerRef.current?.classList.remove('active');

    const resetData: JoystickPosition = {
      x: 0,
      y: 0,
      angle: 0,
      distance: 0,
      isActive: false,
    };

    setPosition(resetData);
    updateKnobPosition(resetData);
    onEnd?.();
    onMove?.(resetData);
  };

  // Mouse support for testing
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only

    containerRef.current?.classList.add('active');
    onStart?.();

    const data = getJoystickData(e.clientX, e.clientY);
    setPosition(data);
    updateKnobPosition(data);
    onMove?.(data);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current?.classList.contains('active')) return;

    const data = getJoystickData(e.clientX, e.clientY);
    setPosition(data);
    updateKnobPosition(data);
    onMove?.(data);
  };

  const handleMouseUp = () => {
    containerRef.current?.classList.remove('active');

    const resetData: JoystickPosition = {
      x: 0,
      y: 0,
      angle: 0,
      distance: 0,
      isActive: false,
    };

    setPosition(resetData);
    updateKnobPosition(resetData);
    onEnd?.();
    onMove?.(resetData);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove as any);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove as any);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="touch-joystick"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        ...style,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      <div className="joystick-background" />
      <div
        ref={knobRef}
        className="joystick-knob"
        style={{
          width: `${size / 3}px`,
          height: `${size / 3}px`,
        }}
      />
      <div className="joystick-direction">
        {position.isActive && (
          <span className="direction-text">
            {getDirectionName(position.angle)}
          </span>
        )}
      </div>
    </div>
  );
};

function getDirectionName(angle: number): string {
  const degrees = (angle * 180) / Math.PI;
  const normalized = ((degrees + 360 + 22.5) % 360) / 45;
  const directions = ['→', '↗', '↑', '↖', '←', '↙', '↓', '↘'];
  return directions[Math.floor(normalized) % 8];
}

export default TouchJoystick;
