import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const read=p=>fs.readFileSync(p,'utf8');
const pages=['index.html','en/index.html','archive/index.html'];
for(const p of pages){
  assert.ok(fs.existsSync(p),`${p} must be built`);
  const h=read(p);
  assert.equal((h.match(/<h1\b/g)||[]).length,1,`${p}: one h1`);
  // The only other-origin resources: the film itself on Tencent Cloud and Cloudflare R2 (AGENTS.md「视频放在哪」).
  const FILM_HOSTS=/^https:\/\/(media-1416754078\.cos\.ap-shanghai\.myqcloud\.com|media\.praxisai\.online)\/too-late-to-love-you\.mp4$/;
  const foreign=[...h.matchAll(/<(?:script|img|source|video|iframe)\b[^>]*\s(?:src|poster)="(https?:[^"]+)"/gi)].map(m=>m[1]).filter(u=>!FILM_HOSTS.test(u));
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
  assert.ok(/<video id="film" src="https:\/\/media\.praxisai\.online\/too-late-to-love-you\.mp4" data-sources="https:[^" ]+too-late-to-love-you\.mp4 https:[^" ]+too-late-to-love-you\.mp4 (?:\.\.\/)?media\/film-mobile\.mp4"[^>]*x5-playsinline/.test(h),`${p}: plays the creator's 4K web version from src (WeChat reads only src): Cloudflare, then Tencent, then this repository`);
  assert.ok(!/<source\b/.test(h),`${p}: no <source> children (WeChat's player ignores them)`);
  assert.ok(/href="https:\/\/media-1416754078\.cos\.ap-shanghai\.myqcloud\.com\/too-late-to-love-you\.mp4" download/.test(h),`${p}: download is the same single file`);
  assert.ok(!h.includes('film-original'),`${p}: the 100 MB file is gone (his decision, 2026-10-24)`);
  assert.equal((h.match(/<video\b/g)||[]).length,1,`${p}: one player`);
}
const ids=h=>[...h.matchAll(/\sid="([^"]+)"/g)].map(x=>x[1]);
assert.deepEqual(ids(read(pages[0])),ids(read(pages[1])),'language structure stays aligned');
assert.ok(!fs.existsSync('media/film-original.mp4'),'only one video file is published');
const mobile=JSON.parse(read('src/mobile-media-manifest.json'));
assert.equal(crypto.createHash('sha256').update(fs.readFileSync('media/film-mobile.mp4')).digest('hex'),mobile.video.sha256,'web version is the creator supplied file, byte for byte');
assert.equal(crypto.createHash('sha256').update(fs.readFileSync('assets/poster-mobile.jpg')).digest('hex'),mobile.cover.sha256,'cover is the creator supplied file, byte for byte');
for(const p of pages.slice(0,2))assert.ok(Buffer.byteLength(read(p))<180000,'readable HTML budget');
// Copy lock (2026-10-24): the copy is final; a changed word fails until the owner agrees and `npm run lock` records it.
const {checkCopy}=await import('./copy-lock.mjs');
const copyProblems=checkCopy(pages);
assert.equal(copyProblems.length,0,copyProblems.join('\n'));
console.log('PASS: copy matches copy.lock.json, no relative time words, 3 pages, bilingual structure, local references, one deferred player on the creator\'s web version, one video file for play and download, descriptions, timecodes, byte-identical web version and cover');
