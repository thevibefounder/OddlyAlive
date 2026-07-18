export {
  createStringTouchScene,
  defaultStringTouchScene,
  validateStrandScene
} from "./scene.js";
export {
  createRigidBallsScene,
  defaultRigidBallsScene,
  validateRigidBallsScene
} from "./rigid-scene.js";
export {
  createSurfaceWaveScene,
  defaultSurfaceWaveScene,
  validateSurfaceWaveScene
} from "./wave-scene.js";
export { validateScene } from "./scene-registry.js";
export { clamp, sampleGesture, smoothStep } from "./gesture.js";
export {
  ContactState,
  simulateStrandField
} from "./strands.js";
export { simulateRigidBalls } from "./rigid-balls.js";
export { simulateSurfaceWave } from "./surface-wave.js";
export { createSvgRenderer } from "./svg-renderer.js";
export { createCrystalRenderer } from "./crystal-renderer.js";
export { createRigidBallRenderer } from "./rigid-renderer.js";
export { createSurfaceWaveRenderer } from "./wave-renderer.js";

import { simulateStrandField } from "./strands.js";
import { simulateRigidBalls } from "./rigid-balls.js";
import { simulateSurfaceWave } from "./surface-wave.js";

export function simulateScene(scene, options) {
  switch (scene?.type) {
    case "strand-field":
      return simulateStrandField(scene, options);
    case "rigid-balls":
      return simulateRigidBalls(scene, options);
    case "surface-wave":
      return simulateSurfaceWave(scene, options);
    default:
      throw new TypeError(`No solver registered for scene type: ${scene?.type}`);
  }
}
