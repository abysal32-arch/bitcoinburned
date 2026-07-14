# task-07 — Live registry balances via mempool.space (progressive enhancement)

## Goal
The homepage says balances are "live, public, and verifiable" — make that true. On load, fetch real totals for the five registry addresses; on ANY failure, the static numbers from task-05 remain untouched. This is the only external network call the site is allowed to make, ever.

## Preconditions
tasks 01–06 done. Each `.addr-card` carries `data-address="…"` (added in task-05; if missing, add now and note it in the STATUS table).

## Design (decided — implement as stated)
- API: `https://mempool.space/api/address/{addr}` → use `chain_stats.funded_txo_sum` (sats received all-time; matches the cards' "received all-time" label) and `chain_stats.tx_count`. mempool.space serves CORS-open responses; verify once in the browser console before wiring.
- Genesis card: show received-total like the others (its label says "held / tribute" — keep the static label text, update only the number).
- Chancecoin/any card task-05 left number-less: only update it if the card has an amount element to update — don't invent UI.

## Steps
1. Small inline `<script>` at the end of root `index.html` (vanilla, no deps):
   - For each `[data-address]` card: `fetch` with a ~5 s `AbortController` timeout → format sats to BTC (thousands separators, ≤1 decimal for large values, e.g. `2,130 BTC`; keep the leading `~`) → write into the card's `.amt`; update the small `.note`/`.lbl` area with `live · mempool.space` and tx count where the static card showed one.
   - Failures (network down, non-200, JSON shape change, `file://` CORS block): silently keep static content; a single `console.debug` is fine, nothing user-visible.
   - Fire after `DOMContentLoaded`; the page must be fully readable before/without JS.
2. Add one footer-adjacent mono line: balances refresh live from mempool.space when the site is online; otherwise figures are approximate snapshots.
3. Reconcile: if live values differ wildly from task-05's static text (e.g. >2× off), update the static fallbacks and note it in `tasks/task-05/SOURCES.md` as a dated addendum.
4. **Gates**:
   - Online: all five cards show live values within a few seconds; numbers plausible vs SOURCES.md.
   - Offline/blocked: cards show the static values, no visible errors, layout identical.
   - No other new external requests (Preview network tab: only mempool.space).
   - `node test/burn.test.js` green.
5. Commit: `task-07: live registry balances with static fallback`.

## Do NOT
- Add an API call to the TOOL page — the tool stays 100 % offline-capable, that's a trust property.
- Add API keys, proxies, or any dependency.
- Let a fetch failure alter the page.

## Exit criteria
Live-when-online, static-when-not, tool page untouched by networking; tests green; commit + STATUS updated; Joe told: safe to `/clear`, next = task-08 (has a Joe checkpoint — GitHub auth).
