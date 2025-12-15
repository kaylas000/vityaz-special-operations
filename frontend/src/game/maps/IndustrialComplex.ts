import Phaser from 'phaser';

/**
 * Industrial Complex Map - VITYAZ Edition
 * 
 * Military industrial compound with:
 * - Steel warehouses and storage facilities
 * - Elevated platforms and catwalks
 * - Heavy machinery for cover
 * - Vityaz unit tactical markings
 * - Sniper nests on platforms
 */

export class IndustrialComplex {
  scene: Phaser.Scene;
  width: number;
  height: number;
  graphics: Phaser.GameObjects.Graphics;
  
  // Vityaz Colors
  readonly VITYAZ_CRIMSON = 0xA01030;
  readonly VITYAZ_GOLD = 0xD4AF37;
  readonly STEEL = 0x5A6268;
  readonly RUST = 0xB84513;
  
  constructor(scene: Phaser.Scene, width: number, height: number) {
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.graphics = scene.make.graphics({ x: 0, y: 0, add: false });
  }

  create(): void {
    this.createBackground();
    this.createWarehouses();
    this.createIndustrialStructures();
    this.createElevatedPlatforms();
    this.createMachinery();
    this.addVityazMarkings();
    this.createAtmosphere();
    this.scene.add.existing(this.graphics);
  }

  private createBackground(): void {
    // Industrial dawn sky
    this.graphics.fillStyle(0x4A5A6A, 1);
    this.graphics.fillRect(0, 0, this.width, this.height);
    
    // Pollution haze
    this.graphics.fillStyle(0x3A4A5A, 0.6);
    this.graphics.fillRect(0, 0, this.width, 150);
    
    // Factory smoke stacks in distance
    this.drawDistantSmokeStacks();
  }

  private drawDistantSmokeStacks(): void {
    // Left stack
    this.graphics.fillStyle(0x2A3A4A, 1);
    this.graphics.fillRect(50, 100, 30, 200);
    this.graphics.fillStyle(0x555555, 0.5);
    this.graphics.fillCircle(65, 80, 40);
    
    // Right stack
    this.graphics.fillRect(this.width - 100, 120, 35, 180);
    this.graphics.fillStyle(0x555555, 0.5);
    this.graphics.fillCircle(this.width - 82, 90, 35);
  }

  private createWarehouses(): void {
    // Main warehouse 1 (left)
    this.drawWarehouse(this.graphics, 80, 280, 280, 260);
    
    // Main warehouse 2 (center)
    this.drawWarehouse(this.graphics, this.width / 2 - 150, 240, 300, 300);
    
    // Main warehouse 3 (right)
    this.drawWarehouse(this.graphics, this.width - 350, 320, 280, 240);
    
    // Storage units (smaller)
    this.drawWarehouse(this.graphics, 150, 600, 150, 120);
    this.drawWarehouse(this.graphics, this.width - 250, 580, 140, 130);
  }

  private drawWarehouse(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    // Main steel structure
    graphics.fillStyle(this.STEEL, 1);
    graphics.fillRect(x, y, width, height);
    
    // Corrugated metal effect (horizontal lines)
    graphics.lineStyle(2, 0x4A5268, 0.5);
    for (let i = 0; i < height; i += 30) {
      graphics.lineBetween(x, y + i, x + width, y + i);
    }
    
    // Vertical support beams
    graphics.lineStyle(3, 0x3A4258, 1);
    const beamSpacing = width / 5;
    for (let i = 1; i < 5; i++) {
      graphics.lineBetween(x + i * beamSpacing, y, x + i * beamSpacing, y + height);
    }
    
    // Rust patches
    graphics.fillStyle(this.RUST, 0.4);
    for (let i = 0; i < 8; i++) {
      const rx = x + Math.random() * width;
      const ry = y + Math.random() * height;
      graphics.fillCircle(rx, ry, 15 + Math.random() * 20);
    }
    
    // Doors (painted in Vityaz colors)
    this.drawWarehouseDoor(graphics, x + 50, y + height - 80, this.VITYAZ_CRIMSON);
    this.drawWarehouseDoor(graphics, x + width - 100, y + height - 80, this.VITYAZ_GOLD);
  }

  private drawWarehouseDoor(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    color: number
  ): void {
    graphics.fillStyle(color, 0.8);
    graphics.fillRect(x, y, 60, 80);
    graphics.lineStyle(2, 0x1A1A1A, 1);
    graphics.strokeRect(x, y, 60, 80);
    graphics.lineBetween(x + 30, y, x + 30, y + 80);
    graphics.lineBetween(x, y + 40, x + 60, y + 40);
  }

