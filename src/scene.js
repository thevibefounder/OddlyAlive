const DEFAULT_TOUCH_PATH = [
  { time: 0.48, x: -60, y: 326, pressure: 0 },
  { time: 0.59, x: 30, y: 329, pressure: 0.3 },
  { time: 0.74, x: 265, y: 338, pressure: 0.86 },
  { time: 1.08, x: 402, y: 360, pressure: 1 },
  { time: 1.48, x: 565, y: 386, pressure: 0.98 },
  { time: 1.88, x: 805, y: 397, pressure: 1 },
  { time: 2.14, x: 914, y: 376, pressure: 0.97 },
  { time: 2.28, x: 944, y: 367, pressure: 0.94 },
  { time: 2.44, x: 906, y: 376, pressure: 0.96 },
  { time: 2.7, x: 800, y: 408, pressure: 0.92 },
  { time: 3, x: 665, y: 424, pressure: 0.8 },
  { time: 3.29, x: 520, y: 416, pressure: 0.61 },
  { time: 3.58, x: 390, y: 392, pressure: 0.34 },
  { time: 3.84, x: 250, y: 370, pressure: 0.12 },
  { time: 4.08, x: 120, y: 356, pressure: 0.03 },
  { time: 4.32, x: 40, y: 351, pressure: 0 }
];

const DEFAULT_SCENE = {
  version: 1,
  type: "strand-field",
  name: "String Touch",
  seed: 11,
  canvas: {
    width: 960,
    height: 540
  },
  timing: {
    duration: 6.4,
    fps: 60,
    substeps: 4,
    preRoll: 2
  },
  field: {
    columns: 23,
    rows: 16,
    originX: 330,
    originY: 112,
    spacingX: 24,
    spacingY: 20
  },
  material: {
    gravity: 480,
    linearDrag: 0.92,
    quadraticDrag: 0.0023,
    lengthCompliance: 0.0000011,
    compressionCompliance: 0.00052,
    bendCompliance: 0.00062,
    maxStretch: 1.045
  },
  contact: {
    radiusX: 53,
    radiusY: 33,
    maxStaticGrip: 8,
    captureStartRow: 6,
    captureEndRow: 14
  },
  gesture: {
    type: "touch-path",
    points: DEFAULT_TOUCH_PATH
  },
  payload: {
    text: "ODDLY ALIVE  •  MAKE ANYTHING FEEL ALIVE  •  ",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: 12
  },
  render: {
    background: "#f0e7d3",
    ink: "#20201d",
    accent: "#ec5b36",
    filament: "rgba(32, 32, 29, 0.34)"
  }
};

function mergeSection(base, incoming) {
  return { ...base, ...(incoming ?? {}) };
}

export function createStringTouchScene(overrides = {}) {
  return {
    ...DEFAULT_SCENE,
    ...overrides,
    canvas: mergeSection(DEFAULT_SCENE.canvas, overrides.canvas),
    timing: mergeSection(DEFAULT_SCENE.timing, overrides.timing),
    field: mergeSection(DEFAULT_SCENE.field, overrides.field),
    material: mergeSection(DEFAULT_SCENE.material, overrides.material),
    contact: mergeSection(DEFAULT_SCENE.contact, overrides.contact),
    gesture: {
      ...DEFAULT_SCENE.gesture,
      ...(overrides.gesture ?? {}),
      points:
        overrides.gesture?.points?.map((point) => ({ ...point })) ??
        DEFAULT_TOUCH_PATH.map((point) => ({ ...point }))
    },
    payload: mergeSection(DEFAULT_SCENE.payload, overrides.payload),
    render: mergeSection(DEFAULT_SCENE.render, overrides.render)
  };
}

export function assertFiniteNumber(value, path, { minimum, maximum } = {}) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${path} must be a finite number.`);
  }
  if (minimum !== undefined && value < minimum) {
    throw new RangeError(`${path} must be at least ${minimum}.`);
  }
  if (maximum !== undefined && value > maximum) {
    throw new RangeError(`${path} must be at most ${maximum}.`);
  }
}

export function validateStrandScene(input) {
  const scene = createStringTouchScene(input);
  if (scene.version !== 1) {
    throw new RangeError(`Unsupported scene version: ${scene.version}`);
  }
  if (scene.type !== "strand-field") {
    throw new TypeError(`Unsupported scene type: ${scene.type}`);
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
  assertFiniteNumber(scene.field.columns, "field.columns", {
    minimum: 1,
    maximum: 128
  });
  assertFiniteNumber(scene.field.rows, "field.rows", {
    minimum: 3,
    maximum: 128
  });
  assertFiniteNumber(scene.material.maxStretch, "material.maxStretch", {
    minimum: 1,
    maximum: 1.5
  });
  assertFiniteNumber(
    scene.contact.maxStaticGrip,
    "contact.maxStaticGrip",
    { minimum: 1, maximum: scene.field.columns }
  );

  if (!Number.isInteger(scene.field.columns) || !Number.isInteger(scene.field.rows)) {
    throw new TypeError("field.columns and field.rows must be integers.");
  }
  if (!Number.isInteger(scene.timing.fps) || !Number.isInteger(scene.timing.substeps)) {
    throw new TypeError("timing.fps and timing.substeps must be integers.");
  }
  if (!Array.isArray(scene.gesture.points) || scene.gesture.points.length < 2) {
    throw new TypeError("gesture.points must contain at least two points.");
  }

  let previousTime = -Infinity;
  scene.gesture.points.forEach((point, index) => {
    assertFiniteNumber(point.time, `gesture.points[${index}].time`);
    assertFiniteNumber(point.x, `gesture.points[${index}].x`);
    assertFiniteNumber(point.y, `gesture.points[${index}].y`);
    assertFiniteNumber(point.pressure, `gesture.points[${index}].pressure`, {
      minimum: 0,
      maximum: 1
    });
    if (point.time <= previousTime) {
      throw new RangeError("gesture.points must be strictly ordered by time.");
    }
    previousTime = point.time;
  });

  if (scene.contact.captureStartRow < 0) {
    throw new RangeError("contact.captureStartRow cannot be negative.");
  }
  scene.contact.captureEndRow = Math.min(
    scene.field.rows - 1,
    scene.contact.captureEndRow
  );
  if (scene.contact.captureStartRow > scene.contact.captureEndRow) {
    throw new RangeError(
      "contact.captureStartRow must not exceed contact.captureEndRow."
    );
  }
  if (typeof scene.payload.text !== "string" || scene.payload.text.length === 0) {
    throw new TypeError("payload.text must be a non-empty string.");
  }
  if (scene.payload.terminalMass !== undefined) {
    assertFiniteNumber(scene.payload.terminalMass, "payload.terminalMass", {
      minimum: 0.1,
      maximum: 50
    });
  }

  return scene;
}

export const validateScene = validateStrandScene;
export const defaultStringTouchScene = createStringTouchScene();
