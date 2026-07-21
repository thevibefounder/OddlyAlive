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

function createShoe(width, height, className = "oa-shoe") {
  const group = svgNode("g", { class: className });
  const left = -width * 0.5;
  const top = -height * 0.5;
  const upper = `M ${left + width * 0.03} ${top + height * 0.56}
    Q ${left + width * 0.08} ${top + height * 0.25} ${left + width * 0.28} ${top + height * 0.18}
    Q ${left + width * 0.43} ${top + height * 0.12} ${left + width * 0.55} ${top + height * 0.34}
    L ${left + width * 0.68} ${top + height * 0.5}
    Q ${left + width * 0.81} ${top + height * 0.57} ${left + width * 0.97} ${top + height * 0.58}
    Q ${left + width} ${top + height * 0.64} ${left + width * 0.98} ${top + height * 0.75}
    Q ${left + width * 0.66} ${top + height * 0.88} ${left + width * 0.22} ${top + height * 0.82}
    L ${left + width * 0.03} ${top + height * 0.7} Z`;

  group.append(
    svgNode("path", {
      d: upper,
      fill: "url(#oa-shoe-upper)",
      stroke: "#24231f",
      "stroke-width": "2.35",
      "stroke-linejoin": "round"
    }),
    svgNode("path", {
      d: `M ${left + width * 0.02} ${top + height * 0.68}
        Q ${left + width * 0.46} ${top + height * 0.9} ${left + width * 0.99} ${top + height * 0.7}
        L ${left + width * 0.99} ${top + height * 0.87}
        Q ${left + width * 0.53} ${top + height * 1.08} ${left + width * 0.02} ${top + height * 0.82} Z`,
      fill: "url(#oa-shoe-sole)",
      stroke: "#24231f",
      "stroke-width": "1.7",
      "stroke-linejoin": "round"
    }),
    svgNode("path", {
      d: `M ${left + width * 0.03} ${top + height * 0.73}
        Q ${left + width * 0.49} ${top + height * 0.94} ${left + width * 0.99} ${top + height * 0.76}`,
      fill: "none",
      stroke: "#fff9e9",
      "stroke-width": "2.4"
    }),
    svgNode("path", {
      d: `M ${left + width * 0.63} ${top + height * 0.49}
        Q ${left + width * 0.82} ${top + height * 0.54} ${left + width * 0.97} ${top + height * 0.59}
        Q ${left + width * 0.82} ${top + height * 0.66} ${left + width * 0.66} ${top + height * 0.69} Z`,
      fill: "rgba(255,255,255,0.38)",
      stroke: "rgba(36,35,31,0.42)",
      "stroke-width": "0.9"
    }),
    svgNode("path", {
      d: `M ${left + width * 0.1} ${top + height * 0.58}
        Q ${left + width * 0.14} ${top + height * 0.3} ${left + width * 0.28} ${top + height * 0.23}
        L ${left + width * 0.36} ${top + height * 0.69}
        Q ${left + width * 0.22} ${top + height * 0.73} ${left + width * 0.1} ${top + height * 0.65} Z`,
      fill: "rgba(196,202,198,0.48)",
      stroke: "#4f514b",
      "stroke-width": "1"
    }),
    svgNode("path", {
      d: `M ${left + width * 0.25} ${top + height * 0.23}
        Q ${left + width * 0.37} ${top + height * 0.15} ${left + width * 0.47} ${top + height * 0.31}
        L ${left + width * 0.54} ${top + height * 0.64}
        L ${left + width * 0.34} ${top + height * 0.7} Z`,
      fill: "#d9d8cf",
      stroke: "#42433e",
      "stroke-width": "1.1"
    }),
    svgNode("path", {
      d: `M ${left + width * 0.2} ${top + height * 0.25}
        Q ${left + width * 0.33} ${top + height * 0.08} ${left + width * 0.47} ${top + height * 0.26}
        Q ${left + width * 0.38} ${top + height * 0.38} ${left + width * 0.28} ${top + height * 0.31} Z`,
      fill: "#343632",
      stroke: "#20211e",
      "stroke-width": "1"
    }),
    svgNode("path", {
      d: `M ${left + width * 0.08} ${top + height * 0.61}
        Q ${left + width * 0.28} ${top + height * 0.69} ${left + width * 0.47} ${top + height * 0.67}
        M ${left + width * 0.67} ${top + height * 0.68}
        Q ${left + width * 0.83} ${top + height * 0.65} ${left + width * 0.95} ${top + height * 0.61}`,
      fill: "none",
      stroke: "#8b8171",
      "stroke-width": "0.9",
      "stroke-dasharray": "2.3 2.3"
    }),
    svgNode("path", {
      d: `M ${left + width * 0.67} ${top + height * 0.55}
        q ${width * 0.07} ${-height * 0.12} ${width * 0.14} 0
        q ${width * 0.05} ${height * 0.08} ${width * 0.1} ${-height * 0.02}`,
      fill: "none",
      stroke: "#ec6440",
      "stroke-width": "2.4",
      "stroke-linecap": "round"
    })
  );

  for (let index = 0; index < 6; index += 1) {
    const x = left + width * (0.29 + index * 0.054);
    const y = top + height * (0.34 + index * 0.053);
    group.append(
      svgNode("circle", {
        cx: x,
        cy: y,
        r: 2.15,
        fill: "#d9d2c4",
        stroke: "#272823",
        "stroke-width": "0.85"
      }),
      svgNode("path", {
        d: `M ${x - width * 0.035} ${y + height * 0.04} L ${x + width * 0.07} ${y - height * 0.045}`,
        stroke: index % 2 === 0 ? "#ec6440" : "#3e403b",
        "stroke-width": "1.55",
        "stroke-linecap": "round"
      })
    );
  }

  for (let index = 0; index < 7; index += 1) {
    const x = left + width * (0.13 + index * 0.105);
    group.appendChild(
      svgNode("path", {
        d: `M ${x} ${top + height * 0.88} l ${width * 0.035} ${height * 0.075}`,
        stroke: "#7b3425",
        "stroke-width": "1.2",
        "stroke-linecap": "round"
      })
    );
  }

  for (let index = 0; index < 8; index += 1) {
    const x = left + width * (0.72 + (index % 4) * 0.055);
    const y = top + height * (0.58 + Math.floor(index / 4) * 0.055);
    group.appendChild(
      svgNode("circle", {
        cx: x,
        cy: y,
        r: 0.9,
        fill: "#88857a",
        opacity: "0.48"
      })
    );
  }
  return group;
}

