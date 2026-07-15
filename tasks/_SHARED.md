# _SHARED.md — context every task session must know

## What this project is

**bitcoinburned.com** — a static, open-source (MIT) site with two pages:

1. **Homepage** (`/`): registry of well-known BTC burn addresses + pitch for the tool. Joe's chosen design is `design/homepage.html` (dark charcoal/ember theme, Space Grotesk + IBM Plex fonts, sections: nav / hero / lore / honesty-callout / #addresses registry (5 cards) / #tool OP_RETURN explainer / #how diff-grid / footer).
2. **Burn tool** (`/tool/`): the existing "Provable Burn" single-file app (paper-certificate look, Newsreader font) — a 3-step form that builds an **unsigned PSBT** burning BTC into an OP_RETURN output. Fully client-side; bitcoinjs-lib bundle is inlined in the HTML (~290 KB, one `<script>`).

Core logic: `src/burn.js` → `buildBurnPsbt(opts)` (networks: mainnet/testnet/regtest; full or partial burn; optional UTF-8 message; returns `{psbtBase64, burnAmount, changeAmount, opReturnScriptHex}`). Wrapped for browser by `src/browser-entry.js` (exposes `window.BurnTool`), for terminal by `cli.js`. Tests: `test/burn.test.js` (plain node asserts, no network). Only bc1q/bc1p (segwit/taproot) inputs supported — legacy needs `nonWitnessUtxo`, deliberately out of v1 scope.

## Hard invariants (violating any of these = stop and tell Joe)

