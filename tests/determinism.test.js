import assert from "node:assert/strict";
import test from "node:test";
import {
  createStringTouchScene,
  simulateScene
} from "../src/index.js";

const compactScene = createStringTouchScene({
  timing: {
    duration: 4.8,
    fps: 30,
    substeps: 8,
    preRoll: 0.5
  },
  field: {
    columns: 13,
    rows: 10,
    originX: 145,
    originY: 108,
    spacingX: 48,
    spacingY: 28
  },
  contact: {
    maxStaticGrip: 6,
    captureStartRow: 3,
    captureEndRow: 9
  }
});

test("the same scene produces the same simulation fingerprint", () => {
  const first = simulateScene(compactScene, { includeFrames: false });
  const second = simulateScene(compactScene, { includeFrames: false });
  assert.equal(first.fingerprint, second.fingerprint);
  assert.equal(
    first.diagnostics.observedMaxStaticGrip,
    second.diagnostics.observedMaxStaticGrip
  );
  assert.ok(first.diagnostics.observedMaxStaticGrip > 0);
  assert.ok(
    first.diagnostics.observedMaxStaticGrip <=
      compactScene.contact.maxStaticGrip
  );
  assert.ok(first.diagnostics.firstGripTime !== null);
  assert.ok(
    first.diagnostics.observedMaxStretch <
      compactScene.material.maxStretch + 0.02
  );
});

test("changing the material seed changes the fingerprint", () => {
  const first = simulateScene(compactScene, { includeFrames: false });
  const second = simulateScene(
    { ...compactScene, seed: compactScene.seed + 1 },
    { includeFrames: false }
  );
  assert.notEqual(first.fingerprint, second.fingerprint);
});
