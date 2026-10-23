// Builds the film site: Chinese and English film pages, the production record, scene descriptions, sitemap.
// v24 (2026-10-23): the film-page pattern of A24 and Apple TV — full-bleed key art with the title on it, Play opens
// a dark theatre; then the story, a pinned scene sequence, seven shot cards, lessons, the two tools taken apart,
// the director's note. The stylesheet is inlined so the first screen needs one request.
import fs from 'node:fs';
import {film,copy,chapters,shots,lessons,skills,prompt} from '../src/content.mjs';

const esc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const tc=n=>`00:${n.toFixed(2).padStart(5,'0')}`;
const write=(p,s)=>{fs.mkdirSync(p.slice(0,p.lastIndexOf('/'))||'.',{recursive:true});fs.writeFileSync(p,s)};
const SITE=`${film.home}${film.slug}/`;
const css=fs.readFileSync('assets/site.css','utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s+/g,' ').replace(/\s*([{}:;,>])\s*/g,'$1').replace(/;}/g,'}').trim();
const init=`try{var t=localStorage.getItem('qxj.theme');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'}catch(e){}document.documentElement.classList.add('js');if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion')`;

// Phones (and no-JS) play the creator's 4K web version; wide screens switch to the full-bitrate original in site.js.
// Neither file is ever re-encoded here. The download is always the original.
const PLAY='media/film-mobile.mp4',ORIGINAL='media/film-original.mp4';
const playIcon=`<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 3.5v13l10.5-6.5Z" fill="currentColor"/></svg>`;
const moon=`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M20.5 14.2A9 9 0 0 1 9.8 3.5 9 9 0 1 0 20.5 14.2Z"/></svg>`;

function head(c,p,r,{title=c.title,description=c.description,hero=false}={}){
 return `<!doctype html><html lang="${c.lang}" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="color-scheme" content="light dark"><meta name="theme-color" content="#000000"><script>${init}</script>${hero?`<link rel="preload" as="image" href="${r}assets/key-1280.webp" imagesrcset="${r}assets/key-1280.webp 1280w, ${r}assets/key-2560.webp 2560w" imagesizes="100vw" fetchpriority="high">`:''}<style>${css}</style><link rel="icon" href="${r}assets/favicon.svg" type="image/svg+xml"><link rel="canonical" href="${SITE}${p}"><link rel="alternate" hreflang="zh-CN" href="${SITE}"><link rel="alternate" hreflang="en" href="${SITE}en/"><meta property="og:type" content="video.movie"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:image" content="${SITE}assets/key-share.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="675"><meta name="twitter:card" content="summary_large_image"><script src="${r}assets/site.js" defer></script></head>`;
}
const still=(name,alt,r,cls='')=>`<img${cls?` class="${cls}"`:''} src="${r}assets/${name}.webp" width="1440" height="810" alt="${esc(alt)}" loading="lazy" decoding="async">`;
const footer=c=>`<footer class="foot"><a href="${film.home}" rel="noopener">${c.footer} ↗</a><span>© 2026</span></footer>`;
const seekLink=(r,t,text,cls='')=>`<a class="seek${cls?' '+cls:''}" href="${r}${PLAY}#t=${t}" data-seek="${t}">${text} <span>${tc(t)} ›</span></a>`;
const sectionHead=(id,label,title,lead='')=>`<header class="head"><p class="eyebrow">${label}</p><h2 id="${id}-title">${title}</h2>${lead?`<p class="lead">${lead}</p>`:''}</header>`;

