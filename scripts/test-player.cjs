// Player fallback test (v27.20). The film page is loaded with its three addresses swapped for local test addresses
// that misbehave on purpose, and Play is pressed. Expected: an address that errors, never answers, answers with
// metadata but no pictures, or stops in the middle is replaced by the next one from the same second; a healthy one
// is never replaced. The clip is scripts/fixtures/clip.webm, an 8-second synthetic test pattern (VP9, so Chromium
// without H.264 can decode it), not the film. Nothing here touches Cloudflare, Tencent or GitHub.
// Usage: node scripts/test-player.cjs <page-url> <play-button-selector> [second-play-button-selector]
// The healthy cases are watched for 18 s (the clip runs at 0.4× so it does not end first), long enough for any
// wrong 10 s or 15 s timer to show itself. Added after an independent review (2026-10-25) caught that pressing Play
// again during playback switched address 10 s later.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright')); }

const [pageUrl, playSel, replaySel] = process.argv.slice(2);
if (!pageUrl || !playSel) { console.error('usage: node scripts/test-player.cjs <page-url> <play-button-selector>'); process.exit(2); }
const clip = fs.readFileSync(path.join(__dirname, 'fixtures', 'clip.webm'));
const hung = new Set();

// ok: the whole clip, with Range. err: 404. hang: never answers. meta: the first 200 KB, then nothing (Chromium has
// the clip's metadata but not one picture: measured 2026-10-25, it reads ~150–300 KB before it shows a frame).
// stall: the first 360 KB, then nothing (it plays 0.4 s and stops). slow: the whole clip at 120 KB/s, a bit above its bitrate (plain buffering).
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
  if (kind === 'err') { res.writeHead(404); res.end(); return; }
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
  if (kind === 'slow') {
    let at = 0;
    const tick = setInterval(() => { if (at >= body.length) { clearInterval(tick); res.end(); return; } res.write(body.subarray(at, at + 30000)); at += 30000; }, 250);
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
    { name: 'metadata but no pictures', list: ['meta', 'ok'], expect: 'ok', within: 22 },
    { name: 'stops in the middle (resumes at the same second)', list: ['stall', 'ok'], expect: 'ok', within: 40, resume: true },
    { name: 'paused, then resumed with the native controls', list: ['hang', 'ok'], expect: 'ok', within: 30, pauseResume: true },
    { name: 'healthy address, watched 18 s', list: ['ok', 'err'], expect: 'ok', within: 18, stays: true },
    { name: 'slow but steady address, watched 18 s', list: ['slow', 'err'], expect: 'slow', within: 18, stays: true },
    ...(replaySel ? [{ name: 'Play pressed again while playing, watched 18 s', list: ['ok', 'err'], expect: 'ok', within: 18, stays: true, replay: true }] : []),
  ];
  let failed = 0;
  for (const c of cases) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    const urls = c.list.map((k, i) => `${base}/clip/${k}.webm?n=${i}`);
    currentUrls = urls;
    const requested = [];
    page.on('request', (r) => { if (r.url().startsWith(`${base}/clip/`)) requested.push(r.url().split('/')[4].split('.')[0]); });
    await page.goto(base + target.pathname);
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
      if (!c.stays && kind === c.expect && state.t > (c.resume ? 1.2 : 0.5)) break;
    }
    const kind = state.src.split('/')[4]?.split('.')[0];
    const tried = [...new Set(requested)];
    const okCase = kind === c.expect && state.t > 0.5 && (!c.stays || (!tried.includes(c.list[1]) && !state.paused)) && (!c.resume || (firstOnExpect !== null && firstOnExpect >= 0.3));
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
