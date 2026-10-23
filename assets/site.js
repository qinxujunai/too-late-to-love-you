// One player. Without JS the native video, its controls and every link still work.
(() => {
  const root = document.documentElement;
  document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('qxj.theme', next); } catch {}
  });
  matchMedia('(prefers-color-scheme:dark)').addEventListener('change', (e) => {
    try { if (!localStorage.getItem('qxj.theme')) root.dataset.theme = e.matches ? 'dark' : 'light'; } catch {}
  });

  const film = document.getElementById('film');
  if (!film) return;
  const cover = document.querySelector('.cover');
  const error = document.getElementById('video-error');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // The cover hides the native poster until Play, so the first screen is the key art, not a control bar.
  document.querySelectorAll('[data-play]').forEach((b) => { b.hidden = false; });
  const show = () => { if (cover) cover.hidden = true; };
  const fail = () => { show(); error.hidden = false; };
  // Wide screens get the full-bitrate original; phones keep the creator's 4K web version.
  const wide = film.dataset.wide;
  if (wide && matchMedia('(min-width: 1024px)').matches && !(navigator.connection && navigator.connection.saveData)) film.src = wide;
  const start = (time) => {
    show();
    const go = () => {
      if (typeof time === 'number') film.currentTime = Math.min(time, (film.duration || 57.087) - 0.1);
      film.play().catch((e) => { if (e.name === 'NotSupportedError') fail(); });
    };
    if (typeof time === 'number' && film.readyState < 1) {
      film.addEventListener('loadedmetadata', go, { once: true });
      film.load();
      film.play().catch(() => {});
    } else go();
  };
  film.addEventListener('error', fail);
  film.addEventListener('play', show);
  document.querySelectorAll('[data-play]').forEach((b) => b.addEventListener('click', () => {
    start();
    if (b.classList.contains('play')) document.getElementById('watch').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  }));
  // Scenes and "watch this moment": bring the film into view and play from that second.
  document.querySelectorAll('[data-seek]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('watch').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    start(Number(a.dataset.seek));
  }));
})();
