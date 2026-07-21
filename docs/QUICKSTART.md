# OddlyAlive quick start

OddlyAlive turns a small JSON scene into deterministic simulation frames and
renders them as procedural SVG. The same input produces the same output on
every run.

## Requirements

- Node.js 20 or newer
- npm
- A modern browser
- FFmpeg only if you want to rebuild the demo videos

## 1. Run the gallery

```bash
git clone https://github.com/thevibefounder/OddlyAlive.git
cd OddlyAlive
npm start
```

Open the local URL printed in the terminal. Choose any of the five recipes:

- `string-touch`
- `crystal-mobile`
- `ball-lab`
- `football-kick`
- `shoe-splash`

The gallery runs entirely on your machine. It does not require an API key,
cloud account, or hosted service.

## 2. Run one recipe directly

```bash
npx oddlyalive play string-touch
npx oddlyalive play football-kick
npx oddlyalive play shoe-splash
```

Use `npx oddlyalive list` to see every built-in recipe.

## 3. Create your own local project

```bash
npx oddlyalive new my-motion --preset crystal-mobile
cd my-motion
npm start
```

The generated folder contains a complete starter, including `scene.json`.
Change the physical parameters there and refresh the browser.

For example, a rigid ball is controlled by familiar material properties:

```json
{
  "radius": 38,
  "mass": 0.43,
  "restitution": 0.62,
  "friction": 0.58,
  "vx": 0,
  "vy": 0
}
```

The scene schema is at `schemas/scene.schema.json`. Point your editor at it for
autocomplete and validation.

## 4. Inspect or simulate without a browser

```bash
npx oddlyalive inspect scene.json
npx oddlyalive simulate scene.json --output result.json
```

`inspect` validates the scene and prints its structure. `simulate` runs the
fixed-step solver and writes deterministic frame data.

## 5. Use OddlyAlive as a library

```js
import {
  createStringTouchScene,
  simulateScene
} from "oddlyalive";

const scene = createStringTouchScene({
  payload: { text: "HELLO PHYSICS" }
});

const result = simulateScene(scene);
console.log(result.fingerprint);
console.log(result.diagnostics);
```

The renderers are exported too, so a browser project can mount the result into
an SVG element without recreating the physics.

## 6. Verify the repository

```bash
npm test
npm run check
```

The tests lock validation behavior and deterministic fingerprints across all
three solver families.

## Where to go next

- `docs/ARCHITECTURE.md` — solver, scene, and renderer boundaries
- `docs/ROADMAP.md` — planned object families
- `skills/oddlyalive/SKILL.md` — instructions for Codex and compatible agents
- `docs/DEMO-VIDEOS.md` — reproducible video build and review workflow
