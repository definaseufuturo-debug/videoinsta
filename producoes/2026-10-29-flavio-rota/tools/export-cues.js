// Exporta os eventos sonoros definidos pela animação -> build/cues.json (+ build/timeline.js para o player)
const fs = require('fs'), path = require('path');
const { createCanvas } = require('@napi-rs/canvas');
const F1Anim = require('../src/anim.js');
const root = path.resolve(__dirname, '..');
const tl = JSON.parse(fs.readFileSync(path.join(root, 'build/timeline.json')));
const a = F1Anim.create(tl, { createCanvas });
fs.writeFileSync(path.join(root, 'build/cues.json'), JSON.stringify({ duration: a.duration, scenes: a.scenes, cues: a.cues }, null, 1));
fs.writeFileSync(path.join(root, 'build/timeline.js'), 'window.TIMELINE = ' + JSON.stringify(tl) + ';\n');
console.log(a.cues.length + ' cues -> build/cues.json');
