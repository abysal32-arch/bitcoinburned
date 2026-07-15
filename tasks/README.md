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

## How to work a task
1. Find the first ⬜ row below — that's the current task.
2. Read `_SHARED.md` + `task-NN/TASK.md`. Nothing else.
3. Execute in the **main session** (never dispatch to subagents — a past dispatch stalled
   13 h on an unattended prompt). Gates green → commit → update this table → tell Joe.

## STATUS
| # | Task | Status | Commit | Result / notes for next task |
|---|------|--------|--------|------------------------------|
| 01 | Domain cutover — bitcoinburned.com live w/ HTTPS 🧑‍🤝‍🧑JOE(DNS) | ✅ | `56576ec` | **Live: https://bitcoinburned.com**, Enforce HTTPS on (cert exp 2026-10-13, covers apex+www). www→apex 301, http→https 301; both pages 200, 0 broken assets, no mixed content; canonical/OG/sitemap/robots all on-domain; og-image + custom 404 serve; homepage mempool.space API healthy; tool zero-network (no fetch/XHR). External hosts = mempool.space (data) + github.com (link) only. **Canonical = apex.** Deferred to task-02: browser-runtime QA (clipboard copy, DOM balance render, file:// offline). BACKLOG nit: no /favicon.ico (svg icon declared; harmless legacy-fallback 404). |
| 02 | Provable-burn proof + final live-browser QA 🧑‍🤝‍🧑JOE(faucet + Chrome ext) | ⬜ | — | — |
| 03 | v1.0.0 release + launch wrap (tag, BACKLOG, announce) | ⬜ | — | — |

🧑‍🤝‍🧑JOE = task has a checkpoint that needs Joe (registrar DNS / testnet faucet / Chrome extension).

**Ordering:** start **01** first thing (DNS propagation takes time — get Joe's records set
early). **02** does not depend on the custom domain (the burn can be built on staging or the
live domain — identical bytes), so it can run in parallel while DNS propagates. **03** is last:
it needs 01 live **and** 02's proof txid.

Dependencies are linear only where noted; if a prior task's exit criteria turn out untrue,
fix that first and note it here.
