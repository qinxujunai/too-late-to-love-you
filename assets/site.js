// Theme, the bar, the film in the first screen and the shot rail. Without JS: the plain video with its own controls,
// and a scrollable rail.
(() => {
  // Leftover from the removed 线路 switch (v26.1–26.2): forget it on every phone that saved it.
  try { localStorage.removeItem('qxj.line'); } catch {}
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
  // One file everywhere: the creator's 4K web version (about 7 Mbps); the 14 Mbps original is the download only.
  // Tested 2026-10-24: on a fast link Chromium already downloads the whole film ahead (a service worker forcing a
  // full-speed download changed nothing), so stalls come from links slower than the film's bitrate, not from buffering.
  // The film is the first screen (v24.1, as in v23): tap the picture and it plays right there, with the system
  // controls for full screen and rotation. Without JS the plain video element with its own controls is shown.
  if (cover) cover.hidden = false;
  const reveal = () => { if (cover) cover.hidden = true; hero && hero.classList.add('playing'); };
  // v26.1–26.2 tried his Bilibili upload as a domestic line (sandboxed embed); on his phone it would not play, and he
  // does not want a second line or a switch (2026-10-24). Removed: one player, one file.
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
  // With several <source>s the error lands on the last one, after the browser has tried them all.
  const lastSource = film.querySelector('source:last-of-type');
  if (lastSource) lastSource.addEventListener('error', () => { document.getElementById('video-error').hidden = false; });
  document.querySelectorAll('[data-play]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); play(); }));
  document.querySelectorAll('[data-seek]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); play(Number(a.dataset.seek)); }));

  // Shot carousel: arrows turn a whole page; dots show where you are. Arrows vanish at either end.
  const rail = document.querySelector('[data-rail]');
  if (rail) {
    const prev = document.querySelector('[data-rail-prev]'), next = document.querySelector('[data-rail-next]'), dots = document.querySelector('[data-dots]');
    const pages = () => Math.max(1, Math.ceil((rail.scrollWidth - 4) / (rail.clientWidth + 20)));
    const page = () => Math.round(rail.scrollLeft / (rail.clientWidth + 20));
    const sync = () => {
      prev.disabled = rail.scrollLeft < 4;
      next.disabled = rail.scrollLeft + rail.clientWidth > rail.scrollWidth - 4;
      const n = pages(), at = next.disabled ? n - 1 : page();
      if (dots.children.length !== n) dots.innerHTML = '<i></i>'.repeat(n);
      [...dots.children].forEach((d, i) => d.classList.toggle('on', i === at));
    };
    // Apple-style page turn: one eased glide (fast out, slow in, 0.65 s) instead of the browser's linear smooth scroll.
    // Snapping is paused while it moves so the two don't fight.
    let anim = 0;
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const turn = (dir) => {
      const from = rail.scrollLeft;
      const to = Math.max(0, Math.min(rail.scrollWidth - rail.clientWidth, (page() + dir) * (rail.clientWidth + 20)));
      if (reduce) { rail.scrollLeft = to; return; }
      cancelAnimationFrame(anim);
      rail.style.scrollSnapType = 'none';
      const t0 = performance.now(), dur = 650;
      const step = (now) => {
        const k = Math.min(1, (now - t0) / dur);
        rail.scrollLeft = from + (to - from) * ease(k);
        if (k < 1) anim = requestAnimationFrame(step); else rail.style.scrollSnapType = '';
      };
      anim = requestAnimationFrame(step);
    };
    prev.addEventListener('click', () => turn(-1));
    next.addEventListener('click', () => turn(1));
    rail.addEventListener('scroll', sync, { passive: true });
    addEventListener('resize', sync);
    sync();
  }
})();

// 「‹ 返回」 to his personal site, only for visitors who came from it: that site leaves 'qxj.back' in this tab's
// sessionStorage when someone clicks through. A link someone was sent directly opens with nothing set, so this page
// shows no way to his personal site (his rule, 2026-10-24). Contract: personal site repo, docs/back-link.md.
(function () {
  try {
    var u = sessionStorage.getItem('qxj.back'), a = document.querySelector('[data-qxj-back]');
    if (!u || !a || u.indexOf(location.origin + '/') !== 0) return;
    a.href = u;
    a.hidden = false;
    a.addEventListener('click', function (e) {
      if (document.referrer && document.referrer.split('#')[0] === u.split('#')[0]) { e.preventDefault(); history.back(); }
    });
  } catch (e) {}
})();
