'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, 'content.json');
const PORT = Number(process.env.PORT || 8000);

function loadEnvFile() {
  const file = path.join(ROOT, '.env');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && !Object.hasOwn(process.env, match[1])) process.env[match[1]] = match[2].replace(/^(["'])(.*)\1$/, '$2');
  }
}
loadEnvFile();
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET;
if (!ADMIN_USERNAME || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 14 || !SESSION_SECRET || SESSION_SECRET.length < 32) {
  console.error('Configuration missing. Set ADMIN_USERNAME, ADMIN_PASSWORD (14+ chars), and SESSION_SECRET (32+ chars) in .env or your hosting environment.');
  process.exit(1);
}

const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.ico':'image/x-icon' };
const attempts = new Map();
const sessions = new Map();
const MAX_BODY = 12 * 1024 * 1024;
const COOKIE = 'sb_admin_session';
const production = process.env.NODE_ENV === 'production';

function send(res, status, body, headers={}) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': typeof body === 'string' ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8', 'Cache-Control':'no-store', ...headers });
  res.end(payload);
}
function safeEqual(a, b) {
  const aa = Buffer.from(String(a)); const bb = Buffer.from(String(b));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}
function sessionKey(token) { return crypto.createHmac('sha256', SESSION_SECRET).update(token).digest('hex'); }
function createSession() {
  const token = crypto.randomBytes(32).toString('base64url');
  sessions.set(sessionKey(token), Date.now() + 8 * 60 * 60 * 1000);
  return token;
}
function requestSessionToken(req) {
  const cookies = Object.fromEntries((req.headers.cookie || '').split(';').map(x=>x.trim()).filter(Boolean).map(x=>{const i=x.indexOf('=');return [x.slice(0,i),decodeURIComponent(x.slice(i+1))];}));
  return cookies[COOKIE] || '';
}
function validSession(req) {
  const token = requestSessionToken(req); if (!token) return false;
  const key = sessionKey(token), expires = sessions.get(key);
  if (!expires || expires <= Date.now()) { sessions.delete(key); return false; }
  return true;
}
function cookie(value, maxAge) { return `${COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${production?'; Secure':''}`; }
function originAllowed(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try { return new URL(origin).host === req.headers.host; } catch { return false; }
}
function readBody(req) {
  return new Promise((resolve,reject)=>{
    let size=0, chunks=[];
    req.on('data',chunk=>{size+=chunk.length;if(size>MAX_BODY){reject(new Error('Request body too large'));req.destroy();}else chunks.push(chunk);});
    req.on('end',()=>{try{resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}'));}catch{reject(new Error('Invalid JSON'));}});
    req.on('error',reject);
  });
}
async function readContent() { return JSON.parse(await fs.promises.readFile(DATA_FILE,'utf8')); }
async function writeContent(value) {
  if (!value || typeof value !== 'object' || !Array.isArray(value.members) || !Array.isArray(value.projects) || !Array.isArray(value.faqs) || typeof value.settings !== 'object') throw new Error('Invalid portfolio content structure');
  const temp = DATA_FILE + '.tmp';
  await fs.promises.writeFile(temp, JSON.stringify(value,null,2), {mode:0o600});
  await fs.promises.rename(temp, DATA_FILE);
}
function securityHeaders() { return { 'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'strict-origin-when-cross-origin', 'X-Frame-Options':'DENY', 'Permissions-Policy':'camera=(), microphone=(), geolocation=()' }; }

const server = http.createServer(async (req,res)=>{
  const headers = securityHeaders();
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) {
      if (req.method === 'GET' && url.pathname === '/api/content') return send(res,200,await readContent(),headers);
      if (req.method === 'GET' && url.pathname === '/api/session') return validSession(req) ? send(res,200,{authenticated:true},headers) : send(res,401,{error:'Not authenticated'},headers);
      if (req.method === 'POST' && !originAllowed(req)) return send(res,403,{error:'Request origin rejected'},headers);
      if (req.method === 'POST' && url.pathname === '/api/login') {
        const ip = req.socket.remoteAddress || 'unknown'; const record = attempts.get(ip) || {count:0,until:0};
        if (record.until > Date.now() && record.count >= 8) return send(res,429,{error:'Too many attempts. Try again in 15 minutes.'},headers);
        const data = await readBody(req);
        const ok = safeEqual(data.username || '', ADMIN_USERNAME) && safeEqual(data.password || '', ADMIN_PASSWORD);
        if (!ok) { record.count++; if(record.count>=8)record.until=Date.now()+15*60*1000; attempts.set(ip,record); return send(res,401,{error:'Access denied'},headers); }
        attempts.delete(ip);
        return send(res,200,{authenticated:true}, {...headers,'Set-Cookie':cookie(createSession(),8*60*60)});
      }
      if (req.method === 'POST' && url.pathname === '/api/logout') { const token=requestSessionToken(req); if(token)sessions.delete(sessionKey(token)); return send(res,200,{ok:true},{...headers,'Set-Cookie':cookie('',0)}); }
      if (req.method === 'PUT' && url.pathname === '/api/content') {
        if (!originAllowed(req)) return send(res,403,{error:'Request origin rejected'},headers);
        if (!validSession(req)) return send(res,401,{error:'Your admin session has expired. Please sign in again.'},headers);
        const data = await readBody(req); await writeContent(data); return send(res,200,{ok:true},headers);
      }
      return send(res,404,{error:'Not found'},headers);
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res,405,'Method not allowed',headers);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/') pathname = '/index.html';
    const target = path.resolve(ROOT, '.' + pathname);
    if (!target.startsWith(ROOT + path.sep) || path.basename(target).startsWith('.')) return send(res,404,'Not found',headers);
    let stat; try { stat=await fs.promises.stat(target); } catch { return send(res,404,'Not found',headers); }
    if (!stat.isFile()) return send(res,404,'Not found',headers);
    res.writeHead(200,{...headers,'Content-Type':mime[path.extname(target).toLowerCase()]||'application/octet-stream','Content-Length':stat.size,'Cache-Control':path.extname(target)==='.html'?'no-cache':'public, max-age=3600'});
    if(req.method==='HEAD')return res.end();
    fs.createReadStream(target).pipe(res);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) send(res,error.message==='Request body too large'?413:400,{error:'Request could not be completed'},securityHeaders());
    else res.destroy();
  }
});
server.listen(PORT,'0.0.0.0',()=>console.log(`Spider Bite running on port ${PORT}`));
