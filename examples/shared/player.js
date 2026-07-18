export function mountPlayer({
  scene,
  simulation,
  renderer,
  metricLabel = "signal",
  metricValue = "—"
}) {
  const loading = document.querySelector("#loading");
  const toggle = document.querySelector("#toggle");
  const scrubber = document.querySelector("#scrubber");
  const fingerprint = document.querySelector("#fingerprint");
  const metricName = document.querySelector("#metric-name");
  const metric = document.querySelector("#metric");
  const lastFrame = simulation.frames.length - 1;
  const durationMs = scene.timing.duration * 1000;

  scrubber.max = String(lastFrame);
  fingerprint.textContent = simulation.fingerprint;
  metricName.textContent = metricLabel;
  metric.textContent = metricValue;
  loading?.remove();

  let playing = true;
  let origin = performance.now();
  let pausedFrame = 0;

  function paint(frame) {
    const safeFrame = Math.max(0, Math.min(lastFrame, Math.round(frame)));
    pausedFrame = safeFrame;
    renderer.renderFrame(safeFrame);
    scrubber.value = String(safeFrame);
  }

  function play() {
    if (playing) return;
    playing = true;
    toggle.textContent = "PAUSE";
    origin =
      performance.now() -
      (pausedFrame / scene.timing.fps) * 1000;
  }

  function pause() {
    playing = false;
    toggle.textContent = "PLAY";
  }

  function seekFrame(frame) {
    pause();
    paint(frame);
  }

  function seekTime(time) {
    seekFrame(time * scene.timing.fps);
  }

  function animate(now) {
    if (playing) {
      const elapsed = (now - origin) % durationMs;
      paint((elapsed / 1000) * scene.timing.fps);
    }
    requestAnimationFrame(animate);
  }

  toggle.addEventListener("click", () => {
    if (playing) pause();
    else play();
  });
  scrubber.addEventListener("input", () => {
    seekFrame(Number(scrubber.value));
  });

  window.__oddlyAlivePlayer = {
    scene,
    simulation,
    paint,
    pause,
    play,
    seekFrame,
    seekTime
  };

  paint(0);
  requestAnimationFrame(animate);
}
