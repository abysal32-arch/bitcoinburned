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
  the tool page stays zero-dependency and zero-network. Include the **broadcast caveat**: sending
  value into an OP_RETURN trips Core's `sendrawtransaction` burn guard (needs `maxburnamount`);
  most GUI wallets broadcast it fine, but a note saves confusion.
- **Custom-domain hygiene.** After go-live, confirm the `www` → apex redirect and re-run an OG
  link-preview check (the `og:image` renders on social unfurls). *(go-live 2026-07-15: both
  verified — www/http → apex 301s, og:image 200.)*
- **HTTPS / cert-renewal watch.** A few weeks post-launch, re-confirm `Enforce HTTPS` is still on
  and the GitHub Pages certificate auto-renewed (GitHub handles renewal — worth one check).
  Current cert expires 2026-10-13.
- **Add `/favicon.ico`.** The site declares an SVG favicon that modern browsers use, but
  `/favicon.ico` 404s on the legacy fallback request. Harmless, but a tiny static `favicon.ico`
  would silence it. (Found during go-live QA, 2026-07-15.)
