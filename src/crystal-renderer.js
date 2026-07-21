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

function addGradient(defs, id, stops, attributes = {}) {
  const gradient = svgNode("linearGradient", {
    id,
    x1: "0%",
    y1: "0%",
    x2: "100%",
    y2: "100%",
    ...attributes
  });
  for (const stop of stops) {
    gradient.appendChild(svgNode("stop", stop));
  }
  defs.appendChild(gradient);
}

function createCrystal(column, size, color, gradientId, photoHref) {
  const group = svgNode("g", { class: "oa-crystal" });
  if (photoHref) {
    const width = size * 2.7;
    const height = width * 1.5;
    group.appendChild(
      svgNode("image", {
        href: photoHref,
        x: (-width * 0.5).toFixed(2),
        y: "-4",
        width: width.toFixed(2),
        height: height.toFixed(2),
        preserveAspectRatio: "xMidYMin meet",
        decoding: "sync",
        style: `filter:hue-rotate(${(column % 5) * 7 - 12}deg) saturate(${0.88 + (column % 3) * 0.09}) drop-shadow(2px 5px 3px rgba(34,26,14,0.25))`
      })
    );
    return group;
  }
  const outline = `0,${-size} ${size * 0.72},${-size * 0.25} ${size * 0.5},${size * 0.66} 0,${size} ${-size * 0.5},${size * 0.66} ${-size * 0.72},${-size * 0.25}`;

  group.append(
    svgNode("ellipse", {
      cx: 2.5,
      cy: size + 5,
      rx: size * 0.56,
      ry: size * 0.18,
      fill: "rgba(30,27,22,0.2)",
      filter: "url(#oa-crystal-shadow)"
    }),
    svgNode("ellipse", {
      cx: 0,
      cy: -size - 4.5,
      rx: size * 0.22,
      ry: size * 0.11,
      fill: "none",
      stroke: "url(#oa-brass)",
      "stroke-width": "2.1"
    }),
    svgNode("rect", {
      x: -size * 0.23,
      y: -size - 2.8,
      width: size * 0.46,
      height: size * 0.22,
      rx: size * 0.08,
      fill: "url(#oa-brass)",
      stroke: "#5a431d",
      "stroke-width": "0.6"
    }),
    svgNode("polygon", {
      points: outline,
      fill: `url(#${gradientId})`,
      stroke: "#292720",
      "stroke-width": "1.35",
      "stroke-linejoin": "round"
    }),
    svgNode("polygon", {
      points: `0,${-size} ${size * 0.17},${-size * 0.22} 0,${size} ${-size * 0.5},${size * 0.66} ${-size * 0.72},${-size * 0.25}`,
      fill: "rgba(255,255,255,0.38)"
    }),
    svgNode("polygon", {
      points: `0,${-size} ${size * 0.72},${-size * 0.25} ${size * 0.5},${size * 0.66} 0,${size} ${size * 0.17},${-size * 0.22}`,
      fill: "rgba(29,36,41,0.13)"
    }),
    svgNode("polygon", {
      points: `${-size * 0.72},${-size * 0.25} 0,${-size * 0.1} ${size * 0.72},${-size * 0.25} ${size * 0.5},${size * 0.66} 0,${size * 0.42} ${-size * 0.5},${size * 0.66}`,
      fill: color,
      opacity: "0.2"
    }),
    svgNode("path", {
      d: `M ${-size * 0.72} ${-size * 0.25} L 0 ${-size * 0.1} L ${size * 0.72} ${-size * 0.25} M 0 ${-size} L 0 ${size} M ${-size * 0.5} ${size * 0.66} L 0 ${size * 0.42} L ${size * 0.5} ${size * 0.66}`,
      stroke: "rgba(38,35,29,0.34)",
      "stroke-width": "0.72",
      fill: "none"
    }),
    svgNode("path", {
      d: `M ${-size * 0.38} ${-size * 0.18} L ${-size * 0.04} ${-size * 0.52} M ${size * 0.08} ${size * 0.38} L ${size * 0.32} ${size * 0.12}`,
      stroke: "rgba(255,255,255,0.86)",
      "stroke-width": "1.1",
      "stroke-linecap": "round"
    }),
    svgNode("circle", {
      cx: -size * 0.25,
      cy: -size * 0.34,
      r: Math.max(0.8, size * 0.055),
      fill: "rgba(255,255,255,0.95)"
    })
  );
  return group;
}

