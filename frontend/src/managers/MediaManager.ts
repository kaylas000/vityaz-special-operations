/**
 * MediaManager.ts
 * 
 * Объединенный менеджер для управления графикой и аудио
 */

import Phaser from 'phaser';

interface AssetConfig {
  key: string;
  path: string;
  type: 'image' | 'spritesheet' | 'atlas' | 'audio';
  frameWidth?: number;
  frameHeight?: number;
}

interface AnimationConfig {
  key: string;
  frames: string | number[];
  frameRate: number;
  repeat: number;
  yoyo?: boolean;
}

export class MediaManager {
  private scene: Phaser.Scene;
  private graphicsPath = 'assets/graphics';
  private audioPath = 'assets/audio';
  private soundVolume = 0.8;
  private musicVolume = 0.5;
  private currentMusic: Phaser.Sound.WebAudioSound | null = null;
  private loadedAssets = new Set<string>();
  private animations = new Map<string, AnimationConfig>();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initializeAudio();
  }

  /**
   * Презгружение всех необходимых ресурсов
   */
  preloadAssets(assetList: AssetConfig[]): void {
    for (const asset of assetList) {
      if (this.loadedAssets.has(asset.key)) continue;

      switch (asset.type) {
        case 'image':
          this.scene.load.image(asset.key, `${this.graphicsPath}/${asset.path}`);
          break;

        case 'spritesheet':
          this.scene.load.spritesheet(asset.key, `${this.graphicsPath}/${asset.path}`, {
            frameWidth: asset.frameWidth || 64,
            frameHeight: asset.frameHeight || 64
          });
          break;

        case 'atlas':
          const [imagePath, atlasPath] = asset.path.split('|');
          this.scene.load.atlas(
            asset.key,
            `${this.graphicsPath}/${imagePath}`,
            `${this.graphicsPath}/${atlasPath}`
          );
          break;

        case 'audio':
          this.scene.load.audio(asset.key, `${this.audioPath}/${asset.path}`);
          break;
      }

      this.loadedAssets.add(asset.key);
    }
  }

  /**
   * создание анимаций
   */
  createAnimations(animations: AnimationConfig[]): void {
    const animManager = this.scene.anims;

    for (const anim of animations) {
      if (animManager.exists(anim.key)) continue;

      let frames;

      if (typeof anim.frames === 'string') {
        // atlas или key для generateFrameNumbers
        frames = animManager.generateFrameNumbers(anim.frames, {
          start: 0,
          end: 7
        });
      } else {
        // custom frame массив
        frames = anim.frames;
      }

      animManager.create({
        key: anim.key,
        frames: frames as any,
        frameRate: anim.frameRate,
        repeat: anim.repeat,
        yoyo: anim.yoyo || false
      });

      this.animations.set(anim.key, anim);
    }
  }

  /**
   * воспроизведение музыки
   */
  playMusic(key: string, volume?: number, loop = true): Phaser.Sound.WebAudioSound {
    // остановить редые музыку
    if (this.currentMusic) {
      this.currentMusic.fadeOut(1000, () => {
        this.currentMusic?.stop();
      });
    }

    const vol = volume ?? this.musicVolume;
    const music = this.scene.sound.add(key, {
      volume: vol,
      loop: loop
    }) as Phaser.Sound.WebAudioSound;

    music.play();
    this.currentMusic = music;

    return music;
  }

  /**
   * стоп музыки
   */
  stopMusic(fadeOut = false): void {
    if (!this.currentMusic) return;

    if (fadeOut) {
      this.currentMusic.fadeOut(1000, () => {
        this.currentMusic?.stop();
        this.currentMusic = null;
      });
    } else {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
  }

  /**
   * воспроизведение эффекта
   */
  playSFX(key: string, volume?: number, pan?: number): Phaser.Sound.WebAudioSound {
    const vol = volume ?? this.soundVolume;
    const config: Phaser.Types.Sound.SoundConfig = { volume: vol };

    if (pan !== undefined) {
      config.pan = Phaser.Math.Clamp(pan, -1, 1);
    }

    const sound = this.scene.sound.add(key, config) as Phaser.Sound.WebAudioSound;
    sound.play();

    return sound;
  }

  /**
   * случайные эффекты (где несколько вариантов)
   */
  playRandomSFX(keys: string[], volume?: number, pan?: number): Phaser.Sound.WebAudioSound {
    const randomKey = Phaser.Utils.Array.GetRandom(keys);
    return this.playSFX(randomKey, volume, pan);
  }

  /**
   * сохранение спрайта с анимацией
   */
  createAnimatedSprite(
    x: number,
    y: number,
    textureKey: string,
    animKey?: string
  ): Phaser.Physics.Arcade.Sprite {
    const sprite = this.scene.physics.add.sprite(x, y, textureKey);

    if (animKey && this.animations.has(animKey)) {
      sprite.play(animKey);
    }

    return sprite;
  }

  /**
   * оптимизация памяти
   */
  cleanup(): void {
    this.stopMusic();
    this.scene.sound.stopAll();
    this.scene.cache.glsl.clear();
    this.loadedAssets.clear();
    this.animations.clear();
  }

  /**
   * настройки звука
   */
  setMusicVolume(volume: number): void {
    this.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
    if (this.currentMusic) {
      this.currentMusic.setVolume(this.musicVolume);
    }
  }

  setSFXVolume(volume: number): void {
    this.soundVolume = Phaser.Math.Clamp(volume, 0, 1);
  }

  mute(): void {
    this.scene.sound.mute = true;
  }

  unmute(): void {
    this.scene.sound.mute = false;
  }

  /**
   * инициализация аудио
   */
  private initializeAudio(): void {
    // проверя контекст аудио
    document.addEventListener('click', () => {
      if (this.scene.sound.context.state === 'suspended') {
        this.scene.sound.context.resume().catch(() => {
          console.log('Audio context resume failed');
        });
      }
    });

    // обработка ошибок загружки
    this.scene.load.on('loaderror', (file: any) => {
      console.error(`Failed to load ${file.type}: ${file.key}`);
    });
  }

  /**
   * получение текущего имужества
   */
  getCurrentMusicKey(): string | null {
    return this.currentMusic?.key || null;
  }

  isMusicPlaying(): boolean {
    return this.currentMusic?.isPlaying ?? false;
  }

  /**
   * получение ассетов для сцены
   */
  static getAssetsForScene(sceneName: string): AssetConfig[] {
    const assets: Record<string, AssetConfig[]> = {
      MenuScene: [
        { key: 'menu-bg', path: 'text/splash-screens/loading.png', type: 'image' },
        { key: 'play-button', path: 'ui/buttons/play-idle.png', type: 'image' },
        { key: 'menu-music', path: 'music/menu.mp3', type: 'audio' },
        { key: 'ui-click', path: 'sfx/ui/button-click.mp3', type: 'audio' }
      ],
      GameScene: [
        { key: 'player', path: 'characters/player/idle.png', type: 'spritesheet', frameWidth: 128, frameHeight: 128 },
        { key: 'enemy', path: 'characters/enemies/opponent/idle.png', type: 'spritesheet', frameWidth: 128, frameHeight: 128 },
        { key: 'dojo-bg', path: 'environments/dojo/background.png', type: 'image' },
        { key: 'dojo-floor', path: 'environments/dojo/floor.png', type: 'image' },
        { key: 'health-bar', path: 'ui/panels/health-bar.png', type: 'image' },
        { key: 'gameplay-music', path: 'music/gameplay.mp3', type: 'audio' },
        { key: 'punch-1', path: 'sfx/combat/punch-1.mp3', type: 'audio' },
        { key: 'punch-2', path: 'sfx/combat/punch-2.mp3', type: 'audio' },
        { key: 'kick-1', path: 'sfx/combat/kick-1.mp3', type: 'audio' },
        { key: 'hit-enemy', path: 'sfx/combat/hit-enemy.mp3', type: 'audio' }
      ]
    };

    return assets[sceneName] || [];
  }

  /**
   * получение анимаций для сцены
   */
  static getAnimationsForScene(sceneName: string): AnimationConfig[] {
    const animations: Record<string, AnimationConfig[]> = {
      GameScene: [
        {
          key: 'player-walk',
          frames: 'player',
          frameRate: 10,
          repeat: -1
        },
        {
          key: 'player-attack',
          frames: 'player',
          frameRate: 12,
          repeat: 0
        },
        {
          key: 'enemy-idle',
          frames: 'enemy',
          frameRate: 8,
          repeat: -1
        },
        {
          key: 'enemy-attack',
          frames: 'enemy',
          frameRate: 10,
          repeat: 0
        }
      ]
    };

    return animations[sceneName] || [];
  }
}
