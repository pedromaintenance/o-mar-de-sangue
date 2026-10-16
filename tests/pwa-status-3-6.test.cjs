/* Contract tests for the 3.6a PWA shell: no forced reload or game state writes.
 * Run: node tests/pwa-status-3-6.test.cjs
 */
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const src=fs.readFileSync('PwaStatus.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const worker=fs.readFileSync('sw.js','utf8');
class Target {
 constructor(){this.events={};this.hidden=true;}
 addEventListener(type,cb){(this.events[type]??=[]).push(cb);}
 emit(type,e={}){for(const cb of this.events[type]||[])cb(e);}
}
async function scenario(initialController){
 let reloads=0,registers=0,checks=0;
 const els=Object.fromEntries(['pwa-offline','pwa-update','pwa-status','install-btn']
  .map(id=>[id,new Target()]));
 const service=new Target();
 service.controller=initialController?{}:null;
 service.register=async()=>{registers++;return {waiting:null,update:async()=>{checks++}};};
 const win=new Target();win.location={reload(){reloads++}};
 const nav={onLine:true,serviceWorker:service};
 const doc={getElementById:id=>els[id]};
 const ctx={window:win,navigator:nav,document:doc,console};
 vm.createContext(ctx);
 vm.runInContext(src+';this.pwa=SEA_PWA;',ctx);
 const pwa=ctx.pwa;
 assert.equal(pwa.ready,true);
 assert.equal(els['pwa-status'].hidden,true,'Online by default');
 nav.onLine=false;win.emit('offline');
 assert.equal(els['pwa-offline'].hidden,false);
 assert.equal(els['pwa-status'].hidden,false);
 nav.onLine=true;win.emit('online');
 assert.equal(els['pwa-status'].hidden,true);
 service.emit('controllerchange');
 assert.equal(els['pwa-update'].hidden,!initialController,
  'First install must not masquerade as update');
 assert.equal(reloads,0,'Activation must never reload game automatically');
 service.emit('controllerchange'); // Simulate a later update
 assert.equal(els['pwa-update'].hidden,false);
 els['pwa-update'].emit('click');
 assert.equal(reloads,1,'Only an intentional click may reload');
 win.emit('load');await Promise.resolve();await Promise.resolve();
 assert.equal(registers,1);
 assert.equal(checks,1);
 let installed=0;
 win.emit('beforeinstallprompt',{preventDefault(){},prompt:async()=>{installed++},
    userChoice:Promise.resolve({outcome:'accepted'})});
 assert.equal(els['install-btn'].hidden,false);
 els['install-btn'].emit('click');
 await Promise.resolve();await Promise.resolve();
 assert.equal(installed,1,'Existing installation action must be preserved');
 win.emit('appinstalled');assert.equal(els['install-btn'].hidden,true);
}
(async()=>{
 await scenario(false);
 await scenario(true);
 for(const needle of ['id="pwa-status"','id="pwa-update"','id="pwa-offline"',
   'src="PwaStatus.js"'])assert(html.includes(needle),'Shell missing '+needle);
 assert(worker.includes('"./PwaStatus.js"'),'Offline cache must contain status module');
 assert(worker.includes('omar-mar-de-sangue-v40-offline-20261016'));
 assert(!/SeaProfile\\.(?:load|store|reset|settle|buy)\\s*\\(|\\blocalStorage\\s*[.\\[]|\\bsessionStorage\\s*[.\\[]/.test(src),
     'PWA status must not read or change game/profile data');
 console.log('PASS 3.6a: offline label, non-forced update, first install, PWA registration and save isolation');
})().catch(e=>{console.error(e);process.exitCode=1});
