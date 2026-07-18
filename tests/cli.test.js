import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("the CLI creates a dependency-free strand starter", async () => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "oddlyalive-"));
  const target = join(temporaryRoot, "my-motion");
  const result = spawnSync(
    process.execPath,
    [
      "./bin/oddlyalive.js",
      "new",
      target,
      "--text",
      "HELLO MOTION"
    ],
    { cwd: new URL("..", import.meta.url), encoding: "utf8" }
  );

  assert.equal(result.status, 0, result.stderr);
  const scene = JSON.parse(
    await readFile(join(target, "examples/string-touch/scene.json"), "utf8")
  );
  const packageJson = JSON.parse(
    await readFile(join(target, "package.json"), "utf8")
  );
  assert.match(scene.payload.text, /HELLO MOTION/);
  assert.equal(
    packageJson.scripts.start,
    "node ./scripts/serve.js --path /examples/string-touch/"
  );
  await rm(temporaryRoot, { recursive: true, force: true });
});

test("the CLI can create every built-in recipe", async () => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "oddlyalive-recipes-"));
  const presets = [
    "string-touch",
    "crystal-mobile",
    "ball-lab",
    "football-kick",
    "shoe-splash"
  ];
  for (const preset of presets) {
    const target = join(temporaryRoot, preset);
    const result = spawnSync(
      process.execPath,
      ["./bin/oddlyalive.js", "new", target, "--preset", preset],
      { cwd: new URL("..", import.meta.url), encoding: "utf8" }
    );
    assert.equal(result.status, 0, `${preset}: ${result.stderr}`);
    const scene = JSON.parse(
      await readFile(join(target, `examples/${preset}/scene.json`), "utf8")
    );
    assert.equal(typeof scene.type, "string");
    await readFile(join(target, "examples/shared/player.js"), "utf8");
    await readFile(join(target, "schemas/scene.schema.json"), "utf8");
    const html = await readFile(
      join(target, `examples/${preset}/index.html`),
      "utf8"
    );
    assert.doesNotMatch(
      html,
      /href="\.\.\/(string-touch|crystal-mobile|ball-lab|football-kick|shoe-splash)\//
    );
  }
  await rm(temporaryRoot, { recursive: true, force: true });
});

test("the CLI lists the complete recipe gallery", () => {
  const result = spawnSync(
    process.execPath,
    ["./bin/oddlyalive.js", "list"],
    { cwd: new URL("..", import.meta.url), encoding: "utf8" }
  );
  assert.equal(result.status, 0, result.stderr);
  for (const preset of [
    "string-touch",
    "crystal-mobile",
    "ball-lab",
    "football-kick",
    "shoe-splash"
  ]) {
    assert.match(result.stdout, new RegExp(preset));
  }
});
