import fs from 'node:fs';
import {film,copy,chapters,making,prompt} from '../src/content.mjs';
const esc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const tc=n=>`00:${n.toFixed(2).padStart(5,'0')}`;
const write=(p,s)=>{fs.mkdirSync(p.slice(0,p.lastIndexOf('/'))||'.',{recursive:true});fs.writeFileSync(p,s)};
const init=`try{var t=localStorage.getItem('qxj.theme');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'}catch(e){}`;
function head(c,p,relative,title=c.title,description=c.description){return `<!doctype html><html lang="${c.lang}" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="color-scheme" content="light dark"><meta name="theme-color" content="#000000"><script>${init}</script><link rel="stylesheet" href="${relative}assets/site.css"><link rel="icon" href="${relative}assets/favicon.svg" type="image/svg+xml"><link rel="canonical" href="${film.home}laibuji-aini/${p}"><link rel="alternate" hreflang="zh-CN" href="${film.home}laibuji-aini/"><link rel="alternate" hreflang="en" href="${film.home}laibuji-aini/en/"><meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:image" content="${film.home}laibuji-aini/assets/key-share.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="675"><meta name="twitter:card" content="summary_large_image"><script src="${relative}assets/site.js" defer></script></head>`}
function photo(name,alt,r,{eager=false}={}){return `<img src="${r}assets/${name}.webp" width="1440" height="810" alt="${esc(alt)}" loading="${eager?'eager':'lazy'}" decoding="async">`}
function footer(c){return `<footer><a href="${film.home}" rel="noopener">${c.footer} ↗</a><span>© 2026</span></footer>`}
// Playback uses the creator's own 4K web version (media/film-mobile.mp4, uploaded as is, never re-encoded here).
// The download is always the full-bitrate original.
// Phones (and no-JS) play the creator's 4K web version; site.js switches wide screens to the full-bitrate
// original before the first play. Neither file is ever re-encoded here.
const PLAY='media/film-mobile.mp4',ORIGINAL='media/film-original.mp4',COVER='assets/key-1280.webp';
const playIcon=`<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 3.5v13l10.5-6.5Z" fill="currentColor"/></svg>`;
function page(language){
 const c=copy[language],r=language==='zh'?'':'../',pair=language==='zh'?'en/':'../',key=language;
 const seek=(t,label,text=c.see)=>`<a class="timecode" href="${r}${PLAY}#t=${t}" data-seek="${t}">${text} <span>${tc(t)} ›</span></a>`;
 const head2=(id,label,title,lead)=>`<header class="section-head"><p class="eyebrow">${label}</p><h2 id="${id}-title">${title}</h2>${lead?`<p class="lead">${lead}</p>`:''}</header>`;
 return `${head(c,language==='zh'?'':'en/',r)}<body><a class="skip" href="#main">${c.skip}</a>
<header class="nav"><div class="nav-inner"><a class="brand" href="#top">${film.title}</a><nav aria-label="${language==='zh'?'章节':'Sections'}">${['top','scenes','making','notes'].map((id,i)=>`<a href="#${id}">${c.nav[i]}</a>`).join('')}</nav><a class="lang" href="${pair}" lang="${language==='zh'?'en':'zh-CN'}">${c.language}</a><button type="button" data-theme-toggle aria-label="${c.theme}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M20.5 14.2A9 9 0 0 1 9.8 3.5 9 9 0 1 0 20.5 14.2Z"/></svg></button></div></header>
<main id="main">
<section class="hero" id="top" aria-labelledby="film-title">
<div class="screen" id="watch"><video id="film" controls playsinline preload="none" poster="${r}${COVER}" width="3840" height="2160" aria-label="${film.title}" src="${r}${PLAY}" data-wide="${r}${ORIGINAL}"><track kind="descriptions" src="${r}media/descriptions-${language}.vtt" srclang="${c.lang}" label="${c.textVersion}"></video>
<button class="cover" type="button" data-play hidden aria-label="${esc(c.playFull)}"><img src="${r}assets/key-1280.webp" srcset="${r}assets/key-1280.webp 1280w, ${r}assets/key-2560.webp 2560w" sizes="(min-width: 1440px) 1440px, 100vw" width="1280" height="720" alt="${esc(c.coverAlt)}" fetchpriority="high" decoding="async"><span class="disc">${playIcon}</span></button></div>
<div class="hero-copy"><p class="kicker">${c.kicker}</p><h1 id="film-title">${film.title}</h1><p class="lede">${c.lede}</p><p class="meta">${c.meta.join('<span aria-hidden="true"> · </span>')}</p>
<div class="actions"><button class="play" type="button" data-play hidden>${playIcon}${c.play}</button><a class="download" href="${r}${ORIGINAL}" download>${c.download} <span aria-hidden="true">↓</span></a></div>
<p class="video-error" id="video-error" role="status" hidden>${c.error}</p></div>
</section>
<section class="section story" id="story" aria-labelledby="story-title">${head2('story',c.storyLabel,c.storyTitle,'')}<div class="prose">${c.story.map(p=>`<p>${p}</p>`).join('')}</div></section>
<section class="section soft scenes" id="scenes" aria-labelledby="scenes-title">${head2('scenes',c.scenesLabel,c.scenesTitle,c.scenesLead)}
<ol class="reel" tabindex="0" aria-label="${c.scenesLabel}">${chapters.map(s=>`<li><a href="${r}${PLAY}#t=${s.t}" data-seek="${s.t}"><span class="frame">${photo(s.img,s[key][2],r)}</span><span class="tc">${tc(s.start)}</span><strong>${s[key][0]}</strong><span class="line">${s[key][1]}</span></a></li>`).join('')}</ol></section>
<section class="section making" id="making" aria-labelledby="making-title">${head2('making',c.makingLabel,c.makingTitle,c.makingLead)}
<ol class="decisions">${making.map((s,i)=>`<li><figure>${s.time===11.2?`<div class="pair">${photo('cut-1-before',c.cutCaption[0],r)}${photo('cut-1-after',c.cutCaption[1],r)}</div><figcaption>${c.cutCaption[0]} · ${c.cutCaption[1]}</figcaption>`:photo(s.img,s[key][0],r)}</figure><div class="copy"><p class="num">${String(i+1).padStart(2,'0')}</p><h3>${s[key][0]}</h3><p>${s[key][1]}</p>${seek(s.time,s[key][0])}</div></li>`).join('')}</ol>
<div class="prompt"><h3>${c.promptTitle}</h3><p>${c.promptLead}</p><p class="tags">${c.promptTags.map((s,i)=>`<a href="${r}${PLAY}#t=${[.8,7.5,.8,0][i]}" data-seek="${[.8,7.5,.8,0][i]}">${s}</a>`).join('')}</p><details><summary>${c.promptOpen}</summary><blockquote lang="en">${esc(prompt)}</blockquote></details></div>
<div class="tools"><h3>${c.toolsTitle}</h3><ul>${c.tools.map(([n,d,u])=>`<li><strong>${n}</strong><p>${d}</p><a href="${u}" rel="noopener">${c.repo} ↗</a></li>`).join('')}</ul></div></section>
<section class="section dark notes" id="notes" aria-labelledby="notes-title"><p class="eyebrow" id="notes-title">${c.notesLabel}</p><blockquote class="lead-quote"><p>“${c.quotes[0]}”</p></blockquote><div class="quotes">${c.quotes.slice(1).map(q=>`<blockquote><p>“${q}”</p></blockquote>`).join('')}</div><p class="signed">— ${c.signed}<span>${c.quoteNote}</span></p></section>
<section class="section soft archive-invite" aria-labelledby="archive-title"><div class="narrow"><h2 id="archive-title">${c.archiveTitle}</h2><p>${c.archiveLead}</p><a href="${r}archive/">${c.archiveLink} ›</a></div></section>
<section class="section credits" id="credits" aria-labelledby="credits-title"><div class="narrow"><h2 id="credits-title">${c.creditsTitle}</h2><dl>${c.credits.map(([t,d])=>`<dt>${t}</dt><dd>${d}</dd>`).join('')}</dl><p class="note">${c.creditsNote}</p><details><summary>${c.textVersion}</summary>${chapters.map(s=>`<p><b>${tc(s.start)} ${s[key][0]}</b> ${s[key][2]}</p>`).join('')}</details></div></section>
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
 const key=lang;
 const vtt='WEBVTT\n\n'+chapters.map(s=>`${tc(s.start).replace('00:','00:00:').replace(/\.(\d\d)$/g,'.$10')} --> ${tc(s.end).replace('00:','00:00:').replace(/\.(\d\d)$/g,'.$10')}\n${s[key][2]}\n`).join('\n');
 write(`media/descriptions-${lang}.vtt`,vtt);
}
const c=copy.zh;
write('archive/index.html',`${head(c,'archive/','../','《来不及爱你》｜制作全记录','七段画面怎样一段段做出来：被否的版本、定版的理由，和导演的原话。')}<body><a class="skip" href="#main">跳到正文</a><header class="nav"><div class="nav-inner"><a class="brand" href="../">‹ ${film.title}</a><button type="button" data-theme-toggle aria-label="${c.theme}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M20.5 14.2A9 9 0 0 1 9.8 3.5 9 9 0 1 0 20.5 14.2Z"/></svg></button></div></header><main class="archive" id="main"><p class="eyebrow">${film.title}</p><h1>${c.archiveHeading}</h1><p class="lead">${c.archiveIntro}</p><div class="archive-body">${markdown(fs.readFileSync('src/archive.md','utf8'))}</div><p class="archive-back"><a href="../">${c.backFilm} ›</a></p></main>${footer(c)}</body></html>`);
write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['','en/','archive/'].map(p=>`<url><loc>${film.home}laibuji-aini/${p}</loc></url>`).join('')}</urlset>`);
console.log('Built Chinese and English film pages, production archive, scene descriptions and sitemap.');
