# OddlyAlive

**Make anything feel alive.**

OddlyAlive is an open-source toolkit for natural, deterministic object motion.
Describe the physical setup once; the solver produces every frame.

The first alpha extracts the unusually tactile strand interaction developed for
TheVibeFounder’s city-postcard series: a pressure-bearing invisible touch catches
locally, sticks through static friction, slips under load, peels object by object,
and settles without an authored release timeline.

```bash
npx oddlyalive play string-touch
```

No runtime dependencies. No cloud account. No animation keyframes.

## Try the repository

```bash
npm start
```

Then open the printed local URL. The included SVG demo is simulated at a fixed
240Hz and rendered at 60fps.

Create a self-contained starter:

```bash
npx oddlyalive new my-motion \
  --preset string-touch \
  --text "MAKE IT FEEL ALIVE"

cd my-motion
npm start
```

Inspect or simulate any scene without opening a browser:

```bash
npx oddlyalive inspect scene.json
npx oddlyalive simulate scene.json --output result.json
```

`schemas/scene.schema.json` provides editor autocomplete and catches malformed
recipes before simulation.

## Why this exists

Most prompt-to-animation systems ask a model to guess transforms frame by frame.
OddlyAlive uses the model only to select and configure physical intent:

```text
prompt → scene recipe → constraints + gesture → simulation → renderer
```

The same scene gives the same frames on every run. That makes the result
seek-safe, testable, renderable in the browser, and suitable for video pipelines.

## Alpha scope

Available now:

- XPBD strand fields with length, bend, and anchor constraints
- `FREE → STICK → SLIP → COOLDOWN` friction per strand
- Elliptical touch capsule with pressure
- Deterministic seeded material variation
- SVG reference renderer
- JSON scene schema and diagnostics
- One-command browser demo and project generator
- Bundled Codex skill

Planned object families:

- rigid balls with kicks, bounce, rolling friction, and spin
- articulated flowers and hanging mobiles
- cloth, banners, and garlands
- rigid props connected by hinges and springs
- a prompt compiler for local models and cloud agents

## Library usage

```js
import {
  createStringTouchScene,
  simulateScene
} from "oddlyalive";

const scene = createStringTouchScene({
  payload: { text: "HELLO PHYSICS" }
});

const result = simulateScene(scene);
console.log(result.diagnostics);
```

See `examples/string-touch/` for the browser integration and
`docs/ARCHITECTURE.md` for the separation between AI, physics, and rendering.

## Status

`0.1.0-alpha.1` is a focused technical preview. The strand solver is real; the
broader “animate any object” prompt compiler remains a roadmap, not a release
claim.

## License

MIT. Example artwork is original unless its local provenance file says otherwise.
