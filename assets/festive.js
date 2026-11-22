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

  // Full recording, hosted with the site so playback does not depend on a third-party player.
  const audio = document.createElement('audio');
  audio.src = new URL('music/white-christmas.mp3', document.currentScript.src).href;
  audio.preload = 'none';
  audio.loop = true;
  audio.volume = .35;
  audio.hidden = true;
  body.append(audio);
  musicButton.title = 'White Christmas — Ella Fitzgerald';
  const musicLabel = musicButton.querySelector('span');
  const musicKey = 'porch-christmas-music';
  let musicWanted = true;
  let starting = false;
  let requestId = 0;
  try { musicWanted = sessionStorage.getItem(musicKey) !== 'off'; } catch (_) {}

  function updateMusicButton(playing) {
    musicButton.setAttribute('aria-pressed', String(playing));
    musicLabel.textContent = `${playing ? 'Pause' : 'Play'} White Christmas`;
  }
  updateMusicButton(false);

  function stopMusic() {
    requestId++;
    starting = false;
    audio.pause();
    updateMusicButton(false);
  }

  function startMusic() {
    if (!musicWanted || document.hidden || starting || !audio.paused) return;
    const currentRequest = ++requestId;
    starting = true;
    audio.play().then(() => {
      if (currentRequest !== requestId) return;
      starting = false;
      if (!musicWanted || document.hidden) stopMusic();
      else updateMusicButton(true);
    }).catch((error) => {
      if (currentRequest !== requestId) return;
      starting = false;
      updateMusicButton(false);
      // Browsers can require a visitor interaction before starting audio.
      if (error.name !== 'NotAllowedError' && error.name !== 'AbortError') {
        musicLabel.textContent = 'Retry White Christmas';
      }
    });
  }

  audio.addEventListener('playing', () => {
    if (!musicWanted || document.hidden) stopMusic();
    else updateMusicButton(true);
  });
  audio.addEventListener('pause', () => updateMusicButton(false));
  audio.addEventListener('error', () => {
    stopMusic();
    musicLabel.textContent = 'Retry White Christmas';
  });
  musicButton.addEventListener('click', () => {
    musicWanted = !(starting || !audio.paused);
    try { sessionStorage.setItem(musicKey, musicWanted ? 'on' : 'off'); } catch (_) {}
    if (musicWanted) {
      if (audio.error) audio.load();
      startMusic();
    } else stopMusic();
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
