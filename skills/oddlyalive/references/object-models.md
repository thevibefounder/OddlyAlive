# Object model selection

| Requested object | Start with | Required behavior |
|---|---|---|
| strings, garlands, necklaces | strand XPBD | length, bend, friction, peel |
| crystal pendants, simple hanging charms | weighted strands | terminal mass, lag, overswing |
| flower stems | articulated strands (planned) | bend limits, attached petals |
| flags, curtains, fabric | cloth XPBD | surface shear and collision |
| balls | rigid circles | collision, restitution, friction, spin |
| blocks, rackets, signs | rigid shapes + joints (planned) | angular inertia, hinges, springs |
| stylized water ripple | damped 1D wave | surface propagation, drag, buoyancy |
| full water, smoke, sand | particles or fluid model (planned) | neighborhood interaction |
| walking | articulated skeleton + IK (planned) | contacts, balance, joint limits |

Map interaction language to physics:

- `touch`, `drag`: kinematic contact shape plus pressure
- `pluck`: short static capture followed by rapid pressure loss
- `kick`, `hit`: impulse at a contact point
- `drop`: gravity with an initial pose
- `shake`: moving or rotating kinematic support
- `throw`: initial linear and angular velocity

Do not use an LLM to invent frame transforms. Let it select the model and bounded
parameters; let the solver produce the motion.
