# OddlyAlive agent contract

Read the TheVibeFounder workspace's `docs/SESSION-PROTOCOL.md` before changing
this repository. Log every working session in
`docs/AGENT_SESSIONS.md`, run `npm run check`, and commit with the agent handle.

## Product invariants

- AI may author scene intent; deterministic simulation authors the motion.
- Use a fixed timestep. Never make simulation results depend on wall-clock time.
- Preserve seeded material variation and reproducible diagnostics.
- Do not market a recipe as physically universal. Select the correct physical
  model for each object family.
- Keep the engine renderer-agnostic. SVG is the reference renderer, not the
  physics representation.
- Examples must disclose whether artwork is original, licensed, or referenced.
