# OddlyAlive agent sessions

Append-only. Follow the TheVibeFounder workspace's
`docs/SESSION-PROTOCOL.md`.

## 2026-07-18 — Agent.md-Codex — OddlyAlive v0.1 foundation

- **Did:** Named and built the first repository-ready OddlyAlive alpha from the
  tactile city-postcard physics. Extracted a renderer-neutral fixed-step XPBD
  strand engine, preserved per-strand static/kinetic friction and load-based
  peel, added a validated JSON scene contract, shipped a dependency-free CLI,
  and visually inspected the browser demo at rest, apex, and settle.
- **Changed:** Added the npm package scaffold, source modules, SVG renderer,
  `string-touch` example, local server, project generator, JSON Schema, tests,
  architecture and roadmap docs, provenance, and the bundled `oddlyalive` Codex
  skill.
- **Learned:** The physics generalized cleanly once city artwork and DOM layout
  were removed, but the first public composition exposed a separate design
  collision between the headline and the physical rail. Reserving distinct
  spatial ownership for copy and simulation fixed the pixels without weakening
  the solver. The locked alpha fingerprint is `4c56b4e5`.
- **Next:** Publish the GitHub repository and claim the available `oddlyalive`
  npm name, then build the first non-strand recipe (`football-kick`) on a
  deterministic rigid-body adapter.

## 2026-07-18 — Agent.md-Codex — OddlyAlive v0.2 recipe gallery

- **Did:** Expanded the strand alpha into a five-recipe physics gallery:
  `string-touch`, weighted `crystal-mobile`, three-material `ball-lab`,
  single-impulse `football-kick`, and coupled-wave `shoe-splash`. Added
  rigid-circle contact dynamics, scheduled linear/angular impulses, weighted
  strand terminals, and a damped one-dimensional surface with buoyancy/drag.
- **Changed:** Added three scene types behind one validator/simulator registry,
  original procedural SVG renderers, a shared seek-safe player, responsive
  gallery, one-command CLI presets, multi-family JSON Schema, bundled skill
  recipes, provenance, architecture/roadmap updates, and 15 deterministic,
  validation, and starter-generation tests.
- **Learned:** The best example set is organized by physical behavior rather
  than object category. One rigid solver covers baseball, basketball, football,
  and kicks through material/impulse changes, while water and walking require
  genuinely different models. The v0.2 fingerprints are `04e45087`
  (crystal), `c3b9e206` (ball lab), `2179d5a7` (kick), and `438ccfca`
  (shoe/wave); the original strand fingerprint remains `4c56b4e5`.
- **Next:** Publish the repository/npm alpha, then add articulated bodies,
  joint limits, foot contacts, and inverse kinematics for the walking recipe.

## 2026-07-18 — Agent.md-Codex — Public alpha release

- **Did:** Published the verified OddlyAlive source as a public GitHub
  repository under `thevibefounderdotcom/OddlyAlive` and prepared the npm
  package for an `alpha` dist-tag rather than presenting a prerelease as
  `latest`.
- **Changed:** Added canonical repository, homepage, issue tracker, public
  access, and prerelease-tag metadata to `package.json`.
- **Learned:** The `oddlyalive` npm name is available, but this machine has no
  authenticated npm session, so registry publication correctly stops at the
  account boundary instead of attempting to bypass login or 2FA.
- **Next:** Authenticate npm interactively, run
  `npm publish --access public --tag alpha`, and verify the published tarball.

## 2026-07-18 — Agent.md-Codex — Local demo-video review package

- **Did:** Built a deterministic HyperFrames demo composition from the five
  real OddlyAlive recipes, rendered a 32-second 60fps master, cut five exact
  6.4-second clips, generated the README preview GIF, and verified every MP4
  with full decode, stream, duration, frame-count, and checksum checks.
