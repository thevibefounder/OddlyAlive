const SVG_NS = "http://www.w3.org/2000/svg";

function svgNode(name, attributes = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attributes)) {
    node.setAttribute(key, String(value));
  }
  return node;
}

function createBaseBall(body) {
  const group = svgNode("g", {
    class: `oa-ball oa-ball-${body.kind}`,
    "data-body-id": body.id
  });
  group.appendChild(
    svgNode("circle", {
      cx: 0,
      cy: 0,
      r: body.radius,
      fill: body.color,
      stroke: "#20201d",
      "stroke-width": Math.max(1.5, body.radius * 0.045)
    })
  );
  return group;
}

function createBaseball(body) {
  const group = createBaseBall(body);
  const seamOffset = body.radius * 0.28;
  group.append(
    svgNode("path", {
      d: `M ${-body.radius * 0.73} ${-seamOffset} Q 0 ${body.radius * 0.03} ${body.radius * 0.73} ${-seamOffset}`,
      fill: "none",
      stroke: "#cf4738",
      "stroke-width": "2.2",
      "stroke-linecap": "round",
      "stroke-dasharray": "4 4"
    }),
    svgNode("path", {
      d: `M ${-body.radius * 0.73} ${seamOffset} Q 0 ${-body.radius * 0.03} ${body.radius * 0.73} ${seamOffset}`,
      fill: "none",
      stroke: "#cf4738",
      "stroke-width": "2.2",
      "stroke-linecap": "round",
      "stroke-dasharray": "4 4"
    })
  );
  return group;
}

function createBasketball(body) {
  const group = createBaseBall(body);
  const r = body.radius;
  group.append(
    svgNode("path", {
      d: `M ${-r} 0 H ${r}`,
      fill: "none",
      stroke: "#26231f",
      "stroke-width": "2.3"
    }),
    svgNode("path", {
      d: `M 0 ${-r} V ${r}`,
      fill: "none",
      stroke: "#26231f",
      "stroke-width": "2.3"
    }),
    svgNode("path", {
      d: `M ${-r * 0.78} ${-r * 0.62} Q 0 0 ${-r * 0.78} ${r * 0.62}`,
      fill: "none",
      stroke: "#26231f",
      "stroke-width": "2.3"
    }),
    svgNode("path", {
      d: `M ${r * 0.78} ${-r * 0.62} Q 0 0 ${r * 0.78} ${r * 0.62}`,
      fill: "none",
      stroke: "#26231f",
      "stroke-width": "2.3"
    })
  );
  return group;
}

function polygonPoints(radius, sides, rotation = -Math.PI / 2) {
  const points = [];
  for (let index = 0; index < sides; index += 1) {
    const angle = rotation + (index / sides) * Math.PI * 2;
    points.push(
      `${(Math.cos(angle) * radius).toFixed(2)},${(Math.sin(angle) * radius).toFixed(2)}`
    );
  }
  return points.join(" ");
}

function createFootball(body) {
  const group = createBaseBall(body);
  const r = body.radius;
  group.appendChild(
    svgNode("polygon", {
      points: polygonPoints(r * 0.28, 5),
      fill: "#20201d"
    })
  );
  for (let index = 0; index < 5; index += 1) {
    const angle = -Math.PI / 2 + (index / 5) * Math.PI * 2;
    const x = Math.cos(angle) * r * 0.68;
    const y = Math.sin(angle) * r * 0.68;
    group.append(
      svgNode("polygon", {
        points: polygonPoints(r * 0.18, 5, angle),
        transform: `translate(${x.toFixed(2)} ${y.toFixed(2)})`,
        fill: "#20201d"
      }),
      svgNode("path", {
        d: `M ${(Math.cos(angle) * r * 0.28).toFixed(2)} ${(Math.sin(angle) * r * 0.28).toFixed(2)} L ${x.toFixed(2)} ${y.toFixed(2)}`,
        stroke: "#20201d",
        "stroke-width": "1.6",
        fill: "none"
      })
    );
  }
  return group;
}

function createGenericBall(body) {
  const group = createBaseBall(body);
  group.appendChild(
    svgNode("circle", {
      cx: -body.radius * 0.24,
      cy: -body.radius * 0.28,
      r: body.radius * 0.13,
      fill: "rgba(255,255,255,0.44)"
    })
  );
  return group;
}

function createBall(body) {
  if (body.kind === "baseball") return createBaseball(body);
  if (body.kind === "basketball") return createBasketball(body);
  if (body.kind === "football") return createFootball(body);
  return createGenericBall(body);
}

