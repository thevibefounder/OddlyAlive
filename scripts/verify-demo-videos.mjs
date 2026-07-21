import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const expected = [
  {
    label: "overview",
    path: "videos/oddlyalive-demos/renders/oddlyalive-demos-overview.mp4",
    duration: 32,
    frames: 1920
  },
  {
    label: "string-touch",
    path: "videos/oddlyalive-demos/renders/demos/01-string-touch.mp4",
    duration: 6.4,
    frames: 384
  },
  {
    label: "crystal-mobile",
    path: "videos/oddlyalive-demos/renders/demos/02-crystal-mobile.mp4",
    duration: 6.4,
    frames: 384
  },
  {
    label: "ball-lab",
    path: "videos/oddlyalive-demos/renders/demos/03-ball-lab.mp4",
    duration: 6.4,
    frames: 384
  },
  {
    label: "football-kick",
    path: "videos/oddlyalive-demos/renders/demos/04-football-kick.mp4",
    duration: 6.4,
    frames: 384
  },
  {
    label: "shoe-splash",
    path: "videos/oddlyalive-demos/renders/demos/05-shoe-splash.mp4",
    duration: 6.4,
    frames: 384
  }
];

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8"
  });
  if (result.status !== 0) {
    throw new Error(
      `${command} failed:\n${result.stderr || result.stdout || "unknown error"}`
    );
  }
  return result.stdout;
}

function almostEqual(actual, expectedValue, tolerance = 0.001) {
  return Math.abs(actual - expectedValue) <= tolerance;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const rows = [];

for (const item of expected) {
  const absolutePath = resolve(root, item.path);
  const probe = JSON.parse(
    run("ffprobe", [
      "-v",
      "error",
      "-show_streams",
      "-show_format",
      "-of",
      "json",
      absolutePath
    ])
  );
  const videoStreams = probe.streams.filter(
    (stream) => stream.codec_type === "video"
  );
  const audioStreams = probe.streams.filter(
    (stream) => stream.codec_type === "audio"
  );

  assert(videoStreams.length === 1, `${item.label}: expected one video stream`);
  assert(audioStreams.length === 0, `${item.label}: expected no audio stream`);

  const video = videoStreams[0];
  const [fpsNumerator, fpsDenominator] = video.avg_frame_rate
    .split("/")
    .map(Number);
  const fps = fpsNumerator / fpsDenominator;
  const duration = Number(probe.format.duration);
  const frameCount = Number(video.nb_frames);

  assert(video.codec_name === "h264", `${item.label}: codec is not H.264`);
  assert(video.profile === "High", `${item.label}: H.264 profile is not High`);
  assert(video.pix_fmt === "yuv420p", `${item.label}: pixel format is not yuv420p`);
  assert(video.width === 1920, `${item.label}: width is not 1920`);
  assert(video.height === 1080, `${item.label}: height is not 1080`);
  assert(almostEqual(fps, 60), `${item.label}: frame rate is not 60 fps`);
  assert(
    almostEqual(duration, item.duration),
    `${item.label}: duration ${duration} does not match ${item.duration}`
  );
  assert(
    frameCount === item.frames,
    `${item.label}: frame count ${frameCount} does not match ${item.frames}`
  );

  run("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-i",
    absolutePath,
    "-f",
    "null",
    "-"
  ]);

  const bytes = readFileSync(absolutePath);
  rows.push({
    file: item.path,
    seconds: duration.toFixed(1),
    frames: frameCount,
    mebibytes: (bytes.byteLength / 1024 / 1024).toFixed(2),
    sha256: createHash("sha256").update(bytes).digest("hex")
  });
}

console.table(rows);
console.log("PASS: all demo videos match the encoding contract and decode cleanly.");
