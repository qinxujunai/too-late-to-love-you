// Theme, the bar, the film in the first screen and the shot rail. Without JS: the plain video with its own controls,
// and a scrollable rail.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) root.classList.add('motion');
  document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('qxj.theme', next); } catch {}
  });

  // The bar turns solid (title + Play) once the key art has scrolled away.
  const bar = document.querySelector('[data-bar]');
  const hero = document.querySelector('.hero');
  if (bar && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { bar.classList.toggle('solid', !e.isIntersecting); }, { rootMargin: '-52px 0px 0px 0px' }).observe(hero);
  }

  const film = document.getElementById('film');
  const cover = document.querySelector('.cover');
  if (!film) return;
  // Wide screens get the full-bitrate original; phones keep the creator's web version. Neither loads until Play.
  const wide = film.dataset.wide;
  if (wide && matchMedia('(min-width: 1024px)').matches && !(navigator.connection && navigator.connection.saveData)) film.src = wide;
  // The film is the first screen (v24.1, as in v23): tap the picture and it plays right there, with the system
  // controls for full screen and rotation. Without JS the plain <video> with its own controls is shown.
  if (cover) cover.hidden = false;
  const reveal = () => { if (cover) cover.hidden = true; hero && hero.classList.add('playing'); };
  const play = (time) => {
    reveal();
    const go = () => {
      if (typeof time === 'number') film.currentTime = Math.min(time, (film.duration || 57.087) - 0.1);
      const p = film.play();
      if (p && p.catch) p.catch((e) => { if (e.name === 'NotSupportedError') document.getElementById('video-error').hidden = false; });
    };
    if (typeof time === 'number' && film.readyState < 1) { film.addEventListener('loadedmetadata', go, { once: true }); film.load(); }
    else go();
    if (scrollY > 0) scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    film.focus({ preventScroll: true });
  };
  film.addEventListener('play', reveal);
  film.addEventListener('error', () => { document.getElementById('video-error').hidden = false; });
  document.querySelectorAll('[data-play]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); play(); }));
  document.querySelectorAll('[data-seek]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); play(Number(a.dataset.seek)); }));

  // Shot rail: paddles move one card at a time.
  const rail = document.querySelector('[data-rail]');
  if (rail) {
    const prev = document.querySelector('[data-rail-prev]'), next = document.querySelector('[data-rail-next]');
    const step = () => (rail.querySelector('.card')?.getBoundingClientRect().width || 300) + 20;
    const sync = () => { prev.disabled = rail.scrollLeft < 4; next.disabled = rail.scrollLeft + rail.clientWidth > rail.scrollWidth - 4; };
    prev.addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }));
    next.addEventListener('click', () => rail.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }));
    rail.addEventListener('scroll', sync, { passive: true }); sync();
  }
})();
