'use strict';
// TimeTrail v0.4 regression checks for camera gestures and presentation wiring.
const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
function extract(name){
 const prefix='function '+name+'(';
 const at=app.indexOf(prefix);
 assert.ok(at>=0, name+' must exist');
 let brace=app.indexOf('{',at),depth=0;
 for(let i=brace;i<app.length;i++){
  if(app[i]==='{')depth++;
  if(app[i]==='}'&&!--depth)return app.slice(at,i+1);
 }
 throw Error('Unable to extract '+name);
}
test('zoomAt preserves the world coordinate beneath the cursor',()=>{
 const state={w:800,h:500,zoom:1,panX:0,panY:0,needsBase:false};
 const code=[extract('project'),extract('unproject'),extract('zoomAt')].join('\n');
 const ctx={mapState:state,Math,scheduleDraw(){}};
 vm.createContext(ctx);vm.runInContext(code,ctx);
 const before=vm.runInContext('unproject(123,194)',ctx);
 vm.runInContext('zoomAt(2.4,123,194)',ctx);
 const after=vm.runInContext('unproject(123,194)',ctx);
 assert.ok(Math.abs(before.lon-after.lon)<1e-8);
 assert.ok(Math.abs(before.lat-after.lat)<1e-8);
 assert.equal(state.zoom,2.4);
 vm.runInContext('zoomAt(100,123,194)',ctx);
 assert.equal(state.zoom,5,'maximum zoom enforced');
 vm.runInContext('zoomAt(0.001,123,194)',ctx);
 assert.equal(state.zoom,.75,'minimum zoom enforced');
});
test('touch pointer tracking prevents accidental map answers during pinch',()=>{
 assert.match(app,/pointers:new Map\(\),pinch:null/);
 assert.match(app,/function pointerPair\(/);
 assert.match(app,/mapState\.pointers\.size>=2/);
 assert.match(app,/wasPinching\|\|!d\|\|d\.moved/);
 assert.match(app,/pointercancel.*mapState\.pointers\.delete/);
});
test('navigation controls and map cues are versioned and accessible',()=>{
 assert.match(html,/TIMETRAIL V0\.4/);
 assert.match(html,/content\.js\?v=0\.4/);
 assert.match(html,/app\.js\?v=0\.4/);
 assert.match(html,/styles\.css\?v=0\.4/);
 assert.match(html,/SCROLL OR PINCH TO ZOOM/);
 assert.match(app,/function resetViewForQuestion\(/);
 assert.match(app,/aria-label="Expedition progress"/);
 assert.match(app,/class="score-breakdown"/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});
test('city candidate hints and correct answer feedback remain available',()=>{
 assert.match(app,/city-choice-wrong/);
 assert.match(app,/state\.feedback\.correct/);
 assert.match(app,/state\.phase==='question'&&currentQuestion\(\)\.type==='city'/);
});
