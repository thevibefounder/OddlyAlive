import assert from "node:assert/strict";
import test from "node:test";
import {
  createRigidBallsScene,
  simulateScene,
  validateScene
} from "../src/index.js";

test("rigid ball worlds are deterministic and collide within bounds", () => {
  const scene = validateScene(createRigidBallsScene());
  const first = simulateScene(scene, { includeFrames: false });
  const second = simulateScene(scene, { includeFrames: false });

  assert.equal(first.fingerprint, second.fingerprint);
  assert.ok(first.diagnostics.collisionCount > 0);
  assert.ok(first.diagnostics.firstImpactTime > 0.5);
  assert.ok(first.diagnostics.firstImpactTime < 1.5);
  assert.ok(first.diagnostics.maxPenetration < 10);
  assert.equal(first.diagnostics.appliedImpulses, 0);
});

test("a scheduled kick is applied exactly once and changes the world", () => {
  const scene = createRigidBallsScene({
    bodies: [
      {
        id: "ball",
        kind: "football",
        label: "FOOTBALL",
        x: 180,
        y: 392,
        radius: 38,
        mass: 0.43,
        restitution: 0.62,
        friction: 0.58,
        vx: 0,
        vy: 0,
        angle: 0,
        angularVelocity: 0,
        color: "#f6f3e9"
      }
    ],
    world: { floorY: 430, left: 70, right: 910, groundFriction: 2.4 },
    impulses: [
      {
        time: 0.62,
        body: "ball",
        impulseX: 300,
        impulseY: -235,
        angularImpulse: 4.6
      }
    ]
  });
  const kicked = simulateScene(scene, { includeFrames: false });
  const still = simulateScene(
    createRigidBallsScene({ ...scene, impulses: [] }),
    { includeFrames: false }
  );

  assert.equal(kicked.diagnostics.appliedImpulses, 1);
  assert.notEqual(kicked.fingerprint, still.fingerprint);
  assert.ok(kicked.diagnostics.maxSpeed > 500);
});

test("rigid pre-roll advances the world before output frame zero", () => {
  const withoutPreRoll = simulateScene(
    createRigidBallsScene({
      timing: { duration: 1, fps: 60, substeps: 4, preRoll: 0 }
    })
  );
  const withPreRoll = simulateScene(
    createRigidBallsScene({
      timing: { duration: 1, fps: 60, substeps: 4, preRoll: 0.25 }
    })
  );

  assert.ok(withPreRoll.frames[0].y[0] > withoutPreRoll.frames[0].y[0]);
});
