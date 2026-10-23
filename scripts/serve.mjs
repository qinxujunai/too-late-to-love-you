// Local preview with HTTP range support, so the untouched original can seek correctly.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
const root=path.resolve(import.meta.dirname,'..'),port=Number(process.env.PORT||4174);
const main=process.env.MAIN_SITE_ROOT;
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.vtt':'text/vtt; charset=utf-8','.mp4':'video/mp4','.xml':'application/xml','.txt':'text/plain; charset=utf-8'};
http.createServer((req,res)=>{
 let url;try{url=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400);res.end();return}
 const film=url==='/laibuji-aini'||url.startsWith('/laibuji-aini/');
 const base=main&&!film?path.resolve(main):root;
 if(film)url=url.slice('/laibuji-aini'.length)||'/';
 if(main&&(!film)&&url.includes('AI影片-')){res.writeHead(404);res.end();return}
 let file=path.resolve(base,'.'+url);
 if(!file.startsWith(base+path.sep)&&file!==base){res.writeHead(403);res.end();return}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory()){
   if(!new URL(req.url,'http://localhost').pathname.endsWith('/')){res.writeHead(301,{Location:req.url+'/'});res.end();return}
   file=path.join(file,'index.html');
 }
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('Not found');return}
 const size=fs.statSync(file).size,ext=path.extname(file),headers={'Content-Type':types[ext]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-store'};
 if(req.headers.range){
   const m=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);let start,end;
   if(m){start=m[1]?Number(m[1]):Math.max(0,size-Number(m[2]));end=m[1]&&m[2]?Math.min(Number(m[2]),size-1):size-1}
   if(!m||start>=size||start>end){res.writeHead(416,{'Content-Range':`bytes */${size}`});res.end();return}
   res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1});
   if(req.method==='HEAD')res.end();else fs.createReadStream(file,{start,end}).pipe(res);return;
 }
 if(['.html','.js','.css','.svg','.vtt'].includes(ext)&&req.headers['accept-encoding']?.includes('gzip')){
   const buffer=zlib.gzipSync(fs.readFileSync(file));res.writeHead(200,{...headers,'Content-Encoding':'gzip','Content-Length':buffer.length});if(req.method==='HEAD')res.end();else res.end(buffer);
 }else{res.writeHead(200,{...headers,'Content-Length':size});if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res)}
}).listen(port,'127.0.0.1',()=>console.log(`Preview http://127.0.0.1:${port}${main?'/laibuji-aini/':'/'}`));
