# Object model selection

| Requested object | Start with | Required behavior |
|---|---|---|
| strings, garlands, necklaces | strand XPBD | length, bend, friction, peel |
| flower stems | articulated strands | bend limits, attached petals |
| flags, curtains, fabric | cloth XPBD | surface shear and collision |
| balls, blocks, loose props | rigid bodies | collision, restitution, friction |
| rackets, signs, mobiles | rigid bodies + joints | angular inertia, hinges, springs |
| water, smoke, sand | particles or fluid model | neighborhood interaction |

Map interaction language to physics:

- `touch`, `drag`: kinematic contact shape plus pressure
- `pluck`: short static capture followed by rapid pressure loss
- `kick`, `hit`: impulse at a contact point
- `drop`: gravity with an initial pose
- `shake`: moving or rotating kinematic support
- `throw`: initial linear and angular velocity

Do not use an LLM to invent frame transforms. Let it select the model and bounded
parameters; let the solver produce the motion.
