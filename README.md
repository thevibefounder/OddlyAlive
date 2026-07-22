# OddlyAlive

**Make anything feel alive.**

[Project page](https://thevibefounder.com/os/oddlyalive/) ·
[Source](https://github.com/thevibefounder/OddlyAlive)

OddlyAlive is an open-source toolkit for natural, deterministic object motion.
Describe the physical setup once; the solver produces every frame.

The toolkit began with the tactile strand interaction developed for
TheVibeFounder’s city-postcard series. It now ships three small, inspectable
solver families: flexible strands, rigid balls, and a rigid prop coupled to a
damped wave surface.

![OddlyAlive string-touch recipe](docs/assets/oddlyalive-string-touch.gif)

No runtime dependencies. No cloud account. No animation keyframes.

## Start in 60 seconds

```bash
npx oddlyalive play
```

Open the printed local URL and choose a recipe. Nothing is uploaded; the
simulation and SVG rendering run locally.

For the full install, customization, and scene-authoring path, read
[`docs/QUICKSTART.md`](docs/QUICKSTART.md).

## Try the repository

```bash
git clone https://github.com/thevibefounder/OddlyAlive.git
cd OddlyAlive
npm start
```

Then open the printed local URL. The gallery contains five SVG-rendered physics
examples with local high-resolution object cutouts, simulated at a fixed 240Hz
and rendered at 60fps.

## Built-in recipes

| Recipe | Physical idea | Good for |
|---|---|---|
| `string-touch` | XPBD strands + pressure/friction contact | strings, charms, garlands, hanging type |
| `crystal-mobile` | weighted terminal masses on strands | crystals, pendants, mobiles |
| `ball-lab` | rigid circles + material response | balls, marbles, loose round props |
| `football-kick` | one impulse + gravity/spin/friction | kicks, hits, throws |
| `shoe-splash` | rigid prop + damped 1D surface | graphic splashes, floating props, ripples |

```bash
npx oddlyalive list
npx oddlyalive play crystal-mobile
npx oddlyalive play football-kick
```

Create a self-contained starter:

```bash
npx oddlyalive new my-motion \
  --preset football-kick

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
- Deterministic circle collisions, restitution, friction, spin and impulses
- Weighted strand payloads for pendants and crystals
- Damped 1D wave surface coupled to a falling rigid prop
- Five one-command browser demos and project presets
- Bundled Codex skill

Planned object families:

- articulated walking bodies with joints and inverse kinematics
- articulated flowers, rackets, and hinged mobiles
- cloth, banners, and garlands
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

See `examples/` for the complete browser gallery and
`docs/ARCHITECTURE.md` for the separation between AI, physics, and rendering.
Contributions are welcome; start with [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Rebuild the demo videos

With Node 20+ and FFmpeg installed:

```bash
npm run demos:render
npm run demos:verify
```

This produces a 32-second reel, five 6.4-second recipe clips, and the README
GIF from the same deterministic simulations. See
[`docs/DEMO-VIDEOS.md`](docs/DEMO-VIDEOS.md) for output paths, preview commands,
and the review-before-publish protocol.

## Status

`0.2.0-alpha.2` is a focused technical preview. The five listed recipes are
real and deterministic; full fluid dynamics, cloth, articulated walking, and
the broader “animate any object” prompt compiler remain roadmap items.

## License

MIT. Example artwork is original or generated specifically for this project;
see [`assets/photoreal/PROVENANCE.md`](assets/photoreal/PROVENANCE.md).
