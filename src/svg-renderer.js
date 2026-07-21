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
  const railGradient = svgNode("linearGradient", {
    id: "oa-rail-metal",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  });
  railGradient.append(
    svgNode("stop", { offset: "0", "stop-color": "#6a6255" }),
    svgNode("stop", { offset: "0.24", "stop-color": "#d9cdb9" }),
    svgNode("stop", { offset: "0.42", "stop-color": "#736b5f" }),
    svgNode("stop", { offset: "0.68", "stop-color": "#2b2a27" }),
    svgNode("stop", { offset: "1", "stop-color": "#161614" })
  );
  const brassGradient = svgNode("radialGradient", {
    id: "oa-eyelet-brass",
    cx: "34%",
    cy: "26%",
    r: "74%"
  });
  brassGradient.append(
    svgNode("stop", { offset: "0", "stop-color": "#fff2b2" }),
    svgNode("stop", { offset: "0.25", "stop-color": "#d6a53c" }),
    svgNode("stop", { offset: "0.66", "stop-color": "#8b5b18" }),
    svgNode("stop", { offset: "1", "stop-color": "#493014" })
  );
  defs.append(railGradient, brassGradient);
  const shadow = svgNode("filter", {
    id: "oa-soft-shadow",
    x: "-30%",
    y: "-30%",
    width: "160%",
    height: "180%"
  });
  shadow.appendChild(
    svgNode("feDropShadow", {
      dx: "1.6",
      dy: "5",
      stdDeviation: "3.4",
      "flood-color": "#10100e",
      "flood-opacity": "0.2"
    })
  );
  defs.appendChild(shadow);
  root.appendChild(defs);

  const railY = base.anchorY[0] - 12;
  const railStart = base.anchorX[0] - 35;
  const railEnd = base.anchorX[columns - 1] + 35;
  const railGroup = svgNode("g", {
    class: "oa-rail",
    filter: "url(#oa-soft-shadow)"
  });
  railGroup.append(
    svgNode("rect", {
      x: railStart,
      y: railY - 7,
      width: railEnd - railStart,
      height: 14,
      rx: 6.5,
      fill: "url(#oa-rail-metal)",
      stroke: "#171714",
      "stroke-width": "1.25"
    }),
    svgNode("path", {
      d: `M ${railStart + 8} ${railY - 3.8} L ${railEnd - 8} ${railY - 3.8}`,
      fill: "none",
      stroke: "rgba(255,255,255,0.5)",
      "stroke-width": "1.2",
      "stroke-linecap": "round"
    }),
    svgNode("rect", {
      x: railStart - 8,
      y: railY - 12,
      width: 16,
      height: 24,
      rx: 3,
      fill: "#292824",
      stroke: "#11110f",
      "stroke-width": "1.2"
    }),
    svgNode("rect", {
      x: railEnd - 8,
      y: railY - 12,
      width: 16,
      height: 24,
      rx: 3,
      fill: "#292824",
      stroke: "#11110f",
      "stroke-width": "1.2"
    })
  );
  for (const x of [railStart, railEnd]) {
    railGroup.append(
      svgNode("circle", {
        cx: x,
        cy: railY,
        r: 3.4,
        fill: "#bdb3a2",
        stroke: "#11110f",
        "stroke-width": "1"
      }),
      svgNode("path", {
        d: `M ${x - 1.9} ${railY + 1.4} L ${x + 1.9} ${railY - 1.4}`,
        stroke: "#4d493f",
        "stroke-width": "0.9",
        "stroke-linecap": "round"
      })
    );
  }
  root.appendChild(railGroup);

  const cordGroup = svgNode("g", {
    class: "oa-cords",
    fill: "none",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  });
  const knotGroup = svgNode("g", {
    class: "oa-knots",
    fill: "none",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  });
  const charmGroup = svgNode("g", {
    class: "oa-glyph-charms",
    filter: "url(#oa-soft-shadow)"
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
  root.append(cordGroup, charmGroup, glyphGroup, knotGroup, hardwareGroup);
  svg.appendChild(root);

  const cordPaths = [];
  const cordHighlights = [];
  const knotTails = [];
  for (let column = 0; column < columns; column += 1) {
    const path = svgNode("path", {
      stroke: "rgba(34, 29, 23, 0.74)",
      "stroke-width": column % 4 === 0 ? "1.65" : "1.42"
    });
    const highlight = svgNode("path", {
      stroke: "rgba(244, 226, 192, 0.58)",
      "stroke-width": "0.52",
      "stroke-dasharray": "2.1 2.35",
      "stroke-dashoffset": String((column % 5) * 0.47)
    });
    cordGroup.appendChild(path);
    cordGroup.appendChild(highlight);
    cordPaths.push(path);
    cordHighlights.push(highlight);

    const tail = svgNode("path", {
      stroke: "rgba(41, 33, 24, 0.75)",
      "stroke-width": "1.2"
    });
    knotGroup.appendChild(tail);
    knotTails.push(tail);

    hardwareGroup.append(
      svgNode("path", {
        d: `M ${base.anchorX[column] - 4} ${railY + 4} Q ${base.anchorX[column]} ${railY + 10} ${base.anchorX[column] + 4} ${railY + 4}`,
        fill: "none",
        stroke: "#191815",
        "stroke-width": "1.7",
        "stroke-linecap": "round"
      }),
      svgNode("circle", {
        cx: base.anchorX[column],
        cy: base.anchorY[column] - 2.2,
        r: column % 3 === 0 ? 3.9 : 3.35,
        fill: "url(#oa-eyelet-brass)",
        stroke: "#4a3013",
        "stroke-width": "1"
      }),
      svgNode("circle", {
        cx: base.anchorX[column],
        cy: base.anchorY[column] - 2.2,
        r: column % 3 === 0 ? 1.65 : 1.35,
        fill: "#181713",
        stroke: "#f2d77f",
        "stroke-opacity": "0.56",
        "stroke-width": "0.55"
      }),
      svgNode("path", {
        d: `M ${base.anchorX[column] - 1.4} ${base.anchorY[column] + 1} C ${base.anchorX[column] - 4.4} ${base.anchorY[column] + 7}, ${base.anchorX[column] + 4.1} ${base.anchorY[column] + 7.4}, ${base.anchorX[column] + 1.1} ${base.anchorY[column] + 11}`,
        fill: "none",
        stroke: "rgba(42,33,23,0.8)",
        "stroke-width": "1.15",
        "stroke-linecap": "round"
      })
    );
  }

  const glyphs = [];
  const charmNodes = [];
  for (let index = 0; index < columns * rows; index += 1) {
    if (options.glyphCharmHref) {
      const charm = svgNode("image", {
        href: options.glyphCharmHref,
        x: "-9.4",
        y: "-9.4",
        width: "18.8",
        height: "18.8",
        preserveAspectRatio: "xMidYMid meet",
        decoding: "sync",
        opacity: index % 7 === 0 ? "0.82" : "0.96",
        style: `filter:hue-rotate(${(index % 5) * 2 - 4}deg) brightness(${0.95 + (index % 3) * 0.025})`
      });
      charmGroup.appendChild(charm);
      charmNodes.push(charm);
    } else {
      charmNodes.push(null);
    }
    const text = svgNode("text", {
      fill:
        index % 29 === 0 || index % 47 === 0
          ? scene.render.accent
          : scene.render.ink,
      opacity: index % 7 === 0 ? 0.76 : 0.92
    });
    text.textContent = glyphText[index % glyphText.length];
    text.setAttribute(
      "style",
      `paint-order:stroke;stroke:${scene.render.background};stroke-width:0.7px;stroke-opacity:0.48`
    );
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
        if (charmNodes[index]) {
          charmNodes[index].setAttribute(
            "transform",
            `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${frame.rotation[index].toFixed(2)})`
          );
        }
      }
      const path = strandPath(points);
      cordPaths[column].setAttribute("d", path);
      cordHighlights[column].setAttribute("d", path);
      const terminal = points[points.length - 1];
      const beforeTerminal = points[points.length - 2];
      const angle = Math.atan2(
        terminal.y - beforeTerminal.y,
        terminal.x - beforeTerminal.x
      );
      const normalX = Math.cos(angle + Math.PI * 0.5);
      const normalY = Math.sin(angle + Math.PI * 0.5);
      const tailX = terminal.x + Math.cos(angle) * 10 + normalX * (column % 2 ? 3 : -3);
      const tailY = terminal.y + Math.sin(angle) * 10 + normalY * (column % 2 ? 3 : -3);
      knotTails[column].setAttribute(
        "d",
        `M ${(terminal.x - normalX * 2.2).toFixed(2)} ${(terminal.y - normalY * 2.2).toFixed(2)} Q ${(terminal.x + normalX * 4.4).toFixed(2)} ${(terminal.y + normalY * 4.4).toFixed(2)} ${tailX.toFixed(2)} ${tailY.toFixed(2)}`
      );
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
