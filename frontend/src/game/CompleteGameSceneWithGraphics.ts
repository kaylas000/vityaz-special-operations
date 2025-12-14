import Phaser from 'phaser';
import AssetManager from '../managers/AssetManager';
import { io, Socket } from 'socket.io-client';

/**
 * VITYAZ: COMPLETE GAME WITH FULL GRAPHICS
 * ПОЛНАЯ ИНТЕГРАЦИЙ ГРАФИКИ, АНИМАЦИЙ и BACKEND
 */

interface PlayerStats {
  id: string;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  weapon: number;
  ammo: number;
  kills: number;
  score: number;
  alive: boolean;
}

interface EnemySprite {
  x: number;
  y: number;
  type: number;
  health: number;
  maxHealth: number;
  sprite: Phaser.Physics.Arcade.Sprite;
  animKey: string;
  lastFireTime: number;
}

interface GameState {
  wave: number;
  enemies: EnemySprite[];
  score: number;
  kills: number;
  gameOver: boolean;
  paused: boolean;
  enemiesSpawned: number;
  enemiesKilled: number;
}

export class CompleteGameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerStats: PlayerStats = {
    id: 'player-' + Date.now(),
    x: 0,
    y: 0,
    health: 100,
    maxHealth: 100,
    weapon: 0,
    ammo: 30,
    kills: 0,
    score: 0,
    alive: true
  };

  private enemies: EnemySprite[] = [];
  private gameState: GameState = {
    wave: 1,
    enemies: [],
    score: 0,
    kills: 0,
    gameOver: false,
    paused: false,
    enemiesSpawned: 0,
    enemiesKilled: 0
  };

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: any;
  private socket!: Socket;
  private hud!: Phaser.GameObjects.Graphics;
  private animationManager!: Map<string, any>;
  private assetManager = AssetManager;
  private soundManager!: SoundManager;
  private effectsLayer!: Phaser.GameObjects.Layer;
  private hudText: { [key: string]: Phaser.GameObjects.Text } = {};

  constructor() {
    super({ key: 'CompleteGameScene' });
  }

  preload() {
    // Лоад усех график и ассетов
    this.loadCharacterAssets();
    this.loadEnemyAssets();
    this.loadEffectAssets();
    this.loadWeaponAssets();
    this.loadAudioAssets();
  }

  private loadCharacterAssets() {
    // Персонаж
    this.load.image('char_idle', '/assets/character/character_idle_0.png');
    this.load.spritesheet('char_walk', '/assets/character/walk_frame_0.png', {
      frameWidth: 64,
      frameHeight: 96
    });
    this.load.spritesheet('char_fire', '/assets/character/fire_frame_0.png', {
      frameWidth: 64,
      frameHeight: 96
    });
    this.load.spritesheet('char_reload', '/assets/character/reload_frame_0.png', {
      frameWidth: 64,
      frameHeight: 96
    });
  }

  private loadEnemyAssets() {
    // Враги (4 типа)
    for (let i = 0; i < 4; i++) {
      this.load.image(`enemy_${i}`, `/assets/enemies/enemy_type_${i}.png`);
    }
  }

  private loadEffectAssets() {
    // Эффекты
    this.load.spritesheet('explosion', '/assets/effects/explosion_0.png', {
      frameWidth: 128,
      frameHeight: 128
    });
    this.load.image('blood', '/assets/effects/blood_splatter.png');
    this.load.image('impact', '/assets/effects/impact_effect.png');
  }

  private loadWeaponAssets() {
    // Оружие
    for (let i = 0; i < 4; i++) {
      this.load.image(`weapon_${i}`, `/assets/weapons/weapon_${i}.png`);
    }
  }

  private loadAudioAssets() {
    // Аудио (сохраним на бакенде)
    this.load.audio('gunshot_ak', '/audio/gunshot_ak74m.mp3');
    this.load.audio('gunshot_sniper', '/audio/gunshot_svd.mp3');
    this.load.audio('explosion', '/audio/explosion.mp3');
    this.load.audio('enemy_death', '/audio/enemy_death.mp3');
    this.load.audio('reload', '/audio/reload.mp3');
  }

  create() {
    // Сохраняем постоянные количества
    const { width, height } = this.cameras.main;
    this.playerStats.x = width / 2;
    this.playerStats.y = height / 2;

    // Настройки физики
    this.physics.world.setBounds(0, 0, width, height);
    this.cameras.main.setBounds(0, 0, width, height);

    // Создание групп
    this.effectsLayer = this.add.layer();

    // Создание персонажа
    this.createPlayer();

    // Настройка анимаций
    this.setupAnimations();

    // Настройка ввода
    this.setupControls();

    // Настройка HUD
    this.setupHUD();

    // Настройка связи с backend
    this.setupSocketConnection();

    // Настройка звука
    this.soundManager = new SoundManager(this.sound);

    // Принять фокус
    this.game.canvas.focus();
  }

  private createPlayer() {
    // Создание спрайта персонажа
    this.player = this.physics.add.sprite(
      this.playerStats.x,
      this.playerStats.y,
      'char_idle'
    );

    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);
    this.player.setDrag(0.95);
    this.player.setScale(2);
    this.player.setTint(0xffffff);

    // Камера следит за игроком
    this.cameras.main.startFollow(this.player);
  }

  private setupAnimations() {
    // Валк (ходьба)
    if (!this.anims.exists('walk')) {
      this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('char_walk', {
          start: 0,
          end: 7
        }),
        frameRate: 12,
        repeat: -1
      });
    }

    // Штурм (стрельба)
    if (!this.anims.exists('fire')) {
      this.anims.create({
        key: 'fire',
        frames: this.anims.generateFrameNumbers('char_fire', {
          start: 0,
          end: 2
        }),
        frameRate: 20,
        repeat: 0
      });
    }

    // Перезарядка
    if (!this.anims.exists('reload')) {
      this.anims.create({
        key: 'reload',
        frames: this.anims.generateFrameNumbers('char_reload', {
          start: 0,
          end: 2
        }),
        frameRate: 10,
        repeat: 0
      });
    }

    // Взрыв
    if (!this.anims.exists('explosion')) {
      this.anims.create({
        key: 'explosion',
        frames: this.anims.generateFrameNumbers('explosion', {
          start: 0,
          end: 7
        }),
        frameRate: 16,
        repeat: 0
      });
    }
  }

  private setupControls() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasdKeys = this.input.keyboard!.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE,
      R: Phaser.Input.Keyboard.KeyCodes.R,
      P: Phaser.Input.Keyboard.KeyCodes.P,
      E: Phaser.Input.Keyboard.KeyCodes.E,
      Q: Phaser.Input.Keyboard.KeyCodes.Q
    });

    // Мышь
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.gameState.gameOver && !this.gameState.paused) {
        this.fireWeapon(pointer.x, pointer.y);
      }
    });
  }

  private setupHUD() {
    // Камера UI фиксирована
    const uiCamera = this.cameras.add(0, 0, 1024, 768);
    uiCamera.setScroll(0, 0);

    // Текст HUD
    this.hudText.health = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#fff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.hudText.health.setCamera(uiCamera);
    this.hudText.health.setScrollFactor(0);

    this.hudText.ammo = this.add.text(20, 60, '', {
      fontSize: '24px',
      color: '#fff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.hudText.ammo.setCamera(uiCamera);
    this.hudText.ammo.setScrollFactor(0);

    this.hudText.score = this.add.text(20, 100, '', {
      fontSize: '24px',
      color: '#ffd700',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.hudText.score.setCamera(uiCamera);
    this.hudText.score.setScrollFactor(0);

    this.hudText.wave = this.add.text(850, 20, '', {
      fontSize: '24px',
      color: '#ff6b6b',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.hudText.wave.setCamera(uiCamera);
    this.hudText.wave.setScrollFactor(0);

    this.hudText.kills = this.add.text(850, 60, '', {
      fontSize: '24px',
      color: '#4ecdc4',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.hudText.kills.setCamera(uiCamera);
    this.hudText.kills.setScrollFactor(0);
  }

  private setupSocketConnection() {
    // Подключение к backend
    const socketUrl = process.env.VITE_SOCKET_URL || 'http://localhost:3000';
    this.socket = io(socketUrl);

    // События
    this.socket.on('connect', () => {
      console.log('📄 Connected to backend');
      this.socket.emit('playerJoined', {
        playerId: this.playerStats.id,
        playerName: 'Player'
      });
    });

    this.socket.on('enemySpawned', (data: any) => {
      this.spawnEnemy(data.x, data.y, data.type);
    });

    this.socket.on('scoreUpdate', (data: any) => {
      this.gameState.score = data.score;
    });

    this.socket.on('waveUpdate', (data: any) => {
      this.gameState.wave = data.wave;
    });
  }

  update() {
    if (this.gameState.gameOver || this.gameState.paused) return;

    // Обновление позиции персонажа
    this.updatePlayerMovement();

    // Обновление врагов
    this.updateEnemies();

    // Обновление HUD
    this.updateHUD();

    // Обновление синхронизации
    this.syncWithBackend();
  }

  private updatePlayerMovement() {
    const moveSpeed = 200;
    let velocityX = 0;
    let velocityY = 0;
    let isMoving = false;

    // Клавиши
    if (this.cursors.left!.isDown || this.wasdKeys.A.isDown) {
      velocityX = -moveSpeed;
      isMoving = true;
    } else if (this.cursors.right!.isDown || this.wasdKeys.D.isDown) {
      velocityX = moveSpeed;
      isMoving = true;
    }

    if (this.cursors.up!.isDown || this.wasdKeys.W.isDown) {
      velocityY = -moveSpeed;
      isMoving = true;
    } else if (this.cursors.down!.isDown || this.wasdKeys.S.isDown) {
      velocityY = moveSpeed;
      isMoving = true;
    }

    // Нормализация диагонального движения
    const len = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    if (len > 0) {
      velocityX = (velocityX / len) * moveSpeed;
      velocityY = (velocityY / len) * moveSpeed;
    }

    this.player.setVelocity(velocityX, velocityY);

    // Анимация
    if (isMoving) {
      if (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== 'walk') {
        this.player.play('walk', true);
      }
    } else {
      this.player.stop();
      this.player.setTexture('char_idle');
    }

    // Обновляем позицию
    this.playerStats.x = this.player.x;
    this.playerStats.y = this.player.y;
  }

  private updateEnemies() {
    for (const enemy of this.gameState.enemies) {
      if (enemy.health <= 0) continue;

      // Вычисляем расстояние до игрока
      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Наверстка метки
      if (dist > 0) {
        const speed = this.assetManager.getEnemyType(enemy.type)?.speed || 1;
        enemy.sprite.setVelocity(
          (dx / dist) * 100 * speed,
          (dy / dist) * 100 * speed
        );
      }

      // Попытка стрелять
      if (dist < 300) {
        const now = Date.now();
        const fireRate = this.assetManager.getEnemyType(enemy.type)?.damage || 10;
        if (now - enemy.lastFireTime > 2000 / fireRate) {
          this.enemyFire(enemy);
          enemy.lastFireTime = now;
        }
      }
    }
  }

  private fireWeapon(x: number, y: number) {
    const weapon = this.assetManager.getWeapon(this.playerStats.weapon);
    if (!weapon || this.playerStats.ammo <= 0) return;

    // Влываем оружие
    this.player.play('fire', true);
    this.soundManager.playSound('gunshot_ak');

    // Уменьшаем боезапас
    this.playerStats.ammo--;

    // Проверяем врагов
    this.checkHits(x, y);

    // Отдача
    const recoil = weapon.recoil;
    const dx = x - this.player.x;
    const dy = y - this.player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      this.player.setVelocity(
        -(dx / dist) * recoil * 50,
        -(dy / dist) * recoil * 50
      );
    }

    // Отсылаем эффект пили
    this.createImpactEffect(x, y);
  }

  private checkHits(x: number, y: number) {
    const weapon = this.assetManager.getWeapon(this.playerStats.weapon)!;
    const hitRadius = 50;

    for (const enemy of this.gameState.enemies) {
      if (enemy.health <= 0) continue;

      const dx = x - enemy.x;
      const dy = y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < hitRadius) {
        enemy.health -= weapon.damage;
        this.createBlood(enemy.x, enemy.y);

        if (enemy.health <= 0) {
          this.killEnemy(enemy);
        }
      }
    }
  }

  private killEnemy(enemy: EnemySprite) {
    this.gameState.kills++;
    this.playerStats.kills++;
    this.playerStats.score += 100;

    // анимация взрыва
    const explosion = this.add.sprite(enemy.x, enemy.y, 'explosion');
    explosion.play('explosion');
    this.soundManager.playSound('explosion');

    // Отключаем спрайт
    enemy.sprite.destroy();
    enemy.health = -1;

    // Отправляем на бэкенд
    if (this.socket) {
      this.socket.emit('enemyKilled', {
        playerId: this.playerStats.id,
        enemyType: enemy.type,
        score: 100
      });
    }
  }

  private spawnEnemy(x?: number, y?: number, type: number = 0) {
    const { width, height } = this.cameras.main;
    const spawnX = x || Phaser.Math.Between(100, width - 100);
    const spawnY = y || Phaser.Math.Between(100, height - 100);

    const sprite = this.physics.add.sprite(spawnX, spawnY, `enemy_${type}`);
    sprite.setCollideWorldBounds(true);
    sprite.setBounce(0.2);
    sprite.setScale(2);

    const enemyType = this.assetManager.getEnemyType(type)!;
    const enemy: EnemySprite = {
      x: spawnX,
      y: spawnY,
      type,
      health: enemyType.hp,
      maxHealth: enemyType.hp,
      sprite,
      animKey: `enemy_${type}_walk`,
      lastFireTime: Date.now()
    };

    this.gameState.enemies.push(enemy);
    this.gameState.enemiesSpawned++;
  }

  private enemyFire(enemy: EnemySprite) {
    // Враг стреляет
    this.soundManager.playSound('gunshot_sniper');
  }

  private createBlood(x: number, y: number) {
    const blood = this.add.image(x, y, 'blood');
    blood.setAlpha(0.8);
    blood.setScale(0.5 + Math.random() * 0.5);
    blood.setRotation(Math.random() * Math.PI * 2);

    this.tweens.add({
      targets: blood,
      alpha: 0,
      duration: 1000,
      onComplete: () => blood.destroy()
    });
  }

  private createImpactEffect(x: number, y: number) {
    const impact = this.add.image(x, y, 'impact');
    impact.setScale(0.5);
    impact.setAlpha(0.8);

    this.tweens.add({
      targets: impact,
      scale: 1.5,
      alpha: 0,
      duration: 300,
      onComplete: () => impact.destroy()
    });
  }

  private updateHUD() {
    const weapon = this.assetManager.getWeapon(this.playerStats.weapon)!;

    this.hudText.health.setText(
      `❤️ HP: ${this.playerStats.health}/${this.playerStats.maxHealth}`
    );

    this.hudText.ammo.setText(
      `🔫 Ammo: ${this.playerStats.ammo}/${weapon.magazine}`
    );

    this.hudText.score.setText(
      `🎯 Score: ${this.gameState.score}`
    );

    this.hudText.wave.setText(
      `🌊 Wave: ${this.gameState.wave}`
    );

    this.hudText.kills.setText(
      `💯 Kills: ${this.playerStats.kills}`
    );
  }

  private syncWithBackend() {
    if (this.socket && this.socket.connected) {
      this.socket.emit('playerUpdate', {
        playerId: this.playerStats.id,
        x: this.playerStats.x,
        y: this.playerStats.y,
        health: this.playerStats.health,
        score: this.playerStats.score,
        kills: this.playerStats.kills,
        weapon: this.playerStats.weapon
      });
    }
  }
}

/**
 * Менеджер звука
 */
class SoundManager {
  private soundManager: Phaser.Sound.BaseSoundManager;
  private sounds: Map<string, Phaser.Sound.BaseSound> = new Map();

  constructor(soundManager: Phaser.Sound.BaseSoundManager) {
    this.soundManager = soundManager;
  }

  playSound(key: string, volume: number = 0.5) {
    if (this.soundManager.get(key)) {
      const sound = this.soundManager.get(key);
      sound.setVolume(volume);
      sound.play();
    }
  }

  stopSound(key: string) {
    if (this.soundManager.get(key)) {
      this.soundManager.get(key).stop();
    }
  }
}

export default CompleteGameScene;
