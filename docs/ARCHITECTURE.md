# Architecture

OddlyAlive separates creative intent from physical truth.

## Layers

1. **Prompt compiler** — converts language into a validated scene recipe. This
   layer may run through Codex, another cloud model, or a local model.
2. **Scene schema** — declares bodies, constraints, material ranges, gestures,
   duration, frame rate, and seed.
3. **Physics recipes** — select a solver appropriate to the object family.
4. **Simulation** — advances at a fixed timestep and emits renderer-neutral
   transforms plus diagnostics.
5. **Render adapters** — map transforms to SVG, Canvas, WebGL, HyperFrames, or a
   frame sequence.

## Alpha data flow

```text
scene.json
        │
        ├── validate by scene type
        ├── select strand / rigid / wave solver
        ├── simulate at 240Hz
        └── sample states at output fps
                  │
                  ├── SVG browser renderer
                  └── JSON diagnostics
```

## Determinism contract

- Advance simulation using `1 / (fps × substeps)`.
- Sample an authored gesture by simulation time, never wall-clock time.
- Seed all material variation from the scene.
- Store live state in `Float64Array`.
- Reset constraint lambdas at each substep.
- Hash rounded output state in tests.
- A renderer may interpolate states but must never modify simulation state.

## Object-family boundary

No individual solver is a universal physics engine. Recipes currently use:

- strand XPBD for strings, garlands, stems, and ropes;
- weighted strand terminals for crystals and pendants;
- rigid-circle dynamics for balls and kickable round props;
- a damped 1D surface coupled to one rigid prop for stylized water ripples.

Future recipes should use cloth XPBD for connected surfaces and articulated
joints plus inverse kinematics for walking bodies, rackets, flowers, and
mechanisms.

The prompt compiler selects a recipe. It must not force unrelated objects through
the strand model simply because that solver already exists.
