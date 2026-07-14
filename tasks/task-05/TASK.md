# task-05 — Homepage content: fact-check the registry, legal/privacy copy

## Goal
Every factual claim on the homepage must be verified or reworded before launch — this page makes checkable statements about real addresses and history. Model note: this is a RESEARCH-heavy task (Sonnet HIGH per policy), with small HTML edits at the end.

## Preconditions
tasks 01–04 done. Work only on root `index.html`; `design/homepage.html` stays frozen.

## Steps
1. **Web-search-verify each registry card** (use current block-explorer data — mempool.space/blockstream.info — plus reputable histories). Record every claim → source URL → verdict in `tasks/task-05/SOURCES.md`:
   - Genesis `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa`: "~100 BTC" received-total; "Jan 3 2009"; the stuck-coinbase explanation.
   - Counterparty `1CounterpartyXXXXXXXXXXXXXXXUWLpVr`: "~2,130 BTC", "Jan 2014", proof-of-burn framing.
   - Chancecoin `1ChancecoinXXXXXXXXXXXXXXXXXZELUFD`: the card currently says amount "large" — replace with a real approximate figure + year, or reword the card so no number is implied.
   - Null address `1111111111111111111114oLvT2`: "~510 BTC", "256k+ txns", Blockstack usage, and the "107 BTC across five synchronized transactions, May 2026" claim — verify this event specifically; if it can't be sourced, cut it.
   - Bitcoin Eater `1BitcoinEaterAddressDontSendf59kuE`: "~13.3 BTC", "400+ txns", mid-2010s.
   - Sanity-check ALL five address strings character-by-character against sources — a typo'd burn address on a burn site is the worst possible bug.
2. **Verify the OP_RETURN policy claim** (README + homepage): "80-byte relay default, raised substantially as of Core v30" — confirm current status and align wording in both places.
3. **Balance wording**: numbers stay approximate + dated — task-07 makes them live. Add `data-address="…"` and keep the static amount text as-is on each `.addr-card` (task-07 will hook these).
4. **Legal/privacy copy** (keep it tight, no new pages):
   - Footer already has "Not financial advice; burning is irreversible" — extend the footer line with: MIT-licensed, fully client-side, **no analytics or tracking**, no keys ever.
   - In the honesty callout or footer, one sentence: nothing on this site is an inducement to burn; verify everything independently.
5. **Gates**: every number/date/name on the page appears in `SOURCES.md` with a source or was removed; homepage still renders cleanly; `node test/burn.test.js` green (should be untouched).
6. Commit: `task-05: registry fact-check + legal/privacy copy`.

## Do NOT
- Change layout/styling (content and small markup attributes only).
- Leave any unverifiable claim in place "because it sounds right".

## Exit criteria
`SOURCES.md` covers every claim; addresses char-checked; no unsourced numbers remain; commit + STATUS updated; Joe told: safe to `/clear`, next = task-06.