function createPhotoShoe(width, height, href, className = "oa-shoe") {
  const group = svgNode("g", { class: `${className} oa-shoe-photo` });
  group.appendChild(
    svgNode("image", {
      href,
      x: (-width * 0.58).toFixed(2),
      y: (-height * 0.8).toFixed(2),
      width: (width * 1.16).toFixed(2),
      height: (height * 1.6).toFixed(2),
      preserveAspectRatio: "xMidYMid meet",
      decoding: "sync"
    })
  );
  return group;
}

export function createSurfaceWaveRenderer(svg, simulation, options = {}) {
  const { scene, frames, diagnostics } = simulation;
  if (!frames) {
    throw new TypeError("The surface renderer requires simulation frames.");
  }

  const root = svgNode("g", { class: "oa-wave-scene" });
  const defs = svgNode("defs");
  const waterGradient = svgNode("linearGradient", {
    id: "oa-water-fill",
    x1: "0%",
    y1: "0%",
    x2: "0%",
    y2: "100%"
  });
  waterGradient.append(
    svgNode("stop", { offset: "0%", "stop-color": "#75cad8" }),
    svgNode("stop", { offset: "48%", "stop-color": "#3997ad" }),
    svgNode("stop", { offset: "100%", "stop-color": "#155a72" })
  );
  const upperGradient = svgNode("linearGradient", {
    id: "oa-shoe-upper",
    x1: "0%",
    y1: "0%",
    x2: "100%",
    y2: "100%"
  });
  upperGradient.append(
    svgNode("stop", { offset: "0%", "stop-color": "#fffdf3" }),
    svgNode("stop", { offset: "52%", "stop-color": "#e7e4d9" }),
    svgNode("stop", { offset: "100%", "stop-color": "#aaa99f" })
  );
  const soleGradient = svgNode("linearGradient", {
    id: "oa-shoe-sole",
    x1: "0%",
    y1: "0%",
    x2: "0%",
    y2: "100%"
  });
  soleGradient.append(
    svgNode("stop", { offset: "0%", "stop-color": "#f1704c" }),
    svgNode("stop", { offset: "100%", "stop-color": "#9d3827" })
  );
  const blur = svgNode("filter", {
    id: "oa-water-blur",
    x: "-40%",
    y: "-100%",
    width: "180%",
    height: "300%"
  });
  blur.appendChild(svgNode("feGaussianBlur", { stdDeviation: "5" }));
  const shoeShadow = svgNode("filter", {
    id: "oa-shoe-shadow",
    x: "-35%",
    y: "-45%",
    width: "180%",
    height: "210%"
  });
  shoeShadow.appendChild(
    svgNode("feDropShadow", {
      dx: "3",
      dy: "6",
      stdDeviation: "3.6",
      "flood-color": "#183b3f",
      "flood-opacity": "0.28"
    })
  );
  defs.append(
    waterGradient,
    upperGradient,
    soleGradient,
    blur,
    shoeShadow
  );
  root.appendChild(defs);

  const water = svgNode("path", {
    fill: "url(#oa-water-fill)",
    opacity: "0.82"
  });
  const caustics = svgNode("g", {
    class: "oa-water-caustics",
    opacity: "0.3"
  });
  for (let index = 0; index < 9; index += 1) {
    const y = scene.surface.restY + 50 + index * 22;
    const offset = (index % 3) * 23;
    caustics.appendChild(
      svgNode("path", {
        d: `M ${scene.surface.x + offset} ${y} q 42 -13 84 0 t 84 0 t 84 0 t 84 0 t 84 0 t 84 0 t 84 0`,
        fill: "none",
        stroke: index % 2 === 0
          ? "rgba(224,255,251,0.42)"
          : "rgba(9,76,99,0.25)",
        "stroke-width": index % 3 === 0 ? "2" : "1.1"
      })
    );
  }

  const reflection = options.shoeHref
    ? createPhotoShoe(
        scene.body.width,
        scene.body.height,
        options.shoeHref,
        "oa-shoe-reflection"
      )
    : createShoe(
        scene.body.width,
        scene.body.height,
        "oa-shoe-reflection"
      );
  reflection.setAttribute("opacity", "0");
  reflection.setAttribute("filter", "url(#oa-water-blur)");
  const waterShadow = svgNode("ellipse", {
    fill: "rgba(11,58,71,0.38)",
    filter: "url(#oa-water-blur)"
  });
  const shoe = options.shoeHref
    ? createPhotoShoe(scene.body.width, scene.body.height, options.shoeHref)
    : createShoe(scene.body.width, scene.body.height);
  shoe.setAttribute("filter", "url(#oa-shoe-shadow)");
  const foregroundWater = svgNode("path", {
    fill: "#2a91a8",
    opacity: "0.26"
  });
  const surface = svgNode("path", {
    fill: "none",
    stroke: "#145f72",
    "stroke-width": "3.2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  });
  const surfaceGlint = svgNode("path", {
    fill: "none",
    stroke: "rgba(235,255,250,0.78)",
    "stroke-width": "1.05",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    transform: "translate(0 -2)"
  });

  const foam = svgNode("g", { class: "oa-water-foam", opacity: "0" });
  for (let index = 0; index < 18; index += 1) {
    foam.appendChild(
      svgNode("ellipse", {
        rx: 3 + (index % 4) * 1.2,
        ry: 1.3 + (index % 3) * 0.55,
        fill: index % 4 === 0 ? "#f7fbef" : "rgba(226,248,240,0.84)",
        stroke: "rgba(24,103,118,0.28)",
        "stroke-width": "0.45"
      })
    );
  }

  const spray = svgNode("g", { class: "oa-water-spray", opacity: "0" });
  for (let index = 0; index < 26; index += 1) {
    spray.appendChild(
      svgNode(index % 5 === 0 ? "ellipse" : "circle", index % 5 === 0
        ? {
            rx: 1.4 + (index % 4) * 0.45,
            ry: 5.2 + (index % 3) * 1.6,
            fill: index % 2 === 0 ? "#dff8f3" : "#76cfda",
            opacity: "0.9"
          }
        : {
            r: 1.4 + (index % 4) * 0.7,
            fill: index % 3 === 0 ? "#f2fff9" : "#62bdd0",
            stroke: "rgba(24,103,118,0.24)",
            "stroke-width": "0.5"
          })
    );
  }

  root.append(
    water,
    caustics,
    reflection,
    waterShadow,
    shoe,
    foregroundWater,
    surfaceGlint,
    surface,
    foam,
    spray
  );
  svg.appendChild(root);

  const impactTime = diagnostics.firstImpactTime ?? 0.82;
  const impactFrameIndex = clamp(
    Math.round(impactTime * scene.timing.fps),
    0,
    frames.length - 1
  );
  const impactX = frames[impactFrameIndex].body.x;

  function renderFrame(frameIndex) {
    const safeIndex = Math.max(0, Math.min(frames.length - 1, frameIndex));
    const frame = frames[safeIndex];
    const time = safeIndex / scene.timing.fps;
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
    const waterPath =
      `${linePath} L ${(scene.surface.x + scene.surface.width).toFixed(2)} ${scene.canvas.height} L ${scene.surface.x} ${scene.canvas.height} Z`;
    surface.setAttribute("d", linePath);
    surfaceGlint.setAttribute("d", linePath);
    water.setAttribute("d", waterPath);
    foregroundWater.setAttribute("d", waterPath);

    shoe.setAttribute(
      "transform",
      `translate(${frame.body.x.toFixed(2)} ${frame.body.y.toFixed(2)}) rotate(${frame.body.angle.toFixed(2)})`
    );

    const distanceToWater = Math.abs(scene.surface.restY - frame.body.y);
    const reflectionOpacity = clamp(1 - distanceToWater / 250, 0, 1) * 0.18;
    reflection.setAttribute("opacity", reflectionOpacity.toFixed(3));
    reflection.setAttribute(
      "transform",
      `translate(${frame.body.x.toFixed(2)} ${(scene.surface.restY * 2 - frame.body.y + 10).toFixed(2)}) rotate(${(-frame.body.angle).toFixed(2)}) scale(1 -0.48)`
    );
    waterShadow.setAttribute("cx", frame.body.x.toFixed(2));
    waterShadow.setAttribute("cy", (scene.surface.restY + 5).toFixed(2));
    waterShadow.setAttribute(
      "rx",
      (scene.body.width * (0.2 + reflectionOpacity * 1.9)).toFixed(2)
    );
    waterShadow.setAttribute("ry", (4 + reflectionOpacity * 20).toFixed(2));
    waterShadow.setAttribute(
      "opacity",
      clamp(1 - distanceToWater / 220, 0, 0.62).toFixed(2)
    );

    const age = time - impactTime;
    const sprayOpacity =
      age >= 0 && age <= 1.18
        ? Math.sin((age / 1.18) * Math.PI)
        : 0;
    spray.setAttribute("opacity", sprayOpacity.toFixed(3));
    const sprayAge = clamp(age, 0, 1.18);
    [...spray.children].forEach((node, index) => {
      const side = index % 2 === 0 ? -1 : 1;
      const speedX = side * (28 + (index % 8) * 10.5);
      const speedY = -(54 + (index % 7) * 15);
      const x = impactX + speedX * sprayAge;
      const y =
        scene.surface.restY +
        speedY * sprayAge +
        150 * sprayAge * sprayAge;
      node.setAttribute(
        "transform",
        `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${(side * (18 + index * 7)).toFixed(2)})`
      );
    });

    const foamOpacity =
      age >= -0.05 && age <= 3.2
        ? clamp(1 - Math.max(0, age - 1.2) / 2, 0, 1)
        : 0;
    foam.setAttribute("opacity", foamOpacity.toFixed(3));
    const foamAge = clamp(age, 0, 3.2);
    [...foam.children].forEach((node, index) => {
      const side = index % 2 === 0 ? -1 : 1;
      const drift = side * (8 + (index % 6) * 6.5) * foamAge;
      const x = impactX + side * (index % 9) * 4.8 + drift;
      const sampleIndex = clamp(
        Math.round(((x - scene.surface.x) / scene.surface.width) * (frame.surface.length - 1)),
        0,
        frame.surface.length - 1
      );
      const y =
        scene.surface.restY +
        frame.surface[sampleIndex] -
        2 -
        (index % 3) * 0.8;
      node.setAttribute(
        "transform",
        `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${(index * 17).toFixed(2)})`
      );
    });
  }

  return { renderFrame };
}