  private createIndustrialStructures(): void {
    // Conveyor belt structures
    this.drawConveyorBelt(this.graphics, 200, 150, 300, 40);
    
    // Oil tanks
    this.drawOilTank(this.graphics, 450, 400, 40);
    this.drawOilTank(this.graphics, 550, 420, 35);
    
    // Pipe networks
    this.drawPipeNetwork(this.graphics, this.width - 250, 350);
  }

  private drawConveyorBelt(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    graphics.fillStyle(0x3A3A3A, 1);
    graphics.fillRect(x, y, width, height);
    
    // Support structure
    graphics.lineStyle(2, 0x5A5A5A, 1);
    graphics.lineBetween(x, y, x, y + 80);
    graphics.lineBetween(x + width, y, x + width, y + 80);
    
    // Rolling bars
    graphics.lineStyle(1, 0x4A4A4A, 1);
    for (let i = 0; i < width; i += 20) {
      graphics.lineBetween(x + i, y, x + i, y + height);
    }
  }

  private drawOilTank(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    radius: number
  ): void {
    // Tank body
    graphics.fillStyle(0xC0C0C0, 1);
    graphics.fillCircle(x, y, radius);
    
    // Tank bands
    graphics.lineStyle(2, 0x808080, 1);
    graphics.strokeCircleShape(new Phaser.Geom.Circle(x, y, radius));
    graphics.strokeCircleShape(new Phaser.Geom.Circle(x, y - radius * 0.3, radius));
    graphics.strokeCircleShape(new Phaser.Geom.Circle(x, y + radius * 0.3, radius));
    
    // Rust spots
    graphics.fillStyle(this.RUST, 0.5);
    graphics.fillCircle(x - 10, y - 15, 5);
    graphics.fillCircle(x + 15, y + 10, 4);
  }

  private drawPipeNetwork(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number
  ): void {
    graphics.lineStyle(4, this.STEEL, 1);
    
    // Main horizontal pipes
    graphics.lineBetween(x, y, x + 200, y);
    graphics.lineBetween(x, y + 40, x + 200, y + 40);
    graphics.lineBetween(x, y + 80, x + 150, y + 80);
    
    // Vertical connections
    graphics.lineBetween(x + 50, y, x + 50, y + 40);
    graphics.lineBetween(x + 100, y, x + 100, y + 80);
    graphics.lineBetween(x + 150, y + 40, x + 150, y + 80);
    
    // Pipe joints (circles)
    graphics.fillStyle(this.VITYAZ_CRIMSON, 0.6);
    graphics.fillCircle(x + 50, y + 40, 6);
    graphics.fillCircle(x + 100, y, 6);
    graphics.fillCircle(x + 150, y + 80, 6);
  }

  private createElevatedPlatforms(): void {
    // Sniper platform 1
    this.drawElevatedPlatform(
      this.graphics,
      200,
      100,
      120,
      60,
      'VITYAZ-1'
    );
    
    // Sniper platform 2
    this.drawElevatedPlatform(
      this.graphics,
      this.width - 300,
      120,
      140,
      70,
      'VITYAZ-2'
    );
    
    // Control tower
    this.drawControlTower(this.graphics, this.width / 2, 50);
  }

  private drawElevatedPlatform(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    label: string
  ): void {
    // Platform deck
    graphics.fillStyle(0x5A6268, 1);
    graphics.fillRect(x, y, width, 30);
    
    // Railings
    graphics.lineStyle(2, this.VITYAZ_GOLD, 1);
    graphics.lineBetween(x, y, x, y - 20);
    graphics.lineBetween(x + width, y, x + width, y - 20);
    graphics.lineBetween(x, y - 20, x + width, y - 20);
    
    // Support columns
    graphics.lineStyle(3, 0x3A4258, 1);
    graphics.lineBetween(x + 10, y, x + 10, y + height);
    graphics.lineBetween(x + width - 10, y, x + width - 10, y + height);
    
    // Label with Vityaz colors
    graphics.fillStyle(this.VITYAZ_CRIMSON, 0.8);
    graphics.fillRect(x + 5, y - 35, width - 10, 12);
    graphics.fillStyle(this.VITYAZ_GOLD, 1);
    graphics.fillText(label, x + 10, y - 28, { fontSize: '9px', color: '#D4AF37' });
  }

  private drawControlTower(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number
  ): void {
    // Tower base
    graphics.fillStyle(this.STEEL, 1);
    graphics.fillRect(x - 30, y, 60, 180);
    
    // Observation room
    graphics.fillStyle(0x1A2A3A, 1);
    graphics.fillRect(x - 25, y - 40, 50, 50);
    
    // Windows
    graphics.lineStyle(1, this.VITYAZ_GOLD, 1);
    for (let i = 0; i < 4; i++) {
      graphics.strokeRect(x - 20 + i * 10, y - 30, 8, 8);
    }
    
    // Tower markings (Vityaz colors)
    graphics.fillStyle(this.VITYAZ_CRIMSON, 0.7);
    graphics.fillRect(x - 30, y + 50, 60, 20);
    graphics.fillRect(x - 30, y + 100, 60, 20);
  }

