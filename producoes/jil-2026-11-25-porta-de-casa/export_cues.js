const fs=require('fs');const {createCanvas}=require('@napi-rs/canvas');const A=require('./src/anim.js');
const a=A.create(JSON.parse(fs.readFileSync('build/timeline.json')),{createCanvas});fs.writeFileSync('build/cues.json',JSON.stringify({duration:a.duration,cues:a.cues}));console.log(a.cues.length,'cues');
