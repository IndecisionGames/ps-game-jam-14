import { Cameras, Input, GameObjects, Scene } from "phaser";

export default class HudScene extends Scene {
  private score?: number;
  private scoreText?: GameObjects.Text;

  constructor() {
    super({ key: "HudScene" });
  }

  create() {
    // Initialize and create HUD elements here
    // For example, display the score:
    this.score = 0;
    this.scoreText = this.add.text(16, 16, "Score: 0", { fontSize: "32px" });
  }

  update(time: number, _delta: number) {
    this.score = Math.floor(time / 1000);
    if (this.scoreText) this.scoreText.text = `Score: ${this.score}`;
  }
}