- **Changed:** Added `videos/oddlyalive-demos/`, the root README preview and
  rebuild path, `docs/QUICKSTART.md`, `docs/DEMO-VIDEOS.md`,
  `scripts/render-demo-videos.sh`, `scripts/verify-demo-videos.mjs`, demo npm
  scripts, and generated local review artifacts ignored by Git.
- **Learned:** Bundling directly from the canonical `src/` keeps the video
  reproducible without a stale engine copy; the encoded review also caught a
  pale-on-pitch footer that static design review had missed. The final
  composition passes 304/304 text contrast checks.
- **Next:** Get explicit visual approval on the local master and five clips;
  only then commit the source/docs/GIF and separately decide whether to upload
  the MP4s as release assets. Do not push or publish npm yet.

## 2026-07-19 — Agent.md-Codex — Material-realism preview pass

- **Did:** Rebuilt all five local demo renderers so the simulated bodies read
  as constructed objects instead of instructional icons. Added physical rail
  hardware, braided cords, eyelets and knot tails; sharp faceted crystals with
  bails and glass beads; material-specific baseball, basketball and football
  surfaces; a dimensional cleat, pitch and deforming goal net; and a complete
  sneaker, reflection, foam, spray and water-caustic treatment. Captured and
  inspected contact sheets at rest, contact, impact and settle.
- **Changed:** `src/svg-renderer.js`, `src/crystal-renderer.js`,
  `src/rigid-renderer.js`, `src/wave-renderer.js`,
  `videos/oddlyalive-demos/index.html`,
  `videos/oddlyalive-demos/app.bundle.js`, local ignored review snapshots, and
  the demo project's HyperFrames pin from `0.7.57` to `0.7.64`.
- **Learned:** The original physics was credible but flat silhouette language
  made it feel synthetic. Material construction plus event-specific secondary
  motion is the decisive layer: the final football sequence now enters the
  goal, forms a local net pocket, and rebounds; the crystal blur inherited from
  a group filter was also caught and removed during close-up QA.
- **Next:** Review all five scenes in the live HyperFrames Studio. If the
  realism direction is approved, render and verify replacement MP4s, then
  commit the already-prepared source/docs without pushing until the user
  explicitly authorizes Git publication.

## 2026-07-19 — Agent.md-Codex — Photographic object asset pass

- **Did:** Replaced the diagram-like hero objects in all five HyperFrames demos
  with generated, high-resolution photographic cutouts while preserving the
  deterministic strand, rigid-body, net-contact, and surface-wave simulations.
  The new pass includes enamel-and-brass letter charms, faceted crystal
  pendants, a baseball, basketball, football, kicking cleat and lower leg, and
  a canvas sneaker, all with transparent mattes and inspected edge quality.
- **Changed:** Added the provenance-tracked image library under
  `videos/oddlyalive-demos/.media/images/` and
  `videos/oddlyalive-demos/assets/images/photoreal/`; wired the assets through
  `videos/oddlyalive-demos/app.js`; updated all four SVG renderers; rebuilt the
  browser bundle; and captured a complete `review/photoreal-v2/` proof set.
- **Learned:** Procedural surface detail cannot rescue an object whose base
  silhouette still reads as an illustration. Photographic material cues
  provide the recognition and texture fidelity, while deterministic SVG
  remains the right layer for deformation, shadows, strings, water, and nets.
  The combined approach passed 15/15 engine tests, zero runtime or motion
  errors, and 301/301 WCAG AA contrast checks.
- **Next:** Get explicit approval in the live Studio at
  `http://localhost:3019`; after approval, render and decode-verify the
  replacement MP4s. Do not commit, push, publish npm, or replace the previously
  approved videos until that visual approval is given.

## 2026-07-21 — Agent.md-Codex — Canonical GitHub clone migration

- **Did:** Made this OddlyAlive checkout the canonical local repository and
  migrated the intentional engine, documentation, render
  scripts, HyperFrames project, media ledger, and final transparent
  photographic assets from the temporary release worktree. Excluded stale
  renders, review snapshots, generated bundles, dependency folders, chroma
  intermediates, and the accidental `* 2.js` renderer copies.
