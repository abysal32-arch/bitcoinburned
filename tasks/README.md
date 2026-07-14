# bitcoinburned — launch tasks (round 1)

Goal: **bitcoinburned.com live**, homepage per Joe's chosen design (`design/homepage.html` after task-01), with the OP_RETURN burn tool working end-to-end. Ten tasks, each ~1/10 of the launch. Each is self-contained: Joe `/clear`s after each one; the next session boots from `CLAUDE.md` → this file → `_SHARED.md` → its own `TASK.md`.

## How to work a task

1. Find the first ⬜ row below — that's the current task.
2. Read `_SHARED.md` + `task-NN/TASK.md`. Nothing else.
3. Execute in the main session. Gates green → commit → update this table → tell Joe safe to `/clear`.

## STATUS

| # | Task | Status | Commit | Result / notes for next task |
|---|------|--------|--------|------------------------------|
| 01 | Repo foundation: layout fix, tests green, git init | ⬜ | — | — |
| 02 | Site restructure: homepage at root, tool at /tool/ | ⬜ | — | — |
| 03 | Reproducible build: bundle → tool page in one command | ⬜ | — | — |
| 04 | Tool page: brand header/footer + validation UX | ⬜ | — | — |
| 05 | Homepage content: fact-check registry, legal/privacy copy | ⬜ | — | — |
| 06 | Assets: favicon, OG/social, self-hosted fonts, SEO, a11y | ⬜ | — | — |
| 07 | Live registry balances via mempool.space (with fallback) | ⬜ | — | — |
| 08 | GitHub repo + Pages staging deploy 🧑‍🤝‍🧑JOE | ⬜ | — | — |
| 09 | Full QA + REAL testnet4 burn proof 🧑‍🤝‍🧑JOE(maybe) | ⬜ | — | — |
| 10 | bitcoinburned.com go-live + v1.0.0 tag 🧑‍🤝‍🧑JOE | ⬜ | — | — |

🧑‍🤝‍🧑JOE = task contains a checkpoint that needs Joe (auth, DNS, possibly faucet). Everything else runs unattended.

Dependencies are strictly linear: task N assumes 1..N-1 are done and trusts their exit criteria. If you find a prior task's exit criteria untrue, fix that first and note it in this table.
