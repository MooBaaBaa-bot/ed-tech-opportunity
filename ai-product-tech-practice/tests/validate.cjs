const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),C=require('../core.js');
const base=path.join(__dirname,'..'),catalog=JSON.parse(fs.readFileSync(path.join(base,'data/catalog.json')));C.validateCatalog(catalog);
const published=catalog.lessons.filter(l=>l.status==='published');assert(published.length>=3);
for(const m of published){const l=JSON.parse(fs.readFileSync(path.join(base,m.contentPath)));C.validateLesson(l);for(const k of ['id','order','week','title','version','publishedAt','verifiedAt'])assert.deepEqual(l[k],m[k]);assert(!l.sources.some(s=>/utm_|images.openai/.test(s.url)));}
const l=JSON.parse(fs.readFileSync(path.join(base,published[0].contentPath)));
const a={at:'2026-11-01T02:00:00.000Z',version:l.version,answers:[0,0,'查受控资料'],score:1,self:null,quizSnapshot:l.quiz};
const r={attempts:[a],reviews:[],readAt:a.at,readVersion:l.version};
assert(!C.complete(r,l),'reading and quiz alone must not complete');r.practiceSavedAt=a.at;r.practiceVersion=l.version;r.practice='模拟对照';r.judgment='先查来源';r.completedAt=a.at;assert(C.complete(r,l));
assert.equal(C.due(r,l),'2026-11-02T02:00:00.000Z');r.reviews.push({at:'2026-11-03T02:00:00.000Z',note:'复习'});assert.equal(C.due(r,l),'2026-11-10T02:00:00.000Z');r.reviews.push({at:'2026-11-12T02:00:00.000Z',note:'复习'});assert.equal(C.due(r,l),'2026-12-12T02:00:00.000Z');r.reviews.push({at:'2026-12-14T02:00:00.000Z',note:'复习'});assert.equal(C.due(r,l),null);
const s=C.empty();s.records[l.id]=r;s.lastLesson=l.id;C.validateBackup(s);assert.deepEqual(JSON.parse(JSON.stringify(s)),s);
const incoming=JSON.parse(JSON.stringify(s));incoming.records[l.id].practice='不可覆盖';incoming.stages['1']={text:'阶段产物',at:a.at};const merged=C.merge(s,incoming);assert.equal(merged.data.records[l.id].practice,'模拟对照');assert.equal(merged.data.stages['1'].text,'阶段产物');assert.equal(merged.conflicts.length,1);
assert(!C.complete(r,{...l,version:'1.0.1'}),'new versions need new activity');assert(!C.complete(r,{...l,status:'planned'}));
for(const bad of [null,[],{}, {...s,schemaVersion:2},JSON.parse('{"schemaVersion":1,"records":{"__proto__":{}},"stages":{},"lastLesson":null}')])assert.throws(()=>C.validateBackup(bad));
const scoreBad=JSON.parse(JSON.stringify(s));scoreBad.records[l.id].attempts[0].score=2;assert.throws(()=>C.validateBackup(scoreBad));
const invalid=JSON.parse(JSON.stringify(l));invalid.quiz[0].answer=99;assert.throws(()=>C.validateLesson(invalid));invalid.quiz=l.quiz.slice(0,2);assert.throws(()=>C.validateLesson(invalid));
console.log('PASS: 36 IDs/order; 3 complete lessons; sources/dates; completion/version isolation; 1/7/30 review dates; backup roundtrip/conflicts; malformed backup and answer rejection');
