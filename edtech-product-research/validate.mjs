import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const file = process.argv[2] || fileURLToPath(new URL('./data.json', import.meta.url));
export function validate(d) {
  assert.equal(d.schemaVersion,1);
  const keys=(obj,allowed)=>{for(const key of Object.keys(obj))assert(allowed.includes(key),`非白名单字段：${key}`);};
  keys(d,['schemaVersion','categories','schedule','sources','products','events','articles','issues','runs','pending']);
  assert.deepEqual(d.categories,['自主学习','高等教育','K-12','语言学习','教师工具','企业学习','阅读','数学','作业辅导','综合学习']);
  const safe=v=>{const u=new URL(v);assert(['http:','https:'].includes(u.protocol));assert(!u.username&&!u.password);};
  const timestamp=v=>{assert(v && Number.isFinite(Date.parse(v)),`无效日期 ${v}`);};
  const ids={};for(const group of ['sources','products','events','articles','issues','runs']){ids[group]=new Set();for(const row of d[group]){assert(/^[a-z0-9][a-z0-9-]*$/.test(row.id));assert(!ids[group].has(row.id),`重复 ID ${row.id}`);ids[group].add(row.id);}}
  const refs=(values,group)=>{assert(Array.isArray(values));for(const id of values)assert(ids[group].has(id),`缺失引用 ${group}/${id}`);assert.equal(values.length,new Set(values).size);};
  for(const s of d.sources){keys(s,['id','title','url','verifiedAt','type']);safe(s.url);timestamp(s.verifiedAt);}
  for(const p of d.products){keys(p,['id','name','aliases','company','country','website','category','scene','summary','status','productStatus','completeness','evidence','verifiedAt','updatedAt','highlights','facts','unknowns']);assert(d.categories.includes(p.category));safe(p.website);timestamp(p.verifiedAt);timestamp(p.updatedAt);assert(p.highlights.length>=3);for(const f of p.facts){keys(f,['label','text','type','sources']);refs(f.sources,'sources');}}
  for(const e of d.events){keys(e,['id','productId','version','type','classification','title','before','after','availability','impact','technology','limitations','announcedAt','availableAt','discoveredAt','verifiedAt','sources','evidenceType','revisionNote']);assert(ids.products.has(e.productId));assert(Number.isInteger(e.version)&&e.version>0);refs(e.sources,'sources');assert(e.sources.length);timestamp(e.announcedAt);timestamp(e.discoveredAt);timestamp(e.verifiedAt);if(e.availableAt)timestamp(e.availableAt);assert(e.revisionNote);}
  for(const a of d.articles){keys(a,['id','productId','title','subtitle','kind','verifiedAt','sources','flow','sections']);assert(ids.products.has(a.productId));refs(a.sources,'sources');for(const s of a.sections){keys(s,['heading','body','type','sources']);refs(s.sources,'sources');}}
  for(const i of d.issues){keys(i,['id','version','title','windowStart','windowEnd','timezone','status','asOf','generatedAt','publishedAt','summary','eventIds','backfillIds','articleIds','coverage','limitations','revisionNote']);assert.equal(i.timezone,'America/Los_Angeles');timestamp(i.windowStart);timestamp(i.windowEnd);assert(Date.parse(i.windowStart)<Date.parse(i.windowEnd));refs(i.eventIds,'events');refs(i.backfillIds,'events');refs(i.articleIds,'articles');refs(i.coverage,'products');for(const id of i.eventIds){const e=d.events.find(e=>e.id===id);assert.equal(e.classification,'本期变化');assert(Date.parse(e.announcedAt)>=Date.parse(i.windowStart)&&Date.parse(e.announcedAt)<Date.parse(i.windowEnd));}if(i.publishedAt)timestamp(i.publishedAt);}
  for(const r of d.runs){keys(r,['id','issueId','scheduledFor','startedAt','researchCompletedAt','generatedAt','publishAttemptedAt','verifiedAt','status','note']);assert(ids.issues.has(r.issueId));if(r.status==='已线上核验'){timestamp(r.publishAttemptedAt);timestamp(r.verifiedAt);assert(Date.parse(r.verifiedAt)>=Date.parse(r.publishAttemptedAt));}}
  keys(d.schedule,['name','timezone','description','status','note']);assert.equal(d.schedule.timezone,'America/Los_Angeles');
  for(const p of d.pending){keys(p,['productId','question']);assert(ids.products.has(p.productId));}
  const raw=JSON.stringify(d);assert(!/(?:notion\.so|notion\.com|collection:\/\/|notion-file|sk-[a-zA-Z0-9]{16}|ghp_[a-zA-Z0-9]|github_pat_|综合评分|个人备注)/i.test(raw),'发现禁止公开内容');
  return {products:d.products.length,events:d.events.length,issues:d.issues.length};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){console.log('校验通过',validate(JSON.parse(fs.readFileSync(file,'utf8'))));}
