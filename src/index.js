export {
  createStringTouchScene,
  defaultStringTouchScene,
  validateScene
} from "./scene.js";
export { clamp, sampleGesture, smoothStep } from "./gesture.js";
export {
  ContactState,
  simulateStrandField
} from "./strands.js";
export { createSvgRenderer } from "./svg-renderer.js";

import { simulateStrandField } from "./strands.js";

export function simulateScene(scene, options) {
  if (scene?.type !== "strand-field") {
    throw new TypeError(`No solver registered for scene type: ${scene?.type}`);
  }
  return simulateStrandField(scene, options);
}
