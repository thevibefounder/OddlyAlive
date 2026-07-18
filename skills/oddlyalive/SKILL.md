---
name: oddlyalive
description: Create, modify, simulate, and validate deterministic physics-driven object animations with the OddlyAlive CLI and scene recipes. Use when a user asks to make an object feel naturally touched, tugged, plucked, kicked, dropped, shaken, or otherwise animated through physical behavior; to build a strand-field animation; or to turn a prompt into an OddlyAlive scene, demo, or render-ready project.
---

# OddlyAlive

Use AI to author physical intent. Use the deterministic solver to author motion.

## Route the request

1. Identify the object family and interaction.
2. Route to the closest implemented recipe:
   - `string-touch` for strings, garlands, hanging text, and flexible strands;
   - `crystal-mobile` for weighted pendants and independent hanging objects;
   - `ball-lab` for round bodies with different bounce/friction materials;
   - `football-kick` for a timed hit, kick, or throw impulse;
   - `shoe-splash` for a single prop disturbing a stylized water surface.
3. Do not disguise unsupported rigid-body or cloth behavior as a strand scene.
   State that the recipe is not implemented or add the correct solver first.
4. Read [references/scene-schema.md](references/scene-schema.md) when creating or
   changing scene JSON.
5. Read [references/object-models.md](references/object-models.md) when deciding
   which physical model a new object needs.

## Start from a recipe

Create a starter:

```bash
npx oddlyalive list
npx oddlyalive new my-motion --preset football-kick
```

Read [references/recipes.md](references/recipes.md) before selecting parameters.
Edit the generated `scene.json`. Preserve a fixed simulation rate and seed.
For strand touch, express contact as a time-ordered pressure path and never
author per-strand release timestamps.

Validate before visual review:

```bash
npx oddlyalive inspect examples/football-kick/scene.json
npx oddlyalive simulate examples/football-kick/scene.json
npm test
```

Run the reference demo:

```bash
npx oddlyalive play
```

Inspect the opening, first contact/impact, maximum displacement, rebounds, and
final settle. Check the solver-specific diagnostics and confirm that no renderer
mutates simulation state.

## Generate video

Keep OddlyAlive as the simulation source. When MP4 or motion-graphic delivery is
requested, use the environment's HyperFrames workflow to drive the playhead and
render deterministic frames. Do not replace simulation with wall-clock animation.

## Extend the engine

Add a new recipe only when its physical model is explicit. Keep the solver
renderer-neutral, expose diagnostics, seed every material variation, add a
determinism test, and ship one visually inspectable example.
