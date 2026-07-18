const SVG_NS = "http://www.w3.org/2000/svg";

function svgNode(name, attributes = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attributes)) {
    node.setAttribute(key, String(value));
  }
  return node;
}

function createShoe(width, height) {
  const group = svgNode("g", { class: "oa-shoe" });
  const left = -width * 0.5;
  const top = -height * 0.5;
  group.append(
    svgNode("path", {
      d: `M ${left} ${top + height * 0.34} Q ${left + width * 0.2} ${top + height * 0.15} ${left + width * 0.42} ${top + height * 0.24} L ${left + width * 0.65} ${top + height * 0.48} Q ${left + width * 0.84} ${top + height * 0.62} ${left + width} ${top + height * 0.62} L ${left + width} ${top + height * 0.84} Q ${left + width * 0.65} ${top + height} ${left + width * 0.2} ${top + height * 0.92} L ${left} ${top + height * 0.68} Z`,
      fill: "#f4efe3",
      stroke: "#21201c",
      "stroke-width": "2.4",
      "stroke-linejoin": "round"
    }),
    svgNode("path", {
      d: `M ${left + width * 0.02} ${top + height * 0.66} Q ${left + width * 0.48} ${top + height * 0.9} ${left + width} ${top + height * 0.72} L ${left + width} ${top + height * 0.86} Q ${left + width * 0.46} ${top + height * 1.08} ${left + width * 0.02} ${top + height * 0.78} Z`,
      fill: "#f06a43",
      stroke: "#21201c",
      "stroke-width": "1.5"
    }),
    svgNode("path", {
      d: `M ${left + width * 0.28} ${top + height * 0.36} L ${left + width * 0.48} ${top + height * 0.74}`,
      stroke: "#21201c",
      "stroke-width": "1.4",
      fill: "none"
    })
  );
  for (let index = 0; index < 5; index += 1) {
    const x = left + width * (0.29 + index * 0.075);
    const y = top + height * (0.4 + index * 0.055);
    group.append(
      svgNode("circle", {
        cx: x,
        cy: y,
        r: 2.1,
        fill: "#21201c"
      }),
      svgNode("path", {
        d: `M ${x - width * 0.035} ${y + height * 0.03} L ${x + width * 0.07} ${y - height * 0.04}`,
        stroke: "#f06a43",
        "stroke-width": "1.5"
      })
    );
  }
  return group;
}

export function createSurfaceWaveRenderer(svg, simulation) {
  const { scene, frames } = simulation;
  if (!frames) {
    throw new TypeError("The surface renderer requires simulation frames.");
  }
  const root = svgNode("g", { class: "oa-wave-scene" });
  const water = svgNode("path", {
    fill: "#80c7d4",
    opacity: "0.82"
  });
  const surface = svgNode("path", {
    fill: "none",
    stroke: "#1e6f7b",
    "stroke-width": "3",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  });
  const underLine = svgNode("path", {
    d: `M ${scene.surface.x} ${scene.surface.restY + 12} H ${scene.surface.x + scene.surface.width}`,
    stroke: "rgba(255,255,255,0.38)",
    "stroke-width": "1",
    "stroke-dasharray": "5 8"
  });
  const shoe = createShoe(scene.body.width, scene.body.height);
  root.append(water, underLine, surface, shoe);
  svg.appendChild(root);

  function renderFrame(frameIndex) {
    const frame = frames[Math.max(0, Math.min(frames.length - 1, frameIndex))];
    const step = scene.surface.width / (frame.surface.length - 1);
    let linePath = "";
    for (let index = 0; index < frame.surface.length; index += 1) {
      const x = scene.surface.x + index * step;
      const y = scene.surface.restY + frame.surface[index];
      linePath +=
        index === 0
          ? `M ${x.toFixed(2)} ${y.toFixed(2)}`
          : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    surface.setAttribute("d", linePath);
    water.setAttribute(
      "d",
      `${linePath} L ${(scene.surface.x + scene.surface.width).toFixed(2)} ${scene.canvas.height} L ${scene.surface.x} ${scene.canvas.height} Z`
    );
    shoe.setAttribute(
      "transform",
      `translate(${frame.body.x.toFixed(2)} ${frame.body.y.toFixed(2)}) rotate(${frame.body.angle.toFixed(2)})`
    );
  }

  return { renderFrame };
}
