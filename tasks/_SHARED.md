# _SHARED.md — context every launch-round task must know

## What this project is
**bitcoinburned.com** — a static, open-source (MIT) two-page site:
1. **Homepage** (`/` = `index.html`): registry of well-known BTC burn addresses + pitch for the tool.
2. **Burn tool** (`/tool/` = `tool/index.html`): a single-file client-side app that builds an
   **unsigned PSBT** burning BTC into an `OP_RETURN` output. The bitcoinjs-lib bundle is inlined
   in the HTML (one `<script>`, spliced between `BUNDLE:START/END`). Core logic: `src/burn.js`
   → `buildBurnPsbt()`; browser wrapper `src/browser-entry.js` (`window.BurnTool`); CLI `cli.js`.

## Hard invariants (violating any = stop and tell Joe)
- **NEVER touch private keys.** The tool builds unsigned PSBTs only.
- **Real transactions by us: testnet4/regtest ONLY.** Never sign/broadcast mainnet.
- **Irreversibility warnings stay.** Copy edits preserve or strengthen them.
- **Fully static + private.** No server, no analytics/tracking, no CDN-loaded logic.
  - The **homepage** makes **exactly one** external call: live balances from `mempool.space`
    (5 GETs, silent static fallback). The **tool page makes ZERO network requests** — its full
    offline capability is a trust property. **Never add a network call to the tool.**

## Current deployed state (as of round-2 start, 2026-07-15)
- Repo: **github.com/abysal32-arch/bitcoinburned** (public, MIT), default branch **main**.
- Live staging: **https://abysal32-arch.github.io/bitcoinburned/** (Pages, deploy-from-branch
  main/root, `.nojekyll`, HTTPS, no CSP). Both pages + assets 200, zero-404 (task-08).
- **Absolute URLs already point at `https://bitcoinburned.com/`** — canonical, `og:url`,
  `og:image`, `twitter:image` (both pages), `sitemap.xml`, `robots.txt` sitemap pointer.
  They are OFF-domain on staging (expected) and become CORRECT the instant DNS resolves —
  **confirm, don't change** (verified 2026-07-15).
- `package.json` version is already **1.0.0**. No `CNAME` file yet (add it during cutover).
- Regression vector: **`test/psbt-vector.txt`** (mainnet full burn, txid 64×a, vout 0,
  value 150000, fee 300, msg "smoke" → known PSBT). CLI and the in-browser Build both reproduce
  it byte-identical.

## Commands / environment
- Windows 10, PowerShell. A fresh shell's PATH is often stale:
  - Node: `C:\Program Files\nodejs\node.exe` (invoke by full path if `node` is not found).
  - GitHub CLI: `C:\Program Files\GitHub CLI\gh.exe` (authed as `abysal32-arch`; NOT on PATH).
- Test gate: `node test/burn.test.js` (must be 9/9 PASS, exit 0).
- Rebuild the inlined bundle only if `src/` changes: `npm run build:tool` (esbuild → splice
  between the BUNDLE markers; deterministic/idempotent). Never hand-edit the bundle line.

## Testnet4 infra (task-02 only — the burn proof)
Lives OUTSIDE this repo. **TESTNET-ONLY; never commit any wallet/credential here.**
`PROOF.md` may contain only public chain data (txid/address/etc.).
- Node: bitcoind v29.4.0, testnet4, SYNCED. RPC `127.0.0.1:48332`, cookie auth.
  - cli: `C:\Users\Joe\Desktop\swap key\tools\bitcoin-29.4\bin\bitcoin-cli.exe`
  - datadir: `C:\Users\Joe\Desktop\swap key\testnet-data` (invoke `-testnet4 -datadir=... -rpcport=48332`)
- **Dedicated Core wallet `bitcoinburned-burn`** (descriptor, testnet4, in the node's default
  walletdir — already created + loaded):
  - receive/UTXO address: `tb1qr82u5h86epepnxlvx5me2njkhs8pufjhfmhzfp`
  - change address:       `tb1qrd4qaa2y53fwc6tevndflggdvwtts3umungyaf`
  - The `swap key\testnet-wallets\walletA|B` are SwapKey-format wallets earmarked for a
    different project — **DO NOT spend them.** Use `bitcoinburned-burn` only.
- Explorer: <https://mempool.space/testnet4>

## Local QA browser (optional, for re-verification)
Claude Preview config `bitcoinburned-static` (port 3111) serves the repo root and mirrors
Pages routing. For live-domain / real-clipboard / on-domain-balance checks, use the **Chrome
extension** on the live site (the headless preview denies clipboard and blocks `file://`).

## Wrap-up protocol (every task)
1. Exit criteria verified + `node test/burn.test.js` green + working tree clean.
2. Commit (`task-NN: …`, imperative subject).
3. Update the STATUS table in `README.md`: ✅, commit hash, one-line result + notes for next task.
4. If a fact here changed, append a dated line to Amendments below (don't rewrite sections).
5. Tell Joe: safe to `/clear`, and name the next task.

## Amendments (append-only)
- 2026-07-15 (round-2 open): round-1 folders 01–10 removed; regression vector moved to
  `test/psbt-vector.txt`; pre-launch QA recorded in commit `573f3cc`. Launch round = 3 tasks.
