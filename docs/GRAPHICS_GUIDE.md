# 🎨 VITYAZ: Graphics & Visual Assets Guide

**Created:** December 13, 2025  
**Project:** VITYAZ: Special Operations  
**Style:** Realistic Tactical Military with Russian Special Forces Authenticity

---

## 📋 Table of Contents

1. [Visual Identity](#visual-identity)
2. [Art Style & Direction](#art-style--direction)
3. [Character Sprites](#character-sprites)
4. [Weapons & Equipment](#weapons--equipment)
5. [UI/UX Design](#uiux-design)
6. [Maps & Environments](#maps--environments)
7. [Effects & Animations](#effects--animations)
8. [Implementation Guide](#implementation-guide)
9. [Asset Organization](#asset-organization)
10. [Performance Optimization](#performance-optimization)

---

## 1. Visual Identity

### 1.1 Core Brand Elements

**Primary Colors:**
- **Краповый (Krapovy) Maroon:** `#8B1538` - Signature color of Vityaz beret
- **Military Green:** `#3D4A3D` - Combat uniform base
- **Tactical Black:** `#1A1A1A` - Equipment and accents
- **Gold Accent:** `#D4AF37` - Insignia and achievements

**Secondary Colors:**
- Russian Flag: `#FFFFFF`, `#0039A6`, `#D52B1E`
- Combat Brown: `#4A3C2A`
- Urban Gray: `#5A5A5A`

### 1.2 Символика отряда "Витязь"

**Исторический контекст:**
- Отряд "Витязь" - элитное подразделение спецназа ВВ МВД России
- Основан в 1990-х годах
- Легендарный краповый берет - символ высшей квалификации
- Берет заложен на левую сторону (важная деталь!)

**Ключевые элементы:**
- Краповый берет (НЕ красный!) - цвет темно-малиновый/бордовый
- Кокарда с государственной символикой
- Нашивка "ВИТЯЗЬ" кириллицей
- Эмблема: средневековый русский воин (витязь) со щитом и мечом

---

## 2. Art Style & Direction

### 2.1 Chosen Style: **Modern Tactical Realism**

**Justification:**
- Appeals to tactical shooter fans
- Authentic military aesthetic
- Professional, serious tone
- Stands out in blockchain gaming

**Visual Reference Games:**
- Counter-Strike 2 (clean, readable)
- Valorant (stylized but tactical)
- Rainbow Six Siege (realistic equipment)
- Escape from Tarkov (authentic Russian gear)

### 2.2 Top-Down Perspective (45° Angle)

**Why Top-Down?**
- Easier to implement with Phaser 3
- Clear tactical view of battlefield
- Lower art production cost
- Classic tactical shooter feel
- Better for multiplayer sync

**Camera Settings:**
```typescript
// Phaser 3 camera configuration
const camera = this.cameras.main;
camera.setZoom(1.5);
camera.startFollow(player, true, 0.1, 0.1);
camera.setDeadzone(150, 150);
```

### 2.3 Art Pipeline

```
Concept Art → 3D Model (Optional) → 2D Sprite → Animation → Integration
     ↓              ↓                   ↓            ↓           ↓
  Sketch        Blender             Photoshop     Aseprite   Phaser 3
```

---

## 3. Character Sprites

### 3.1 Vityaz Operator - Main Character

**Generated Reference:** [1]

**Specifications:**
- **Size:** 64x64 pixels (base sprite)
- **Resolution:** 128x128 for HD displays
- **Format:** PNG with transparency
- **Animation Frames:** 8 directions × 4 frames each = 32 frames

**Key Features:**
1. **Краповый берет** заложен налево
2. Тактическая броня зеленого цвета
3. Автомат АК-74М в руках
4. Тактический жилет с подсумками
5. Камуфляж "Флора" или "Цифра"

**Sprite Sheet Layout:**
```
Row 1: North (8 frames)
Row 2: Northeast (8 frames)
Row 3: East (8 frames)
Row 4: Southeast (8 frames)
Row 5: South (8 frames)
Row 6: Southwest (8 frames)
Row 7: West (8 frames)
Row 8: Northwest (8 frames)
```

**Animation States:**
- Idle (breathing animation)
- Walk (4 frames)
- Run (4 frames)
- Shoot (2 frames)
- Reload (6 frames)
- Death (5 frames)
- Crouch (3 frames)

### 3.2 Character Classes

#### A. Assault (Штурмовик)
- **Primary:** AK-74M
- **Armor:** Heavy (темно-зеленый)
- **Speed:** Medium
- **Special:** Краповый берет

#### B. Sniper (Снайпер)
- **Primary:** SVD Dragunov
- **Armor:** Light (камуфляж "Березка")
- **Speed:** High
- **Special:** Ghillie suit elements

#### C. Support (Пулеметчик)
- **Primary:** RPK-74
- **Armor:** Heavy
- **Speed:** Low
- **Special:** Ammo belt

### 3.3 Character Customization

**Unlockable Items:**
- 5 берет colors (краповый, черный, синий, зеленый, камуфляж)
- 10 камуфляжей (Флора, Цифра, Березка, Горка, etc.)
- 8 нашивок (регионы России, достижения)
- 15 weapon skins

---

## 4. Weapons & Equipment

### 4.1 Weapon Assets Collection

**Generated Reference:** [3]

**Primary Weapons:**

#### AK-74M (Assault Rifle)
```
Sprite Size: 32x16 pixels
Damage: 30
Fire Rate: 600 RPM
Accuracy: 85%
Color: Black/Dark Green
```

#### SVD Dragunov (Sniper Rifle)
```
Sprite Size: 48x12 pixels
Damage: 100
Fire Rate: 30 RPM
Accuracy: 98%
Color: Wood Brown/Black
```

#### RPK-74 (Light Machine Gun)
```
Sprite Size: 40x18 pixels
Damage: 25
Fire Rate: 650 RPM
Accuracy: 75%
Color: Black/Dark Green
```

#### PMM Makarov (Pistol)
```
Sprite Size: 16x12 pixels
Damage: 20
Fire Rate: 400 RPM
Accuracy: 70%
Color: Black
```

**Secondary Equipment:**
- F-1 Hand Grenade (sprite: 8x8)
- Smoke Grenade (sprite: 8x8)
- Flashbang (sprite: 8x8)
- Combat Knife (sprite: 16x8)

### 4.2 Weapon Sprite Sheets

**Structure:**
```
weapons/
├── ak74m/
│   ├── idle.png (32x16)
│   ├── fire_01.png
│   ├── fire_02.png (muzzle flash)
│   ├── reload_01.png
│   ├── reload_02.png
│   └── reload_03.png
├── svd/
├── rpk74/
└── pmm/
```

**Muzzle Flash:**
- 3 frame animation
- Bright yellow-orange (#FFA500)
- 16x16 pixels
- Additive blend mode

### 4.3 Equipment Icons

**For Inventory UI:**
- Size: 64x64 pixels
- Style: Isometric 3D-look
- Background: Transparent
- Border: 2px dark outline

---

## 5. UI/UX Design

### 5.1 Main Menu Design

**Layout:**
```
┌─────────────────────────────────────────┐
│  [VITYAZ Logo + Emblem]                 │
│                                         │
│         ╔═══════════════╗              │
│         ║  ИГРАТЬ       ║              │
│         ╠═══════════════╣              │
│         ║  АРСЕНАЛ      ║              │
│         ╠═══════════════╣              │
│         ║  РЕЙТИНГ      ║              │
│         ╠═══════════════╣              │
│         ║  НАСТРОЙКИ    ║              │
│         ╚═══════════════╝              │
│                                         │
│  [Wallet: 1,234 $VITYAZ] [Settings ⚙] │
└─────────────────────────────────────────┘
```

**Color Scheme:**
- Background: Dark military green gradient
- Buttons: Krapovy maroon with gold text
- Accent: Gold (#D4AF37)
- Text: White (#FFFFFF)

### 5.2 HUD (Heads-Up Display)

**In-Game HUD Layout:**
```
┌─────────────────────────────────────────┐
│ HP: ████████░░ 80/100   [Minimap]      │
│ ARMOR: ██████░░░░ 60/100               │
│                                    [K:5]│
│                                    [D:2]│
│                                         │
│                                         │
│                      [CROSSHAIR]        │
│                                         │
│                                         │
│                                         │
│ [AK-74M]                                │
│ Ammo: 28/30                             │
│ Reserve: 180                            │
└─────────────────────────────────────────┘
```

**HUD Elements:**

1. **Health Bar:**
   - Green gradient (100% → 50%)
   - Yellow (50% → 25%)
   - Red (25% → 0%)
   - Pulsing animation when low

2. **Armor Bar:**
   - Blue gradient
   - Icon: Shield

3. **Minimap:**
   - 150x150 pixels
   - Top-right corner
   - Teammates: Blue dots
   - Enemies: Red dots
   - Radar sweep effect

4. **Crosshair:**
   - Dynamic spread
   - Color: White with red hit marker
   - Size: 24x24 pixels

5. **Weapon Info:**
   - Weapon icon
   - Ammo counter (large font)
   - Reserve ammo

### 5.3 Эмблема "Витязь"

**Generated Reference:** [2]

**Placement:**
- Main menu (center-top, 256x256)
- Loading screen (512x512)
- Character patches (32x32)
- UI corners (64x64)
- Victory screen (400x400)

**Design Elements:**
- Medieval Russian warrior (витязь)
- Sword and shield
- Cyrillic "ВИТЯЗЬ" text
- Maroon, black, gold colors
- Russian heraldry style

---

## 6. Maps & Environments

### 6.1 Map Themes

#### A. Urban Combat (Городской бой)
**Location:** Moscow streets
**Assets Needed:**
- Concrete buildings (top-down)
- Vehicles (cars, trucks)
- Street props (benches, signs)
- Cover objects (concrete barriers)

#### B. Military Base (Военная база)
**Location:** Vityaz training facility
**Assets Needed:**
- Barracks buildings
- Obstacle course
- Training grounds
- Watchtowers

#### C. Forest Operations (Лесные операции)
**Location:** Russian woodland
**Assets Needed:**
- Pine trees (top-down view)
- Bushes (partial cover)
- Rocks
- Dirt paths

### 6.2 Tile Sets

**Ground Tiles (32x32 each):**
- Concrete (gray, cracked)
- Asphalt (black, weathered)
- Dirt (brown)
- Grass (green, dark green)
- Wood flooring (indoor)

**Wall Tiles (32x32):**
- Brick wall (red/brown)
- Concrete wall (gray)
- Metal fence (black)
- Wooden fence (brown)

### 6.3 Environmental Objects

**Interactive:**
- Doors (can open/close)
- Windows (can break)
- Crates (destructible cover)
- Barrels (explosive)

**Decorative:**
- Russian flags
- Posters with Cyrillic text
- Military equipment
- Sandbags

---

## 7. Effects & Animations

### 7.1 Visual Effects

#### Gunfire Effects
```typescript
// Muzzle flash
const flash = this.add.sprite(x, y, 'muzzle_flash');
flash.play('flash_anim');
flash.on('animationcomplete', () => flash.destroy());
```

**Effects List:**
- Muzzle flash (3 frames, yellow-orange)
- Bullet tracer (line particle)
- Shell casing ejection (small brass sprite)
- Blood splatter (red particles, 16x16)
- Smoke trail (gray particles)

#### Explosion Effects
- Grenade explosion: 64x64 sprite, 8 frames
- Dust cloud: particle emitter
- Screen shake: camera trauma

#### Environmental Effects
- Rain (particles, optional)
- Fog (overlay, reduces visibility)
- Day/night cycle (lighting tint)

### 7.2 Particle Systems

```typescript
// Blood splatter on hit
const blood = this.add.particles('blood_particle');
const emitter = blood.createEmitter({
  speed: { min: 100, max: 200 },
  angle: { min: 0, max: 360 },
  scale: { start: 1, end: 0 },
  lifespan: 600,
  quantity: 10,
  blendMode: 'NORMAL'
});
emitter.explode(10, x, y);
```

**Particle Assets:**
- blood_particle.png (4x4 red square)
- smoke_particle.png (8x8 gray circle)
- spark_particle.png (2x2 yellow square)
- shell_casing.png (4x6 brass cylinder)

### 7.3 UI Animations

**Button Hover:**
```css
.menu-button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
  transition: all 0.3s ease;
}
```

**Victory Screen:**
- Fade in emblem
- Typewriter effect for stats
- Confetti particles
- Sound: Russian anthem snippet (royalty-free)

---

## 8. Implementation Guide

### 8.1 Asset Integration with Phaser 3

**Loading Assets:**
```typescript
// frontend/src/game/scenes/PreloadScene.ts
export class PreloadScene extends Phaser.Scene {
  preload() {
    // Character sprite
    this.load.spritesheet('vityaz_operator', 
      'assets/sprites/vityaz_operator.png',
      { frameWidth: 64, frameHeight: 64 }
    );
    
    // Weapons
    this.load.image('ak74m', 'assets/weapons/ak74m.png');
    this.load.image('svd', 'assets/weapons/svd.png');
    
    // UI
    this.load.image('emblem', 'assets/ui/vityaz_emblem.png');
    this.load.image('health_bar', 'assets/ui/health_bar.png');
    
    // Effects
    this.load.spritesheet('muzzle_flash',
      'assets/effects/muzzle_flash.png',
      { frameWidth: 16, frameHeight: 16 }
    );
  }
}
```

**Creating Animations:**
```typescript
// Create walking animation
this.anims.create({
  key: 'walk_south',
  frames: this.anims.generateFrameNumbers('vityaz_operator', {
    start: 0, end: 3
  }),
  frameRate: 8,
  repeat: -1
});

// Apply to sprite
const player = this.add.sprite(x, y, 'vityaz_operator');
player.play('walk_south');
```

### 8.2 Directory Structure

```
frontend/public/assets/
├── sprites/
│   ├── characters/
│   │   ├── vityaz_operator.png
│   │   ├── vityaz_sniper.png
│   │   └── vityaz_support.png
│   ├── weapons/
│   │   ├── ak74m.png
│   │   ├── svd.png
│   │   ├── rpk74.png
│   │   └── pmm.png
│   └── equipment/
│       ├── f1_grenade.png
│       ├── smoke_grenade.png
│       └── flashbang.png
├── ui/
│   ├── vityaz_emblem.png
│   ├── main_menu_bg.png
│   ├── button_normal.png
│   ├── button_hover.png
│   ├── health_bar.png
│   ├── armor_bar.png
│   └── crosshair.png
├── effects/
│   ├── muzzle_flash.png
│   ├── blood_splatter.png
│   ├── explosion.png
│   └── particles/
│       ├── blood.png
│       ├── smoke.png
│       └── spark.png
├── maps/
│   ├── tilesets/
│   │   ├── urban_ground.png
│   │   ├── urban_walls.png
│   │   └── military_base.png
│   └── objects/
│       ├── crate.png
│       ├── barrel.png
│       └── vehicle.png
└── audio/
    ├── weapons/
    ├── ui/
    └── ambient/
```

### 8.3 Sprite Sheet Generator Script

```typescript
// tools/generate-spritesheet.ts
import Jimp from 'jimp';

async function generateSpriteSheet(
  inputFiles: string[],
  outputFile: string,
  frameWidth: number,
  frameHeight: number
) {
  const cols = 8; // 8 directions
  const rows = Math.ceil(inputFiles.length / cols);
  
  const sheet = new Jimp(
    frameWidth * cols,
    frameHeight * rows,
    0x00000000 // Transparent
  );
  
  for (let i = 0; i < inputFiles.length; i++) {
    const img = await Jimp.read(inputFiles[i]);
    const col = i % cols;
    const row = Math.floor(i / cols);
    sheet.composite(img, col * frameWidth, row * frameHeight);
  }
  
  await sheet.writeAsync(outputFile);
  console.log(`Sprite sheet generated: ${outputFile}`);
}

// Usage
generateSpriteSheet(
  ['frame_01.png', 'frame_02.png', /* ... */],
  'vityaz_operator.png',
  64,
  64
);
```

---

## 9. Asset Organization

### 9.1 Naming Conventions

**Sprites:**
- Format: `{category}_{name}_{variant}.png`
- Example: `char_vityaz_idle.png`
- Example: `weap_ak74m_fire.png`

**UI Elements:**
- Format: `ui_{element}_{state}.png`
- Example: `ui_button_normal.png`
- Example: `ui_health_bar_green.png`

**Effects:**
- Format: `fx_{effect}_{frame}.png`
- Example: `fx_muzzle_01.png`
- Example: `fx_explosion_05.png`

### 9.2 File Formats

| Asset Type | Format | Reason |
|------------|--------|--------|
| Sprites | PNG-24 | Transparency support |
| UI Icons | SVG → PNG | Scalable, crisp |
| Backgrounds | JPEG | Smaller file size |
| Logos | SVG | Vector quality |
| Particles | PNG-8 | Small file size |

### 9.3 Resolution Standards

**Base Resolution:**
- Sprites: 64x64 or 32x32
- UI: 1920x1080 (Full HD)
- Icons: 64x64, 128x128

**Retina/HD Support:**
```typescript
// Auto-scale for high DPI
const scale = window.devicePixelRatio || 1;
this.game.canvas.width = 1920 * scale;
this.game.canvas.height = 1080 * scale;
```

---

## 10. Performance Optimization

### 10.1 Texture Atlases

**Combine multiple sprites into single atlas:**
```bash
# Using TexturePacker (free alternative: ShoeBox)
TexturePacker --data sprites.json --format phaser3 \
  --sheet sprites.png *.png
```

**Benefits:**
- Reduces draw calls
- Faster loading
- Less memory usage

### 10.2 Sprite Compression

```bash
# Optimize PNGs with pngquant
pngquant --quality=70-90 --ext .png --force sprites/*.png

# Result: 60-70% smaller files, minimal quality loss
```

### 10.3 Lazy Loading

```typescript
// Load heavy assets only when needed
async loadBattleAssets() {
  await this.load.image('map_urban', 'assets/maps/urban.png');
  await this.load.spritesheet('effects', 'assets/effects.png');
  this.load.start();
}
```

### 10.4 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| FPS | 60 | TBD |
| Load Time | < 3s | TBD |
| Memory Usage | < 200MB | TBD |
| Texture Size | < 50MB | TBD |

---

## 11. Generated Assets Reference

### 11.1 Vityaz Operator Sprite

**File:** `vityaz_operator.png`  
**Description:** Top-down view of Vityaz special forces soldier with maroon beret (tilted left), tactical gear, and AK-74M rifle.  
**Usage:** Main player character sprite  
**Specifications:**
- Original size: HD quality
- Needs resizing to 64x64 for game sprite
- Extract to: `frontend/public/assets/sprites/characters/`

**Visual Reference:** See generated image [1] above

### 11.2 Vityaz Unit Emblem

**File:** `vityaz_emblem.png`  
**Description:** Official-style emblem featuring medieval Russian warrior with sword and shield, Cyrillic "ВИТЯЗЬ" text in maroon, black, and gold colors.  
**Usage:** Logo, UI element, character patches  
**Specifications:**
- High resolution for scaling
- Multiple sizes: 512x512, 256x256, 64x64
- Extract to: `frontend/public/assets/ui/`

**Visual Reference:** See generated image [2] above

### 11.3 Weapons Collection

**File:** `weapons_collection.png`  
**Description:** Realistic Russian firearms including AK-74M, SVD Dragunov, RPK-74, Makarov pistol, and GP-25 launcher.  
**Usage:** Individual weapon sprites for game  
**Specifications:**
- Separate each weapon in image editor
- Resize appropriately (AK-74M: 32x16, SVD: 48x12, etc.)
- Extract to: `frontend/public/assets/sprites/weapons/`

**Visual Reference:** See generated image [3] above

---

## 12. Next Steps: Asset Creation Workflow

### Week 1: Core Assets
- [ ] Extract and resize generated sprites
- [ ] Create character animation frames (8 directions × 4 frames)
- [ ] Separate weapon sprites from collection
- [ ] Create basic UI elements (buttons, bars)

### Week 2: Effects & Polish
- [ ] Design muzzle flash animation
- [ ] Create particle effects (blood, smoke)
- [ ] Add explosion sprites
- [ ] UI hover states and animations

### Week 3: Maps & Environment
- [ ] Create urban tileset (32x32 tiles)
- [ ] Design environmental objects
- [ ] Build first map prototype
- [ ] Test performance

### Week 4: Integration
- [ ] Integrate all assets into Phaser 3
- [ ] Create animation configurations
- [ ] Test in-game appearance
- [ ] Optimize and compress

---

## 13. Tools & Resources

### 13.1 Recommended Software

**Free Tools:**
- **Aseprite** (pixel art, $20 or compile from source) - Sprite animation
- **GIMP** (free Photoshop alternative) - Image editing
- **Krita** (free) - Digital painting
- **Inkscape** (free) - Vector graphics
- **ShoeBox** (free) - Sprite sheet packer
- **Tiled** (free) - Map editor

**Paid Tools (Optional):**
- Photoshop ($10/month) - Industry standard
- TexturePacker ($40) - Professional atlas packer
- Spine ($60-300) - Advanced 2D animation

### 13.2 Asset Resources

**Free Assets (for prototyping):**
- OpenGameArt.org - Military sprites
- itch.io - Tactical shooter packs
- Kenney.nl - Generic game assets
- Freesound.org - Sound effects

**Paid Assets (production quality):**
- Unity Asset Store - High-quality packs
- Itch.io Premium - Professional assets
- GameDev Market - Tactical themes

### 13.3 Reference Images

**Search Terms:**
- "Vityaz special forces uniform"
- "Krapovy beret Russia"
- "Russian tactical gear"
- "AK-74M top view"
- "Military emblem heraldry"

---

## 14. Branding Guidelines

### 14.1 Logo Usage

**Primary Logo:** Vityaz emblem with text
**Minimum Size:** 32x32 pixels
**Clear Space:** 25% of logo width on all sides
**Backgrounds:** Dark preferred, light acceptable with border

### 14.2 Typography

**Primary Font:** "Bebas Neue" or "Oswald" (military stencil feel)  
**Secondary Font:** "Roboto" or "Open Sans" (UI text)  
**Cyrillic Support:** Required for "ВИТЯЗЬ" branding

**Font Sizes:**
- Headings: 48px, 36px, 24px
- Body: 16px
- UI: 14px
- Small: 12px

### 14.3 Icon Set

**Required Icons (32x32):**
- Health (red cross)
- Armor (shield)
- Ammo (bullet)
- Grenade (F-1)
- Wallet (cryptocurrency)
- Settings (gear)
- Leaderboard (trophy)
- Friends (users)

---

## 15. Conclusion

This graphics guide provides a complete roadmap for creating authentic, visually appealing assets for VITYAZ: Special Operations. The combination of realistic military aesthetics, proper Russian special forces symbolism (краповый берет!), and modern game design principles will create a unique visual identity.

**Key Takeaways:**
1. ✅ Краповый берет заложен налево - authentic detail
2. ✅ Realistic Russian military equipment (AK-74M, etc.)
3. ✅ Professional emblem design with Cyrillic text
4. ✅ Top-down tactical perspective for gameplay
5. ✅ Performance-optimized asset structure

**Ready to Implement:**
- Generated base assets available
- Clear technical specifications
- Phaser 3 integration examples
- Optimization guidelines

---

**Создано:** 13 декабря 2025  
**Статус:** ✅ Готово к использованию  
**Следующий шаг:** Извлечение и интеграция сгенерированных ассетов

🎮 **ВИТЯЗЬ - Честь, Отвага, Профессионализм!** ⚔️
