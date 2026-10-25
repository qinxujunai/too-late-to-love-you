import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(p,'utf8');
const pages=['index.html','en/index.html','archive/index.html'];
// Where the film comes from (src/hosts.json): exactly two hosts, one active, each with a play and a download address.
const hosts=JSON.parse(read('src/hosts.json'));
assert.deepEqual(Object.keys(hosts.hosts).sort(),['cloudflare','tencent'],'hosts.json: the two hosts');
assert.ok(hosts.hosts[hosts.active],`hosts.json: active must be tencent or cloudflare, not ${hosts.active}`);
for(const [k,h] of Object.entries(hosts.hosts))assert.ok(/^https:\/\/[^/]+\/too-late-to-love-you\.mp4$/.test(h.play)&&h.download.startsWith(h.play),`hosts.json: ${k} play and download addresses`);
const ACTIVE=hosts.hosts[hosts.active], BACKUP=Object.entries(hosts.hosts).find(([k])=>k!==hosts.active)[1];
const filmUrls=new Set(Object.values(hosts.hosts).flatMap(h=>[h.play,h.download]));
assert.ok(fs.existsSync('hosts.json'),'hosts.json is missing: run npm run build');
assert.deepEqual(JSON.parse(read('hosts.json')),{active:hosts.active,hosts:hosts.hosts,file:hosts.file},'the published hosts.json matches src/hosts.json (run npm run build)');
for(const p of pages){
  assert.ok(fs.existsSync(p),`${p} must be built`);
  const h=read(p);
  assert.equal((h.match(/<h1\b/g)||[]).length,1,`${p}: one h1`);
  // The only other-origin resources: the film on its two hosts (src/hosts.json).
  const foreign=[...h.matchAll(/<(?:script|img|source|video|iframe)\b[^>]*\s(?:src|poster)="(https?:[^"]+)"/gi)].map(m=>m[1]).filter(u=>!filmUrls.has(u));
  assert.ok(!foreign.length,`${p}: same-origin resources only (${foreign.join(', ')})`);
  for(const m of h.matchAll(/(?:src|href|poster)="([^"#]+)"/g)){
    const u=m[1].split('#')[0];
    if(/^(https?:|data:)/.test(u))continue;
    const path=new URL(u,'file:///'+p).pathname.slice(1)||'index.html';
    assert.ok(fs.existsSync(path.endsWith('/')?path+'index.html':path),`${p}: missing ${path}`);
  }
}
for(const p of pages.slice(0,2)){
  const h=read(p);
  assert.ok(/<video[^>]*preload="none"/.test(h),`${p}: user chooses when video downloads`);
  assert.ok(!/<video[^>]*autoplay/.test(h),`${p}: no autoplay`);
  assert.equal((h.match(/data-seek="/g)||[]).length>=7,true,`${p}: real timecode navigation`);
  assert.ok(h.includes('kind="descriptions"'),`${p}: scene descriptions available`);
  assert.ok(h.includes(`<video id="film" src="${ACTIVE.play}" data-sources="${ACTIVE.play} ${BACKUP.play}"`)&&/<video id="film"[^>]*x5-playsinline/.test(h),`${p}: plays from the active host on src (WeChat reads only src), the other host as the only fallback`);
  assert.ok(!/<source\b/.test(h),`${p}: no <source> children (WeChat's player ignores them)`);
  const dl=[...h.matchAll(/class="download" href="([^"]+)"|<a href="([^"]+)" download=/g)].map(m=>(m[1]||m[2]).replace(/&amp;/g,'&'));
  assert.ok(dl.length>=2&&dl.every(u=>u===ACTIVE.download),`${p}: every download link uses the active host (${dl.join(' ')})`);
  assert.ok(!/film-mobile\.mp4/.test(h),`${p}: no copy of the film in this repository is used`);
  assert.ok(!h.includes('film-original'),`${p}: the 100 MB file is gone (his decision, 2026-10-24)`);
  assert.equal((h.match(/<video\b/g)||[]).length,1,`${p}: one player`);
}
const ids=h=>[...h.matchAll(/\sid="([^"]+)"/g)].map(x=>x[1]);
assert.deepEqual(ids(read(pages[0])),ids(read(pages[1])),'language structure stays aligned');
// The film lives only on the two hosts (2026-10-25: GitHub Pages does not play in mainland China, so the copy here was
// no use as a fallback). Its fingerprint is in src/hosts.json; npm run qa checks both hosts serve that exact file.
assert.ok(!fs.readdirSync('media').some(f=>/\.(mp4|mov|m4v|webm)$/i.test(f)),'no video file in this repository');
for(const p of pages.slice(0,2))assert.ok(Buffer.byteLength(read(p))<180000,'readable HTML budget');
// scripts/push.sh says "pushed" only after a real push (2026-10-25: the old loop printed it after four refused pushes).
{ const {execSync}=await import('node:child_process'); try{execSync('bash scripts/test-push.sh',{stdio:'pipe'})}catch(e){assert.fail('push.sh: '+(e.stdout||e.message))} }
// The docs describe the current site (2026-10-25: the README still described a 9-part timeline and no external requests).
{ const r=read('README.md'); assert.ok(!/9 段|6 项制作决定|无外部资源请求|laibuji-aini\/|film-mobile|manifest\.json|`docs\/(?!film-hosting)/.test(r),'README describes an old version of the site'); }
// Copy lock (2026-10-24): the copy is final; a changed word fails until the owner agrees and `npm run lock` records it.
const {checkCopy}=await import('./copy-lock.mjs');
const copyProblems=checkCopy(pages);
assert.equal(copyProblems.length,0,copyProblems.join('\n'));
console.log('PASS: copy matches copy.lock.json, no relative time words, 3 pages, bilingual structure, local references, one deferred player on the active host with the other as fallback, downloads on the active host, descriptions, timecodes');
