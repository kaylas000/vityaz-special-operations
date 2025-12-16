# 🎧 AUDIO INTEGRATION GUIDE - VITYAZ

**Версия:** 1.0  
**Дата:** 16.12.2025  
**Статус:** 📋 Ready for Implementation

---

## 📖 содержание

1. [Структура активов](#структура-активов)
2. [Типы аудио](#типы-аудио)
3. [Оптимизация](#оптимизация)
4. [Интеграция в Phaser](#интеграция-в-phaser)
5. [Аудио Manager](#аудио-manager)
6. [Performance Tips](#performance-tips)
7. [Troubleshooting](#troubleshooting)

---

## 📁 структура активов

```
frontend/public/assets/
└── audio/
    ├── music/
    │   ├── menu.mp3                    (~3-5 MB, loop)
    │   ├── gameplay.mp3                (~4-6 MB, loop)
    │   ├── boss-fight.mp3              (~5-7 MB, loop)
    │   ├── victory.mp3                 (~2-3 MB, no loop)
    │   ├── defeat.mp3                  (~2-3 MB, no loop)
    │   └── ambience-crowd.mp3          (~6-8 MB, loop)
    ├── sfx/
    │   ├── combat/
    │   │   ├── punch-1.mp3             (~50-100 KB)
    │   │   ├── punch-2.mp3             (~50-100 KB)
    │   │   ├── punch-3.mp3             (~50-100 KB)
    │   │   ├── kick-1.mp3              (~60-120 KB)
    │   │   ├── kick-2.mp3              (~60-120 KB)
    │   │   ├── heavy-attack.mp3        (~80-150 KB)
    │   │   ├── block.mp3               (~40-80 KB)
    │   │   ├── hit-pain.mp3            (~30-60 KB)
    │   │   ├── hit-enemy.mp3           (~40-80 KB)
    │   │   ├── knockdown.mp3           (~80-150 KB)
    │   │   └── critical-hit.mp3        (~100-180 KB)
    │   ├── ui/
    │   │   ├── button-click.mp3        (~20-40 KB)
    │   │   ├── button-hover.mp3        (~15-30 KB)
    │   │   ├── menu-transition.mp3     (~40-80 KB)
    │   │   ├── notification.mp3        (~30-60 KB)
    │   │   ├── error.mp3               (~30-60 KB)
    │   │   └── success.mp3             (~40-80 KB)
    │   ├── voice/
    │   │   ├── round-start.mp3         (~100-200 KB, announcer)
    │   │   ├── knockout.mp3            (~150-300 KB, announcer)
    │   │   ├── winner.mp3              (~200-400 KB, announcer)
    │   │   └── finish-him.mp3          (~150-300 KB, character)
    │   ├── environment/
    │   │   ├── crowd-cheer.mp3         (~200-400 KB)
    │   │   ├── crowd-boo.mp3           (~200-400 KB)
    │   │   ├── ring-bell.mp3           (~50-100 KB)
    │   │   └── wind.mp3                (~150-300 KB, loop)
    │   └── special/
    │       ├── combo-finish.mp3        (~200-400 KB)
    │       ├── special-move.mp3        (~300-600 KB)
    │       ├── power-up.mp3            (~100-200 KB)
    │       └── stun.mp3                (~80-150 KB)
    └── total: ~80-150 MB (zipped: ~20-40 MB)
```

---

## 🔊 типы аудио

### **1. Background Music**

```typescript
// Phaser сцена инициализация
preload() {
  // загрузить музыку
  this.load.audio('menu-music', 'assets/audio/music/menu.mp3');
  this.load.audio('gameplay-music', 'assets/audio/music/gameplay.mp3');
  this.load.audio('boss-music', 'assets/audio/music/boss-fight.mp3');
}

create() {
  // настроить музыку
  const music = this.sound.add('menu-music', {
    volume: 0.5,
    loop: true,
    delay: 0
  });

  music.play();

  // трансиция
  setTimeout(() => {
    this.sound.stopAll();
    this.sound.play('gameplay-music', { volume: 0.4, loop: true });
  }, 3000); // после 3 секунд
}
```

### **2. Sound Effects**

```typescript
preload() {
  // загружить эффекты
  this.load.audio('punch-1', 'assets/audio/sfx/combat/punch-1.mp3');
  this.load.audio('punch-2', 'assets/audio/sfx/combat/punch-2.mp3');
  this.load.audio('punch-3', 'assets/audio/sfx/combat/punch-3.mp3');
  this.load.audio('kick-1', 'assets/audio/sfx/combat/kick-1.mp3');
}

create() {
  // воспроизвести случайный эффект
  const punchSounds = ['punch-1', 'punch-2', 'punch-3'];
  const randomPunch = Phaser.Utils.Array.GetRandom(punchSounds);
  this.sound.play(randomPunch, { volume: 0.8 });
}
```

### **3. 3D Positional Audio**

```typescript
create() {
  // звук с позицию (лево/право)
  const punchEffect = this.sound.add('punch-1', {
    volume: 0.7,
    pan: 0.5 // 0 = лево, 0.5 = четверо, 1 = право
  });

  punchEffect.play();
}
```

### **4. Voice Lines**

```typescript
preload() {
  this.load.audio('announcer-round-start', 'assets/audio/sfx/voice/round-start.mp3');
  this.load.audio('announcer-knockout', 'assets/audio/sfx/voice/knockout.mp3');
}

create() {
  // аннаунсер говорит
  this.sound.play('announcer-round-start', { volume: 1.0 });
}
```

---

## ⚡ Оптимизация

### **Audio Format Recommendations**

| Основное | Формат | Bitrate | Размер | Качество |
|--------|--------|---------|--------|----------|
| Музыка | **MP3** | 128-192 kbps | Медиум | Отличное |
| SFX | **OGG** | 96 kbps | Маленький | Отличное |
| Голос | **MP3** | 160 kbps | Медиум | Отличное |
| Fallback | **WAV** | 16-bit | Очень большой | Отличное |

### **Compression Guide**

```bash
# MP3 компрессия (музыка)
ffmpeg -i input.wav -b:a 192k -q:a 5 output.mp3

# OGG компрессия (SFX)
ffmpeg -i input.wav -b:a 96k output.ogg

# Batch конвертация
for file in *.wav; do
  ffmpeg -i "$file" -b:a 128k "${file%.wav}.mp3"
done

# Онлайн: https://online-convert.com/
```

### **File Size Optimization**

```
Музыка (5 треков, 3 мин каждая):
  192 kbps MP3 = 3-5 MB до дров
  итого: ~15-25 MB

SFX (50+ эффектов, 0.5-3 сек):
  96 kbps OGG = 6-100 KB до дров
  итого: ~50-100 MB

Голос (10 линий, 1-5 сек):
  160 kbps MP3 = 10-200 KB до дров
  итого: ~5-10 MB

тОТАЛО: ~70-135 MB
```

### **Fallback Support**

```typescript
preload() {
  // Phaser автоматически выберет подходящий формат
  this.load.audio('music', [
    'assets/audio/music/menu.ogg',
    'assets/audio/music/menu.mp3',
    'assets/audio/music/menu.m4a'
  ]);
}
```

---

## 🎧 Интеграция в Phaser

### **Basic Setup**

```typescript
const config: Phaser.Types.Core.GameConfig = {
  audio: {
    disableWebAudio: false,
    noAudio: false
  }
};
```

### **Sound Manager Usage**

```typescript
class GameScene extends Phaser.Scene {
  preload() {
    // загружать все звуки
    this.loadAudio();
  }

  private loadAudio() {
    // Музыка
    this.load.audio('music-menu', 'assets/audio/music/menu.mp3');
    this.load.audio('music-battle', 'assets/audio/music/gameplay.mp3');

    // Эффекты
    this.load.audio('sfx-punch', 'assets/audio/sfx/combat/punch-1.mp3');
    this.load.audio('sfx-kick', 'assets/audio/sfx/combat/kick-1.mp3');
    this.load.audio('sfx-hit', 'assets/audio/sfx/combat/hit-enemy.mp3');
    this.load.audio('sfx-click', 'assets/audio/sfx/ui/button-click.mp3');
  }

  create() {
    // запустить музыку
    this.sound.play('music-menu', { volume: 0.5, loop: true });

    // вести кнопу доступным и овоспроизвести SFX
    const playButton = this.add.image(400, 300, 'button')
      .setInteractive()
      .on('pointerdown', () => {
        this.sound.play('sfx-click', { volume: 0.8 });
        this.startGame();
      });
  }

  private startGame() {
    // остановить и сменить музыку
    this.sound.stopByKey('music-menu');
    this.sound.play('music-battle', { volume: 0.4, loop: true });
  }

  update() {
    // отвлечи эффекты комбата
    if (this.isPlayerAttacking()) {
      this.playAttackSound();
    }
  }

  private playAttackSound() {
    const punchSounds = [
      'sfx-punch',
      'sfx-kick'
    ];
    const randomSound = Phaser.Utils.Array.GetRandom(punchSounds);
    this.sound.play(randomSound, { volume: 0.7 });
  }

  private isPlayerAttacking(): boolean {
    // логика атаки
    return true;
  }
}
```

---

## 📊 Аудио Manager

### **Custom Audio Manager Class**

```typescript
// src/managers/AudioManager.ts

export class AudioManager {
  private scene: Phaser.Scene;
  private soundVolume: number = 0.8;
  private musicVolume: number = 0.5;
  private currentMusic: Phaser.Sound.WebAudioSound | null = null;
  private soundPool: Map<string, Phaser.Sound.WebAudioSound> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.loadAllAudio();
  }

  private loadAllAudio() {
    // музыка
    this.scene.load.audio('menu-music', 'assets/audio/music/menu.mp3');
    this.scene.load.audio('battle-music', 'assets/audio/music/gameplay.mp3');
    this.scene.load.audio('boss-music', 'assets/audio/music/boss-fight.mp3');

    // эффекты
    this.loadCombatSounds();
    this.loadUISounds();
  }

  private loadCombatSounds() {
    const combatSounds = [
      'punch-1', 'punch-2', 'punch-3',
      'kick-1', 'kick-2',
      'block', 'hit-pain', 'hit-enemy'
    ];

    for (const sound of combatSounds) {
      this.scene.load.audio(
        `sfx-${sound}`,
        `assets/audio/sfx/combat/${sound}.mp3`
      );
    }
  }

  private loadUISounds() {
    const uiSounds = ['click', 'hover', 'success', 'error'];

    for (const sound of uiSounds) {
      this.scene.load.audio(
        `sfx-ui-${sound}`,
        `assets/audio/sfx/ui/${sound}.mp3`
      );
    }
  }

  // методы
  playMusic(key: string, volume?: number) {
    if (this.currentMusic) {
      this.currentMusic.stop();
    }

    const vol = volume ?? this.musicVolume;
    this.currentMusic = this.scene.sound.add(key, {
      volume: vol,
      loop: true
    });
    this.currentMusic.play();
  }

  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
  }

  playSFX(key: string, volume?: number) {
    const vol = volume ?? this.soundVolume;
    this.scene.sound.play(`sfx-${key}`, { volume: vol });
  }

  setMusicVolume(volume: number) {
    this.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
    if (this.currentMusic) {
      this.currentMusic.setVolume(this.musicVolume);
    }
  }

  setSFXVolume(volume: number) {
    this.soundVolume = Phaser.Math.Clamp(volume, 0, 1);
  }

  muteAll() {
    this.scene.sound.mute = true;
  }

  unmuteAll() {
    this.scene.sound.mute = false;
  }
}
```

### **Integration with React**

```typescript
// src/hooks/useAudioManager.ts

import { useEffect, useRef } from 'react';
import { AudioManager } from '@/managers/AudioManager';

export const useAudioManager = (scene: Phaser.Scene | null) => {
  const audioManagerRef = useRef<AudioManager | null>(null);

  useEffect(() => {
    if (scene) {
      audioManagerRef.current = new AudioManager(scene);
    }

    return () => {
      if (audioManagerRef.current) {
        audioManagerRef.current.muteAll();
      }
    };
  }, [scene]);

  return audioManagerRef.current;
};
```

---

## ⚙️ Performance Tips

### **1. Audio Pooling**

```typescript
class AudioPool {
  private pool: Phaser.Sound.WebAudioSound[] = [];
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, key: string, count: number) {
    this.scene = scene;

    for (let i = 0; i < count; i++) {
      const sound = scene.sound.add(key);
      this.pool.push(sound);
    }
  }

  get(): Phaser.Sound.WebAudioSound | undefined {
    return this.pool.pop();
  }

  release(sound: Phaser.Sound.WebAudioSound) {
    sound.stop();
    this.pool.push(sound);
  }
}
```

### **2. Lazy Loading**

```typescript
async loadAudioForScene(sceneName: string) {
  const audioAssets = this.getAudioAssetsForScene(sceneName);

  for (const asset of audioAssets) {
    this.scene.load.audio(asset.key, asset.path);
  }

  return new Promise((resolve) => {
    this.scene.load.once('complete', resolve);
    this.scene.load.start();
  });
}
```

### **3. Memory Management**

```typescript
shutdown() {
  // остановить все звуки
  this.scene.sound.stopAll();

  // очистить кэш
  this.scene.cache.audio.entries.clear();
}
```

---

## 🐛 Troubleshooting

### **Issue: Аудио не воспроизводится**

```typescript
// ✅ решение: Проверить путь и формат
this.load.audio('key', 'assets/audio/music/menu.mp3');

// проверить console на ошибки
this.load.on('loaderror', (file) => {
  console.error('Failed to load:', file.key);
});
```

### **Issue: Громкая гоамость**

```typescript
// ✅ решение: Компрессируй аудио
ffmpeg -i input.wav -b:a 96k output.ogg

// или используй fewer эффектов одновременно
const maxConcurrentSounds = 4;
this.scene.sound.soundManager.setMaxAudioInstances(maxConcurrentSounds);
```

### **Issue: Аудио context заблокирован**

```typescript
// ✅ решение: Повторите после user interaction
document.addEventListener('click', () => {
  this.scene.sound.context.resume();
});
```

### **Issue: Звук не синхронизируется с игрой**

```typescript
// ✅ решение: Аттач to timer instead of frame
this.time.delayedCall(1000, () => {
  this.sound.play('sfx-attack');
});
```

---

## 📊 Чек-лист для интеграции

- [ ] создать `/public/assets/audio/` структуру
- [ ] организовать аудио файлы по категориям
- [ ] компрессируй все аудио
- [ ] создать AudioManager класс
- [ ] настроить Phaser Audio
- [ ] создать анимации и SFX плее для сцен
- [ ] интегрируй с React хуками
- [ ] тестируй на разных браузерах
- [ ] настрой волум и настройки звука
- [ ] повторите performance tests

---

## 🔗 дополнительные ресурсы

- [Phaser 3 Audio](https://phaser.io/examples/v3/category/audio)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [FFmpeg Conversion](https://ffmpeg.org/)
- [Freesound.org](https://freesound.org/) - Audio Source
- [Bfxr.net](https://www.bfxr.net/) - Retro SFX Generator

---

**Версия:** 1.0  
**Дата обновления:** 16.12.2025  
**Статус:** ✅ Ready for Implementation
