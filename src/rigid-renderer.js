const SVG_NS = "http://www.w3.org/2000/svg";

function svgNode(name, attributes = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attributes)) {
    node.setAttribute(key, String(value));
  }
  return node;
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function smoothStep(value) {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
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

function addRadialGradient(defs, id, stops) {
  const gradient = svgNode("radialGradient", {
    id,
    cx: "31%",
    cy: "24%",
    r: "76%"
  });
  for (const stop of stops) gradient.appendChild(svgNode("stop", stop));
  defs.appendChild(gradient);
}

function createBallShell(body, defs, idBase, stops) {
  const group = svgNode("g", {
    class: `oa-ball oa-ball-${body.kind}`,
    "data-body-id": body.id
  });
  const clipId = `${idBase}-clip`;
  const fillId = `${idBase}-fill`;
  const clip = svgNode("clipPath", { id: clipId });
  clip.appendChild(svgNode("circle", { r: body.radius }));
  defs.appendChild(clip);
  addRadialGradient(defs, fillId, stops);

  group.appendChild(
    svgNode("circle", {
      r: body.radius,
      fill: `url(#${fillId})`
    })
  );
  const details = svgNode("g", {
    class: "oa-ball-surface",
    "clip-path": `url(#${clipId})`
  });
  group.appendChild(details);
  return { group, details };
}

function finishBall(group, body) {
  group.append(
    svgNode("circle", {
      r: body.radius,
      fill: "none",
      stroke: "#20201d",
      "stroke-width": Math.max(1.8, body.radius * 0.05)
    }),
    svgNode("ellipse", {
      cx: -body.radius * 0.27,
      cy: -body.radius * 0.35,
      rx: body.radius * 0.22,
      ry: body.radius * 0.11,
      transform: "rotate(-28)",
      fill: "rgba(255,255,255,0.28)"
    }),
    svgNode("path", {
      d: `M ${body.radius * 0.55} ${body.radius * 0.22} Q ${body.radius * 0.48} ${body.radius * 0.58} ${body.radius * 0.18} ${body.radius * 0.72}`,
      fill: "none",
      stroke: "rgba(28,25,21,0.16)",
      "stroke-width": Math.max(1, body.radius * 0.045),
      "stroke-linecap": "round"
    })
  );
  return group;
}

function createBaseball(body, defs, idBase) {
  const { group, details } = createBallShell(body, defs, idBase, [
    { offset: "0%", "stop-color": "#fffdf5" },
    { offset: "58%", "stop-color": "#eee7d8" },
    { offset: "100%", "stop-color": "#c4b7a2" }
  ]);
  const r = body.radius;

  for (let index = 0; index < 24; index += 1) {
    const angle = index * 2.399963;
    const distance = r * (0.16 + ((index * 37) % 71) / 100);
    details.appendChild(
      svgNode("circle", {
        cx: (Math.cos(angle) * distance).toFixed(2),
        cy: (Math.sin(angle) * distance).toFixed(2),
        r: index % 4 === 0 ? 0.8 : 0.5,
        fill: index % 5 === 0 ? "#a59378" : "#6b6254",
        opacity: index % 4 === 0 ? "0.16" : "0.08"
      })
    );
  }

  const leftSeam = `M ${-r * 0.58} ${-r * 0.92} C ${-r * 0.16} ${-r * 0.54} ${-r * 0.16} ${r * 0.54} ${-r * 0.58} ${r * 0.92}`;
  const rightSeam = `M ${r * 0.58} ${-r * 0.92} C ${r * 0.16} ${-r * 0.54} ${r * 0.16} ${r * 0.54} ${r * 0.58} ${r * 0.92}`;
  details.append(
    svgNode("path", {
      d: leftSeam,
      fill: "none",
      stroke: "#c63f35",
      "stroke-width": "1.45"
    }),
    svgNode("path", {
      d: rightSeam,
      fill: "none",
      stroke: "#c63f35",
      "stroke-width": "1.45"
    })
  );

  for (const side of [-1, 1]) {
    for (let index = 0; index < 9; index += 1) {
      const normalizedY = -0.72 + index * 0.18;
      const y = normalizedY * r;
      const x = side * r * (0.27 + Math.abs(normalizedY) * 0.23);
      const slant = side * (index < 4 ? -1 : 1);
      details.appendChild(
        svgNode("path", {
          d: `M ${(x - side * r * 0.09).toFixed(2)} ${(y - slant * r * 0.055).toFixed(2)} L ${(x + side * r * 0.075).toFixed(2)} ${(y + slant * r * 0.055).toFixed(2)}`,
          stroke: "#d64a3e",
          "stroke-width": "1.5",
          "stroke-linecap": "round"
        })
      );
    }
  }

  details.appendChild(
    svgNode("path", {
      d: `M ${-r * 0.12} ${r * 0.42} q ${r * 0.2} ${r * 0.06} ${r * 0.31} ${-r * 0.04}`,
      stroke: "rgba(92,76,56,0.18)",
      "stroke-width": "1.2",
      fill: "none"
    })
  );
  return finishBall(group, body);
}

function createBasketball(body, defs, idBase) {
  const { group, details } = createBallShell(body, defs, idBase, [
    { offset: "0%", "stop-color": "#ff9a52" },
    { offset: "48%", "stop-color": "#e66b2d" },
    { offset: "100%", "stop-color": "#9d3519" }
  ]);
  const r = body.radius;
  const dotSpacing = Math.max(4.6, r * 0.105);
  for (let y = -r; y <= r; y += dotSpacing) {
    for (let x = -r; x <= r; x += dotSpacing) {
      const offsetX = (Math.round(y / dotSpacing) % 2) * dotSpacing * 0.48;
      details.appendChild(
        svgNode("circle", {
          cx: (x + offsetX).toFixed(2),
          cy: y.toFixed(2),
          r: Math.max(0.48, r * 0.012),
          fill: "#4d2115",
          opacity: "0.28"
        })
      );
    }
  }
  const seams = [
    `M ${-r} 0 H ${r}`,
    `M 0 ${-r} V ${r}`,
    `M ${-r * 0.83} ${-r * 0.64} C ${-r * 0.24} ${-r * 0.3} ${-r * 0.24} ${r * 0.3} ${-r * 0.83} ${r * 0.64}`,
    `M ${r * 0.83} ${-r * 0.64} C ${r * 0.24} ${-r * 0.3} ${r * 0.24} ${r * 0.3} ${r * 0.83} ${r * 0.64}`
  ];
  for (const d of seams) {
    details.append(
      svgNode("path", {
        d,
        fill: "none",
        stroke: "#221d19",
        "stroke-width": Math.max(2.2, r * 0.065),
        "stroke-linecap": "round"
      }),
      svgNode("path", {
        d,
        fill: "none",
        stroke: "rgba(255,165,95,0.22)",
        "stroke-width": Math.max(0.55, r * 0.014),
        transform: "translate(-0.7 -0.7)"
      })
    );
  }
  details.append(
    svgNode("circle", {
      cx: r * 0.23,
      cy: r * 0.2,
      r: r * 0.035,
      fill: "#1f1b18"
    }),
    svgNode("circle", {
      cx: r * 0.23,
      cy: r * 0.2,
      r: r * 0.014,
      fill: "#9b5d3c"
    })
  );
  return finishBall(group, body);
}

function createFootball(body, defs, idBase) {
  const { group, details } = createBallShell(body, defs, idBase, [
    { offset: "0%", "stop-color": "#fffef7" },
    { offset: "63%", "stop-color": "#eeeade" },
    { offset: "100%", "stop-color": "#a9a89f" }
  ]);
  const r = body.radius;
  const centralRadius = r * 0.265;
  const outerRadius = r * 0.175;

  details.append(
    svgNode("polygon", {
      points: polygonPoints(centralRadius, 5, -Math.PI / 2),
      fill: "#171816",
      stroke: "#090a09",
      "stroke-width": "0.8"
    })
  );
  for (let index = 0; index < 5; index += 1) {
    const angle = -Math.PI / 2 + (index / 5) * Math.PI * 2;
    const x = Math.cos(angle) * r * 0.69;
    const y = Math.sin(angle) * r * 0.69;
    const innerX = Math.cos(angle) * centralRadius;
    const innerY = Math.sin(angle) * centralRadius;
    details.append(
      svgNode("polygon", {
        points: polygonPoints(outerRadius, 5, angle + Math.PI),
        transform: `translate(${x.toFixed(2)} ${y.toFixed(2)})`,
        fill: "#1b1c19",
        stroke: "#090a09",
        "stroke-width": "0.65"
      }),
      svgNode("path", {
        d: `M ${innerX.toFixed(2)} ${innerY.toFixed(2)} L ${(x - Math.cos(angle) * outerRadius).toFixed(2)} ${(y - Math.sin(angle) * outerRadius).toFixed(2)}`,
        stroke: "#62615b",
        "stroke-width": "1.05",
        fill: "none"
      })
    );
    const nextAngle = -Math.PI / 2 + ((index + 1) / 5) * Math.PI * 2;
    const midAngle = (angle + nextAngle) * 0.5;
    details.appendChild(
      svgNode("path", {
        d: `M ${(Math.cos(angle + 0.46) * centralRadius).toFixed(2)} ${(Math.sin(angle + 0.46) * centralRadius).toFixed(2)} Q ${(Math.cos(midAngle) * r * 0.55).toFixed(2)} ${(Math.sin(midAngle) * r * 0.55).toFixed(2)} ${(Math.cos(nextAngle - 0.46) * centralRadius).toFixed(2)} ${(Math.sin(nextAngle - 0.46) * centralRadius).toFixed(2)}`,
        fill: "none",
        stroke: "#77766f",
        "stroke-width": "0.8"
      })
    );
  }
  details.append(
    svgNode("path", {
      d: `M ${-r * 0.76} ${r * 0.35} q ${r * 0.16} ${r * 0.09} ${r * 0.3} ${r * 0.02}`,
      stroke: "rgba(86,72,53,0.25)",
      "stroke-width": "1.3",
      fill: "none"
    }),
    svgNode("path", {
      d: `M ${r * 0.24} ${-r * 0.79} q ${r * 0.12} ${r * 0.08} ${r * 0.23} ${r * 0.02}`,
      stroke: "rgba(86,72,53,0.18)",
      "stroke-width": "1.1",
      fill: "none"
    })
  );
  return finishBall(group, body);
}

function createGenericBall(body, defs, idBase) {
  const { group } = createBallShell(body, defs, idBase, [
    { offset: "0%", "stop-color": "#ffffff" },
    { offset: "55%", "stop-color": body.color },
    { offset: "100%", "stop-color": "#55534c" }
  ]);
  return finishBall(group, body);
}

function createPhotoBall(body, href) {
  const scaleByKind = {
    baseball: 2.78,
    basketball: 2.45,
    football: 2.46
  };
  const size = body.radius * (scaleByKind[body.kind] ?? 2.5);
  const group = svgNode("g", {
    class: `oa-ball oa-ball-${body.kind} oa-ball-photo`,
    "data-body-id": body.id
  });
  group.appendChild(
    svgNode("image", {
      href,
      x: (-size * 0.5).toFixed(2),
      y: (-size * 0.5).toFixed(2),
      width: size.toFixed(2),
      height: size.toFixed(2),
      preserveAspectRatio: "xMidYMid meet",
      decoding: "sync"
    })
  );
  return group;
}

function createBall(body, defs, idBase, photoHref) {
  if (photoHref) return createPhotoBall(body, photoHref);
  if (body.kind === "baseball") return createBaseball(body, defs, idBase);
  if (body.kind === "basketball") return createBasketball(body, defs, idBase);
  if (body.kind === "football") return createFootball(body, defs, idBase);
  return createGenericBall(body, defs, idBase);
}

function createLabBackground(scene) {
  const background = svgNode("g", { class: "oa-lab-background" });
  background.append(
    svgNode("rect", {
      x: scene.world.left,
      y: scene.world.floorY + 1,
      width: scene.world.right - scene.world.left,
      height: scene.canvas.height - scene.world.floorY,
      fill: "#d8c39b",
      opacity: "0.52"
    }),
    svgNode("path", {
      d: `M ${scene.world.left} ${scene.world.floorY} H ${scene.world.right}`,
      stroke: "#26241f",
      "stroke-width": "4",
      "stroke-linecap": "round"
    }),
    svgNode("path", {
      d: `M ${scene.world.left} ${scene.world.floorY + 6} H ${scene.world.right}`,
      stroke: "rgba(255,255,255,0.62)",
      "stroke-width": "1.2"
    })
  );
  for (let x = scene.world.left + 85; x < scene.world.right; x += 118) {
    background.appendChild(
      svgNode("path", {
        d: `M ${x} ${scene.world.floorY + 2} l -24 ${scene.canvas.height - scene.world.floorY}`,
        stroke: "rgba(95,67,34,0.16)",
        "stroke-width": "1"
      })
    );
  }
  return background;
}

function createKickBackground(scene, defs) {
  const sky = svgNode("linearGradient", {
    id: "oa-kick-sky",
    x1: "0%",
    y1: "0%",
    x2: "0%",
    y2: "100%"
  });
  sky.append(
    svgNode("stop", { offset: "0%", "stop-color": "#1f5550" }),
    svgNode("stop", { offset: "62%", "stop-color": "#4d8275" }),
    svgNode("stop", { offset: "100%", "stop-color": "#b9b58d" })
  );
  const grass = svgNode("linearGradient", {
    id: "oa-kick-grass",
    x1: "0%",
    y1: "0%",
    x2: "0%",
    y2: "100%"
  });
  grass.append(
    svgNode("stop", { offset: "0%", "stop-color": "#6f984d" }),
    svgNode("stop", { offset: "100%", "stop-color": "#315e2e" })
  );
  defs.append(sky, grass);

  const background = svgNode("g", { class: "oa-kick-background" });
  background.append(
    svgNode("rect", {
      x: 0,
      y: 0,
      width: scene.canvas.width,
      height: scene.world.floorY,
      fill: "url(#oa-kick-sky)"
    }),
    svgNode("path", {
      d: "M 0 296 Q 180 270 338 294 T 660 286 T 960 278 V 340 H 0 Z",
      fill: "#173d38",
      opacity: "0.62"
    }),
    svgNode("path", {
      d: "M 0 318 Q 210 294 420 315 T 960 304 V 356 H 0 Z",
      fill: "#142d2a",
      opacity: "0.52"
    }),
    svgNode("rect", {
      x: 0,
      y: 330,
      width: scene.canvas.width,
      height: scene.canvas.height - 330,
      fill: "url(#oa-kick-grass)"
    })
  );

  for (let index = 0; index < 10; index += 1) {
    const x0 = index * 96;
    background.appendChild(
      svgNode("path", {
        d: `M ${x0} ${scene.canvas.height} L ${430 + (x0 - 480) * 0.28} 330 L ${526 + (x0 - 480) * 0.28} 330 L ${x0 + 96} ${scene.canvas.height} Z`,
        fill: index % 2 === 0 ? "rgba(173,207,105,0.08)" : "rgba(15,58,25,0.08)"
      })
    );
  }

  background.append(
    svgNode("path", {
      d: `M 0 ${scene.world.floorY} H ${scene.canvas.width}`,
      stroke: "#f1eedc",
      "stroke-width": "4"
    }),
    svgNode("path", {
      d: "M 78 540 L 265 330 M 884 540 L 704 330",
      stroke: "rgba(241,238,220,0.58)",
      "stroke-width": "2.3",
      fill: "none"
    }),
    svgNode("ellipse", {
      cx: 480,
      cy: 330,
      rx: 88,
      ry: 21,
      fill: "none",
      stroke: "rgba(241,238,220,0.38)",
      "stroke-width": "2"
    })
  );

  const net = svgNode("g", { class: "oa-goal-net" });
  const netMesh = svgNode("g", { class: "oa-goal-mesh" });
  const netLines = [];
  net.append(
    svgNode("path", {
      d: "M 735 430 V 164 H 894 V 430 M 894 164 L 924 186 V 430 H 735",
      stroke: "#f5f1dd",
      "stroke-width": "6.5",
      fill: "none",
      "stroke-linejoin": "round"
    }),
    svgNode("path", {
      d: "M 735 164 L 763 188 H 924",
      stroke: "#ddd9c8",
      "stroke-width": "2.2",
      fill: "none"
    })
  );
  for (let x = 754; x <= 914; x += 20) {
    const topX = 735 + (x - 735) * 0.84;
    const node = svgNode("path", {
      d: `M ${topX.toFixed(1)} 166 L ${x} 430`,
      stroke: "rgba(245,241,221,0.56)",
      "stroke-width": "0.9",
      fill: "none"
    });
    netMesh.appendChild(node);
    netLines.push({ kind: "vertical", node, topX, bottomX: x });
  }
  for (let y = 190; y <= 416; y += 23) {
    const leftX = 735 + (y - 164) * 0.015;
    const rightX = 924 - (430 - y) * 0.035;
    const node = svgNode("path", {
      d: `M ${leftX.toFixed(1)} ${y} L ${rightX.toFixed(1)} ${y}`,
      stroke: "rgba(245,241,221,0.56)",
      "stroke-width": "0.9",
      fill: "none"
    });
    netMesh.appendChild(node);
    netLines.push({ kind: "horizontal", node, leftX, rightX, y });
  }
  net.appendChild(netMesh);
  background.appendChild(net);
  return { node: background, netLines };
}

function createKickActor(photoHref) {
  const group = svgNode("g", {
    class: "oa-kick-actor",
    opacity: "0"
  });
  if (photoHref) {
    group.appendChild(
      svgNode("image", {
        href: photoHref,
        x: "-157",
        y: "-75",
        width: "220",
        height: "147",
        preserveAspectRatio: "xMidYMid meet",
        decoding: "sync",
        style: "filter:drop-shadow(2px 5px 3px rgba(10,24,14,0.35))"
      })
    );
    return group;
  }
  group.append(
    svgNode("path", {
      d: "M -66 -102 L -25 -98 L -18 -18 Q -30 -7 -48 -12 Z",
      fill: "#f2efdf",
      stroke: "#20201d",
      "stroke-width": "2.2"
    }),
    svgNode("path", {
      d: "M -66 -28 L -20 -25 L -14 -12 L 18 -3 Q 42 4 50 18 Q 38 28 10 27 L -55 22 Q -76 14 -76 -4 Z",
      fill: "#d9d1bc",
      stroke: "#20201d",
      "stroke-width": "2.4",
      "stroke-linejoin": "round"
    }),
    svgNode("path", {
      d: "M -68 7 Q -20 18 48 13 L 52 22 Q 7 36 -58 24 Z",
      fill: "#252622",
      stroke: "#11120f",
      "stroke-width": "1.4"
    }),
    svgNode("path", {
      d: "M -48 -11 L 8 7 M -36 -19 L 18 3 M -24 -23 L 28 0",
      stroke: "#a34b32",
      "stroke-width": "2",
      fill: "none"
    }),
    svgNode("circle", { cx: -44, cy: -12, r: 2.1, fill: "#20201d" }),
    svgNode("circle", { cx: -29, cy: -16, r: 2.1, fill: "#20201d" }),
    svgNode("circle", { cx: -14, cy: -14, r: 2.1, fill: "#20201d" })
  );
  return group;
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
    x: "-50%",
    y: "-90%",
    width: "200%",
    height: "280%"
  });
  shadowFilter.appendChild(svgNode("feGaussianBlur", { stdDeviation: "4.8" }));
  defs.appendChild(shadowFilter);
  root.appendChild(defs);

  const kickBackground =
    mode === "kick" ? createKickBackground(scene, defs) : null;
  const background =
    kickBackground?.node ?? createLabBackground(scene);
  root.appendChild(background);

  const shadowGroup = svgNode("g", {
    class: "oa-rigid-shadows",
    filter: `url(#oa-rigid-shadow-${mode})`
  });
  const kickActor =
    mode === "kick" ? createKickActor(options.kickActorHref) : null;
  const kickDebris = mode === "kick"
    ? svgNode("g", { class: "oa-kick-debris", opacity: "0" })
    : null;
  if (kickDebris) {
    for (let index = 0; index < 11; index += 1) {
      kickDebris.appendChild(
        svgNode(index % 3 === 0 ? "path" : "circle", index % 3 === 0
          ? {
              d: "M -2 3 L 0 -4 L 2 3 Z",
              fill: index % 2 === 0 ? "#c5d78b" : "#466f38"
            }
          : {
              r: index % 2 === 0 ? 1.8 : 1.2,
              fill: index % 2 === 0 ? "#d6d0a2" : "#395f31"
            })
      );
    }
  }

  const bodyGroup = svgNode("g", { class: "oa-rigid-bodies" });
  const labelGroup = svgNode("g", {
    class: "oa-rigid-labels",
    "font-family": "ui-monospace, SFMono-Regular, Menlo, monospace",
    "font-size": "10",
    "font-weight": "700",
    "letter-spacing": "1.5",
    "text-anchor": "middle",
    fill: mode === "kick" ? "#f3efdf" : "#514a3f"
  });
  root.appendChild(shadowGroup);
  if (kickActor) root.appendChild(kickActor);
  if (kickDebris) root.appendChild(kickDebris);
  root.append(bodyGroup, labelGroup);
  svg.appendChild(root);

  const bodyNodes = [];
  const shadows = [];
  scene.bodies.forEach((body, index) => {
    const shadow = svgNode("ellipse", {
      cx: body.x,
      cy: scene.world.floorY - 1,
      rx: body.radius * 0.78,
      ry: Math.max(4, body.radius * 0.13),
      fill: mode === "kick" ? "rgba(8,24,12,0.48)" : "rgba(54,37,20,0.3)"
    });
    shadowGroup.appendChild(shadow);
    shadows.push(shadow);

    const bodyNode = createBall(
      body,
      defs,
      `oa-${mode}-${index}`,
      options.ballAssets?.[body.kind]
    );
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

  function renderKickDetails(frameIndex) {
    if (!kickActor || !kickDebris) return;
    const time = frameIndex / scene.timing.fps;
    const contactTime = scene.impulses[0]?.time ?? 0.62;
    if (time < 0.08 || time > 1.12) {
      kickActor.setAttribute("opacity", "0");
    } else {
      const approach = smoothStep((time - 0.08) / Math.max(0.01, contactTime - 0.08));
      const follow = clamp((time - contactTime) / 0.5, 0, 1);
      const x = 5 + approach * 85 + follow * 24;
      const y = 402 - Math.sin(approach * Math.PI) * 18 + follow * 5;
      const rotation = -17 + approach * 14 + follow * 7;
      const opacity = time <= contactTime + 0.24
        ? 1
        : 1 - (time - contactTime - 0.24) / 0.26;
      kickActor.setAttribute("opacity", clamp(opacity, 0, 1).toFixed(2));
      kickActor.setAttribute(
        "transform",
        `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rotation.toFixed(2)})`
      );
    }

    const debrisAge = time - contactTime;
    const debrisOpacity = debrisAge >= 0 && debrisAge <= 0.82
      ? Math.sin((debrisAge / 0.82) * Math.PI)
      : 0;
    kickDebris.setAttribute("opacity", debrisOpacity.toFixed(2));
    [...kickDebris.children].forEach((node, index) => {
      const spread = (index - 5) * 6.8;
      const lift = 28 + (index % 4) * 11;
      const x = 143 + spread * debrisAge * 2.2;
      const y = scene.world.floorY - lift * debrisAge + 54 * debrisAge * debrisAge;
      node.setAttribute(
        "transform",
        `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${(index * 31 + debrisAge * 180).toFixed(2)})`
      );
    });

    const ballX = frames[frameIndex].x[0];
    const ballY = frames[frameIndex].y[0];
    const insideGoal =
      clamp((ballX - 690) / 150, 0, 1) *
      clamp((944 - ballX) / 42, 0, 1) *
      clamp((ballY - 122) / 50, 0, 1) *
      clamp((454 - ballY) / 42, 0, 1);
    const pocket = smoothStep(insideGoal) * 31;
    for (const line of kickBackground.netLines) {
      if (line.kind === "vertical") {
        const mix = clamp((ballY - 166) / (430 - 166), 0, 1);
        const baseX = line.topX + (line.bottomX - line.topX) * mix;
        const falloff = Math.exp(-Math.pow((baseX - ballX) / 74, 2));
        const shift = pocket * falloff;
        line.node.setAttribute(
          "d",
          `M ${line.topX.toFixed(1)} 166 C ${line.topX.toFixed(1)} ${(ballY - 68).toFixed(1)} ${(baseX + shift).toFixed(1)} ${(ballY - 25).toFixed(1)} ${(baseX + shift).toFixed(1)} ${ballY.toFixed(1)} C ${(baseX + shift).toFixed(1)} ${(ballY + 28).toFixed(1)} ${line.bottomX.toFixed(1)} ${(ballY + 72).toFixed(1)} ${line.bottomX.toFixed(1)} 430`
        );
      } else {
        const falloff = Math.exp(-Math.pow((line.y - ballY) / 66, 2));
        const direction = line.y < ballY ? -1 : 1;
        const offsetY = direction * pocket * 0.22 * falloff;
        const middleX = (line.leftX + line.rightX) * 0.5;
        line.node.setAttribute(
          "d",
          `M ${line.leftX.toFixed(1)} ${line.y} Q ${(middleX + pocket * falloff).toFixed(1)} ${(line.y + offsetY).toFixed(1)} ${line.rightX.toFixed(1)} ${line.y}`
        );
      }
    }
  }

  function renderFrame(frameIndex) {
    const safeIndex = Math.max(0, Math.min(frames.length - 1, frameIndex));
    const frame = frames[safeIndex];
    const previous = frames[Math.max(0, safeIndex - 1)];
    const next = frames[Math.min(frames.length - 1, safeIndex + 1)];

    scene.bodies.forEach((body, index) => {
      const altitude = Math.max(
        0,
        scene.world.floorY - (frame.y[index] + body.radius)
      );
      const verticalTravel = Math.abs(next.y[index] - previous.y[index]);
      const contact = clamp(1 - altitude / 3.2, 0, 1);
      const squash = contact * clamp(verticalTravel * 0.012, 0, 0.085);
      bodyNodes[index].setAttribute(
        "transform",
        `translate(${frame.x[index].toFixed(2)} ${(frame.y[index] + squash * body.radius * 0.55).toFixed(2)}) rotate(${frame.angle[index].toFixed(2)}) scale(${(1 + squash).toFixed(4)} ${(1 - squash).toFixed(4)})`
      );

      const proximity = Math.max(0.06, 1 - altitude / 280);
      shadows[index].setAttribute("cx", frame.x[index].toFixed(2));
      shadows[index].setAttribute(
        "rx",
        (body.radius * (0.38 + proximity * 0.48 + squash * 0.8)).toFixed(2)
      );
      shadows[index].setAttribute(
        "ry",
        (Math.max(3.5, body.radius * (0.07 + proximity * 0.065))).toFixed(2)
      );
      shadows[index].setAttribute(
        "opacity",
        (0.16 + proximity * 0.84).toFixed(2)
      );
    });
    renderKickDetails(safeIndex);
  }

  return { renderFrame };
}
