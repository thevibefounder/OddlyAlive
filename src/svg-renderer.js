const SVG_NS = "http://www.w3.org/2000/svg";

function svgNode(name, attributes = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attributes)) {
    node.setAttribute(key, String(value));
  }
  return node;
}

function strandPath(points) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let index = 1; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const middleX = (current.x + next.x) * 0.5;
    const middleY = (current.y + next.y) * 0.5;
    path += ` Q ${current.x.toFixed(2)} ${current.y.toFixed(2)} ${middleX.toFixed(2)} ${middleY.toFixed(2)}`;
  }
  const previous = points[points.length - 2];
  const last = points[points.length - 1];
  path += ` Q ${previous.x.toFixed(2)} ${previous.y.toFixed(2)} ${last.x.toFixed(2)} ${last.y.toFixed(2)}`;
  return path;
}

export function createSvgRenderer(svg, simulation, options = {}) {
  const { scene, base, frames } = simulation;
  if (!frames) {
    throw new TypeError("The SVG renderer requires simulation frames.");
  }

  const { columns, rows } = scene.field;
  const glyphText = Array.from(scene.payload.text);
  const root = svgNode("g", { class: "oa-scene" });
  const defs = svgNode("defs");
  const shadow = svgNode("filter", {
    id: "oa-soft-shadow",
    x: "-20%",
    y: "-20%",
    width: "140%",
    height: "160%"
  });
  shadow.appendChild(
    svgNode("feDropShadow", {
      dx: "0",
      dy: "4",
      stdDeviation: "4",
      "flood-color": "#10100e",
      "flood-opacity": "0.14"
    })
  );
  defs.appendChild(shadow);
  root.appendChild(defs);

  const rail = svgNode("path", {
    class: "oa-rail",
    d: `M ${base.anchorX[0] - 26} ${base.anchorY[0] - 9} Q ${scene.canvas.width / 2} ${base.anchorY[0] - 17} ${base.anchorX[columns - 1] + 26} ${base.anchorY[columns - 1] - 9}`,
    fill: "none",
    stroke: scene.render.ink,
    "stroke-width": "7",
    "stroke-linecap": "round"
  });
  root.appendChild(rail);

  const cordGroup = svgNode("g", {
    class: "oa-cords",
    fill: "none",
    stroke: scene.render.filament,
    "stroke-width": "1.05",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  });
  const glyphGroup = svgNode("g", {
    class: "oa-glyphs",
    "font-family": scene.payload.fontFamily,
    "font-size": scene.payload.fontSize,
    "text-anchor": "middle",
    "dominant-baseline": "central",
    filter: "url(#oa-soft-shadow)"
  });
  const hardwareGroup = svgNode("g", { class: "oa-hardware" });
  root.append(cordGroup, glyphGroup, hardwareGroup);
  svg.appendChild(root);

  const cordPaths = [];
  for (let column = 0; column < columns; column += 1) {
    const path = svgNode("path");
    cordGroup.appendChild(path);
    cordPaths.push(path);

    hardwareGroup.appendChild(
      svgNode("circle", {
        cx: base.anchorX[column],
        cy: base.anchorY[column] - 1,
        r: column % 3 === 0 ? 2.6 : 2.15,
        fill: scene.render.background,
        stroke: scene.render.ink,
        "stroke-width": "1.25"
      })
    );
  }

  const glyphs = [];
  for (let index = 0; index < columns * rows; index += 1) {
    const text = svgNode("text", {
      fill:
        index % 29 === 0 || index % 47 === 0
          ? scene.render.accent
          : scene.render.ink,
      opacity: index % 7 === 0 ? 0.76 : 0.92
    });
    text.textContent = glyphText[index % glyphText.length];
    glyphGroup.appendChild(text);
    glyphs.push(text);
  }

  const debugGroup = svgNode("g", {
    class: "oa-debug",
    opacity: options.debug ? 1 : 0,
    "pointer-events": "none"
  });
  const debugCapsule = svgNode("ellipse", {
    fill: "rgba(236, 91, 54, 0.08)",
    stroke: scene.render.accent,
    "stroke-width": "1.5",
    "stroke-dasharray": "5 6"
  });
  debugGroup.appendChild(debugCapsule);
  svg.appendChild(debugGroup);

  function renderFrame(frameIndex, force) {
    const frame = frames[Math.max(0, Math.min(frames.length - 1, frameIndex))];
    for (let column = 0; column < columns; column += 1) {
      const points = [
        { x: base.anchorX[column], y: base.anchorY[column] }
      ];
      for (let row = 0; row < rows; row += 1) {
        const index = row * columns + column;
        const x = base.x[index] + frame.x[index];
        const y = base.y[index] + frame.y[index];
        points.push({ x, y });
        glyphs[index].setAttribute(
          "transform",
          `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${frame.rotation[index].toFixed(2)})`
        );
      }
      cordPaths[column].setAttribute("d", strandPath(points));
    }

    if (force) {
      debugCapsule.setAttribute("cx", force.x);
      debugCapsule.setAttribute("cy", force.y);
      debugCapsule.setAttribute("rx", scene.contact.radiusX);
      debugCapsule.setAttribute("ry", scene.contact.radiusY);
      debugCapsule.setAttribute(
        "opacity",
        Math.max(0.12, force.pressure).toFixed(2)
      );
    }
  }

  return {
    renderFrame,
    setDebug(enabled) {
      debugGroup.setAttribute("opacity", enabled ? "1" : "0");
    }
  };
}
