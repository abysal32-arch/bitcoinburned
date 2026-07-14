# task-01 — Repo foundation: layout fix, tests green, git init

## Goal
Turn the loose folder into a working, version-controlled project whose layout matches what the code already expects. Nothing user-visible changes yet.

## Why (context)
Files were dumped flat into the folder root, but `cli.js` requires `./src/burn` and `test/burn.test.js` requires `../src/burn` — so nothing currently runs. No git, no node_modules.

## Preconditions
None — first task. Everything sits flat in the repo root (see `_SHARED.md` file map for the "before" state).

## Steps
1. **Toolchain check**: `node --version` / `npm --version`. If Node is missing, install LTS: `winget install OpenJS.NodeJS.LTS`, then use a fresh shell (or full path to node) for the rest.
2. **git init** in the repo root. Create `.gitignore`:
   ```
   node_modules/
   dist/
   *.log
   ```
3. **Restructure** (moves, no code edits):
   - `burn.js` → `src/burn.js`
   - `browser-entry.js` → `src/browser-entry.js`
   - `burn.test.js` → `test/burn.test.js`
   - `bitcoinburned-homepage (3).html` → `design/homepage.html`  ← Joe's chosen design, source of truth
   - `bitcoinburned-homepage (4).html` → `design/archive/homepage-v4-unused.html`  ← superseded draft; archive, do NOT delete
   - `cli.js`, `index.html`, `package.json`, `README.md`, `LICENSE` stay in root for now (task-02 moves `index.html`).
4. `npm install` (commit the generated `package-lock.json`).
5. **Gates**:
   - `node test/burn.test.js` → every line `PASS`, exit code 0.
   - `node cli.js --help` prints usage.
   - CLI smoke: `node cli.js --txid <64×'a'> --vout 0 --value 150000 --address bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4 --fee 300 --message "smoke"` → prints a base64 PSBT (that address is the BIP-173 test vector; this is unsigned math only, nothing goes near a network).
6. **README sanity**: its "Project layout" section should now be true. Fix any path drift (e.g. it says `src/burn.js`, good; adjust the `browser-entry.js` line spacing typo if present). Don't rewrite the README beyond accuracy.
7. Commit: `task-01: repo layout, deps installed, tests green`.

## Do NOT
- Edit any logic in `src/burn.js` / `cli.js` / tests.
- Touch `index.html` content.
- Delete either homepage draft.

## Exit criteria
- `node test/burn.test.js` fully green; CLI help + smoke run work.
- Folder matches the `_SHARED.md` file map (minus `tool/` and `scripts/`, which come later).
- First git commit exists. STATUS table updated. Joe told: safe to `/clear`, next = task-02.
