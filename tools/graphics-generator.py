#!/usr/bin/env python3
"""
VITYAZ Graphics Generator
Automated tool for creating game assets

Generates:
- Character sprites with animations
- Weapon sprites
- UI elements
- Effects and particles
- Tileset and maps

Usage: python3 graphics-generator.py [command]
Example: python3 graphics-generator.py --generate-all
"""

import os
import sys
from PIL import Image, ImageDraw, ImageFont
import json
from pathlib import Path
import argparse
from typing import Tuple, List, Dict
import math

class ColorPalette:
    """VITYAZ official color palette"""
    KRAPOVY_MAROON = (139, 21, 56)      # #8B1538
    MILITARY_GREEN = (61, 74, 61)       # #3D4A3D
    TACTICAL_BLACK = (26, 26, 26)       # #1A1A1A
    GOLD_ACCENT = (212, 175, 55)        # #D4AF37
    WHITE = (255, 255, 255)
    DARK_GRAY = (90, 90, 90)
    LIGHT_GRAY = (200, 200, 200)
    RED = (192, 21, 47)
    GREEN = (34, 197, 94)
    BLUE = (59, 130, 246)
    
class AssetGenerator:
    """Generate game assets programmatically"""
    
    def __init__(self, output_dir: str = "frontend/public/assets"):
        self.output_dir = Path(output_dir)
        self.colors = ColorPalette()
        self.ensure_directories()
    
    def ensure_directories(self):
        """Create required directory structure"""
        dirs = [
            "sprites/characters",
            "sprites/weapons",
            "sprites/equipment",
            "ui/buttons",
            "ui/hud",
            "ui/icons",
            "effects/explosions",
            "effects/particles",
            "maps/tilesets",
            "maps/objects",
            "audio/weapons",
        ]
        for d in dirs:
            (self.output_dir / d).mkdir(parents=True, exist_ok=True)
    
    # ==================== CHARACTER SPRITES ====================
    
    def generate_vityaz_head(self, size: int = 64) -> Image.Image:
        """
        Generate Vityaz operator head with krapovy beret
        
        Args:
            size: Sprite size (64x64 default)
        
        Returns:
            PIL Image
        """
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Beret (krapovy maroon) - tilted LEFT
        beret_top = int(size * 0.15)
        beret_left = int(size * 0.15)
        beret_right = int(size * 0.85)
        beret_bottom = int(size * 0.4)
        
        # Main beret shape (slightly tilted left)
        points = [
            (beret_left, beret_top + 5),
            (beret_right, beret_top),
            (beret_right - 3, beret_bottom),
            (beret_left + 3, beret_bottom + 2),
        ]
        draw.polygon(points, fill=self.colors.KRAPOVY_MAROON)
        
        # Beret band (black)
        band_y = int(size * 0.4)
        draw.rectangle(
            [(beret_left, band_y), (beret_right, band_y + 3)],
            fill=self.colors.TACTICAL_BLACK
        )
        
        # Beret badge/cockade (gold circle)
        badge_x = int(size * 0.72)
        badge_y = int(size * 0.25)
        badge_size = int(size * 0.08)
        draw.ellipse(
            [(badge_x - badge_size, badge_y - badge_size),
             (badge_x + badge_size, badge_y + badge_size)],
            fill=self.colors.GOLD_ACCENT,
            outline=self.colors.TACTICAL_BLACK
        )
        
        # Face (skin tone)
        face_x1 = int(size * 0.25)
        face_y1 = int(size * 0.35)
        face_x2 = int(size * 0.75)
        face_y2 = int(size * 0.65)
        draw.ellipse(
            [(face_x1, face_y1), (face_x2, face_y2)],
            fill=(220, 180, 140)  # Skin tone
        )
        
        # Eyes
        eye_y = int(size * 0.45)
        left_eye_x = int(size * 0.35)
        right_eye_x = int(size * 0.65)
        eye_size = int(size * 0.03)
        
        draw.ellipse(
            [(left_eye_x - eye_size, eye_y - eye_size),
             (left_eye_x + eye_size, eye_y + eye_size)],
            fill=self.colors.TACTICAL_BLACK
        )
        draw.ellipse(
            [(right_eye_x - eye_size, eye_y - eye_size),
             (right_eye_x + eye_size, eye_y + eye_size)],
            fill=self.colors.TACTICAL_BLACK
        )
        
        # Mouth (simple line)
        mouth_y = int(size * 0.55)
        draw.line(
            [(int(size * 0.4), mouth_y), (int(size * 0.6), mouth_y)],
            fill=self.colors.TACTICAL_BLACK,
            width=1
        )
        
        return img
    
    def generate_vityaz_torso(self, size: int = 64) -> Image.Image:
        """
        Generate tactical armor and uniform body
        
        Args:
            size: Sprite size
        
        Returns:
            PIL Image
        """
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Uniform base (military green)
        torso_x1 = int(size * 0.2)
        torso_y1 = int(size * 0.1)
        torso_x2 = int(size * 0.8)
        torso_y2 = int(size * 0.7)
        
        draw.rectangle(
            [(torso_x1, torso_y1), (torso_x2, torso_y2)],
            fill=self.colors.MILITARY_GREEN
        )
        
        # Body Armor Vest (darker green)
        armor_x1 = int(size * 0.3)
        armor_y1 = int(size * 0.15)
        armor_x2 = int(size * 0.7)
        armor_y2 = int(size * 0.6)
        
        draw.rectangle(
            [(armor_x1, armor_y1), (armor_x2, armor_y2)],
            fill=(45, 55, 45),  # Darker green
            outline=self.colors.TACTICAL_BLACK
        )
        
        # Tactical pouches (3 vertical sections)
        pouch_width = int(size * 0.08)
        pouch_x_positions = [
            int(size * 0.35),
            int(size * 0.5),
            int(size * 0.65)
        ]
        
        for pouch_x in pouch_x_positions:
            draw.rectangle(
                [(pouch_x, armor_y1 + int(size * 0.1)),
                 (pouch_x + pouch_width, armor_y2 - int(size * 0.1))],
                fill=self.colors.TACTICAL_BLACK,
                outline=self.colors.DARK_GRAY
            )
        
        # Shoulders (armor plates)
        shoulder_size = int(size * 0.12)
        # Left shoulder
        draw.ellipse(
            [(armor_x1 - shoulder_size, armor_y1),
             (armor_x1, armor_y1 + shoulder_size)],
            fill=(50, 60, 50)
        )
        # Right shoulder
        draw.ellipse(
            [(armor_x2, armor_y1),
             (armor_x2 + shoulder_size, armor_y1 + shoulder_size)],
            fill=(50, 60, 50)
        )
        
        return img
    
    def generate_ak74m_sprite(self, size: Tuple[int, int] = (32, 16)) -> Image.Image:
        """
        Generate AK-74M assault rifle sprite
        
        Args:
            size: Sprite dimensions (width, height)
        
        Returns:
            PIL Image
        """
        width, height = size
        img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Stock (wooden, brown)
        stock_x1 = int(width * 0.05)
        stock_x2 = int(width * 0.35)
        stock_y1 = int(height * 0.4)
        stock_y2 = int(height * 0.6)
        draw.rectangle(
            [(stock_x1, stock_y1), (stock_x2, stock_y2)],
            fill=(139, 69, 19)  # Saddle brown
        )
        
        # Receiver (black steel)
        receiver_x1 = int(width * 0.3)
        receiver_x2 = int(width * 0.8)
        receiver_y1 = int(height * 0.35)
        receiver_y2 = int(height * 0.65)
        draw.rectangle(
            [(receiver_x1, receiver_y1), (receiver_x2, receiver_y2)],
            fill=self.colors.TACTICAL_BLACK
        )
        
        # Barrel (darker black, thin)
        barrel_x1 = int(width * 0.75)
        barrel_x2 = int(width * 0.95)
        barrel_y1 = int(height * 0.42)
        barrel_y2 = int(height * 0.58)
        draw.rectangle(
            [(barrel_x1, barrel_y1), (barrel_x2, barrel_y2)],
            fill=(10, 10, 10)
        )
        
        # Gas tube (upper rail)
        gas_y1 = int(height * 0.25)
        gas_y2 = int(height * 0.35)
        draw.rectangle(
            [(receiver_x1, gas_y1), (barrel_x2, gas_y2)],
            fill=(50, 50, 50),
            outline=self.colors.DARK_GRAY
        )
        
        # Muzzle brake (detail)
        muzzle_x = int(width * 0.95)
        muzzle_y_mid = int(height * 0.5)
        draw.polygon(
            [(muzzle_x, muzzle_y_mid - 2),
             (width, muzzle_y_mid - 3),
             (width, muzzle_y_mid + 3),
             (muzzle_x, muzzle_y_mid + 2)],
            fill=(30, 30, 30)
        )
        
        return img
    
    def generate_health_bar(self, width: int = 200, height: int = 20) -> Image.Image:
        """
        Generate health bar UI element
        
        Args:
            width: Bar width
            height: Bar height
        
        Returns:
            PIL Image
        """
        img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Background (dark)
        draw.rectangle(
            [(0, 0), (width, height)],
            fill=(30, 30, 30),
            outline=self.colors.DARK_GRAY
        )
        
        # Health (green gradient simulation)
        bar_width = int(width * 0.95)
        bar_height = int(height * 0.8)
        bar_y = int((height - bar_height) / 2)
        
        draw.rectangle(
            [(2, bar_y), (bar_width, bar_y + bar_height)],
            fill=self.colors.GREEN
        )
        
        # Border
        draw.rectangle(
            [(2, bar_y), (bar_width, bar_y + bar_height)],
            outline=self.colors.WHITE,
            width=1
        )
        
        return img
    
    def generate_crosshair(self, size: int = 32) -> Image.Image:
        """
        Generate crosshair UI element
        
        Args:
            size: Crosshair size
        
        Returns:
            PIL Image
        """
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        center = size // 2
        line_length = size // 3
        line_width = 2
        
        # Vertical line
        draw.rectangle(
            [(center - 1, center - line_length),
             (center + 1, center + line_length)],
            fill=self.colors.WHITE
        )
        
        # Horizontal line
        draw.rectangle(
            [(center - line_length, center - 1),
             (center + line_length, center + 1)],
            fill=self.colors.WHITE
        )
        
        # Center dot (optional)
        dot_size = 2
        draw.ellipse(
            [(center - dot_size, center - dot_size),
             (center + dot_size, center + dot_size)],
            fill=self.colors.RED
        )
        
        return img
    
    def generate_tile(self, tile_type: str, size: int = 32) -> Image.Image:
        """
        Generate tileset tiles
        
        Args:
            tile_type: Type of tile (concrete, asphalt, grass, etc.)
            size: Tile size
        
        Returns:
            PIL Image
        """
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        tile_colors = {
            'concrete': (200, 200, 200),
            'asphalt': (50, 50, 50),
            'grass': (34, 139, 34),
            'dirt': (139, 90, 43),
            'wood': (160, 82, 45),
        }
        
        color = tile_colors.get(tile_type, (100, 100, 100))
        
        # Base tile
        draw.rectangle([(0, 0), (size - 1, size - 1)], fill=color, outline=(100, 100, 100))
        
        # Add some texture variation
        if tile_type == 'concrete':
            # Crack pattern
            draw.line([(5, 0), (10, size)], fill=(180, 180, 180), width=1)
            draw.line([(size // 2, 5), (size // 2 + 10, size - 5)], fill=(180, 180, 180), width=1)
        elif tile_type == 'grass':
            # Grass tufts
            for x in [8, 16, 24]:
                for y in [8, 16, 24]:
                    draw.line([(x, y), (x + 2, y - 3)], fill=(20, 100, 20), width=1)
        
        return img
    
    def generate_muzzle_flash(self, frame_num: int = 1, size: int = 16) -> Image.Image:
        """
        Generate muzzle flash animation frame
        
        Args:
            frame_num: Animation frame (1-3)
            size: Flash size
        
        Returns:
            PIL Image
        """
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Intensity varies by frame
        intensity = max(50, 200 - (frame_num * 50))
        
        # Yellow-orange flash
        flash_color = (255, intensity, 50)
        
        # Different shapes for each frame
        if frame_num == 1:
            # Large burst
            draw.polygon(
                [(0, size//2), (size//2, 0), (size, size//2), (size//2, size)],
                fill=flash_color
            )
        elif frame_num == 2:
            # Medium burst
            draw.ellipse(
                [(2, 2), (size - 2, size - 2)],
                fill=flash_color
            )
        else:
            # Small tail
            draw.polygon(
                [(size//4, size//2), (size//2, size//4), (3*size//4, size//2)],
                fill=flash_color
            )
        
        return img
    
    def generate_emblem(self, size: int = 256) -> Image.Image:
        """
        Generate VITYAZ unit emblem
        
        Args:
            size: Emblem size
        
        Returns:
            PIL Image
        """
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Shield background
        shield_top = int(size * 0.1)
        shield_left = int(size * 0.2)
        shield_right = int(size * 0.8)
        shield_bottom = int(size * 0.9)
        
        # Shield shape (rounded rectangle)
        draw.rectangle(
            [(shield_left, shield_top), (shield_right, shield_bottom)],
            fill=self.colors.KRAPOVY_MAROON,
            outline=self.colors.GOLD_ACCENT
        )
        
        # Sword (simplified)
        sword_top = int(size * 0.2)
        sword_bottom = int(size * 0.8)
        sword_x = size // 2
        
        # Blade
        draw.rectangle(
            [(sword_x - 3, sword_top), (sword_x + 3, sword_bottom)],
            fill=self.colors.LIGHT_GRAY
        )
        
        # Cross guard
        draw.rectangle(
            [(int(size * 0.35), int(size * 0.5)), (int(size * 0.65), int(size * 0.55))],
            fill=self.colors.GOLD_ACCENT
        )
        
        # Pommel
        pommel_size = int(size * 0.08)
        draw.ellipse(
            [(sword_x - pommel_size, sword_bottom - pommel_size),
             (sword_x + pommel_size, sword_bottom + pommel_size)],
            fill=self.colors.GOLD_ACCENT
        )
        
        # Border circle
        border_radius = int(size * 0.35)
        draw.ellipse(
            [(size//2 - border_radius, size//2 - border_radius),
             (size//2 + border_radius, size//2 + border_radius)],
            outline=self.colors.GOLD_ACCENT,
            width=3
        )
        
        return img
    
    # ==================== SPRITESHEET GENERATION ====================
    
    def create_spritesheet(self, frames: List[Image.Image], cols: int, rows: int,
                          output_path: str, frame_width: int, frame_height: int):
        """
        Combine multiple frames into a spritesheet
        
        Args:
            frames: List of PIL Images
            cols: Number of columns
            rows: Number of rows
            output_path: Output file path
            frame_width: Width of each frame
            frame_height: Height of each frame
        """
        sheet_width = frame_width * cols
        sheet_height = frame_height * rows
        spritesheet = Image.new('RGBA', (sheet_width, sheet_height), (0, 0, 0, 0))
        
        for idx, frame in enumerate(frames):
            if idx >= cols * rows:
                break
            
            col = idx % cols
            row = idx // cols
            x = col * frame_width
            y = row * frame_height
            
            spritesheet.paste(frame, (x, y), frame)
        
        spritesheet.save(output_path)
        print(f"✅ Spritesheet saved: {output_path}")
    
    # ==================== GENERATION COMMANDS ====================
    
    def generate_character_sprites(self):
        """Generate all character sprites"""
        print("\n🧑 Generating character sprites...")
        
        # Operator head
        head = self.generate_vityaz_head(64)
        head.save(str(self.output_dir / "sprites/characters/head_krapovy.png"))
        print("✅ Head sprite generated")
        
        # Operator torso
        torso = self.generate_vityaz_torso(64)
        torso.save(str(self.output_dir / "sprites/characters/torso_assault.png"))
        print("✅ Torso sprite generated")
        
        # Combined operator (32x64 full body)
        full_body = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
        full_body.paste(head, (0, 0), head)
        full_body.paste(torso, (0, 20), torso)
        full_body.save(str(self.output_dir / "sprites/characters/vityaz_operator.png"))
        print("✅ Full operator sprite generated")
    
    def generate_weapon_sprites(self):
        """Generate weapon sprites"""
        print("\n🔫 Generating weapon sprites...")
        
        # AK-74M
        ak74m = self.generate_ak74m_sprite((32, 16))
        ak74m.save(str(self.output_dir / "sprites/weapons/ak74m.png"))
        print("✅ AK-74M generated")
        
        # SVD Dragunov (longer, thinner)
        svd = self.generate_ak74m_sprite((48, 12))
        svd.save(str(self.output_dir / "sprites/weapons/svd.png"))
        print("✅ SVD Dragunov generated")
        
        # PMM Makarov (compact)
        pmm = self.generate_ak74m_sprite((16, 12))
        pmm.save(str(self.output_dir / "sprites/weapons/pmm.png"))
        print("✅ PMM Makarov generated")
    
    def generate_ui_elements(self):
        """Generate UI elements"""
        print("\n🖥️ Generating UI elements...")
        
        # Emblem
        emblem = self.generate_emblem(256)
        emblem.save(str(self.output_dir / "ui/vityaz_emblem.png"))
        print("✅ Emblem generated")
        
        # Health bar
        health_bar = self.generate_health_bar(200, 20)
        health_bar.save(str(self.output_dir / "ui/hud/health_bar.png"))
        print("✅ Health bar generated")
        
        # Crosshair
        crosshair = self.generate_crosshair(32)
        crosshair.save(str(self.output_dir / "ui/hud/crosshair.png"))
        print("✅ Crosshair generated")
    
    def generate_tilesets(self):
        """Generate tileset tiles"""
        print("\n🗺️ Generating tilesets...")
        
        tile_types = ['concrete', 'asphalt', 'grass', 'dirt', 'wood']
        
        for tile_type in tile_types:
            # Create 4 variations
            tiles = []
            for var in range(4):
                tile = self.generate_tile(tile_type, 32)
                tiles.append(tile)
            
            # Save individual tiles
            for idx, tile in enumerate(tiles):
                tile.save(str(self.output_dir / f"maps/tilesets/tile_{tile_type}_{idx}.png"))
            
            print(f"✅ {tile_type.capitalize()} tiles generated")
    
    def generate_effects(self):
        """Generate visual effects"""
        print("\n✨ Generating effects...")
        
        # Muzzle flash animation
        for frame in range(1, 4):
            flash = self.generate_muzzle_flash(frame, 16)
            flash.save(str(self.output_dir / f"effects/particles/muzzle_flash_{frame:02d}.png"))
        print("✅ Muzzle flash generated (3 frames)")
    
    def generate_all(self):
        """Generate all graphics"""
        print("\n" + "="*50)
        print("🎨 VITYAZ GRAPHICS GENERATOR")
        print("="*50)
        
        self.generate_character_sprites()
        self.generate_weapon_sprites()
        self.generate_ui_elements()
        self.generate_tilesets()
        self.generate_effects()
        
        print("\n" + "="*50)
        print("🌟 Graphics generation complete!")
        print("="*50)
        print(f"\n✅ Assets saved to: {self.output_dir}")
        print("\nNext steps:")
        print("1. Test assets in Phaser 3")
        print("2. Create animation configurations")
        print("3. Integrate with PreloadScene")

def main():
    parser = argparse.ArgumentParser(description="VITYAZ Graphics Generator")
    parser.add_argument(
        '--output-dir',
        default='frontend/public/assets',
        help='Output directory for assets'
    )
    parser.add_argument(
        '--generate-all',
        action='store_true',
        help='Generate all graphics'
    )
    parser.add_argument(
        '--generate-characters',
        action='store_true',
        help='Generate character sprites only'
    )
    parser.add_argument(
        '--generate-weapons',
        action='store_true',
        help='Generate weapon sprites only'
    )
    parser.add_argument(
        '--generate-ui',
        action='store_true',
        help='Generate UI elements only'
    )
    
    args = parser.parse_args()
    
    generator = AssetGenerator(args.output_dir)
    
    if args.generate_all or (not any([args.generate_characters, args.generate_weapons, args.generate_ui])):
        generator.generate_all()
    else:
        if args.generate_characters:
            generator.generate_character_sprites()
        if args.generate_weapons:
            generator.generate_weapon_sprites()
        if args.generate_ui:
            generator.generate_ui_elements()

if __name__ == '__main__':
    main()
