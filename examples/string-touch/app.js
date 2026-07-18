import {
  createSvgRenderer,
  sampleGesture,
  simulateScene,
  validateScene
} from "../../src/index.js";

const loading = document.querySelector("#loading");
const svg = document.querySelector("#motion");
const toggle = document.querySelector("#toggle");
const scrubber = document.querySelector("#scrubber");
const debugButton = document.querySelector("#debug");
const grip = document.querySelector("#grip");
const fingerprint = document.querySelector("#fingerprint");

await new Promise((resolve) => requestAnimationFrame(resolve));
const rawScene = await fetch("./scene.json").then((response) => response.json());
const scene = validateScene(rawScene);
const simulation = simulateScene(scene);
const renderer = createSvgRenderer(svg, simulation);
const durationMs = scene.timing.duration * 1000;
const lastFrame = simulation.frames.length - 1;

scrubber.max = String(lastFrame);
grip.textContent = `${simulation.diagnostics.observedMaxStaticGrip}/${scene.contact.maxStaticGrip}`;
fingerprint.textContent = simulation.fingerprint;
loading.remove();

let playing = true;
let debug = false;
let origin = performance.now();
let pausedFrame = 0;

function paint(frame) {
  const time = frame / scene.timing.fps;
  renderer.renderFrame(frame, sampleGesture(scene.gesture.points, time));
  scrubber.value = String(frame);
}

function animate(now) {
  if (playing) {
    const elapsed = (now - origin) % durationMs;
    const frame = Math.min(
      lastFrame,
      Math.round((elapsed / 1000) * scene.timing.fps)
    );
    pausedFrame = frame;
    paint(frame);
  }
  requestAnimationFrame(animate);
}

toggle.addEventListener("click", () => {
  playing = !playing;
  toggle.textContent = playing ? "PAUSE" : "PLAY";
  if (playing) {
    origin =
      performance.now() -
      (pausedFrame / scene.timing.fps) * 1000;
  }
});

scrubber.addEventListener("input", () => {
  playing = false;
  toggle.textContent = "PLAY";
  pausedFrame = Number(scrubber.value);
  paint(pausedFrame);
});

debugButton.addEventListener("click", () => {
  debug = !debug;
  renderer.setDebug(debug);
  debugButton.textContent = debug ? "HIDE TOUCH" : "SHOW TOUCH";
});

paint(0);
requestAnimationFrame(animate);
