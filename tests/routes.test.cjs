'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createPlanner}=require('../travel-routes.js');
function rectangle(west,south,east,north){
 return {pieces:[[[[west,south],[east,south],[east,north],[west,north],[west,south]]]]};
}
test('routes between inland cities remain on land and curve naturally',()=>{
 const planner=createPlanner([rectangle(0,45,8,54)]);
 const start={lon:1,lat:47},end={lon:7,lat:52};
 const first=planner.route(start,end,'land-check');
 const again=planner.route(start,end,'land-check');
 assert.deepEqual(first,again,'routes should not change between renders');
 assert.equal(first.hasShip,false);
 assert.equal(first.hasTrain,true);
 assert.ok(first.sections[0].points.length>=3,'a long inland journey should have a gentle bend');
 for(const section of first.sections)for(const point of section.points){
  assert.equal(planner.onLand(point.lon,point.lat),true,'train route marker should stay on land');
 }
 assert.deepEqual(first.sections[0].points[0],start);
 assert.deepEqual(first.sections.at(-1).points.at(-1),end);
});
test('crossing water introduces a ferry, with train approaches on land',()=>{
 const planner=createPlanner([rectangle(0,44,6,52),rectangle(9,44,16,52)]);
 const route=planner.route({lon:2,lat:48},{lon:13,lat:48},'ferry-check');
 assert.equal(route.approximate,false);
 assert.equal(route.hasShip,true,'route must not draw trains across open water');
 assert.equal(route.hasTrain,true,'train sections connect the cities to the ferry');
 assert.ok(route.sections.some(s=>s.mode==='ship'));
 const first=route.sections[0].points[0],last=route.sections.at(-1).points.at(-1);
 assert.deepEqual(first,{lon:2,lat:48});
 assert.deepEqual(last,{lon:13,lat:48});
});
test('route safely falls back to a restrained curved schematic if map data is absent',()=>{
 const planner=createPlanner([]);
 const route=planner.route({lon:5,lat:48},{lon:15,lat:53},'loading');
 assert.equal(route.approximate,true);
 assert.equal(route.hasTrain,true);
 assert.equal(route.sections[0].points.length,3);
});
