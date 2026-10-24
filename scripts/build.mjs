// Builds the film site: Chinese and English film pages, the production record, scene descriptions, sitemap.
// v26 (2026-10-24): the film; why he made it; how (seven shots); the film basics that let him name each problem
// (越轴 first); the tools, under his line about ideas being the limit; his closing words; credits.
// The stylesheet is inlined so the first screen needs one request.
import fs from 'node:fs';
import {film,copy,chapters,shots,axis,craft,skills,muse,prompt} from '../src/content.mjs';

const esc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const tc=n=>`00:${n.toFixed(2).padStart(5,'0')}`;
// Times people read: 0:21, not 00:21.50.
const mmss=n=>`${Math.floor(n/60)}:${String(Math.floor(n%60)).padStart(2,'0')}`;
const write=(p,s)=>{fs.mkdirSync(p.slice(0,p.lastIndexOf('/'))||'.',{recursive:true});fs.writeFileSync(p,s)};
const SITE=`${film.home}${film.slug}/`;
// The script is inlined at the end of each page (2026-10-24): a phone that kept an old script for a few minutes
// paired it with a new page and opened a player that no longer exists. Page and script now always match.
const js=`<script>${fs.readFileSync('assets/site.js','utf8')}</script>`;
const css=fs.readFileSync('assets/site.css','utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s+/g,' ').replace(/\s*([{}:;,>])\s*/g,'$1').replace(/;}/g,'}').trim();
const init=`try{var t=localStorage.getItem('qxj.theme');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'}catch(e){}document.documentElement.classList.add('js');if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion')`;

// One file for everything (his decision, 2026-10-24: 「100 兆的那个版本直接删了……只保留一个视频，所有链接都指向这一个视频」):
// his 4K web version, about 7 Mbps, 51 MB. Never re-encoded here.
// The same bytes are served from three places, in order (2026-10-24): Tencent Cloud Shanghai first (mainland viewers;
// measured in WeChat without VPN: 1.0 s to first frame, 9.1 Mbps vs Cloudflare 4.2 s, 4.2 Mbps; GitHub Pages barely
// plays there), Cloudflare R2 if Tencent fails (free traffic), then this repository. The browser moves down the list
// by itself; no buttons, no switch. Download uses Tencent (its default domain already answers with "attachment").
const PLAY='media/film-mobile.mp4';
const SOURCES=['https://media-1416754078.cos.ap-shanghai.myqcloud.com/too-late-to-love-you.mp4','https://media.praxisai.online/too-late-to-love-you.mp4'];
const DOWNLOAD=SOURCES[0];
const playIcon=`<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 3.5v13l10.5-6.5Z" fill="currentColor"/></svg>`;
const moon=`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M20.5 14.2A9 9 0 0 1 9.8 3.5 9 9 0 1 0 20.5 14.2Z"/></svg>`;

function head(c,p,r,{title=c.title,description=c.description,hero=false}={}){
 return `<!doctype html><html lang="${c.lang}" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="color-scheme" content="light dark"><meta name="theme-color" content="#000000"><script>${init}</script>${hero?`<link rel="preload" as="image" href="${r}assets/key-1280.webp" imagesrcset="${r}assets/key-1280.webp 1280w, ${r}assets/key-2560.webp 2560w" imagesizes="100vw" fetchpriority="high">`:''}<style>${css}</style><link rel="icon" href="${r}assets/favicon.svg" type="image/svg+xml"><link rel="canonical" href="${SITE}${p}"><link rel="alternate" hreflang="zh-CN" href="${SITE}"><link rel="alternate" hreflang="en" href="${SITE}en/"><meta property="og:type" content="video.movie"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:image" content="${SITE}assets/key-share.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="675"><meta name="twitter:card" content="summary_large_image"></head>`;
}
const still=(name,alt,r,cls='')=>`<img${cls?` class="${cls}"`:''} src="${r}assets/${name}.webp" width="1440" height="810" alt="${esc(alt)}" loading="lazy" decoding="async">`;
// No link back to his personal site (2026-10-24: he shares this film on its own). The personal site links here, one way.
const icon=d=>`<span class="tool-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">${d}</svg></span>`;
const ICONS={
 muse:'<path d="M12 3.5l1.6 4.4L18 9.5l-4.4 1.6L12 15.5l-1.6-4.4L6 9.5l4.4-1.6z"/><path d="M18.5 15l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
 director:'<rect x="3.5" y="9" width="17" height="11" rx="2"/><path d="M3.5 9l2-4.5h15l-2 4.5"/><path d="M9 4.5 7.5 9M14.5 4.5 13 9"/>',
 layers:'<path d="M12 4 3.5 8.5 12 13l8.5-4.5z"/><path d="m3.5 12.5 8.5 4.5 8.5-4.5"/><path d="m3.5 16.5 8.5 4.5 8.5-4.5"/>'};
