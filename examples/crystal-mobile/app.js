import {
  createCrystalRenderer,
  simulateScene,
  validateScene
} from "../../src/index.js";
import { mountPlayer } from "../shared/player.js";

await new Promise((resolve) => requestAnimationFrame(resolve));

const response = await fetch("./scene.json");
if (!response.ok) throw new Error(`Could not load scene: ${response.status}`);
const scene = validateScene(await response.json());
const simulation = simulateScene(scene);
const renderer = createCrystalRenderer(
  document.querySelector("#motion"),
  simulation
);

mountPlayer({
  scene,
  simulation,
  renderer,
  metricLabel: "peak grip",
  metricValue: `${simulation.diagnostics.observedMaxStaticGrip}/${scene.contact.maxStaticGrip}`
});
