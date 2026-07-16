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

### Knots datacarrier — RESOLVED 2026-07-16, verified at the shipped tag
The 42-vs-83 question is answered, and the answer inverted our guidance twice. Verified at
`bitcoinknots/bitcoin` tag `v29.3.knots20260508` (latest release), `src/policy/policy.h`:
- **`MAX_OP_RETURN_RELAY = 83`** — i.e. **80 bytes of payload** (the whole *script* is measured;
  overhead is +2 up to a 75-byte payload, +3 from 76). The source comment says so itself: *"80
  bytes of data, +1 for OP_RETURN, +2 for the pushdata opcodes."* **42 was correct until
  v29.2.knots20251110 (Nov 2025)** — anyone quoting 42 today is ~8 months stale. Release notes
  call 83 *"temporary… will be reverted back to 42 in a future version"*, so it has an expiry.
- **`DEFAULT_PERMITBAREDATACARRIER{false}`** — ⚠ **the finding that actually matters.** Knots
  rejects any tx with no monetary output (`bare-datacarrier` in `policy.cpp`). **A full burn is
  exactly that**, at any message size, even empty — and putting value on the OP_RETURN does NOT
  help, because NULL_DATA outputs never increment `n_monetary`. A change output fixes it. Core
  has no such rule. The tool now warns on the full-burn option.
- **`DEFAULT_ACCEPT_DATACARRIER = true`** — "Knots blocks OP_RETURN entirely" is folklore.
- Core v30+ (v31.1 current) defaults `datacarriersize` to ~100,000 (uncapped) and permits
  multiple OP_RETURN outputs; Knots still allows only one (`multi-op-return`).

**Still unverified, worth testing before writing any guidance:**
- Will Sparrow *sign* a value-carrying OP_RETURN (separate from broadcasting it)? Unknown.
- Do miner-direct submission paths (ViaBTC's broadcast form, Marathon Slipstream) accept one?
  They bypass the normal RPC path, so they plausibly might. Untested.
- Knots' node share (~22.7%) / Knots-templated hashrate (~3.9%, OCEAN): single crawler, not
  cross-checked, and reachable-node share ≠ relay-path share. **Do not put magnitudes in copy.**
- **Custom-domain hygiene.** After go-live, confirm the `www` → apex redirect and re-run an OG
  link-preview check (the `og:image` renders on social unfurls). *(go-live 2026-07-15: both
  verified — www/http → apex 301s, og:image 200.)*
- **HTTPS / cert-renewal watch.** A few weeks post-launch, re-confirm `Enforce HTTPS` is still on
  and the GitHub Pages certificate auto-renewed (GitHub handles renewal — worth one check).
  Current cert expires 2026-10-13.
- **Add `/favicon.ico`.** The site declares an SVG favicon that modern browsers use, but
  `/favicon.ico` 404s on the legacy fallback request. Harmless, but a tiny static `favicon.ico`
  would silence it. (Found during go-live QA, 2026-07-15.)
