// Native video remains available without JS. Sources are local, with no trackers.
(() => {
 const root=document.documentElement,en=root.lang==='en';
 document.querySelector('[data-theme-toggle]')?.addEventListener('click',()=>{
  const next=root.dataset.theme==='dark'?'light':'dark';root.dataset.theme=next;
  try{localStorage.setItem('qxj.theme',next)}catch{}
 });
 matchMedia('(prefers-color-scheme:dark)').addEventListener('change',e=>{try{if(!localStorage.getItem('qxj.theme'))root.dataset.theme=e.matches?'dark':'light'}catch{}});
 const videos=[...document.querySelectorAll('video')],main=document.querySelector('#film'),study=document.querySelector('#study-film');
 if(!main)return;
 const fail=v=>{const el=v===main?document.querySelector('#video-error'):document.querySelector('.study-error');el.hidden=false;return el};
 const play=v=>{v.play().catch(e=>{if(e.name==='NotSupportedError')fail(v);else if(e.name!=='AbortError'){const el=fail(v);el.textContent=en?'Press play in the video controls, or download the original below.':'请点击视频控件中的播放，或使用下方原片下载入口。'}})};
 for(const v of videos){v.addEventListener('play',()=>videos.filter(x=>x!==v).forEach(x=>x.pause()));v.addEventListener('error',()=>fail(v))}
 const covers=[...document.querySelectorAll('[data-start-for]')];
 for(const cover of covers){const v=document.getElementById(cover.dataset.startFor);cover.hidden=false;cover.addEventListener('click',()=>play(v));v.addEventListener('playing',()=>{cover.hidden=true})}
 document.querySelectorAll('[data-seek]').forEach(a=>a.addEventListener('click',e=>{
  e.preventDefault();const time=Number(a.dataset.seek),v=study||main;
  const cover=covers.find(x=>x.dataset.startFor===v.id);if(cover)cover.hidden=true;
  const set=()=>{v.currentTime=Math.max(0,Math.min(time,v.duration||57.087))};
  if(v.readyState>=1)set();else v.addEventListener('loadedmetadata',set,{once:true});
  const caption=document.querySelector('#study-caption');caption.textContent=`${String(Math.floor(time/60)).padStart(2,'0')}:${(time%60).toFixed(2).padStart(5,'0')} · ${a.dataset.label}`;
  if(!a.closest('.reading-workspace')||matchMedia('(max-width:600px)').matches)document.querySelector('#study-watch').scrollIntoView({behavior:'auto',block:'start'});
  play(v);
 }));
})();
