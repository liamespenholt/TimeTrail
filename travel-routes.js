/* Schematic geographic routes for TimeTrail. They use the rendered historical
 * land polygons, not a claim about the actual railways or shipping lanes of 1900.
 * The slight variation is seeded per city pair, so routes stay consistent. */
(function(root,factory){
  const routes=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=routes;
  if(root)root.TIMETRAIL_ROUTES=routes;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const BOUNDS={west:-20,east:56,south:31,north:75};
 const STEP=.8;
 const DIRS=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
 function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
 function pointInRing(lon,lat,ring){
  let inside=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++){
   const a=ring[i],b=ring[j];
   if((a[1]>lat)!==(b[1]>lat)&&lon<(b[0]-a[0])*(lat-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }
  return inside;
 }
 function makePolygons(features){
  const polygons=[];
  for(const feature of features||[])for(const rings of feature.pieces||[]){
   if(!rings[0]||rings[0].length<3)continue;
   let west=Infinity,east=-Infinity,south=Infinity,north=-Infinity;
   for(const p of rings[0]){west=Math.min(west,p[0]);east=Math.max(east,p[0]);south=Math.min(south,p[1]);north=Math.max(north,p[1]);}
   polygons.push({rings,west,east,south,north});
  }
  return polygons;
 }
 function heapPush(heap,item){
  heap.push(item);let i=heap.length-1;
  while(i>0){const p=(i-1)>>1;if(heap[p][0]<=item[0])break;heap[i]=heap[p];i=p;}
  heap[i]=item;
 }
 function heapPop(heap){
  const first=heap[0],last=heap.pop();if(heap.length){
   let i=0;
   while(i*2+1<heap.length){let child=i*2+1;if(child+1<heap.length&&heap[child+1][0]<heap[child][0])child++;
    if(heap[child][0]>=last[0])break;heap[i]=heap[child];i=child;}
   heap[i]=last;
  }
  return first;
 }
 function createPlanner(features){
  const polygons=makePolygons(features);
  const cols=Math.round((BOUNDS.east-BOUNDS.west)/STEP)+1;
  const rows=Math.round((BOUNDS.north-BOUNDS.south)/STEP)+1;
  const count=cols*rows;
  const terrain=new Int8Array(count);terrain.fill(-1);
  function onLand(lon,lat){
   for(const p of polygons){
    if(lon<p.west||lon>p.east||lat<p.south||lat>p.north)continue;
    if(pointInRing(lon,lat,p.rings[0])&&!p.rings.slice(1).some(r=>pointInRing(lon,lat,r)))return true;
   }
   return false;
  }
  function at(i){if(terrain[i]!==-1)return terrain[i];const x=i%cols,y=(i/cols)|0;return terrain[i]=onLand(BOUNDS.west+x*STEP,BOUNDS.south+y*STEP)?1:0;}
  function cell(city){
   const cx=Math.max(0,Math.min(cols-1,Math.round((city.lon-BOUNDS.west)/STEP)));
   const cy=Math.max(0,Math.min(rows-1,Math.round((city.lat-BOUNDS.south)/STEP)));
   // Select a close land cell for cities at coasts or inside narrow polygons.
   let best=-1,bestDist=Infinity;
   for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){
    const x=cx+dx,y=cy+dy;if(x<0||x>=cols||y<0||y>=rows)continue;
    const i=y*cols+x;if(!at(i))continue;
    const dist=Math.hypot((BOUNDS.west+x*STEP-city.lon)*.7,(BOUNDS.south+y*STEP-city.lat));
    if(dist<bestDist){best=i;bestDist=dist;}
   }
   return bestDist<3.1?best:-1;
  }
  function toPoint(i){return {lon:BOUNDS.west+(i%cols)*STEP,lat:BOUNDS.south+((i/cols)|0)*STEP,land:!!at(i)};}
  function search(from,to,seed){
   const start=cell(from),goal=cell(to);
   if(start<0||goal<0)return null;
   const score=new Float64Array(count);score.fill(Infinity);
   const prev=new Int32Array(count);prev.fill(-1);
   const done=new Uint8Array(count);
   const queue=[];
   function heuristic(i){const x=i%cols,y=(i/cols)|0,gx=goal%cols,gy=(goal/cols)|0;return Math.hypot((gx-x)*.7,gy-y);}
   score[start]=0;heapPush(queue,[heuristic(start),start]);
   while(queue.length){
    const [,i]=heapPop(queue);if(done[i])continue;done[i]=1;if(i===goal)break;
    const x=i%cols,y=(i/cols)|0,fromLand=at(i);
    for(const [dx,dy] of DIRS){
     const nx=x+dx,ny=y+dy;if(nx<0||nx>=cols||ny<0||ny>=rows)continue;
     const j=ny*cols+nx;if(done[j])continue;
     const nextLand=at(j);
     // Ferry crossings have a boarding cost, so rail routes stay on land when practical.
     const distance=Math.hypot(dx*.7,dy);
     const switchCost=fromLand!==nextLand?5.4:0;
     const jitter=((hash(seed+':'+i+':'+j)%1000)/1000)*.045;
     const cost=distance*(nextLand?1:1.38)*(1+jitter)+switchCost;
     const next=score[i]+cost;
     if(next<score[j]){score[j]=next;prev[j]=i;heapPush(queue,[next+heuristic(j),j]);}
    }
   }
   if(!done[goal])return null;
   const nodes=[];let i=goal;
   while(i!==-1){nodes.push(toPoint(i));if(i===start)break;i=prev[i];}
   if(i!==start)return null;
   nodes.reverse();
   return [{lon:from.lon,lat:from.lat,land:true},...nodes,{lon:to.lon,lat:to.lat,land:true}];
  }
  function clearLine(a,b,mode){
   const steps=Math.max(2,Math.ceil(Math.hypot((b.lon-a.lon)*.7,b.lat-a.lat)/.36));
   for(let k=1;k<steps;k++){
    const t=k/steps,land=onLand(a.lon+(b.lon-a.lon)*t,a.lat+(b.lat-a.lat)*t);
    if(land!==(mode==='train'))return false;
   }
   return true;
  }
  function simplify(points,mode){
   if(points.length<=2)return points;
   const out=[points[0]];
   let i=0;
   while(i<points.length-1){
    let next=i+1;
    for(let j=Math.min(points.length-1,i+22);j>i+1;j--){
     if(clearLine(points[i],points[j],mode)){next=j;break;}
    }
    out.push(points[next]);i=next;
   }
   return out;
  }
  function addGentleCurve(points,mode,seed){
   const out=[points[0]];
   for(let i=1;i<points.length;i++){
    const a=out[out.length-1],b=points[i];
    const dx=b.lon-a.lon,dy=b.lat-a.lat,dist=Math.hypot(dx*.7,dy);
    if(dist>2.6){
     const side=hash(seed+':'+i)%2?1:-1;
     const amplitude=Math.min(.8,dist*.095)*side;
     const normal=Math.hypot(dx,dy)||1;
     const bent=[.25,.5,.75].map(t=>({
       lon:a.lon+dx*t-dy/normal*amplitude*Math.sin(Math.PI*t),
       lat:a.lat+dy*t+dx/normal*amplitude*Math.sin(Math.PI*t)
     }));
     const candidates=[a,...bent,b];
     if(candidates.slice(0,-1).every((p,k)=>clearLine(p,candidates[k+1],mode))){
      out.push(...bent);
     }
    }
    out.push(b);
   }
   return out;
  }
  function fallback(from,to){
   const dx=to.lon-from.lon,dy=to.lat-from.lat,d=Math.hypot(dx,dy)||1;
   const bend=Math.min(1.3,d*.08);
   return [{mode:'train',points:[{lon:from.lon,lat:from.lat},{
    lon:(from.lon+to.lon)/2-dy/d*bend,lat:(from.lat+to.lat)/2+dx/d*bend
   },{lon:to.lon,lat:to.lat}]}];
  }
  function route(from,to,seed=''){
   if(!from||!to)return {sections:[],hasShip:false,hasTrain:false};
   const raw=polygons.length?search(from,to,String(seed)):null;
   if(!raw||raw.length<2){
    const sections=fallback(from,to);
    return {sections,hasShip:false,hasTrain:true,approximate:true};
   }
   const sections=[];
   let mode=null,points=[];
   function commit(){
    if(points.length<2)return;
    const short=simplify(points,mode);
    sections.push({mode,points:addGentleCurve(short,mode,String(seed)+':'+sections.length).map(p=>({lon:p.lon,lat:p.lat}))});
   }
   for(let i=1;i<raw.length;i++){
    const nextMode=raw[i-1].land&&raw[i].land?'train':'ship';
    if(nextMode!==mode){commit();mode=nextMode;points=[raw[i-1]];}
    points.push(raw[i]);
   }
   commit();
   return {sections,hasShip:sections.some(s=>s.mode==='ship'),hasTrain:sections.some(s=>s.mode==='train'),approximate:false};
  }
  return {route,onLand};
 }
 return {createPlanner};
});