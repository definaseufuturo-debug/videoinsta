#!/usr/bin/env bash
# Prepara o ambiente (rodar 1x por sessão, na raiz do repo): dependências + modelo de voz Kokoro
set -e
cd "$(dirname "$0")/.."
npm install --no-audit --no-fund >/dev/null
pip install --break-system-packages -q -r pipeline/template/requirements.txt
mkdir -p pipeline/models
node -e "
const fs=require('fs'),https=require('https'),path=require('path');const base='https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/';const dir='pipeline/models';
function get(u,o){return new Promise((res,rej)=>https.get(u,r=>{if(r.statusCode>=300&&r.headers.location)return get(r.headers.location,o).then(res,rej);if(r.statusCode!==200)return rej(new Error(u+' '+r.statusCode));const f=fs.createWriteStream(o);r.pipe(f);f.on('finish',res);}).on('error',rej));}
(async()=>{for(const f of ['kokoro-v1.0.onnx','voices-v1.0.bin']){const o=path.join(dir,f);if(fs.existsSync(o)&&fs.statSync(o).size>1e6){console.log('ok',f);continue;}console.log('baixando',f);await get(base+f,o);}console.log('modelos ok');process.exit(0);})().catch(e=>{console.error(e);process.exit(1);});"
which ffmpeg >/dev/null || (apt-get install -y -qq ffmpeg >/dev/null 2>&1 || true)
echo "ambiente pronto"
