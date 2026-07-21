import {
  createRigidBallRenderer,
  simulateScene,
  validateScene
} from "../../src/index.js";
import { mountPlayer } from "../shared/player.js";

await new Promise((resolve) => requestAnimationFrame(resolve));

const response = await fetch("./scene.json");
if (!response.ok) throw new Error(`Could not load scene: ${response.status}`);
const scene = validateScene(await response.json());
const simulation = simulateScene(scene);
const renderer = createRigidBallRenderer(
  document.querySelector("#motion"),
  simulation,
  {
    mode: "lab",
    ballAssets: {
      baseball: "../../assets/photoreal/baseball.png",
      basketball: "../../assets/photoreal/basketball.png",
      football: "../../assets/photoreal/soccer-ball.png"
    }
  }
);

mountPlayer({
  scene,
  simulation,
  renderer,
  metricLabel: "collisions",
  metricValue: String(simulation.diagnostics.collisionCount)
});
