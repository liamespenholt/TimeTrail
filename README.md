# TimeTrail – Daily Historical Geography Quiz

A dependency-free, English-language daily quiz set in a historical atlas of Europe in **1900**. This repository serves a static site through GitHub Pages.

## What's new in v0.3

- **50 individually authored, source-linked questions** in `content.js`, decoupled from the game engine.
- **10 five-stop itineraries** with varied starting cities and destinations. Each itinerary contains two country-navigation questions, one city-navigation question and two multiple-choice history questions.
- **36 historical city entries**, **18 historical country identifiers**, period labels, and city coordinates.
- Per-journey difficulty mix: one Easy, three Medium, one Hard. Trivia has one attempt; navigation has up to three, scoring 100/60/30 points.
- All players receive the same itinerary for a UTC date. `journeyForDay('YYYY-MM-DD')` rotates through the ten reviewed pilot itineraries. **The ten-day rotation repeats** until more content is added; this is not yet a full year of unique daily challenges.
- The route is revealed gradually. Country names are hidden during unresolved navigation challenges; city targets are marked only by letters until answered. Future destinations are hidden.
- Game state persists in the browser for the selected date and journey. Because this is a prototype, replay remains enabled and the game has no global ranking or cheat-resistant backend.

## Run locally

Serve the root directory using any static file server:

```sh
python -m http.server 8000
```

Open `http://localhost:8000`. Internet access is needed to fetch historical GeoJSON boundary data. The game uses historical snapshots from [`aourednik/historical-basemaps`](https://github.com/aourednik/historical-basemaps), with a CDN fallback to the original file host. The boundary dataset is GPL-3.0 licensed and needs a separate license review before commercial distribution.

## Tests

Requires Node.js 18+ and no extra packages:

```sh
node --test tests/*.test.cjs
node --check app.js
node --check content.js
```

The tests validate 50 questions, all route destinations, unique question IDs, the country where each navigation target belongs, the deterministic UTC daily rotation, the five-stop flow for all ten routes, replay/resume behavior, scoring, and minimum separation of city markers on a simulated narrow mobile screen.

Automated checks mock map geometry; they are **not** a complete geographic or historian review. Before launch, verify each answer against its linked source and check the live historical map on phones and desktop.

## Data and authoring

`content.js` is the only file where questions, city data, mappings, and itineraries are authored. Every question includes:

- `id`, `year`, `type` (`country`, `city`, `choice`), `city`, `difficulty`
- a player-facing `question` (English), a `fact` revealed after answering, and a `source` URL
- `targetId` for map navigation, or `options` and `correct` for trivia
- for city navigation, five possible city IDs in `candidates`

Itineraries reference question IDs rather than duplicating question text. No questions are generated automatically at runtime.

### Add an itinerary

1. Register any new historical cities in `cities` with coordinates and their 1900 state affiliation.
2. Write five distinct, source-checked questions with stable IDs and an accurate explanation.
3. Compose a route with one Easy, three Medium and one Hard question, plus exactly two country tasks, one city task, and two quiz tasks.
4. Make sure a country question doesn't target the country the player is already in, and a city question doesn't target their current city. Avoid revealing future destinations in questions or map labels.
5. Run all tests and verify city candidates are individually tappable on a 360px screen.

## Scope and caveats

- Only **Europe / 1900** is a live quiz region; the atlas tab provides selected other map snapshots without quiz content.
- Borders, control, colonization and sovereignty can be historically disputed or approximated. For example, Bulgaria was an autonomous principality under nominal Ottoman suzerainty in 1900, and Bosnia-Herzegovina had an unusual administrative status. Avoid overconfident phrasing.
- Route lines are **schematic travel illustrations**, not claims about actual railway infrastructure or historically available roads.
- This project is source-linked and editorially curated, but formal expert historical review and live manual gameplay checks are still recommended before a public launch.

## GitHub Pages

The public site is deployed from the `main` branch, root folder. Development changes are proposed on feature branches and merged by pull request after review.