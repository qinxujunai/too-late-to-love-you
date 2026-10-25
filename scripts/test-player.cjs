// Player fallback test (2026-10-25). The film page is loaded with its two addresses (src/hosts.json: the active host,
// then the other) swapped for local test addresses that misbehave on purpose, and Play is pressed. His rule: the other
// host is used only when the active one cannot be reached at all. Expected: an address that errors, never answers, or
// dies in the middle is replaced by the next one, from the same second; one that is slow, stalls, or sends the file's
// header and then nothing more is never replaced. The clip is scripts/fixtures/clip.webm, an 8-second synthetic test pattern (VP9, so Chromium
// without H.264 can decode it), not the film. Nothing here touches Cloudflare, Tencent or GitHub.
// Usage: node scripts/test-player.cjs <page-url> <play-button-selector> [second-play-button-selector]
// The cases that must not switch are watched for 18 s (the clip runs at 0.4× so it does not end first), long enough for
// any wrong timer to show itself.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright')); }

const [pageUrl, playSel, replaySel] = process.argv.slice(2);
if (!pageUrl || !playSel) { console.error('usage: node scripts/test-player.cjs <page-url> <play-button-selector>'); process.exit(2); }
const clip = fs.readFileSync(path.join(__dirname, 'fixtures', 'clip.webm'));
const hung = new Set();
let died = false;

