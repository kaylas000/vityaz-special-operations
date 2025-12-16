/**
 * Audio Manager - Handles all game sounds and dynamic music
 */

export enum SoundType {
  GUNFIRE = 'gunfire',
  EXPLOSION = 'explosion',
  IMPACT = 'impact',
  FOOTSTEP = 'footstep',
  VOICE_ALERT = 'voice_alert',
  UI_CLICK = 'ui_click',
  RECOIL = 'recoil',
  RELOAD = 'reload',
  HEAL = 'heal',
  KILL = 'kill',
  DEATH = 'death',
}

export interface SoundConfig {
  volume: number;
  pitch: number;
  loop: boolean;
  spatial?: boolean; // 3D positioning
}

interface AudioBuffer {
  context: AudioContext;
  buffer: OfflineAudioContext | null;
  source: AudioBufferSourceNode | null;
}

export class AudioManager {
  private audioContext: AudioContext;
  private masterGain: GainNode;
  private musicGain: GainNode;
  private sfxGain: GainNode;
  private soundBuffers: Map<SoundType, AudioBuffer> = new Map();
  private currentMusic: AudioBufferSourceNode | null = null;
  private soundInstances: Set<AudioBufferSourceNode> = new Set();
  private musicTempo: number = 120;
  private musicIntensity: number = 0.5; // 0-1

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.musicGain = this.audioContext.createGain();
    this.sfxGain = this.audioContext.createGain();

