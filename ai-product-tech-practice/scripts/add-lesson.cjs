/* Manual content publication only. No scheduler, network or record access. */
const fs=require('node:fs'),path=require('node:path'),C=require('../core.js');
const base=path.resolve(__dirname,'..'),catalogPath=path.join(base,'data/catalog.json');
const args=process.argv.slice(2),file=args.find(a=>!a.startsWith('--')),dry=args.includes('--dry-run');
if(!file){console.error('Usage: node scripts/add-lesson.cjs draft.json [--dry-run]');process.exit(1);}
const lock=path.join(base,'.content-publish.lock');let locked=false;
try{
 fs.writeFileSync(lock,'content publication in progress',{flag:'wx'});locked=true;
 const l=JSON.parse(fs.readFileSync(path.resolve(file),'utf8'));C.validateLesson(l);if(l.status!=='published')throw Error('draft must be complete and marked published');
 if(!/^\d+\.\d+\.\d+$/.test(l.version))throw Error('use semver x.y.z');
 const cat=JSON.parse(fs.readFileSync(catalogPath));C.validateCatalog(cat);const i=cat.lessons.findIndex(x=>x.id===l.id),old=cat.lessons[i];
 if(i<0||old.order!==l.order||old.title!==l.title)throw Error('ID/order/title must match curriculum');
 if(old.status==='published'){
 const v=l.version.split('.').map(Number),o=old.version.split('.').map(Number);let higher=false;for(let j=0;j<3;j++){if(v[j]!==o[j]){higher=v[j]>o[j];break;}}if(!higher)throw Error('revision requires higher version');
 if(l.publishedAt!==old.publishedAt)throw Error('preserve original publishedAt on revision');
 if(!l.revisionNote||!l.revisedAt||!Number.isFinite(Date.parse(l.revisedAt)))throw Error('revision requires revisedAt and revisionNote');
 }
 const rel=`data/lessons/${l.id}.v${l.version}.json`,dest=path.join(base,rel);if(fs.existsSync(dest))throw Error('immutable file exists; never overwrite');
 const meta={...l,contentPath:rel};for(const k of ['concept','caseStudy','practice','quiz'])meta[k]=null;cat.lessons[i]=meta;C.validateCatalog(cat);
 if(dry)console.log('PASS dry run; no content written');else{
 fs.writeFileSync(dest,JSON.stringify({...l,contentPath:rel},null,2)+'\n',{flag:'wx'});
 const tmp=catalogPath+'.tmp';fs.writeFileSync(tmp,JSON.stringify(cat,null,2)+'\n',{flag:'wx'});fs.renameSync(tmp,catalogPath);
 console.log('Added immutable version and updated catalog. Review diff, validate, then commit manually.');
 }
}catch(e){console.error(e.message);process.exitCode=1;}finally{if(locked)fs.unlinkSync(lock);}
