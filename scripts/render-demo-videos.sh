#!/bin/sh

set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
PROJECT_DIR="$ROOT_DIR/videos/oddlyalive-demos"
MASTER="$PROJECT_DIR/renders/oddlyalive-demos-overview.mp4"
CLIPS_DIR="$PROJECT_DIR/renders/demos"
WORKERS="${HF_WORKERS:-2}"

command -v node >/dev/null 2>&1 || {
  echo "Node.js 20+ is required." >&2
  exit 1
}
command -v npm >/dev/null 2>&1 || {
  echo "npm is required." >&2
  exit 1
}
command -v ffmpeg >/dev/null 2>&1 || {
  echo "FFmpeg is required." >&2
  exit 1
}
command -v ffprobe >/dev/null 2>&1 || {
  echo "ffprobe is required." >&2
  exit 1
}

cd "$PROJECT_DIR"
npm ci
npm run build:bundle
npx --yes hyperframes@0.7.66 check
mkdir -p "$CLIPS_DIR"
npx --yes hyperframes@0.7.66 render \
  -o "$MASTER" \
  --fps 60 \
  --quality high \
  --workers "$WORKERS" \
  --skill general-video \
  --strict

cut_clip() {
  start="$1"
  output="$2"
  ffmpeg -hide_banner -loglevel error -y \
    -ss "$start" \
    -i "$MASTER" \
    -t 6.4 \
    -an \
    -c:v libx264 \
    -preset slow \
    -crf 18 \
    -pix_fmt yuv420p \
    -profile:v high \
    -movflags +faststart \
    "$CLIPS_DIR/$output"
}

cut_clip 0 "01-string-touch.mp4"
cut_clip 6.4 "02-crystal-mobile.mp4"
cut_clip 12.8 "03-ball-lab.mp4"
cut_clip 19.2 "04-football-kick.mp4"
cut_clip 25.6 "05-shoe-splash.mp4"

mkdir -p "$ROOT_DIR/docs/assets"
ffmpeg -hide_banner -loglevel error -y \
  -i "$CLIPS_DIR/01-string-touch.mp4" \
  -filter_complex \
  "[0:v]fps=12,scale=720:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=96[p];[s1][p]paletteuse=dither=sierra2_4a" \
  -loop 0 \
  "$ROOT_DIR/docs/assets/oddlyalive-string-touch.gif"

cd "$ROOT_DIR"
npm run demos:verify

echo
echo "Demo package is ready for local review."
echo "No Git, GitHub, release, or npm state was changed."
