// Baixa o modelo de voz Kokoro (Apache-2.0) e as vozes para models/
const fs = require('fs'), path = require('path'), https = require('https');
const base = 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/';
const dir = path.join(__dirname, '..', 'models'); fs.mkdirSync(dir, { recursive: true });
function get(url, out) { return new Promise((res, rej) => https.get(url, r => { if (r.statusCode >= 300 && r.headers.location) return get(r.headers.location, out).then(res, rej); if (r.statusCode !== 200) return rej(new Error(url + ' ' + r.statusCode)); const f = fs.createWriteStream(out); r.pipe(f); f.on('finish', res); }).on('error', rej)); }
(async () => { for (const f of ['kokoro-v1.0.onnx', 'voices-v1.0.bin']) { const out = path.join(dir, f); if (fs.existsSync(out) && fs.statSync(out).size > 1e6) { console.log('ok', f); continue; } console.log('baixando', f, '…'); await get(base + f, out); } console.log('modelos prontos em models/'); })();