- **Changed:** Updated the canonical clone with the pending source/docs/demo
  work, corrected repository links to `thevibefounder/OddlyAlive`, removed the
  stale unshipped GIF reference, consolidated the publishable image assets
  under `assets/photoreal/`, wired both the public gallery and HyperFrames demo
  to that shared library, corrected raster/SVG documentation, and upgraded the
  demo project's pinned HyperFrames CLI from `0.7.64` to `0.7.66`; the old
  worktree remains untouched as a safety copy.
- **Learned:** The migrated project is healthy in its canonical location: all
  15 engine tests pass, npm reports zero installed dependency vulnerabilities,
  and HyperFrames reports zero runtime or motion errors with 301/301 WCAG AA
  contrast checks. All five public gallery routes and all seven runtime image
  assets return HTTP 200 from the local server. The high-quality demo assets
  are present, but final MP4s remain intentionally unrendered and unpushed.
- **Next:** Obtain visual approval on the canonical public gallery and
  HyperFrames preview, then render and verify replacement media. After that,
  add release CI/hygiene, clean-room test the npm tarball, and request explicit
  authorization before pushing or publishing.

## 2026-07-21 — Agent.md-Codex — Canonical visual-review gate

- **Did:** Revalidated the canonical 32-second HyperFrames composition at the
  nine handoff hero timestamps, started the public gallery and Studio review
  surfaces, and confirmed both endpoints return HTTP 200. Kept the render,
  push, release, and npm publication gates closed pending visual approval.
- **Changed:** Added the generated HyperFrames `.thumbnails/` cache to
  `.gitignore`; updated `docs/AGENT_SESSIONS.md` with this session.
- **Learned:** HyperFrames `0.7.66` remains current. The review composition
  still passes with zero runtime or motion errors and 301/301 WCAG AA text
  checks; opening Studio creates a thumbnail cache that must stay outside Git.
- **Next:** Review the five scenes at normal speed in Studio and approve or
  request revisions. Only after explicit approval, render and decode-verify the
  final photographic MP4s and GIF; do not push or publish npm yet.

## 2026-07-21 — Release Agent-Codex — Alpha.2 release candidate

- **Did:** After explicit visual approval, rendered the 32-second photographic
  master, cut all five 6.4-second recipe clips, rebuilt the README GIF, decoded
  every MP4, recorded SHA-256 checksums, and inspected a 20-frame encoded
  contact sheet. Added CI and open-source governance files, deterministic visual
  fixtures, bumped the package to `0.2.0-alpha.2`, and installed/tested the final
  tarball in a clean temporary consumer. The clean-room browser pass exposed
  and then verified a fix for missing photographic assets in generated projects.
- **Changed:** Added `.github/` workflows/templates, `CHANGELOG.md`,
  `CONTRIBUTING.md`, `SECURITY.md`, `package-lock.json`, the approved README GIF,
  visual baseline tooling/tests, and release checksums; updated the package,
  README, roadmap, CLI generator, local server MIME types, and CLI regression
  tests.
- **Learned:** Source-tree tests were not enough to prove the project generator:
  only installing the packed artifact and opening its generated recipe revealed
  that photoreal PNGs were omitted. The fixed generator now copies provenance
  and required assets, serves PNGs as `image/png`, mounts the expected SVG scene,
  and reports no browser errors.
- **Next:** Request explicit authorization to merge and push the release
  candidate, create the new `v0.2.0-alpha.2` prerelease without moving the
  existing alpha.1 tag, upload the six verified MP4s, and publish npm under the
  `alpha` tag after interactive authentication.

## 2026-07-21 — Senior Eng-Claude — Independent alpha.2 review

