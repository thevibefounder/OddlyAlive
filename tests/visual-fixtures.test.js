import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { simulateScene, validateScene } from "../src/index.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const baseline = JSON.parse(
  await readFile(resolve(root, "tests/fixtures/visual-baselines.json"), "utf8")
);
const expectedScenes = [
  "string-touch",
  "crystal-mobile",
  "ball-lab",
  "football-kick",
  "shoe-splash"
];

test("approved recipe motion fingerprints remain stable", async () => {
  assert.deepEqual(Object.keys(baseline.sceneFingerprints), expectedScenes);
  for (const name of expectedScenes) {
    const scene = validateScene(
      JSON.parse(
        await readFile(resolve(root, `examples/${name}/scene.json`), "utf8")
      )
    );
    const actual = simulateScene(scene, { includeFrames: false }).fingerprint;
    assert.equal(actual, baseline.sceneFingerprints[name], `${name} changed`);
  }
});

test("approved visual source bytes remain stable", async () => {
  assert.ok(Object.keys(baseline.fileSha256).length >= 14);
  for (const [path, expected] of Object.entries(baseline.fileSha256)) {
    const actual = createHash("sha256")
      .update(await readFile(resolve(root, path)))
      .digest("hex");
    assert.equal(actual, expected, `${path} changed`);
  }
});
