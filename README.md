# TimeTrail v0.2 — Historical Atlas Quiz

TimeTrail is a small, English-language historical geography game built with vanilla HTML, CSS and JavaScript, designed for GitHub Pages.

## Play the pilot expedition

Explore Europe in **1900** by completing **five stops**:

1. Find the **German Empire** on an unlabeled historical map.
2. Travel to **Vienna** and answer a historical multiple-choice question.
3. Locate **Constantinople** among five unlabeled city markers.
4. Travel to **Athens** and answer a history question.
5. Find the **Kingdom of Italy**, then travel to Rome to see your score.

Navigation challenges get up to three guesses (100, 60 or 30 points); incorrect repeat clicks are ignored. Multiple-choice questions allow one try (100 or 0 points). Players can reveal navigation answers for 0 points. A result screen shows the maximum of **500 points** and can be shared.

Destinations, map labels, and unvisited route segments are hidden until they are discovered. The journey and attempts are saved in the current browser with localStorage. A reload during travel completes the animation; it does not lose your quiz progress.

The pilot journey is **replayable** during development. This is not yet a unique new quiz every day, nor is it an anti-cheat competitive leaderboard. Future versions can add a validated daily question bank and server-side ranking.

## Run locally

Start an HTTP server in the folder (for instance `python -m http.server 8000`) and open `http://localhost:8000`. The historical maps load from [Historical Basemaps](https://github.com/aourednik/historical-basemaps) through jsDelivr, falling back to GitHub Raw. You need an internet connection for map questions to work.

No bundler or Node dependencies are needed to host this version.

## Deploy

GitHub repository → Settings → Pages → Deploy from a branch → `main` / `(root)`.

## Historical accuracy and data license

- The 1900 polygons come from [Historical Basemaps](https://github.com/aourednik/historical-basemaps), distributed under **GPL-3.0**. Review reuse/attribution obligations before commercial deployment.
- The city locations use modern approximate coordinates of historically relevant settlements, and animated route segments are **schematic**; they are not validated 1900 railway lines.
- Cartographic boundaries are simplified, and some claims are historically disputed or approximate.
- Each pilot question has a reference URL visible after answering; verify source availability and exact claims before broad launch.

## Game-state rules

1. Country/city navigation question first, then reveal and animate the journey.
2. For multiple choice, animate the journey to that city **before** showing the question.
3. Hide unvisited destinations and country labels during unresolved navigation.
4. Do not let a navigation target equal the player's current city/country.
5. Wrong guesses on the same country/marker don't consume additional attempts. Clicking sea or empty space doesn't consume attempts.
6. Keep progress across reloads. Replay is allowed in the pilot.

## Next development phases

- Historical data quality assurance with source review.
- More chapters/years with a robust daily rotation.
- Better small-screen map affordances and screen-reader interaction.
- Additional atlas design polish.

## Local gameplay tests

With Node.js installed, run `node tests/core.test.cjs`. The suite runs without packages or browsers, exercises the complete five-stop flow, verifies duplicate-guess protection and score calculation, and checks state restoration. Its simplified polygon fixture is only for testing interaction; it does **not** verify the external source's historical geometry.