    // Connect audio graph
    this.masterGain.connect(this.audioContext.destination);
    this.musicGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);

    // Set default volumes
    this.masterGain.gain.value = 0.8;
    this.musicGain.gain.value = 0.6;
    this.sfxGain.gain.value = 0.8;
  }

  /**
   * Initialize and generate sound effects
   */
  async initializeSounds(): Promise<void> {
    // Generate procedural sounds
    this.generateGunfireSound();
    this.generateExplosionSound();
    this.generateFootstepSound();
    this.generateReloadSound();
    this.generateKillSound();
    this.generateDeathSound();
  }

  /**
   * Play sound effect
   */
  playSound(type: SoundType, config?: Partial<SoundConfig>): AudioBufferSourceNode | null {
    const finalConfig: SoundConfig = {
      volume: 1,
      pitch: 1,
      loop: false,
      ...config,
    };

    const audioBuffer = this.soundBuffers.get(type);
    if (!audioBuffer || !audioBuffer.buffer) {
      console.warn(`Sound ${type} not found`);
      return null;
    }

    try {
      // Create offline context to modify audio
      const offlineCtx = new OfflineAudioContext(
        2,
        this.audioContext.sampleRate * 2,
        this.audioContext.sampleRate,
      );

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      gainNode.gain.value = finalConfig.volume;
      source.playbackRate.value = finalConfig.pitch;
      source.loop = finalConfig.loop;

      source.connect(gainNode);
      gainNode.connect(this.sfxGain);

      source.start(0);
      this.soundInstances.add(source);

      // Remove from set when finished
      source.onended = () => {
        this.soundInstances.delete(source);
      };

      return source;
    } catch (error) {
      console.error(`Error playing sound ${type}:`, error);
      return null;
    }
  }

  /**
   * Stop all sounds
   */
  stopAllSounds(): void {
    this.soundInstances.forEach((source) => {
      try {
        source.stop();
      } catch (e) {
        // Already stopped
      }
    });
    this.soundInstances.clear();
  }

  /**
   * Play dynamic music based on game intensity
   */
  playDynamicMusic(intensity: number = 0.5): void {
    this.musicIntensity = Math.max(0, Math.min(1, intensity));
    this.musicTempo = 120 + intensity * 40; // 120-160 BPM

    if (this.currentMusic) {
      this.currentMusic.stop();
    }

    // Generate and play music
    this.generateDynamicMusicTrack(intensity);
  }

  /**
   * Set master volume (0-1)
   */
  setMasterVolume(volume: number): void {
    this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.audioContext.currentTime);
  }

  /**
   * Set music volume (0-1)
   */
  setMusicVolume(volume: number): void {
    this.musicGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.audioContext.currentTime);
  }

  /**
   * Set SFX volume (0-1)
   */
  setSFXVolume(volume: number): void {
    this.sfxGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.audioContext.currentTime);
  }

  // ============ PROCEDURAL SOUND GENERATION ============

  private generateGunfireSound(): void {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.2; // 200ms
    const samples = sampleRate * duration;
    const audioData = this.audioContext.createAudioBuffer(2, samples, sampleRate);
    const channelData = audioData.getChannelData(0);

    // Create impulse with exponential decay
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 15); // Fast decay
      const noise = Math.random() * 2 - 1;
      const sine = Math.sin(2 * Math.PI * 150 * t); // 150Hz tone
      channelData[i] = (noise * 0.3 + sine * 0.7) * envelope;
    }

    this.soundBuffers.set(SoundType.GUNFIRE, {
      context: this.audioContext,
      buffer: audioData as any,
      source: null,
    });
  }

  private generateExplosionSound(): void {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.8;
    const samples = sampleRate * duration;
    const audioData = this.audioContext.createAudioBuffer(2, samples, sampleRate);
    const channelData = audioData.getChannelData(0);

    // Deep rumble with noise
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 3); // Slower decay
      const noise = (Math.random() * 2 - 1) * 0.8;
      const bass = Math.sin(2 * Math.PI * 60 * t) * 0.5; // 60Hz bass
      channelData[i] = (noise + bass) * envelope;
    }

    this.soundBuffers.set(SoundType.EXPLOSION, {
      context: this.audioContext,
      buffer: audioData as any,
      source: null,
    });
  }

  private generateFootstepSound(): void {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.15;
    const samples = sampleRate * duration;
    const audioData = this.audioContext.createAudioBuffer(2, samples, sampleRate);
    const channelData = audioData.getChannelData(0);

    // Percussive click
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 20);
      const noise = Math.random() * 2 - 1;
      channelData[i] = noise * envelope * 0.4;
    }

    this.soundBuffers.set(SoundType.FOOTSTEP, {
      context: this.audioContext,
      buffer: audioData as any,
      source: null,
    });
  }

  private generateReloadSound(): void {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.6;
    const samples = sampleRate * duration;
    const audioData = this.audioContext.createAudioBuffer(2, samples, sampleRate);
    const channelData = audioData.getChannelData(0);

    // Metallic clink with reverb
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 4);
      const freq = 400 + Math.sin(t * Math.PI) * 200; // Freq sweep
      const sine = Math.sin(2 * Math.PI * freq * t);
      channelData[i] = sine * envelope * 0.5;
    }

    this.soundBuffers.set(SoundType.RELOAD, {
      context: this.audioContext,
      buffer: audioData as any,
      source: null,
    });
  }

  private generateKillSound(): void {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.4;
    const samples = sampleRate * duration;
    const audioData = this.audioContext.createAudioBuffer(2, samples, sampleRate);
    const channelData = audioData.getChannelData(0);

    // Ascending tone (victory)
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const envelope = 1 - t * 2;
      const freq = 440 + t * 220; // 440 -> 660 Hz
      const sine = Math.sin(2 * Math.PI * freq * t);
      channelData[i] = sine * envelope * 0.6;
    }

    this.soundBuffers.set(SoundType.KILL, {
      context: this.audioContext,
      buffer: audioData as any,
      source: null,
    });
  }

  private generateDeathSound(): void {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.6;
    const samples = sampleRate * duration;
    const audioData = this.audioContext.createAudioBuffer(2, samples, sampleRate);
    const channelData = audioData.getChannelData(0);

    // Descending tone (defeat)
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 2);
      const freq = 440 - t * 200; // 440 -> 240 Hz
      const sine = Math.sin(2 * Math.PI * freq * t);
      channelData[i] = sine * envelope * 0.6;
    }

    this.soundBuffers.set(SoundType.DEATH, {
      context: this.audioContext,
      buffer: audioData as any,
      source: null,
    });
  }

  private generateDynamicMusicTrack(intensity: number): void {
    // Generate a simple drum beat based on intensity
    const sampleRate = this.audioContext.sampleRate;
    const duration = 2; // 2 second loop
    const samples = sampleRate * duration;
    const audioData = this.audioContext.createAudioBuffer(2, samples, sampleRate);
    const channelData = audioData.getChannelData(0);

    // Drum pattern
    const beatLength = sampleRate / (this.musicTempo / 60);
    for (let i = 0; i < samples; i++) {
      const beatPos = (i % beatLength) / beatLength;
      const beat = Math.floor((i / beatLength) % 4);

      let sample = 0;

      // Kick drum on beats 0 and 2
      if ((beat === 0 || beat === 2) && beatPos < 0.1) {
        const kickFreq = 80 + beatPos * 200;
        sample += Math.sin(2 * Math.PI * kickFreq * beatPos) * (1 - beatPos * 10);
      }

      // Snare on beats 1 and 3 (at high intensity)
      if ((beat === 1 || beat === 3) && beatPos < 0.1 && intensity > 0.5) {
        sample += (Math.random() * 2 - 1) * (1 - beatPos * 10);
      }

      channelData[i] = sample * 0.3 * intensity;
    }

    // Play the music track
    try {
      const source = this.audioContext.createBufferSource();
      source.buffer = audioData;
      source.loop = true;
      source.connect(this.musicGain);
      source.start(0);
      this.currentMusic = source;
    } catch (e) {
      console.error('Error playing dynamic music:', e);
    }
  }
}

// Singleton instance
export const audioManager = new AudioManager();
