import { validateRigidBallsScene } from "./rigid-scene.js";
import { validateStrandScene } from "./scene.js";
import { validateSurfaceWaveScene } from "./wave-scene.js";

export function validateScene(input) {
  switch (input?.type) {
    case "strand-field":
    case undefined:
      return validateStrandScene(input);
    case "rigid-balls":
      return validateRigidBallsScene(input);
    case "surface-wave":
      return validateSurfaceWaveScene(input);
    default:
      throw new TypeError(`Unsupported scene type: ${input?.type}`);
  }
}
