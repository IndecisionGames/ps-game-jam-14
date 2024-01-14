import { Cameras, Input, GameObjects, Scene } from "phaser";

export default class HudScene extends Scene {
  private scoreText?: GameObjects.Text;

  constructor() {
    super({ key: "HudScene" });
  }

  create() {
    // Initialize and create HUD elements here
    // For example, display the score:
    this.scoreText = this.add.text(16, 16, "Score: 0", { fontSize: "32px" });
  }
}
