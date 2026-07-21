# Contributing to OddlyAlive

Thanks for helping make deterministic object motion more useful and easier to
understand.

## Development setup

OddlyAlive requires Node.js 20 or newer. The demo-video pipeline additionally
requires FFmpeg.

```bash
npm ci
npm start
```

Run the complete repository gate before opening a pull request:

```bash
npm run check
```

For changes to the HyperFrames demo composition:

```bash
cd videos/oddlyalive-demos
npm ci
npm run check
```

## Project invariants

- AI may describe scene intent; deterministic simulation authors the motion.
- Simulations use fixed timesteps and may not depend on wall-clock time.
- Seeded material variation and diagnostic fingerprints must remain
  reproducible.
- Choose a physical model that fits the object family. Do not describe a
  recipe as physically universal.
- Keep solvers renderer-agnostic. SVG is the reference renderer, not the
  physics representation.
- Disclose whether example artwork is original, generated, licensed, or only
  used as reference.

## Visual fixture changes

`tests/fixtures/visual-baselines.json` protects every shipped recipe's
simulation fingerprint and the approved bytes that define its appearance.
When an intentional visual change has been reviewed in the browser, update the
fixture explicitly:

```bash
npm run fixtures:update
npm run test:visual
```

Include before/after screenshots or a short capture in the pull request. A
baseline update without visual evidence should not be merged.

## Pull requests

Keep changes focused, add or update tests for behavioral changes, and explain
which solver or renderer family is affected. Generated MP4 files belong in
release assets, not Git history.
