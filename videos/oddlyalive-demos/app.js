import { gsap } from "gsap";
import {
  createCrystalRenderer,
  createRigidBallRenderer,
  createStringTouchScene,
  createSurfaceWaveRenderer,
  createSurfaceWaveScene,
  createRigidBallsScene,
  createSvgRenderer,
  simulateScene,
  validateScene
} from "../../src/index.js";

const FPS = 60;
const SCENE_DURATION = 6.4;
const PHOTO_ASSETS = {
  baseball: "./assets/images/photoreal/baseball.png",
  basketball: "./assets/images/photoreal/basketball.png",
  football: "./assets/images/photoreal/soccer-ball.png",
  sneaker: "./assets/images/photoreal/sneaker.png",
  crystal: "./assets/images/photoreal/crystal.png",
  kickingCleat: "./assets/images/photoreal/kicking-cleat.png",
  letterCharm: "./assets/images/photoreal/letter-charm-square.png"
};

const crystalScene = createStringTouchScene({
  name: "OddlyAlive — Crystal Mobile",
  seed: 17,
  field: {
    columns: 13,
    rows: 14,
    originX: 390,
    originY: 96,
    spacingX: 38,
    spacingY: 24
  },
  material: {
    gravity: 480,
    linearDrag: 0.76,
    quadraticDrag: 0.0026,
    lengthCompliance: 0.0000011,
    compressionCompliance: 0.00052,
    bendCompliance: 0.00072,
    maxStretch: 1.045
  },
  contact: {
    radiusX: 58,
    radiusY: 37,
    maxStaticGrip: 6,
    captureStartRow: 5,
    captureEndRow: 12
  },
  gesture: {
    type: "touch-path",
    points: [
      { time: 0.48, x: -60, y: 320, pressure: 0 },
      { time: 0.68, x: 250, y: 328, pressure: 0.72 },
      { time: 1.14, x: 430, y: 360, pressure: 1 },
      { time: 1.72, x: 665, y: 391, pressure: 0.98 },
      { time: 2.14, x: 900, y: 379, pressure: 0.94 },
      { time: 2.38, x: 934, y: 368, pressure: 0.88 },
      { time: 2.72, x: 770, y: 404, pressure: 0.86 },
      { time: 3.12, x: 590, y: 414, pressure: 0.65 },
      { time: 3.58, x: 390, y: 386, pressure: 0.32 },
      { time: 4.08, x: 155, y: 352, pressure: 0.04 },
      { time: 4.34, x: 30, y: 348, pressure: 0 }
    ]
  },
  payload: {
    text: "✦",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: 12,
    terminalMass: 6
  },
  render: {
    background: "#f4eedc",
    ink: "#292720",
    accent: "#cc5f4a",
    filament: "rgba(42, 40, 34, 0.45)"
  }
});

const kickScene = createRigidBallsScene({
  name: "OddlyAlive — Football Kick",
  seed: 27,
  world: {
    gravity: 920,
    airDrag: 0.08,
    floorY: 430,
    left: 70,
    right: 910,
    groundFriction: 2.4
  },
  bodies: [
    {
      id: "ball",
      kind: "football",
      label: "FOOTBALL",
      x: 180,
      y: 392,
      radius: 38,
      mass: 0.43,
      restitution: 0.62,
      friction: 0.58,
      vx: 0,
      vy: 0,
      angle: 0,
      angularVelocity: 0,
      color: "#f6f3e9"
    }
  ],
  impulses: [
    {
      time: 0.62,
      body: "ball",
      impulseX: 300,
      impulseY: -235,
      angularImpulse: 4.6
    }
  ]
});

const demos = [
  {
    id: "string-touch",
    scene: createStringTouchScene({
      render: { accent: "#8b351f" }
    }),
    makeRenderer: (svg, simulation) =>
      createSvgRenderer(svg, simulation, {
        glyphCharmHref: PHOTO_ASSETS.letterCharm
      })
  },
  {
    id: "crystal-mobile",
    scene: crystalScene,
    makeRenderer: (svg, simulation) =>
      createCrystalRenderer(svg, simulation, {
        pendantHref: PHOTO_ASSETS.crystal
      })
  },
  {
    id: "ball-lab",
    scene: createRigidBallsScene(),
    makeRenderer: (svg, simulation) =>
      createRigidBallRenderer(svg, simulation, {
        mode: "lab",
        ballAssets: PHOTO_ASSETS
      })
  },
  {
    id: "football-kick",
    scene: kickScene,
    makeRenderer: (svg, simulation) =>
      createRigidBallRenderer(svg, simulation, {
        mode: "kick",
        labels: false,
        ballAssets: PHOTO_ASSETS,
        kickActorHref: PHOTO_ASSETS.kickingCleat
      })
  },
  {
    id: "shoe-splash",
    scene: createSurfaceWaveScene(),
    makeRenderer: (svg, simulation) =>
      createSurfaceWaveRenderer(svg, simulation, {
        shoeHref: PHOTO_ASSETS.sneaker
      })
  }
];

window.__timelines = window.__timelines || {};
const timeline = gsap.timeline({ paused: true });
const diagnostics = [];
window.__timelines["oddlyalive-demos"] = timeline;

demos.forEach((demo, index) => {
  const scene = validateScene(demo.scene);
  const simulation = simulateScene(scene);
  const svg = document.querySelector(`#motion-${demo.id}`);
  const renderer = demo.makeRenderer(svg, simulation);
  const proxy = { frame: 0 };
  const lastFrame = simulation.frames.length - 1;
  const render = () => renderer.renderFrame(Math.round(proxy.frame));

  diagnostics.push({ id: demo.id, fingerprint: simulation.fingerprint });
  render();
  timeline.to(
    proxy,
    {
      frame: lastFrame,
      duration: SCENE_DURATION,
      ease: "none",
      onUpdate: render
    },
    index * SCENE_DURATION
  );
});

timeline.eventCallback("onUpdate", () => {
  const frame = Math.min(
    Math.round(timeline.time() * FPS),
    Math.round(timeline.duration() * FPS) - 1
  );
  document.documentElement.dataset.frame = String(frame);
});

window.__oddlyAliveDemo = {
  fps: FPS,
  duration: timeline.duration(),
  demos: diagnostics
};
