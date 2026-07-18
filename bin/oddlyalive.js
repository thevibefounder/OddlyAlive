#!/usr/bin/env node

import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync
} from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { simulateScene, validateScene } from "../src/index.js";
import { startServer } from "../scripts/serve.js";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const commands = new Set(["help", "inspect", "list", "new", "play", "simulate"]);

function flagValue(args, flag, fallback = undefined) {
  const index = args.indexOf(flag);
  return index === -1 ? fallback : args[index + 1];
}

function printHelp() {
  console.log(`OddlyAlive — Make anything feel alive.

Usage:
  oddlyalive play [string-touch] [--port 4173] [--no-open]
  oddlyalive new <directory> [--preset string-touch] [--text "HELLO"]
  oddlyalive inspect <scene.json>
  oddlyalive simulate <scene.json> [--output result.json]
  oddlyalive list

Start here:
  npx oddlyalive play string-touch
`);
}

function loadScene(path) {
  if (!path) throw new TypeError("A scene.json path is required.");
  return validateScene(JSON.parse(readFileSync(resolve(path), "utf8")));
}

function diagnosticSummary(result) {
  const { scene, diagnostics, fingerprint } = result;
  return {
    ok: true,
    name: scene.name,
    type: scene.type,
    seed: scene.seed,
    duration: scene.timing.duration,
    fps: scene.timing.fps,
    simulationHz: scene.timing.fps * scene.timing.substeps,
    frameCount: Math.round(scene.timing.duration * scene.timing.fps) + 1,
    particleCount: scene.field.columns * scene.field.rows,
    configuredStaticGripCap: scene.contact.maxStaticGrip,
    observedMaxStaticGrip: diagnostics.observedMaxStaticGrip,
    observedMaxCombinedContact: diagnostics.observedMaxCombinedContact,
    firstGripTime: diagnostics.firstGripTime,
    lastGripTime: diagnostics.lastGripTime,
    observedMaxStretch: diagnostics.observedMaxStretch,
    maxStretchPerProjection: scene.material.maxStretch,
    fingerprint
  };
}

function createStarter(args) {
  const targetArgument = args.find((argument) => !argument.startsWith("-"));
  if (!targetArgument) {
    throw new TypeError("Provide a directory name: oddlyalive new my-motion");
  }
  const target = resolve(targetArgument);
  const preset = flagValue(args, "--preset", "string-touch");
  const text = flagValue(args, "--text", "MAKE ANYTHING FEEL ALIVE");
  if (preset !== "string-touch") {
    throw new RangeError(`Unknown preset: ${preset}`);
  }
  if (existsSync(target) && readdirSync(target).length > 0) {
    throw new Error(`Target directory is not empty: ${target}`);
  }

  mkdirSync(target, { recursive: true });
  cpSync(join(packageRoot, "src"), join(target, "src"), { recursive: true });
  cpSync(
    join(packageRoot, "examples", preset),
    join(target, "examples", preset),
    { recursive: true }
  );
  cpSync(join(packageRoot, "scripts"), join(target, "scripts"), {
    recursive: true
  });

  const scenePath = join(target, "examples", preset, "scene.json");
  const scene = JSON.parse(readFileSync(scenePath, "utf8"));
  scene.name = `${text} — OddlyAlive`;
  scene.payload.text = `${text}  •  `;
  writeFileSync(scenePath, `${JSON.stringify(scene, null, 2)}\n`);

  const packageName = basename(target)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  writeFileSync(
    join(target, "package.json"),
    `${JSON.stringify(
      {
        name: packageName || "oddlyalive-motion",
        private: true,
        type: "module",
        scripts: {
          start: "node ./scripts/serve.js"
        }
      },
      null,
      2
    )}\n`
  );
  writeFileSync(
    join(target, "README.md"),
    `# ${text}\n\nGenerated with OddlyAlive.\n\n\`\`\`bash\nnpm start\n\`\`\`\n\nEdit \`examples/string-touch/scene.json\` to change the material, gesture, payload, or timing.\n`
  );

  console.log(`Created ${target}`);
  console.log(`Next:\n  cd ${target}\n  npm start`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] ?? "help";
  if (!commands.has(command)) {
    throw new RangeError(`Unknown command: ${command}`);
  }

  if (command === "help") {
    printHelp();
    return;
  }

  if (command === "list") {
    console.log("Available recipes:\n  string-touch  deterministic XPBD strand field");
    return;
  }

  if (command === "play") {
    const preset =
      args[1]?.startsWith("-") ? "string-touch" : args[1] ?? "string-touch";
    if (preset !== "string-touch") {
      throw new RangeError(`Unknown preset: ${preset}`);
    }
    const port = Number(flagValue(args, "--port", 4173));
    await startServer({
      root: packageRoot,
      port,
      pathname: `/examples/${preset}/`,
      shouldOpen: !args.includes("--no-open")
    });
    return;
  }

  if (command === "new") {
    createStarter(args.slice(1));
    return;
  }

  if (command === "inspect") {
    const scene = loadScene(args[1]);
    console.log(
      JSON.stringify(
        {
          ok: true,
          name: scene.name,
          version: scene.version,
          type: scene.type,
          canvas: scene.canvas,
          timing: scene.timing,
          particles: scene.field.columns * scene.field.rows,
          gesturePoints: scene.gesture.points.length,
          configuredStaticGripCap: scene.contact.maxStaticGrip
        },
        null,
        2
      )
    );
    return;
  }

  if (command === "simulate") {
    const scene = loadScene(args[1]);
    const result = simulateScene(scene, { includeFrames: false });
    const summary = diagnosticSummary(result);
    const output = flagValue(args, "--output");
    if (output) {
      writeFileSync(resolve(output), `${JSON.stringify(summary, null, 2)}\n`);
      console.log(`Wrote ${resolve(output)}`);
    } else {
      console.log(JSON.stringify(summary, null, 2));
    }
  }
}

main().catch((error) => {
  console.error(`OddlyAlive: ${error.message}`);
  process.exitCode = 1;
});
