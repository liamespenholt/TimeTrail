/* TimeTrail — dependency-free, GitHub Pages-ready interactive prototype.
   Historical boundary data © aourednik/historical-basemaps, GPL-3.0.
   The cartographic route is a schematic illustration, not a verified 1900 railway itinerary. */
'use strict';

const HISTORICAL_YEARS = [1800, 1880, 1900, 1914, 1938, 1945, 2000];
const CITIES = {
  kristiania: { name:'Kristiania', place:'Sverige–Norge', lon:10.75, lat:59.91 },
  stockholm: { name:'Stockholm', place:'Sverige–Norge', lon:18.06, lat:59.33 },
  berlin: { name:'Berlin', place:'Tyska kejsardömet', lon:13.40, lat:52.52 },
  wien: { name:'Wien', place:'Österrike–Ungern', lon:16.37, lat:48.21 },
  budapest: { name:'Budapest', place:'Österrike–Ungern', lon:19.05, lat:47.50 },
  konstantinopel: { name:'Konstantinopel', place:'Osmanska riket', lon:28.98, lat:41.01 },
  london: { name:'London', place:'Storbritannien och Irland', lon:-0.13, lat:51.51 },
  paris: { name:'Paris', place:'Frankrike', lon:2.35, lat:48.86 },
  bryssel: { name:'Bryssel', place:'Belgien', lon:4.35, lat:50.85 },
  amsterdam: { name:'Amsterdam', place:'Nederländerna', lon:4.90, lat:52.37 },
  lissabon: { name:'Lissabon', place:'Portugal', lon:-9.14, lat:38.72 },
  madrid: { name:'Madrid', place:'Spanien', lon:-3.70, lat:40.42 },
  rom: { name:'Rom', place:'Kungariket Italien', lon:12.50, lat:41.90 },
  aten: { name:'Aten', place:'Grekland', lon:23.73, lat:37.98 },
  kopenhamn: { name:'Köpenhamn', place:'Danmark', lon:12.57, lat:55.68 },
  bern: { name:'Bern', place:'Schweiz', lon:7.45, lat:46.95 },
  belgrad: { name:'Belgrad', place:'Kungariket Serbien', lon:20.46, lat:44.81 },
};
// All four hand-authored journeys use the same historically sourced map for 1900.
// This is a prototype rotation: it repeats after four days until more journeys are authored.
const TOURS = [
  {
    title:'Imperiernas Europa',subtitle:'Från Norden till Bosporen',start:'kristiania',
    stops:[
      {city:'stockholm',type:'choice',question:'Vilket land var Sverige i union med år 1900?', options:['Danmark','Norge','Finland','Island'],correct:1,fact:'Sverige och Norge hade en gemensam monark mellan 1814 och 1905. Unionen upplöstes fredligt 1905.'},
      {city:'berlin',type:'choice',question:'Vem var Tyska kejsardömets kejsare år 1900?',options:['Otto von Bismarck','Wilhelm II','Franz Joseph I','Friedrich III'],correct:1,fact:'Wilhelm II regerade från 1888 till 1918 och var Tysklands siste kejsare.'},
      {city:'wien',type:'map',question:'Klicka på Österrike–Ungern på kartan från år 1900.',target:['Austria Hungary'],fact:'Österrike–Ungern var en dubbelmonarki 1867–1918 med två regeringscentra: Wien och Budapest.'},
      {city:'budapest',type:'choice',question:'Vilken stor flod rinner genom Budapest?',options:['Rhen','Elbe','Donau','Seine'],correct:2,fact:'Donau skiljer de historiska stadsdelarna Buda och Pest åt och förbinder en stor del av Centraleuropa.'},
      {city:'konstantinopel',type:'choice',question:'Vilket rike tillhörde Konstantinopel år 1900?',options:['Bysantinska riket','Grekland','Osmanska riket','Ryssland'],correct:2,fact:'Konstantinopel var huvudstad i Osmanska riket. Det osmanska sultanatet avskaffades 1922.'}
    ]
  },
  {
    title:'Västeuropas huvudstäder',subtitle:'Från imperier till nya idéer',start:'kristiania',
    stops:[
      {city:'london',type:'choice',question:'Vem var Storbritanniens monark år 1900?',options:['Victoria','Edward VII','George V','Elizabeth II'],correct:0,fact:'Drottning Victoria regerade 1837–1901. Hennes regeringstid gav namn åt den viktorianska eran.'},
      {city:'paris',type:'choice',question:'Vilken stor internationell utställning hölls i Paris år 1900?',options:['Expo 67','Exposition universelle','Världsutställningen 1851','Empire Exhibition'],correct:1,fact:'Världsutställningen i Paris 1900 lockade miljontals besökare och visade upp teknik, konst och industrins framsteg.'},
      {city:'bryssel',type:'choice',question:'Vilket område i Centralafrika stod under kung Leopold II:s personliga kontroll år 1900?',options:['Angola','Kongofristaten','Tyska Östafrika','Egypten'],correct:1,fact:'Kongofristaten var Leopold II:s personliga besittning till 1908. Styret präglades av omfattande övergrepp.'},
      {city:'amsterdam',type:'choice',question:'Vilket av dessa områden var nederländsk koloni år 1900?',options:['Algeriet','Nederländska Ostindien','Indien','Filippinerna'],correct:1,fact:'Nederländska Ostindien omfattade stora delar av dagens Indonesien.'},
      {city:'berlin',type:'map',question:'Klicka på Tyska kejsardömet på kartan.',target:['Germany'],fact:'Tyska kejsardömet bildades 1871. Kartdatabasen använder det kortare namnet ”Germany” för territoriet år 1900.'}
    ]
  },
  {
    title:'Mot Medelhavet',subtitle:'Kungadömen, republik och imperium',start:'lissabon',
    stops:[
      {city:'madrid',type:'choice',question:'Vilket år upphörde Spaniens koloniala styre på Kuba?',options:['1815','1861','1898','1914'],correct:2,fact:'Efter det spansk-amerikanska kriget 1898 upphörde det spanska styret över Kuba.'},
      {city:'paris',type:'choice',question:'Vilken republik fanns i Frankrike år 1900?',options:['Första republiken','Andra republiken','Tredje republiken','Fjärde republiken'],correct:2,fact:'Tredje republiken varade från 1870 till 1940.'},
      {city:'rom',type:'choice',question:'Vilket år utropades kungariket Italien?',options:['1789','1815','1861','1918'],correct:2,fact:'Kungariket Italien utropades 1861. Rom blev italienskt 1870 och huvudstad 1871.'},
      {city:'aten',type:'choice',question:'I vilken stad hölls de första moderna olympiska spelen 1896?',options:['Paris','London','Aten','Rom'],correct:2,fact:'De första olympiska spelen i modern tid hölls i Aten 1896.'},
      {city:'konstantinopel',type:'map',question:'Klicka på Osmanska riket på kartan från 1900.',target:['Ottoman Empire'],fact:'Osmanska riket sträckte sig kring östra Medelhavet. Gränserna år 1900 skiljde sig markant från dagens Turkiet.'}
    ]
  },
  {
    title:'Vägen genom Europa',subtitle:'Små stater och stora makter',start:'bryssel',
    stops:[
      {city:'paris',type:'choice',question:'Vilken byggnad hade invigts för världsutställningen i Paris 1889?',options:['Triumfbågen','Eiffeltornet','Louvrepyramiden','Sacré-Cœur'],correct:1,fact:'Eiffeltornet uppfördes för 1889 års världsutställning och stod kvar som ett landmärke år 1900.'},
      {city:'bern',type:'choice',question:'Vilken stat tillhörde Bern år 1900?',options:['Tyska kejsardömet','Schweiz','Österrike–Ungern','Frankrike'],correct:1,fact:'Bern är säte för den schweiziska federala regeringen. Schweiz var en förbundsstat sedan 1848.'},
      {city:'wien',type:'map',question:'Markera Österrike–Ungern på kartan.',target:['Austria Hungary'],fact:'Dubbelmonarkin omfattade bland annat delar av dagens Österrike, Ungern, Tjeckien och Kroatien.'},
      {city:'belgrad',type:'choice',question:'Vilken självständig stat hade Belgrad som huvudstad år 1900?',options:['Jugoslavien','Kungariket Serbien','Bulgarien','Osmanska riket'],correct:1,fact:'Serbien erkändes som självständigt vid Berlinkongressen 1878 och var ett kungarike från 1882.'},
      {city:'konstantinopel',type:'choice',question:'Vilket hav ligger omedelbart söder om Konstantinopel?',options:['Svarta havet','Adriatiska havet','Marmarasjön','Egeiska havet'],correct:2,fact:'Staden ligger vid Bosporen, mellan Svarta havet och Marmarasjön.'}
    ]
  }
];

