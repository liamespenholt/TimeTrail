/* TimeTrail v0.4 – illustrated land and sea travel corridors.
 * These are deliberately schematic waypoints, NOT verified 1900 railway lines,
 * ferry timetables or border crossing permissions. No direct-line fallback:
 * every leg in the 10 curated journeys must have a defined route. */
(function (root,factory) {
  const content=root?.TIMETRAIL_CONTENT || (typeof module!=='undefined' && module.exports ? require('./content.js') : null);
  const api=factory(content);
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.TIMETRAIL_ROUTES=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(content) {
 'use strict';
 if(!content?.cities)throw new Error('Load historical content before travel routes');
 const C=content.cities;
 const W={
  norrkoping:[16.19,58.59],jonkoping:[14.16,57.78],malmo:[13.00,55.60],trelleborg:[13.16,55.38],
  stralsund:[13.09,54.31],neubrandenburg:[13.26,53.56],dresden:[13.74,51.05],brno:[16.61,49.20],
  nis:[21.90,43.32],plovdiv:[24.75,42.14],edirne:[26.55,41.68],tekirdag:[27.51,40.98],
  corinth:[22.93,37.94],patras:[21.73,38.24],brindisi:[17.95,40.64],bari:[16.87,41.12],
  foggia:[15.54,41.46],helsingor:[12.61,56.04],helsingborg:[12.69,56.05],
  orebro:[15.21,59.27],karlstad:[13.51,59.38],kongsvinger:[12.00,60.19],
  norrtalje:[18.70,59.76],turku:[22.27,60.45],vyborg:[28.75,60.70],
  tallinn:[24.75,59.44],parnu:[24.50,58.38],kaunas:[23.90,54.90],poznan:[16.93,52.40],
  antwerp:[4.40,51.22],lille:[3.06,50.63],calais:[1.85,50.95],dover:[1.31,51.13],
  canterbury:[1.08,51.28],york:[-1.08,53.96],newcastle:[-1.61,54.98],
  berwick:[-2.00,55.77],bordeaux:[-0.58,44.84],bayonne:[-1.48,43.49],
  irun:[-1.79,43.34],burgos:[-3.70,42.34],valladolid:[-4.72,41.65],
  salamanca:[-5.66,40.97],coimbra:[-8.43,40.21],evora:[-7.91,38.57],
  badajoz:[-6.97,38.88],merida:[-6.34,38.91],dijon:[4.99,47.32],
  chambery:[5.92,45.57],turin:[7.69,45.07],genoa:[8.94,44.41],
  laspezia:[9.82,44.10],pisa:[10.40,43.72],novisad:[19.84,45.25],
  pirot:[22.59,43.15],ruse:[25.96,43.84],giurgiu:[25.97,43.90],
  blagoevgrad:[23.10,42.02],serres:[23.55,41.09],thessaloniki:[22.94,40.64],
  larissa:[22.42,39.64],komotini:[25.41,41.12],roskilde:[12.08,55.64],
  korsor:[11.14,55.33],nyborg:[10.80,55.31],odense:[10.39,55.40],
  kolding:[9.47,55.49],flensburg:[9.43,54.78],wroclaw:[17.04,51.11],
  lodz:[19.46,51.76],bialystok:[23.16,53.13],daugavpils:[26.53,55.87],
  nice:[7.26,43.70],ventimiglia:[7.61,43.79],formia:[13.61,41.26],
  tyrrhenian:[14.80,39.50],messina_sea:[15.55,38.25],ionian:[19.00,37.25],
  aegean:[25.10,37.50],dardanelles:[26.50,40.20],
  zaragoza:[-0.88,41.65],tarragona:[1.24,41.11],aveiro:[-8.65,40.64],
  augsburg:[10.89,48.37],kempten:[10.31,47.72],bregenz:[9.75,47.50],
  st_margrethen:[9.64,47.45],st_gallen:[9.38,47.42],aarau:[8.04,47.39],
  innsbruck:[11.40,47.26],salzburg:[13.05,47.80],linz:[14.29,48.30],
  graz:[15.44,47.07],ljubljana:[14.51,46.06],zagreb:[15.98,45.81],
  kosice:[21.26,48.72],miskolc:[20.79,48.10],magdeburg:[11.63,52.12],
  bremen:[8.80,53.08],osnabruck:[8.05,52.28],munster:[7.62,51.96],
  arnhem:[5.91,51.98],eindhoven:[5.48,51.44]
 };
 const catalog=new Map();
 const xy=id=>C[id]?[C[id].lon,C[id].lat]:W[id];
 function add(from,to,...legs){
  if(!C[from]||!C[to]||catalog.has(from+'>'+to))throw Error('Invalid route '+from+' → '+to);
  let prev=from;
  const sections=legs.map(([mode,...waypoints],i)=>{
   if(mode!=='land'&&mode!=='sea')throw Error('Invalid route mode');
   const stops=[prev,...waypoints,...(i===legs.length-1?[to]:[])];
   if(stops.length<2)throw Error('Empty travel section '+from+' → '+to);
   const points=stops.map(k=>{const p=xy(k);if(!p)throw Error('Unknown waypoint '+k);return {lon:p[0],lat:p[1]};});
   prev=stops[stops.length-1];return {mode,points};
  });
  if(prev!==to)throw Error('Route does not reach destination '+to);
  catalog.set(from+'>'+to,sections);
 }
 // 01 · Imperial capitals
 add('stockholm','berlin',['land','norrkoping','jonkoping','malmo','trelleborg'],['sea','stralsund'],['land','neubrandenburg']);
 add('berlin','vienna',['land','dresden','prague','brno']);
 add('vienna','constantinople',['land','budapest','belgrade','nis','sofia','plovdiv','edirne','tekirdag']);
 add('constantinople','athens',['land','tekirdag','edirne','komotini','thessaloniki','larissa']);
 add('athens','rome',['land','corinth','patras'],['sea','brindisi'],['land','bari','foggia','naples']);
 // 02 · Northern crowns
 add('copenhagen','stockholm',['land','helsingor'],['sea','helsingborg'],['land','jonkoping','norrkoping']);
 add('stockholm','kristiania',['land','orebro','karlstad','kongsvinger']);
 add('kristiania','st_petersburg',['land','kongsvinger','karlstad','orebro','stockholm','norrtalje'],['sea','turku'],['land','helsinki','vyborg']);
 add('st_petersburg','helsinki',['land','vyborg']);
 add('helsinki','berlin',['sea','tallinn'],['land','parnu','riga','kaunas','warsaw','poznan']);
 // 03 · Western powers
 add('amsterdam','paris',['land','antwerp','lille']);
 add('paris','brussels',['land','lille']);
 add('brussels','london',['land','lille','calais'],['sea','dover'],['land','canterbury']);
 add('london','edinburgh',['land','york','newcastle','berwick']);
 add('edinburgh','madrid',['land','berwick','newcastle','york','london','dover'],['sea','calais'],['land','paris','bordeaux','bayonne','irun','burgos']);
 // 04 · Atlantic connections
 add('london','lisbon',['land','dover'],['sea','calais'],['land','paris','bordeaux','bayonne','irun','burgos','valladolid','salamanca','coimbra']);
 add('lisbon','madrid',['land','evora','badajoz','merida']);
 add('madrid','paris',['land','burgos','irun','bayonne','bordeaux']);
 add('paris','lyon',['land','dijon']);
 add('lyon','rome',['land','chambery','turin','genoa','laspezia','pisa']);
 // 05 · Balkan crossroads
 add('budapest','belgrade',['land','novisad']);
 add('belgrade','sofia',['land','nis','pirot']);
 add('sofia','bucharest',['land','ruse'],['sea','giurgiu'],['land']);
 add('bucharest','athens',['land','giurgiu'],['sea','ruse'],['land','sofia','blagoevgrad','serres','thessaloniki','larissa']);
 add('athens','constantinople',['land','larissa','thessaloniki','komotini','edirne','tekirdag']);
 // 06 · Baltic borderlands
 add('copenhagen','berlin',['land','roskilde','korsor'],['sea','nyborg'],['land','odense','kolding','flensburg','hamburg']);
 add('berlin','prague',['land','dresden']);
 add('prague','warsaw',['land','wroclaw','lodz']);
 add('warsaw','riga',['land','bialystok','kaunas','daugavpils']);
 add('riga','stockholm',['sea']);
 // 07 · Mediterranean monarchies
 add('marseille','rome',['land','nice','ventimiglia','genoa','laspezia','pisa']);
 add('rome','naples',['land','formia']);
 add('naples','constantinople',['sea','tyrrhenian','messina_sea','ionian','aegean','dardanelles']);
 // constantinople → athens was defined in tour 01
 add('athens','bucharest',['land','larissa','thessaloniki','serres','blagoevgrad','sofia','ruse'],['sea','giurgiu'],['land']);
 // 08 · Iberian passage
 add('paris','madrid',['land','bordeaux','bayonne','irun','burgos']);
 add('madrid','barcelona',['land','zaragoza','tarragona']);
 add('barcelona','lisbon',['land','zaragoza','madrid','salamanca','coimbra']);
 add('lisbon','porto',['land','coimbra','aveiro']);
 add('porto','brussels',['land','salamanca','burgos','irun','bayonne','bordeaux','paris','lille']);
 // 09 · Alpine corridor
 add('munich','zurich',['land','augsburg','kempten','bregenz','st_margrethen','st_gallen']);
 add('zurich','bern',['land','aarau']);
 add('bern','vienna',['land','zurich','st_gallen','bregenz','innsbruck','salzburg','linz']);
 add('vienna','trieste',['land','graz','ljubljana']);
 add('trieste','sofia',['land','ljubljana','zagreb','belgrade','nis']);
 // 10 · Empires borderlands
 add('warsaw','budapest',['land','krakow','kosice','miskolc']);
 add('budapest','krakow',['land','miskolc','kosice']);
 add('krakow','berlin',['land','wroclaw','dresden']);
 add('berlin','hamburg',['land','magdeburg']);
 add('hamburg','brussels',['land','bremen','osnabruck','munster','arnhem','eindhoven','antwerp']);
 function routeFor(from,to){
  const direct=catalog.get(from+'>'+to);
  if(direct)return direct;
  const reverse=catalog.get(to+'>'+from);
  if(reverse)return reverse.slice().reverse().map(s=>({mode:s.mode,points:s.points.slice().reverse()}));
  throw new Error('Missing curated route: '+from+' → '+to);
 }
 function routeLength(sections){
  return sections.reduce((sum,s)=>sum+s.points.slice(1).reduce((inner,p,i)=>{
   const q=s.points[i],latitude=(p.lat+q.lat)*Math.PI/360;
   return inner+Math.hypot((p.lon-q.lon)*Math.cos(latitude),p.lat-q.lat);
  },0),0);
 }
 function pointAt(sections,t){
  const total=routeLength(sections),wanted=Math.max(0,Math.min(1,t))*total;
  let soFar=0;
  for(let j=0;j<sections.length;j++){
   const section=sections[j];
   for(let i=1;i<section.points.length;i++){
    const a=section.points[i-1],b=section.points[i],lat=(a.lat+b.lat)*Math.PI/360;
    const length=Math.hypot((b.lon-a.lon)*Math.cos(lat),b.lat-a.lat);
    if(soFar+length>=wanted||j===sections.length-1&&i===section.points.length-1){
     const f=length?Math.min(1,Math.max(0,(wanted-soFar)/length)):1;
     return {lon:a.lon+(b.lon-a.lon)*f,lat:a.lat+(b.lat-a.lat)*f,mode:section.mode};
    }
    soFar+=length;
   }
  }
  throw new Error('Empty curated route');
 }
 function validateJourneys(){
  const errors=[];
  for(const journey of content.journeys){
   let current=journey.start;
   for(const q of journey.stops){
    try{
     const path=routeFor(current,q.city);
     if(!path?.length||routeLength(path)<=0)throw Error('Empty route');
     const first=path[0].points[0],last=path[path.length-1].points.at(-1);
     if(Math.abs(first.lon-C[current].lon)>1e-7||Math.abs(last.lon-C[q.city].lon)>1e-7)throw Error('Incorrect start or finish');
    }catch(e){errors.push(journey.id+': '+e.message);}
    current=q.city;
   }
  }
  return errors;
 }
 return Object.freeze({routeFor,routeLength,pointAt,validateJourneys,definedRoutes:catalog.size});
});