const footer=()=>'';
const seekLink=(r,t,text)=>`<a class="seek" href="${r}${PLAY}#t=${t}" data-seek="${t}">${text.replace('{t}',mmss(t))} ›</a>`;
const sectionHead=(id,label,title,lead='')=>`<header class="head"><p class="eyebrow">${label}</p><h2 id="${id}-title">${title}</h2>${lead?`<p class="lead">${lead}</p>`:''}</header>`;
// Chinese has no spaces: a '|' in a title marks where a line may break; each phrase stays whole.
const phr=t=>t.includes('|')?t.split('|').map(x=>`<span class="ph">${x}</span>`).join(''):t;
// A quoted title: the marks stay attached to the first and last phrase, never alone on a line.
const qt=t=>phr(`“${t}”`);
// 越轴, drawn from above: her line of action, two cameras on either side, and what each one sees.
function axisDiagram(L){
 const cam=(x,y,up)=>`<g transform="translate(${x} ${y})${up?'':' rotate(180)'}"><rect x="-17" y="-2" width="34" height="22" rx="4"/><path d="M-9 -2 L0 -16 L9 -2"/></g>`;
 const fig=(x,dir)=>`<g transform="translate(${x} 0)"><circle cx="0" cy="-14" r="6"/><path d="M0 -8v18M-8 0h16M0 10l-6 12M0 10l6 12"/><path d="M${dir*16} 4H${dir*42}M${dir*35} -2L${dir*42} 4L${dir*35} 10" class="dir"/></g>`;
 return `<svg class="axis-svg" data-cam="a" viewBox="0 0 600 312" role="img" aria-label="${esc(L.walk)}: ${esc(L.seeA)}; ${esc(L.seeB)}"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M24 150H336" stroke-dasharray="6 8" class="muted"/>
<circle cx="180" cy="150" r="9" fill="currentColor" stroke="none"/><path d="M196 150h44m-8-7 8 7-8 7" class="dir"/>
<g class="cam va">${cam(180,236,true)}</g><g class="cam vb">${cam(180,64,false)}</g>
<path d="M180 222V172" stroke-dasharray="2 6" class="va"/><path d="M180 78V128" stroke-dasharray="2 6" class="vb"/>
<g class="va"><rect x="388" y="168" width="188" height="106" rx="10"/><g transform="translate(482 228)">${fig(-24,1)}</g></g>
<g class="vb"><rect x="388" y="26" width="188" height="106" rx="10"/><g transform="translate(482 86)">${fig(24,-1)}</g></g>
</g><g font-size="15" fill="currentColor" class="labels">
<text x="24" y="138" class="muted-t">${esc(L.line)}</text><text x="206" y="138">${esc(L.walk)}</text>
<text x="210" y="262" class="va">${esc(L.a)}</text><text x="210" y="48" class="vb">${esc(L.b)}</text>
<text x="482" y="304" text-anchor="middle" class="va">${esc(L.seeA)}</text><text x="482" y="18" text-anchor="middle" class="vb">${esc(L.seeB)}</text>
</g></svg><p class="axis-cams" role="group" aria-label="${esc(L.a)} / ${esc(L.b)}" hidden><button type="button" data-cam="a" aria-pressed="true">${esc(L.a)}</button><button type="button" data-cam="b" aria-pressed="false">${esc(L.b)}</button></p>`;
}

