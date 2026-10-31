import fs from 'node:fs';
import assert from 'node:assert/strict';
import {validate} from './validate.mjs';
import {createHash} from 'node:crypto';
const base='https://moobaabaa-bot.github.io/ed-tech-opportunity/edtech-product-research/';
const local=JSON.parse(fs.readFileSync(new URL('./data.json',import.meta.url)));
const r=await fetch(`${base}data.json?verify=${Date.now()}`,{signal:AbortSignal.timeout(20000)});assert(r.ok,`数据 HTTP ${r.status}`);const remote=await r.json();validate(remote);assert.deepEqual(remote,local,'线上数据与本地候选不一致，不能标记成功');
for(const path of ['index.html','app.js','style.css']){const response=await fetch(base+path+'?verify='+Date.now(),{signal:AbortSignal.timeout(20000)});assert(response.ok,`${path}: ${response.status}`);const hash=s=>createHash('sha256').update(s).digest('hex');assert.equal(hash(await response.text()),hash(fs.readFileSync(new URL(path,import.meta.url),'utf8')),`${path} 内容不一致`);}
console.log(JSON.stringify({verifiedAt:new Date().toISOString(),issueId:remote.issues[0].id,status:'线上文件与本地完全一致',productCount:remote.products.length,eventCount:remote.events.length}));
