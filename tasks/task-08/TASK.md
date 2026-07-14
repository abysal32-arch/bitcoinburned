# task-08 — GitHub repo + Pages staging deploy 🧑‍🤝‍🧑JOE

## Goal
The project goes public: GitHub repo pushed, GitHub Pages serving a staging URL, and all the `TODO(task-08)` links filled. The custom domain comes later (task-10) — this task ends with a working `https://<user>.github.io/bitcoinburned/` site.

## Joe checkpoint (do FIRST, then everything else runs unattended)
Run `gh auth status`. If not authenticated, stop and ask Joe to run `gh auth login` (browser flow). Also confirm with Joe, in one message: repo name **bitcoinburned** (default), **public**, under his personal account. Hosting default is **GitHub Pages** (free, static, custom-domain + HTTPS); if Joe prefers Cloudflare Pages/Netlify say so now — swapping later is cheap but task-10's DNS steps assume GitHub.

## Preconditions
tasks 01–07 done, working tree clean, tests green. Site uses only relative internal URLs (task-02) — required because Pages staging serves from a subpath.

## Steps
1. `gh repo create bitcoinburned --public --source . --push` (description: "Provably destroy bitcoin via OP_RETURN — unsigned PSBTs only, never touches a key. bitcoinburned.com"). Add topics: `bitcoin`, `op-return`, `psbt`, `burn`.
2. Add `.nojekyll` (root). Enable Pages: deploy from branch `main`, root (`gh api` or repo Settings). Note: the whole repo is served — that's intended, it's open source; verify nothing sensitive exists in-tree (there shouldn't be — no keys anywhere, per invariants).
3. **Fill the deferred links** (search the tree for `TODO(task-08)`):
   - Homepage footer "GitHub" → repo URL.
   - Homepage footer "Submit an address" → `<repo>/issues/new?template=burn-address.yml`; create `.github/ISSUE_TEMPLATE/burn-address.yml` (fields: address, why it's a burn address, sources, approx amount) plus a default-off blank-issue config.
   - Tool page "view source" link: replace the JS `alert` with a real link to the repo (keep the "this page IS the app, Ctrl+U works" sentence as its `title` tooltip or adjacent text).
4. README: add the staging URL, a "Status: pre-launch" line, and the `npm run build:tool` dev workflow (already documented in task-03 — just verify).
5. Push. Wait for Pages build (poll `gh api repos/{owner}/bitcoinburned/pages/builds/latest` until `built`).
6. **Gates** (against the LIVE staging URL, in a real browser via Preview/Chrome tools):
   - Homepage renders correctly under the `/bitcoinburned/` subpath: fonts load (self-hosted paths are relative — verify), favicon shows, live balances fetch, every link works including into `tool/`.
   - Tool page: build the `tasks/task-02/psbt-vector.txt` vector on the live site → byte-identical PSBT.
   - No mixed-content or 404s in the network tab.
7. Commit anything changed (`task-08: publish repo, Pages staging, real links`) and push.

## Do NOT
- Configure the custom domain yet (task-10, after QA).
- Force-push or rewrite history.

## Exit criteria
Public repo; staging URL fully functional including the PSBT vector check; no TODO(task-08) markers left in the tree; STATUS updated **with the staging URL in the notes column**; Joe told: safe to `/clear`, next = task-09 (may need a faucet top-up from him).
