/* Pure validation and record rules, shared by browser and Node tests. */
(function(root,factory){if(typeof module==='object')module.exports=factory();else root.APTL=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const KEY='aptl.records.v1', date=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s.slice(0,10)+'T00:00:00Z').toISOString().slice(0,10)===s.slice(0,10);
const plain=x=>!!x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).every(k=>!['__proto__','constructor','prototype'].includes(k));
const text=x=>typeof x==='string'&&x.length<=100000;
function assert(x,msg){if(!x)throw Error(msg);}
function validateLesson(l){
 assert(plain(l)&&/^aptl-\d{2}$/.test(l.id),'课程 ID 无效');
 assert(Number.isInteger(l.order)&&l.order>=1&&l.order<=36&&l.week===Math.ceil(l.order/3),'课次/周次无效');
 for(const k of ['title','expectedArtifact','version'])assert(text(l[k])&&l[k].length>0,'缺少 '+k);
 assert(Array.isArray(l.objectives)&&l.objectives.length&&l.objectives.every(text),'目标无效');
 assert(l.estimatedMinutes>=15&&l.estimatedMinutes<=20,'用时无效');
 assert(['planned','published'].includes(l.status),'发布状态无效');
 assert(Array.isArray(l.relatedLessons),'关联课程无效');
 if(l.status==='planned'){assert(l.publishedAt===null&&!l.contentPath,'规划课程不能伪装发布');return true;}
 assert(date(l.publishedAt)&&date(l.verifiedAt),'课程日期无效');
 assert(plain(l.concept)&&plain(l.caseStudy)&&plain(l.practice),'已发布课程模块不全');
 for(const k of ['summary','boundary','misconception','connection'])assert(text(l.concept[k])&&l.concept[k].length,'概念缺少 '+k);
 assert(l.concept.flow?.length>=3&&l.concept.paragraphs?.length>=2,'概念流程不全');
 for(const k of ['title','audience','facts','claim','inference','boundary','access'])assert(text(l.caseStudy[k])&&l.caseStudy[k].length,'案例缺少 '+k);
 assert(l.caseStudy.journey?.length>=2,'案例流程缺失');
 for(const k of ['mode','purpose','input','observe','save','judgment'])assert(text(l.practice[k])&&l.practice[k].length,'练习缺少 '+k);
 assert(l.practice.steps?.length>=3&&l.practice.steps.length<=5,'练习应有3—5步');
 assert(Array.isArray(l.quiz)&&l.quiz.length===3,'测验必须恰好三题');
 l.quiz.forEach((q,i)=>{assert(text(q.prompt)&&q.prompt.length,'题干缺失');if(i<2){assert(q.type==='choice'&&q.options?.length>=2&&q.options.every(text),'客观题无效');assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.options.length,'答案无效');assert(q.explanations?.length===q.options.length&&q.explanations.every(text),'解析缺失');}else assert(q.type==='open'&&q.rubric?.length&&q.rubric.every(text),'开放题自评标准缺失');});
 assert(l.sources?.length>0,'缺少来源');l.sources.forEach(s=>assert(text(s.title)&&text(s.publisher)&&/^https:\/\//.test(s.url)&&date(s.verifiedAt)&&(s.publishedAt===null||date(s.publishedAt)),'来源或核验日期无效'));
 return true;
}
function validateCatalog(c){assert(c.schemaVersion===1&&Array.isArray(c.lessons)&&c.lessons.length===36,'课程目录必须包含36课');const ids=new Set(),orders=new Set();c.lessons.forEach(l=>{assert(!ids.has(l.id)&&!orders.has(l.order),'课次重复');assert(l.id==='aptl-'+String(l.order).padStart(2,'0'),'ID与顺序不一致');assert(l.status==='planned'||/^data\/lessons\/aptl-\d{2}\.v\d+\.\d+\.\d+\.json$/.test(l.contentPath),'课程路径无效');ids.add(l.id);orders.add(l.order);if(l.status==='planned')validateLesson(l);});assert(c.lessons.every((l,i)=>l.order===i+1),'课程顺序错误');return true;}
function empty(){return {schemaVersion:1,records:{},stages:{},lastLesson:null};}
function latest(r,l){return (r?.attempts||[]).filter(a=>a.version===l.version).at(-1);}
function complete(r,l){return l.status==='published'&&r?.readVersion===l.version&&r?.practiceVersion===l.version&&!!r?.practiceSavedAt&&!!latest(r,l);}
function due(r,l){if(!r)return null;const manual=r.reviewRequestedAt, a=latest(r,l);if(manual)return manual;if(!complete(r,l)&&!(a?.score<2))return null;const rev=r.reviews||[];if(rev.length>=3)return null;const base=rev.at(-1)?.at||r.completedAt||a?.at;if(!base)return null;return new Date(Date.parse(base)+[1,7,30][rev.length]*86400000).toISOString();}
function validateBackup(b){
 assert(plain(b)&&b.schemaVersion===1&&plain(b.records)&&plain(b.stages),'备份格式或版本不正确');
 assert(b.lastLesson===null||/^aptl-(0[1-9]|[12]\d|3[0-6])$/.test(b.lastLesson),'继续位置无效');
 assert(Object.keys(b.records).length<=36,'记录数量异常');
 for(const [id,r] of Object.entries(b.records)){
 assert(/^aptl-(0[1-9]|[12]\d|3[0-6])$/.test(id)&&plain(r),'记录ID或内容无效');
 const allowed=['draft','practice','judgment','readAt','readVersion','practiceSavedAt','practiceVersion','completedAt','attempts','reviews','reviewRequestedAt','weakNote','updatedAt'];
 assert(Object.keys(r).every(k=>allowed.includes(k)),'记录包含未知字段');
 for(const k of ['draft','practice','judgment','weakNote','readVersion','practiceVersion'])if(k in r)assert(text(r[k]),'文本字段无效');
 for(const k of ['readAt','practiceSavedAt','completedAt','reviewRequestedAt','updatedAt'])if(r[k]!=null)assert(date(r[k]),'记录日期无效');
 assert(!r.attempts||Array.isArray(r.attempts)&&r.attempts.length<=1000,'测验记录无效');
 (r.attempts||[]).forEach(a=>{assert(plain(a)&&date(a.at)&&text(a.version)&&Array.isArray(a.answers)&&a.answers.length===3&&a.answers.slice(0,2).every(x=>Number.isInteger(x)&&x>=0&&x<10)&&text(a.answers[2])&&Number.isInteger(a.score)&&a.score>=0&&a.score<=2,'测验内容无效');assert(Array.isArray(a.quizSnapshot)&&a.quizSnapshot.length===3,'历史题目缺失');a.quizSnapshot.forEach((q,i)=>{assert(plain(q)&&text(q.prompt),'历史题目无效');if(i<2)assert(q.type==='choice'&&Array.isArray(q.options)&&q.options.every(text)&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.options.length&&a.answers[i]<q.options.length&&Array.isArray(q.explanations)&&q.explanations.length===q.options.length&&q.explanations.every(text),'历史客观题无效');else assert(q.type==='open'&&Array.isArray(q.rubric)&&q.rubric.every(text),'历史开放题无效');});assert(a.score===a.answers.slice(0,2).reduce((s,v,i)=>s+(v===a.quizSnapshot[i].answer?1:0),0),'分数与作答不符');assert(a.self===null||['needs-review','partial','explained'].includes(a.self),'自评值无效');});
 assert(!r.reviews||Array.isArray(r.reviews)&&r.reviews.every(v=>plain(v)&&date(v.at)&&text(v.note)),'复习记录无效');
 }
 for(const [id,s] of Object.entries(b.stages))assert(/^[1-6]$/.test(id)&&plain(s)&&text(s.text)&&date(s.at),'阶段成果无效');
 return true;
}
function merge(a,b){validateBackup(a);validateBackup(b);const out=JSON.parse(JSON.stringify(a)), conflicts=[];for(const section of ['records','stages'])for(const [id,r] of Object.entries(b[section])){if(Object.hasOwn(out[section],id)){if(JSON.stringify(out[section][id])!==JSON.stringify(r))conflicts.push(section+':'+id);}else out[section][id]=r;}if(!out.lastLesson)out.lastLesson=b.lastLesson;return {data:out,conflicts};}
return {KEY,empty,validateCatalog,validateLesson,validateBackup,merge,latest,complete,due};
});
