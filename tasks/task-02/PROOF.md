# task-02 — testnet4 burn proof

Built by the **deployed** bitcoinburned.com tool, signed + broadcast externally, and
provably destroyed on testnet4. Public chain data only — no wallet material.

- **Network:** testnet4
- **txid:** `d689fcbfb8c14eaa8b023a27d2ce8bbc22c73bd459900c14ac44b9ecd4e0d519`
- **Explorer:** <https://mempool.space/testnet4/tx/d689fcbfb8c14eaa8b023a27d2ce8bbc22c73bd459900c14ac44b9ecd4e0d519>
- **Amount burned:** 8,000 sats into OP_RETURN (type `nulldata`, provably unspendable)
- **Message:** `bitcoinburned.com launch proof`
  (OP_RETURN script `6a1e626974636f696e6275726e65642e636f6d206c61756e63682070726f6f66`)
- **Change returned:** 191,181 sats → `tb1qrd4qaa2y53fwc6tevndflggdvwtts3umungyaf`
- **Fee:** 1,500 sats (≈9.9 sat/vB over 151 vB)
- **Block height:** 144246   **Block hash:** `0000000000000000ee002888b27a8e435952a8c22507c3f74db3a3203b25b33c`
- **Date:** 2026-07-15
- **Built on:** <https://bitcoinburned.com/tool/> (live custom domain, in a real browser)

## On-chain proof of destruction
- `gettxout <txid> 0` → **null** — the burn output is **not in the UTXO set**; it was pruned
  as provably-unspendable at block validation. The 8,000 sats are removed from the spendable
  supply, verifiable by anyone against any node or explorer (no trust in the tool required).
- `gettxout <txid> 1` → present (191,181 sats change), confirming only the OP_RETURN output
  was destroyed and nothing else.

## Pipeline (each step independently verified)
1. **Built on the deployed tool** at `bitcoinburned.com/tool/`: network testnet, partial burn,
   UTXO `318bd665…:0` (200,681 sats), burn 8,000, change to the change addr, fee 1,500,
   message as above.
2. **Decoded through the node** (`decodepsbt`): vout[0] OP_RETURN 8,000 sats `6a1e…70726f6f66`
   nulldata; vout[1] 191,181 sats change; fee 1,500; exactly two outputs.
3. **Signed + finalized externally** in Bitcoin Core (`walletprocesspsbt` → `finalizepsbt`,
   complete). The tool never touched a key.
4. **Broadcast** (`testmempoolaccept` allowed → `sendrawtransaction` with `maxburnamount`),
   propagated to mempool.space, then confirmed in block 144246.

## Broadcasting a burn — the exact invocation (verified against Core v29.4)

Recorded here because it is the single non-obvious step and the only one with no second chance.

```
sendrawtransaction "hexstring" ( maxfeerate maxburnamount )
  2. maxfeerate      (optional, default "0.10")  BTC/kvB
  3. maxburnamount   (optional, default "0.00")  BTC — rejects provably-unspendable outputs above this
```

`maxburnamount` is the **THIRD** argument, not the second, and it defaults to `0.00` — so a
value-carrying OP_RETURN is rejected unless it is passed explicitly. Use the order-proof form:

```
bitcoin-cli -named sendrawtransaction hexstring=<hex> maxburnamount=0.0001
```

Set `maxburnamount` just above the intended burn — never blanket-large; it is the last guard
between a typo and a real loss. It cannot be set in `bitcoin.conf` (bitcoin/bitcoin#29217).

Two traps:
- `testmempoolaccept` takes **no** `maxburnamount` argument, so it reports `allowed: true` for a
  burn that `sendrawtransaction` then rejects. It is not a green light.
- The guard is a **client-side RPC check, not a relay rule**. Once the tx is accepted by your own
  node it propagates and confirms normally. Third-party push endpoints (mempool.space,
  blockstream.info) call `sendrawtransaction` hex-only and therefore **cannot** broadcast a burn.
  If a push is refused, the transaction is correct — the pusher is refusing. Do not "fix" the
  transaction.

## Deferred live-browser QA (deployed site, real Chrome) — all PASS
- [x] **Copy-PSBT → clipboard holds the PSBT** — clicking *Copy PSBT* calls
  `clipboard.writeText` with the exact 228-char PSBT (byte-identical to the built output).
- [x] **Homepage live balances populate on the real origin; only external call = mempool.space**
  — a fresh load made 11 requests: the page document, 5 `mempool.space/api/address/…` GETs,
  and 5 **self-hosted** fonts (no CDN). Balances rendered live (e.g. 13.4 BTC / 2,130 BTC),
  zero stuck loading states.
- [x] **Tool build makes zero network requests** — a network-traced rebuild on `/tool/`
  produced **0** requests, directly demonstrating the build runs fully offline. (Substitutes
  for the literal `file://` open, which the headless preview blocks; the zero-network trace is
  the stronger evidence and the page is a single self-contained file.)