const $ = id => document.getElementById(id);
const canvas=$('map-canvas'), ctx=canvas.getContext('2d');
const view=$('map-viewport'), journal=$('journal');
const swedishDate = new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Stockholm',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const days = Math.floor((Date.parse(swedishDate+'T00:00:00Z') - Date.parse('2026-11-16T00:00:00Z')) / 86400000);
const tourIndex = ((days % TOURS.length) + TOURS.length) % TOURS.length;
const dayNumber = days+1;
const tour = TOURS[tourIndex];
const formattedDate = new Intl.DateTimeFormat('sv-SE',{day:'numeric',month:'short',year:'numeric',timeZone:'Europe/Stockholm'}).format(new Date());
$('header-date').textContent=formattedDate.toUpperCase();
const state={phase:'home',year:1900,stop:0,score:0,results:[],attempts:0,answered:false,chosen:null,feedback:null,transit:null,hover:null,loading:false};
const mapState={w:0,h:0,dpr:1,zoom:1,panX:0,panY:0,cache:null,cacheKey:'',data:null,features:[],requestId:0,drag:null,needsBase:true};
const yearCache=new Map();

function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function routeCities(){return [CITIES[tour.start],...tour.stops.map(s=>CITIES[s.city])];}
function routeName(n){return CITIES[tour.stops[n].city];}
function updateNav(){ $('nav-daily').classList.toggle('active',state.phase!=='explore'); $('nav-explore').classList.toggle('active',state.phase==='explore'); $('intro-section').style.display=state.phase==='playing'||state.phase==='travel'?'none':''; $('map-title').textContent=`EUROPA · ${state.year}`; $('map-legend').textContent=`POLITISKA GRÄNSER · ÅR ${state.year}`; }
function medal(results){return results.map(x=>x.points===100?'🟩':x.points>0?'🟨':'⬛').join('');}
function metaCard(){return `<div class="journey-meta"><div class="meta-item"><small>ÅRTAL</small><strong>1900</strong></div><div class="meta-item"><small>STATIONER</small><strong>05</strong></div><div class="meta-item"><small>TID</small><strong>3–6 min</strong></div></div>`;}
function stopList(){return `<div class="destinations"><div class="destinations-head"><b>RESANS STATIONER</b><span>5 STOPP</span></div><div class="stop-list">${tour.stops.map((s,i)=>`<div class="stop-row ${state.results.length>i?'done':state.stop===i&&state.phase!=='home'?'current':''}"><span class="stop-index">${state.results.length>i?'✓':String(i+1).padStart(2,'0')}</span><b>${escapeHTML(CITIES[s.city].name)}</b><small>${state.results.length>i?`${state.results[i].points} P`:i===state.stop&&state.phase!=='home'?'DU ÄR HÄR':'· · ·'}</small></div>`).join('')}</div></div>`;}
function homeMarkup(){return `<div class="journal-kicker">DAGLIG EXPEDITION #${String(dayNumber).padStart(3,'0')}</div><h2>${escapeHTML(tour.title.split(' ')[0])}<br/><em>${escapeHTML(tour.title.split(' ').slice(1).join(' '))}</em></h2><p class="journal-lead">${escapeHTML(tour.subtitle)}. Följ spåren genom Europa år 1900, svara på fem frågor och samla upp till 500 poäng.</p>${metaCard()}${stopList()}<div class="button-spacer"><button class="button-primary" id="start-journey">BÖRJA RESAN <span>→</span></button><div class="button-note">Gratis · Inget konto · Fyra demoresor som roterar</div></div>`;}
function transitMarkup(){const city=routeName(state.stop);return `<div class="journal-kicker">STATION ${state.stop+1} AV 5</div><div class="travel-icon">♧</div><h2 class="travel-text">På väg till ${escapeHTML(city.name)}...</h2><p class="travel-sub">Din resa färdas vidare genom Europas historiska landskap.</p>${stopList()}<div class="button-note button-spacer">Rutterna är schematiska – inte exakta järnvägslinjer.</div>`;}
function questionMarkup(){const q=tour.stops[state.stop],city=routeName(state.stop);const options=q.type==='choice'?`<div class="options">${q.options.map((opt,i)=>{let variant=state.answered?(i===q.correct?' correct':i===state.chosen?' wrong':''):'';return `<button type="button" class="answer-option${variant}" data-answer="${i}" ${state.answered?'disabled':''}><span class="letter">${'ABCD'[i]}</span><span>${escapeHTML(opt)}</span><span class="answer-state">${state.answered&&i===q.correct?'✓':state.answered&&i===state.chosen?'×':''}</span></button>`;}).join('')}</div>`:`<div class="map-action-prompt">◎ Klicka direkt på rätt territorium i kartan till vänster.</div>${state.attempts&&!state.answered?`<div class="map-click-feedback">Inte riktigt · ${3-state.attempts} försök kvar.</div>`:''}`;
const feedback=state.answered?`<div class="answer-feedback ${state.feedback.points===0?'wrong':''}"><strong>${state.feedback.points>0?`✓ Rätt! +${state.feedback.points} poäng`:'Svar avslöjat · 0 poäng'}</strong><p>${escapeHTML(q.fact)}</p></div>`:'';
return `<div class="quiz-top"><span class="stop-tag">ETAPP ${String(state.stop+1).padStart(2,'0')} / 05</span><span class="point-tag">${state.score} / 500 P</span></div><div class="progress-track"><div class="progress-fill" style="width:${(state.stop+1)*20}%"></div></div><div class="location-line">✦ ${escapeHTML(city.name.toUpperCase())} · ${escapeHTML(city.place.toUpperCase())}</div><h2 class="question-text">${escapeHTML(q.question)}</h2><p class="question-hint">${q.type==='map'?'Tre försök. Varje felaktig gissning minskar möjliga poäng.':'Välj ett svar. Du har ett försök per fråga.'}</p>${options}${feedback}<div class="button-spacer">${state.answered?`<button class="button-primary" id="next-stop">${state.stop===4?'SE RESULTAT':'VIDARE TILL NÄSTA STOPP'} <span>→</span></button>`:`<div class="ornament">✢</div><p class="small-muted">Rätt svar ger 100 poäng. För kartfrågor ger ett andra eller tredje försök 60 eller 30 poäng.</p>`}</div>`;}
function resultMarkup(){const max=500;let blurb=state.score>=450?'Mästerlig upptäcktsresande!':state.score>=300?'En skicklig historieresande!':state.score>=150?'En lovande upptäcktsresande!':'Varje resa börjar med ett första steg.';return `<div class="journal-kicker">EXPEDITIONEN AVSLUTAD</div><h2>Din resa är <em>fullbordad.</em></h2><p class="journal-lead">Du har besökt fem historiska stationer i Europa år 1900.</p><div class="ornament">✢</div><div class="score-total">${state.score} <span>/ ${max}</span></div><div class="result-icons" aria-label="Poängutfall per stopp">${medal(state.results)}</div><div class="result-banner"><strong>${escapeHTML(blurb)}</strong><small>${state.results.filter(x=>x.points>0).length} av 5 frågor rätt · Dagens resa #${dayNumber}</small></div><div class="stamps"><span class="stamp">EUROPA 1900</span><span class="stamp">5 STATIONER</span></div><div class="result-buttons"><button class="button-primary" id="share-result">KOPIERA RESULTAT ↗</button><button class="button-secondary" id="replay">SPELA IGEN (DEMO)</button></div>`;}
function exploreMarkup(){const index=HISTORICAL_YEARS.indexOf(state.year);return `<div class="journal-kicker">THE HISTORICAL ATLAS</div><h2>Världen <em>förr.</em></h2><p class="journal-lead">Utforska hur Europas nationsgränser och imperier förändrats. Dra reglaget mellan de årtal där historiska kartbilder finns.</p><div class="explore-controls"><div class="year-row"><span class="overline">VÄLJ KARTÅR</span><strong class="year-big" id="year-text">${state.year}</strong></div><input id="year-slider" aria-label="Välj kartår" type="range" min="0" max="${HISTORICAL_YEARS.length-1}" step="1" value="${index}"/><div class="year-range-labels"><span>1800</span><span>2000</span></div></div><div class="explore-notice"><b>Om kartbilden</b><br/>Gränserna bygger på ett historiskt GeoJSON-arkiv. Endast utvalda årtal går att välja i den här prototypen. Vissa gränser och territorier är omstridda eller ungefärliga.</div><div class="ornament">✢</div><p class="journal-lead">Dagens quiz spelas alltid på 1900 års karta, så att alla får samma utmaning.</p><div class="button-spacer"><button class="button-primary" id="back-to-daily">TILL DAGENS RESA <span>→</span></button></div>`;}
function renderJournal(){updateNav(); journal.innerHTML=state.phase==='home'?homeMarkup():state.phase==='travel'?transitMarkup():state.phase==='playing'?questionMarkup():state.phase==='result'?resultMarkup():exploreMarkup();journal.querySelector('#start-journey')?.addEventListener('click',startJourney);journal.querySelector('#next-stop')?.addEventListener('click',nextStop);journal.querySelectorAll('[data-answer]').forEach(el=>el.addEventListener('click',()=>chooseAnswer(Number(el.dataset.answer))));journal.querySelector('#replay')?.addEventListener('click',startJourney);journal.querySelector('#share-result')?.addEventListener('click',shareResult);journal.querySelector('#back-to-daily')?.addEventListener('click',showDaily);journal.querySelector('#year-slider')?.addEventListener('input',e=>{const year=HISTORICAL_YEARS[Number(e.target.value)];state.year=year;$('year-text').textContent=year;updateNav();loadMap(year);});scheduleDraw();}

