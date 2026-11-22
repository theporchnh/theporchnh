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

  // A local cocktail-jazz arrangement of the traditional carol Deck the Halls.
  // Warm piano harmonics, bass, and a quiet brush rhythm; no external player.
  const pitches = { C: 60, D: 62, E: 64, F: 65, G: 67, A: 69, B: 71, c: 72, b: 59 };
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
  const beat = 60 / 116;
  const score = [];
  let scoreLength = 0;
  for (const [pitch, beats] of deckTheHalls) {
    if (pitch) score.push({ at: scoreLength, midi: pitches[pitch], beats });
    scoreLength += beats;
  }
  // Four-bar changes with sixths and sevenths for a warm holiday lounge sound.
  const changes = [
    [36, [48, 52, 55, 57]], [36, [48, 52, 55, 57]],
    [41, [48, 53, 57, 60]], [43, [47, 53, 57, 62]],
    [36, [48, 52, 55, 57]], [45, [48, 52, 55, 59]],
    [38, [48, 53, 57, 60]], [43, [47, 53, 57, 62]]
  ];
  let audio = null;
  let master = null;
  let timer = null;
  let playing = false;
  let nextNote = 0;
  let noteIndex = 0;
  let cycleStart = 0;
  let nextBeat = 0;
  let beatIndex = 0;
  const voices = new Set();
  const musicKey = 'porch-christmas-music';
  let musicWanted = true;
  try { musicWanted = sessionStorage.getItem(musicKey) !== 'off'; } catch (_) {}

  // Delay offbeats to give the arrangement a light swing.
  function swing(position) {
    return position + (position % 1 === .5 ? 1 / 6 : 0);
  }

  function piano(midi, when, duration, volume) {
    const frequency = 440 * Math.pow(2, (midi - 69) / 12);
    [1, 2, 3].forEach((harmonic) => {
      const oscillator = audio.createOscillator();
      const envelope = audio.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency * harmonic;
      envelope.gain.setValueAtTime(0, when);
      envelope.gain.linearRampToValueAtTime(volume / Math.pow(harmonic, 3), when + .008);
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

  let brushBuffer = null;
  function brush(when, accent) {
    if (!brushBuffer) {
      brushBuffer = audio.createBuffer(1, Math.ceil(audio.sampleRate * .12), audio.sampleRate);
      const samples = brushBuffer.getChannelData(0);
      for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
    }
    const source = audio.createBufferSource();
    const filter = audio.createBiquadFilter();
    const envelope = audio.createGain();
    source.buffer = brushBuffer;
    filter.type = 'highpass';
    filter.frequency.value = 6500;
    envelope.gain.setValueAtTime(accent ? .025 : .012, when);
    envelope.gain.exponentialRampToValueAtTime(.0001, when + .1);
    source.connect(filter);
    filter.connect(envelope);
    envelope.connect(master);
    source.start(when);
    source.stop(when + .12);
    voices.add(source);
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      envelope.disconnect();
      voices.delete(source);
    };
  }

  function scheduleMusic() {
    if (!playing) return;
    const horizon = audio.currentTime + .3;
    while (nextNote < horizon) {
      const note = score[noteIndex];
      piano(note.midi + 12, nextNote, Math.min(note.beats * beat * 1.3, 1.8), .16);
      noteIndex++;
      if (noteIndex === score.length) {
        noteIndex = 0;
        cycleStart += scoreLength * beat;
      }
      nextNote = cycleStart + swing(score[noteIndex].at) * beat;
    }
    while (nextBeat < horizon) {
      const [root, chord] = changes[Math.floor(beatIndex / 4) % changes.length];
      const step = beatIndex % 4;
      piano(root + [0, 7, 12, 7][step], nextBeat, beat * .85, .16);
      if (step === 1 || step === 3) {
        chord.forEach((midi, i) => piano(midi, nextBeat + i * .009, beat * .8, .045));
      }
      brush(nextBeat, step === 1 || step === 3);
      beatIndex++;
      nextBeat += beat;
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
  function startMusic() {
    if (!AudioEngine || !musicWanted || document.hidden || playing) return;
    try {
      if (!audio) {
        audio = new AudioEngine();
        master = audio.createGain();
        master.gain.value = .4;
        master.connect(audio.destination);
      }
      // A blocked resume can remain pending. Gesture retries must stay available.
      audio.resume().then(() => {
        if (!musicWanted || document.hidden || playing || audio.state !== 'running') return;
        playing = true;
        noteIndex = 0;
        beatIndex = 0;
        cycleStart = audio.currentTime + .06;
        nextNote = cycleStart;
        nextBeat = cycleStart;
        scheduleMusic();
        timer = window.setInterval(scheduleMusic, 100);
        musicButton.setAttribute('aria-pressed', 'true');
        musicButton.querySelector('span').textContent = 'Pause Christmas music';
      }).catch(() => { /* Retry on the next visitor interaction. */ });
    } catch (_) {
      musicButton.querySelector('span').textContent = 'Retry Christmas music';
    }
  }

  if (!AudioEngine) {
    musicButton.disabled = true;
    musicButton.querySelector('span').textContent = 'Music unavailable';
  }
  musicButton.addEventListener('click', () => {
    musicWanted = !playing;
    try { sessionStorage.setItem(musicKey, musicWanted ? 'on' : 'off'); } catch (_) {}
    if (musicWanted) startMusic();
    else stopMusic();
  });
  function unlockMusic(event) {
    if (event.target instanceof Element && event.target.closest('.porch-festive-controls')) return;
    startMusic();
  }
  document.addEventListener('click', unlockMusic);
  document.addEventListener('keydown', unlockMusic);
  document.addEventListener('visibilitychange', () => {
    updateMotion();
    if (document.hidden) stopMusic();
    else startMusic();
  });
  window.addEventListener('pagehide', stopMusic);
  window.addEventListener('pageshow', startMusic);
  startMusic();
})();
