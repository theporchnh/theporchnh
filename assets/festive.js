(() => {
  'use strict';

  if (document.querySelector('.porch-festive-controls')) return;
  const body = document.body;
  body.classList.add('porch-festive-page');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animationKey = 'porch-christmas-animations';
  let animationsOn = !reducedMotion.matches;
  try {
    if (sessionStorage.getItem(animationKey) === 'off') animationsOn = false;
  } catch (_) { /* Decorations also work without browser storage. */ }

  const lights = document.createElement('div');
  lights.className = 'porch-festive-lights';
  lights.setAttribute('aria-hidden', 'true');
  const colors = ['#ff8f83', '#f9d786', '#89cba0', '#f9d786'];
  for (let i = 0; i < 38; i++) {
    const bulb = document.createElement('span');
    bulb.className = 'porch-festive-bulb';
    bulb.style.setProperty('--bulb', colors[i % colors.length]);
    bulb.style.setProperty('--tilt', `${i % 2 ? 12 : -12}deg`);
    bulb.style.setProperty('--delay', `${-(i % 7) * 0.6}s`);
    lights.append(bulb);
  }
  body.append(lights);

  const banner = document.getElementById('porch-christmas');
  if (banner) {
    const ornament = document.createElement('span');
    ornament.className = 'porch-festive-ornament';
    ornament.setAttribute('aria-hidden', 'true');
    banner.append(ornament);
  }

  const sleigh = document.createElement('img');
  sleigh.className = 'porch-festive-sleigh';
  sleigh.src = new URL('festive-sleigh.svg', document.currentScript.src).href;
  sleigh.alt = '';
  sleigh.setAttribute('aria-hidden', 'true');
  body.append(sleigh);

  const snow = document.createElement('canvas');
  snow.className = 'porch-festive-snow';
  snow.setAttribute('aria-hidden', 'true');
  body.append(snow);
  const context = snow.getContext('2d');
  let flakes = [];
  let width = 0;
  let height = 0;
  let frame = null;
  let previousTime = 0;

  function resizeSnow() {
    width = window.innerWidth;
    height = window.innerHeight;
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    snow.width = width * scale;
    snow.height = height * scale;
    if (!context) return;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    flakes = Array.from({ length: width < 768 ? 32 : 72 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 1 + Math.random() * 2.5,
      speed: 14 + Math.random() * 25,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.35 + Math.random() * 0.45
    }));
  }

  function drawSnow(time) {
    const elapsed = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;
    previousTime = time;
    context.clearRect(0, 0, width, height);
    for (const flake of flakes) {
      flake.y += flake.speed * elapsed;
      flake.x += Math.sin(time / 2600 + flake.phase) * 9 * elapsed;
      if (flake.y > height + 5) { flake.y = -5; flake.x = Math.random() * width; }
      if (flake.x < -5) flake.x = width + 5;
      if (flake.x > width + 5) flake.x = -5;
      context.beginPath();
      context.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(255, 252, 242, ${flake.opacity})`;
      context.shadowColor = 'rgba(61, 84, 70, 0.22)';
      context.shadowBlur = 2;
      context.fill();
    }
    frame = window.requestAnimationFrame(drawSnow);
  }

  const controls = document.createElement('div');
  controls.className = 'porch-festive-controls';
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', 'Christmas music and decorations');
  // These icons are decorative; the adjacent text labels each button.
  controls.innerHTML = `
    <button type="button" class="porch-festive-music" aria-pressed="false">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13M9 9l12-2"/><ellipse cx="6" cy="18" rx="3" ry="3"/><ellipse cx="18" cy="16" rx="3" ry="3"/></svg>
      <span>Play Christmas music</span>
    </button>
    <span class="porch-festive-controls__divider" aria-hidden="true"></span>
    <button type="button" class="porch-festive-motion" aria-pressed="false">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 2v20M3.34 7l17.32 10M3.34 17 20.66 7M9 4l3 3 3-3M9 20l3-3 3 3M4 10l4-1-1-4M17 19l-1-4 4-1M4 14l4 1-1 4M17 5l-1 4 4 1"/></svg>
      <span>Animations</span>
    </button>`;
  body.append(controls);
  const musicButton = controls.querySelector('.porch-festive-music');
  const motionButton = controls.querySelector('.porch-festive-motion');

  function updateMotion() {
    const paused = !animationsOn || document.hidden;
    body.classList.toggle('porch-festive-paused', paused);
    motionButton.setAttribute('aria-pressed', String(animationsOn));
    motionButton.setAttribute('aria-label', `${animationsOn ? 'Pause' : 'Enable'} Christmas animations`);
    if (frame !== null) window.cancelAnimationFrame(frame);
    frame = null;
    previousTime = 0;
    if (!paused && !reducedMotion.matches && context) frame = window.requestAnimationFrame(drawSnow);
  }
  motionButton.addEventListener('click', () => {
    animationsOn = !animationsOn;
    try { sessionStorage.setItem(animationKey, animationsOn ? 'on' : 'off'); } catch (_) {}
    updateMotion();
  });
  reducedMotion.addEventListener('change', () => {
    animationsOn = !reducedMotion.matches;
    updateMotion();
  });
  window.addEventListener('resize', resizeSnow, { passive: true });
  resizeSnow();
  updateMotion();

  // Public-domain carol melodies, played locally as a gentle music box.
  // No recording, third-party player, tracking, or audio download is needed.
  const pitches = { C: 72, D: 74, E: 76, F: 77, G: 79, A: 81, B: 83, c: 84, b: 71 };
  const jingleBells = [
    ['E', 1], ['E', 1], ['E', 2], ['E', 1], ['E', 1], ['E', 2],
    ['E', 1], ['G', 1], ['C', 1.5], ['D', .5], ['E', 4],
    ['F', 1], ['F', 1], ['F', 1.5], ['F', .5], ['F', 1], ['E', 1], ['E', 1], ['E', .5], ['E', .5],
    ['E', 1], ['D', 1], ['D', 1], ['E', 1], ['D', 2], ['G', 2],
    ['E', 1], ['E', 1], ['E', 2], ['E', 1], ['E', 1], ['E', 2],
    ['E', 1], ['G', 1], ['C', 1.5], ['D', .5], ['E', 4],
    ['F', 1], ['F', 1], ['F', 1.5], ['F', .5], ['F', 1], ['E', 1], ['E', 1], ['E', .5], ['E', .5],
    ['G', 1], ['G', 1], ['F', 1], ['D', 1], ['C', 4], [null, 4]
  ];
  const deckTheHalls = [
    ['G', 1.5], ['F', .5], ['E', 1], ['D', 1], ['C', 1], ['D', 1], ['E', 1], ['C', 1],
    ['D', .5], ['E', .5], ['F', .5], ['D', .5], ['E', 1.5], ['D', .5], ['C', 1], ['b', 1], ['C', 2],
    ['G', 1.5], ['F', .5], ['E', 1], ['D', 1], ['C', 1], ['D', 1], ['E', 1], ['C', 1],
    ['D', .5], ['E', .5], ['F', .5], ['D', .5], ['E', 1.5], ['D', .5], ['C', 1], ['b', 1], ['C', 2],
    ['D', 1.5], ['E', .5], ['F', 1], ['D', 1], ['E', 1.5], ['F', .5], ['G', 1], ['D', 1],
    ['E', .5], ['F', .5], ['G', 1], ['A', .5], ['B', .5], ['c', 1], ['B', 1], ['A', 1], ['G', 2],
    ['G', 1.5], ['F', .5], ['E', 1], ['D', 1], ['C', 1], ['D', 1], ['E', 1], ['C', 1],
    ['A', .5], ['A', .5], ['A', .5], ['A', .5], ['G', 1.5], ['F', .5], ['E', 1], ['D', 1], ['C', 4], [null, 6]
  ];
  const score = [...jingleBells, ...deckTheHalls];
  let audio = null;
  let master = null;
  let timer = null;
  let playing = false;
  let starting = false;
  let nextNote = 0;
  let noteIndex = 0;
  const voices = new Set();

  function chime(midi, when, duration, volume) {
    const frequency = 440 * Math.pow(2, (midi - 69) / 12);
    // A fundamental and a quiet overtone give a soft, bell-like attack.
    [1, 2].forEach((harmonic) => {
      const oscillator = audio.createOscillator();
      const envelope = audio.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency * harmonic;
      envelope.gain.setValueAtTime(0, when);
      envelope.gain.linearRampToValueAtTime(volume / (harmonic * harmonic), when + .012);
      envelope.gain.exponentialRampToValueAtTime(.0001, when + duration);
      oscillator.connect(envelope);
      envelope.connect(master);
      oscillator.start(when);
      oscillator.stop(when + duration + .03);
      voices.add(oscillator);
      oscillator.onended = () => {
        oscillator.disconnect();
        envelope.disconnect();
        voices.delete(oscillator);
      };
    });
  }

  function scheduleMusic() {
    if (!playing) return;
    while (nextNote < audio.currentTime + .3) {
      const [pitch, beats] = score[noteIndex];
      const duration = beats * .38;
      if (pitch) {
        const midi = pitches[pitch];
        chime(midi, nextNote, Math.min(duration * 1.8, 1.8), .19);
        if (noteIndex % 4 === 0) chime(midi - 24, nextNote, 1.4, .07);
      }
      nextNote += duration;
      noteIndex = (noteIndex + 1) % score.length;
    }
  }

  function stopMusic() {
    playing = false;
    window.clearInterval(timer);
    timer = null;
    for (const voice of voices) { try { voice.stop(); } catch (_) {} }
    if (audio && audio.state === 'running') audio.suspend().catch(() => {});
    musicButton.setAttribute('aria-pressed', 'false');
    musicButton.querySelector('span').textContent = 'Play Christmas music';
  }

  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) {
    musicButton.disabled = true;
    musicButton.querySelector('span').textContent = 'Music unavailable';
  }
  musicButton.addEventListener('click', async () => {
    if (starting) return;
    if (playing) { stopMusic(); return; }
    starting = true;
    musicButton.disabled = true;
    try {
      if (!audio) {
        audio = new AudioEngine();
        master = audio.createGain();
        master.gain.value = .35;
        master.connect(audio.destination);
      }
      await audio.resume();
      if (document.hidden || audio.state !== 'running') return;
      playing = true;
      noteIndex = 0;
      nextNote = audio.currentTime + .06;
      scheduleMusic();
      timer = window.setInterval(scheduleMusic, 100);
      musicButton.setAttribute('aria-pressed', 'true');
      musicButton.querySelector('span').textContent = 'Pause Christmas music';
    } catch (_) {
      stopMusic();
      musicButton.querySelector('span').textContent = 'Retry Christmas music';
    } finally {
      starting = false;
      musicButton.disabled = false;
    }
  });
  document.addEventListener('visibilitychange', () => {
    updateMotion();
    if (document.hidden) stopMusic();
  });
  window.addEventListener('pagehide', stopMusic);
})();