function page(lang){
 const c=copy[lang],r=lang==='zh'?'':'../',other=lang==='zh'?'en/':'../',zh=lang==='zh';
 const me=zh?'秦徐俊':'Qin Xujun, translated from Chinese';
 return `${head(c,zh?'':'en/',r,{hero:true})}<body><a class="skip" href="#main">${c.skip}</a>
<header class="bar" data-bar><a class="bar-back" data-qxj-back hidden>‹ ${zh?'返回':'Back'}</a><a class="bar-home" href="#top">${film.title}</a><span class="bar-tools"><a href="${other}" lang="${zh?'en':'zh-CN'}">${c.language}</a><button type="button" data-theme-toggle aria-label="${c.theme}">${moon}</button><button class="bar-play" type="button" data-play>${playIcon}${c.play}</button></span></header>
<main id="main">
<section class="hero" id="top" aria-labelledby="film-title">
<div class="screen" id="watch"><video id="film" controls playsinline preload="none" poster="${r}assets/key-1280.webp" width="3840" height="2160" aria-label="${film.title}">${[...SOURCES,r+PLAY].map(u=>`<source src="${u}" type="video/mp4">`).join('')}<track kind="descriptions" src="${r}media/descriptions-${lang}.vtt" srclang="${c.lang}" label="${c.textVersion}"></video><button class="cover" type="button" data-play hidden aria-label="${esc(c.play)} ${film.title}"><img src="${r}assets/key-1280.webp" srcset="${r}assets/key-1280.webp 1280w, ${r}assets/key-2560.webp 2560w" sizes="100vw" width="1280" height="720" alt="${esc(c.coverAlt)}" fetchpriority="high" decoding="async"><span class="disc">${playIcon}</span></button><p class="video-error" id="video-error" role="status" hidden>${c.error}</p></div>
<div class="hero-copy"><p class="kicker">${c.kicker}</p><h1 id="film-title">${film.title}</h1>${zh?'':`<p class="title-en">${film.titleEn}</p>`}<p class="lede">${c.lede}</p><p class="meta">${c.meta.join('<span aria-hidden="true"> · </span>')}</p>
<p class="actions"><a class="play" href="${r}${PLAY}" data-play>${playIcon}${c.play}</a><a class="download" href="${DOWNLOAD}" download="too-late-to-love-you.mp4">${c.download} <span aria-hidden="true">↓</span></a></p>
</section>
<section class="section why" id="why" aria-labelledby="why-title"><header class="head"><p class="eyebrow">${c.whyLabel}</p><h2 class="qh" id="why-title">${qt(c.whyTitle)}</h2></header>
<ol class="why-list">${c.why.map(([k,h,q,n])=>`<li><p class="why-k">${k}</p><h3>${h}</h3><blockquote><p>“${q}”</p></blockquote>${n?`<p class="why-note">${n}</p>`:''}</li>`).join('')}</ol><p class="signed">— ${c.whySigned}</p></section>
<section class="section making" id="making" aria-labelledby="making-title">${sectionHead('making',c.makeLabel,c.makeTitle,c.makeLead)}
<div class="rail-wrap"><ol class="rail" tabindex="0" aria-label="${c.makeTitle}" data-rail>${shots.map(s=>`<li class="card"><figure>${still(s.img,s[lang][0],r)}</figure><div class="card-body"><p class="card-kicker">${c.seg.replace('{n}',s.n)} · ${s[lang][1]}</p><h3>${s[lang][0]}</h3><p>${s[lang][2]}</p>${seekLink(r,s.t,c.from)}</div></li>`).join('')}</ol>
<button class="arrow prev" type="button" data-rail-prev aria-label="${zh?'上一页':'Previous'}">‹</button><button class="arrow next" type="button" data-rail-next aria-label="${zh?'下一页':'Next'}">›</button><p class="dots" data-dots aria-hidden="true"></p></div>
<div class="prompt"><h3>${c.promptTitle}</h3>${c.prompt.map(t=>`<p>${t}</p>`).join('')}<details><summary>${c.promptOpen}</summary><blockquote lang="en">${esc(prompt)}</blockquote></details></div>
<p class="more"><a href="${r}archive/">${c.archiveLink} ›</a></p></section>
<section class="section soft craft" id="learn" aria-labelledby="learn-title"><header class="head"><p class="eyebrow">${c.learnLabel}</p><h2 class="qh" id="learn-title">${qt(c.learnTitle)}</h2><p class="lead">“${c.learnLead}” <span class="by">— ${me}</span></p></header>
<article class="axis"><div class="axis-text"><h3>${axis[lang].term}</h3><blockquote><p>“${axis[lang].def}”</p><p class="by">— ${me}</p></blockquote><p class="in-film"><span>${c.inFilm}</span>${axis[lang].film}</p>${seekLink(r,axis.t,c.from)}</div><figure class="axis-fig">${axisDiagram(c.axisSvg)}<figcaption>${c.axisCap}</figcaption></figure></article>
<ol class="craft-grid">${craft.map(f=>{const[h,d,x]=f[lang];const art=f.pair||f.pair2?`<figure class="pair">${still(f.pair?f.pair[0]:f.img,'',r)}${still(f.pair?f.pair[1]:f.pair2,'',r)}<figcaption>${f.cap[lang]}</figcaption></figure>`:`<figure>${still(f.img,'',r)}</figure>`;return `<li>${art}<div class="craft-body"><h3>${h}</h3><p class="def">${d}</p><p class="in-film"><span>${c.inFilm}</span>${x}</p>${seekLink(r,f.t,c.from)}</div></li>`}).join('')}</ol></section>
<section class="section tools" id="tools" aria-labelledby="tools-title"><header class="head"><p class="eyebrow">${c.toolsLabel}</p><h2 class="qh" id="tools-title">${qt(c.toolsTitle)}</h2><p class="lead">“${c.toolsLead}” <span class="by">— ${me}</span></p></header>
<div class="tool-grid"><article class="tool tool-muse">${icon(ICONS.muse)}<h3>${muse.name}</h3><p>${muse[lang]}</p><div class="invite"><p class="invite-k">${c.invite}</p><p class="invite-code">${muse.code}</p><p class="invite-note">${c.inviteNote}</p></div><a href="${muse.url}" rel="noopener">${c.inviteGo} ↗</a></article>${skills.map((k,i)=>`<article class="tool">${icon(i?ICONS.layers:ICONS.director)}<h3>${k.name}</h3><p>${k[lang]}</p><a href="${k.url}" rel="noopener">${c.repo} ↗</a></article>`).join('')}</div></section>
<section class="section coda" aria-labelledby="coda-title"><div class="narrow"><h2 id="coda-title">${c.codaTitle}</h2>${c.coda.map(t=>`<p>“${t}”</p>`).join('')}<p class="by">— ${c.codaSigned}</p></div></section>
<section class="section credits" aria-labelledby="credits-title"><div class="narrow"><h2 id="credits-title">${c.creditsTitle}</h2><dl>${c.credits.map(([t,d])=>`<dt>${t}</dt><dd>${d}</dd>`).join('')}</dl>${c.creditsNote?`<p class="note-line">${c.creditsNote}</p>`:''}<p class="credits-links"><a href="${r}archive/">${c.archiveLink} ›</a><a href="${DOWNLOAD}" download="too-late-to-love-you.mp4">${c.download} ↓</a></p></div></section>
</main>${footer(c)}${js}</body></html>`;
}