export function createRigidBallRenderer(svg, simulation, options = {}) {
  const { scene, frames } = simulation;
  if (!frames) {
    throw new TypeError("The rigid renderer requires simulation frames.");
  }
  const mode = options.mode ?? "lab";
  const root = svgNode("g", { class: `oa-rigid-scene oa-mode-${mode}` });
  const defs = svgNode("defs");
  const shadowFilter = svgNode("filter", {
    id: `oa-rigid-shadow-${mode}`,
    x: "-40%",
    y: "-60%",
    width: "180%",
    height: "220%"
  });
  shadowFilter.appendChild(
    svgNode("feGaussianBlur", { stdDeviation: "5" })
  );
  defs.appendChild(shadowFilter);
  root.appendChild(defs);

  const background = svgNode("g", { class: "oa-rigid-background" });
  if (mode === "kick") {
    background.append(
      svgNode("rect", {
        x: 0,
        y: scene.world.floorY,
        width: scene.canvas.width,
        height: scene.canvas.height - scene.world.floorY,
        fill: "#769a58"
      }),
      svgNode("path", {
        d: `M 0 ${scene.world.floorY} H ${scene.canvas.width}`,
        stroke: "#f3efdf",
        "stroke-width": "4",
        fill: "none"
      }),
      svgNode("path", {
        d: `M 730 ${scene.world.floorY} V 152 H 900 V ${scene.world.floorY}`,
        stroke: "#f3efdf",
        "stroke-width": "6",
        fill: "none",
        opacity: "0.88"
      })
    );
    for (let y = 168; y < scene.world.floorY; y += 28) {
      background.appendChild(
        svgNode("path", {
          d: `M 730 ${y} H 900`,
          stroke: "rgba(243,239,223,0.35)",
          "stroke-width": "1"
        })
      );
    }
  } else {
    background.append(
      svgNode("path", {
        d: `M ${scene.world.left} ${scene.world.floorY} H ${scene.world.right}`,
        stroke: "#20201d",
        "stroke-width": "4",
        "stroke-linecap": "round"
      }),
      svgNode("path", {
        d: `M ${scene.world.left} ${scene.world.floorY + 8} H ${scene.world.right}`,
        stroke: "rgba(32,32,29,0.16)",
        "stroke-width": "1"
      })
    );
  }
  root.appendChild(background);

  const shadowGroup = svgNode("g", {
    class: "oa-rigid-shadows",
    filter: `url(#oa-rigid-shadow-${mode})`
  });
  const bodyGroup = svgNode("g", { class: "oa-rigid-bodies" });
  const labelGroup = svgNode("g", {
    class: "oa-rigid-labels",
    "font-family": "ui-monospace, SFMono-Regular, Menlo, monospace",
    "font-size": "10",
    "font-weight": "700",
    "letter-spacing": "1.5",
    "text-anchor": "middle",
    fill: mode === "kick" ? "#f3efdf" : "#5c584f"
  });
  root.append(shadowGroup, bodyGroup, labelGroup);
  svg.appendChild(root);

  const bodyNodes = [];
  const shadows = [];
  scene.bodies.forEach((body) => {
    const shadow = svgNode("ellipse", {
      cx: body.x,
      cy: scene.world.floorY - 2,
      rx: body.radius * 0.78,
      ry: Math.max(4, body.radius * 0.13),
      fill: mode === "kick" ? "rgba(18,28,13,0.28)" : "rgba(32,32,29,0.22)"
    });
    shadowGroup.appendChild(shadow);
    shadows.push(shadow);
    const bodyNode = createBall(body);
    bodyGroup.appendChild(bodyNode);
    bodyNodes.push(bodyNode);
    if (options.labels !== false) {
      const label = svgNode("text", {
        x: body.x,
        y: scene.world.floorY + 32
      });
      label.textContent = body.label ?? body.id.toUpperCase();
      labelGroup.appendChild(label);
    }
  });

  function renderFrame(frameIndex) {
    const frame = frames[Math.max(0, Math.min(frames.length - 1, frameIndex))];
    scene.bodies.forEach((body, index) => {
      bodyNodes[index].setAttribute(
        "transform",
        `translate(${frame.x[index].toFixed(2)} ${frame.y[index].toFixed(2)}) rotate(${frame.angle[index].toFixed(2)})`
      );
      const altitude = Math.max(
        0,
        scene.world.floorY - (frame.y[index] + body.radius)
      );
      const proximity = Math.max(0.08, 1 - altitude / 280);
      shadows[index].setAttribute("cx", frame.x[index].toFixed(2));
      shadows[index].setAttribute(
        "rx",
        (body.radius * (0.45 + proximity * 0.34)).toFixed(2)
      );
      shadows[index].setAttribute(
        "opacity",
        (0.2 + proximity * 0.8).toFixed(2)
      );
    });
  }

  return { renderFrame };
}
