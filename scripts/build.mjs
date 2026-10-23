import fs from 'node:fs';
import {film,copy,chapters,making,prompt} from '../src/content.mjs';
const esc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const tc=n=>`00:${n.toFixed(2).padStart(5,'0')}`;
const write=(p,s)=>{fs.mkdirSync(p.slice(0,p.lastIndexOf('/'))||'.',{recursive:true});fs.writeFileSync(p,s)};
const init=`try{var t=localStorage.getItem('qxj.theme');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'}catch(e){}`;
function head(c,p,relative,title=c.title,description=c.description){return `<!doctype html><html lang="${c.lang}" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="color-scheme" content="light dark"><meta name="theme-color" content="#000000"><script>${init}</script><link rel="stylesheet" href="${relative}assets/site.css"><link rel="icon" href="${relative}assets/favicon.svg" type="image/svg+xml"><link rel="canonical" href="${film.home}laibuji-aini/${p}"><link rel="alternate" hreflang="zh-CN" href="${film.home}laibuji-aini/"><link rel="alternate" hreflang="en" href="${film.home}laibuji-aini/en/"><meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:image" content="${film.home}laibuji-aini/assets/poster.webp"><meta property="og:image:width" content="1280"><meta property="og:image:height" content="720"><meta name="twitter:card" content="summary_large_image"><script src="${relative}assets/site.js" defer></script></head>`}
function photo(name,alt,r,{eager=false}={}){return `<img src="${r}assets/${name}.webp" width="1440" height="810" alt="${esc(alt)}" loading="${eager?'eager':'lazy'}" decoding="async">`}
function footer(c){return `<footer><a href="${film.home}" rel="noopener">${c.footer} ↗</a><span>© 2026</span></footer>`}
function page(language){
 const c=copy[language],r=language==='zh'?'':'../',pair=language==='zh'?'en/':'../',key=language;
 const seek=(t,label)=>`<a class="timecode" href="${r}media/film-original.mp4#t=${t}" data-seek="${t}" data-label="${esc(label)}">${c.see} <span>${tc(t)} ›</span></a>`;
 const sectionHead=(label,title,lead)=>`<div class="section-head"><p class="eyebrow">${label}</p><h2>${title}</h2>${lead?`<p class="lead">${lead}</p>`:''}</div>`;
 return `${head(c,language==='zh'?'':'en/',r)}<body><a class="skip" href="#main">${c.skip}</a>
<header class="nav"><div class="nav-inner"><a class="brand" href="#top">${film.title}</a><nav aria-label="${language==='zh'?'章节':'Chapters'}">${['watch','reading','making','craft'].map((id,i)=>`<a href="#${id}">${c.nav[i]}</a>`).join('')}</nav><a href="${pair}" lang="${language==='zh'?'en':'zh-CN'}">${c.language}</a><button type="button" data-theme-toggle aria-label="${c.theme}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M20.5 14.2A9 9 0 0 1 9.8 3.5 9 9 0 1 0 20.5 14.2Z"/></svg></button></div></header>
<main id="main"><section class="opening" id="top" aria-labelledby="film-title"><div class="film-title"><p class="eyebrow">${c.kicker}</p><h1 id="film-title">${film.title}</h1><p class="film-lede">${c.lede}</p></div>
<div class="watch" id="watch"><video id="film" controls playsinline preload="none" poster="${r}assets/poster.webp" width="3840" height="2160" aria-label="${film.title}" aria-describedby="video-help" src="${r}media/film-original.mp4"><track kind="descriptions" src="${r}media/descriptions-${language}.vtt" srclang="${c.lang}" label="${c.textVersion}"></video>
<button class="poster-start" data-start-for="film" type="button" aria-label="${c.play}" hidden><img src="${r}assets/poster.webp" width="1280" height="720" alt="" decoding="async" fetchpriority="high"><span><svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 3 17 10 5 17Z" fill="currentColor"/></svg>${c.play}</span></button>
<p class="video-error" id="video-error" role="status" hidden>${c.error}</p><p class="moment" id="moment" hidden aria-live="polite"></p></div>
<div class="watch-meta"><p>${c.facts}</p><div class="watch-actions"><a href="#reading">${c.readLabel} ›</a><a href="${r}media/film-original.mp4" download>${c.download} <span aria-hidden="true">↓</span></a></div><p id="video-help" class="compat">${c.compat}</p></div></section>
<section class="story section" id="story">${sectionHead(c.storyLabel,c.storyTitle,'')}<div class="prose">${c.story.map(p=>`<p>${p}</p>`).join('')}<p class="annotation">${c.storyNote}</p></div><figure class="story-image">${photo('keep',chapters[5][key][2],r)}<figcaption>${tc(29.2)} · ${chapters[5][key][0]}</figcaption></figure></section>
<section class="reading section soft" id="reading">${sectionHead(c.readLabel,c.readTitle,c.readLead)}
<div class="reading-workspace"><div class="study-player" id="study-watch"><video id="study-film" controls playsinline preload="none" poster="${r}assets/photo.webp" width="3840" height="2160" aria-label="${c.readLabel}" src="${r}media/film-original.mp4"><track kind="descriptions" src="${r}media/descriptions-${language}.vtt" srclang="${c.lang}" label="${c.textVersion}"></video><button class="poster-start" data-start-for="study-film" type="button" aria-label="${c.watch}" hidden><img src="${r}assets/photo.webp" width="1440" height="810" alt="" loading="lazy" decoding="async"><span><svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 3 17 10 5 17Z" fill="currentColor"/></svg>${c.watch}</span></button><p class="study-caption" id="study-caption">${tc(21.5)} · ${chapters[3][key][0]}</p><p class="study-error annotation" role="status" hidden>${c.error}</p><a class="study-download" href="${r}media/film-original.mp4" download>${c.download} ↓</a></div>
<div class="chapter-list">${chapters.map((s,i)=>`<details class="chapter" id="shot-${s.id}" name="shots"${i===3?' open':''}><summary><span class="chapter-time">${tc(s.start)}</span><span>${s[key][0]}</span><span class="detail-plus" aria-hidden="true">+</span></summary><div class="chapter-copy"><h3>${s[key][1]}</h3><dl><dt>${c.visible}</dt><dd>${s[key][2]}</dd><dt>${c.history}</dt><dd>${s[key][3]}</dd><dt>${c.reading}</dt><dd>${s[key][4]}</dd></dl>${seek(s.t,s[key][0])}</div></details>`).join('')}</div></div></section>
<section class="section making" id="making">${sectionHead(c.makingLabel,c.makingTitle,c.makingLead)}<ol class="decisions">${making.map((s,i)=>`<li><span class="step" aria-hidden="true">${i+1}</span><div><h3>${s[key][0]}</h3><p>${s[key][1]}</p>${seek(s.time,s[key][0])}</div></li>`).join('')}</ol><div class="comparison"><h3>${c.compareTitle}</h3><p>${c.compareLead}</p><div class="compare-pair"><figure>${photo('cut-1-before',c.before,r)}<figcaption>${c.before}</figcaption></figure><figure>${photo('cut-1-after',c.after,r)}<figcaption>${c.after}</figcaption></figure></div><p class="prose">${c.compareBody}</p></div></section>
<section class="section soft" id="craft">${sectionHead(c.craftLabel,c.craftTitle,c.craftLead)}<div class="tools">${c.tools.map(s=>`<article><p class="eyebrow">${s[1]}</p><h3>${s[0]}</h3><p>${s[2]}</p><a href="${s[3]}" rel="noopener">${c.repo} ↗</a></article>`).join('')}</div><div class="prompt"><h3>${c.promptTitle}</h3><p>${c.promptLead}</p><div class="prompt-tags">${c.promptTags.map((s,i)=>seek([.8,7.5,.8,0][i],s).replace(c.see,s)).join('')}</div><details><summary>${c.promptOpen}</summary><blockquote lang="en">${esc(prompt)}</blockquote><p class="annotation">${c.promptNote}</p></details></div></section>
<section class="section notes" id="notes">${sectionHead(c.quoteLabel,c.notesTitle,'')}<div class="quotes">${c.quotes.map(q=>`<blockquote><p>“${q}”</p></blockquote>`).join('')}</div></section>
<section class="archive-invite soft"><div class="prose"><h2>${c.archiveTitle}</h2><p>${c.archiveLead}</p><a href="${r}archive/">${c.archiveLink} ›</a></div></section>
<section class="section credits" id="credits"><h2>${c.creditsTitle}</h2><dl>${c.credits.map(([t,d])=>`<dt>${t}</dt><dd>${d}</dd>`).join('')}</dl><p class="annotation">${c.creditsNote}</p><details><summary>${c.textVersion}</summary>${chapters.map(s=>`<p><b>${tc(s.start)} ${s[key][0]}</b> ${s[key][2]}</p>`).join('')}</details></section></main>${footer(c)}</body></html>`;
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
 const key=lang;
 const vtt='WEBVTT\n\n'+chapters.map(s=>`${tc(s.start).replace('00:','00:00:').replace(/\.(\d\d)$/g,'.$10')} --> ${tc(s.end).replace('00:','00:00:').replace(/\.(\d\d)$/g,'.$10')}\n${s[key][2]}\n`).join('\n');
 write(`media/descriptions-${lang}.vtt`,vtt);
}
const c=copy.zh;
write('archive/index.html',`${head(c,'archive/','../','《来不及爱你》｜制作全记录')}<body><a class="skip" href="#main">跳到正文</a><header class="nav"><div class="nav-inner"><a class="brand" href="../">‹ ${film.title}</a><a href="../#making">${c.backFilm}</a><button type="button" data-theme-toggle aria-label="${c.theme}">◐</button></div></header><main class="archive section" id="main"><p class="eyebrow">创作档案 · 2026-10-23</p><h1>${c.archiveHeading}</h1><p class="lead">${c.archiveIntro}</p><div class="archive-body">${markdown(fs.readFileSync('src/archive.md','utf8'))}</div><p><a href="../#watch">回到影片 ›</a></p></main>${footer(c)}</body></html>`);
write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['','en/','archive/'].map(p=>`<url><loc>${film.home}laibuji-aini/${p}</loc></url>`).join('')}</urlset>`);
console.log('Built Chinese and English film pages, production archive, scene descriptions and sitemap.');
