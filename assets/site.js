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
  // The film is the first screen (v24.1): tap the picture and it plays right there, with the system controls for
  // full screen and rotation. Without JS the plain video element with its own controls is shown.
  if (cover) cover.hidden = false;
  const reveal = () => { if (cover) cover.hidden = true; hero && hero.classList.add('playing'); };
  // Hosts (src/hosts.json): the active one is on src, the other follows it in data-sources. The other is used only when
  // the active one cannot be reached at all: an error, or nothing at all (not even the file's header) within 10 s of
  // Play. A slow host is never switched away from (his rule, 2026-10-25). scripts/test-player.cjs checks each case.
  const sources = (film.dataset.sources || '').split(' ').filter(Boolean);
  let at = 0, guard = 0, want = null;
  const last = () => at >= sources.length - 1;
  const showError = () => { document.getElementById('video-error').hidden = false; };
  // Armed by every 'play' (the cover, the buttons, the native controls) while nothing has arrived; cleared as soon as
  // any bytes arrive ('progress': a slow host is not a dead one), by the file's header and by a pause. On the last
  // address there is nothing to switch to: the message shows instead.
  let arrived = false;
  const arm = () => { if (film.readyState > 0 || arrived) return; clearTimeout(guard); guard = setTimeout(() => { if (film.readyState === 0 && !arrived) next(); }, 10000); };
  const go = () => {
    const seek = () => { if (typeof want === 'number') { film.currentTime = Math.min(want, (film.duration || 57.087) - 0.1); want = null; } };
    if (typeof want === 'number') { if (film.readyState >= 1) seek(); else film.addEventListener('loadedmetadata', seek, { once: true }); }
    // A failing address also rejects play(); the 'error' event below handles it, so the rejection is ignored here
    // (reading it as "the last address failed" showed the error over a film that was playing, 2026-10-25).
    const p = film.play();
    if (p && p.catch) p.catch(() => {});
  };
  const next = () => {
    clearTimeout(guard);
    if (last()) { showError(); return; }
    if (want === null && film.currentTime) want = film.currentTime;
    arrived = false;
    film.src = sources[++at];
    film.load();
    go();
  };
  const play = (time) => {
    reveal();
    if (typeof time === 'number') want = time;
    go();
    if (scrollY > 0) scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    film.focus({ preventScroll: true });
  };
  film.addEventListener('play', reveal);
  film.addEventListener('play', arm);
  film.addEventListener('error', next);
  film.addEventListener('progress', () => { arrived = true; clearTimeout(guard); });
  // The last address may still answer late, after its message showed: then the message goes.
  film.addEventListener('loadedmetadata', () => { clearTimeout(guard); document.getElementById('video-error').hidden = true; });
  film.addEventListener('pause', () => clearTimeout(guard));
  document.querySelectorAll('[data-play]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); play(); }));
  document.querySelectorAll('[data-seek]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); play(Number(a.dataset.seek)); }));

  // A whole shot or craft card plays from its time (unless text is being selected or a link was hit).
  document.querySelectorAll('.card, .craft-grid > li').forEach((card) => card.addEventListener('click', (e) => {
    const link = card.querySelector('[data-seek]');
    if (!link || e.target.closest('a') || String(getSelection())) return;
    link.click();
  }));

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

// 越轴 diagram: switch between camera A and camera B to see which way she walks in each.
(() => {
  const svg = document.querySelector('.axis-svg'), group = document.querySelector('.axis-cams');
  if (!svg || !group) return;
  group.hidden = false;
  group.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
    svg.dataset.cam = b.dataset.cam;
    group.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  }));
})();
