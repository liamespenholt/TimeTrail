'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const content=require('../content.js');
const c=content.cities;
const countries=new Set(Object.values(content.countriesByGeoName).map(x=>x.id));

test('exactly 50 individually authored, referenced questions in 10 distinct five-stop journeys',()=>{
 assert.equal(content.questionBank.length,50);
 assert.equal(content.journeys.length,10);
 assert.equal(Object.keys(content.questionsById).length,50);
 assert.equal(new Set(content.journeys.map(j=>j.start)).size>=7,true);
 assert.equal(new Set(content.journeys.map(j=>j.id)).size,10);
 assert.equal(new Set(content.questionBank.map(q=>q.question)).size,50);
 const ids=[];
 for(const q of content.questionBank){
  assert.ok(q.id && q.fact.length>=40 && q.question.length>=28,`Incomplete question ${q.id}`);
  assert.match(q.source,/^https:\/\//,`Source URL for ${q.id}`);
  assert.ok(c[q.city],`Unknown destination ${q.city}`);
  assert.equal(q.year,1900);
  assert.ok(['Easy','Medium','Hard'].includes(q.difficulty));
  assert.ok(['country','city','choice'].includes(q.type));
  if(q.type==='country')assert.ok(countries.has(q.targetId),`Unknown 1900 country ${q.targetId}`);
  if(q.type==='city'){
   assert.equal(q.targetId,q.city,`City answer must equal destination for ${q.id}`);
   assert.equal(q.candidates.length,5);
   assert.equal(new Set(q.candidates).size,5);
   assert.ok(q.candidates.includes(q.targetId));
   q.candidates.forEach(id=>assert.ok(c[id],`Unknown city choice ${id}`));
  }
  if(q.type==='choice'){
   assert.equal(q.options.length,4);
   assert.equal(new Set(q.options).size,4);
   assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4);
  }
 }
 for(const j of content.journeys){
  assert.equal(j.year,1900);
  assert.ok(c[j.start]);assert.equal(j.stops.length,5);
  assert.deepEqual(j.stops.map(q=>q.type),['country','choice','city','choice','country']);
  assert.deepEqual([...j.stops.map(q=>q.difficulty)].sort(),['Easy','Hard','Medium','Medium','Medium'].sort(),`Difficulty balance ${j.id}`);
  let current=j.start;const visited=new Set([current]);
  for(const [index,q] of j.stops.entries()){
   ids.push(q.id);
   assert.notEqual(current,q.city,`Stationary route at ${j.id} stop ${index+1}`);
   if(q.type==='country'){
    assert.notEqual(c[current].countryId,q.targetId,`Already inside country at ${j.id} stop ${index+1}`);
    assert.equal(c[q.city].countryId,q.targetId,`Country target != destination at ${q.id}`);
   }
   if(q.type==='city')assert.notEqual(current,q.targetId);
   assert.equal(visited.has(q.city),false,`Previously revealed destination ${q.city} at ${j.id}`);
   visited.add(q.city);current=q.city;
  }
 }
 assert.equal(new Set(ids).size,50,'Journeys must not recycle questions');
});

test('UTC route selection is deterministic and cycles every ten days',()=>{
 const today=content.journeyForDay('2026-11-18');
 assert.equal(today.id,content.journeys[0].id);
 assert.equal(content.journeyForDay('2026-11-18'),today);
 assert.equal(content.journeyForDay('2026-11-28').id,today.id);
 for(let i=0;i<10;i++){
  const date=new Date(Date.UTC(2026,10,18+i)).toISOString().slice(0,10);
  assert.equal(content.journeyForDay(date).id,content.journeys[i].id);
 }
 for(const date of ['2026-11-31','hello','2026-13-12'])assert.throws(()=>content.journeyForDay(date));
});

test('city choice markers have >=44px separation on a 360px wide mobile map',()=>{
 // Mirrors the camera scale used in app.js and prevents two 44px hit circles from overlapping.
 for(const j of content.journeys){
  const q=j.stops.find(q=>q.type==='city');
  const cities=q.candidates.map(id=>c[id]);
  const west=Math.min(...cities.map(x=>x.lon)),east=Math.max(...cities.map(x=>x.lon));
  const south=Math.min(...cities.map(x=>x.lat)),north=Math.max(...cities.map(x=>x.lat));
  const w=360,h=390,base=Math.min(w/75,h/43);
  const desired=Math.min((w-80)/Math.max(east-west+2,8),(h-80)/Math.max(north-south+2,7));
  const scale=base*Math.max(.75,Math.min(5,desired/base));
  for(let a=0;a<cities.length;a++)for(let b=a+1;b<cities.length;b++){
   const distance=Math.hypot((cities[a].lon-cities[b].lon)*scale,(cities[a].lat-cities[b].lat)*scale);
   assert.ok(distance>=44,`${q.id}: overlapping marker ${q.candidates[a]} / ${q.candidates[b]} (${distance.toFixed(1)} px)`);
  }
 }
});