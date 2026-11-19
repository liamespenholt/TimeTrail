'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const historical=require('../content.js');
const routes=require('../travel-routes.js');
const fs=require('node:fs');
const path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
test('every curated daily leg has a valid illustrated travel path',()=>{
 assert.deepEqual(routes.validateJourneys(),[]);
 assert.equal(historical.journeys.length,10);
 let legs=0, seaLegs=0;
 for(const tour of historical.journeys){
  let prev=tour.start;
  for(const stop of tour.stops){
   const sections=routes.routeFor(prev,stop.city);
   const a=sections[0].points[0], b=sections.at(-1).points.at(-1);
   assert.ok(Math.abs(a.lon-historical.cities[prev].lon)<1e-7);
   assert.ok(Math.abs(a.lat-historical.cities[prev].lat)<1e-7);
   assert.ok(Math.abs(b.lon-historical.cities[stop.city].lon)<1e-7);
   assert.ok(Math.abs(b.lat-historical.cities[stop.city].lat)<1e-7);
   assert.ok(routes.routeLength(sections)>0);
   assert.ok(sections.every(s=>['land','sea'].includes(s.mode)&&s.points.length>=2));
   const midpoint=routes.pointAt(sections,.5);
   assert.ok(Number.isFinite(midpoint.lon)&&Number.isFinite(midpoint.lat));
   assert.ok(['land','sea'].includes(midpoint.mode));
   assert.ok(sections.some(s=>s.points.length>2)||sections.length>1||sections[0].mode==='sea',
    prev+' → '+stop.city+' should not be a direct train line');
   if(sections.some(s=>s.mode==='sea'))seaLegs++;
   legs++;prev=stop.city;
  }
 }
 assert.equal(legs,50);
 assert.ok(seaLegs>=10,'sea crossings must be represented by boats');
});
test('known coast-crossing journeys explicitly change travel mode',()=>{
 for(const [from,to] of [
  ['stockholm','berlin'],['copenhagen','stockholm'],['brussels','london'],
  ['london','lisbon'],['athens','rome'],['riga','stockholm'],
  ['naples','constantinople'],['helsinki','berlin'],['sofia','bucharest']
 ]){
  assert.ok(routes.routeFor(from,to).some(s=>s.mode==='sea'),from+' → '+to+' needs a ship');
 }
 for(const [from,to] of [['berlin','vienna'],['lisbon','madrid'],['rome','naples'],['berlin','hamburg']]){
  assert.ok(routes.routeFor(from,to).every(s=>s.mode==='land'),from+' → '+to+' should remain on land');
 }
});
test('route interpolation and reverse route are reliable',()=>{
 const sections=routes.routeFor('stockholm','berlin');
 const first=routes.pointAt(sections,0),end=routes.pointAt(sections,1);
 assert.equal(first.lon,historical.cities.stockholm.lon);
 assert.equal(end.lon,historical.cities.berlin.lon);
 assert.ok(routes.pointAt(sections,.8).lon!==first.lon);
 const reverse=routes.routeFor('berlin','stockholm');
 assert.equal(reverse[0].points[0].lon,historical.cities.berlin.lon);
 assert.equal(reverse.at(-1).points.at(-1).lon,historical.cities.stockholm.lon);
 assert.throws(()=>routes.routeFor('berlin','berlin'),/Missing curated route/);
});
test('browser loads travel routes before game engine and changes vehicle on water',()=>{
 assert.ok(html.indexOf('content.js?v=0.4.1')<html.indexOf('travel-routes.js?v=0.4.1'));
 assert.ok(html.indexOf('travel-routes.js?v=0.4.1')<html.indexOf('app.js?v=0.4.1'));
 assert.match(app,/function drawShip\(/);
 assert.match(app,/vehicle\.mode==='sea'\)drawShip/);
 assert.match(app,/TRAVEL\.routeFor\(visited\[i-1\],visited\[i\]\)/);
 assert.match(app,/id="travel-mode-label"/);
});
