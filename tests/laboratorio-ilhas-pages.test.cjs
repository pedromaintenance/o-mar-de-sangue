'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const root='laboratorio-ilhas/';
const html=fs.readFileSync(root+'index.html','utf8');
const data=JSON.parse(fs.readFileSync(root+'catalog.json','utf8'));
assert.equal(data.events.length,19);
assert.equal(data.events.reduce((n,e)=>n+e.options.length,0),95);
assert(data.events.every(e=>e.options.length===5));
assert(html.includes("fetch('./catalog.json?ts='+Date.now()"),'Live JSON fetch required');
assert(html.includes("loadGameSource('SeaIslands.js')"));
assert(html.includes("loadGameSource('SeaPoliticalEvents.js')"));
assert(html.includes('id="showProposal"')&&html.includes('id="showCurrent"'));
assert(!html.includes('id="catalogData"'),'Events must not be hardcoded in HTML');
const scripts=[...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);
assert(scripts.length>0,'Script body expected');
for(const body of scripts)new vm.Script(body);
const ids=new Set();
for(const event of data.events)for(const option of event.options){
 assert(!ids.has(option.id),'Duplicate ID '+option.id);ids.add(option.id);
 assert(typeof option.formula==='string'&&option.formula.length>1,'Missing formula for '+option.id);
 assert(typeof option.title==='string'&&option.title.length,'Missing title for '+option.id);
}
console.log('PASS Pages: standalone URL, 19 scenarios, 95 choices, external live rules and valid script');
