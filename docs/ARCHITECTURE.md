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
string-touch scene.json
        │
        ├── validate schema
        ├── create seeded material field
        ├── pre-roll manufacturing slack
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

The strand solver is not a universal physics engine. Future recipes should use:

- strand XPBD for strings, garlands, stems, and ropes;
- cloth XPBD for connected surfaces;
- rigid-body dynamics for balls and solid props;
- joints and springs for mobiles, rackets, and mechanisms.

The prompt compiler selects a recipe. It must not force unrelated objects through
the strand model simply because that solver already exists.
