# task-09 — Full QA + a REAL testnet4 burn proof 🧑‍🤝‍🧑JOE(maybe)

## Goal
Prove the whole pipeline with real (testnet) money: use the LIVE staging site to build a burn PSBT, sign it with a wallet we control, broadcast it, and watch the coins become provably unspendable on a public explorer. Plus a full manual QA sweep. This is the launch gate — task-10 does not start until this proof exists.

## Hard rules
- **testnet4 ONLY.** Every command below runs against the testnet4 node. If anything would touch mainnet, stop.
- Credentials/wallets under `swap key\testnet-wallets\` are TESTNET-ONLY and must never be committed to this repo (they live outside it — keep it that way). PROOF.md may contain the txid/address (public chain data), nothing else.

## Preconditions
task-08 done: staging URL live (see STATUS notes). Testnet infra per `_SHARED.md` External resources: node datadir `C:\Users\Joe\Desktop\swap key\testnet-data` (RPC 48332, cookie), `bitcoin-cli.exe` at `C:\Users\Joe\Desktop\swap key\tools\bitcoin-29.4\bin\`, wallets at `C:\Users\Joe\Desktop\swap key\testnet-wallets\`.

## Steps
1. **QA sweep on staging** — record results in `tasks/task-09/QA.md` (pass/fail per line):
   - Desktop + 375 px mobile viewport, both pages: layout, nav, anchors, back-links.
   - Tool: every validation path from task-04; vector PSBT byte-identical; copy button; offline behavior of the tool page (save locally, open `file://`, still builds).
   - Homepage: live balances on/offline behavior; console free of errors; all footer/issue-template links resolve.
2. **Node up**: start bitcoind if not running (`-testnet4 -datadir="C:\Users\Joe\Desktop\swap key\testnet-data"`), wait for sync tip. Load a wallet from `testnet-wallets\`; `listunspent` for a spendable UTXO ≥ ~20,000 sats.
   - **Joe checkpoint (only if empty)**: if no spendable UTXO exists, give Joe a fresh receive address and ask him to hit a testnet4 faucet (or wait if funds are pending maturity); park the task until confirmed.
3. **Build the burn ON THE LIVE STAGING SITE** (this is the point — the deployed page, not local code): network=testnet, the real UTXO's txid/vout/value/address, **partial burn** of ~5,000–10,000 sats, change back to our own fresh address, fee ~500–1,000 sats (check current testnet4 conditions), message: `bitcoinburned.com launch proof`.
4. **Sign & broadcast via Core**:
   - `walletprocesspsbt <base64>` → check `complete:true`; `finalizepsbt` → raw hex.
   - Decode and EYEBALL it first (`decoderawtransaction`): exactly the outputs you intended — OP_RETURN output carrying the burn value + your change output.
   - `sendrawtransaction <hex> 0.1` — the **second arg is `maxburnamount` in BTC**: Core refuses to broadcast value-into-OP_RETURN without it (anti-footgun default 0). Set it just above the burn amount, never blanket-huge.
5. **Verify publicly**: find the txid on https://mempool.space/testnet4 — confirm the OP_RETURN output shows the burned sats + message hex. After ≥1 confirmation, write `tasks/task-09/PROOF.md`: txid, explorer link, amount burned, message, block height, date.
6. **Fix anything QA or the burn surfaced** (copy errors, validation gaps, staging quirks). Rebuild via `npm run build:tool` if `src/` changed + re-check vector. Commit + push (`task-09: QA sweep + testnet4 burn proof`).

## Do NOT
- Broadcast anything on mainnet, ever.
- Skip the decode-and-eyeball step before broadcasting.
- Copy any wallet file or credential into this repo.

## Exit criteria
QA.md complete and green (or fixed); PROOF.md with a confirmed testnet4 burn txid built by the live site; fixes committed; STATUS updated; Joe told: safe to `/clear`, next = task-10 (needs him for DNS).