- **Did:** Independently re-verified the `0.2.0-alpha.2` candidate at `c804f41`
  without pushing, tagging, or publishing. Re-ran the full test suite (17/17
  pass) and `npm run demos:verify` (all six MP4s decode cleanly at contract
  durations/frame counts). Confirmed all seven media SHA-256 checksums match
  `docs/DEMO-VIDEOS.md`, and rebuilt the npm tarball from the committed source —
  byte-identical to the recorded release artifact, SHA-256
  `79781e742c3fe64b18cd736104c44ab71d2a793ec9d87f0d494f30399799d3eb`. Reviewed the
  release diff, CI workflow, changelog, and package metadata; confirmed
  `hyperframes@0.7.66` is publicly available on npm and `repository` is set so
  the README GIF resolves on npmjs.com after push.
- **Changed:** Only this session log entry.
- **Learned:** The tarball is reproducible from `c804f41` via `npm pack`, so the
  recorded SHA-256 doubles as a source-integrity proof. The CI demo-gate job
  (`npx hyperframes check` on ubuntu-latest) has never run on a GitHub runner;
  watch the first CI run after push. The `[0.2.0-alpha.1]` changelog link
  assumes a `v0.2.0-alpha.1` tag exists once the repo is public.
- **Next:** Candidate is approved from review. Awaiting explicit user
  authorization to merge/push, tag `v0.2.0-alpha.2`, upload MP4 release assets,
  and publish npm under the `alpha` dist-tag (interactive auth required).

## 2026-07-21 — Release Agent-Codex — Privacy hardening

- **Did:** Audited the repository, npm payload, rendered media metadata, and Git
  authorship for personal data. Redacted every personal local path from the
  current tree and configured future commits in this checkout to use the
  TheVibeFounder GitHub no-reply identity.
- **Changed:** Updated `AGENTS.md` and `docs/AGENT_SESSIONS.md`; updated only the
  local repository's Git author configuration outside the committed tree.
- **Learned:** The current tree, npm payload, images, and videos can be free of
  personal data, but existing commits still contain the prior author email.
  Removing that historical record would require a destructive history rewrite
  and cannot preserve the existing alpha.1 tag unchanged.
- **Next:** Keep publication paused. Decide whether the public work email in the
  immutable alpha.1 history is acceptable or authorize a coordinated history
  rewrite and replacement release strategy.

## 2026-07-21 — Release Agent-Codex — Purge personal data from Git history

- **Did:** With explicit authorization, rewrote all eight commits using
  `git-filter-repo`, replaced the prior author and committer email with the
  TheVibeFounder GitHub no-reply identity, and redacted the three historical
  local-path disclosures. Verified the rewritten alpha.2 candidate in a clean
  clone, then force-updated only public `main` and `v0.2.0-alpha.1`; no alpha.2
  tag, release, media upload, or npm publication occurred.
- **Changed:** Rewrote repository history and moved public `main` plus the
  existing alpha.1 tag to sanitized commit `446901b`; updated this session log.
- **Learned:** The rewritten candidate remains byte-identical at the tree and
  npm-package levels: 17/17 tests pass and the tarball SHA-256 remains
  `79781e742c3fe64b18cd736104c44ab71d2a793ec9d87f0d494f30399799d3eb`.
  GitHub still serves the former commit IDs from its cache even though no
  branch, tag, fork, or pull request references them, so a provider-side purge
  request is required for strict removal.
- **Next:** Submit the prepared GitHub Support request for cached-view removal
  and server-side garbage collection, then confirm the old commit IDs stop
  resolving before publishing alpha.2.

## 2026-07-21 — Release Agent-Codex — Launch open-source project pages

- **Did:** Built and launched the new TheVibeFounder open-source catalog plus a
  dedicated OddlyAlive showcase, using the approved deterministic motion media,
  provenance-tracked recipe art, and a bespoke social card. Verified both
  custom-domain routes live, then added the canonical project URL to this
  package and README. Removed the premature `npx` quick command after confirming
  the package is not yet available from the public npm registry.
