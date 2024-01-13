import "./style.css";
import { Game, WEBGL } from "phaser";
import GameScene from "./gameScene";

const canvas = document.getElementById("game") as HTMLCanvasElement;

const config = {
  type: WEBGL,
  width: window.innerWidth,
  height: window.innerHeight,
  canvas,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [GameScene],
};

new Game(config);