function createBead(color, radius) {
  const group = svgNode("g", { class: "oa-glass-bead" });
  group.append(
    svgNode("circle", {
      r: radius + 0.8,
      fill: "rgba(42,40,34,0.2)"
    }),
    svgNode("circle", {
      r: radius,
      fill: color,
      stroke: "#3b382f",
      "stroke-width": "0.75"
    }),
    svgNode("circle", {
      cx: -radius * 0.34,
      cy: -radius * 0.38,
      r: Math.max(0.7, radius * 0.3),
      fill: "rgba(255,255,255,0.72)"
    }),
    svgNode("circle", {
      r: Math.max(0.45, radius * 0.17),
      fill: "#554d3d"
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
    options.palette ?? ["#74b9b5", "#efc8c0", "#d98567", "#929ee5", "#e9b73e"];
  const root = svgNode("g", { class: "oa-crystal-scene" });
  const defs = svgNode("defs");

  addGradient(defs, "oa-brass", [
    { offset: "0%", "stop-color": "#6d4d18" },
    { offset: "28%", "stop-color": "#e4bd62" },
    { offset: "54%", "stop-color": "#fff0a5" },
    { offset: "76%", "stop-color": "#a97625" },
    { offset: "100%", "stop-color": "#4e3512" }
  ]);
  for (let column = 0; column < columns; column += 1) {
    addGradient(defs, `oa-glass-${column}`, [
      { offset: "0%", "stop-color": "#ffffff", "stop-opacity": "0.78" },
      { offset: "24%", "stop-color": palette[column % palette.length], "stop-opacity": "0.55" },
      { offset: "70%", "stop-color": palette[(column + 2) % palette.length], "stop-opacity": "0.9" },
      { offset: "100%", "stop-color": "#354450", "stop-opacity": "0.36" }
    ]);
  }
  const shadow = svgNode("filter", {
    id: "oa-crystal-shadow",
    x: "-50%",
    y: "-50%",
    width: "220%",
    height: "240%"
  });
  shadow.appendChild(svgNode("feGaussianBlur", { stdDeviation: "2.4" }));
  defs.appendChild(shadow);
  root.appendChild(defs);

  const railPath = `M ${base.anchorX[0] - 28} ${base.anchorY[0] - 9} Q ${scene.canvas.width / 2} ${base.anchorY[0] - 23} ${base.anchorX[columns - 1] + 28} ${base.anchorY[columns - 1] - 9}`;
  const railGroup = svgNode("g", { class: "oa-crystal-rail" });
  railGroup.append(
    svgNode("path", {
      d: railPath,
      fill: "none",
      stroke: "rgba(38,30,17,0.22)",
      "stroke-width": "12",
      "stroke-linecap": "round",
      transform: "translate(0 4)",
      filter: "url(#oa-crystal-shadow)"
    }),
    svgNode("path", {
      d: railPath,
      fill: "none",
      stroke: "url(#oa-brass)",
      "stroke-width": "9",
      "stroke-linecap": "round"
    }),
    svgNode("path", {
      d: railPath,
      fill: "none",
      stroke: "rgba(255,246,191,0.72)",
      "stroke-width": "1.6",
      "stroke-linecap": "round",
      transform: "translate(0 -1.6)"
    })
  );

  const cords = svgNode("g", {
    class: "oa-crystal-cords",
    fill: "none",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  });
  const payloads = svgNode("g", {
    class: "oa-crystal-payloads"
  });
  const hardware = svgNode("g", { class: "oa-crystal-hardware" });
  root.append(railGroup, cords, payloads, hardware);
  svg.appendChild(root);

  const cordNodes = [];
  const crystalNodes = [];
  const beadNodes = [];

  for (let column = 0; column < columns; column += 1) {
    const under = svgNode("path", {
      stroke: "rgba(42,36,25,0.62)",
      "stroke-width": "1.45"
    });
    const shine = svgNode("path", {
      stroke: "rgba(255,250,225,0.52)",
      "stroke-width": "0.48",
      transform: "translate(-0.45 0)"
    });
    cords.append(under, shine);
    cordNodes.push({ under, shine });

    const anchorX = base.anchorX[column];
    const anchorY = base.anchorY[column] - 1;
    hardware.append(
      svgNode("circle", {
        cx: anchorX,
        cy: anchorY,
        r: 3.55,
        fill: "url(#oa-brass)",
        stroke: "#4b3616",
        "stroke-width": "0.9"
      }),
      svgNode("circle", {
        cx: anchorX,
        cy: anchorY,
        r: 1.45,
        fill: scene.render.background,
        stroke: "#473717",
        "stroke-width": "0.55"
      }),
      svgNode("path", {
        d: `M ${anchorX - 2.2} ${anchorY + 4.5} q 2.2 3.2 4.4 0`,
        fill: "none",
        stroke: "#6f5630",
        "stroke-width": "0.85",
        "stroke-linecap": "round"
      })
    );

    const crystal = createCrystal(
      column,
      15 + (column % 4) * 2.15,
      palette[column % palette.length],
      `oa-glass-${column}`,
      options.pendantHref
    );
    payloads.appendChild(crystal);
    crystalNodes.push(crystal);

    const beads = [];
    for (const row of [3, 7, 10]) {
      if (row >= rows - 1) continue;
      const bead = createBead(
        palette[(column + row) % palette.length],
        row === 7 ? 3.65 : 2.75
      );
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
      const cordPath = pathThrough(points);
      cordNodes[column].under.setAttribute("d", cordPath);
      cordNodes[column].shine.setAttribute("d", cordPath);

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
