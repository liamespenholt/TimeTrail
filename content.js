/* TimeTrail v0.3 historical content pack: Europe in 1900.
   Curated, source-linked pilot content; routes are schematic, not railway reconstructions.
   Data is independent of the rendering/gameplay engine. */
(function (root, factory) {
  const content = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = content;
  if (root) root.TIMETRAIL_CONTENT = content;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const references = Object.freeze({
    map: 'https://www.euratlas.com/big/bis1900.htm',
    german: 'https://www.britannica.com/place/German-Empire',
    austria: 'https://www.britannica.com/place/Austria-Hungary',
    italy: 'https://www.britannica.com/place/Italy/Unification',
    ottoman: 'https://www.britannica.com/place/Ottoman-Empire',
    sweden: 'https://www.encyclopedia.com/history/encyclopedias-almanacs-transcripts-and-maps/sweden-and-norway',
    franz: 'https://www.britannica.com/biography/Franz-Joseph',
    olympics: 'https://www.olympics.com/ioc/faq/history-and-origin-of-the-games/what-is-the-origin-of-the-olympic-games',
    olympicHistory: 'https://www.olympics.com/ioc/history',
    romanian: 'https://www.britannica.com/place/Romania/Independence-and-kingdom',
    russia: 'https://www.britannica.com/place/Russian-Empire',
    finland: 'https://www.britannica.com/place/Finland/Finland-under-Swedish-rule',
    uk: 'https://www.britannica.com/place/United-Kingdom',
    victoria: 'https://www.britannica.com/biography/Victoria-queen-of-United-Kingdom',
    belgium: 'https://www.britannica.com/place/Belgium',
    leopold: 'https://www.britannica.com/biography/Leopold-II-king-of-Belgium',
    portugal: 'https://www.britannica.com/place/Portugal/History',
    spain: 'https://www.britannica.com/place/Spain/The-restoration',
    expo: 'https://www.olympics.com/ioc/history',
    serbia: 'https://www.britannica.com/place/Serbia/History',
    bulgaria: 'https://en.wikisource.org/wiki/1911_Encyclop%C3%A6dia_Britannica/Bulgaria/History',
    greece: 'https://www.britannica.com/place/Greece/History',
    olympic1896: 'https://www.olympics.com/ioc/legacy/living-legacy/athens-1896',
    prague: 'https://www.britannica.com/place/Prague',
    warsaw: 'https://www.britannica.com/place/Warsaw',
    riga: 'https://www.britannica.com/place/Riga',
    naples: 'https://www.britannica.com/place/Naples-Italy',
    vesuvius: 'https://www.britannica.com/place/Vesuvius',
    barcelona: 'https://international.bie-paris.org/site/en/1888-barcelona',
    porto: 'https://link.springer.com/article/10.1007/s10584-021-03039-7',
    lyon: 'https://events.lyon-france.com/en/choose-lyon/the-assets-of-lyon/lyon-urban-contemporary-and-river-city',
    swiss: 'https://www.britannica.com/place/Switzerland/History',
    trieste: 'https://www.britannica.com/place/Trieste-Italy',
    krakow: 'https://ome-lexikon.uni-oldenburg.de/en/regions/galicia',
    bismarck: 'https://www.britannica.com/biography/Otto-von-Bismarck',
    austriaBosnia: 'https://en.wikisource.org/wiki/1911_Encyclop%C3%A6dia_Britannica/Austria-Hungary/History_Ia'
  });
  function city(name, country, countryId, lon, lat) { return {name, country, countryId, lon, lat}; }
  const cities = Object.freeze({
    stockholm: city('Stockholm','Sweden–Norway','sweden_norway',18.06,59.33),
    berlin: city('Berlin','German Empire','german_empire',13.40,52.52),
    vienna: city('Vienna','Austria–Hungary','austria_hungary',16.37,48.21),
    constantinople: city('Constantinople','Ottoman Empire','ottoman_empire',28.98,41.01),
    athens: city('Athens','Kingdom of Greece','greece',23.73,37.98),
    rome: city('Rome','Kingdom of Italy','kingdom_italy',12.50,41.90),
    bucharest: city('Bucharest','Kingdom of Romania','romania',26.10,44.43),
    belgrade: city('Belgrade','Kingdom of Serbia','serbia',20.46,44.81),
    odessa: city('Odessa','Russian Empire','russian_empire',30.73,46.48),
    copenhagen: city('Copenhagen','Kingdom of Denmark','denmark',12.57,55.68),
    kristiania: city('Kristiania','Sweden–Norway','sweden_norway',10.75,59.91),
    st_petersburg: city('St. Petersburg','Russian Empire','russian_empire',30.31,59.94),
    helsinki: city('Helsinki','Grand Duchy of Finland (Russian Empire)','russian_empire',24.94,60.17),
    london: city('London','United Kingdom of Great Britain and Ireland','united_kingdom',-0.13,51.51),
    edinburgh: city('Edinburgh','United Kingdom of Great Britain and Ireland','united_kingdom',-3.19,55.95),
    amsterdam: city('Amsterdam','Kingdom of the Netherlands','netherlands',4.90,52.37),
    brussels: city('Brussels','Kingdom of Belgium','belgium',4.35,50.85),
    paris: city('Paris','French Third Republic','france',2.35,48.86),
    lisbon: city('Lisbon','Kingdom of Portugal','portugal',-9.14,38.72),
    porto: city('Porto','Kingdom of Portugal','portugal',-8.61,41.15),
    madrid: city('Madrid','Kingdom of Spain','spain',-3.70,40.42),
    barcelona: city('Barcelona','Kingdom of Spain','spain',2.17,41.39),
    lyon: city('Lyon','French Third Republic','france',4.84,45.76),
    marseille: city('Marseille','French Third Republic','france',5.37,43.30),
    sofia: city('Sofia','Principality of Bulgaria','bulgaria',23.32,42.70),
    prague: city('Prague','Austria–Hungary','austria_hungary',14.42,50.08),
    warsaw: city('Warsaw','Russian Empire','russian_empire',21.01,52.23),
    riga: city('Riga','Russian Empire','russian_empire',24.11,56.95),
    naples: city('Naples','Kingdom of Italy','kingdom_italy',14.27,40.85),
    munich: city('Munich','German Empire','german_empire',11.58,48.14),
    hamburg: city('Hamburg','German Empire','german_empire',9.99,53.55),
    zurich: city('Zurich','Swiss Confederation','switzerland',8.54,47.38),
    bern: city('Bern','Swiss Confederation','switzerland',7.45,46.95),
    trieste: city('Trieste','Austria–Hungary','austria_hungary',13.77,45.65),
    budapest: city('Budapest','Austria–Hungary','austria_hungary',19.05,47.50),
    krakow: city('Kraków','Austria–Hungary','austria_hungary',19.94,50.06)
  });
  const countriesByGeoName = Object.freeze({
    'Germany': {id:'german_empire',name:'German Empire'},
    'Italy': {id:'kingdom_italy',name:'Kingdom of Italy'},
    'Austria Hungary': {id:'austria_hungary',name:'Austria–Hungary'},
    'Ottoman Empire': {id:'ottoman_empire',name:'Ottoman Empire'},
    'Sweden–Norway': {id:'sweden_norway',name:'Sweden–Norway'},
    'Greece': {id:'greece',name:'Kingdom of Greece'},
    'Romania': {id:'romania',name:'Kingdom of Romania'},
    'Serbia': {id:'serbia',name:'Kingdom of Serbia'},
    'Russian Empire': {id:'russian_empire',name:'Russian Empire'},
    'United Kingdom of Great Britain and Ireland': {id:'united_kingdom',name:'United Kingdom of Great Britain and Ireland'},
    'France': {id:'france',name:'French Third Republic'},
    'Belgium': {id:'belgium',name:'Kingdom of Belgium'},
    'Netherlands': {id:'netherlands',name:'Kingdom of the Netherlands'},
    'Portugal': {id:'portugal',name:'Kingdom of Portugal'},
    'Spain': {id:'spain',name:'Kingdom of Spain'},
    'Denmark': {id:'denmark',name:'Kingdom of Denmark'},
    'Switzerland': {id:'switzerland',name:'Swiss Confederation'},
    'Bulgaria': {id:'bulgaria',name:'Principality of Bulgaria'}
  });
  const questionBank = [];
  const add = (id, cityId, type, difficulty, question, fact, sourceKey, extra = {}) => {
    questionBank.push({id,city:cityId,type,difficulty,question,fact,source:references[sourceKey],year:1900,...extra});
  };
  // TOUR 01 · The imperial capitals · Stockholm to Rome
  add('t01-q01','berlin','country','Easy','Find the empire proclaimed after the unification of German states in 1871.','The German Empire was proclaimed in 1871 with Berlin as its capital.','german',{targetId:'german_empire'});
  add('t01-q02','vienna','choice','Medium','Who was Emperor of Austria and King of Hungary in 1900?','Franz Joseph I held both titles under the Austro-Hungarian Dual Monarchy.','franz',{options:['Nicholas II','Franz Joseph I','Wilhelm II','George I'],correct:1});
  add('t01-q03','constantinople','city','Medium','Find the capital city of the Ottoman Empire in 1900.','Constantinople was the Ottoman capital; the city is now called Istanbul.','ottoman',{targetId:'constantinople',candidates:['constantinople','athens','sofia','bucharest','belgrade']});
  add('t01-q04','athens','choice','Medium','In what year were the first modern Olympic Games held in Athens?','The inaugural modern Olympic Games took place in Athens in April 1896.','olympics',{options:['1888','1896','1900','1904'],correct:1});
  add('t01-q05','rome','country','Hard','Locate the kingdom proclaimed in 1861 whose capital became Rome in 1871.','The Kingdom of Italy was proclaimed in 1861; Rome became its capital in 1871.','italy',{targetId:'kingdom_italy'});

  // TOUR 02 · Northern crowns · Copenhagen to Berlin
  add('t02-q01','stockholm','country','Easy','Find the union of two northern kingdoms sharing one monarch in 1900.','Sweden and Norway formed a personal union between 1814 and 1905.','map',{targetId:'sweden_norway'});
  add('t02-q02','kristiania','choice','Medium','In which year was the political union between Sweden and Norway dissolved?','The union ended in 1905; Kristiania was the Norwegian capital at the time.','sweden',{options:['1884','1896','1905','1918'],correct:2});
  add('t02-q03','st_petersburg','city','Hard','Find the capital of the Russian Empire in 1900.','St. Petersburg was imperial Russia’s capital from 1712 until 1918, apart from a brief interruption.','russia',{targetId:'st_petersburg',candidates:['st_petersburg','stockholm','helsinki','riga','warsaw']});
  add('t02-q04','helsinki','choice','Medium','To which empire did the Grand Duchy of Finland belong in 1900?','Finland was an autonomous grand duchy within the Russian Empire until independence in 1917.','map',{options:['German Empire','Russian Empire','Sweden–Norway','Austria–Hungary'],correct:1});
  add('t02-q05','berlin','country','Medium','Find the empire ruled by Kaiser Wilhelm II at the beginning of the twentieth century.','Wilhelm II was German emperor from 1888 until 1918.','german',{targetId:'german_empire'});

  // TOUR 03 · Western crowns · Amsterdam to Madrid
  add('t03-q01','paris','country','Easy','Find the republic whose capital hosted the 1900 Exposition Universelle.','Paris hosted the 1900 world’s fair under the French Third Republic.','map',{targetId:'france'});
  add('t03-q02','brussels','choice','Hard','Which Central African territory was personally controlled by Belgium’s King Leopold II in 1900?','Leopold II personally controlled the Congo Free State from 1885 to 1908; severe abuses occurred under his regime.','leopold',{options:['Angola','Congo Free State','German East Africa','French Equatorial Africa'],correct:1});
  add('t03-q03','london','city','Medium','Find the capital of the United Kingdom of Great Britain and Ireland.','London was the British imperial capital; Ireland was still part of the United Kingdom in 1900.','uk',{targetId:'london',candidates:['london','paris','madrid','edinburgh','amsterdam']});
  add('t03-q04','edinburgh','choice','Medium','Who was the British monarch at the beginning of the year 1900?','Queen Victoria reigned from 1837 until her death in January 1901.','victoria',{options:['Victoria','Edward VII','George V','Elizabeth II'],correct:0});
  add('t03-q05','madrid','country','Medium','Find the European kingdom that lost Cuba and the Philippines following the war of 1898.','Spain lost its remaining major overseas possessions after the Spanish–American War.','spain',{targetId:'spain'});

  // TOUR 04 · Atlantic connections · London to Rome
  add('t04-q01','lisbon','country','Easy','Find the Atlantic-facing kingdom whose capital is Lisbon.','Portugal remained a monarchy until the republican revolution of 1910.','portugal',{targetId:'portugal'});
  add('t04-q02','madrid','choice','Medium','Which year marked the end of the Spanish–American War?','The Spanish–American War concluded in 1898, bringing major changes to Spain’s overseas empire.','spain',{options:['1878','1898','1905','1912'],correct:1});
  add('t04-q03','paris','city','Medium','Find the French capital that hosted a world’s fair in 1900.','Paris hosted the Exposition Universelle of 1900.','expo',{targetId:'paris',candidates:['paris','london','barcelona','madrid','lyon']});
  add('t04-q04','lyon','choice','Hard','Which two rivers meet at Lyon?','The Rhône and Saône converge at Lyon, a major inland trading city.','map',{options:['Rhône and Saône','Seine and Marne','Rhine and Main','Danube and Inn'],correct:0});
  add('t04-q05','rome','country','Medium','Find the kingdom that included both Rome and Naples in 1900.','Rome and Naples were part of the united Kingdom of Italy in 1900.','italy',{targetId:'kingdom_italy'});

  // TOUR 05 · Balkan crossroads · Budapest to Constantinople
  add('t05-q01','belgrade','country','Medium','Find the Balkan kingdom whose capital was Belgrade in 1900.','Serbia became a kingdom in 1882; Belgrade was its capital.','serbia',{targetId:'serbia'});
  add('t05-q02','sofia','choice','Hard','What was Bulgaria’s constitutional status in 1900?','Bulgaria was an autonomous principality under nominal Ottoman suzerainty until declaring independence in 1908.','bulgaria',{options:['An independent republic','An autonomous principality under Ottoman suzerainty','A province of Austria–Hungary','A Russian governorate'],correct:1});
  add('t05-q03','bucharest','city','Medium','Find the capital of the kingdom ruled by King Carol I in 1900.','Bucharest was the capital of Romania, a kingdom from 1881.','romanian',{targetId:'bucharest',candidates:['bucharest','belgrade','sofia','athens','constantinople']});
  add('t05-q04','athens','choice','Easy','Who was King of Greece in 1900?','George I was King of the Hellenes from 1863 until 1913.','greece',{options:['Otto I','George I','Constantine II','Alexander I'],correct:1});
  add('t05-q05','constantinople','country','Medium','Find the empire that still ruled Constantinople and much of Anatolia in 1900.','The Ottoman Empire endured until the early twentieth century; its sultanate ended in 1922.','ottoman',{targetId:'ottoman_empire'});

  // TOUR 06 · Baltic borderlands · Copenhagen to Stockholm
  add('t06-q01','berlin','country','Easy','Find the central European empire of which Prussia formed the largest constituent state.','Prussia was the dominant state within the German Empire founded in 1871.','german',{targetId:'german_empire'});
  add('t06-q02','prague','choice','Medium','Prague belonged to which state in 1900?','Prague was in Bohemia, then within Austria–Hungary; Czechoslovakia was created in 1918.','prague',{options:['German Empire','Austria–Hungary','Russian Empire','Kingdom of Serbia'],correct:1});
  add('t06-q03','warsaw','city','Hard','Locate the city on the Vistula that was in the Russian Empire in 1900 and is now Poland’s capital.','Warsaw was in Russian-controlled territory in 1900; Poland regained independence in 1918.','warsaw',{targetId:'warsaw',candidates:['warsaw','berlin','prague','riga','stockholm']});
  add('t06-q04','riga','choice','Medium','Which empire governed Riga in 1900?','Riga was part of the Russian Empire; Latvia gained independence in 1918.','riga',{options:['German Empire','Russian Empire','Sweden–Norway','Ottoman Empire'],correct:1});
  add('t06-q05','stockholm','country','Medium','Locate the northern personal union whose constituent capitals were Stockholm and Kristiania.','Sweden and Norway shared a monarch until the union dissolved in 1905.','map',{targetId:'sweden_norway'});

  // TOUR 07 · Mediterranean monarchies · Marseille to Bucharest
  add('t07-q01','rome','country','Easy','Find the kingdom whose capital was Rome and whose southern mainland included Naples.','The Kingdom of Italy unified many former states during the nineteenth century.','italy',{targetId:'kingdom_italy'});
  add('t07-q02','naples','choice','Medium','Which volcano near Naples famously buried Pompeii in AD 79?','Mount Vesuvius erupted in AD 79, burying Pompeii and Herculaneum.','vesuvius',{options:['Etna','Stromboli','Vesuvius','Vulcano'],correct:2});
  add('t07-q03','constantinople','city','Hard','Find the city on the Bosporus that connected the Black Sea with the Sea of Marmara.','Constantinople straddles the Bosporus, the waterway connecting the Black Sea and Sea of Marmara.','ottoman',{targetId:'constantinople',candidates:['constantinople','bucharest','sofia','athens','rome']});
  add('t07-q04','athens','choice','Medium','Who founded the International Olympic Committee in 1894?','Pierre de Coubertin led the revival of the modern Olympic Games and helped establish the IOC in 1894.','olympicHistory',{options:['Pierre de Coubertin','Spyridon Louis','Georges Averoff','Demetrius Vikelas'],correct:0});
  add('t07-q05','bucharest','country','Medium','Find the kingdom established in 1881 and ruled in 1900 by Carol I.','Romania became a kingdom in 1881 under Carol I.','romanian',{targetId:'romania'});

  // TOUR 08 · Iberian passage · Paris to Brussels
  add('t08-q01','madrid','country','Easy','Locate the kingdom occupying most of the Iberian Peninsula east of Portugal in 1900.','Spain was a monarchy on the Iberian Peninsula in 1900.','map',{targetId:'spain'});
  add('t08-q02','barcelona','choice','Hard','In which year did Barcelona host a major Universal Exposition?','Barcelona staged its Universal Exposition in 1888.','barcelona',{options:['1867','1878','1888','1900'],correct:2});
  add('t08-q03','lisbon','city','Medium','Find the capital of the Portuguese monarchy in 1900.','Lisbon was the Portuguese royal capital and the country’s principal Atlantic port.','portugal',{targetId:'lisbon',candidates:['lisbon','madrid','barcelona','paris','amsterdam']});
  add('t08-q04','porto','choice','Medium','Which river reaches the Atlantic at Porto?','The Douro flows past Porto into the Atlantic Ocean.','porto',{options:['Tagus','Douro','Guadalquivir','Ebro'],correct:1});
  add('t08-q05','brussels','country','Medium','Find the small kingdom between France, Germany and the Netherlands whose capital was Brussels.','Belgium became independent in 1830 and remained a monarchy in 1900.','belgium',{targetId:'belgium'});

  // TOUR 09 · The Alpine corridor · Munich to Sofia
  add('t09-q01','zurich','country','Medium','Locate the federal republic whose cities included Zurich, Bern and Geneva in 1900.','The Swiss federal state was established under the constitution of 1848.','swiss',{targetId:'switzerland'});
  add('t09-q02','bern','choice','Medium','Which year saw Switzerland adopt the federal constitution that created the modern federal state?','The 1848 federal constitution transformed Switzerland into a federal state.','swiss',{options:['1815','1848','1871','1918'],correct:1});
  add('t09-q03','vienna','city','Easy','Find the Habsburg imperial capital on the Danube in 1900.','Vienna was the imperial seat of Austria–Hungary and a city on the Danube.','austria',{targetId:'vienna',candidates:['vienna','munich','berlin','budapest','trieste']});
  add('t09-q04','trieste','choice','Hard','Which empire controlled the Adriatic port of Trieste in 1900?','Trieste was a major Habsburg port, within Austria–Hungary until 1918.','trieste',{options:['Kingdom of Italy','Austria–Hungary','Ottoman Empire','Kingdom of Serbia'],correct:1});
  add('t09-q05','sofia','country','Medium','Find the principality whose capital was Sofia and which declared full independence in 1908.','The Principality of Bulgaria gained autonomy in 1878 and declared independence in 1908.','bulgaria',{targetId:'bulgaria'});

  // TOUR 10 · The empires' borderlands · Warsaw to Brussels
  add('t10-q01','budapest','country','Medium','Locate the dual monarchy formed by the 1867 Compromise between Austria and Hungary.','The Austro-Hungarian Compromise created the Dual Monarchy in 1867.','austria',{targetId:'austria_hungary'});
  add('t10-q02','krakow','choice','Hard','In 1900, Kraków was in which political unit?','Kraków belonged to Austrian Galicia within Austria–Hungary, rather than an independent Polish state.','krakow',{options:['Russian Empire','Austrian Galicia','German Empire','Kingdom of Romania'],correct:1});
  add('t10-q03','berlin','city','Easy','Find the capital of the empire proclaimed after German unification in 1871.','Berlin was the capital of the German Empire from 1871.','german',{targetId:'berlin',candidates:['berlin','stockholm','paris','vienna','warsaw']});
  add('t10-q04','hamburg','choice','Medium','In which year did Otto von Bismarck resign as German chancellor?','Bismarck resigned in 1890 after a conflict with Kaiser Wilhelm II.','bismarck',{options:['1871','1888','1890','1905'],correct:2});
  add('t10-q05','brussels','country','Medium','Locate the kingdom ruled in 1900 by Leopold II, east of France and west of Germany.','Leopold II was King of Belgium from 1865 to 1909.','leopold',{targetId:'belgium'});

  const questionsById = Object.freeze(Object.fromEntries(questionBank.map(q => [q.id, Object.freeze(q)])));
  const journeys = Object.freeze([
    {id:'imperial-capitals',title:'The Imperial Capitals',subtitle:'From the north to the Bosporus',start:'stockholm',questionIds:['t01-q01','t01-q02','t01-q03','t01-q04','t01-q05']},
    {id:'northern-crowns',title:'Northern Crowns',subtitle:'Two kingdoms, one crown, and a vast empire',start:'copenhagen',questionIds:['t02-q01','t02-q02','t02-q03','t02-q04','t02-q05']},
    {id:'western-powers',title:'Western Powers',subtitle:'Republics, royal courts and imperial capitals',start:'amsterdam',questionIds:['t03-q01','t03-q02','t03-q03','t03-q04','t03-q05']},
    {id:'atlantic-connections',title:'Atlantic Connections',subtitle:'From the Atlantic coast to the Mediterranean',start:'london',questionIds:['t04-q01','t04-q02','t04-q03','t04-q04','t04-q05']},
    {id:'balkan-crossroads',title:'Balkan Crossroads',subtitle:'Kingdoms, principalities and empires',start:'budapest',questionIds:['t05-q01','t05-q02','t05-q03','t05-q04','t05-q05']},
    {id:'baltic-borderlands',title:'Baltic Borderlands',subtitle:'A journey across the great northern frontiers',start:'copenhagen',questionIds:['t06-q01','t06-q02','t06-q03','t06-q04','t06-q05']},
    {id:'mediterranean-monarchies',title:'Mediterranean Monarchies',subtitle:'Ports, palaces and ancient cities',start:'marseille',questionIds:['t07-q01','t07-q02','t07-q03','t07-q04','t07-q05']},
    {id:'iberian-passage',title:'The Iberian Passage',subtitle:'Across peninsulas and royal capitals',start:'paris',questionIds:['t08-q01','t08-q02','t08-q03','t08-q04','t08-q05']},
    {id:'alpine-corridor',title:'The Alpine Corridor',subtitle:'From Swiss cantons to the Balkans',start:'munich',questionIds:['t09-q01','t09-q02','t09-q03','t09-q04','t09-q05']},
    {id:'empires-borderlands',title:'The Empires’ Borderlands',subtitle:'Across the frontiers of 1900',start:'warsaw',questionIds:['t10-q01','t10-q02','t10-q03','t10-q04','t10-q05']}
  ].map(j => Object.freeze({...j, year:1900, stops:Object.freeze(j.questionIds.map(id=>questionsById[id]))})));

  // UTC selection is deterministic: every visitor sees the same route on the same date.
  const EPOCH = '2026-11-18';
  function journeyForDay(utcDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(utcDate)) throw Error('Invalid UTC date');
    const value = Date.parse(utcDate+'T00:00:00Z');
    if (!Number.isFinite(value) || new Date(value).toISOString().slice(0,10)!==utcDate) throw Error('Invalid UTC date');
    const offset = Math.floor((value - Date.parse(EPOCH+'T00:00:00Z'))/86400000);
    return journeys[((offset % journeys.length)+journeys.length)%journeys.length];
  }
  return Object.freeze({year:1900,version:3,licenseNote:'Historical boundary data licensed separately (GPL-3.0).',references,
    cities,countriesByGeoName,questionBank:Object.freeze(questionBank),questionsById,journeys,journeyForDay});
});