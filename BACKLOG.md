# BACKLOG — post-launch

Not part of the launch. Seeds for after v1.0.0 is live. Nothing here should be started
before launch; the site shipping is the deliverable.

## Tool
- **Legacy input support (`1…` P2PKH, `3…` P2SH-wrapped).** These need the *entire* previous
  transaction (`nonWitnessUtxo`) attached to the PSBT, not just the witness UTXO. Currently
  out of scope (native SegWit / Taproot only). Adding it means fetching/attaching prev-txs and
  clear UX for the extra input.
- **Fee-estimator deep link.** The fee is a flat number the user supplies (intentionally — no
  guessed vsize). A "check current fees ↗" link to a testnet/mainnet fee estimator would help
  without the tool guessing.
- **Copy-PSBT UX polish.** Confirm the "Copied" affordance across browsers; consider a download-.psbt
  option for wallets that import files rather than base64.

## Registry
- **Submitted-address triage.** The homepage footer links an issue template
  (`.github/ISSUE_TEMPLATE/burn-address.yml`). Define acceptance criteria (provable burn:
  OP_RETURN or a well-documented unspendable pattern; notability; independent verification)
  before adding any card.
- **Periodic re-verification of registry figures.** Balances are live via mempool.space, but the
  static fallback numbers and the historical claims (dates, amounts, tx counts) should be
  re-checked periodically against the explorers (audit trail was in the round-1 task-05 sources,
  preserved in `git log`).

## Site
- **Optional testnet faucet / how-to-burn guide page.** A short walkthrough (get a UTXO, build,
  sign in Sparrow/Electrum, broadcast) would lower the barrier — kept separate from the tool so
  the tool page stays zero-dependency and zero-network. The **broadcast caveat** it was meant to
  carry has since been written up properly and now ships on the tool page + README (2026-07-16),
  so the guide only needs to link it, not re-derive it.

### Broadcast reality — resolved 2026-07-15/16, keep this straight
The original note here claimed "most GUI wallets broadcast it fine." **That was false**, and it
was the most load-bearing wrong sentence in the repo. Corrected understanding:
- `maxburnamount` is the **3rd** arg of `sendrawtransaction` (default `0.00`), not the 2nd.
  `tasks/task-02/TASK.md` recorded it as the 2nd, so the command as written could never have
  produced the testnet4 proof — the working invocation was documented nowhere. Now recorded in
  `tasks/task-02/PROOF.md` and `README.md`.
- mempool.space, Blockstream/esplora and ElectrumX/Fulcrum all call `sendrawtransaction`
  hex-only, so **every public push endpoint rejects a value-carrying OP_RETURN** — and
  Sparrow/Electrum inherit that via their Electrum server. `maxburnamount` also cannot be set
  in `bitcoin.conf` (bitcoin/bitcoin#29217), so a friendly node config can't rescue it either.
- Trezor/Ledger firmware refuse to **sign** an OP_RETURN output with a nonzero amount.
- It is a client-side RPC guard, **not a relay rule** — one node accepting it is enough; the
  network then relays and mines it normally.

**Open product question (the real one):** the tool builds a valid transaction that most of its
users cannot broadcast, because broadcasting needs your own Core node and a command line. The
tool page and README now say so plainly, but that is a disclosure, not a fix. Worth deciding
whether v2 does anything about it.

**Unverified, worth testing before writing any guidance:**
- Will Sparrow *sign* a value-carrying OP_RETURN (separate from broadcasting it)? Unknown.
- Do miner-direct submission paths (ViaBTC's broadcast form, Marathon Slipstream) accept one?
  They bypass the normal RPC path, so they plausibly might. Untested.
- Bitcoin Knots' `datacarriersize` default (42 vs 83) and its 2026 node share; also whether
  Knots' bare-datacarrier rule rejects a **full** burn (an OP_RETURN with no other monetary
  output) at any size. If true, that is an independent reason to prefer partial mode.
- **Custom-domain hygiene.** After go-live, confirm the `www` → apex redirect and re-run an OG
  link-preview check (the `og:image` renders on social unfurls). *(go-live 2026-07-15: both
  verified — www/http → apex 301s, og:image 200.)*
- **HTTPS / cert-renewal watch.** A few weeks post-launch, re-confirm `Enforce HTTPS` is still on
  and the GitHub Pages certificate auto-renewed (GitHub handles renewal — worth one check).
  Current cert expires 2026-10-13.
- **Add `/favicon.ico`.** The site declares an SVG favicon that modern browsers use, but
  `/favicon.ico` 404s on the legacy fallback request. Harmless, but a tiny static `favicon.ico`
  would silence it. (Found during go-live QA, 2026-07-15.)