// ok: the whole clip, with Range. err: 404. hang: never answers. meta: the first 200 KB, then nothing (Chromium has
// the clip's metadata but not one picture: measured 2026-10-25, it reads ~150–300 KB before it shows a frame).
// stall: the first 360 KB, then nothing (it plays 0.4 s and stops). slow: the whole clip at 70 KB/s, below its bitrate
// (it plays, waits, plays). trickle: 100 bytes every 250 ms (alive, but not even the header within 10 s). dies: the first 360 KB, then the connection is cut and every later request fails with 503.
// Everything that is not a test clip is fetched from the real page's server and passed through, so the page runs on
// this origin with its own site.js; only the video tag's addresses are swapped. (Playwright's page.route would be
// simpler, but with request interception on, Chromium never sends the video requests.)
const target = new URL(pageUrl);
let currentUrls = [];
const server = http.createServer(async (req, res) => {
  if (!req.url.startsWith('/clip/')) {
    try {
      const up = await fetch(new URL(req.url, target.origin));
      const type = up.headers.get('content-type') || '';
      let body = Buffer.from(await up.arrayBuffer());
      if (type.includes('text/html')) body = Buffer.from(body.toString('utf8').replace(/(<video id="film" src=")[^"]+(" data-sources=")[^"]+"/, `$1${currentUrls[0]}$2${currentUrls.join(' ')}"`));
      res.writeHead(up.status, { 'Content-Type': type });
      res.end(body);
    } catch (e) { res.writeHead(502); res.end(String(e)); }
    return;
  }
  const kind = req.url.split('/')[2].replace(/\.webm.*/, '');
  hung.add(res);
  if (kind === 'err' || (kind === 'dies' && died)) { res.writeHead(kind === 'err' ? 404 : 503); res.end(); return; }
  if (kind === 'hang') return;
  const head = { 'Content-Type': 'video/webm', 'Accept-Ranges': 'bytes', 'Access-Control-Allow-Origin': '*' };
  const m = /bytes=(\d+)-(\d*)/.exec(req.headers.range || '');
  const start = m ? Number(m[1]) : 0;
  const end = m && m[2] ? Number(m[2]) : clip.length - 1;
  res.writeHead(m ? 206 : 200, { ...head, 'Content-Length': end - start + 1, ...(m ? { 'Content-Range': `bytes ${start}-${end}/${clip.length}` } : {}) });
  const body = clip.subarray(start, end + 1);
  if (kind === 'ok') { res.end(body); return; }
  if (kind === 'meta') { res.write(body.subarray(0, Math.max(0, 200000 - start))); return; }
  if (kind === 'stall') { res.write(body.subarray(0, Math.max(0, 360000 - start))); return; }
  if (kind === 'dies') { died = true; res.write(body.subarray(0, Math.max(0, 360000 - start)), () => setTimeout(() => res.destroy(), 1500)); return; }
  if (kind === 'trickle') {
    let at = 0;
    const tick = setInterval(() => { if (at >= body.length || res.destroyed) { clearInterval(tick); return; } res.write(body.subarray(at, at + 100)); at += 100; }, 250);
    return;
  }
  if (kind === 'slow') {
    let at = 0;
    const tick = setInterval(() => { if (at >= body.length) { clearInterval(tick); res.end(); return; } res.write(body.subarray(at, at + 17500)); at += 17500; }, 250);
    return;
  }
  res.writeHead(400); res.end();
});

(async () => {
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', process.env.CHROME_PATH].find((p) => p && fs.existsSync(p));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const cases = [
    { name: 'address errors', list: ['err', 'ok'], expect: 'ok', within: 6 },
    { name: 'address never answers', list: ['hang', 'ok'], expect: 'ok', within: 16 },
    { name: 'paused, then resumed with the native controls, address never answers', list: ['hang', 'ok'], expect: 'ok', within: 30, pauseResume: true },
    { name: 'both addresses fail: the message shows', list: ['err', 'err'], expect: 'err', within: 6, error: true },
    { name: 'address dies in the middle (resumes at the same second)', list: ['dies', 'ok'], expect: 'ok', within: 40, resume: true },
    { name: 'healthy address, watched 18 s', list: ['ok', 'err'], expect: 'ok', within: 18, stays: true },
    { name: 'slow address (below the bitrate), not replaced, watched 18 s', list: ['slow', 'err'], expect: 'slow', within: 18, stays: true },
    { name: 'stalls in the middle, not replaced, watched 18 s', list: ['stall', 'err'], expect: 'stall', within: 18, stays: true, still: true },
    { name: 'answers but trickles (not even the header in 10 s), not replaced, watched 18 s', list: ['trickle', 'err'], expect: 'trickle', within: 18, stays: true, still: true },
    { name: 'the last address never answers either: the message shows', list: ['hang', 'hang'], expect: 'hang', within: 24, error: true },
    { name: 'sends the header and then nothing, not replaced, watched 18 s', list: ['meta', 'err'], expect: 'meta', within: 18, stays: true, still: true },
    ...(replaySel ? [{ name: 'Play pressed again while playing, watched 18 s', list: ['ok', 'err'], expect: 'ok', within: 18, stays: true, replay: true }] : []),
  ];
  let failed = 0;
  for (const c of cases) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    const urls = c.list.map((k, i) => `${base}/clip/${k}.webm?n=${i}`);
    currentUrls = urls;
    died = false;
    const requested = [];
    page.on('request', (r) => { if (r.url().startsWith(`${base}/clip/`)) requested.push(r.url().split('/')[4].split('.')[0]); });
    await page.goto(base + target.pathname);
    if (c.error && !(await page.$('#video-error'))) { console.log(`- ${c.name}: skipped (this page has no error message)`); await ctx.close(); continue; }
    if (c.stays) await page.$eval('#film', (v) => { v.defaultPlaybackRate = 0.4; v.playbackRate = 0.4; });
    await page.click(playSel);
    const t0 = Date.now();
    if (c.pauseResume) { await page.waitForTimeout(2000); await page.$eval('#film', (v) => v.pause()); await page.waitForTimeout(1000); await page.$eval('#film', (v) => v.play().catch(() => {})); }
    if (c.replay) { await page.waitForTimeout(1500); await page.locator(replaySel).first().click(); }
    let state, firstOnExpect = null;
    while (Date.now() - t0 < c.within * 1000) {
      await page.waitForTimeout(500);
      state = await page.$eval('#film', (v) => ({ src: v.currentSrc, t: v.currentTime, ready: v.readyState, paused: v.paused }));
      const kind = state.src.split('/')[4]?.split('.')[0];
      if (kind === c.expect && firstOnExpect === null && state.ready >= 1) firstOnExpect = state.t;
      if (!c.stays && !c.error && kind === c.expect && state.t > (c.resume ? 1.2 : 0.5)) break;
    }
    const kind = state.src.split('/')[4]?.split('.')[0];
    const tried = [...new Set(requested)];
    // A stuck address ('still') shows little or nothing: what matters is that it was kept, and no error was shown.
    const shown = await page.$eval('#video-error', (e) => !e.hidden).catch(() => false);
    const okCase = c.error ? shown : kind === c.expect && !shown && (c.still || state.t > 0.5) && (!c.stays || (!tried.includes(c.list[1]) && (c.still || !state.paused))) && (!c.resume || (firstOnExpect !== null && firstOnExpect >= 0.3));
    console.log(`${okCase ? '✓' : '✗'} ${c.name}: tried ${tried.join(' → ')}, playing ${kind} at ${state.t.toFixed(1)} s${c.resume ? ` (picked up at ${firstOnExpect?.toFixed(1)} s)` : ''} after ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    if (!okCase) failed++;
    await ctx.close();
  }
  await browser.close();
  for (const r of hung) r.destroy();
  server.close();
  if (failed) { console.error(`${failed} player case(s) failed`); process.exit(1); }
  console.log('player fallback: all cases behave');
})().catch((e) => { console.error(e); process.exit(1); });
