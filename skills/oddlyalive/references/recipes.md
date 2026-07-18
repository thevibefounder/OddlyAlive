# Built-in recipes

| Preset | Scene type | Change these first |
|---|---|---|
| `string-touch` | `strand-field` | payload text, touch path, drag, compliance |
| `crystal-mobile` | `strand-field` | terminal mass, cord length, touch path |
| `ball-lab` | `rigid-balls` | radius, mass, restitution, friction |
| `football-kick` | `rigid-balls` | impulse, mass, restitution, turf friction |
| `shoe-splash` | `surface-wave` | drop pose, coupling, damping, buoyancy |

Run any recipe:

```bash
npx oddlyalive play ball-lab
```

Create a local project:

```bash
npx oddlyalive new my-world --preset shoe-splash
cd my-world
npm start
```

The reference scenes use 60fps with four substeps. Keep that 240Hz solver rate
unless tests demonstrate that a different rate remains stable. Use `inspect` to
validate the scene and `simulate` to record its deterministic fingerprint.
