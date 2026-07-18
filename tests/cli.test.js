import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("the CLI creates a dependency-free starter", async () => {
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
  assert.equal(packageJson.scripts.start, "node ./scripts/serve.js");
  await rm(temporaryRoot, { recursive: true, force: true });
});