function startJourney(){state.phase='travel';state.year=1900;state.stop=0;state.score=0;state.results=[];state.attempts=0;state.answered=false;state.feedback=null;state.transit=null;mapState.zoom=1;mapState.panX=0;mapState.panY=0;mapState.needsBase=true;loadMap(1900);travelToCurrent();}
function travelToCurrent(){state.phase='travel';state.answered=false;state.chosen=null;state.attempts=0;state.feedback=null;const cities=routeCities(),from=cities[state.stop],to=cities[state.stop+1];const duration=window.matchMedia('(prefers-reduced-motion: reduce)').matches?50:1350;state.transit={from,to,progress:0};renderJournal();const start=performance.now();function tick(now){if(state.phase!=='travel')return;const t=Math.min(1,(now-start)/duration);state.transit.progress=t<1?1-Math.pow(1-t,2):1;draw();if(t<1)requestAnimationFrame(tick);else{state.transit=null;state.phase='playing';renderJournal();}}requestAnimationFrame(tick);}
function chooseAnswer(i){const q=tour.stops[state.stop];if(state.phase!=='playing'||state.answered||q.type!=='choice')return;state.chosen=i;completeAnswer(i===q.correct?100:0);}
function guessMapCountry(name){const q=tour.stops[state.stop];if(state.phase!=='playing'||state.answered||q.type!=='map')return;if(!name)return;const correct=q.target.some(t=>t.toLowerCase()===name.toLowerCase());state.attempts++;if(correct)completeAnswer(state.attempts===1?100:state.attempts===2?60:30);else if(state.attempts>=3)completeAnswer(0);else renderJournal();}
function completeAnswer(points){state.answered=true;state.score+=points;state.feedback={points};state.results.push({points});renderJournal();}
function nextStop(){if(!state.answered)return;if(state.stop===4){state.phase='result';try{localStorage.setItem(`timetrail-${swedishDate}`,JSON.stringify({score:state.score,results:state.results}));}catch{}renderJournal();return;}state.stop++;travelToCurrent();}
function shareResult(){const text=`TimeTrail #${dayNumber} 🌍\nEuropa 1900 · ${tour.title}\n${state.score}/500 poäng\n${medal(state.results)}\n${location.href.split('#')[0]}`;const btn=$('share-result');if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(text).then(()=>{btn.textContent='KOPIERAT! ✓';}).catch(()=>prompt('Kopiera ditt resultat:',text));}else{prompt('Kopiera ditt resultat:',text);}}
function showDaily(){state.phase='home';state.year=1900;state.stop=0;state.transit=null;state.results=[];mapState.zoom=1;mapState.panX=0;mapState.panY=0;mapState.needsBase=true;renderJournal();loadMap(1900);}
function showExplore(){state.phase='explore';state.transit=null;state.year=1900;mapState.zoom=1;mapState.panX=0;mapState.panY=0;mapState.needsBase=true;renderJournal();loadMap(1900);}
$('nav-daily').addEventListener('click',showDaily);$('nav-explore').addEventListener('click',showExplore);$('brand-link').addEventListener('click',e=>{e.preventDefault();showDaily();});

