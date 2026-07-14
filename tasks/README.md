# bitcoinburned — launch tasks (round 1)

Goal: **bitcoinburned.com live**, homepage per Joe's chosen design (`design/homepage.html` after task-01), with the OP_RETURN burn tool working end-to-end. Ten tasks, each ~1/10 of the launch. Each is self-contained: Joe `/clear`s after each one; the next session boots from `CLAUDE.md` → this file → `_SHARED.md` → its own `TASK.md`.

## How to work a task

1. Find the first ⬜ row below — that's the current task.
2. Read `_SHARED.md` + `task-NN/TASK.md`. Nothing else.
3. Execute in the main session. Gates green → commit → update this table → tell Joe safe to `/clear`.

## STATUS

| # | Task | Status | Commit | Result / notes for next task |
|---|------|--------|--------|------------------------------|
| 01 | Repo foundation: layout fix, tests green, git init | ✅ | 39a0f03 | Node 24.18.0 LTS installed via winget (fresh shells have it on PATH). Layout matches _SHARED.md map; 9/9 tests PASS; CLI help + smoke OK; README layout section fixed. esbuild 0.28.1 works (`npx esbuild`) despite an npm allow-scripts postinstall warning — task-03 unblocked. |
| 02 | Site restructure: homepage at root, tool at /tool/ | ✅ | d07d0ba | Two-page site works both directions; PSBT vector at task-02/psbt-vector.txt (browser output = CLI output, byte-identical). FIXED pre-existing bug: browser Build always threw "Buffer is not defined" (src/burn.js:119,121 use the Node Buffer global; bundle has no polyfill) — tool/index.html now has a minimal Buffer.from shim in its own `<script>` BEFORE the bundle. Task-03: rebundle must keep the shim working or fix burn.js to be browser-native (TextEncoder/Uint8Array) and drop it; verify against the vector. |
| 03 | Reproducible build: bundle → tool page in one command | ✅ | 557a3a7 | `npm run build:tool` (scripts/build-tool.js: esbuild JS API → splice between BUNDLE:START/END markers in tool/index.html; exits non-zero unless each marker appears exactly once). Fresh bundle byte-identical to task-02's; vector PSBT reproduced exactly in the browser; repeat runs idempotent (same sha256); 9/9 tests. Buffer shim kept, outside the markers. PRE-EXISTING bug for task-04's UX pass: certificate's "OP_RETURN script (hex)" renders comma-separated decimals ("106,5,115,...") instead of hex — the shim's Buffer.from returns a plain Uint8Array, so the bundle's .toString('hex') falls back to Uint8Array.prototype.toString; PSBT itself is unaffected (vector matches). |
| 04 | Tool page: brand header/footer + validation UX | ✅ | 6686df7 | Brand bar (ink/seal recolor) + registry link + footer link; per-field pre-build validation incl. address↔network prefix check + 500-byte message block; fee>50% warning (non-blocking); irreversibility line; 375px clean (cert rows wrap/break-all). FIXED task-03's cert hex bug: shim's Buffer.from now returns a Uint8Array subclass with toString('hex'). Vector PSBT still byte-exact; 9/9 tests. NOTE for task-09 QA: Copy-PSBT couldn't be end-to-end verified headless (clipboard permission denied in preview; code unchanged since task-02) — click it once in a real browser. |
| 05 | Homepage content: fact-check registry, legal/privacy copy | ✅ | 6b88abb | Every registry claim verified vs blockstream.info + mempool.space (2026-07-14) and recorded in `task-05/SOURCES.md`. All 5 address strings char-verified vs canonical list + both explorer APIs (displayed string === new `data-address` attr, added to every `.addr-card` for task-07 to hook). Corrections: genesis `~100→~57 BTC` "sent as tribute" (+50 BTC stuck reward noted; API funded_txo_sum excludes the unindexed genesis coinbase — **task-07 will read ~57, not ~107**); Chancecoin `large→~480 BTC` (+dropped unverifiable "overwhelming majority" superlative); null `~510→~808 BTC`, `256k→259k+ txns`; eater `~13.3→~13.4 BTC`, `400→5,600+ txns` (blockchain.com's 424 is a stale cache — Esplora/mempool = 5,600), `mid-2010s→2014`; Counterparty "During January 2014→In early 2014" (burn ran Jan 2–Feb 3 2014). Registry intro no longer claims balances are "live" (they're static till task-07). Footer + honesty callout gained the legal/privacy copy (MIT, fully client-side, no analytics/tracking/keys; "not an inducement, verify independently"). OP_RETURN Core-v30 claim confirmed accurate — README unchanged, homepage makes no relay-size claim. 9/9 tests green (untouched). |
| 06 | Assets: favicon, OG/social, self-hosted fonts, SEO, a11y | ⬜ | — | — |
| 07 | Live registry balances via mempool.space (with fallback) | ⬜ | — | — |
| 08 | GitHub repo + Pages staging deploy 🧑‍🤝‍🧑JOE | ⬜ | — | — |
| 09 | Full QA + REAL testnet4 burn proof 🧑‍🤝‍🧑JOE(maybe) | ⬜ | — | — |
| 10 | bitcoinburned.com go-live + v1.0.0 tag 🧑‍🤝‍🧑JOE | ⬜ | — | — |

🧑‍🤝‍🧑JOE = task contains a checkpoint that needs Joe (auth, DNS, possibly faucet). Everything else runs unattended.

Dependencies are strictly linear: task N assumes 1..N-1 are done and trusts their exit criteria. If you find a prior task's exit criteria untrue, fix that first and note it in this table.
