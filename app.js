/* TimeTrail v0.3 – curated daily journeys (English UI).
   Historical boundaries: aourednik/historical-basemaps (GPL-3.0).
   Animated lines are schematic travel routes, not verified 1900 railways. */
'use strict';

const HISTORICAL_YEARS = [1800, 1880, 1900, 1914, 1938, 1945, 2000];
// Content is loaded before app.js and is shared with Node's content tests.
if (typeof TIMETRAIL_CONTENT === 'undefined') throw new Error('Historical question pack failed to load');
const CONTENT = TIMETRAIL_CONTENT;
const CITIES = CONTENT.cities;
const COUNTRIES = CONTENT.countriesByGeoName;
const UTC_DAY = new Date().toISOString().slice(0,10);
const TOUR = CONTENT.journeyForDay(UTC_DAY);
const $ = id => document.getElementById(id);
const canvas=$('map-canvas'), ctx=canvas.getContext('2d');
const view=$('map-viewport'), journal=$('journal');
const SAVE_KEY=`timetrail-v03-${TOUR.id}-${UTC_DAY}`;
const formattedDate=new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date());
$('header-date').textContent=formattedDate.toUpperCase();
let travelToken=0;
const state={phase:'home',year:1900,stop:0,currentCity:TOUR.start,visited:[TOUR.start],score:0,results:[],attempts:0,wrongIds:[],lastWrong:'',chosen:null,feedback:null,transit:null,hover:null,loading:false};
const mapState={w:0,h:0,dpr:1,zoom:1,panX:0,panY:0,cache:null,data:null,features:[],requestId:0,drag:null,needsBase:true};
const yearCache=new Map();

