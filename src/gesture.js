export function clamp(value, minimum = 0, maximum = 1) {
  return Math.max(minimum, Math.min(maximum, value));
}

export function smoothStep(value) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

export function sampleGesture(points, time) {
  if (!Array.isArray(points) || points.length < 2) {
    throw new TypeError("A gesture requires at least two time-ordered points.");
  }

  const first = points[0];
  const last = points[points.length - 1];
  if (time <= first.time) return { ...first };
  if (time >= last.time) return { ...last };

  for (let index = 0; index < points.length - 1; index += 1) {
    const a = points[index];
    const b = points[index + 1];
    if (time < a.time || time > b.time) continue;

    const previous = points[Math.max(0, index - 1)];
    const next = points[Math.min(points.length - 1, index + 2)];
    const segmentDuration = b.time - a.time;
    const progress = (time - a.time) / segmentDuration;
    const tangentAX =
      ((b.x - previous.x) / Math.max(0.001, b.time - previous.time)) *
      segmentDuration;
    const tangentAY =
      ((b.y - previous.y) / Math.max(0.001, b.time - previous.time)) *
      segmentDuration;
    const tangentBX =
      ((next.x - a.x) / Math.max(0.001, next.time - a.time)) *
      segmentDuration;
    const tangentBY =
      ((next.y - a.y) / Math.max(0.001, next.time - a.time)) *
      segmentDuration;
    const p2 = progress * progress;
    const p3 = p2 * progress;
    const h00 = 2 * p3 - 3 * p2 + 1;
    const h10 = p3 - 2 * p2 + progress;
    const h01 = -2 * p3 + 3 * p2;
    const h11 = p3 - p2;

    return {
      time,
      x: h00 * a.x + h10 * tangentAX + h01 * b.x + h11 * tangentBX,
      y: h00 * a.y + h10 * tangentAY + h01 * b.y + h11 * tangentBY,
      pressure:
        a.pressure + (b.pressure - a.pressure) * smoothStep(progress)
    };
  }

  return { ...last };
}
