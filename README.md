# TimeTrail — historiskt dagligt geografiquiz

En första **spelbar prototyp** av ett dagligt historiskt kartquiz i klassisk atlasstil. Språket är svenska.

## Vad kan man göra?

- Spela en daglig resa med fem historiska stationer i **Europa år 1900**.
- Se en schematisk animerad färd mellan städer.
- Besvara flervalsfrågor och klicka på rätt historiskt territorium direkt på kartan.
- Få 100, 60 eller 30 poäng för rätt svar på första, andra eller tredje försöket i kartfrågor.
- Få ett slutresultat (max 500 poäng) som kan kopieras och delas.
- Utforska sju historiska kartbilder (1800, 1880, 1900, 1914, 1938, 1945 och 2000) med tidsreglaget.
- Spela direkt på dator eller mobil utan inloggning.

## Starta lokalt

Projektet är skrivet i **ren HTML, CSS och JavaScript**, utan ramverk eller byggsteg. Det är avsiktligt för att göra prototypen enkel att testa, modifiera och publicera.

1. Installera Python 3 om det inte redan finns (eller använd exempelvis VS Code Live Server).
2. Öppna terminalen i projektmappen.
3. Kör:

```bash
python -m http.server 8000
```

4. Öppna **http://localhost:8000** i webbläsaren.

**Internet krävs för själva gränsdatan**: spelet hämtar historiska GeoJSON-kartor från ett externt GitHub-baserat arkiv via jsDelivr (reservkälla är GitHub Raw). Om hämtningen misslyckas visas ett tydligt felmeddelande. Frågorna går fortfarande att spela, men kartfrågorna kräver historisk gränsdata för att besvaras.

## Publicera på GitHub Pages

1. Skapa ett nytt **public** repository på GitHub, exempelvis `timetrail`.
2. Ladda upp projektfilerna i repositoryts rot: `index.html`, `styles.css`, `app.js`, `README.md` och `.nojekyll` (den sista är frivillig).
3. Gå till **Settings → Pages**.
4. Välj **Deploy from a branch**, `main` och `/ (root)` och spara.
5. När GitHub Pages har publicerat öppnar du `https://DITT-ANVÄNDARNAMN.github.io/timetrail/`.

Det krävs **ingen** Node-installation, `npm install` eller Vite-server för denna version. GitHub Pages kan servera filerna direkt.

## Projektstruktur

```text
timetrail/
├─ index.html       # Sidans struktur och navigering
├─ styles.css       # Historisk atlasdesign och mobilanpassning
├─ app.js           # Spelregler, frågor, animationer och kartmotor
├─ README.md
└─ .nojekyll        # GitHub Pages
```

## Kartdata och källhänvisning

Historiska gränser hämtas dynamiskt från:

- [Historical Basemaps – aourednik](https://github.com/aourednik/historical-basemaps)
- Filer som `geojson/world_1900.geojson` och `geojson/world_1914.geojson`.
- **Dataarkivets licens är GNU GPL-3.0.** Läs originallicensen och villkoren innan du distribuerar kartdatan, bygger vidare eller använder prototypen kommersiellt. Appen länkar till källan i kartvyn. Prototypen inkluderar inte själva GeoJSON-filerna.

Kartorna visar **översiktlig, historiskt informerad geopolitisk geografi**. De är inte kompletta eller exakt verifierade för varje gräns, koloni, territorium eller dag på året. Källprojektet beskriver självt materialet som ett pågående arbete. Fordonsrörelsen är **illustrativ**, inte en rekonstruktion av faktiska järnvägar eller vägar 1900.

## Prototypbegränsningar

- Det finns **fyra handskrivna resor** om fem frågor; de roterar efter kalenderdatum i tidszonen *Europe/Stockholm*. Efter fyra dagar återkommer samma innehåll. Lägg till fler poster i `TOURS` för att göra det till en riktig daglig innehållstjänst.
- Frågorna är statiska och faktagranskning, innehållsförvaltning och källreferenser per fråga behöver utvecklas inför en publik lansering.
- Poäng räknas lokalt i webbläsaren; det finns ingen server som skyddar mot fusk eller validerar topplistor.
- Tidsreglaget hoppar mellan **kartdatabasens utvalda år**, inte varje kalenderår. Spelets quiz är låst till 1900.
- Kartdatakällan använder en rörlig `master`-gren. Frys datasetversionen till ett specifikt commit-hash inför en produktionslansering så att spelare alltid får samma kartbild.
- Teckensnitt från Google Fonts är valfria; sidan använder reservtypsnitt om de inte laddas.

## Lägga till en resa

I `app.js`, leta efter konstanten `TOURS`. Varje resa har titel, startstad och fem poster i `stops`. En fråga kan vara:

```js
{ city: 'berlin', type: 'choice',
  question: 'Vem var kejsare i Tyskland år 1900?',
  options: ['Person A', 'Wilhelm II', 'Person C', 'Person D'],
  correct: 1,
  fact: 'Wilhelm II regerade från 1888 till 1918.' }
```

Eller en klickfråga för kartan:

```js
{ city: 'wien', type: 'map',
  question: 'Klicka på Österrike–Ungern.',
  target: ['Austria Hungary'],
  fact: 'En dubbelmonarki 1867–1918.' }
```

Det historiska namn som anges i `target` behöver matcha GeoJSON-datafältet `NAME` i kartarkivet för år 1900.

## Nästa utvecklingssteg

1. Lägg till fler handskrivna, källförankrade dagsresor.
2. Lagra historiska kartbilder lokalt eller i egen CDN under tydligt hanterad licens.
3. Ge varje fråga ett källfält och granska historiska frågor med hänsyn till årtal.
4. Förbättra kartans geografiska projektion, etiketter och möjligheten att klicka på små territorier.
5. Utvärdera användarkonton, poänghistorik och delningslänkar efter användartester.