const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const axe=fs.readFileSync(process.env.AXE_SOURCE_PATH||require.resolve('axe-core/axe.min.js'),'utf8');
const out=path.resolve(__dirname,'../.qa');fs.mkdirSync(out,{recursive:true});
const base=process.env.FILM_BASE||'http://127.0.0.1:4173/laibuji-aini/';
(async()=>{
 const results=[],issues=[];
 const check=(cond,label)=>{console.log((cond?'PASS ':'FAIL ')+label);if(!cond)issues.push(label)};
 for(const [name,exe] of [['chrome',process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'],['edge',process.env.EDGE_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe']]){
  const browser=await chromium.launch({executablePath:exe,headless:true});
  const configs=name==='chrome'?[...['','en/','archive/'].flatMap(p=>[390,1440].flatMap(w=>['light','dark'].map(theme=>({p,w,theme})))),{p:'',w:600,theme:'light'},{p:'',w:850,theme:'dark'}]:[{p:'',w:390,theme:'light'}];
  for(const cfg of configs){
   const ctx=await browser.newContext({viewport:{width:cfg.w,height:cfg.w===390?844:1000},colorScheme:cfg.theme,reducedMotion:'reduce'});
   const page=await ctx.newPage(),errors=[],foreign=[],videoRequests=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
   page.on('request',r=>{if(/\.mp4(?:[?#]|$)/.test(r.url()))videoRequests.push(r.url());if(new URL(r.url()).origin!==new URL(base).origin)foreign.push(r.url())});
   page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
   await page.goto(base+cfg.p,{waitUntil:'networkidle'});
   const id=`${name}-${cfg.p.replaceAll('/','')||'zh'}-${cfg.w}-${cfg.theme}`;
   await page.screenshot({path:`${out}/${id}-top.png`});
   check(videoRequests.length===0,id+' no video download before user action');
   check(foreign.length===0,id+' same-origin');
   check(errors.length===0,id+' console/network '+errors.join(';'));
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),id+' no overflow');
   await page.addScriptTag({content:axe});
   const violations=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:['wcag2a','wcag2aa','wcag21a','wcag21aa']});return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))});
   check(!violations.length,id+' axe '+JSON.stringify(violations));
   if(cfg.p!=='archive/'){
    await page.locator('#reading').scrollIntoViewIfNeeded();
    const geometry=await page.evaluate(()=>{const v=document.querySelector('#study-film').getBoundingClientRect(),p=document.querySelector('[data-start-for="study-film"]').getBoundingClientRect(),a=document.querySelector('.study-download').getBoundingClientRect();return {difference:Math.abs(v.height-p.height),downloadClear:a.top>=p.bottom}});
    check(geometry.difference<2&&geometry.downloadClear,id+' poster matches video and download is clear '+JSON.stringify(geometry));
    await page.screenshot({path:`${out}/${id}-reading.png`});
    await page.locator('#shot-rise summary').click();check(await page.locator('#shot-rise').getAttribute('open')!==null,id+' chapter opens');
    await page.locator('[data-theme-toggle]').click();
    const switched=await page.evaluate(()=>document.documentElement.dataset.theme);
    check(switched!==(cfg.theme),id+' theme switches');
    if(name==='edge'||(cfg.w===1440&&cfg.theme==='light'&&cfg.p==='')){
     const capability=await page.locator('#film').evaluate(v=>v.canPlayType('video/mp4; codecs="avc1.640033"'));
     console.log('H.264 capability '+name+': '+JSON.stringify(capability));
     await page.locator('#shot-rise [data-seek]').click();
     let playback;
     try{await page.waitForFunction(()=>document.querySelector('#study-film').readyState>=2,{timeout:15000});await page.waitForTimeout(500);playback=await page.locator('#study-film').evaluate(v=>({time:v.currentTime,duration:v.duration,paused:v.paused,error:v.error?.code}));check(playback.time>=11.1&&playback.time<15,id+' actual seek playback '+JSON.stringify(playback));await page.locator('#study-film').evaluate(v=>{v.pause();v.currentTime=55.5;return v.play()});await page.waitForFunction(()=>document.querySelector('#study-film').ended,{timeout:12000});check(true,id+' plays to ending')}
     catch(e){playback={unsupported:true,reason:String(e.message).slice(0,150)};check(false,id+' supplied H.264 must play '+playback.reason)}
     results.push({browser:name,capability,playback});
    }
   }
   results.push({id,errors,foreign,violations});await ctx.close();
  }
  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),p=await nojs.newPage();await p.goto(base);check(await p.locator('h1').isVisible(),name+' no JS title');check(await p.locator('details.chapter').count()===9,name+' no JS native chapters');await nojs.close();await browser.close();
 }
 const range=await fetch(base+'media/film-original.mp4',{headers:{Range:'bytes=0-1023'}});check(range.status===206&&Number(range.headers.get('content-length'))===1024,'original supports HTTP byte range');
 fs.writeFileSync(out+'/summary.json',JSON.stringify({base,results,issues},null,2));
 if(issues.length)process.exitCode=1;else console.log('All film checks passed');
})().catch(e=>{console.error(e);process.exitCode=1});