- **Changed:** Updated `package.json`, `README.md`, `CHANGELOG.md`, and this
  session log. The companion website shipped as commit `d15676a` in the
  TheVibeFounder website repository.
- **Learned:** Even a documentation-only package change alters release bytes.
  The refreshed 86-file alpha.2 tarball passes 17/17 tests and now has SHA-256
  `ac3a92cfdaf2d6d350524d411321418835ac3d04e6e30d57bdcbc10d53a9f802`.
- **Next:** Restore GitHub CLI authentication to set the repository sidebar
  website field, submit the already drafted cache-purge request after explicit
  approval, and use the refreshed tarball checksum for the eventual alpha.2
  release.

## 2026-07-21 — Release Agent-Codex — Shorten canonical project URLs to `/os`

- **Did:** Moved the public catalog and OddlyAlive showcase from `/opensource/`
  to `/os/`, updated site navigation, sitemap, canonical and social metadata,
  package-facing links, and the GitHub repository homepage, while preserving
  legacy URLs with permanent redirects. Re-ran the complete release and privacy
  audit after the URL change.
- **Changed:** Updated `README.md`, `package.json`, `CHANGELOG.md`, and this
  session log. The companion website route migration shipped as commit
  `bd4896d` in the TheVibeFounder website repository.
- **Learned:** The canonical pages return `200`, the former OddlyAlive route
  returns `301`, all 17 tests and all six media checks pass, all reachable Git
  authors use the brand no-reply identity, no unreachable Git objects or
  personal-data/secret patterns were found, and the two previously cached
  pre-purge commit IDs now return `No commit found` from GitHub. The refreshed
  86-file alpha.2 tarball has SHA-256
  `9c83b01da4675e4370bf2408c1b4478f4b98a6bf9dd874a96a3c2b5276ae141f`.
- **Next:** The cached-view purge request is no longer needed and was not
  submitted. Keep alpha.2 publication paused until explicit authorization to
  merge, tag, create the prerelease, upload media, and publish npm; use the new
  tarball checksum for that release.

## 2026-07-21 — Senior Eng-Claude — Canonical `/os` migration review

- **Did:** Independently verified the canonical-migration handoff. Confirmed
  live URLs: `/os/` and `/os/oddlyalive/` return `200`, the former
  `/opensource/oddlyalive/` returns a permanent `301` to the new path, the
  sitemap lists both `/os` pages, and the OddlyAlive page carries correct
  canonical OG metadata. Verified the history rewrite: old SHAs `c804f41` and
  `10aa40e` resolve neither locally nor on the GitHub API (`422`), `git fsck`
  reports no unreachable objects, all authorship is the
  `thevibefounder@users.noreply.github.com` identity, and no personal paths
  remain in tracked files. Re-ran the suite (17/17 pass), confirmed all seven
  media SHA-256 checksums match `docs/DEMO-VIDEOS.md`, and reproduced the
  86-file tarball byte-for-byte at
  `9c83b01da4675e4370bf2408c1b4478f4b98a6bf9dd874a96a3c2b5276ae141f`.
- **Changed:** Only this session log entry.
- **Learned:** The rewrite maps `bdf552a` ← old `c804f41` (alpha.2 candidate)
  and `740c5e4` ← old `10aa40e` (previous review log), so earlier session
  entries citing the old SHAs and the superseded tarball checksum
  (`79781e74…`) describe pre-rewrite history that no longer resolves. The
  rewritten branch `codex/canonical-migration` is pushed to origin; `main`
  remains at `446901b` with only the `v0.2.0-alpha.1` tag.
- **Next:** Alpha.2 release steps remain gated on explicit authorization:
  merge/PR to `main`, tag `v0.2.0-alpha.2` on the rewritten history, upload
  the six verified MP4s as release assets, and publish npm under the `alpha`
  dist-tag with interactive authentication.
