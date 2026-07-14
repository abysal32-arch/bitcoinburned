# task-02 — Site restructure: homepage at root, tool at /tool/

## Goal
Make the site's real shape: Joe's chosen homepage design becomes `index.html` at the root, the existing tool app moves to `tool/index.html`, and every internal link works.

## Preconditions
task-01 done: git repo, `src/`+`test/` layout, tests green, `design/homepage.html` is the chosen design.

## Steps
1. `git mv index.html tool/index.html` (the ~290 KB inline bundle moves with it untouched).
2. Copy `design/homepage.html` → root `index.html`. The copy in `design/` stays as the frozen reference; root `index.html` is now the live page and diverges from here on.
3. **Wire links in root `index.html`** (decisions made — implement as stated):
   - Nav CTA "Burn BTC →" → `tool/`
   - Hero primary "Burn your BTC safely →" → `tool/`
   - Explainer button "Open the burn tool →" (currently `href="#"`) → `tool/`
   - Nav "Burn Tool" link and hero secondary button keep their in-page anchors (`#tool`, `#addresses`) — they navigate the homepage itself.
   - Footer "GitHub" and "Submit an address": leave `href="#"` but add `<!-- TODO(task-08): repo URL -->` beside each.
   - Use **relative** URLs everywhere (`tool/`, not `/tool/`) — the staging deploy in task-08 serves from a subpath.
4. **Tool page** (`tool/index.html`):
   - `<title>` → `Burn Tool — bitcoinburned.com`.
   - Add a minimal top link back home (e.g. a small `← bitcoinburned.com` mono link above `header.hero`, styled to match the page's paper palette, href `../`). Keep it subtle; full brand header comes in task-04.
5. **README update**: project layout + usage now describe `index.html` (homepage) vs `tool/index.html` (the app). The sentence "index.html is the whole application" must move/reword to point at `tool/index.html`.
6. **Gates** (use Claude Preview or open via `file://`):
   - Root homepage renders; click every nav/footer/CTA link: the three tool CTAs land on the tool page, anchors scroll, back-link returns home.
   - Tool page still fully works: fill the form (txid = 64×`a`, vout 0, value 150000, address `bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4`, fee 300, message "smoke"), Build → certificate appears with a base64 PSBT. **Save that exact PSBT string to `tasks/task-02/psbt-vector.txt`** (with the inputs listed) — task-03 uses it as a regression vector.
   - `node test/burn.test.js` green.
7. Commit: `task-02: homepage at root, tool at /tool/, links wired`.

## Do NOT
- Edit the inline bundle or `src/` logic.
- Restyle either page (tasks 04–06).

## Exit criteria
Two-page site navigable locally in both directions; PSBT vector file saved; README truthful; tests green; commit + STATUS updated; Joe told: safe to `/clear`, next = task-03.