- **NEVER touch private keys.** The tool builds unsigned PSBTs only. No feature may ask for, generate, store, or transmit a key.
- **Real transactions by us: testnet4/regtest ONLY.** Never sign/broadcast mainnet. (The tool *produces* mainnet PSBTs for users — that's its purpose — but we never execute one.)
- **Irreversibility warnings stay.** Copy edits must preserve or strengthen them.
- **Fully static + private.** No server, no analytics, no tracking, no CDN-loaded logic. Both pages must work from `file://` offline (fonts become self-hosted in task-06).

## File map (target state after task-02; before task-01 everything is flat in the repo root)

```
index.html            homepage (from design/homepage.html)
tool/index.html       the burn tool app (was root index.html)
src/burn.js           core PSBT logic
src/browser-entry.js  browser wrapper
test/burn.test.js     tests — `node test/burn.test.js`, all must PASS
cli.js                CLI (requires ./src/burn)
scripts/              build scripts (from task-03)
design/homepage.html  Joe's chosen homepage design (source of truth for look)
design/archive/       superseded drafts — never load these
tasks/                this system
```

## Commands / environment

- Windows 10, PowerShell + Git Bash. Node.js required (task-01 verifies/installs, LTS via winget).
- `npm install` once per clone; `node test/burn.test.js` = the test gate (all lines `PASS`, exit code 0).
- Rebuild browser bundle (from task-03): `npm run build:tool` (esbuild → splice into `tool/index.html` between `<!-- BUNDLE:START/END -->` markers). Never hand-edit the bundle line.
- Git: repo lives in this folder (task-01 inits it). Short imperative commit subjects, prefix `task-NN:`.
- Local preview: both pages work via `file://`; the Claude Preview tools or `npx serve .` also work.

## External resources (task-09 only)

Testnet4 infra from Joe's other project (paths outside this repo, TESTNET-ONLY credentials, NEVER commit anything from there):
- Synced node datadir: `C:\Users\Joe\Desktop\swap key\testnet-data` (RPC port 48332, cookie auth).
- Binaries: `C:\Users\Joe\Desktop\swap key\tools\bitcoin-29.4\bin\` (`bitcoind.exe`, `bitcoin-cli.exe`) — invoke by full path, not on PATH.
- Wallets: `C:\Users\Joe\Desktop\swap key\testnet-wallets\`.
- Explorer: https://mempool.space/testnet4

## Wrap-up protocol (every task)

1. Task's exit criteria verified + `node test/burn.test.js` green.
2. Commit (`task-NN: …`).
3. Update STATUS table in `tasks/README.md`: ✅, commit hash, one-line result, anything the next task must know.
4. If a fact in THIS file changed, append to Amendments below (dated, one line) — don't rewrite sections.
5. Tell Joe: safe to `/clear`, next task is task-NN+1 (name it).

## Amendments (append-only)

- 2026-07-14 (task-02): `tool/index.html` has a small `Buffer.from` shim `<script>` immediately before the bundle `<script>` — the bundled `src/burn.js` calls the Node `Buffer` global (lines 119/121), which doesn't exist in browsers (Build previously always threw). Any rebundle (task-03+) must either keep the shim ahead of the bundle or make `burn.js` browser-native and remove it; `tasks/task-02/psbt-vector.txt` is the regression vector.
- 2026-07-14 (task-02): Node is at `C:\Program Files\nodejs\` (machine PATH); if a session's shell has a stale PATH, invoke `node.exe`/`npx.cmd` by full path.
- 2026-07-14 (task-04): the Buffer shim in `tool/index.html` now returns a Uint8Array subclass (`BufferLike`) with `toString('hex')` — required for the certificate's OP_RETURN hex display. Same placement rule as before: shim stays in its own `<script>` BEFORE the bundle, outside the BUNDLE markers.
- 2026-07-14 (task-06): Fonts are now SELF-HOSTED in `assets/fonts/` (latin-subset woff2: 7 files + `LICENSE-NOTES.md`, all SIL OFL 1.1). Both pages' Google Fonts `<link>`s are gone, replaced by `@font-face` with relative paths (variable files carry weight-range descriptors; IBM Plex Mono is static per-weight). The site now makes **ZERO third-party requests** (verified via preview network tab on both pages) — do NOT re-introduce any CDN/Google Fonts.
- 2026-07-14 (task-06): New sitewide files: `assets/{favicon.svg, apple-touch-icon.png (180²), og-image.png (1200×630)}`, `robots.txt`, `sitemap.xml`, `404.html`. OG/canonical/sitemap use ABSOLUTE `https://bitcoinburned.com/…` (final domain from day one) — **task-08 must deploy at that exact domain** (Pages custom domain) or these URLs point off-site. `404.html` uses root-absolute asset paths so Pages can serve it at any path depth. PNG generators kept (throwaway) in `tasks/task-06/`: `og-card.html`, `render-icon.html`.
- 2026-07-14 (task-06): A11y — homepage `--muted-dim` bumped `#6E665D`→`#8D8377` (was 3.22:1 on charcoal, now ≥4.5:1 AA on charcoal/card/deep); homepage brand-mark got `aria-hidden="true"` + `a/button:focus-visible` outline; tool `#message` textarea got a `.visually-hidden <label>` (it was the one unlabeled input). NOT changed: tool `--brass` (#8C6D3F, 3.74:1 on paper) fails AA but is used only for decorative micro-labels/pill-borders/focus outlines — left as-is (out of task-06's homepage-scoped contrast item; flag for a future polish pass).
- 2026-07-14 (task-07): The homepage (`index.html`) now makes **exactly one** external request — a live-balance GET to `https://mempool.space/api/address/{addr}` for each of the 5 registry cards (inline vanilla `<script>`, progressive enhancement, ~5s `AbortController`, silent static fallback on any failure). This is the ONLY third-party call the site is permitted to make. The `/tool/` page still makes **ZERO** network requests — its full offline capability is a trust property; **never add a network call to the tool.** task-06's "zero third-party requests" now carries this single sanctioned exception on the **homepage only** — task-09 QA should expect exactly `mempool.space` and nothing else (no Google/CDN/analytics). Endpoint confirmed CORS-open (`access-control-allow-origin: *`); the display rule is thousands-separators + ≤1 decimal (0 decimals for ≥100 BTC).
- 2026-07-15 (task-08): Repo is PUBLISHED — **github.com/abysal32-arch/bitcoinburned** (public, MIT; GitHub account `abysal32-arch`). Live staging: **https://abysal32-arch.github.io/bitcoinburned/** (GitHub Pages, deploy-from-branch `main`/root, `.nojekyll`, HTTPS-enforced, NO CSP header so inline scripts run). Default branch is now `main` (renamed from `master`). `gh` CLI is at `C:\Program Files\GitHub CLI\gh.exe` — installed + authed, but **NOT on the shell PATH; invoke by full path.** The absolute `https://bitcoinburned.com/` URLs in OG/canonical/sitemap and the root-absolute asset paths in `404.html` are correct for the FINAL domain but point off-subpath during github.io staging — **task-10 (custom domain) resolves this; expected during staging, not a regression.** task-09 QA note: the Chrome-in-Chrome extension was offline this whole session, so the literal in-browser PSBT-vector Build was NOT clicked on the live site — verified transitively instead (served tool page byte-identical to the repo blob + `cli.js` reproduces the vector byte-exact, and task-02 established CLI output === browser output). Homepage still makes exactly ONE 3rd-party call (mempool.space); `/tool/` still ZERO.
