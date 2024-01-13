import { Cameras, Input, GameObjects, Scene } from "phaser";

const GRID_CELLS = 50;
const GRID_SIZE = 3000;
const CELL_SIZE = GRID_SIZE / GRID_CELLS;

const MAX_ZOOM = 1.5;
const MIN_ZOOM = 0.3;
const ZOOM_STEP = 0.1;
type Cell = { x: number; y: number };

function randInt(x: number) {
  return Math.floor(Math.random() * x) % x;
}

export default class GameScene extends Scene {
  private camera: Cameras.Scene2D.Camera | undefined;
  private grid: GameObjects.Grid | undefined;
  private fireCells: Set<Cell> = new Set();

  constructor() {
    super("scene-game");
  }

  create() {
    // Set up camera
    this.camera = this.cameras.main;
    this.cameras.main.setBounds(-GRID_SIZE / 2, -GRID_SIZE / 2, 2 * GRID_SIZE, 2 * GRID_SIZE);
    this.cameras.main.setZoom(1);
    this.cameras.main.centerOn(GRID_SIZE / 2, GRID_SIZE / 2);

    // Set up grid
    this.grid = this.add.grid(0, 0, GRID_SIZE, GRID_SIZE, CELL_SIZE, CELL_SIZE, 0xbab8b8, 1, 0x828282);
    this.grid.setOrigin(0, 0);

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
  }

  preload() {
    // this.load.image('map', 'assets/tests/camera/earthbound-scarab.png');
    this.load.spritesheet("fire-loop", "./assets/fire_fx_v1.0/png/orange/loops/burning_loop_1.png", {
      frameWidth: 24,
      frameHeight: 32,
    });
  }

  initializeRandomFireCells() {
    while (this.fireCells.size < 10) {
      this.spawnFireCell(this.randomXY(), this.randomXY());
    }
  }

  randomXY() {
    return randInt(GRID_CELLS);
  }

  coordinate() {}

  spawnFireCell(x: number, y: number) {
    if (!this.fireCells.has({ x, y })) {
      this.fireCells.add({ x, y });
      let sprite = this.add
        .sprite(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 3, "fire")
        .play("fire-loop");
      sprite.setOrigin(0.5, 0.5);
      sprite.setScale(2.45, 2.45);
      // console.log(x, y, x * CELL_SIZE);
    }
  }

  update(_time: number, _delta: number) {
    // TODO: Fire spreading mechanic
    //
  }

  handleInput() {
    this.input.mousePointer.motionFactor = 0.5;
    this.input.pointer1.motionFactor = 0.5;

    this.input.on("pointermove", (pointer: Input.Pointer) => {
      if (!this.camera) return;
      if (!pointer.isDown) return;
      const { x, y } = pointer.velocity;
      this.camera.scrollX -= x / this.camera.zoom;
      this.camera.scrollY -= y / this.camera.zoom;
    });

    this.input.on("wheel", (pointer: any, gameObjects: any, deltaX: any, deltaY: any, deltaZ: any) => {
      if (!this.camera) return;
      if (deltaY > 0) {
        var newZoom = this.camera.zoom - ZOOM_STEP;
        if (newZoom > MIN_ZOOM) {
          this.camera.zoom = newZoom;
        } else {
          this.camera.zoom = MIN_ZOOM;
        }
      }

      if (deltaY < 0) {
        var newZoom = this.camera.zoom + ZOOM_STEP;
        if (newZoom < MAX_ZOOM) {
          this.camera.zoom = newZoom;
        } else {
          this.camera.zoom = MAX_ZOOM;
        }
      }

      // this.camera.centerOn(pointer.worldX, pointer.worldY);
      // this.camera.pan(pointer.worldX, pointer.worldY, 2000, "Power2");
    });
  }
}
