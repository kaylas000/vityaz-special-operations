import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TouchJoystick } from '../../src/components/Mobile/TouchJoystick';

describe('TouchJoystick Component', () => {
  it('renders joystick container', () => {
    render(<TouchJoystick size={120} />);
    const joystick = document.querySelector('.touch-joystick');
    expect(joystick).toBeInTheDocument();
  });

  it('sets correct size', () => {
    const size = 100;
    const { container } = render(<TouchJoystick size={size} />);
    const joystick = container.querySelector('.touch-joystick') as HTMLElement;
    expect(joystick).toHaveStyle(`width: ${size}px`);
    expect(joystick).toHaveStyle(`height: ${size}px`);
  });

  it('calls onStart when touch begins', () => {
    const onStart = jest.fn();
    const { container } = render(<TouchJoystick size={120} onStart={onStart} />);
    const joystick = container.querySelector('.touch-joystick') as HTMLElement;

    fireEvent.touchStart(joystick, {
      touches: [{ clientX: 100, clientY: 100, identifier: 0 }],
    });

    expect(onStart).toHaveBeenCalled();
  });

  it('calls onMove with position data', () => {
    const onMove = jest.fn();
    const { container } = render(<TouchJoystick size={120} onMove={onMove} />);
    const joystick = container.querySelector('.touch-joystick') as HTMLElement;

    fireEvent.touchStart(joystick, {
      touches: [{ clientX: 110, clientY: 110, identifier: 0 }],
    });

    fireEvent.touchMove(joystick, {
      touches: [{ clientX: 120, clientY: 120, identifier: 0 }],
    });

    expect(onMove).toHaveBeenCalled();
    const call = onMove.mock.calls[onMove.mock.calls.length - 1][0];
    expect(call).toHaveProperty('x');
    expect(call).toHaveProperty('y');
    expect(call).toHaveProperty('angle');
    expect(call).toHaveProperty('distance');
  });

  it('calls onEnd when touch ends', () => {
    const onEnd = jest.fn();
    const { container } = render(<TouchJoystick size={120} onEnd={onEnd} />);
    const joystick = container.querySelector('.touch-joystick') as HTMLElement;

    fireEvent.touchStart(joystick, {
      touches: [{ clientX: 100, clientY: 100, identifier: 0 }],
    });

    fireEvent.touchEnd(joystick, {
      changedTouches: [{ clientX: 100, clientY: 100, identifier: 0 }],
    });

    expect(onEnd).toHaveBeenCalled();
  });

  it('respects deadzone setting', () => {
    const onMove = jest.fn();
    const deadzone = 15;
    const { container } = render(
      <TouchJoystick size={120} deadzone={deadzone} onMove={onMove} />
    );
    const joystick = container.querySelector('.touch-joystick') as HTMLElement;

    // Touch within deadzone
    fireEvent.touchStart(joystick, {
      touches: [{ clientX: 101, clientY: 101, identifier: 0 }],
    });

    const call = onMove.mock.calls[0][0];
    expect(call.isActive).toBe(false);
  });

  it('supports mouse events for testing', () => {
    const onMove = jest.fn();
    const { container } = render(<TouchJoystick size={120} onMove={onMove} />);
    const joystick = container.querySelector('.touch-joystick') as HTMLElement;

    fireEvent.mouseDown(joystick, { button: 0, clientX: 100, clientY: 100 });
    fireEvent.mouseMove(document, { clientX: 110, clientY: 110 });
    fireEvent.mouseUp(document);

    expect(onMove).toHaveBeenCalled();
  });
});
