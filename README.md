# Arcade

A keyboard-first browser arcade: classic games with a twist, quizzes, brain teasers, daily puzzles, and games that train real IT skills. Everything is static HTML, CSS and JavaScript with no build step, no server, and no outside requests.

## Play

Open `index.html` in a browser, or serve the folder (for example `python -m http.server`) so best scores and daily streaks are saved reliably.

On the hub, use ↑ and ↓ to choose a game, ← and → (or 1–5) to switch sections, / to search, and Enter to play. In any game, Esc returns to the hub.

## Structure

- `index.html` is the hub. The `GAMES` list at the top of its script registers every game.
- `arcade.css` holds the shared theme and bundled fonts; `arcade.js` holds shared helpers (best scores, seeded randomness, daily mode, and the Esc shortcut).
- Each game is a single self-contained HTML file.

## Adding a game

1. Create `your-game.html` using an existing game as a template, linking `arcade.css` and loading `arcade.js` before the game script.
2. Save the best score with `Arcade.record('yourGameBest', score)`.
3. Add an entry to `GAMES` in `index.html` with the file, title, section, color, storage key and a one-sentence description.

## Credits

See [credits.html](credits.html) for fonts, map data and trademark notices.
