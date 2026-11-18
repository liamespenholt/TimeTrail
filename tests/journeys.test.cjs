'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const appCode=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
const contentCode=fs.readFileSync(path.join(__dirname,'..','content.js'),'utf8');
const pack=require('../content.js');
const noop=()=>{};
const fakeCtx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),measureText:t=>({width:String(t).length*7})},
 {get:(t,k)=>k in t?t[k]:noop,set:(t,k,v)=>(t[k]=v,true)});
const rect=(name,i)=>({type:'Feature',properties:{NAME:name,SUBJECTO:name},geometry:{type:'Polygon',coordinates:[[[i,40],[i+1,40],[i+1,41],[i,41],[i,40]]]}});
const fixture={type:'FeatureCollection',features:Object.keys(pack.countriesByGeoName).map(rect)};
function harness(date){
 const day=date+'T12:00:00Z';
 class FixedDate extends Date{constructor(...args){super(...(args.length?args:[day]));}static now(){return Date.parse(day);}}
 const elements=new Map(),data=new Map();
 function element(id){if(elements.has(id))return elements.get(id);
  const el={id,textContent:'',innerHTML:'',hidden:false,style:{},classList:{toggle:noop},width:900,height:520,
   addEventListener:noop,querySelector:()=>null,querySelectorAll:()=>[],getBoundingClientRect:()=>({width:900,height:520,left:0,top:0}),getContext:()=>fakeCtx,setPointerCapture:noop};
  elements.set(id,el);return el;
 }
 const document={getElementById:element,createElement:()=>({getContext:()=>fakeCtx})};
 const window={devicePixelRatio:1,isSecureContext:false,matchMedia:()=>({matches:true}),addEventListener:noop};
 const context=vm.createContext({document,window,console,Date:FixedDate,Intl,Math,JSON,Map,Set,Number,String,Array,Promise,
  location:{href:'https://example.org/TimeTrail'},navigator:{},prompt:noop,
  performance:{now:()=>0},requestAnimationFrame:noop,
  localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)},
  fetch:async()=>({ok:true,json:async()=>fixture})});
 vm.runInContext(contentCode,context,{filename:'content.js'});
 vm.runInContext(appCode,context,{filename:'app.js'});
 const ev=source=>vm.runInContext(source,context);
 return {ev,elements,data};
}
for(let i=0;i<10;i++){
 const day=new Date(Date.UTC(2026,10,18+i)).toISOString().slice(0,10);
 test(`journey ${i+1} (${day}) can complete all 5 stops with 500/500`,async()=>{
  const {ev,elements}=harness(day),tour=pack.journeys[i];
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(ev('TOUR.id'),tour.id);
  assert.equal(ev('mapState.features.length'),18);
  ev('startJourney()');
  assert.equal(ev('state.currentCity'),tour.start);
  for(let k=0;k<tour.stops.length;k++){
   const q=tour.stops[k];
   if(ev('state.phase')==='travel')ev('finishTransit()');
   assert.equal(ev('state.phase'),'question',`${tour.id}: question phase at ${k}`);
   assert.equal(ev('currentQuestion().id'),q.id);
   if(q.type!=='choice'){
    assert.equal(elements.get('journal').innerHTML.includes(`<b>${pack.cities[q.city].name}</b>`),false,
      `${q.id}: future target exposed in journey list`);
    if(q.type==='country')ev(`guessCountry({id:${JSON.stringify(q.targetId)},name:'Germany'})`);
    else ev(`guessCity(${JSON.stringify(q.targetId)})`);
   }else ev(`chooseAnswer(${q.correct})`);
   assert.equal(ev('state.phase'),'feedback',`${q.id} feedback`);
   assert.equal(ev('state.score'),(k+1)*100,`${q.id} score`);
   ev('nextStop()');
   if(q.type!=='choice'){
    assert.equal(ev('state.phase'),'travel');
    ev('finishTransit()');
    assert.equal(ev('state.currentCity'),q.city);
    assert.equal(ev('state.phase'),k===4?'results':'arrival');
    if(k!==4)ev('nextStop()');
   }
  }
  assert.equal(ev('state.phase'),'results');
  assert.equal(ev('state.score'),500);
  assert.equal(ev('state.results.length'),5);
  assert.equal(ev('state.visited.length'),6);
  ev('restoreGame()');
  assert.equal(ev('state.score'),500);
  assert.equal(ev('state.phase'),'results');
 });
}
test('wrong choices, reveal answer and duplicate wrong city do not corrupt state',async()=>{
 const {ev}=harness('2026-11-18');await new Promise(resolve=>setImmediate(resolve));
 ev('startJourney()');
 ev("guessCountry({id:'france',name:'France'})");
 ev("guessCountry({id:'france',name:'France'})");
 assert.equal(ev('state.attempts'),1);
 ev('completeAnswer(0)');
 assert.equal(ev('state.score'),0);
 ev('completeAnswer(100)');
 assert.equal(ev('state.score'),0);
 ev('nextStop()');ev('finishTransit()');ev('nextStop()');ev('finishTransit()');
 const correct=ev('currentQuestion().correct');
 ev('chooseAnswer('+((correct+1)%4)+')');
 assert.equal(ev('state.score'),0);
 ev('nextStop()');
 assert.equal(ev('currentQuestion().type'),'city');
 ev("guessCity('sofia')");ev("guessCity('sofia')");
 assert.equal(ev('state.attempts'),1);
 ev("guessCity('constantinople')");
 assert.equal(ev('state.score'),60);
 ev('restoreGame()');
 assert.equal(ev('state.score'),60);
 assert.equal(ev('state.results.length'),3);
});