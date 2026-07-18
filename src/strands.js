import { sampleGesture, smoothStep } from "./gesture.js";
import { validateScene } from "./scene.js";

export const ContactState = Object.freeze({
  FREE: 0,
  STICK: 1,
  SLIP: 2,
  COOLDOWN: 3
});

function hash01(value, seed) {
  const wave = Math.sin(value * 12.9898 + seed * 78.233) * 43758.5453123;
  return wave - Math.floor(wave);
}

function createHasher() {
  let hash = 0x811c9dc5;
  return {
    add(value) {
      const rounded = Math.round(value * 1000);
      hash ^= rounded & 0xff;
      hash = Math.imul(hash, 0x01000193);
      hash ^= (rounded >>> 8) & 0xff;
      hash = Math.imul(hash, 0x01000193);
      hash ^= (rounded >>> 16) & 0xff;
      hash = Math.imul(hash, 0x01000193);
    },
    digest() {
      return (hash >>> 0).toString(16).padStart(8, "0");
    }
  };
}

export function simulateStrandField(inputScene, options = {}) {
  const scene = validateScene(inputScene);
  const { columns, rows, originX, originY, spacingX, spacingY } = scene.field;
  const { duration, fps, substeps, preRoll } = scene.timing;
  const count = columns * rows;
  const frameCount = Math.round(duration * fps) + 1;
  const constraintPasses = options.constraintPasses ?? 5;
  const dt = 1 / (fps * substeps);
  const dtSquared = dt * dt;
  const seed = scene.seed;

  const positionsX = new Float64Array(count);
  const positionsY = new Float64Array(count);
  const velocitiesX = new Float64Array(count);
  const velocitiesY = new Float64Array(count);
  const previousX = new Float64Array(count);
  const previousY = new Float64Array(count);
  const baseX = new Float64Array(count);
  const baseY = new Float64Array(count);
  const inverseMass = new Float64Array(count);
  const rotation = new Float64Array(count);
  const rotationVelocity = new Float64Array(count);
  const anchorX = new Float64Array(columns);
  const anchorY = new Float64Array(columns);
  const anchorRest = new Float64Array(columns);
  const linkRest = new Float64Array(count);
  const bendRest = new Float64Array(count);
  const linkLambda = new Float64Array(count);
  const bendLambda = new Float64Array(count);
  const anchorLambda = new Float64Array(columns);

  const lengthCompliance = new Float64Array(columns);
  const compressionCompliance = new Float64Array(columns);
  const bendCompliance = new Float64Array(columns);
  const drag = new Float64Array(columns);
  const staticLimit = new Float64Array(columns);
  const stressBudget = new Float64Array(columns);
  const stickGain = new Float64Array(columns);
  const stickCap = new Float64Array(columns);
  const kineticGain = new Float64Array(columns);
  const kineticCap = new Float64Array(columns);
  const slipBudget = new Float64Array(columns);
  const captureQ = new Float64Array(columns);
  const contactRadiusX = new Float64Array(columns);
  const contactRadiusY = new Float64Array(columns);
  const contactLane = new Float64Array(columns);
  const rotationGain = new Float64Array(columns);

  const contactState = new Uint8Array(columns);
  const contactRow = new Int16Array(columns);
  const contactOffsetX = new Float64Array(columns);
  const contactOffsetY = new Float64Array(columns);
  const contactReaction = new Float64Array(columns);
  const contactStress = new Float64Array(columns);
  const contactSlipTravel = new Float64Array(columns);
  const contactAge = new Float64Array(columns);
  const contactBridge = new Float64Array(columns);
  const candidateRow = new Int16Array(columns);
  const candidateQ = new Float64Array(columns);
  const frames = options.includeFrames === false ? null : new Array(frameCount);
  const diagnostics = {
    sticking: new Uint8Array(frameCount),
    slipping: new Uint8Array(frameCount),
    free: new Uint8Array(frameCount),
    kineticEnergy: new Float32Array(frameCount),
    maxStretch: new Float32Array(frameCount),
    firstGripTime: null,
    lastGripTime: null,
    observedMaxStaticGrip: 0,
    observedMaxCombinedContact: 0,
    observedMaxStretch: 1
  };
  const hasher = createHasher();
  let previousForce = sampleGesture(scene.gesture.points, -2);

  function correlatedNoise(column, salt) {
    const left = hash01((column - 1) * 19.19 + salt, seed);
    const center = hash01(column * 19.19 + salt, seed);
    const right = hash01((column + 1) * 19.19 + salt, seed);
    return left * 0.22 + center * 0.56 + right * 0.22;
  }

  for (let column = 0; column < columns; column += 1) {
    const curve = Math.sin((column / Math.max(1, columns - 1)) * Math.PI) * 2.4;
    anchorX[column] = originX + column * spacingX;
    anchorY[column] = originY - spacingY * 0.68 + curve;
  }

  for (let index = 0; index < count; index += 1) {
    const column = index % columns;
    const row = (index - column) / columns;
    baseX[index] =
      originX +
      column * spacingX +
      (correlatedNoise(column, 17 + row * 0.13) - 0.5) * 0.55;
    baseY[index] = originY + row * spacingY;
    positionsX[index] = baseX[index];
    positionsY[index] = baseY[index];
    const terminal = smoothStep((row - (rows - 5)) / 4);
    inverseMass[index] =
      1 / (1 + terminal * (0.22 + correlatedNoise(column, 181) * 0.24));
  }

  for (let column = 0; column < columns; column += 1) {
    const rough = correlatedNoise(column, 41);
    const soft = correlatedNoise(column, 73);
    const stressNoise = correlatedNoise(column, 211);
    const edgeRelease = smoothStep((column - (columns - 5)) / 4);
    lengthCompliance[column] =
      scene.material.lengthCompliance * (1 + soft * 0.72);
    compressionCompliance[column] =
      scene.material.compressionCompliance * (1 + soft * 0.46);
    bendCompliance[column] =
      scene.material.bendCompliance *
      (1 + soft * 0.42) *
      (1 - edgeRelease * 0.55);
    drag[column] =
      scene.material.linearDrag * (0.92 + rough * 0.16);
    staticLimit[column] = (4.6 + rough * 2.1) * (1 - edgeRelease * 0.28);
    stressBudget[column] =
      (0.13 + stressNoise * 0.11) * (1 - edgeRelease * 0.5);
    stickGain[column] = (0.33 + soft * 0.105) * (1 - edgeRelease * 0.1);
    stickCap[column] = (1.92 + soft * 0.64) * (1 - edgeRelease * 0.18);
    kineticGain[column] = 0.13 + rough * 0.11;
    kineticCap[column] = 0.38 + rough * 0.25;
    slipBudget[column] = (10 + rough * 8) * (1 - edgeRelease * 0.35);
    captureQ[column] = (0.91 + rough * 0.055) * (1 - edgeRelease * 0.38);
    contactRadiusX[column] = scene.contact.radiusX + soft * 6;
    contactRadiusY[column] = scene.contact.radiusY + rough * 6;
    contactLane[column] = (correlatedNoise(column, 109) - 0.5) * 28;
    rotationGain[column] = 0.11 + soft * 0.05;
    const dx = baseX[column] - anchorX[column];
    const dy = baseY[column] - anchorY[column];
    anchorRest[column] =
      Math.sqrt(dx * dx + dy * dy) * (1.004 + rough * 0.004);
  }

  for (let index = 0; index < count; index += 1) {
    const column = index % columns;
    const row = (index - column) / columns;
    if (row > 0) {
      const above = index - columns;
      const dx = baseX[index] - baseX[above];
      const dy = baseY[index] - baseY[above];
      const lowerSlack = smoothStep((row - rows * 0.5) / (rows * 0.5));
      const edgeSlack = smoothStep((column - (columns - 5)) / 4);
      const slack =
        1.026 +
        lowerSlack * 0.022 +
        (correlatedNoise(column, 127) - 0.5) * 0.006 -
        edgeSlack * (0.008 + lowerSlack * 0.012);
      linkRest[index] = Math.sqrt(dx * dx + dy * dy) * slack;
    }
    if (row > 1) {
      const twoAbove = index - columns * 2;
      const dx = baseX[index] - baseX[twoAbove];
      const dy = baseY[index] - baseY[twoAbove];
      bendRest[index] = Math.sqrt(dx * dx + dy * dy) * 1.018;
    }
  }

  function solvePair(
    a,
    b,
    restDistance,
    extensionCompliance,
    compressedCompliance,
    lambdaStore,
    lambdaIndex,
    maxRatio
  ) {
    let dx = positionsX[b] - positionsX[a];
    let dy = positionsY[b] - positionsY[a];
    let distance = Math.sqrt(dx * dx + dy * dy) || 0.0001;
    const constraint = distance - restDistance;
    const compliance =
      constraint >= 0 ? extensionCompliance : compressedCompliance;
    const alpha = compliance / dtSquared;
    const weightA = inverseMass[a];
    const weightB = inverseMass[b];
    const deltaLambda =
      (-constraint - alpha * lambdaStore[lambdaIndex]) /
      (weightA + weightB + alpha);
    lambdaStore[lambdaIndex] += deltaLambda;
    const nx = dx / distance;
    const ny = dy / distance;
    positionsX[a] -= nx * weightA * deltaLambda;
    positionsY[a] -= ny * weightA * deltaLambda;
    positionsX[b] += nx * weightB * deltaLambda;
    positionsY[b] += ny * weightB * deltaLambda;

    const capped = restDistance * maxRatio;
    dx = positionsX[b] - positionsX[a];
    dy = positionsY[b] - positionsY[a];
    distance = Math.sqrt(dx * dx + dy * dy) || 0.0001;
    if (distance <= capped) return;
    const excess = distance - capped;
    const totalWeight = weightA + weightB;
    positionsX[a] += (dx / distance) * excess * (weightA / totalWeight);
    positionsY[a] += (dy / distance) * excess * (weightA / totalWeight);
    positionsX[b] -= (dx / distance) * excess * (weightB / totalWeight);
    positionsY[b] -= (dy / distance) * excess * (weightB / totalWeight);
  }

  function solveAnchor(column) {
    let dx = positionsX[column] - anchorX[column];
    let dy = positionsY[column] - anchorY[column];
    let distance = Math.sqrt(dx * dx + dy * dy) || 0.0001;
    const restDistance = anchorRest[column];
    const constraint = distance - restDistance;
    const compliance = constraint >= 0 ? 0.0000007 : 0.00018;
    const alpha = compliance / dtSquared;
    const weight = inverseMass[column];
    const deltaLambda =
      (-constraint - alpha * anchorLambda[column]) / (weight + alpha);
    anchorLambda[column] += deltaLambda;
    positionsX[column] += (dx / distance) * weight * deltaLambda;
    positionsY[column] += (dy / distance) * weight * deltaLambda;

    dx = positionsX[column] - anchorX[column];
    dy = positionsY[column] - anchorY[column];
    distance = Math.sqrt(dx * dx + dy * dy) || 0.0001;
    const capped = restDistance * 1.035;
    if (distance > capped) {
      positionsX[column] -= (dx / distance) * (distance - capped);
      positionsY[column] -= (dy / distance) * (distance - capped);
    }
  }

  function enforceHardLink(a, b, restDistance, maxRatio) {
    const dx = positionsX[b] - positionsX[a];
    const dy = positionsY[b] - positionsY[a];
    const distance = Math.sqrt(dx * dx + dy * dy) || 0.0001;
    const capped = restDistance * maxRatio;
    if (distance <= capped) return;
    const weightA = inverseMass[a];
    const weightB = inverseMass[b];
    const totalWeight = weightA + weightB;
    const excess = distance - capped;
    positionsX[a] += (dx / distance) * excess * (weightA / totalWeight);
    positionsY[a] += (dy / distance) * excess * (weightA / totalWeight);
    positionsX[b] -= (dx / distance) * excess * (weightB / totalWeight);
    positionsY[b] -= (dy / distance) * excess * (weightB / totalWeight);
  }

  function enforceHardAnchor(column) {
    const dx = positionsX[column] - anchorX[column];
    const dy = positionsY[column] - anchorY[column];
    const distance = Math.sqrt(dx * dx + dy * dy) || 0.0001;
    const capped = anchorRest[column] * 1.035;
    if (distance > capped) {
      positionsX[column] -= (dx / distance) * (distance - capped);
      positionsY[column] -= (dy / distance) * (distance - capped);
    }
  }

  function findContactCandidates(force) {
    const start = Math.min(rows - 1, scene.contact.captureStartRow);
    const end = Math.min(rows - 1, scene.contact.captureEndRow);
    for (let column = 0; column < columns; column += 1) {
      let bestQ = Number.POSITIVE_INFINITY;
      let bestRow = start;
      for (let row = start; row <= end; row += 1) {
        const index = row * columns + column;
        const nx = (positionsX[index] - force.x) / contactRadiusX[column];
        const ny = (positionsY[index] - force.y) / contactRadiusY[column];
        const q = Math.sqrt(nx * nx + ny * ny);
        if (q < bestQ) {
          bestQ = q;
          bestRow = row;
        }
      }
      candidateRow[column] = bestRow;
      candidateQ[column] = bestQ;
    }
  }

  function releaseToSlip(column) {
    contactState[column] = ContactState.SLIP;
    contactSlipTravel[column] = 0;
    contactReaction[column] = 0;
    contactStress[column] = 0;
    contactBridge[column] = 1;
  }

  function updateContacts(force, handDeltaX, handDeltaY, handSpeed) {
    findContactCandidates(force);
    let stickingCount = 0;
    for (let column = 0; column < columns; column += 1) {
      if (contactState[column] === ContactState.STICK) stickingCount += 1;
    }

    for (let column = 0; column < columns; column += 1) {
      let state = contactState[column];
      const row =
        state === ContactState.STICK || state === ContactState.SLIP
          ? contactRow[column]
          : candidateRow[column];
      const index = row * columns + column;
      const radiusX = contactRadiusX[column];
      const radiusY = contactRadiusY[column];
      let dx = positionsX[index] - force.x;
      let dy = positionsY[index] - force.y;
      let q = Math.sqrt((dx / radiusX) ** 2 + (dy / radiusY) ** 2);

      if (state === ContactState.COOLDOWN && q > 1.25) {
        contactState[column] = ContactState.FREE;
        state = ContactState.FREE;
      }

      if (
        state === ContactState.FREE &&
        force.pressure > 0.2 &&
        handSpeed > 18 &&
        stickingCount < scene.contact.maxStaticGrip
      ) {
        const approach = dx * handDeltaX + dy * handDeltaY;
        if (candidateQ[column] < captureQ[column] && approach > 0) {
          contactState[column] = ContactState.STICK;
          contactRow[column] = candidateRow[column];
          const held = contactRow[column] * columns + column;
          dx = positionsX[held] - force.x;
          dy = positionsY[held] - force.y;
          contactOffsetX[column] = dx;
          contactOffsetY[column] = Math.max(
            -radiusY * 0.72,
            Math.min(radiusY * 0.72, dy + contactLane[column] * 0.55)
          );
          contactReaction[column] = 0;
          contactStress[column] = 0;
          contactSlipTravel[column] = 0;
          contactAge[column] = 0;
          contactBridge[column] = 0;
          stickingCount += 1;
          state = ContactState.STICK;
        }
      }

      if (state === ContactState.STICK) {
        if (force.pressure < 0.035 || q > 1.05) {
          releaseToSlip(column);
          continue;
        }
        contactAge[column] += dt;
        const desiredX = force.x + contactOffsetX[column];
        const desiredY = force.y + contactOffsetY[column];
        const errorX = desiredX - positionsX[index];
        const errorY = desiredY - positionsY[index];
        const errorLength = Math.sqrt(errorX * errorX + errorY * errorY) || 0.0001;
        const pressureGain = 0.22 + force.pressure * 0.78;
        const maxCorrection = stickCap[column] * pressureGain;
        const correctionScale = Math.min(
          stickGain[column] * pressureGain,
          maxCorrection / errorLength
        );
        positionsX[index] += errorX * correctionScale;
        positionsY[index] += errorY * correctionScale;
      } else if (state === ContactState.SLIP) {
        const bridge = contactBridge[column];
        if (bridge > 0.01) {
          const errorX = force.x + contactOffsetX[column] - positionsX[index];
          const errorY = force.y + contactOffsetY[column] - positionsY[index];
          const errorLength = Math.sqrt(errorX * errorX + errorY * errorY) || 0.0001;
          const bridgeGain = Math.min(
            0.16 * bridge * (0.3 + force.pressure * 0.7),
            0.62 / errorLength
          );
          positionsX[index] += errorX * bridgeGain;
          positionsY[index] += errorY * bridgeGain;
          contactBridge[column] *= Math.exp(-dt / 0.075);
        } else {
          contactBridge[column] = 0;
        }

        const particleDeltaX = velocitiesX[index] * dt;
        const particleDeltaY = velocitiesY[index] * dt;
        const relativeX = handDeltaX - particleDeltaX;
        const relativeY = handDeltaY - particleDeltaY;
        const relativeLength =
          Math.sqrt(relativeX * relativeX + relativeY * relativeY) || 0.0001;
        const contactPressure =
          smoothStep((1.14 - q) / 0.24) * force.pressure;
        const frictionStep =
          Math.min(
            relativeLength * kineticGain[column],
            kineticCap[column]
          ) * contactPressure;
        positionsX[index] += (relativeX / relativeLength) * frictionStep;
        positionsY[index] += (relativeY / relativeLength) * frictionStep;
        contactSlipTravel[column] += Math.max(
          0,
          relativeLength - frictionStep
        );
        if (
          q > 1.16 ||
          contactSlipTravel[column] > slipBudget[column] ||
          force.pressure < 0.02
        ) {
          contactState[column] = ContactState.COOLDOWN;
          contactBridge[column] = 0;
        }
      }

      state = contactState[column];
      dx = positionsX[index] - force.x;
      dy = positionsY[index] - force.y;
      q = Math.sqrt((dx / radiusX) ** 2 + (dy / radiusY) ** 2);
      if (state !== ContactState.STICK && q < 1 && force.pressure > 0.02) {
        const normalizedLength = Math.max(q, 0.001);
        const nx = (dx / radiusX) / normalizedLength;
        const ny = (dy / radiusY) / normalizedLength;
        const surfaceX = force.x + nx * radiusX;
        const surfaceY = force.y + ny * radiusY;
        const pushX = surfaceX - positionsX[index];
        const pushY = surfaceY - positionsY[index];
        const pushLength = Math.sqrt(pushX * pushX + pushY * pushY) || 0.0001;
        const pushScale = Math.min(
          0.38 * force.pressure,
          (2.2 * force.pressure) / pushLength
        );
        positionsX[index] += pushX * pushScale;
        positionsY[index] += pushY * pushScale;
      }
    }
  }

  function separateHeldStrands() {
    for (let aColumn = 0; aColumn < columns - 1; aColumn += 1) {
      if (contactState[aColumn] !== ContactState.STICK) continue;
      const aIndex = contactRow[aColumn] * columns + aColumn;
      for (let bColumn = aColumn + 1; bColumn < columns; bColumn += 1) {
        if (contactState[bColumn] !== ContactState.STICK) continue;
        const bIndex = contactRow[bColumn] * columns + bColumn;
        let dx = positionsX[bIndex] - positionsX[aIndex];
        let dy = positionsY[bIndex] - positionsY[aIndex];
        let distance = Math.sqrt(dx * dx + dy * dy);
        const minimum =
          4.4 + correlatedNoise(aColumn + bColumn, 149) * 1.4;
        if (distance >= minimum) continue;
        if (distance < 0.001) {
          dx = 0;
          dy = hash01(aColumn * 31 + bColumn * 17, seed) < 0.5 ? -1 : 1;
          distance = 1;
        }
        const correction = (minimum - distance) * 0.28;
        positionsX[aIndex] -= (dx / distance) * correction;
        positionsY[aIndex] -= (dy / distance) * correction;
        positionsX[bIndex] += (dx / distance) * correction;
        positionsY[bIndex] += (dy / distance) * correction;
      }
    }
  }

  function measureContactReaction(force) {
    for (let column = 0; column < columns; column += 1) {
      if (contactState[column] !== ContactState.STICK) continue;
      const index = contactRow[column] * columns + column;
      const reactionX =
        positionsX[index] - (force.x + contactOffsetX[column]);
      const reactionY =
        positionsY[index] - (force.y + contactOffsetY[column]);
      const rawReaction = Math.sqrt(
        reactionX * reactionX + reactionY * reactionY
      );
      contactReaction[column] =
        contactReaction[column] * 0.64 + rawReaction * 0.36;
      const frictionLimit =
        staticLimit[column] * (0.22 + force.pressure * 0.78);
      const loadRatio =
        contactReaction[column] / Math.max(0.35, frictionLimit);
      if (loadRatio > 0.32) {
        contactStress[column] += (loadRatio - 0.32) * dt;
      } else {
        contactStress[column] = Math.max(
          0,
          contactStress[column] - 0.24 * dt
        );
      }
      if (
        contactAge[column] > 0.075 &&
        (loadRatio > 1.13 ||
          contactStress[column] > stressBudget[column])
      ) {
        releaseToSlip(column);
      }
    }
  }

  function stepSubstep(time) {
    const force = sampleGesture(scene.gesture.points, time);
    const forceDeltaX = force.x - previousForce.x;
    const forceDeltaY = force.y - previousForce.y;
    const handSpeed =
      Math.sqrt(forceDeltaX * forceDeltaX + forceDeltaY * forceDeltaY) / dt;

    for (let index = 0; index < count; index += 1) {
      const column = index % columns;
      previousX[index] = positionsX[index];
      previousY[index] = positionsY[index];
      velocitiesY[index] += scene.material.gravity * dt;
      const speed = Math.sqrt(
        velocitiesX[index] ** 2 + velocitiesY[index] ** 2
      );
      const damping =
        Math.exp(-drag[column] * dt) /
        (1 + scene.material.quadraticDrag * speed * dt);
      velocitiesX[index] *= damping;
      velocitiesY[index] *= damping;
      positionsX[index] += velocitiesX[index] * dt;
      positionsY[index] += velocitiesY[index] * dt;
    }

    updateContacts(force, forceDeltaX, forceDeltaY, handSpeed);
    linkLambda.fill(0);
    bendLambda.fill(0);
    anchorLambda.fill(0);

    for (let pass = 0; pass < constraintPasses; pass += 1) {
      for (let column = 0; column < columns; column += 1) {
        solveAnchor(column);
      }
      for (let column = 0; column < columns; column += 1) {
        for (let row = 1; row < rows; row += 1) {
          const index = row * columns + column;
          solvePair(
            index - columns,
            index,
            linkRest[index],
            lengthCompliance[column],
            compressionCompliance[column],
            linkLambda,
            index,
            scene.material.maxStretch
          );
        }
      }
      for (let column = 0; column < columns; column += 1) {
        for (let row = 2; row < rows; row += 1) {
          const index = row * columns + column;
          solvePair(
            index - columns * 2,
            index,
            bendRest[index],
            bendCompliance[column],
            bendCompliance[column] * 1.7,
            bendLambda,
            index,
            1.18
          );
        }
      }
    }

    separateHeldStrands();
    for (let safetyPass = 0; safetyPass < 2; safetyPass += 1) {
      for (let column = 0; column < columns; column += 1) {
        enforceHardAnchor(column);
        for (let row = 1; row < rows; row += 1) {
          const index = row * columns + column;
          enforceHardLink(
            index - columns,
            index,
            linkRest[index],
            scene.material.maxStretch
          );
        }
      }
    }
    measureContactReaction(force);

    for (let index = 0; index < count; index += 1) {
      velocitiesX[index] = (positionsX[index] - previousX[index]) / dt;
      velocitiesY[index] = (positionsY[index] - previousY[index]) / dt;
      const speed = Math.sqrt(
        velocitiesX[index] ** 2 + velocitiesY[index] ** 2
      );
      if (speed > 0.01) {
        const cappedSpeed = 820 * Math.tanh(speed / 820);
        velocitiesX[index] *= cappedSpeed / speed;
        velocitiesY[index] *= cappedSpeed / speed;
      }
    }

    const axialAmount = 1 - Math.exp(-5.2 * dt);
    for (let column = 0; column < columns; column += 1) {
      for (let row = 1; row < rows; row += 1) {
        const b = row * columns + column;
        const a = b - columns;
        const dx = positionsX[b] - positionsX[a];
        const dy = positionsY[b] - positionsY[a];
        const distance = Math.sqrt(dx * dx + dy * dy) || 0.0001;
        if (distance < linkRest[b] * 0.992) continue;
        const nx = dx / distance;
        const ny = dy / distance;
        const relative =
          (velocitiesX[b] - velocitiesX[a]) * nx +
          (velocitiesY[b] - velocitiesY[a]) * ny;
        const impulse = relative * axialAmount * 0.5;
        velocitiesX[a] += nx * impulse;
        velocitiesY[a] += ny * impulse;
        velocitiesX[b] -= nx * impulse;
        velocitiesY[b] -= ny * impulse;
      }
    }
    previousForce = force;
  }

  function saveState(frame) {
    const state = frames
      ? {
          x: new Float32Array(count),
          y: new Float32Array(count),
          rotation: new Float32Array(count)
        }
      : null;

    for (let index = 0; index < count; index += 1) {
      if (state) {
        state.x[index] = positionsX[index] - baseX[index];
        state.y[index] = positionsY[index] - baseY[index];
      }
      if (frame % 6 === 0) {
        hasher.add(positionsX[index]);
        hasher.add(positionsY[index]);
      }
    }

    for (let column = 0; column < columns; column += 1) {
      for (let row = 0; row < rows; row += 1) {
        const index = row * columns + column;
        const before = Math.max(0, row - 1) * columns + column;
        const after = Math.min(rows - 1, row + 1) * columns + column;
        const tangentX = positionsX[after] - positionsX[before];
        const tangentY = positionsY[after] - positionsY[before] || 0.0001;
        const target = (Math.atan2(tangentX, tangentY) * 180) / Math.PI;
        let delta = target - rotation[index];
        if (delta > 180) delta -= 360;
        else if (delta < -180) delta += 360;
        delta = Math.max(-22, Math.min(22, delta));
        rotationVelocity[index] =
          rotationVelocity[index] * 0.86 + delta * rotationGain[column];
        rotation[index] += rotationVelocity[index];
        if (state) {
          state.rotation[index] = 78 * Math.tanh(rotation[index] / 78);
        }
      }
    }

    let sticking = 0;
    let slipping = 0;
    let kineticEnergy = 0;
    let maxStretch = 1;
    for (let column = 0; column < columns; column += 1) {
      if (contactState[column] === ContactState.STICK) sticking += 1;
      else if (contactState[column] === ContactState.SLIP) slipping += 1;
      for (let row = 1; row < rows; row += 1) {
        const index = row * columns + column;
        const above = index - columns;
        const dx = positionsX[index] - positionsX[above];
        const dy = positionsY[index] - positionsY[above];
        maxStretch = Math.max(
          maxStretch,
          Math.sqrt(dx * dx + dy * dy) / linkRest[index]
        );
      }
    }
    for (let index = 0; index < count; index += 1) {
      kineticEnergy +=
        (0.5 / inverseMass[index]) *
        (velocitiesX[index] ** 2 + velocitiesY[index] ** 2);
    }

    diagnostics.sticking[frame] = sticking;
    diagnostics.slipping[frame] = slipping;
    diagnostics.free[frame] = columns - sticking - slipping;
    diagnostics.kineticEnergy[frame] = kineticEnergy;
    diagnostics.maxStretch[frame] = maxStretch;
    diagnostics.observedMaxStaticGrip = Math.max(
      diagnostics.observedMaxStaticGrip,
      sticking
    );
    diagnostics.observedMaxCombinedContact = Math.max(
      diagnostics.observedMaxCombinedContact,
      sticking + slipping
    );
    diagnostics.observedMaxStretch = Math.max(
      diagnostics.observedMaxStretch,
      maxStretch
    );
    if (sticking > 0) {
      const time = frame / fps;
      if (diagnostics.firstGripTime === null) {
        diagnostics.firstGripTime = time;
      }
      diagnostics.lastGripTime = time;
    }
    if (frames) frames[frame] = state;
  }

  const preSteps = Math.round(preRoll * fps * substeps);
  for (let preStep = preSteps; preStep > 0; preStep -= 1) {
    stepSubstep(-preStep / (fps * substeps));
  }

  for (let index = 0; index < count; index += 1) {
    const column = index % columns;
    const row = (index - column) / columns;
    const before = Math.max(0, row - 1) * columns + column;
    const after = Math.min(rows - 1, row + 1) * columns + column;
    const tangentX = positionsX[after] - positionsX[before];
    const tangentY = positionsY[after] - positionsY[before] || 0.0001;
    rotation[index] = (Math.atan2(tangentX, tangentY) * 180) / Math.PI;
  }

  for (let frame = 0; frame < frameCount; frame += 1) {
    saveState(frame);
    if (frame === frameCount - 1) break;
    for (let substep = 0; substep < substeps; substep += 1) {
      stepSubstep((frame * substeps + substep + 1) / (fps * substeps));
    }
  }

  return {
    scene,
    frames,
    base: {
      x: Float32Array.from(baseX),
      y: Float32Array.from(baseY),
      anchorX: Float32Array.from(anchorX),
      anchorY: Float32Array.from(anchorY)
    },
    diagnostics,
    fingerprint: hasher.digest()
  };
}