  private createMachinery(): void {
    // Heavy machinery for tactical cover
    this.drawHeavyMachinery(this.graphics, 350, 500, 'CRANE');
    this.drawHeavyMachinery(this.graphics, this.width - 200, 480, 'PRESS');
    
    // Forklift positions
    this.drawForklift(this.graphics, 100, 550);
    this.drawForklift(this.graphics, 250, 580);
  }

  private drawHeavyMachinery(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    type: string
  ): void {
    if (type === 'CRANE') {
      // Crane structure
      graphics.lineStyle(3, this.STEEL, 1);
      graphics.lineBetween(x, y, x, y - 150);
      graphics.lineBetween(x - 80, y - 150, x + 80, y - 150);
      
      // Hook
      graphics.fillStyle(this.VITYAZ_GOLD, 1);
      graphics.fillCircle(x, y - 150, 5);
    } else if (type === 'PRESS') {
      // Heavy press frame
      graphics.fillStyle(this.STEEL, 1);
      graphics.fillRect(x, y, 60, 120);
      graphics.fillRect(x + 10, y - 30, 40, 30);
      graphics.lineStyle(2, 0x3A4258, 1);
      graphics.strokeRect(x, y, 60, 120);
      graphics.strokeRect(x + 10, y - 30, 40, 30);
    }
    
    // Label
    graphics.fillStyle(this.VITYAZ_CRIMSON, 0.6);
    graphics.fillText(type, x - 20, y + 130, { fontSize: '10px', color: '#A01030' });
  }

  private drawForklift(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number
  ): void {
    // Forklift body
    graphics.fillStyle(this.VITYAZ_CRIMSON, 0.8);
    graphics.fillRect(x, y, 40, 30);
    
    // Wheels
    graphics.fillStyle(0x1A1A1A, 1);
    graphics.fillCircle(x + 8, y + 30, 5);
    graphics.fillCircle(x + 32, y + 30, 5);
    
    // Forks
    graphics.lineStyle(2, this.STEEL, 1);
    graphics.lineBetween(x + 10, y, x + 5, y - 40);
    graphics.lineBetween(x + 30, y, x + 35, y - 40);
  }

  private addVityazMarkings(): void {
    // Vityaz unit emblems on warehouses
    this.drawSmallEmblem(this.graphics, 150, 300);
    this.drawSmallEmblem(this.graphics, this.width - 150, 350);
    
    // Tactical zone markers
    this.graphics.fillStyle(this.VITYAZ_CRIMSON, 0.3);
    this.graphics.fillCircle(200, 450, 80);
    this.graphics.fillCircle(this.width - 200, 500, 80);
    
    this.graphics.lineStyle(2, this.VITYAZ_GOLD, 1);
    this.graphics.strokeCircleShape(new Phaser.Geom.Circle(200, 450, 80));
    this.graphics.strokeCircleShape(new Phaser.Geom.Circle(this.width - 200, 500, 80));
    
    // Zone labels
    this.graphics.fillStyle(this.VITYAZ_GOLD, 1);
    this.graphics.fillText('ALPHA', 170, 460, { fontSize: '11px', color: '#D4AF37' });
    this.graphics.fillText('BRAVO', this.width - 230, 510, { fontSize: '11px', color: '#D4AF37' });
  }

  private drawSmallEmblem(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number
  ): void {
    graphics.fillStyle(this.VITYAZ_CRIMSON, 1);
    graphics.fillStar(x, y, 5, 12, 8);
    graphics.lineStyle(1, this.VITYAZ_GOLD, 1);
    graphics.strokeCircleShape(new Phaser.Geom.Circle(x, y, 15));
  }

  private createAtmosphere(): void {
    // Industrial haze
    this.graphics.fillStyle(0x333333, 0.2);
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      this.graphics.fillCircle(x, y, 30 + Math.random() * 50);
    }
    
    // Smoke from stacks
    this.graphics.fillStyle(0x555555, 0.3);
    this.graphics.fillCircle(65, 50, 60);
    this.graphics.fillCircle(this.width - 82, 70, 50);
  }

  getCollisionBodies(): Phaser.Geom.Rectangle[] {
    return [
      new Phaser.Geom.Rectangle(80, 280, 280, 260),
      new Phaser.Geom.Rectangle(this.width / 2 - 150, 240, 300, 300),
      new Phaser.Geom.Rectangle(this.width - 350, 320, 280, 240),
    ];
  }
}
