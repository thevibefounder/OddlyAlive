# Demo videos

The demo package proves the current alpha with the real OddlyAlive solvers.
There are no hand-authored motion keyframes or stock clips. Locally generated,
high-resolution cutouts provide material appearance; SVG strings, shadows,
nets, water, and deformation remain driven by deterministic simulation.

## Outputs

| File | Duration | Purpose |
| --- | ---: | --- |
| `videos/oddlyalive-demos/renders/oddlyalive-demos-overview.mp4` | 32.0s | Five-recipe reel |
| `videos/oddlyalive-demos/renders/demos/01-string-touch.mp4` | 6.4s | Strand contact and peel |
| `videos/oddlyalive-demos/renders/demos/02-crystal-mobile.mp4` | 6.4s | Weighted hanging payloads |
| `videos/oddlyalive-demos/renders/demos/03-ball-lab.mp4` | 6.4s | Material response comparison |
| `videos/oddlyalive-demos/renders/demos/04-football-kick.mp4` | 6.4s | Timed impulse and spin |
| `videos/oddlyalive-demos/renders/demos/05-shoe-splash.mp4` | 6.4s | Body-to-surface coupling |
| `docs/assets/oddlyalive-string-touch.gif` | 6.4s | Lightweight README preview |

The MP4s are intentionally ignored by Git. Review them locally first; if
approved, upload them as release assets or to the chosen media host instead of
inflating the source repository.

## One-command rebuild

Install Node.js 20+ and FFmpeg, then run:

```bash
npm run demos:render
```

That command:

1. installs the pinned demo-project dependencies;
2. bundles the current OddlyAlive engine for a network-free browser render;
3. runs HyperFrames lint, runtime, layout, motion, and contrast checks;
4. renders the 1920×1080, 60 fps master;
5. cuts five frame-accurate 6.4-second MP4s;
6. rebuilds the README GIF; and
7. decodes and verifies every MP4.

Set `HF_WORKERS=1` on a low-memory machine:

```bash
HF_WORKERS=1 npm run demos:render
```

## Preview without rendering

```bash
cd videos/oddlyalive-demos
npm ci
npm run build:bundle
npm run dev
```

The preview is seek-safe: scrubbing to any time paints the corresponding
precomputed simulation frame. It does not use `requestAnimationFrame`,
`performance.now()`, network fetches, or random values.

## Verify existing outputs

```bash
npm run demos:verify
```

The verifier checks:

- H.264 video with no audio stream;
- 1920×1080 frame size;
- 60 fps;
- yuv420p pixel format;
- 32.0 seconds / 1,920 frames for the reel;
- 6.4 seconds / 384 frames for each recipe; and
- a complete FFmpeg decode with zero reported errors.

It also prints a SHA-256 checksum for every file so a reviewed master can be
identified exactly.

## Review-before-publish protocol

Do not push or publish merely because the build passed.

1. Watch the full reel at normal speed.
2. Watch every recipe clip twice: once for design, once for physical behavior.
3. Check the first and last frame of each clip.
4. Run `npm run demos:verify`.
5. Review `git diff` and confirm generated MP4s remain ignored.
6. Only after explicit approval, commit the source/docs/GIF.
7. Upload approved MP4s as release assets separately.
8. Update GitHub or npm only as a distinct, confirmed action.

## Design contract

- 1920×1080 landscape, 60 fps
- 6.4 seconds per recipe
- silent by design
- paper, ink, and coral OddlyAlive identity
- photographic object cutouts with procedural SVG physics and deformation
- hard cuts between recipes so transitions never hide the physics
- fixed-step solvers at four 240Hz substeps per displayed frame

The composition source and exact scene sequence live in
`videos/oddlyalive-demos/`.
