// Local static preview only. The game has no backend, API routes, or database.
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../out/',import.meta.url)).replace(/[\\/]$/,'');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.json':'application/json','.txt':'text/plain; charset=utf-8','.woff2':'font/woff2'};
try{await stat(resolve(root,'index.html'))}catch{console.error('请先运行 npm run build 生成 out/');process.exit(1)}
const server=createServer(async(req,res)=>{
 if(!['GET','HEAD'].includes(req.method||'')){res.writeHead(405);res.end();return}
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let path=resolve(root,'.'+pathname);
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return}
  try{if((await stat(path)).isDirectory())path=resolve(path,'index.html')}catch{}
  const content=await readFile(path);res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:content);
 }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('页面不存在')}
});
const port=Number(process.env.PORT)||3000;
server.listen(port,'127.0.0.1',()=>console.log(`我的潮流买手店：http://localhost:${port}`));