function page(lang){
 const c=copy[lang],r=lang==='zh'?'':'../',other=lang==='zh'?'en/':'../',zh=lang==='zh';
 const me=zh?'秦徐俊':'Qin Xujun';
 return `${head(c,zh?'':'en/',r,{hero:true})}<body><a class="skip" href="#main">${c.skip}</a>
<header class="bar" data-bar><a class="bar-home" href="${film.home}${zh?'':'en/'}" rel="noopener">‹ ${c.home}</a><span class="bar-title">${film.title}</span><span class="bar-tools"><a href="${other}" lang="${zh?'en':'zh-CN'}">${c.language}</a><button type="button" data-theme-toggle aria-label="${c.theme}">${moon}</button><button class="bar-play" type="button" data-play>${playIcon}${c.play}</button></span></header>
<main id="main">
<section class="hero" id="top" aria-labelledby="film-title">
<img class="hero-art" src="${r}assets/key-1280.webp" srcset="${r}assets/key-1280.webp 1280w, ${r}assets/key-2560.webp 2560w" sizes="100vw" width="1280" height="720" alt="${esc(c.coverAlt)}" fetchpriority="high" decoding="async">
<div class="hero-copy"><p class="kicker">${c.kicker}</p><h1 id="film-title">${film.title}</h1>${zh?'':`<p class="title-en">${film.titleEn}</p>`}<p class="lede">${c.lede}</p><p class="meta">${c.meta.join('<span aria-hidden="true"> · </span>')}</p>
<p class="actions"><a class="play" href="${r}${PLAY}" data-play>${playIcon}${c.play}</a><a class="download" href="${r}${ORIGINAL}" download>${c.download} <span aria-hidden="true">↓</span></a></p></div>
</section>
<div class="theatre" id="theatre" hidden role="dialog" aria-modal="true" aria-label="${film.title}"><video id="film" controls playsinline preload="none" poster="${r}assets/key-1280.webp" width="3840" height="2160" src="${r}${PLAY}" data-wide="${r}${ORIGINAL}"><track kind="descriptions" src="${r}media/descriptions-${lang}.vtt" srclang="${c.lang}" label="${c.textVersion}"></video><button class="theatre-close" type="button" data-close aria-label="${c.close}">✕</button><p class="theatre-error" id="video-error" role="status" hidden>${c.error}</p></div>
<section class="section story" aria-labelledby="story-title">${sectionHead('story',c.storyLabel,c.storyTitle)}<div class="prose">${c.story.map(p=>`<p>${p}</p>`).join('')}</div></section>
<section class="scenes" id="scenes" aria-labelledby="scenes-title">${sectionHead('scenes',c.scenesLabel,c.scenesTitle,c.scenesLead)}
<div class="sequence"><div class="stage" aria-hidden="true">${chapters.map((s,i)=>`<img src="${r}assets/${s.img}.webp" width="1440" height="810" alt="" loading="${i<2?'eager':'lazy'}" decoding="async" data-frame="${i}"${i===0?' class="on"':''}>`).join('')}</div>
<ol class="steps">${chapters.map((s,i)=>`<li class="step" data-step="${i}"><figure class="step-art">${still(s.img,s[lang][2],r)}</figure><div class="step-card"><p class="tc">${tc(s.start)}</p><h3>${s[lang][0]}</h3><p>${s[lang][1]}</p>${seekLink(r,s.t,c.watchFrom)}</div></li>`).join('')}</ol></div></section>
<section class="section making" id="making" aria-labelledby="making-title">${sectionHead('making',c.shotsLabel,c.shotsTitle,c.shotsLead)}
<div class="rail-wrap"><ol class="rail" tabindex="0" aria-label="${c.shotsTitle}" data-rail>${shots.map(s=>`<li class="card"><figure>${still(s.img,s[lang][0],r)}</figure><div class="card-body"><p class="card-kicker"><span>${String(s.n).padStart(2,'0')}</span> ${s[lang][0]}</p><h3>${s[lang][1]}</h3><p>${s[lang][2]}</p><p class="card-foot"><span class="tag">${s[lang][3]}</span>${seekLink(r,s.t,c.see)}</p></div></li>`).join('')}</ol>
<p class="paddles"><button type="button" data-rail-prev aria-label="${zh?'上一张':'Previous'}">‹</button><button type="button" data-rail-next aria-label="${zh?'下一张':'Next'}">›</button></p></div>
<p class="more"><a href="${r}archive/">${c.archiveLink} ›</a></p></section>
<section class="section soft lessons" id="lessons" aria-labelledby="lessons-title">${sectionHead('lessons',c.lessonsLabel,c.lessonsTitle,c.lessonsLead)}
<ol class="lesson-grid">${lessons[lang].map(([h,p],i)=>`<li><span class="n">${i+1}</span><h3>${h}</h3><p>${p}</p></li>`).join('')}</ol></section>
<section class="section tools" id="tools" aria-labelledby="tools-title">${sectionHead('tools',c.skillsLabel,c.skillsTitle,c.skillsLead)}
<div class="tool-grid">${skills.map(k=>`<article class="tool"><h3>${k.name}</h3><p class="tool-line">${k[lang][0]}</p><dl><dt>${c.solves}</dt><dd>${k[lang][1]}</dd><dt>${c.used}</dt><dd>${k[lang][2]}</dd><dt>${c.cannot}</dt><dd>${k[lang][3]}</dd></dl><a href="${k.url}" rel="noopener">${c.repo} ↗</a></article>`).join('')}</div>
<div class="prompt"><h3>${c.promptTitle}</h3><p>${c.promptLead}</p><details><summary>${c.promptOpen}</summary><blockquote lang="en">${esc(prompt)}</blockquote></details></div></section>
<section class="note" id="notes" aria-labelledby="notes-title"><figure class="note-art">${still('sea','',r)}</figure><div class="note-copy"><p class="eyebrow">${c.notesLabel}</p><h2 id="notes-title">“${c.quotes[0]}”</h2><div class="quotes">${c.quotes.slice(1).map(q=>`<blockquote><p>“${q}”</p></blockquote>`).join('')}</div><p class="signed">— ${c.signed}<span>${c.quoteNote}</span></p></div></section>
<section class="section credits" aria-labelledby="credits-title"><div class="narrow"><h2 id="credits-title">${c.creditsTitle}</h2><dl>${c.credits.map(([t,d])=>`<dt>${t}</dt><dd>${d}</dd>`).join('')}</dl><p class="note-line">${c.creditsNote}</p><p class="credits-links"><a href="${r}archive/">${c.archiveLink} ›</a><a href="${r}${ORIGINAL}" download>${c.download} ↓</a></p></div></section>
</main>${footer(c)}</body></html>`;
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
write('archive/index.html',`${head(c,'archive/','../',{title:'《来不及爱你》｜制作全记录',description:'七段画面怎样一段段做出来：被否的版本、定版的理由，和导演的原话。'})}<body class="plain-page"><a class="skip" href="#main">跳到正文</a><header class="bar solid"><a class="bar-home" href="../">‹ ${film.title}</a><span class="bar-tools"><button type="button" data-theme-toggle aria-label="${c.theme}">${moon}</button></span></header><main class="archive" id="main"><p class="eyebrow">${film.title}</p><h1>${c.archiveHeading}</h1><p class="lead">${c.archiveIntro}</p><div class="archive-body">${markdown(fs.readFileSync('src/archive.md','utf8'))}</div><p class="archive-back"><a href="../">${c.backFilm} ›</a></p></main>${footer(c)}</body></html>`);
write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['','en/','archive/'].map(p=>`<url><loc>${SITE}${p}</loc></url>`).join('')}</urlset>`);
console.log('Built Chinese and English film pages, production archive, scene descriptions and sitemap.');
