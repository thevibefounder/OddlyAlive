import { assertFiniteNumber } from "./scene.js";

const DEFAULT_WAVE_SCENE = {
  version: 1,
  type: "surface-wave",
  name: "Shoe Splash",
  seed: 31,
  canvas: {
    width: 960,
    height: 540
  },
  timing: {
    duration: 6.4,
    fps: 60,
    substeps: 4,
    preRoll: 0
  },
  surface: {
    x: 70,
    width: 820,
    restY: 330,
    samples: 161,
    waveSpeed: 172,
    damping: 2.4,
    coupling: 0.42
  },
  world: {
    gravity: 720,
    airDrag: 0.06,
    waterDrag: 4.8,
    buoyancy: 29
  },
  body: {
    id: "shoe",
    kind: "shoe",
    x: 500,
    y: 78,
    width: 174,
    height: 66,
    mass: 0.72,
    vx: -11,
    vy: 20,
    angle: -13,
    angularVelocity: 0.9,
    restitution: 0.18
  }
};

function mergeSection(base, incoming) {
  return { ...base, ...(incoming ?? {}) };
}

export function createSurfaceWaveScene(overrides = {}) {
  return {
    ...DEFAULT_WAVE_SCENE,
    ...overrides,
    canvas: mergeSection(DEFAULT_WAVE_SCENE.canvas, overrides.canvas),
    timing: mergeSection(DEFAULT_WAVE_SCENE.timing, overrides.timing),
    surface: mergeSection(DEFAULT_WAVE_SCENE.surface, overrides.surface),
    world: mergeSection(DEFAULT_WAVE_SCENE.world, overrides.world),
    body: mergeSection(DEFAULT_WAVE_SCENE.body, overrides.body)
  };
}

export function validateSurfaceWaveScene(input) {
  const scene = createSurfaceWaveScene(input);
  if (scene.version !== 1) {
    throw new RangeError(`Unsupported scene version: ${scene.version}`);
  }
  if (scene.type !== "surface-wave") {
    throw new TypeError(`Unsupported wave scene type: ${scene.type}`);
  }

  assertFiniteNumber(scene.seed, "seed");
  assertFiniteNumber(scene.canvas.width, "canvas.width", { minimum: 64 });
  assertFiniteNumber(scene.canvas.height, "canvas.height", { minimum: 64 });
  assertFiniteNumber(scene.timing.duration, "timing.duration", {
    minimum: 0.1,
    maximum: 60
  });
  assertFiniteNumber(scene.timing.fps, "timing.fps", {
    minimum: 1,
    maximum: 240
  });
  assertFiniteNumber(scene.timing.substeps, "timing.substeps", {
    minimum: 1,
    maximum: 16
  });
  assertFiniteNumber(scene.timing.preRoll, "timing.preRoll", {
    minimum: 0,
    maximum: 30
  });
  if (!Number.isInteger(scene.timing.fps) || !Number.isInteger(scene.timing.substeps)) {
    throw new TypeError("timing.fps and timing.substeps must be integers.");
  }

  for (const key of [
    "x",
    "width",
    "restY",
    "samples",
    "waveSpeed",
    "damping",
    "coupling"
  ]) {
    assertFiniteNumber(scene.surface[key], `surface.${key}`);
  }
  if (!Number.isInteger(scene.surface.samples) || scene.surface.samples < 16) {
    throw new RangeError("surface.samples must be an integer of at least 16.");
  }
  if (scene.surface.samples > 1024) {
    throw new RangeError("surface.samples cannot exceed 1024.");
  }
  if (
    scene.surface.width <= 0 ||
    scene.surface.waveSpeed <= 0 ||
    scene.surface.damping < 0 ||
    scene.surface.coupling < 0
  ) {
    throw new RangeError(
      "surface width and speed must be positive; damping and coupling cannot be negative."
    );
  }
  for (const key of ["gravity", "airDrag", "waterDrag", "buoyancy"]) {
    assertFiniteNumber(scene.world[key], `world.${key}`);
  }
  if (
    scene.world.airDrag < 0 ||
    scene.world.waterDrag < 0 ||
    scene.world.buoyancy < 0
  ) {
    throw new RangeError("world drag and buoyancy values cannot be negative.");
  }
  if (typeof scene.body.id !== "string" || scene.body.id.length === 0) {
    throw new TypeError("body.id must be a non-empty string.");
  }
  if (typeof scene.body.kind !== "string" || scene.body.kind.length === 0) {
    throw new TypeError("body.kind must be a non-empty string.");
  }
  for (const key of [
    "x",
    "y",
    "width",
    "height",
    "mass",
    "vx",
    "vy",
    "angle",
    "angularVelocity",
    "restitution"
  ]) {
    assertFiniteNumber(scene.body[key], `body.${key}`);
  }
  if (scene.body.width <= 0 || scene.body.height <= 0 || scene.body.mass <= 0) {
    throw new RangeError("body width, height, and mass must be positive.");
  }
  if (scene.body.restitution < 0 || scene.body.restitution > 1) {
    throw new RangeError("body.restitution must be between 0 and 1.");
  }
  return scene;
}

export const defaultSurfaceWaveScene = createSurfaceWaveScene();
