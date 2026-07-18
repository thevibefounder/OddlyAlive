import { createStateHasher } from "./state-hash.js";
import { validateSurfaceWaveScene } from "./wave-scene.js";

export function simulateSurfaceWave(inputScene, options = {}) {
  const scene = validateSurfaceWaveScene(inputScene);
  const { fps, substeps, duration } = scene.timing;
  const dt = 1 / (fps * substeps);
  const frameCount = Math.round(duration * fps) + 1;
  const sampleCount = scene.surface.samples;
  const dx = scene.surface.width / (sampleCount - 1);
  const includeFrames = options.includeFrames !== false;

  const displacement = new Float64Array(sampleCount);
  const velocity = new Float64Array(sampleCount);
  const acceleration = new Float64Array(sampleCount);
  const frames = includeFrames ? new Array(frameCount) : null;
  const hasher = createStateHasher();
  const diagnostics = {
    waveEnergy: new Float32Array(frameCount),
    firstImpactTime: null,
    impactCount: 0,
    maxWaveHeight: 0,
    maxSubmersion: 0,
    maxBodySpeed: 0
  };

  let bodyX = scene.body.x;
  let bodyY = scene.body.y;
  let bodyVX = scene.body.vx;
  let bodyVY = scene.body.vy;
  let bodyAngle = scene.body.angle;
  let bodyAngularVelocity = scene.body.angularVelocity;
  let touchingWater = false;

  function sampleIndexAt(x) {
    const normalized =
      (x - scene.surface.x) / Math.max(1, scene.surface.width);
    return Math.max(
      1,
      Math.min(sampleCount - 2, Math.round(normalized * (sampleCount - 1)))
    );
  }

  function addWaveImpulse(centerIndex, impulse) {
    const radius = Math.max(3, Math.round(sampleCount * 0.035));
    for (
      let index = Math.max(1, centerIndex - radius);
      index <= Math.min(sampleCount - 2, centerIndex + radius);
      index += 1
    ) {
      const distance = (index - centerIndex) / radius;
      const weight = Math.exp(-distance * distance * 3.2);
      velocity[index] += impulse * weight;
    }
  }

  function solveSurface() {
    const waveCoefficient =
      (scene.surface.waveSpeed * scene.surface.waveSpeed) / (dx * dx);
    for (let index = 1; index < sampleCount - 1; index += 1) {
      const laplacian =
        displacement[index - 1] -
        2 * displacement[index] +
        displacement[index + 1];
      acceleration[index] =
        waveCoefficient * laplacian -
        scene.surface.damping * velocity[index];
    }
    for (let index = 1; index < sampleCount - 1; index += 1) {
      velocity[index] += acceleration[index] * dt;
      displacement[index] += velocity[index] * dt;
    }
    displacement[0] = 0;
    displacement[sampleCount - 1] = 0;
    velocity[0] = 0;
    velocity[sampleCount - 1] = 0;
  }

  function solveBody(time) {
    const airDecay = Math.exp(-scene.world.airDrag * dt);
    bodyVY += scene.world.gravity * dt;
    bodyVX *= airDecay;
    bodyVY *= airDecay;
    bodyAngularVelocity *= Math.exp(-scene.world.airDrag * 0.3 * dt);
    bodyX += bodyVX * dt;
    bodyY += bodyVY * dt;
    bodyAngle += bodyAngularVelocity * dt * (180 / Math.PI);

    const centerIndex = sampleIndexAt(bodyX);
    const localSurfaceY =
      scene.surface.restY + displacement[centerIndex];
    const bottom = bodyY + scene.body.height * 0.5;
    const submersion = Math.max(0, bottom - localSurfaceY);
    diagnostics.maxSubmersion = Math.max(
      diagnostics.maxSubmersion,
      submersion
    );

    if (submersion > 0) {
      if (!touchingWater) {
        const impactSpeed = Math.max(0, bodyVY);
        addWaveImpulse(
          centerIndex,
          impactSpeed * scene.surface.coupling
        );
        diagnostics.impactCount += 1;
        if (diagnostics.firstImpactTime === null) {
          diagnostics.firstImpactTime = time;
        }
        bodyVY = -impactSpeed * scene.body.restitution;
        bodyAngularVelocity +=
          (bodyVX / Math.max(1, scene.body.width)) * 0.45;
      }
      touchingWater = true;
      const submergedRatio = Math.min(
        1.5,
        submersion / Math.max(1, scene.body.height)
      );
      bodyVY -= scene.world.buoyancy * submersion * dt;
      const waterDecay = Math.exp(
        -scene.world.waterDrag * submergedRatio * dt
      );
      bodyVX *= waterDecay;
      bodyVY *= waterDecay;
      bodyAngularVelocity *= Math.exp(
        -scene.world.waterDrag * 0.75 * submergedRatio * dt
      );
      bodyAngularVelocity +=
        ((-bodyAngle * Math.PI) / 180) *
        2.4 *
        submergedRatio *
        dt;

      const pressure = Math.max(0, bodyVY) * 0.003 + submersion * 0.012;
      velocity[centerIndex] += pressure;
      if (submersion > scene.body.height * 0.82) {
        bodyY -=
          (submersion - scene.body.height * 0.82) * 0.18;
      }
    } else {
      touchingWater = false;
    }
    diagnostics.maxBodySpeed = Math.max(
      diagnostics.maxBodySpeed,
      Math.sqrt(bodyVX * bodyVX + bodyVY * bodyVY)
    );
  }

  function saveFrame(frameIndex) {
    let energy = 0;
    for (let index = 0; index < sampleCount; index += 1) {
      energy +=
        0.5 * velocity[index] ** 2 +
        0.5 * displacement[index] ** 2;
      diagnostics.maxWaveHeight = Math.max(
        diagnostics.maxWaveHeight,
        Math.abs(displacement[index])
      );
      if (frameIndex % 6 === 0) {
        hasher.add(displacement[index]);
      }
    }
    diagnostics.waveEnergy[frameIndex] = energy;
    if (frameIndex % 6 === 0) {
      hasher.add(bodyX);
      hasher.add(bodyY);
      hasher.add(bodyAngle);
    }
    if (frames) {
      frames[frameIndex] = {
        surface: Float32Array.from(displacement),
        body: {
          x: bodyX,
          y: bodyY,
          angle: bodyAngle
        }
      };
    }
  }

  const preRollSteps = Math.round(scene.timing.preRoll / dt);
  for (let index = 0; index < preRollSteps; index += 1) {
    const time = (index - preRollSteps) * dt;
    solveSurface();
    solveBody(time);
  }
  diagnostics.firstImpactTime = null;
  diagnostics.impactCount = 0;
  diagnostics.maxWaveHeight = 0;
  diagnostics.maxSubmersion = 0;
  diagnostics.maxBodySpeed = 0;

  for (let frame = 0; frame < frameCount; frame += 1) {
    saveFrame(frame);
    if (frame === frameCount - 1) break;
    for (let substep = 0; substep < substeps; substep += 1) {
      const time = (frame * substeps + substep + 1) * dt;
      solveSurface();
      solveBody(time);
    }
  }

  return {
    scene,
    frames,
    diagnostics,
    fingerprint: hasher.digest()
  };
}