function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function currentQuestion(){return TOUR.stops[state.stop];}
function isNavigation(q=currentQuestion()){return q && (q.type==='country'||q.type==='city');}
function shownDestination(i){return state.visited.includes(TOUR.stops[i].city)||state.results.length>i;}
function medal(results){return results.map(r=>r.points===100?'🟩':r.points>0?'🟨':'⬛').join('');}
function updateNav(){
  $('nav-daily').classList.toggle('active',state.phase!=='explore');
  $('nav-explore').classList.toggle('active',state.phase==='explore');
  $('intro-section').style.display=['home','explore'].includes(state.phase)?'':'none';
  $('map-title').textContent=`EUROPE · ${state.year}`;
  const currentCountry=state.transit ? CITIES[state.transit.fromId].country : CITIES[state.currentCity].country;
  $('current-country').textContent=state.phase==='explore'?'EXPLORE HISTORICAL EUROPE':`CURRENT COUNTRY · ${currentCountry.toUpperCase()}`;
  $('map-legend').textContent=`HISTORICAL BORDERS · ${state.year}`;
}
function tourProgress(){return `<div class="journey-meta"><div class="meta-item"><small>YEAR</small><strong>1900</strong></div><div class="meta-item"><small>STOPS</small><strong>05</strong></div><div class="meta-item"><small>PLAY TIME</small><strong>3–6 min</strong></div></div>`;}
function stopList(){return `<div class="destinations"><div class="destinations-head"><b>YOUR ITINERARY</b><span>5 STOPS</span></div><div class="stop-list">${TOUR.stops.map((stop,i)=>{
  const visible=shownDestination(i), finished=state.results.length>i, current=i===state.stop&&!['home','explore','results'].includes(state.phase);
  return `<div class="stop-row ${finished?'done':current?'current':''}"><span class="stop-index">${finished?'✓':String(i+1).padStart(2,'0')}</span><b>${visible?escapeHTML(CITIES[stop.city].name):'Undiscovered'}</b><small>${finished?`${state.results[i].points} PTS`:current?'IN PROGRESS':'· · ·'}</small></div>`;
}).join('')}</div></div>`;}
function homeMarkup(){const stored=readSaved();return `<div class="journal-kicker">DAILY HISTORICAL EXPEDITION · ${escapeHTML(UTC_DAY)}</div><h2>${escapeHTML(TOUR.title)}</h2><p class="journal-lead">${escapeHTML(TOUR.subtitle)}. Start in ${escapeHTML(CITIES[TOUR.start].name)}, uncover five historical destinations and earn up to 500 points.</p>${tourProgress()}${stopList()}<div class="button-spacer"><button class="button-primary" id="start-journey">${stored&&stored.phase!=='home'?'CONTINUE JOURNEY':'BEGIN EXPEDITION'} <span>→</span></button><div class="button-note">Ten curated routes rotate daily · All players get the same route · Replayable pilot</div></div>`;}
function transitMarkup(){return `<div class="journal-kicker">LEG ${state.stop+1} / 5</div><div class="travel-icon">♧</div><h2 class="travel-text">Travelling to ${escapeHTML(CITIES[state.transit.toId].name)}…</h2><p class="travel-sub">Following an illustrated route across historical Europe.</p>${stopList()}<div class="button-spacer"><button class="button-secondary skip-button" id="skip-travel">SKIP ANIMATION →</button><div class="button-note">The route is schematic, not a verified historical railway.</div></div>`;}
function arrivalMarkup(){const city=CITIES[state.currentCity];return `<div class="journal-kicker">DESTINATION DISCOVERED</div><div class="travel-icon">✦</div><h2>You have reached <em>${escapeHTML(city.name)}.</em></h2><p class="journal-lead">${escapeHTML(city.country)} · Year 1900</p>${stopList()}<div class="button-spacer"><button class="button-primary" id="next-stop">${state.stop===4?'SEE YOUR RESULTS':'CONTINUE EXPEDITION'} →</button></div>`;}
function questionMarkup(){
  const q=currentQuestion(), isNav=isNavigation(q), city=CITIES[state.currentCity], remaining=3-state.attempts;
  const options=q.type==='choice'?`<div class="options">${q.options.map((opt,i)=>{
    let status=state.phase==='feedback'?(i===q.correct?' correct':i===state.chosen?' wrong':''):'';
    return `<button type="button" class="answer-option${status}" data-answer="${i}" ${state.phase!=='question'?'disabled':''}><span class="letter">${'ABCD'[i]}</span><span>${escapeHTML(opt)}</span><span class="answer-state">${state.phase==='feedback'&&i===q.correct?'✓':state.phase==='feedback'&&i===state.chosen?'×':''}</span></button>`;
  }).join('')}</div>`:q.type==='country'?`<div class="map-action-prompt">◎ Select the correct territory on the map. Country labels are hidden.</div>`:`<div class="map-action-prompt">◎ Select the correct city marker on the map. Names are hidden.</div><div class="city-selection" aria-label="Choose a city marker">${q.candidates.map((id,i)=>`<button type="button" data-city-choice="${id}" ${state.phase!=='question'||!mapState.features.length?'disabled':''} class="city-choice" aria-label="Choose marker ${'ABCDE'[i]}">${'ABCDE'[i]}</button>`).join('')}</div>`;
  const scoreLine=`<div class="quiz-top"><span class="stop-tag">STOP ${String(state.stop+1).padStart(2,'0')} / 05 · ${q.difficulty.toUpperCase()}</span><span class="point-tag">${state.score} / 500 PTS</span></div><div class="progress-track"><div class="progress-fill" style="width:${(state.stop+1)*20}%"></div></div>`;
  const isAnswered=state.phase==='feedback';
  const answerLocation=isAnswered?`<div class="location-line">✦ ${escapeHTML(CITIES[q.city].name.toUpperCase())} · ${escapeHTML(CITIES[q.city].country.toUpperCase())}</div>`:`<div class="location-line">✦ CURRENT LOCATION · ${escapeHTML(city.name.toUpperCase())}</div>`;
  const response=isAnswered?`<div class="answer-feedback ${state.feedback.points===0?'wrong':''}"><strong>${state.feedback.points?`✓ ${state.feedback.points} points earned`:'0 points · Answer revealed'}</strong>${isNav?`<p><b>Answer: ${escapeHTML(q.type==='city'?CITIES[q.targetId].name:COUNTRY_DISPLAY[q.targetId])}</b></p>`:''}<p>${escapeHTML(q.fact)}</p><a href="${escapeHTML(q.source)}" rel="noopener noreferrer" target="_blank">Historical reference ↗</a></div>`:state.lastWrong?`<div class="map-click-feedback">Not quite: ${escapeHTML(state.lastWrong)}. ${remaining} ${remaining===1?'attempt':'attempts'} remaining.</div>`:'';
  const action=isAnswered?`<button class="button-primary" id="next-stop">${isNav?`TRAVEL TO ${escapeHTML(CITIES[q.city].name.toUpperCase())}`:state.stop===4?'VIEW RESULTS':'NEXT STOP'} →</button>`:`<div class="question-actions">${isNav?`<button class="button-secondary" id="reveal-answer">REVEAL ANSWER · 0 PTS</button>`:''}<p class="small-muted">${isNav?'Three attempts: 100 / 60 / 30 points. Repeat clicks on the same wrong answer do not count.':'One answer only: 100 points for a correct choice.'}</p></div>`;
  return `${scoreLine}${answerLocation}<h2 class="question-text">${escapeHTML(q.question)}</h2><p class="question-hint">${isNav?'Study the map carefully. Drag or zoom as needed.':'Choose the best answer from the four options below.'}</p>${options}${response}<div class="button-spacer">${action}</div>`;
}
function resultMarkup(){const blurb=state.score>=450?'Master explorer!':state.score>=300?'A skilled time traveller!':state.score>=150?'A promising explorer!':'Every expedition starts with curiosity.';return `<div class="journal-kicker">EXPEDITION COMPLETED</div><h2>Your journey is <em>complete.</em></h2><p class="journal-lead">${escapeHTML(TOUR.title)} · Five historic stops through Europe in 1900.</p><div class="ornament">✢</div><div class="score-total">${state.score} <span>/ 500</span></div><div class="result-icons" aria-label="Points earned for each stop">${medal(state.results)}</div><div class="result-banner"><strong>${blurb}</strong><small>${state.results.filter(r=>r.points>0).length} of 5 stops awarded points · ${escapeHTML(UTC_DAY)}</small></div><div class="stamps"><span class="stamp">EUROPE 1900</span><span class="stamp">5 DESTINATIONS</span></div><div class="result-buttons"><button class="button-primary" id="share-result">COPY RESULTS ↗</button><button class="button-secondary" id="replay">REPLAY PRACTICE JOURNEY</button></div>`;}
function exploreMarkup(){const index=HISTORICAL_YEARS.indexOf(state.year);return `<div class="journal-kicker">THE HISTORICAL ATLAS</div><h2>A world <em>before ours.</em></h2><p class="journal-lead">Discover how Europe's borders and empires changed. Move between the available historical map years.</p><div class="explore-controls"><div class="year-row"><span class="overline">SELECT MAP YEAR</span><strong class="year-big" id="year-text">${state.year}</strong></div><input id="year-slider" aria-label="Select historical map year" type="range" min="0" max="${HISTORICAL_YEARS.length-1}" step="1" value="${index}"/><div class="year-range-labels"><span>1800</span><span>2000</span></div></div><div class="explore-notice"><b>About this map</b><br/>Boundaries come from historical GeoJSON data. These are selected snapshots; some boundaries and territorial claims are approximate or disputed.</div><div class="ornament">✢</div><p class="journal-lead">Daily expeditions currently use the 1900 map; ten curated chapters repeat until new content is released.</p><div class="button-spacer"><button class="button-primary" id="back-to-daily">RETURN TO EXPEDITION →</button></div>`;}
const COUNTRY_DISPLAY=Object.fromEntries(Object.values(COUNTRIES).map(country=>[country.id,country.name]));

