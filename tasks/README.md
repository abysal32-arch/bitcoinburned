# bitcoinburned — launch round

**Round 1 (build → staging) shipped.** 10 tasks: repo published, live staging at
<https://abysal32-arch.github.io/bitcoinburned/>, tool proven correct (test suite +
byte-identical PSBT vector built in a real browser), full pre-launch QA green. The
round-1 task folders were removed after completion — their history is in `git log`
(the last QA record is commit `573f3cc`; the regression vector now lives at
`test/psbt-vector.txt`).

**Round 2 = go live on bitcoinburned.com — Joe owns the domain. Target: tomorrow.**
Three tasks. Two need a Joe checkpoint (registrar DNS; faucet + Chrome extension);
everything else runs unattended.

**Round 2 is complete and its task folders have been removed** (2026-07-15), following the
round-1 precedent — the instruction sheets were scaffolding for finished work and survive in
`git log`. What remains is the durable record: this STATUS table, `_SHARED.md`, and
`task-02/PROOF.md` (the burn proof + the exact `sendrawtransaction` invocation).

## How to work a task
1. Find the first ⬜ row below — that's the current task. If every row is ✅, there is no open
   task; ask Joe rather than inventing one.
2. Read `_SHARED.md` + `task-NN/TASK.md`. Nothing else.
3. Execute in the **main session** (never dispatch to subagents — a past dispatch stalled
   13 h on an unattended prompt). Gates green → commit → update this table → tell Joe.

## STATUS
| # | Task | Status | Commit | Result / notes for next task |
|---|------|--------|--------|------------------------------|
| 01 | Domain cutover — bitcoinburned.com live w/ HTTPS 🧑‍🤝‍🧑JOE(DNS) | ✅ | `56576ec` | **Live: https://bitcoinburned.com**, Enforce HTTPS on (cert exp 2026-10-13, covers apex+www). www→apex 301, http→https 301; both pages 200, 0 broken assets, no mixed content; canonical/OG/sitemap/robots all on-domain; og-image + custom 404 serve; homepage mempool.space API healthy; tool zero-network (no fetch/XHR). External hosts = mempool.space (data) + github.com (link) only. **Canonical = apex.** Deferred to task-02: browser-runtime QA (clipboard copy, DOM balance render, file:// offline). BACKLOG nit: no /favicon.ico (svg icon declared; harmless legacy-fallback 404). |
| 02 | Provable-burn proof + final live-browser QA 🧑‍🤝‍🧑JOE(faucet + Chrome ext) | ✅ | `f9e1397` | **Burn confirmed** block 144246, [txid `d689fcbf…d4e0d519`](https://mempool.space/testnet4/tx/d689fcbfb8c14eaa8b023a27d2ce8bbc22c73bd459900c14ac44b9ecd4e0d519): 8,000 sats → OP_RETURN nulldata (`gettxout` vout0 = null → not in UTXO set), 191,181 change, fee 1,500. Built on the **deployed** `/tool/`. All 3 live-browser QA PASS (Copy→clipboard exact PSBT; homepage balances live, only mempool.space external, fonts self-hosted; tool build zero-network). Test gate 9/9. Full record: `tasks/task-02/PROOF.md`. **task-03 now unblocked** — has the proof txid. |
| 04 | **Real mainnet burn** 🧑‍🤝‍🧑JOE(buys + signs + broadcasts) | ⬜ | — | **Sanctioned 2026-07-16, expected ~1 week.** Full procedure: `task-04-mainnet-burn/RUNBOOK.md` — read that, not this cell. Headlines: **use Core v31.1, NOT the v29.4 binary** (v29.4 only knows snapshots 840k/880k; v31.1 knows 935k → 23k blocks to grind vs 78k). Broadcasting works *during* background validation — only the snapshot→tip sync gates it. **Blocked on Joe buying BTC** (none held); the node sync is free wall-clock, so start it anyway. ~20k sats, dedicated bc1q UTXO, **full mode** (Joe's call — fewer fields to typo, leaves no UTXO; Knots won't relay it but Core will and it confirms), fee ~500 sats (overpay deliberately — full mode has no CPFP escape), message **≤40 bytes**. **Claude never signs or broadcasts — stop at step 12.** |
| 03 | v1.0.0 release + launch wrap (tag, BACKLOG, announce) | ✅ | `653a009` | **LAUNCHED.** README swapped to live-v1.0.0 + [proof txid](https://mempool.space/testnet4/tx/d689fcbfb8c14eaa8b023a27d2ce8bbc22c73bd459900c14ac44b9ecd4e0d519); BACKLOG updated (cert-watch, favicon, broadcast caveat); tag `v1.0.0` pushed; [GitHub release](https://github.com/abysal32-arch/bitcoinburned/releases/tag/v1.0.0) published. Announce blurbs handed to Joe (his to post). **All 3 tasks done — bitcoinburned.com is live.** |

🧑‍🤝‍🧑JOE = task has a checkpoint that needs Joe (registrar DNS / testnet faucet / Chrome extension).

**Ordering:** start **01** first thing (DNS propagation takes time — get Joe's records set
early). **02** does not depend on the custom domain (the burn can be built on staging or the
live domain — identical bytes), so it can run in parallel while DNS propagates. **03** is last:
it needs 01 live **and** 02's proof txid.

Dependencies are linear only where noted; if a prior task's exit criteria turn out untrue,
fix that first and note it here.
