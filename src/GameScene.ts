import { Cameras, Input, GameObjects, Scene } from "phaser";

const GRID_CELLS = 50;
const GRID_SIZE = 3000;
const CELL_SIZE = GRID_SIZE / GRID_CELLS;

const MAX_ZOOM = 1.5;
const MIN_ZOOM = 0.5;
const ZOOM_STEP = 0.1;

const SPREAD_TIME = 3000; // ms
const SPREAD_CHANCE = 0.2;

type Cell = { x: number; y: number };

enum Direction {
  Up,
  Down,
  Left,
  Right,
}

function randInt(x: number) {
  return Math.floor(Math.random() * x) % x;
}

function cell(x: number, y: number) {
  return `${x},${y}`;
}

export default class GameScene extends Scene {
  private camera?: Cameras.Scene2D.Camera;
  private highlights: GameObjects.Rectangle[] = [];
  private grid?: GameObjects.Grid;
  private fireCells: Set<string> = new Set();
  private fireCellMap: Map<string, Cell> = new Map();
  private fireSprites: Map<string, GameObjects.Sprite> = new Map();
  private timer: number = 0;

  constructor() {
    super({ key: "GameScene" });
  }

  create() {
    // Set up camera
    this.camera = this.cameras.main;
    this.cameras.main.setBounds(-GRID_SIZE / 8, -GRID_SIZE / 8, 1.25 * GRID_SIZE, 1.25 * GRID_SIZE);
    this.cameras.main.setZoom(1);
    this.cameras.main.centerOn(GRID_SIZE / 2, GRID_SIZE / 2);

    // Set up grid
    this.grid = this.add.grid(0, 0, GRID_SIZE, GRID_SIZE, CELL_SIZE, CELL_SIZE, 0xbab8b8, 1, 0x828282);
    this.grid.setOrigin(0, 0);

    // Set up highlights
    this.highlights.push(
      this.add.rectangle(-9999, -9999, CELL_SIZE, CELL_SIZE, 0x000000, 0.2).setInteractive({ cursor: "pointer" })
    );

    // Animations
    const fireLoopConfig = {
      key: "fire-loop",
      frames: this.anims.generateFrameNumbers("fire-loop", { start: 0, end: 7, first: 0 }),
      frameRate: 8,
      repeat: -1,
    };
    this.anims.create(fireLoopConfig);

    // FIXME: Just for testing
    this.initializeRandomFireCells();
    this.handleInput();

    this.scene.launch("HudScene");
  }

  preload() {
    // this.load.image('map', 'assets/tests/camera/earthbound-scarab.png');
    this.load.spritesheet("fire-loop", "./assets/fire_fx_v1.0/png/orange/loops/burning_loop_1.png", {
      frameWidth: 24,
      frameHeight: 32,
    });
  }

  initializeRandomFireCells() {
    while (this.fireCells.size < 25) {
      this.spawnFireCell(this.randomXY(), this.randomXY());
    }
  }

  randomXY() {
    return randInt(GRID_CELLS);
  }

  coordinate() {}

  spawnFireCell(x: number, y: number) {
    if (!this.fireCells.has(cell(x, y))) {
      this.fireCells.add(cell(x, y));
      let sprite = this.add
        .sprite(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 3, "fire")
        .play("fire-loop");
      sprite.setOrigin(0.5, 0.5);
      sprite.setScale(2.45, 2.45);
      this.fireSprites.set(cell(x, y), sprite);
      this.fireCellMap.set(cell(x, y), { x, y });
    }
  }

  update(time: number, _delta: number) {
    if (time - this.timer > SPREAD_TIME) {
      // for each flame give it a small % chance to spread in a random direction
      this.fireCellMap.forEach((c: Cell, _key: string) => {
        if (Math.random() <= SPREAD_CHANCE) {
          const validCells: Cell[] = [];
          if (c.x > 0 && !this.fireCells.has(cell(c.x - 1, c.y))) validCells.push({ x: c.x - 1, y: c.y });
          if (c.x < GRID_CELLS - 1 && !this.fireCells.has(cell(c.x + 1, c.y))) validCells.push({ x: c.x + 1, y: c.y });
          if (c.y > 0 && !this.fireCells.has(cell(c.x, c.y - 1))) validCells.push({ x: c.x, y: c.y - 1 });
          if (c.y < GRID_CELLS - 1 && !this.fireCells.has(cell(c.x, c.y + 1))) validCells.push({ x: c.x, y: c.y + 1 });

          if (validCells.length > 0) {
            const spreadCell = validCells[randInt(validCells.length)];
            this.spawnFireCell(spreadCell.x, spreadCell.y);
          }
        }
      });
      this.timer = time;
    }
  }

  handleInput() {
    this.input.mousePointer.motionFactor = 0.5;
    this.input.pointer1.motionFactor = 0.5;

    this.input.on("pointermove", (pointer: Input.Pointer) => {
      this.updateHighlightPosition(pointer);
      if (!this.camera) return;
      if (!pointer.isDown) return;
      const { x, y } = pointer.velocity;
      this.camera.scrollX -= x / this.camera.zoom;
      this.camera.scrollY -= y / this.camera.zoom;
      this.updateHighlightPosition(pointer);
    });

    this.input.on("pointerdown", (pointer: Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        const x = Math.floor(pointer.worldX / CELL_SIZE);
        const y = Math.floor(pointer.worldY / CELL_SIZE);

        if (this.fireSprites.has(cell(x, y))) {
          this.fireSprites.get(cell(x, y))?.destroy();
          this.fireSprites.delete(cell(x, y));
          this.fireCellMap.delete(cell(x, y));
          this.fireCells.delete(cell(x, y));
        }
      }
    });

    this.input.on("wheel", (pointer: any, _gameObject: any, _deltaX: any, deltaY: any, _deltaZ: any) => {
      if (!this.camera) return;

      // Zoom out
      if (deltaY > 0) {
        var newZoom = this.camera.zoom - ZOOM_STEP;
        if (newZoom > MIN_ZOOM) {
          this.camera.zoom = newZoom;
        } else {
          this.camera.zoom = MIN_ZOOM;
        }
      }

      // Zoom in
      if (deltaY < 0) {
        var newZoom = this.camera.zoom + ZOOM_STEP;
        if (newZoom < MAX_ZOOM) {
          this.camera.zoom = newZoom;
        } else {
          this.camera.zoom = MAX_ZOOM;
        }
      }
      this.updateHighlightPosition(pointer);
    });
  }

  updateHighlightPosition(pointer: Input.Pointer) {
    if (pointer.worldX > GRID_SIZE || pointer.worldX < 0 || pointer.worldY > GRID_SIZE || pointer.worldY < 0) {
      this.highlights[0].setPosition(-9999, -9999);
    } else {
      const cellX = Math.floor(pointer.worldX / CELL_SIZE) * CELL_SIZE + 0.5 * CELL_SIZE;
      const cellY = Math.floor(pointer.worldY / CELL_SIZE) * CELL_SIZE + 0.5 * CELL_SIZE;
      this.highlights[0].setPosition(cellX, cellY);
    }
  }
}
