import Phaser from 'phaser';

/**
 * Audio Manager - Handles all game audio
 * Uses Web Audio API for procedural sound generation
 * Fallback to Phaser audio for asset-based sounds
 */
export class AudioManager {
  private scene: Phaser.Scene;
  private audioContext: AudioContext | null = null;
  private masterVolume: number = 0.5;
  private sfxVolume: number = 0.7;
  private musicVolume: number = 0.5;
  private isMuted: boolean = false;

  // Audio oscillators and gainers
  private currentMusicOscillator: OscillatorNode | null = null;
  private currentMusicGain: GainNode | null = null;
  private sfxCache: Map<string, AudioBuffer> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initializeAudioContext();
  }

  /**
   * Initialize Web Audio API context
   */
  private initializeAudioContext(): void {
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
        console.log('✅ Audio Context initialized');
      }
    } catch (e) {
      console.warn('⚠️ Web Audio API not available:', e);
    }
  }

  /**
   * Play weapon fire sound (procedurally generated)
   */
  playWeaponFire(weaponType: 'ak74m' | 'svd' | 'pmm' = 'ak74m'): void {
    if (!this.audioContext || this.isMuted) return;

    const now = this.audioContext.currentTime;
    const gainNode = this.audioContext.createGain();
    const oscillator = this.audioContext.createOscillator();
    const filter = this.audioContext.createBiquadFilter();

    // Set volume
    gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    // Filter configuration
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(200, now);
    filter.Q.setValueAtTime(10, now);

    // Different weapon sounds
    switch (weaponType) {
      case 'ak74m':
        // AK-74M: Medium pitch, sharp attack
        oscillator.frequency.setValueAtTime(300, now);
        oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.05);
        break;
      case 'svd':
        // SVD Sniper: Lower pitch, longer decay
        oscillator.frequency.setValueAtTime(200, now);
        oscillator.frequency.exponentialRampToValueAtTime(80, now + 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        break;
      case 'pmm':
        // PMM Pistol: Higher pitch, shorter
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.03);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        break;
    }

    oscillator.type = 'sawtooth';
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.15);

    console.log(`🔊 ${weaponType} fire sound`);
  }

  /**
   * Play enemy damage/hit sound
   */
  playEnemyHit(): void {
    if (!this.audioContext || this.isMuted) return;

    const now = this.audioContext.currentTime;
    const gainNode = this.audioContext.createGain();
    const oscillator = this.audioContext.createOscillator();

    gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, now);
    oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }

  /**
   * Play explosion sound
   */
  playExplosion(x?: number, y?: number): void {
    if (!this.audioContext || this.isMuted) return;

    const now = this.audioContext.currentTime;
    const duration = 0.3;

    // Create noise buffer
    const bufferLength = this.audioContext.sampleRate * duration;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferLength, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferLength; i++) {
      output[i] = Math.random() * 2 - 1; // White noise
    }

    // Create nodes
    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.4, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(5000, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + duration);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    noiseSource.start(now);
    noiseSource.stop(now + duration);

    console.log('💥 Explosion sound');
  }

  /**
   * Play player damage sound
   */
  playPlayerDamage(): void {
    if (!this.audioContext || this.isMuted) return;

    const now = this.audioContext.currentTime;
    const gainNode = this.audioContext.createGain();
    const oscillator = this.audioContext.createOscillator();

    gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.25, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, now);
    oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.2);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.2);

    console.log('🤕 Player damage sound');
  }

  /**
   * Play enemy alert/death sound
   */
  playEnemyDeath(): void {
    if (!this.audioContext || this.isMuted) return;

    const now = this.audioContext.currentTime;
    const gainNode = this.audioContext.createGain();
    const oscillator = this.audioContext.createOscillator();

    gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    oscillator.type = 'sine';
    // Frequency sweep downward for death sound
    oscillator.frequency.setValueAtTime(500, now);
    oscillator.frequency.exponentialRampToValueAtTime(80, now + 0.15);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }

  /**
   * Play UI click sound
   */
  playUIClick(): void {
    if (!this.audioContext || this.isMuted) return;

    const now = this.audioContext.currentTime;
    const gainNode = this.audioContext.createGain();
    const oscillator = this.audioContext.createOscillator();

    gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(800, now);
    oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.05);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.05);
  }

  /**
   * Play ammo pickup sound
   */
  playAmmoPickup(): void {
    if (!this.audioContext || this.isMuted) return;

    const now = this.audioContext.currentTime;
    const gainNode = this.audioContext.createGain();
    const oscillator = this.audioContext.createOscillator();

    gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    oscillator.type = 'sine';
    // Ascending pitch for positive feedback
    oscillator.frequency.setValueAtTime(300, now);
    oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }

  /**
   * Play background music (looping ambient tone)
   */
  playBackgroundMusic(): void {
    if (!this.audioContext || this.isMuted) return;

    // Stop previous music if playing
    if (this.currentMusicOscillator) {
      this.currentMusicOscillator.stop();
    }

    this.currentMusicOscillator = this.audioContext.createOscillator();
    this.currentMusicGain = this.audioContext.createGain();

    this.currentMusicOscillator.type = 'sine';
    this.currentMusicOscillator.frequency.setValueAtTime(220, this.audioContext.currentTime); // A3 note

    this.currentMusicGain.gain.setValueAtTime(
      this.musicVolume * this.masterVolume * 0.1,
      this.audioContext.currentTime
    );

    this.currentMusicOscillator.connect(this.currentMusicGain);
    this.currentMusicGain.connect(this.audioContext.destination);

    this.currentMusicOscillator.start();

    console.log('🎵 Background music started');
  }

  /**
   * Stop background music
   */
  stopBackgroundMusic(): void {
    if (this.currentMusicOscillator && this.audioContext) {
      this.currentMusicOscillator.stop(this.audioContext.currentTime + 0.5);
      this.currentMusicOscillator = null;
      console.log('⏹️ Background music stopped');
    }
  }

  /**
   * Set master volume (0-1)
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    console.log(`🔊 Master volume: ${(this.masterVolume * 100).toFixed(0)}%`);
  }

  /**
   * Set SFX volume (0-1)
   */
  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    console.log(`🔊 SFX volume: ${(this.sfxVolume * 100).toFixed(0)}%`);
  }

  /**
   * Set music volume (0-1)
   */
  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusicGain && this.audioContext) {
      this.currentMusicGain.gain.setValueAtTime(
        this.musicVolume * this.masterVolume * 0.1,
        this.audioContext.currentTime
      );
    }
    console.log(`🔊 Music volume: ${(this.musicVolume * 100).toFixed(0)}%`);
  }

  /**
   * Toggle mute
   */
  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    console.log(`🔇 Audio ${this.isMuted ? 'muted' : 'unmuted'}`);
    return this.isMuted;
  }

  /**
   * Get current mute state
   */
  isMutedState(): boolean {
    return this.isMuted;
  }

  /**
   * Get master volume
   */
  getMasterVolume(): number {
    return this.masterVolume;
  }

  /**
   * Destroy audio manager
   */
  destroy(): void {
    this.stopBackgroundMusic();
    if (this.audioContext) {
      this.audioContext.close();
    }
    console.log('🎵 Audio manager destroyed');
  }
}

/**
 * Audio Configuration
 */
export const audioConfig = {
  // Master volumes
  master: 0.5,
  sfx: 0.7,
  music: 0.5,

  // Weapon sound characteristics
  weapons: {
    ak74m: {
      frequency: 300,
      duration: 0.15,
      volume: 0.3,
    },
    svd: {
      frequency: 200,
      duration: 0.15,
      volume: 0.3,
    },
    pmm: {
      frequency: 400,
      duration: 0.1,
      volume: 0.25,
    },
  },

  // Sound effects
  sfx: {
    explosion: {
      duration: 0.3,
      volume: 0.4,
    },
    hit: {
      frequency: 600,
      duration: 0.1,
      volume: 0.2,
    },
    damage: {
      frequency: 400,
      duration: 0.2,
      volume: 0.25,
    },
    death: {
      frequency: 500,
      duration: 0.15,
      volume: 0.3,
    },
    click: {
      frequency: 800,
      duration: 0.05,
      volume: 0.2,
    },
    pickup: {
      frequency: 300,
      duration: 0.1,
      volume: 0.15,
    },
  },

  // Music settings
  music: {
    baseFrequency: 220, // A3
    volume: 0.1,
    type: 'sine',
  },
};