// Map drawing — all borders come from externally sourced historical polygons.
const VIEW={west:-19,east:55,south:32,north:74};
const TINTS=['#cec19b','#d1c29b','#c1c19f','#d4c9ab','#b4b99f','#d2bea0','#c7b594','#b8bfa6','#cbb69a'];
const LABELS_1900=[
  ['ATLANTEN',-12,49,14,'italic'],['NORDSJÖN',2,58,11,'italic'],['MEDELHAVET',16,35,12,'italic'],
  ['SVERIGE–NORGE',14,65,11],['TYSKA KEJSARDÖMET',10.6,52.1,11],['ÖSTERRIKE–UNGERN',17,47.7,10],
  ['RYSKA IMPERIET',38,58.5,12],['OSMANSKA RIKET',34,40,10],['FRANKRIKE',1.6,46.7,11],
  ['STORBRITANNIEN',-2.5,54.4,10],['ITALIEN',12.8,43.2,10],['SPANIEN',-4.5,40.5,10],
  ['GREKLAND',22.2,38.6,9],['DANMARK',9.5,57.8,9],['SCHWEIZ',8.0,46.4,8],['SERBIEN',20.6,44.6,8]
];
function pointInBBox(b){return b.maxx>=VIEW.west&&b.minx<=VIEW.east&&b.maxy>=VIEW.south&&b.miny<=VIEW.north;}
function ringBBox(r){let minx=Infinity,miny=Infinity,maxx=-Infinity,maxy=-Infinity;for(const p of r){if(p[0]<minx)minx=p[0];if(p[0]>maxx)maxx=p[0];if(p[1]<miny)miny=p[1];if(p[1]>maxy)maxy=p[1];}return {minx,miny,maxx,maxy};}
function reduceRing(r){if(r.length<30)return r;const keep=[r[0]];let p=r[0];for(let i=1;i<r.length-1;i++){const n=r[i];if(Math.abs(n[0]-p[0])+Math.abs(n[1]-p[1])>.07){keep.push(n);p=n;}}keep.push(r[r.length-1]);return keep.length>=4?keep:r;}
function processMapData(geo){if(geo?.type!=='FeatureCollection'||!Array.isArray(geo.features))throw Error('Ogiltigt GeoJSON-format');return geo.features.filter(f=>f.geometry&&f.properties?.NAME).map(f=>{const raw=f.geometry.type==='MultiPolygon'?f.geometry.coordinates:f.geometry.type==='Polygon'?[f.geometry.coordinates]:[];const pieces=raw.filter(r=>r?.[0]?.length>=3&&pointInBBox(ringBBox(r[0]))).map(r=>r.map(reduceRing));return {name:f.properties.NAME,pieces,tint:TINTS[hashString(f.properties.SUBJECTO||f.properties.NAME)%TINTS.length]};}).filter(f=>f.pieces.length);}
function hashString(s){let h=0;for(let i=0;i<s.length;i++)h=((h<<5)-h+s.charCodeAt(i))|0;return Math.abs(h);}
async function loadMap(year){const request=++mapState.requestId;if(yearCache.has(year)){mapState.data=yearCache.get(year);mapState.features=mapState.data;mapState.needsBase=true;$('map-error').hidden=true;$('map-status').textContent='Karta redo';scheduleDraw();return;}
  const current=request;state.loading=true;mapState.features=[];mapState.needsBase=true;scheduleDraw();$('map-status').textContent=`Hämtar ${year}...`;$('map-error').hidden=true;
  const file=`world_${year}.geojson`;
  const candidates=[`https://cdn.jsdelivr.net/gh/aourednik/historical-basemaps@master/geojson/${file}`,`https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/${file}`];
  for(const url of candidates){try{const response=await fetch(url,{cache:'force-cache'});if(!response.ok)throw Error('HTTP '+response.status);const raw=await response.json();const reduced=processMapData(raw);if(!reduced.length)throw Error('Inga gränser funna');yearCache.set(year,reduced);if(current!==mapState.requestId)return;mapState.features=reduced;mapState.data=reduced;mapState.needsBase=true;state.loading=false;$('map-status').textContent='Historisk karta redo';$('map-error').hidden=true;scheduleDraw();return;}catch(e){if(current!==mapState.requestId)return;console.warn('Kartkälla misslyckades:',url,e);}}
  if(current===mapState.requestId){state.loading=false;mapState.features=[];mapState.needsBase=true;$('map-status').textContent='Kartdata saknas';$('map-error').hidden=false;scheduleDraw();}
}
function resetMap(){mapState.zoom=1;mapState.panX=0;mapState.panY=0;mapState.needsBase=true;scheduleDraw();}
function changeZoom(delta){mapState.zoom=Math.max(.75,Math.min(2.9,mapState.zoom*delta));mapState.needsBase=true;scheduleDraw();}
$('zoom-in').addEventListener('click',()=>changeZoom(1.22));$('zoom-out').addEventListener('click',()=>changeZoom(1/1.22));$('reset-map').addEventListener('click',resetMap);$('map-retry').addEventListener('click',()=>loadMap(state.year));
function project(lon,lat){const s=Math.min(mapState.w/75,mapState.h/43)*mapState.zoom;return {x:mapState.w/2+(lon-18)*s+mapState.panX,y:mapState.h/2+(53-lat)*s+mapState.panY};}
function unproject(x,y){const s=Math.min(mapState.w/75,mapState.h/43)*mapState.zoom;return {lon:(x-mapState.w/2-mapState.panX)/s+18,lat:53-(y-mapState.h/2-mapState.panY)/s};}
function resizeCanvas(){const rect=view.getBoundingClientRect();if(!rect.width||!rect.height)return;mapState.w=rect.width;mapState.h=rect.height;mapState.dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(rect.width*mapState.dpr);canvas.height=Math.round(rect.height*mapState.dpr);mapState.needsBase=true;scheduleDraw();}
function ringPath(c,r){for(let i=0;i<r.length;i++){const p=project(r[i][0],r[i][1]);if(i===0)c.moveTo(p.x,p.y);else c.lineTo(p.x,p.y);}c.closePath();}
function renderBase(){const w=mapState.w,h=mapState.h,dpr=mapState.dpr;if(!w||!h)return;let c=mapState.cache;if(!c)c=mapState.cache=document.createElement('canvas');c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);const b=c.getContext('2d');b.setTransform(dpr,0,0,dpr,0,0);
  const bg=b.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#d5d0b4');bg.addColorStop(.5,'#d2caab');bg.addColorStop(1,'#c8c3a7');b.fillStyle=bg;b.fillRect(0,0,w,h);
  b.lineWidth=.6;b.strokeStyle='#8d927e32';for(let lon=-20;lon<=55;lon+=5){const a=project(lon,20),e=project(lon,85);b.beginPath();b.moveTo(a.x,a.y);b.lineTo(e.x,e.y);b.stroke();}for(let lat=30;lat<=80;lat+=5){const a=project(-25,lat),e=project(65,lat);b.beginPath();b.moveTo(a.x,a.y);b.lineTo(e.x,e.y);b.stroke();}
  for(const f of mapState.features){b.beginPath();for(const rings of f.pieces){for(const ring of rings){if(ring.length>=3)ringPath(b,ring);}}b.fillStyle=f.tint;b.fill('evenodd');b.lineJoin='round';b.strokeStyle='#716b50ad';b.lineWidth=.7;b.stroke();}
  if(state.year===1900){const labels=w<600?LABELS_1900.filter(a=>['SVERIGE–NORGE','TYSKA KEJSARDÖMET','ÖSTERRIKE–UNGERN','RYSKA IMPERIET','OSMANSKA RIKET'].includes(a[0])):LABELS_1900;for(const [label,lon,lat,sz,variant] of labels){const p=project(lon,lat);if(p.x<8||p.x>w-8||p.y<10||p.y>h-12)continue;b.save();b.font=`${variant==='italic'?'italic ':'600 '}${w<600?Math.max(7,sz-2):sz}px Georgia,serif`;b.textAlign='center';b.textBaseline='middle';b.fillStyle=variant==='italic'?'#747b70a8':'#554b38b8';b.letterSpacing='1px';b.fillText(label,p.x,p.y);b.restore();}}
  // Map edge hatching and subtle antique grid decoration.
  b.strokeStyle='#a58c605c';b.lineWidth=1;b.strokeRect(8,8,w-16,h-16);
  mapState.needsBase=false;
}
function drawRoute(){const route=routeCities();let lastVisited=state.phase==='result'?5:state.phase==='home'||state.phase==='explore'?0:state.stop+(state.phase==='travel'?0:1);const c=ctx;
  if(state.phase==='explore')return;
  if(state.phase==='home'){const p=project(13.4,52.52);c.save();c.strokeStyle='#94764a77';c.lineWidth=1.5;c.setLineDash([4,7]);c.beginPath();for(let i=0;i<route.length;i++){const x=project(route[i].lon,route[i].lat);if(!i)c.moveTo(x.x,x.y);else c.lineTo(x.x,x.y);}c.stroke();c.restore();}
  for(let i=0;i<lastVisited&&i<route.length-1;i++){const a=project(route[i].lon,route[i].lat),b=project(route[i+1].lon,route[i+1].lat);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.strokeStyle='#795335';c.lineWidth=2.2;c.setLineDash([5,5]);c.stroke();c.setLineDash([]);}
  if(state.transit){const {from,to,progress}=state.transit,a=project(from.lon,from.lat),b=project(to.lon,to.lat);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(a.x+(b.x-a.x)*progress,a.y+(b.y-a.y)*progress);c.strokeStyle='#9f6d3d';c.lineWidth=2.3;c.setLineDash([4,4]);c.stroke();c.setLineDash([]);drawTrain(a.x+(b.x-a.x)*progress,a.y+(b.y-a.y)*progress);}
  else if(state.phase==='home'){drawPin(project(route[0].lon,route[0].lat).x,project(route[0].lon,route[0].lat).y,'✦',true);}
  else if(state.phase==='playing'||state.phase==='result'){const i=state.phase==='result'?5:state.stop+1,p=project(route[i].lon,route[i].lat);drawPin(p.x,p.y,'✦',true);}
  if(state.phase==='playing'||state.phase==='result'){for(let i=1;i<=(state.phase==='result'?5:state.stop+1);i++){const p=project(route[i].lon,route[i].lat);c.fillStyle='#6e5131';c.beginPath();c.arc(p.x,p.y,3.4,0,Math.PI*2);c.fill();}}
}
function drawTrain(x,y){const c=ctx;c.save();c.translate(x,y);c.fillStyle='#6c5135';c.strokeStyle='#f3dfb9';c.lineWidth=1.6;c.beginPath();c.arc(0,0,16,0,Math.PI*2);c.fill();c.stroke();c.fillStyle='#f3dfb9';c.fillRect(-10,-1,20,7);c.fillRect(1,-8,8,7);c.fillRect(-8,-8,3,7);c.fillStyle='#6c5135';c.fillRect(4,-5,3,3);c.fillStyle='#f3dfb9';for(const wx of [-6,6]){c.beginPath();c.arc(wx,7,3,0,Math.PI*2);c.fill();}c.restore();}
function drawPin(x,y,letter,active){const c=ctx;c.save();c.fillStyle='#6c5135';c.strokeStyle='#f0dfb9';c.lineWidth=2.1;c.beginPath();c.arc(x,y,14,0,Math.PI*2);c.fill();c.stroke();c.font='18px Georgia,serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#f6e3bf';c.fillText(letter,x,y+1);c.restore();}
function drawTooltip(){if(!state.hover||state.phase==='playing'&&tour.stops[state.stop].type==='map'&&!state.answered)return;const {x,y,name}=state.hover,c=ctx;const title=String(name).slice(0,45);c.save();c.font='12px Georgia,serif';const width=Math.min(240,c.measureText(title).width+20),px=Math.max(8,Math.min(mapState.w-width-8,x+12)),py=Math.max(8,Math.min(mapState.h-31,y-36));c.fillStyle='#f2e2c5f0';c.fillRect(px,py,width,29);c.strokeStyle='#947c59';c.lineWidth=1;c.strokeRect(px,py,width,29);c.fillStyle='#52412c';c.textAlign='left';c.fillText(title,px+10,py+19);c.restore();}
function draw(){if(!mapState.w||!mapState.h)return;if(mapState.needsBase)renderBase();const {w,h,dpr}=mapState;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);if(mapState.cache)ctx.drawImage(mapState.cache,0,0,w,h);drawRoute();drawTooltip();}
let queued=false;function scheduleDraw(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;draw();});}
function containsRing(pt,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if(((a[1]>pt.lat)!==(b[1]>pt.lat))&&(pt.lon<(b[0]-a[0])*(pt.lat-a[1])/(b[1]-a[1])+a[0]))inside=!inside;}return inside;}
function hitCountry(pt){for(let i=mapState.features.length-1;i>=0;i--){const f=mapState.features[i];for(const rings of f.pieces){if(containsRing(pt,rings[0])&&!rings.slice(1).some(r=>containsRing(pt,r)))return f.name;}}return null;}
function canvasPosition(e){const r=canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);const p=canvasPosition(e);mapState.drag={x:p.x,y:p.y,fromX:p.x,fromY:p.y,moved:false};});
canvas.addEventListener('pointermove',e=>{const p=canvasPosition(e);if(mapState.drag){const d=mapState.drag;const dx=p.x-d.x,dy=p.y-d.y;d.x=p.x;d.y=p.y;if(Math.abs(p.x-d.fromX)+Math.abs(p.y-d.fromY)>7)d.moved=true;if(d.moved){mapState.panX+=dx;mapState.panY+=dy;mapState.needsBase=true;scheduleDraw();}return;}const name=hitCountry(unproject(p.x,p.y));state.hover=name?{name,...p}:null;scheduleDraw();});
canvas.addEventListener('pointerup',e=>{const d=mapState.drag;mapState.drag=null;if(!d||d.moved)return;const p=canvasPosition(e);const name=hitCountry(unproject(p.x,p.y));if(state.phase==='playing'&&tour.stops[state.stop].type==='map')guessMapCountry(name);else{state.hover=name?{name,...p}:null;scheduleDraw();}});
canvas.addEventListener('pointercancel',()=>{mapState.drag=null;});canvas.addEventListener('pointerleave',()=>{if(!mapState.drag){state.hover=null;scheduleDraw();}});
canvas.addEventListener('wheel',e=>{e.preventDefault();changeZoom(e.deltaY<0?1.1:1/1.1);},{passive:false});
window.addEventListener('resize',resizeCanvas);
if('ResizeObserver' in window)new ResizeObserver(resizeCanvas).observe(view);
resizeCanvas();renderJournal();loadMap(1900);