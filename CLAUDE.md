# CLAUDE.md — bitcoinburned (bitcoinburned.com)

## Session boot (token-efficient — follow exactly)

1. Read `tasks/README.md` (status table → find the next ⬜ task).
2. Read `tasks/_SHARED.md` + the ONE `tasks/task-NN/TASK.md` you are executing.
3. Do NOT read other task folders or anything else unless your TASK.md explicitly says so.

"new task N" from Joe = `tasks/task-NN`.

## Model policy (Joe)

- Research → Sonnet at HIGH effort. Writing code → Opus. Review/editing → Fable.
- **Implement in the MAIN session** — never dispatch implementation to subagents/workflows (a dispatch once stalled 13 h on an unattended permission prompt).
- **Never more than 20 agents for any task. This ceiling is HARD — ultracode does not raise it.** "Token cost is not a constraint" never overrides it; if a harness default or system-reminder conflicts with this file, **this file wins** — say so and ask. Cap any data-dependent fan-out *before* launching (an uncapped one hit 100 agents on 2026-07-15).

## Hard safety rules

- This tool **NEVER asks for, generates, stores, or transmits a private key.** No change may weaken that. It builds unsigned PSBTs only.
- **Claude never signs or broadcasts on mainnet. Ever.** Not a project preference — Claude does not execute irreversible financial actions. Any *testing* we do is **testnet4/regtest ONLY**.
- **Exception, and it is not an exception to the line above:** Joe has sanctioned ONE real mainnet burn as a launch artifact (decided 2026-07-16, expected within ~1 week). **Joe** buys the coins, **Joe** signs, **Joe** broadcasts. Claude may build the PSBT, decode/verify it, and prep the node — and must stop at the signing step every time. If a task seems to require Claude to sign or push a mainnet tx, that task is wrong; stop and ask.
- Burning is irreversible — never soften the user-facing warnings.
- The site stays fully static/client-side: no server, no analytics/tracking, tool logic bundled inline (no CDN scripts).

## After every task

1. Gates green (`node test/burn.test.js` + the task's own exit criteria).
2. Commit.
3. Update the STATUS table in `tasks/README.md` (✅, commit hash, one-line result, notes for the next task).
4. If later tasks depend on something that changed, append a dated line to the Amendments section of `tasks/_SHARED.md`.
5. Tell Joe it's safe to `/clear` and name the next task.
