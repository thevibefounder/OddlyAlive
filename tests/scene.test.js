import assert from "node:assert/strict";
import test from "node:test";
import {
  createRigidBallsScene,
  createStringTouchScene,
  createSurfaceWaveScene,
  sampleGesture,
  validateScene
} from "../src/index.js";

test("the default scene validates and merges payload overrides", () => {
  const scene = validateScene(
    createStringTouchScene({ payload: { text: "HELLO" } })
  );
  assert.equal(scene.payload.text, "HELLO");
  assert.equal(scene.field.columns, 23);
  assert.equal(scene.timing.fps * scene.timing.substeps, 240);
});

test("the registry validates every implemented scene family", () => {
  assert.equal(validateScene(createRigidBallsScene()).type, "rigid-balls");
  assert.equal(validateScene(createSurfaceWaveScene()).type, "surface-wave");
  assert.throws(
    () => validateScene({ type: "cloth" }),
    /Unsupported scene type/
  );
});

test("rigid impulse references and wave sample counts are guarded", () => {
  assert.throws(
    () =>
      validateScene(
        createRigidBallsScene({
          impulses: [
            {
              time: 0.2,
              body: "missing",
              impulseX: 1,
              impulseY: 1
            }
          ]
        })
      ),
    /unknown body/
  );
  assert.throws(
    () =>
      validateScene(
        createSurfaceWaveScene({ surface: { samples: 4 } })
      ),
    /at least 16/
  );
});

test("gesture sampling is smooth and bounded at both ends", () => {
  const scene = createStringTouchScene();
  const before = sampleGesture(scene.gesture.points, -10);
  const middle = sampleGesture(scene.gesture.points, 1.3);
  const after = sampleGesture(scene.gesture.points, 20);
  assert.equal(before.pressure, 0);
  assert.ok(middle.pressure > 0.9);
  assert.equal(after.pressure, 0);
});

test("invalid pressure and unordered gesture points are rejected", () => {
  assert.throws(
    () =>
      validateScene({
        gesture: {
          points: [
            { time: 1, x: 0, y: 0, pressure: 0 },
            { time: 0, x: 1, y: 1, pressure: 1.2 }
          ]
        }
      }),
    /pressure|ordered/
  );
});
