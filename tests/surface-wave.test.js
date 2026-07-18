import assert from "node:assert/strict";
import test from "node:test";
import {
  createSurfaceWaveScene,
  simulateScene,
  validateScene
} from "../src/index.js";

test("the coupled wave is deterministic and responds to impact", () => {
  const scene = validateScene(createSurfaceWaveScene());
  const first = simulateScene(scene, { includeFrames: false });
  const second = simulateScene(scene, { includeFrames: false });

  assert.equal(first.fingerprint, second.fingerprint);
  assert.ok(first.diagnostics.impactCount > 0);
  assert.ok(first.diagnostics.firstImpactTime > 0.5);
  assert.ok(first.diagnostics.firstImpactTime < 1.5);
  assert.ok(first.diagnostics.maxWaveHeight > 1);
  assert.ok(first.diagnostics.maxWaveHeight < 100);
  assert.ok(first.diagnostics.maxSubmersion < scene.body.height);
});

test("surface parameters alter the deterministic result", () => {
  const original = simulateScene(createSurfaceWaveScene(), {
    includeFrames: false
  });
  const calmer = simulateScene(
    createSurfaceWaveScene({
      surface: { damping: 5.5, coupling: 0.22 }
    }),
    { includeFrames: false }
  );

  assert.notEqual(original.fingerprint, calmer.fingerprint);
  assert.ok(
    calmer.diagnostics.maxWaveHeight <
      original.diagnostics.maxWaveHeight
  );
});
