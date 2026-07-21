import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { simulateScene, validateScene } from "../src/index.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sceneNames = [
  "string-touch",
  "crystal-mobile",
  "ball-lab",
  "football-kick",
  "shoe-splash"
];
const visualFiles = [
  "assets/photoreal/baseball.png",
  "assets/photoreal/basketball.png",
  "assets/photoreal/crystal.png",
  "assets/photoreal/kicking-cleat.png",
  "assets/photoreal/letter-charm-square.png",
  "assets/photoreal/letter-charm.png",
  "assets/photoreal/sneaker.png",
  "assets/photoreal/soccer-ball.png",
  "src/crystal-renderer.js",
  "src/rigid-renderer.js",
  "src/svg-renderer.js",
  "src/wave-renderer.js",
  "videos/oddlyalive-demos/app.js",
  "videos/oddlyalive-demos/index.html"
];

const sceneFingerprints = {};
for (const name of sceneNames) {
  const scene = validateScene(
    JSON.parse(await readFile(resolve(root, `examples/${name}/scene.json`), "utf8"))
  );
  sceneFingerprints[name] = simulateScene(scene, {
    includeFrames: false
  }).fingerprint;
}

const fileSha256 = {};
for (const path of visualFiles) {
  fileSha256[path] = createHash("sha256")
    .update(await readFile(resolve(root, path)))
    .digest("hex");
}

const output = {
  version: 1,
  description:
    "Approved deterministic motion and visual-source baselines. Update only after visual review.",
  sceneFingerprints,
  fileSha256
};

const outputPath = resolve(root, "tests/fixtures/visual-baselines.json");
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Updated ${outputPath}`);
