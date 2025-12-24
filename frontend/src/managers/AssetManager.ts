import fs from 'fs/promises';
import path from 'path';

/**
 * VITYAZ Asset Manager - Управление всеми графическими ассетами
 * Поддерживает анимации, спрайты врагов, эффекты и оружие
 */

export interface AnimationFrame {
  path: string;
  duration: number;
}

export interface Animation {
  name: string;
  frames: AnimationFrame[];
  loop: boolean;
}

export interface WeaponStats {
  id: number;
  name: string;
  damage: number;
  fireRate: number;
  magazine: number;
  recoil: number;
}

export class AssetManager {
  // АНИМАЦИИ ПЕРСОНАЖА
  static CHARACTER_ANIMATIONS = {
    idle: {
      frames: ['character_idle_0.png', 'character_idle_1.png', 'character_idle_2.png'],
      duration: 200,
      loop: true
    },
    walk: {
      frames: [
        'walk_frame_0.png', 'walk_frame_1.png', 'walk_frame_2.png',
        'walk_frame_3.png', 'walk_frame_4.png', 'walk_frame_5.png',
        'walk_frame_6.png', 'walk_frame_7.png'
      ],
      duration: 80,
      loop: true
    },
    fire: {
      frames: ['fire_frame_0.png', 'fire_frame_1.png', 'fire_frame_2.png'],
      duration: 50,
      loop: false
    },
    reload: {
      frames: ['reload_frame_0.png', 'reload_frame_1.png', 'reload_frame_2.png'],
      duration: 150,
      loop: false
    }
  };

  // ТИПЫ ВРАГОВ (4 типа с разными характеристиками)
  static ENEMY_TYPES = [
    { 
      type: 0, 
      name: 'Fighter', 
      color: '#469646',
      hp: 30,
      damage: 8,
      speed: 1.0
    },
    { 
      type: 1, 
      name: 'Militant', 
      color: '#641e1e',
      hp: 50,
      damage: 12,
      speed: 0.9
    },
    { 
      type: 2, 
      name: 'Commander', 
      color: '#1e1e1e',
      hp: 80,
      damage: 15,
      speed: 0.7
    },
    { 
      type: 3, 
      name: 'Sniper', 
      color: '#505060',
      hp: 40,
      damage: 20,
      speed: 0.5
    }
  ];

  // ЭФФЕКТЫ И АНИМАЦИИ ЭФФЕКТОВ
  static EFFECTS = {
    explosion: {
      frames: [
        'explosion_0.png', 'explosion_1.png', 'explosion_2.png',
        'explosion_3.png', 'explosion_4.png', 'explosion_5.png',
        'explosion_6.png', 'explosion_7.png'
      ],
      duration: 50,
      loop: false
    },
    impact: {
      path: 'impact_effect.png',
      duration: 200,
      loop: false
    },
    blood: {
      path: 'blood_splatter.png',
      duration: 300,
      loop: false
    }
  };

  // ОРУЖИЕ (4 типа: АК, Снайпер, ПКМ, Пистолет)
  static WEAPONS: WeaponStats[] = [
    { 
      id: 0, 
      name: 'AK-74M', 
      damage: 15, 
      fireRate: 10, 
      magazine: 30, 
      recoil: 2 
    },
    { 
      id: 1, 
      name: 'SVD', 
      damage: 45, 
      fireRate: 3, 
      magazine: 10, 
      recoil: 4 
    },
    { 
      id: 2, 
      name: 'RPK-74', 
      damage: 18, 
      fireRate: 8, 
      magazine: 40, 
      recoil: 2 
    },
    { 
      id: 3, 
      name: 'PMM', 
      damage: 20, 
      fireRate: 6, 
      magazine: 12, 
      recoil: 3 
    }
  ];

  static getCharacterAnimation(name: string): Animation | null {
    const anim = (this.CHARACTER_ANIMATIONS as any)[name];
    if (!anim) return null;
    return {
      name,
      frames: anim.frames.map((f: string) => ({
        path: `/assets/character/${f}`,
        duration: anim.duration
      })),
      loop: anim.loop
    };
  }

  static getEnemySprite(type: number): string {
    return `/assets/enemies/enemy_type_${type}.png`;
  }

  static getEnemyType(type: number) {
    return this.ENEMY_TYPES.find(e => e.type === type);
  }

  static getEffect(effectName: string): Animation | null {
    const effect = (this.EFFECTS as any)[effectName];
    if (!effect) return null;
    if (effect.frames) {
      return {
        name: effectName,
        frames: effect.frames.map((f: string) => ({
          path: `/assets/effects/${f}`,
          duration: effect.duration
        })),
        loop: effect.loop
      };
    }
    return null;
  }

  static getWeapon(id: number): WeaponStats | undefined {
    return this.WEAPONS.find(w => w.id === id);
  }

  static getAllWeapons(): WeaponStats[] {
    return this.WEAPONS;
  }

  static getWeaponIcon(id: number): string {
    return `/assets/weapons/weapon_${id}.png`;
  }
}

export default AssetManager;
