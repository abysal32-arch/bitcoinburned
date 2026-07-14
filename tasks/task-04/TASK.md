# task-04 — Tool page: brand header/footer + validation UX

## Goal
Make `tool/index.html` feel like part of bitcoinburned.com and make its form fail helpfully instead of cryptically. **Design decision (made — don't relitigate): the tool KEEPS its paper-certificate look** as a deliberate contrast to the dark homepage; we add brand chrome, not a restyle.

## Preconditions
tasks 01–03 done. `npm run build:tool` exists (needed only if you touch `src/`). Homepage brand elements to mirror live in root `index.html` (`.brand-mark` fire tile + `bitcoin`/`burned` two-tone wordmark).

## Steps
1. **Brand chrome** on the tool page (replacing task-02's temporary back-link):
   - Slim header: the 🔥 brand mark + `bitcoinburned` wordmark (recolor to fit the paper palette — e.g. ink/seal tones — don't import the dark theme), linking to `../`. Right side: a mono link "burn address registry" → `../#addresses`.
   - Footer: add "part of bitcoinburned.com" link; keep the existing MIT/client-side lines.
2. **Validation UX** — in the page's form-wiring script (the readable second `<script>`), validate BEFORE calling `window.BurnTool.buildBurnPsbt` and show specific messages in the existing `#error-box`:
   - txid: exactly 64 hex chars.
   - vout ≥ 0 integer; value ≥ 1 integer; fee ≥ 0 integer — each with its own message when empty/NaN.
   - Address↔network mismatch pre-check: prefix `bc1` ↔ mainnet, `tb1` ↔ testnet, `bcrt1` ↔ regtest; mismatch → clear message naming both.
   - Partial mode: burn-amount and change-address required, with per-field messages.
   - Fee sanity: if fee > 50% of input value, still allow it but prepend a bold warning line to the result area ("fee is more than half the input — double-check this is intentional").
   - Message: byte-counter already counts UTF-8; also block Build if > 500 **bytes** (maxlength=500 counts chars, so multi-byte text can exceed it).
3. **Irreversibility framing**: directly above the Build button add one short red/seal-toned line: burning is permanent; the PSBT is inert until signed in YOUR wallet. Keep it to one sentence — the page already explains the model.
4. **Mobile pass**: at 375 px width, form fields, mode toggle, certificate block and PSBT textarea must not overflow. Fix with CSS only.
5. **Gates** (browser, Preview tools or manual):
   - Each validation path above triggers its specific message; a fully valid form still builds the exact PSBT from `tasks/task-02/psbt-vector.txt`.
   - Copy-PSBT button still works; page still works offline from `file://`.
   - If you touched `src/` (you shouldn't need to): `npm run build:tool` + vector check.
   - `node test/burn.test.js` green.
6. Commit: `task-04: tool page branding + input validation UX`.

## Do NOT
- Change `buildBurnPsbt`'s behavior or error strings in `src/burn.js` — browser-side validation is additive, the library guards stay as the last line of defense.
- Weaken any warning copy.

## Exit criteria
Branded, navigable tool page; every bad-input path gives a specific human message; vector still matches; mobile clean; tests green; commit + STATUS updated; Joe told: safe to `/clear`, next = task-05.
