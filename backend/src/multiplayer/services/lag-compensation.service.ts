import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

export interface PlayerState {
  id: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  timestamp: number;
  ping: number;
}

export interface StateSnapshot {
  timestamp: number;
  state: Map<string, PlayerState>;
}

@Injectable()
export class LagCompensationService {
  private stateHistory: Map<string, StateSnapshot[]> = new Map();
  private playerPings: Map<string, number[]> = new Map();
  private readonly HISTORY_SIZE = 1000; // Store last 1000 snapshots
  private readonly PING_SAMPLE_SIZE = 10; // Average last 10 ping measurements

  /**
   * Record player state for lag compensation
   */
  recordState(
    playerId: string,
    state: PlayerState,
  ): void {
    if (!this.stateHistory.has(playerId)) {
      this.stateHistory.set(playerId, []);
    }

    const history = this.stateHistory.get(playerId)!;
    history.push({
      timestamp: state.timestamp,
      state: new Map([[
        playerId,
        {
          ...state,
          timestamp: Date.now(),
        },
      ]]),
    });

    // Keep only recent history
    if (history.length > this.HISTORY_SIZE) {
      history.shift();
    }
  }

  /**
   * Get player state at specific timestamp (for lag compensation)
   */
  getStateAtTime(
    playerId: string,
    timestamp: number,
  ): PlayerState | null {
    const history = this.stateHistory.get(playerId);
    if (!history || history.length === 0) {
      return null;
    }

    // Find snapshot closest to requested timestamp
    let closest = history[0];
    let minDiff = Math.abs(timestamp - closest.timestamp);

    for (const snapshot of history) {
      const diff = Math.abs(timestamp - snapshot.timestamp);
      if (diff < minDiff) {
        minDiff = diff;
        closest = snapshot;
      }
      if (diff > minDiff) break; // Optimization: stop if diff is increasing
    }

    const state = closest.state.get(playerId);
    return state || null;
  }

  /**
   * Get interpolated player state (smooth movement)
   */
  getInterpolatedState(
    playerId: string,
    currentTime: number,
    interpolationDelay: number = 100,
  ): PlayerState | null {
    const history = this.stateHistory.get(playerId);
    if (!history || history.length < 2) {
      return null;
    }

    const targetTime = currentTime - interpolationDelay;

    // Find two states to interpolate between
    let before: StateSnapshot | null = null;
    let after: StateSnapshot | null = null;

    for (const snapshot of history) {
      if (snapshot.timestamp <= targetTime) {
        before = snapshot;
      } else if (snapshot.timestamp > targetTime && !after) {
        after = snapshot;
        break;
      }
    }

    if (!before || !after) {
      return before?.state.get(playerId) || after?.state.get(playerId) || null;
    }

    // Interpolate between states
    const stateBefore = before.state.get(playerId)!;
    const stateAfter = after.state.get(playerId)!;

    const timeDiff = after.timestamp - before.timestamp;
    if (timeDiff === 0) {
      return stateBefore;
    }

    const t = (targetTime - before.timestamp) / timeDiff;
    const clampedT = Math.max(0, Math.min(1, t));

    return this.interpolateState(stateBefore, stateAfter, clampedT);
  }

  /**
   * Predict player position based on current velocity
   */
  predictPosition(
    state: PlayerState,
    predictionTime: number,
  ): { x: number; y: number; z: number } {
    const futureTime = predictionTime / 1000; // Convert ms to seconds
    return {
      x: state.position.x + state.velocity.x * futureTime,
      y: state.position.y + state.velocity.y * futureTime,
      z: state.position.z + state.velocity.z * futureTime,
    };
  }

  /**
   * Update player ping and calculate average
   */
  updatePing(playerId: string, ping: number): number {
    if (!this.playerPings.has(playerId)) {
      this.playerPings.set(playerId, []);
    }

    const pings = this.playerPings.get(playerId)!;
    pings.push(ping);

    if (pings.length > this.PING_SAMPLE_SIZE) {
      pings.shift();
    }

    const avgPing = pings.reduce((a, b) => a + b, 0) / pings.length;
    return Math.round(avgPing);
  }

  /**
   * Get average ping for player
   */
  getAveragePing(playerId: string): number {
    const pings = this.playerPings.get(playerId);
    if (!pings || pings.length === 0) {
      return 0;
    }
    return Math.round(pings.reduce((a, b) => a + b, 0) / pings.length);
  }

  /**
   * Perform client-side prediction correction
   */
  correctClientPrediction(
    predictedState: PlayerState,
    serverState: PlayerState,
    maxCorrectionSpeed: number = 10,
  ): PlayerState {
    const positionDiff = {
      x: serverState.position.x - predictedState.position.x,
      y: serverState.position.y - predictedState.position.y,
      z: serverState.position.z - predictedState.position.z,
    };

    const distance = Math.sqrt(
      positionDiff.x ** 2 + positionDiff.y ** 2 + positionDiff.z ** 2,
    );

    // If error is too large, teleport; otherwise smooth correction
    if (distance > 5) {
      return serverState; // Large discrepancy - teleport to server state
    }

    // Smooth correction
    const correctionFactor = Math.min(1, (maxCorrectionSpeed * 0.016) / distance); // 0.016 = 60fps frame time

    return {
      ...serverState,
      position: {
        x: predictedState.position.x + positionDiff.x * correctionFactor,
        y: predictedState.position.y + positionDiff.y * correctionFactor,
        z: predictedState.position.z + positionDiff.z * correctionFactor,
      },
    };
  }

  /**
   * Clear history for player (e.g., on disconnect)
   */
  clearHistory(playerId: string): void {
    this.stateHistory.delete(playerId);
    this.playerPings.delete(playerId);
  }

  private interpolateState(
    state1: PlayerState,
    state2: PlayerState,
    t: number,
  ): PlayerState {
    return {
      id: state1.id,
      position: {
        x: state1.position.x + (state2.position.x - state1.position.x) * t,
        y: state1.position.y + (state2.position.y - state1.position.y) * t,
        z: state1.position.z + (state2.position.z - state1.position.z) * t,
      },
      rotation: {
        x: this.interpolateAngle(state1.rotation.x, state2.rotation.x, t),
        y: this.interpolateAngle(state1.rotation.y, state2.rotation.y, t),
        z: this.interpolateAngle(state1.rotation.z, state2.rotation.z, t),
      },
      velocity: {
        x: state1.velocity.x + (state2.velocity.x - state1.velocity.x) * t,
        y: state1.velocity.y + (state2.velocity.y - state1.velocity.y) * t,
        z: state1.velocity.z + (state2.velocity.z - state1.velocity.z) * t,
      },
      timestamp: state1.timestamp + (state2.timestamp - state1.timestamp) * t,
      ping: state1.ping,
    };
  }

  private interpolateAngle(angle1: number, angle2: number, t: number): number {
    // Handle angle wrapping
    let diff = angle2 - angle1;
    if (diff > Math.PI) {
      diff -= 2 * Math.PI;
    } else if (diff < -Math.PI) {
      diff += 2 * Math.PI;
    }
    return angle1 + diff * t;
  }
}
