const SVG_NS = "http://www.w3.org/2000/svg";

function svgNode(name, attributes = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attributes)) {
    node.setAttribute(key, String(value));
  }
  return node;
}

function pathThrough(points) {
  if (points.length === 0) return "";
  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let index = 1; index < points.length - 1; index += 1) {
    const point = points[index];
    const next = points[index + 1];
    path += ` Q ${point.x.toFixed(2)} ${point.y.toFixed(2)} ${((point.x + next.x) * 0.5).toFixed(2)} ${((point.y + next.y) * 0.5).toFixed(2)}`;
  }
  const last = points[points.length - 1];
  path += ` T ${last.x.toFixed(2)} ${last.y.toFixed(2)}`;
  return path;
}

function createCrystal(column, size, palette) {
  const color = palette[column % palette.length];
  const group = svgNode("g", { class: "oa-crystal" });
  group.append(
    svgNode("polygon", {
      points: `0,${-size} ${size * 0.72},${-size * 0.2} ${size * 0.45},${size * 0.72} 0,${size} ${-size * 0.45},${size * 0.72} ${-size * 0.72},${-size * 0.2}`,
      fill: color,
      stroke: "#292720",
      "stroke-width": "1.2"
    }),
    svgNode("polygon", {
      points: `0,${-size} ${size * 0.2},${-size * 0.14} 0,${size} ${-size * 0.45},${size * 0.72}`,
      fill: "rgba(255,255,255,0.34)"
    }),
    svgNode("path", {
      d: `M ${-size * 0.72} ${-size * 0.2} L ${size * 0.72} ${-size * 0.2} M 0 ${-size} L 0 ${size}`,
      stroke: "rgba(41,39,32,0.32)",
      "stroke-width": "0.8",
      fill: "none"
    })
  );
  return group;
}

export function createCrystalRenderer(svg, simulation, options = {}) {
  const { scene, base, frames } = simulation;
  if (!frames) {
    throw new TypeError("The crystal renderer requires simulation frames.");
  }
  const { columns, rows } = scene.field;
  const palette =
    options.palette ?? ["#83c5be", "#ffddd2", "#e29578", "#b8c0ff", "#ffd166"];
  const root = svgNode("g", { class: "oa-crystal-scene" });
  const rail = svgNode("path", {
    d: `M ${base.anchorX[0] - 25} ${base.anchorY[0] - 9} Q ${scene.canvas.width / 2} ${base.anchorY[0] - 22} ${base.anchorX[columns - 1] + 25} ${base.anchorY[columns - 1] - 9}`,
    fill: "none",
    stroke: "#2a2822",
    "stroke-width": "7",
    "stroke-linecap": "round"
  });
  const cords = svgNode("g", {
    fill: "none",
    stroke: "rgba(42,40,34,0.45)",
    "stroke-width": "1.1",
    "stroke-linecap": "round"
  });
  const payloads = svgNode("g");
  const hardware = svgNode("g");
  root.append(rail, cords, payloads, hardware);
  svg.appendChild(root);

  const cordNodes = [];
  const crystalNodes = [];
  const beadNodes = [];
  for (let column = 0; column < columns; column += 1) {
    const path = svgNode("path");
    cords.appendChild(path);
    cordNodes.push(path);
    hardware.appendChild(
      svgNode("circle", {
        cx: base.anchorX[column],
        cy: base.anchorY[column] - 1,
        r: 2.4,
        fill: "#f4eedc",
        stroke: "#2a2822",
        "stroke-width": "1.2"
      })
    );
    const crystal = createCrystal(
      column,
      11 + (column % 4) * 1.8,
      palette
    );
    payloads.appendChild(crystal);
    crystalNodes.push(crystal);
    const beads = [];
    for (const row of [3, 7, 10]) {
      if (row >= rows - 1) continue;
      const bead = svgNode("circle", {
        r: row === 7 ? 3.2 : 2.3,
        fill: palette[(column + row) % palette.length],
        stroke: "#2a2822",
        "stroke-width": "0.8"
      });
      payloads.appendChild(bead);
      beads.push({ row, node: bead });
    }
    beadNodes.push(beads);
  }

  function renderFrame(frameIndex) {
    const frame = frames[Math.max(0, Math.min(frames.length - 1, frameIndex))];
    for (let column = 0; column < columns; column += 1) {
      const points = [
        { x: base.anchorX[column], y: base.anchorY[column] }
      ];
      for (let row = 0; row < rows; row += 1) {
        const index = row * columns + column;
        points.push({
          x: base.x[index] + frame.x[index],
          y: base.y[index] + frame.y[index]
        });
      }
      cordNodes[column].setAttribute("d", pathThrough(points));
      const terminalIndex = (rows - 1) * columns + column;
      crystalNodes[column].setAttribute(
        "transform",
        `translate(${(base.x[terminalIndex] + frame.x[terminalIndex]).toFixed(2)} ${(base.y[terminalIndex] + frame.y[terminalIndex]).toFixed(2)}) rotate(${frame.rotation[terminalIndex].toFixed(2)})`
      );
      for (const bead of beadNodes[column]) {
        const index = bead.row * columns + column;
        bead.node.setAttribute(
          "transform",
          `translate(${(base.x[index] + frame.x[index]).toFixed(2)} ${(base.y[index] + frame.y[index]).toFixed(2)})`
        );
      }
    }
  }
  return { renderFrame };
}