function renderJournal(){
  updateNav();
  mapState.needsBase=true; journal.innerHTML=state.phase==='home'?homeMarkup():state.phase==='travel'?transitMarkup():state.phase==='arrival'?arrivalMarkup():state.phase==='question'||state.phase==='feedback'?questionMarkup():state.phase==='results'?resultMarkup():exploreMarkup();
  journal.querySelector('#start-journey')?.addEventListener('click',()=>{if(readSaved()&&readSaved().phase!=='home'){restoreGame();}else startJourney();});
  journal.querySelector('#next-stop')?.addEventListener('click',nextStop);
  journal.querySelector('#skip-travel')?.addEventListener('click',finishTransit);
  journal.querySelectorAll('[data-answer]').forEach(el=>el.addEventListener('click',()=>chooseAnswer(Number(el.dataset.answer))));
  journal.querySelectorAll('[data-city-choice]').forEach(el=>el.addEventListener('click',()=>guessCity(el.dataset.cityChoice)));
  journal.querySelector('#reveal-answer')?.addEventListener('click',()=>completeAnswer(0));
  journal.querySelector('#replay')?.addEventListener('click',startJourney);
  journal.querySelector('#share-result')?.addEventListener('click',shareResult);
  journal.querySelector('#back-to-daily')?.addEventListener('click',showDaily);
  journal.querySelector('#year-slider')?.addEventListener('input',e=>{state.year=HISTORICAL_YEARS[Number(e.target.value)];$('year-text').textContent=state.year;updateNav();resetMap();loadMap(state.year);});
  scheduleDraw();
}
function saveGame(){if(state.phase==='home'||state.phase==='explore')return;try{localStorage.setItem(SAVE_KEY,JSON.stringify({version:3,tour:TOUR.id,phase:state.phase,stop:state.stop,currentCity:state.currentCity,visited:state.visited,score:state.score,results:state.results,attempts:state.attempts,wrongIds:state.wrongIds,lastWrong:state.lastWrong,chosen:state.chosen,feedback:state.feedback,transit:state.transit?{fromId:state.transit.fromId,toId:state.transit.toId,nextPhase:state.transit.nextPhase}:null}));}catch(error){console.warn('Cannot save progress:',error);}}
function readSaved(){try{const s=JSON.parse(localStorage.getItem(SAVE_KEY));return s&&s.version===3&&s.tour===TOUR.id&&Number.isInteger(s.stop)&&s.stop>=0&&s.stop<5&&['question','feedback','arrival','travel','results'].includes(s.phase)&&Array.isArray(s.results)&&s.results.length<=5?s:null;}catch{return null;}}
function restoreGame(){const s=readSaved();if(!s){startJourney();return;}travelToken++;Object.assign(state,{phase:s.phase,year:1900,stop:s.stop,currentCity:CITIES[s.currentCity]?s.currentCity:TOUR.start,visited:Array.isArray(s.visited)?s.visited.filter(k=>CITIES[k]):[TOUR.start],score:s.score,results:s.results,attempts:s.attempts||0,wrongIds:Array.isArray(s.wrongIds)?s.wrongIds:[],lastWrong:s.lastWrong||'',chosen:s.chosen??null,feedback:s.feedback||null,transit:null});if(s.phase==='travel'&&s.transit){state.currentCity=s.transit.toId;state.visited=[...new Set([...state.visited,s.transit.toId])];state.phase=s.transit.nextPhase;}state.year=1900;resetMap();loadMap(1900);if(state.phase==='question'&&currentQuestion().type==='city')focusCityCandidates();renderJournal();saveGame();}
function clearAttempt(){state.attempts=0;state.wrongIds=[];state.lastWrong='';state.chosen=null;state.feedback=null;}
function startJourney(){travelToken++;Object.assign(state,{phase:'home',year:1900,stop:0,currentCity:TOUR.start,visited:[TOUR.start],score:0,results:[],transit:null});clearAttempt();resetMap();loadMap(1900);enterStop();}
function enterStop(){clearAttempt();const q=currentQuestion();if(q.type==='country'&&CITIES[state.currentCity].countryId===q.targetId)throw Error('Invalid tour: country target equals current country');if(q.type==='city'&&state.currentCity===q.targetId)throw Error('Invalid tour: city target equals current city');if(q.type==='choice'){startTravel(q.city,'question');return;}state.phase='question';if(q.type==='city')focusCityCandidates();else resetMap();saveGame();renderJournal();}
function startTravel(toId,nextPhase){if(!CITIES[toId])return;travelToken++;const token=travelToken;state.phase='travel';state.transit={fromId:state.currentCity,toId,progress:0,nextPhase};resetMap();saveGame();renderJournal();const duration=window.matchMedia('(prefers-reduced-motion: reduce)').matches?30:1450,start=performance.now();function tick(t){if(token!==travelToken||state.phase!=='travel')return;state.transit.progress=Math.min(1,(t-start)/duration);scheduleDraw();if(state.transit.progress>=1)finishTransit();else requestAnimationFrame(tick);}requestAnimationFrame(tick);}
function finishTransit(){if(state.phase!=='travel'||!state.transit)return;travelToken++;const {toId,nextPhase}=state.transit;state.currentCity=toId;state.visited=[...new Set([...state.visited,toId])];state.transit=null;state.phase=nextPhase;if(nextPhase==='results')state.stop=4;saveGame();resetMap();renderJournal();}
function chooseAnswer(i){const q=currentQuestion();if(state.phase!=='question'||q.type!=='choice'||!Number.isInteger(i)||i<0||i>=q.options.length)return;state.chosen=i;completeAnswer(i===q.correct?100:0);}
function guessCountry(feature){const q=currentQuestion();if(state.phase!=='question'||q.type!=='country'||!feature?.name||!mapState.features.length)return;const id=feature.id||feature.name;if(state.wrongIds.includes(id))return;if(id===q.targetId){state.attempts++;completeAnswer([100,60,30][Math.min(2,state.attempts-1)]);return;}registerWrong(id,feature.displayName||feature.name);}
function guessCity(id){const q=currentQuestion();if(state.phase!=='question'||q.type!=='city'||!mapState.features.length||!q.candidates.includes(id))return;if(state.wrongIds.includes(id))return;if(id===q.targetId){state.attempts++;completeAnswer([100,60,30][Math.min(2,state.attempts-1)]);return;}registerWrong(id,CITIES[id].name);}
function registerWrong(id,name){state.wrongIds.push(id);state.attempts++;state.lastWrong=name;if(state.attempts>=3)completeAnswer(0);else{saveGame();renderJournal();}}
function completeAnswer(points){if(state.phase!=='question'||state.results.length!==state.stop)return;const q=currentQuestion();state.phase='feedback';state.score+=points;state.feedback={points,correct:q.type==='city'?CITIES[q.targetId].name:q.type==='country'?COUNTRY_DISPLAY[q.targetId]:q.options[q.correct]};state.results.push({id:q.id,points});saveGame();renderJournal();}
function nextStop(){if(state.phase==='feedback'){const q=currentQuestion();if(isNavigation(q)){startTravel(q.city,state.stop===4?'results':'arrival');}else advanceStop();return;}if(state.phase==='arrival')advanceStop();}
function advanceStop(){if(state.stop===4){state.phase='results';saveGame();renderJournal();return;}state.stop++;enterStop();}
function shareResult(){const text=`TimeTrail · ${UTC_DAY} · Europe 1900 🌍\n${TOUR.title}\n${state.score}/500 points\n${medal(state.results)}\n${location.href.split('#')[0]}`;const btn=$('share-result');if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(text).then(()=>{btn.textContent='COPIED ✓';}).catch(()=>prompt('Copy your result:',text));}else prompt('Copy your result:',text);}
function showExplore(){if(state.phase!=='explore')saveGame();travelToken++;state.transit=null;state.phase='explore';state.year=1900;resetMap();renderJournal();loadMap(1900);}
function showDaily(){travelToken++;if(readSaved()){restoreGame();return;}state.phase='home';state.year=1900;state.stop=0;state.transit=null;resetMap();renderJournal();loadMap(1900);}
$('nav-daily').addEventListener('click',showDaily);$('nav-explore').addEventListener('click',showExplore);$('brand-link').addEventListener('click',e=>{e.preventDefault();showDaily();});

