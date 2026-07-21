---
workflow: general-video
flow: automation
storyboard: no
message: "OddlyAlive turns ordinary objects into deterministic, physically believable motion."
destination: github-and-social
aspect: 1920x1080
language: en
audience: creative-coders
length: 32s
angle: product-demo
---

## Intent

Create a local-first demo package for the OddlyAlive open-source alpha. Each
recipe must show the real solver and renderer at work, preserve the gallery's
paper-and-ink identity, and make the physical behavior understandable without
voice-over.

## Assets

- `../../src/` — the current OddlyAlive engine, bundled into the render so the
  browser runtime has no external dependency.
- `../../assets/photoreal/` — locally frozen transparent object cutouts shared
  with the browser examples; provenance is recorded beside the assets.

## Customizations

- Five faithful 6.4-second recipe demos.
- One 32-second combined reel.
- One lightweight GIF preview for the repository README.
- Silent by design so the demos work in GitHub, npm, and social previews.

## Notes

- No stock footage or third-party artwork; locally generated photographic
  cutouts provide material detail while SVG owns deformation and physics.
- No live network data.
- Do not commit, push, release, or publish until the user reviews the package.
