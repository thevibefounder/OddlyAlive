import { validateRigidBallsScene } from "./rigid-scene.js";
import { createStateHasher } from "./state-hash.js";

export function simulateRigidBalls(inputScene, options = {}) {
  const scene = validateRigidBallsScene(inputScene);
  const { fps, substeps, duration } = scene.timing;
  const dt = 1 / (fps * substeps);
  const frameCount = Math.round(duration * fps) + 1;
  const count = scene.bodies.length;
  const includeFrames = options.includeFrames !== false;

  const x = new Float64Array(count);
  const y = new Float64Array(count);
  const vx = new Float64Array(count);
  const vy = new Float64Array(count);
  const angle = new Float64Array(count);
  const angularVelocity = new Float64Array(count);
  const radius = new Float64Array(count);
  const mass = new Float64Array(count);
  const inverseMass = new Float64Array(count);
  const restitution = new Float64Array(count);
  const friction = new Float64Array(count);
  const idToIndex = new Map();

  scene.bodies.forEach((body, index) => {
    x[index] = body.x;
    y[index] = body.y;
    vx[index] = body.vx;
    vy[index] = body.vy;
    angle[index] = body.angle;
    angularVelocity[index] = body.angularVelocity;
    radius[index] = body.radius;
    mass[index] = body.mass;
    inverseMass[index] = 1 / body.mass;
    restitution[index] = body.restitution;
    friction[index] = body.friction;
    idToIndex.set(body.id, index);
  });

  const frames = includeFrames ? new Array(frameCount) : null;
  const diagnostics = {
    kineticEnergy: new Float32Array(frameCount),
    floorContacts: new Uint16Array(frameCount),
    collisionCount: 0,
    firstImpactTime: null,
    maxSpeed: 0,
    maxPenetration: 0,
    finalRestingBodies: 0,
    appliedImpulses: 0
  };
  const hasher = createStateHasher();
  let impulseCursor = 0;
  let previousTime = -dt;

  function registerImpact(time, speed, penetration) {
    if (speed > 8) {
      diagnostics.collisionCount += 1;
      if (diagnostics.firstImpactTime === null && time >= 0) {
        diagnostics.firstImpactTime = time;
      }
    }
    diagnostics.maxPenetration = Math.max(
      diagnostics.maxPenetration,
      penetration
    );
  }

  function applyScheduledImpulses(time) {
    while (
      impulseCursor < scene.impulses.length &&
      scene.impulses[impulseCursor].time <= time + dt * 0.5
    ) {
      const impulse = scene.impulses[impulseCursor];
      if (impulse.time > previousTime - dt * 0.5) {
        const index = idToIndex.get(impulse.body);
        vx[index] += impulse.impulseX * inverseMass[index];
        vy[index] += impulse.impulseY * inverseMass[index];
        angularVelocity[index] +=
          (impulse.angularImpulse ?? 0) * inverseMass[index];
        diagnostics.appliedImpulses += 1;
      }
      impulseCursor += 1;
    }
  }

  function solveBodyPair(a, b, time) {
    let dx = x[b] - x[a];
    let dy = y[b] - y[a];
    let distance = Math.sqrt(dx * dx + dy * dy);
    const minimumDistance = radius[a] + radius[b];
    if (distance >= minimumDistance) return;
    if (distance < 0.0001) {
      dx = a < b ? 1 : -1;
      dy = 0;
      distance = 1;
    }

    const nx = dx / distance;
    const ny = dy / distance;
    const penetration = minimumDistance - distance;
    const inverseMassTotal = inverseMass[a] + inverseMass[b];
    const correction = Math.max(0, penetration - 0.01) * 0.86;
    x[a] -=
      nx * correction * (inverseMass[a] / Math.max(0.0001, inverseMassTotal));
    y[a] -=
      ny * correction * (inverseMass[a] / Math.max(0.0001, inverseMassTotal));
    x[b] +=
      nx * correction * (inverseMass[b] / Math.max(0.0001, inverseMassTotal));
    y[b] +=
      ny * correction * (inverseMass[b] / Math.max(0.0001, inverseMassTotal));

    const relativeX = vx[b] - vx[a];
    const relativeY = vy[b] - vy[a];
    const normalVelocity = relativeX * nx + relativeY * ny;
    if (normalVelocity >= 0) return;

    const combinedRestitution = Math.min(restitution[a], restitution[b]);
    const normalImpulse =
      (-(1 + combinedRestitution) * normalVelocity) / inverseMassTotal;
    const impulseX = normalImpulse * nx;
    const impulseY = normalImpulse * ny;
    vx[a] -= impulseX * inverseMass[a];
    vy[a] -= impulseY * inverseMass[a];
    vx[b] += impulseX * inverseMass[b];
    vy[b] += impulseY * inverseMass[b];

    const tangentX = -ny;
    const tangentY = nx;
    const tangentVelocity = relativeX * tangentX + relativeY * tangentY;
    const frictionLimit =
      normalImpulse * Math.sqrt(friction[a] * friction[b]);
    const tangentImpulse = Math.max(
      -frictionLimit,
      Math.min(frictionLimit, -tangentVelocity / inverseMassTotal)
    );
    vx[a] -= tangentImpulse * tangentX * inverseMass[a];
    vy[a] -= tangentImpulse * tangentY * inverseMass[a];
    vx[b] += tangentImpulse * tangentX * inverseMass[b];
    vy[b] += tangentImpulse * tangentY * inverseMass[b];
    angularVelocity[a] -=
      (tangentImpulse * radius[a] * inverseMass[a]) /
      Math.max(1, radius[a] * radius[a] * 0.5);
    angularVelocity[b] +=
      (tangentImpulse * radius[b] * inverseMass[b]) /
      Math.max(1, radius[b] * radius[b] * 0.5);

    registerImpact(time, -normalVelocity, penetration);
  }

  function solveWorld(index, time) {
    const bodyRadius = radius[index];
    let contacts = 0;

    if (x[index] - bodyRadius < scene.world.left) {
      const penetration = scene.world.left - (x[index] - bodyRadius);
      x[index] = scene.world.left + bodyRadius;
      if (vx[index] < 0) {
        registerImpact(time, -vx[index], penetration);
        vx[index] = -vx[index] * restitution[index];
      }
    }
    if (x[index] + bodyRadius > scene.world.right) {
      const penetration =
        x[index] + bodyRadius - scene.world.right;
      x[index] = scene.world.right - bodyRadius;
      if (vx[index] > 0) {
        registerImpact(time, vx[index], penetration);
        vx[index] = -vx[index] * restitution[index];
      }
    }

    if (y[index] + bodyRadius > scene.world.floorY) {
      const penetration =
        y[index] + bodyRadius - scene.world.floorY;
      y[index] = scene.world.floorY - bodyRadius;
      contacts += 1;
      if (vy[index] > 0) {
        const impactSpeed = vy[index];
        registerImpact(time, impactSpeed, penetration);
        vy[index] =
          impactSpeed < 22 ? 0 : -impactSpeed * restitution[index];
        const tangentialLoss = Math.max(
          0,
          1 - friction[index] * 0.12
        );
        vx[index] *= tangentialLoss;
        angularVelocity[index] +=
          (vx[index] / Math.max(1, bodyRadius)) *
          friction[index] *
          0.28;
      }
      if (Math.abs(vy[index]) < 20) {
        const groundDecay = Math.exp(
          -scene.world.groundFriction * friction[index] * dt
        );
        vx[index] *= groundDecay;
        angularVelocity[index] *= Math.exp(
          -scene.world.groundFriction * 0.45 * dt
        );
        if (Math.abs(vx[index]) < 0.35) vx[index] = 0;
        if (Math.abs(angularVelocity[index]) < 0.02) {
          angularVelocity[index] = 0;
        }
      }
    }
    return contacts;
  }

  function step(time) {
    applyScheduledImpulses(time);
    const airDecay = Math.exp(-scene.world.airDrag * dt);
    for (let index = 0; index < count; index += 1) {
      vy[index] += scene.world.gravity * dt;
      vx[index] *= airDecay;
      vy[index] *= airDecay;
      angularVelocity[index] *= Math.exp(-scene.world.airDrag * 0.35 * dt);
      x[index] += vx[index] * dt;
      y[index] += vy[index] * dt;
      angle[index] += angularVelocity[index] * dt * (180 / Math.PI);
    }

    for (let pass = 0; pass < 2; pass += 1) {
      for (let a = 0; a < count - 1; a += 1) {
        for (let b = a + 1; b < count; b += 1) {
          solveBodyPair(a, b, time);
        }
      }
    }
    for (let index = 0; index < count; index += 1) {
      solveWorld(index, time);
      const speed = Math.sqrt(vx[index] ** 2 + vy[index] ** 2);
      diagnostics.maxSpeed = Math.max(diagnostics.maxSpeed, speed);
    }
    previousTime = time;
  }

  function saveFrame(frameIndex) {
    const state = includeFrames
      ? {
          x: Float32Array.from(x),
          y: Float32Array.from(y),
          angle: Float32Array.from(angle)
        }
      : null;
    let energy = 0;
    let floorContacts = 0;
    let resting = 0;
    for (let index = 0; index < count; index += 1) {
      energy +=
        0.5 *
        mass[index] *
        (vx[index] ** 2 +
          vy[index] ** 2 +
          (angularVelocity[index] * radius[index]) ** 2);
      if (Math.abs(y[index] + radius[index] - scene.world.floorY) < 0.1) {
        floorContacts += 1;
      }
      if (
        Math.abs(vx[index]) < 1 &&
        Math.abs(vy[index]) < 1 &&
        Math.abs(angularVelocity[index]) < 0.05
      ) {
        resting += 1;
      }
      if (frameIndex % 6 === 0) {
        hasher.add(x[index]);
        hasher.add(y[index]);
        hasher.add(angle[index]);
      }
    }
    diagnostics.kineticEnergy[frameIndex] = energy;
    diagnostics.floorContacts[frameIndex] = floorContacts;
    if (frameIndex === frameCount - 1) {
      diagnostics.finalRestingBodies = resting;
    }
    if (frames) frames[frameIndex] = state;
  }

  const preRollSteps = Math.round(scene.timing.preRoll / dt);
  for (let index = 0; index < preRollSteps; index += 1) {
    step((index - preRollSteps) * dt);
  }
  diagnostics.collisionCount = 0;
  diagnostics.firstImpactTime = null;
  diagnostics.maxSpeed = 0;
  diagnostics.maxPenetration = 0;
  diagnostics.finalRestingBodies = 0;
  diagnostics.appliedImpulses = 0;

  for (let frame = 0; frame < frameCount; frame += 1) {
    saveFrame(frame);
    if (frame === frameCount - 1) break;
    for (let substep = 0; substep < substeps; substep += 1) {
      step((frame * substeps + substep + 1) * dt);
    }
  }

  return {
    scene,
    frames,
    diagnostics,
    fingerprint: hasher.digest()
  };
}