// Map rendering. Land borders come from historical GeoJSON, not modern OpenStreetMap.
const VIEW={west:-19,east:55,south:32,north:74};
const TINTS=['#cec19b','#d1c29b','#c1c19f','#d4c9ab','#b4b99f','#d2bea0','#c7b594','#b8bfa6','#cbb69a'];
// Capital cities of the polities represented in the 1900 content pack.
// We do not mark provincial cities (e.g. Prague, Warsaw) as independent capitals.
const CAPITALS_1900=['stockholm','kristiania','berlin','vienna','budapest','constantinople',
 'athens','rome','bucharest','belgrade','copenhagen','st_petersburg','london',
 'amsterdam','brussels','paris','lisbon','madrid','sofia','bern'];
function pointInBBox(b){return b.maxx>=VIEW.west&&b.minx<=VIEW.east&&b.maxy>=VIEW.south&&b.miny<=VIEW.north;}
function ringBBox(r){let minx=Infinity,miny=Infinity,maxx=-Infinity,maxy=-Infinity;for(const p of r){if(p[0]<minx)minx=p[0];if(p[0]>maxx)maxx=p[0];if(p[1]<miny)miny=p[1];if(p[1]>maxy)maxy=p[1];}return {minx,miny,maxx,maxy};}
function reduceRing(r){if(r.length<30)return r;const keep=[r[0]];let p=r[0];for(let i=1;i<r.length-1;i++){const n=r[i];if(Math.abs(n[0]-p[0])+Math.abs(n[1]-p[1])>.07){keep.push(n);p=n;}}keep.push(r[r.length-1]);return keep.length>=4?keep:r;}
function processMapData(geo){
 if(geo?.type!=='FeatureCollection'||!Array.isArray(geo.features))throw Error('Invalid historical GeoJSON');
 return geo.features.filter(f=>f.geometry&&f.properties?.NAME).map(f=>{
  const raw=f.geometry.type==='MultiPolygon'?f.geometry.coordinates:f.geometry.type==='Polygon'?[f.geometry.coordinates]:[];
  const pieces=raw.filter(r=>r?.[0]?.length>=3&&pointInBBox(ringBBox(r[0]))).map(r=>r.map(reduceRing));
  const historical=COUNTRIES[f.properties.NAME];
  return {id:historical?.id||`historical:${f.properties.NAME}`,name:f.properties.NAME,
   displayName:historical?.name||f.properties.NAME,pieces,tint:TINTS[hashString(f.properties.SUBJECTO||f.properties.NAME)%TINTS.length]};
 }).filter(f=>f.pieces.length);
}
function hashString(s){let h=0;for(let i=0;i<s.length;i++)h=((h<<5)-h+s.charCodeAt(i))|0;return Math.abs(h);}
async function loadMap(year){
 const request=++mapState.requestId;
 if(yearCache.has(year)){
  mapState.features=yearCache.get(year);mapState.needsBase=true;state.loading=false;
  $('map-error').hidden=true;$('map-status').textContent='Historical map ready';renderJournal();return;
 }
 state.loading=true;mapState.features=[];mapState.needsBase=true;scheduleDraw();
 $('map-status').textContent=`Loading ${year}…`;$('map-error').hidden=true;
 const file=`world_${year}.geojson`;
 const urls=[`https://cdn.jsdelivr.net/gh/aourednik/historical-basemaps@master/geojson/${file}`,
 `https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/${file}`];
 for(const url of urls){try{
   const response=await fetch(url,{cache:'force-cache'});if(!response.ok)throw Error(`HTTP ${response.status}`);
   const data=processMapData(await response.json());if(!data.length)throw Error('No boundaries found');
   yearCache.set(year,data);if(request!==mapState.requestId)return;
   mapState.features=data;mapState.needsBase=true;state.loading=false;
   $('map-status').textContent='Historical map ready';$('map-error').hidden=true;renderJournal();return;
  }catch(err){if(request!==mapState.requestId)return;console.warn('Historical map source unavailable:',url,err);}
 }
 if(request===mapState.requestId){state.loading=false;mapState.features=[];mapState.needsBase=true;
   $('map-status').textContent='Map unavailable';$('map-error').hidden=false;renderJournal();}
}
function resetMap(){mapState.zoom=1;mapState.panX=0;mapState.panY=0;mapState.needsBase=true;scheduleDraw();}
function focusCityCandidates(){
 if(!mapState.w||!mapState.h)return;
 const q=currentQuestion();if(!q||q.type!=='city')return;
 const points=q.candidates.map(id=>CITIES[id]);
 const west=Math.min(...points.map(c=>c.lon)),east=Math.max(...points.map(c=>c.lon));
 const south=Math.min(...points.map(c=>c.lat)),north=Math.max(...points.map(c=>c.lat));
 const centerLon=(west+east)/2,centerLat=(south+north)/2;
 const baseScale=Math.min(mapState.w/75,mapState.h/43);
 const desiredScale=Math.min((mapState.w-80)/Math.max(east-west+2,8),(mapState.h-80)/Math.max(north-south+2,7));
 mapState.zoom=Math.max(.75,Math.min(5,desiredScale/baseScale));
 const scale=baseScale*mapState.zoom;
 mapState.panX=-(centerLon-18)*scale;
 mapState.panY=-(53-centerLat)*scale;
 mapState.needsBase=true;scheduleDraw();
}
function changeZoom(delta){mapState.zoom=Math.max(.75,Math.min(5,mapState.zoom*delta));mapState.needsBase=true;scheduleDraw();}
$('zoom-in').addEventListener('click',()=>changeZoom(1.22));$('zoom-out').addEventListener('click',()=>changeZoom(1/1.22));$('reset-map').addEventListener('click',resetMap);$('map-retry').addEventListener('click',()=>loadMap(state.year));
function project(lon,lat){const s=Math.min(mapState.w/75,mapState.h/43)*mapState.zoom;return {x:mapState.w/2+(lon-18)*s+mapState.panX,y:mapState.h/2+(53-lat)*s+mapState.panY};}
function unproject(x,y){const s=Math.min(mapState.w/75,mapState.h/43)*mapState.zoom;return {lon:(x-mapState.w/2-mapState.panX)/s+18,lat:53-(y-mapState.h/2-mapState.panY)/s};}
function resizeCanvas(){
 const rect=view.getBoundingClientRect();if(!rect.width||!rect.height)return;
 mapState.w=rect.width;mapState.h=rect.height;mapState.dpr=Math.min(window.devicePixelRatio||1,2);
 canvas.width=Math.round(rect.width*mapState.dpr);canvas.height=Math.round(rect.height*mapState.dpr);
 if(state.phase==='question'&&currentQuestion().type==='city')focusCityCandidates();
 mapState.needsBase=true;scheduleDraw();
}
function ringPath(c,r){for(let i=0;i<r.length;i++){const p=project(r[i][0],r[i][1]);if(i===0)c.moveTo(p.x,p.y);else c.lineTo(p.x,p.y);}c.closePath();}
function renderBase(){
 const w=mapState.w,h=mapState.h,dpr=mapState.dpr;if(!w||!h)return;
 let c=mapState.cache;if(!c)c=mapState.cache=document.createElement('canvas');
 c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);
 const b=c.getContext('2d');b.setTransform(dpr,0,0,dpr,0,0);
 const bg=b.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#d5d0b4');bg.addColorStop(.5,'#d2caab');bg.addColorStop(1,'#c8c3a7');b.fillStyle=bg;b.fillRect(0,0,w,h);
 b.lineWidth=.6;b.strokeStyle='#8d927e32';
 for(let lon=-20;lon<=55;lon+=5){const a=project(lon,20),e=project(lon,85);b.beginPath();b.moveTo(a.x,a.y);b.lineTo(e.x,e.y);b.stroke();}
 for(let lat=30;lat<=80;lat+=5){const a=project(-25,lat),e=project(65,lat);b.beginPath();b.moveTo(a.x,a.y);b.lineTo(e.x,e.y);b.stroke();}
 for(const f of mapState.features){b.beginPath();for(const rings of f.pieces){for(const ring of rings){if(ring.length>=3)ringPath(b,ring);}}b.fillStyle=f.tint;b.fill('evenodd');b.lineJoin='round';b.strokeStyle='#716b50ad';b.lineWidth=.7;b.stroke();}
 b.strokeStyle='#a58c605c';b.lineWidth=1;b.strokeRect(8,8,w-16,h-16);mapState.needsBase=false;
}
function drawCapitals(){
 // Only 1900 has a curated historical capital list; other years show no capital stars.
 if(state.year!==1900)return;
 const c=ctx,w=mapState.w,h=mapState.h;
 c.save();
 for(const id of CAPITALS_1900){
  const city=CITIES[id],p=project(city.lon,city.lat);
  if(p.x<9||p.x>w-9||p.y<10||p.y>h-10)continue;
  const outer=mapState.zoom>=1.6?7:5.7,inner=outer*.44;
  c.beginPath();
  for(let i=0;i<10;i++){
   const a=-Math.PI/2+i*Math.PI/5,r=i%2===0?outer:inner;
   if(i===0)c.moveTo(p.x+Math.cos(a)*r,p.y+Math.sin(a)*r);
   else c.lineTo(p.x+Math.cos(a)*r,p.y+Math.sin(a)*r);
  }
  c.closePath();c.fillStyle='#705131';c.strokeStyle='#fff1c9';c.lineWidth=1.5;c.fill();c.stroke();
 }
 c.restore();
}
function drawRoute(){
 if(state.phase==='explore')return;
 const c=ctx,route=state.visited.map(id=>CITIES[id]);
 for(let i=1;i<route.length;i++){
   const a=project(route[i-1].lon,route[i-1].lat),b=project(route[i].lon,route[i].lat);
   c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.strokeStyle='#795335';c.lineWidth=2.2;c.setLineDash([5,5]);c.stroke();c.setLineDash([]);
 }
 if(state.transit){const {fromId,toId,progress}=state.transit,a=CITIES[fromId],b=CITIES[toId],p=project(a.lon,a.lat),q=project(b.lon,b.lat);
   c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x+(q.x-p.x)*progress,p.y+(q.y-p.y)*progress);
   c.strokeStyle='#9f6d3d';c.lineWidth=2.3;c.setLineDash([4,4]);c.stroke();c.setLineDash([]);
   drawTrain(p.x+(q.x-p.x)*progress,p.y+(q.y-p.y)*progress);
 }else{
   const current=CITIES[state.currentCity];const p=project(current.lon,current.lat);
   drawPin(p.x,p.y,'✦',true);
 }
 if(state.phase==='question'&&currentQuestion().type==='city'||state.phase==='feedback'&&currentQuestion().type==='city')drawCityCandidates();
 if(state.phase==='feedback'&&currentQuestion().type==='country')drawCountryHighlight();
}
function drawCountryHighlight(){const id=currentQuestion().targetId,c=ctx;
 for(const f of mapState.features.filter(f=>f.id===id)){c.save();c.beginPath();for(const rings of f.pieces)for(const ring of rings)if(ring.length>=3)ringPath(c,ring);
 c.fillStyle='#a8794050';c.fill('evenodd');c.strokeStyle='#8f4a2c';c.lineWidth=2.4;c.stroke();c.restore();}
}
function drawCityCandidates(){const q=currentQuestion(),c=ctx;
 q.candidates.forEach((id,i)=>{const city=CITIES[id],p=project(city.lon,city.lat),isAnswered=state.phase==='feedback',selected=isAnswered&&id===q.targetId,wrong=state.wrongIds.includes(id);
  c.save();c.beginPath();c.arc(p.x,p.y,22,0,Math.PI*2);c.fillStyle='rgba(244,230,195,.14)';c.fill();
  c.beginPath();c.arc(p.x,p.y,16,0,Math.PI*2);c.fillStyle=selected?'#567352':wrong?'#ad6b5a':'#5f503a';c.fill();c.strokeStyle='#f5e9ce';c.lineWidth=2;c.stroke();
  c.fillStyle='#f5e9ce';c.font='bold 12px Arial,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('ABCDE'[i],p.x,p.y+1);
  if(selected){c.font='bold 12px Georgia,serif';const w=c.measureText(city.name).width+16;const x=Math.min(mapState.w-w-4,Math.max(4,p.x-w/2));const y=p.y-46;c.fillStyle='#f7e9cd';c.fillRect(x,y,w,22);c.strokeStyle='#93794f';c.strokeRect(x,y,w,22);c.fillStyle='#443521';c.textAlign='left';c.fillText(city.name,x+8,y+12);}
  c.restore();
 });
}
function drawTrain(x,y){const c=ctx;c.save();c.translate(x,y);c.fillStyle='#6c5135';c.strokeStyle='#f3dfb9';c.lineWidth=1.6;c.beginPath();c.arc(0,0,16,0,Math.PI*2);c.fill();c.stroke();c.fillStyle='#f3dfb9';c.fillRect(-10,-1,20,7);c.fillRect(1,-8,8,7);c.fillRect(-8,-8,3,7);c.fillStyle='#6c5135';c.fillRect(4,-5,3,3);c.fillStyle='#f3dfb9';for(const wx of [-6,6]){c.beginPath();c.arc(wx,7,3,0,Math.PI*2);c.fill();}c.restore();}
function drawPin(x,y,letter,active){const c=ctx;c.save();c.fillStyle='#6c5135';c.strokeStyle='#f0dfb9';c.lineWidth=2.1;c.beginPath();c.arc(x,y,14,0,Math.PI*2);c.fill();c.stroke();c.font='18px Georgia,serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#f6e3bf';c.fillText(letter,x,y+1);c.restore();}
function drawTooltip(){if(!state.hover)return;
 if(state.phase==='question'&&isNavigation())return;
 const {x,y,name}=state.hover,c=ctx,title=String(name).slice(0,45);
 c.save();c.font='12px Georgia,serif';const width=Math.min(240,c.measureText(title).width+20),px=Math.max(8,Math.min(mapState.w-width-8,x+12)),py=Math.max(8,Math.min(mapState.h-31,y-36));c.fillStyle='#f2e2c5f0';c.fillRect(px,py,width,29);c.strokeStyle='#947c59';c.strokeRect(px,py,width,29);c.fillStyle='#52412c';c.textAlign='left';c.fillText(title,px+10,py+19);c.restore();}
