import {
  createSurfaceWaveRenderer,
  simulateScene,
  validateScene
} from "../../src/index.js";
import { mountPlayer } from "../shared/player.js";

await new Promise((resolve) => requestAnimationFrame(resolve));

const response = await fetch("./scene.json");
if (!response.ok) throw new Error(`Could not load scene: ${response.status}`);
const scene = validateScene(await response.json());
const simulation = simulateScene(scene);
const renderer = createSurfaceWaveRenderer(
  document.querySelector("#motion"),
  simulation
);

mountPlayer({
  scene,
  simulation,
  renderer,
  metricLabel: "wave peak",
  metricValue: `${simulation.diagnostics.maxWaveHeight.toFixed(1)} px`
});