// The public archive is selected production text, not the private website handoff instructions.
function markdown(raw){
 const inline=s=>esc(s).replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" rel="noopener">$1 ↗</a>').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/`([^`]+)`/g,'<code>$1</code>');
 let out='',para=[],code=null,list=null;
 const flush=()=>{if(para.length){out+=`<p>${inline(para.join(' '))}</p>`;para=[]}if(list){out+=`</${list}>`;list=null}};
 for(const line of raw.split(/\r?\n/)){
  if(line.startsWith('```')){flush();if(code===null)code=[];else{out+=`<pre><code>${esc(code.join('\n'))}</code></pre>`;code=null}continue}
  if(code!==null){code.push(line);continue}
  const h=/^(#{1,5})\s+(.+)/.exec(line);
  if(h){flush();let level=Math.min(4,h[1].length+1);out+=`<h${level}>${inline(h[2])}</h${level}>`;continue}
  if(!line.trim()||line==='---'){flush();continue}
  const li=/^\s*(?:[-*]|\d+\.)\s+(.+)/.exec(line);
  if(li){if(para.length){out+=`<p>${inline(para.join(' '))}</p>`;para=[]}let type=/^\s*\d/.test(line)?'ol':'ul';if(list!==type){if(list)out+=`</${list}>`;out+=`<${type}>`;list=type}out+=`<li>${inline(li[1])}</li>`;continue}
  if(list){out+=`</${list}>`;list=null}
  if(line.startsWith('>')){flush();out+=`<blockquote><p>${inline(line.replace(/^>\s?/,''))}</p></blockquote>`;continue}
  para.push(line);
 }flush();return out;
}
for(const lang of ['zh','en']){
 write(lang==='zh'?'index.html':'en/index.html',page(lang));
 const vtt='WEBVTT\n\n'+chapters.map(s=>`${tc(s.start).replace('00:','00:00:').replace(/\.(\d\d)$/g,'.$10')} --> ${tc(s.end).replace('00:','00:00:').replace(/\.(\d\d)$/g,'.$10')}\n${s[lang][2]}\n`).join('\n');
 write(`media/descriptions-${lang}.vtt`,vtt);
}
const c=copy.zh;
write('archive/index.html',`${head(c,'archive/','../',{title:'《来不及爱你》｜制作全记录',description:'七段画面怎样一段段做出来：被否的版本、定版的理由，和导演的原话。'})}<body class="plain-page"><a class="skip" href="#main">跳到正文</a><header class="bar solid"><a class="bar-home" href="../">‹ ${film.title}</a><span class="bar-tools"><button type="button" data-theme-toggle aria-label="${c.theme}">${moon}</button></span></header><main class="archive" id="main"><p class="eyebrow">${film.title}</p><h1>${c.archiveHeading}</h1><p class="lead">${c.archiveIntro}</p><div class="archive-body">${markdown(fs.readFileSync('src/archive.md','utf8'))}</div><p class="archive-back"><a href="../">${c.backFilm} ›</a></p></main>${footer(c)}${js}</body></html>`);
write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['','en/','archive/'].map(p=>`<url><loc>${SITE}${p}</loc></url>`).join('')}</urlset>`);
console.log('Built Chinese and English film pages, production archive, scene descriptions and sitemap.');
