import { assertFiniteNumber } from "./scene.js";

const DEFAULT_RIGID_SCENE = {
  version: 1,
  type: "rigid-balls",
  name: "Ball Lab",
  seed: 21,
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
  world: {
    gravity: 920,
    airDrag: 0.08,
    floorY: 456,
    left: 84,
    right: 876,
    groundFriction: 1.8
  },
  bodies: [
    {
      id: "baseball",
      kind: "baseball",
      label: "BASEBALL",
      x: 250,
      y: 104,
      radius: 29,
      mass: 0.145,
      restitution: 0.52,
      friction: 0.38,
      vx: 34,
      vy: 0,
      angle: -8,
      angularVelocity: 1.2,
      color: "#f4efe4"
    },
    {
      id: "basketball",
      kind: "basketball",
      label: "BASKETBALL",
      x: 480,
      y: 72,
      radius: 48,
      mass: 0.625,
      restitution: 0.76,
      friction: 0.58,
      vx: -18,
      vy: 0,
      angle: 4,
      angularVelocity: -0.5,
      color: "#e66b2d"
    },
    {
      id: "football",
      kind: "football",
      label: "FOOTBALL",
      x: 710,
      y: 124,
      radius: 39,
      mass: 0.43,
      restitution: 0.63,
      friction: 0.5,
      vx: -42,
      vy: 0,
      angle: 11,
      angularVelocity: 0.8,
      color: "#f6f3e9"
    }
  ],
  impulses: []
};

function mergeSection(base, incoming) {
  return { ...base, ...(incoming ?? {}) };
}

export function createRigidBallsScene(overrides = {}) {
  return {
    ...DEFAULT_RIGID_SCENE,
    ...overrides,
    canvas: mergeSection(DEFAULT_RIGID_SCENE.canvas, overrides.canvas),
    timing: mergeSection(DEFAULT_RIGID_SCENE.timing, overrides.timing),
    world: mergeSection(DEFAULT_RIGID_SCENE.world, overrides.world),
    bodies:
      overrides.bodies?.map((body) => ({ ...body })) ??
      DEFAULT_RIGID_SCENE.bodies.map((body) => ({ ...body })),
    impulses:
      overrides.impulses?.map((impulse) => ({ ...impulse })) ??
      DEFAULT_RIGID_SCENE.impulses.map((impulse) => ({ ...impulse }))
  };
}

export function validateRigidBallsScene(input) {
  const scene = createRigidBallsScene(input);
  if (scene.version !== 1) {
    throw new RangeError(`Unsupported scene version: ${scene.version}`);
  }
  if (scene.type !== "rigid-balls") {
    throw new TypeError(`Unsupported rigid scene type: ${scene.type}`);
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
    "gravity",
    "airDrag",
    "floorY",
    "left",
    "right",
    "groundFriction"
  ]) {
    assertFiniteNumber(scene.world[key], `world.${key}`);
  }
  if (
    scene.world.airDrag < 0 ||
    scene.world.groundFriction < 0
  ) {
    throw new RangeError("world drag and friction values cannot be negative.");
  }
  if (scene.world.left >= scene.world.right) {
    throw new RangeError("world.left must be less than world.right.");
  }
  if (!Array.isArray(scene.bodies) || scene.bodies.length === 0) {
    throw new TypeError("bodies must contain at least one rigid body.");
  }
  if (scene.bodies.length > 64) {
    throw new RangeError("The alpha supports at most 64 rigid bodies.");
  }

  const ids = new Set();
  scene.bodies.forEach((body, index) => {
    if (typeof body.id !== "string" || body.id.length === 0) {
      throw new TypeError(`bodies[${index}].id must be a non-empty string.`);
    }
    if (typeof body.kind !== "string" || body.kind.length === 0) {
      throw new TypeError(`bodies[${index}].kind must be a non-empty string.`);
    }
    if (typeof body.color !== "string" || body.color.length === 0) {
      throw new TypeError(`bodies[${index}].color must be a non-empty string.`);
    }
    if (ids.has(body.id)) {
      throw new RangeError(`Duplicate rigid body id: ${body.id}`);
    }
    ids.add(body.id);
    for (const key of [
      "x",
      "y",
      "radius",
      "mass",
      "restitution",
      "friction",
      "vx",
      "vy",
      "angle",
      "angularVelocity"
    ]) {
      assertFiniteNumber(body[key], `bodies[${index}].${key}`);
    }
    if (body.radius <= 0 || body.mass <= 0) {
      throw new RangeError(`bodies[${index}] radius and mass must be positive.`);
    }
    if (body.restitution < 0 || body.restitution > 1) {
      throw new RangeError(`bodies[${index}].restitution must be between 0 and 1.`);
    }
    if (body.friction < 0 || body.friction > 1) {
      throw new RangeError(`bodies[${index}].friction must be between 0 and 1.`);
    }
  });

  let previousTime = -Infinity;
  scene.impulses.forEach((impulse, index) => {
    assertFiniteNumber(impulse.time, `impulses[${index}].time`);
    assertFiniteNumber(impulse.impulseX, `impulses[${index}].impulseX`);
    assertFiniteNumber(impulse.impulseY, `impulses[${index}].impulseY`);
    assertFiniteNumber(
      impulse.angularImpulse ?? 0,
      `impulses[${index}].angularImpulse`
    );
    if (!ids.has(impulse.body)) {
      throw new RangeError(`impulses[${index}] references unknown body ${impulse.body}.`);
    }
    if (impulse.time < 0 || impulse.time > scene.timing.duration) {
      throw new RangeError(
        `impulses[${index}].time must fall within the scene duration.`
      );
    }
    if (impulse.time < previousTime) {
      throw new RangeError("impulses must be ordered by time.");
    }
    previousTime = impulse.time;
  });

  return scene;
}

export const defaultRigidBallsScene = createRigidBallsScene();
