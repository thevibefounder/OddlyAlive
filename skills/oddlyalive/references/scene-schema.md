# Scene schema

## Required identity

- `version`: currently `1`
- `type`: `strand-field`, `rigid-balls`, or `surface-wave`
- `name`: human-readable scene label
- `seed`: finite number controlling material variation

## Canvas and timing

- `canvas.width`, `canvas.height`: logical render dimensions
- `timing.duration`: seconds, `0.1–60`
- `timing.fps`: sampled output frames per second
- `timing.substeps`: simulation steps per output frame
- `timing.preRoll`: seconds of pressure-free settling before frame zero

Keep `fps × substeps` fixed. The reference strand feel uses `60 × 4 = 240Hz`.

## Strand field

- `field.columns`, `field.rows`: particle grid dimensions
- `field.originX`, `field.originY`: first payload particle
- `field.spacingX`, `field.spacingY`: rest layout

Each column is an independent strand. Rows are connected vertically with length
and bend constraints.

## Material

- `gravity`: downward acceleration
- `linearDrag`, `quadraticDrag`: air resistance
- `lengthCompliance`: stretch softness
- `compressionCompliance`: compression softness
- `bendCompliance`: resistance across two links
- `maxStretch`: per-projection hard ratio

Avoid tuning all values simultaneously. Change gravity and drag for weight,
compliance for softness, then contact values for touch.

## Contact

- `radiusX`, `radiusY`: invisible elliptical fingertip
- `maxStaticGrip`: upper bound on simultaneous `STICK` strands
- `captureStartRow`, `captureEndRow`: eligible rows

The state machine is `FREE → STICK → SLIP → COOLDOWN`. Load and seeded friction
must cause release. Never add a release timestamp array.

## Gesture

`gesture.points` is a strictly time-ordered list:

```json
{ "time": 1.08, "x": 210, "y": 360, "pressure": 1 }
```

Use pressure only for normal force. Use trajectory and speed for direction and
energy. Begin and end at zero pressure.

## Payload and render

- `payload.text`, `fontFamily`, `fontSize`
- `render.background`, `ink`, `accent`, `filament`

These values belong to the reference SVG renderer. They must not change physics.

## Rigid balls

- `world`: gravity, air drag, floor and horizontal bounds, ground friction
- `bodies[]`: radius, mass, restitution, friction, velocity, angle and spin
- `impulses[]`: ordered time, target body, linear impulse and optional angular
  impulse

Use impulses for a kick or hit. Do not author the resulting arc.

## Surface wave

- `surface`: horizontal extent, rest height, sample count, speed, damping and
  object-to-surface coupling
- `world`: gravity, air drag, water drag and buoyancy
- `body`: one rigid prop with size, mass, pose, velocity and restitution

This is a stylized 1D surface recipe. Do not claim volumetric fluid behavior.
