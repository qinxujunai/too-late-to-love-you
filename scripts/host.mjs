// Switch where the film plays and downloads from, on both sites at once.
// Usage: npm run host -- tencent | cloudflare
// 1. Checks that the target host serves the exact file (Range answer, size, MD5 ETag; and "attachment" on its download
//    address). If not, nothing changes.
// 2. Sets "active" in src/hosts.json and ships this site (npm run ship). Refuses to start with other uncommitted work, so
//    the commit holds only the switch. Safe to rerun after a failure: ship also pushes a commit an earlier run left.
// 3. Waits until the published hosts.json shows the new host, then ships the personal site, which reads that file
//    (its scripts/film-hosts.mjs). The personal site is found at $PERSONAL_SITE or ../qinxujunai.github.io; without
//    it, the one command to run there is printed.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

if (execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim()) {
  console.error('there are uncommitted changes here: ship or put them aside first, so the switch is a commit of its own');
  process.exit(1);
}

const to = process.argv[2];
const file = 'src/hosts.json';
const hosts = JSON.parse(fs.readFileSync(file, 'utf8'));
if (!hosts.hosts[to]) { console.error(`usage: npm run host -- ${Object.keys(hosts.hosts).join(' | ')}`); process.exit(2); }
const LIVE = 'https://qinxujunai.github.io/too-late-to-love-you/hosts.json';

async function serves(url, { attachment = false } = {}) {
  const r = await fetch(url, { headers: { Range: 'bytes=0-1023' }, signal: AbortSignal.timeout(20000) });
  const problems = [];
  if (r.status !== 206) problems.push(`status ${r.status}`);
  if (!(r.headers.get('content-range') || '').endsWith(`/${hosts.file.bytes}`)) problems.push(`size ${r.headers.get('content-range')}`);
  if ((r.headers.get('etag') || '').replace(/"/g, '') !== hosts.file.md5) problems.push(`ETag ${r.headers.get('etag')} is not the file's MD5`);
  if (attachment && !/attachment/i.test(r.headers.get('content-disposition') || '')) problems.push('no "attachment" header, so the link would play instead of download');
  await r.body?.cancel();
  return problems;
}

const target = hosts.hosts[to];
const problems = await Promise.all([serves(target.play), serves(target.download, { attachment: true })]).then(([a, b]) => [...a.map((p) => `play: ${p}`), ...b.map((p) => `download: ${p}`)], (e) => [`no answer (${e.message})`]);
if (problems.length) { console.error(`${to} is not ready, nothing changed:\n  ${problems.join('\n  ')}`); process.exit(1); }
console.log(`${to} serves the film (${hosts.file.bytes} bytes, MD5 ${hosts.file.md5}).`);

const msg = `视频改用 ${target.name}`;
if (hosts.active !== to) {
  hosts.active = to;
  fs.writeFileSync(file, JSON.stringify(hosts, null, 2) + '\n');
}
// Ships the switch, or a switch commit an earlier run left unpushed; says "nothing to ship" if it is already live.
execFileSync('bash', ['scripts/ship.sh', msg], { stdio: 'inherit' });

const personal = [process.env.PERSONAL_SITE, '../qinxujunai.github.io'].find((d) => d && fs.existsSync(path.join(d, 'scripts/film-hosts.mjs')));
if (!personal) { console.log(`\nNow ship the personal site so it follows (it reads ${LIVE}):\n  cd <qinxujunai.github.io> && npm run ship -- "${msg}"`); process.exit(0); }
console.log(`waiting for ${LIVE} to show ${to} (GitHub Pages deploys in a minute or two)…`);
for (let i = 0; ; i++) {
  try { if ((await (await fetch(`${LIVE}?t=${Date.now()}`, { signal: AbortSignal.timeout(20000) })).json()).active === to) break; } catch {}
  if (i >= 40) { console.error(`the published hosts.json still does not show ${to} after 10 minutes; ship the personal site once it does`); process.exit(1); }
  await new Promise((r) => setTimeout(r, 15000));
}
execFileSync('npm', ['run', 'ship', '--', msg], { cwd: personal, stdio: 'inherit' });
