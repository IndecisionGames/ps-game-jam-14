import { Scene, GameObjects } from "phaser";

const GRID_CELLS = 20;

export default class GameScene extends Scene {
  private grid: GameObjects.Grid | undefined;

  constructor() {
    super("scene-game");
  }

  create() {
    const gridSize = Math.min(window.innerWidth, window.innerHeight) * 0.95;
    this.grid = this.add.grid(
      window.innerWidth / 2,
      window.innerHeight / 2,
      gridSize,
      gridSize,
      gridSize / GRID_CELLS,
      gridSize / GRID_CELLS,
      0x9c9c9c
    );
    this.grid.setOutlineStyle(0x000000);
    this.grid.setOrigin(0.5, 0.5);
  }

  update(_time: number, _delta: number) {}
}