function draw(){if(!mapState.w||!mapState.h)return;if(mapState.needsBase)renderBase();const {w,h,dpr}=mapState;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);if(mapState.cache)ctx.drawImage(mapState.cache,0,0,w,h);drawCapitals();drawRoute();drawTooltip();}
let queued=false;function scheduleDraw(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;draw();});}
function containsRing(pt,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if(((a[1]>pt.lat)!==(b[1]>pt.lat))&&(pt.lon<(b[0]-a[0])*(pt.lat-a[1])/(b[1]-a[1])+a[0]))inside=!inside;}return inside;}
function hitCountry(pt){for(let i=mapState.features.length-1;i>=0;i--){const f=mapState.features[i];for(const rings of f.pieces){if(containsRing(pt,rings[0])&&!rings.slice(1).some(r=>containsRing(pt,r)))return f;}}return null;}
function distanceToSegment(px,py,x1,y1,x2,y2){const dx=x2-x1,dy=y2-y1,t=Math.max(0,Math.min(1,((px-x1)*dx+(py-y1)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(px-x1-t*dx,py-y1-t*dy);}
function nearBorder(pt,feature){const p=project(pt.lon,pt.lat);for(const piece of feature.pieces)for(const ring of piece){for(let i=1;i<ring.length;i++){const a=project(...ring[i-1]),b=project(...ring[i]);if(distanceToSegment(p.x,p.y,a.x,a.y,b.x,b.y)<4)return true;}}return false;}
function hitCity(x,y){const q=currentQuestion();if(q.type!=='city')return null;let best=null,bestDistance=22;for(const id of q.candidates){const city=CITIES[id],p=project(city.lon,city.lat),d=Math.hypot(x-p.x,y-p.y);if(d<bestDistance){bestDistance=d;best=id;}}return best;}
function canvasPosition(e){const r=canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);const p=canvasPosition(e);mapState.drag={x:p.x,y:p.y,fromX:p.x,fromY:p.y,moved:false};});
canvas.addEventListener('pointermove',e=>{
 const p=canvasPosition(e);if(mapState.drag){const d=mapState.drag,dx=p.x-d.x,dy=p.y-d.y;d.x=p.x;d.y=p.y;if(Math.abs(p.x-d.fromX)+Math.abs(p.y-d.fromY)>7)d.moved=true;if(d.moved){mapState.panX+=dx;mapState.panY+=dy;mapState.needsBase=true;scheduleDraw();}return;}
 if(state.phase==='question'&&isNavigation()){state.hover=null;scheduleDraw();return;}
 const feature=hitCountry(unproject(p.x,p.y));state.hover=feature?{name:feature.displayName,...p}:null;scheduleDraw();
});
canvas.addEventListener('pointerup',e=>{
 const d=mapState.drag;mapState.drag=null;if(!d||d.moved)return;const p=canvasPosition(e);
 if(state.phase==='question'&&isNavigation()){
   if(!mapState.features.length)return;
   if(currentQuestion().type==='city')guessCity(hitCity(p.x,p.y));
   else {const pt=unproject(p.x,p.y),country=hitCountry(pt);if(country){if(nearBorder(pt,country)){$('map-status').textContent='Click further inside the border';return;}guessCountry(country);}}
 }else{const feature=hitCountry(unproject(p.x,p.y));state.hover=feature?{name:feature.displayName,...p}:null;scheduleDraw();}
});
canvas.addEventListener('pointercancel',()=>{mapState.drag=null;});
canvas.addEventListener('pointerleave',()=>{if(!mapState.drag){state.hover=null;scheduleDraw();}});
canvas.addEventListener('wheel',e=>{e.preventDefault();changeZoom(e.deltaY<0?1.1:1/1.1);},{passive:false});
window.addEventListener('resize',resizeCanvas);
if('ResizeObserver' in window)new ResizeObserver(resizeCanvas).observe(view);
resizeCanvas();if(readSaved())restoreGame();else{renderJournal();loadMap(1900);}