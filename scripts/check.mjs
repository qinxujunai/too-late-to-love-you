import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const read=p=>fs.readFileSync(p,'utf8');
const pages=['index.html','en/index.html','archive/index.html'];
for(const p of pages){
  assert.ok(fs.existsSync(p),`${p} must be built`);
  const h=read(p);
  assert.equal((h.match(/<h1\b/g)||[]).length,1,`${p}: one h1`);
  assert.ok(!/<(?:script|img|source|video|iframe)\b[^>]*\s(?:src|poster)="https?:/i.test(h),`${p}: same-origin resources only`);
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
  assert.ok(/<video[^>]*src="(?:\.\.\/)?media\/film-mobile\.mp4"/.test(h),`${p}: plays the creator's 4K web version`);
  assert.ok(/href="(?:\.\.\/)?media\/film-mobile\.mp4" download/.test(h),`${p}: download is the same single file`);
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
console.log('PASS: 3 pages, bilingual structure, local references, one deferred player on the creator\'s web version, one video file for play and download, descriptions, timecodes, byte-identical web version and cover');
