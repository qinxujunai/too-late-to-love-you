// Browser acceptance for the film site (rewritten 2026-10-25 for the current page: one player #film in the first
// screen, making cards, craft cards, the 越轴 diagram).
// Usage: npm run serve &  then  npm run qa            (or FILM_BASE=https://qinxujunai.github.io/too-late-to-love-you/)
//
// What it checks, on zh / en / archive × phone 390 / desktop 1440 × light / dark:
//   no video request before Play · same-origin only · no console or HTTP errors · no sideways scroll · axe WCAG AA ·
//   the theme switch works · Play plays in place (first address requested is Cloudflare, the page stays at the top).
// Seeking: every card and "从 0:12 看" link is clicked and must land on its second. The page is served through a small
//   local proxy that swaps the film for scripts/fixtures/seek.webm, a 60-second synthetic test pattern (VP9, which
//   this Chromium can decode). That proves the page logic, not the film file.
// The film itself: only played when the browser can decode H.264 (canPlayType). The cloud Chromium cannot, and then
//   the result is printed as NOT TESTED, never as passed. A phone or WeChat is never simulated by changing the UA.
// Also: without JS the video and every card are still there; the three film addresses answer Range requests.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright')); }

const base = (process.env.FILM_BASE || 'http://127.0.0.1:4174/').replace(/\/?$/, '/');
const axePath = [process.env.AXE_SOURCE_PATH, (() => { try { return require.resolve('axe-core/axe.min.js'); } catch { return ''; } })()].find((p) => p && fs.existsSync(p));
if (!axePath) { console.error('axe-core is missing: run npm install'); process.exit(1); }
const axe = fs.readFileSync(axePath, 'utf8');
const exe = [process.env.CHROME_PATH, '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find((p) => p && fs.existsSync(p));
const seekClip = fs.readFileSync(path.join(__dirname, 'fixtures', 'seek.webm'));
const SOURCES = ['https://media.praxisai.online/too-late-to-love-you.mp4', 'https://media-1416754078.cos.ap-shanghai.myqcloud.com/too-late-to-love-you.mp4'];

const issues = [];
const notTested = [];
const check = (cond, label) => { console.log(`${cond ? 'PASS' : 'FAIL'} ${label}`); if (!cond) issues.push(label); };

// Serves the site from `base`, with the video's addresses swapped for the synthetic seek clip.
function proxy() {
  const server = http.createServer(async (req, res) => {
    if (req.url.startsWith('/__clip/')) {
      const m = /bytes=(\d+)-(\d*)/.exec(req.headers.range || '');
      const start = m ? Number(m[1]) : 0;
      const end = m && m[2] ? Number(m[2]) : seekClip.length - 1;
      res.writeHead(m ? 206 : 200, { 'Content-Type': 'video/webm', 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1, ...(m ? { 'Content-Range': `bytes ${start}-${end}/${seekClip.length}` } : {}) });
      res.end(seekClip.subarray(start, end + 1));
      return;
    }
    try {
      const up = await fetch(new URL(req.url.replace(/^\//, ''), base));
      const type = up.headers.get('content-type') || '';
      let body = Buffer.from(await up.arrayBuffer());
      if (type.includes('text/html')) body = Buffer.from(body.toString('utf8').replace(/(<video id="film" src=")[^"]+(" data-sources=")[^"]+"/, '$1/__clip/seek.webm$2/__clip/seek.webm"'));
      res.writeHead(up.status, { 'Content-Type': type });
      res.end(body);
    } catch (e) { res.writeHead(502); res.end(String(e)); }
  });
  return new Promise((r) => server.listen(0, '127.0.0.1', () => r(server)));
}

(async () => {
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const origin = new URL(base).origin;

  for (const p of ['', 'en/', 'archive/']) for (const w of [390, 1440]) for (const theme of ['light', 'dark']) {
    const id = `${p.replace('/', '') || 'zh'}-${w}-${theme}`;
    const ctx = await browser.newContext({ viewport: { width: w, height: w === 390 ? 844 : 900 }, colorScheme: theme, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const errors = [];
    const foreign = [];
    const video = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
    page.on('request', (r) => { const u = r.url(); if (/\.mp4(?:[?#]|$)/.test(u)) video.push(u); else if (!u.startsWith(origin) && !u.startsWith('data:')) foreign.push(u); });
    await page.goto(base + p, { waitUntil: 'networkidle' });
    check(video.length === 0, `${id} no video request before Play`);
    check(foreign.length === 0, `${id} same-origin only ${foreign.join(' ')}`);
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${id} no sideways scroll`);
    await page.addScriptTag({ content: axe });
    const violations = await page.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] })).violations.map((v) => `${v.id}:${v.nodes.length}`));
    check(violations.length === 0, `${id} axe ${violations.join(' ')}`);
    const before = await page.evaluate(() => document.documentElement.dataset.theme || '');
    await page.locator('[data-theme-toggle]').click();
    check(await page.evaluate((b) => (document.documentElement.dataset.theme || '') !== b, before), `${id} theme switches`);
    if (p !== 'archive/') {
      check(await page.locator('#film').count() === 1 && await page.locator('video').count() === 1, `${id} one player`);
      // Play in place: the cover goes, the first address asked for is Cloudflare, the page does not move.
      await page.locator('.cover').click();
      await page.waitForTimeout(800);
      check(await page.locator('.cover').isHidden(), `${id} the cover makes way for the film`);
      check(video[0] === SOURCES[0], `${id} first address is Cloudflare (${video[0] || 'none'})`);
      check(await page.evaluate(() => scrollY) < 5, `${id} plays in place at the top`);
      if (w === 1440 && theme === 'light') {
        const h264 = await page.locator('#film').evaluate((v) => v.canPlayType('video/mp4; codecs="avc1.640033"'));
        if (!h264) notTested.push(`${id}: the film itself (this browser cannot decode H.264)`);
        else {
          try {
            await page.waitForFunction(() => document.getElementById('film').currentTime > 1, null, { timeout: 20000 });
            check(true, `${id} the film itself plays (${await page.locator('#film').evaluate((v) => v.currentSrc)})`);
          } catch { check(false, `${id} the film itself plays`); }
        }
      }
      await page.locator('#film').evaluate((v) => v.pause());
    }
    if (errors.length) check(false, `${id} console/network ${errors.join(' ; ')}`); else check(true, `${id} no console or HTTP errors`);
    await ctx.close();
  }

  // Seeking, on the synthetic clip.
  const server = await proxy();
  const pbase = `http://127.0.0.1:${server.address().port}/`;
  for (const w of [390, 1440]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w === 390 ? 844 : 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(pbase, { waitUntil: 'networkidle' });
    const targets = await page.evaluate(() => [
      ...[...document.querySelectorAll('.card')].map((el, i) => ({ sel: `.card >> nth=${i}`, t: Number(el.querySelector('[data-seek]').dataset.seek), what: `making card ${i + 1}` })),
      ...[...document.querySelectorAll('.craft-grid > li')].map((el, i) => ({ sel: `.craft-grid > li >> nth=${i}`, t: Number(el.querySelector('[data-seek]').dataset.seek), what: `craft card ${i + 1}` })),
      { sel: '.axis .seek', t: Number(document.querySelector('.axis .seek').dataset.seek), what: '越轴 link' },
    ]);
    for (const tg of targets) {
      const el = page.locator(tg.sel);
      await el.scrollIntoViewIfNeeded();
      // A whole card plays from its time: click its text, not its link (the link alone is the '越轴' case).
      if (tg.what.includes('card')) await el.locator('h3').click(); else await el.click();
      let at = -1;
      try {
        await page.waitForFunction((t) => { const v = document.getElementById('film'); return !v.paused && Math.abs(v.currentTime - t) < 0.8; }, tg.t, { timeout: 8000 });
        at = await page.locator('#film').evaluate((v) => v.currentTime);
      } catch { at = await page.locator('#film').evaluate((v) => v.currentTime); }
      check(Math.abs(at - tg.t) < 0.8 && await page.evaluate(() => scrollY) < 5, `seek ${w}: ${tg.what} → ${tg.t} s (at ${at.toFixed(1)} s, back at the top)`);
      await page.locator('#film').evaluate((v) => v.pause());
    }
    await ctx.close();
  }
  server.close();

  // Without JS: the plain video with its own controls, and every card's text.
  const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const np = await nojs.newPage();
  await np.goto(base);
  check(await np.locator('h1').isVisible(), 'no JS: title');
  check(await np.locator('#film').isVisible() && await np.locator('#film').evaluate((v) => v.controls), 'no JS: the video with its own controls');
  check(await np.locator('.card').count() === 7 && await np.locator('.craft-grid > li').count() === 6, 'no JS: 7 making cards and 6 craft cards');
  await nojs.close();
  await browser.close();

  // Range (needed for seeking): the local copy and both hosts answer 1 KB of the same file.
  for (const u of [new URL('media/film-mobile.mp4', base).href, ...SOURCES]) {
    try {
      const r = await fetch(u, { headers: { Range: 'bytes=0-1023' } });
      check(r.status === 206 && Number(r.headers.get('content-length')) === 1024 && /\/51065030$/.test(r.headers.get('content-range') || ''), `Range ${u}`);
    } catch (e) { check(false, `Range ${u} (${e.message})`); }
  }

  for (const n of notTested) console.log(`NOT TESTED ${n}`);
  if (issues.length) { console.error(`\n${issues.length} check(s) failed`); process.exit(1); }
  console.log(`\nall film checks passed${notTested.length ? ` (${notTested.length} not tested in this browser, see above)` : ''}`);
})().catch((e) => { console.error(e); process.exit(1); });
