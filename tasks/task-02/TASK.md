# task-02 — Provable-burn proof + final live-browser QA 🧑‍🤝‍🧑JOE(faucet + Chrome ext)

## Goal
Prove the whole pipeline with real (testnet) money — build a burn PSBT on the deployed
site, sign + broadcast it with a wallet we control, and watch the coins become provably
unspendable on a public explorer — and clear the three QA items that need a real, focused
browser. This is the end-to-end proof the launch announce points at.

Independent of task-01: the burn can be built on **staging or the live domain** (identical
bytes), so this can run while DNS propagates. Prefer the live domain if it's already up.

## Hard rules
- **testnet4 ONLY.** Every node command runs against the testnet4 node. If anything would
  touch mainnet, stop.
- Never copy any wallet/credential into this repo. `PROOF.md` holds only public chain data.
- Do NOT skip the decode-and-eyeball step before broadcasting.

## Preconditions / already set up (see `_SHARED.md` → Testnet4 infra)
- bitcoind v29.4.0, testnet4 SYNCED, RPC 48332 cookie; `bitcoin-cli.exe` full path known.
- Dedicated Core wallet **`bitcoinburned-burn`** (loaded). Receive
  `tb1qr82u5h86epepnxlvx5me2njkhs8pufjhfmhzfp`, change `tb1qrd4qaa2y53fwc6tevndflggdvwtts3umungyaf`.

## Joe checkpoints
1. **Faucet:** fund the receive address with ≥ ~20,000 sats testnet4 (needs 1 confirmation).
   Any testnet4 faucet, e.g. https://mempool.space/testnet4/faucet.
2. **Chrome extension online** — required to build on the deployed page + finish the QA items.

## Steps
1. **Confirm the UTXO:** `bitcoin-cli … -rpcwallet=bitcoinburned-burn listunspent 1` → pick the
   confirmed UTXO (txid/vout/value ≥ ~20,000 sats).
2. **Deferred live-browser QA (via Chrome ext on the deployed site)** — record pass/fail:
   - Copy-PSBT button shows "Copied" and the clipboard actually holds the PSBT (headless
     couldn't confirm this — `NotAllowedError: document not focused`).
   - Homepage live balances populate on the real origin; only external call is mempool.space.
   - Save `tool/index.html` locally, open it via `file://`, build the vector — still works
     offline (proven transitively already: zero-network + inlined bundle; this is the literal check).
3. **Build the burn ON THE DEPLOYED SITE** (`…/tool/`, live domain preferred, else staging):
   network=testnet, the UTXO's txid/vout/value, address = the receive addr above, **partial
   burn** ~5,000–10,000 sats, change → the change addr above, fee ~500 sats (check
   `estimatesmartfee 6`; testnet4 ≈ 1 sat/vB), message: `bitcoinburned.com launch proof`. Copy the PSBT.
4. **Sign + broadcast via Core:**
   - `walletprocesspsbt <b64>` → expect `complete:true`; `finalizepsbt` → raw hex.
   - **EYEBALL** `decoderawtransaction <hex>`: exactly the outputs intended — the OP_RETURN
     (burn value + message hex `6a1e626974636f696e6275726e65642e636f6d206c61756e63682070726f6f66`)
     + the change output back to our address.
   - `sendrawtransaction <hex> 0.0001` — 2nd arg is `maxburnamount` (BTC); set just above the
     burn amount, never blanket-huge. Core refuses value-into-OP_RETURN without it.
5. **Verify publicly** on https://mempool.space/testnet4: OP_RETURN output shows the burned sats
   + message. After ≥1 confirmation write `tasks/task-02/PROOF.md`: txid, explorer link, amount
   burned, message, block height, date.
6. Fix anything QA surfaced (rebuild via `npm run build:tool` + re-check the vector if `src/`
   changed). Commit `task-02: testnet4 burn proof + live-browser QA`.

## Exit criteria
`PROOF.md` with a confirmed testnet4 burn txid built by the deployed site; the three deferred
QA items pass (or fixed); STATUS updated with the txid; Joe told: safe to `/clear`, next = task-03.
