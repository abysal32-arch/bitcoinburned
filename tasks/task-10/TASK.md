# task-10 — bitcoinburned.com go-live + v1.0.0 🧑‍🤝‍🧑JOE

## Goal
Point the real domain at the site, run the final gate on the live domain, and tag v1.0.0. LAUNCH.

## Preconditions
tasks 01–09 done, including a confirmed testnet burn proof (`tasks/task-09/PROOF.md`). Staging URL healthy.

## Joe checkpoint (DNS — needs his registrar login)
Give Joe these exact records for bitcoinburned.com's DNS panel, then wait for him to confirm:
- Apex `A` records → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (verify these against GitHub's current Pages docs before sending — they change rarely but check).
- `www` `CNAME` → `<user>.github.io.`
Ask which of apex vs `www` he wants canonical (default: apex canonical, www redirects).

## Steps
1. After Joe sets DNS: in the repo, add `CNAME` file containing `bitcoinburned.com`; set the custom domain in Pages settings; wait for DNS check to pass; enable **Enforce HTTPS** (cert issuance can take a few minutes–hours; poll).
2. Because the site moves from `/bitcoinburned/` subpath to domain root: internal links are relative (safe by design), but re-verify `robots.txt` sitemap pointer, `sitemap.xml`, and OG `og:url`/`og:image` absolute URLs — they were written as `https://bitcoinburned.com/...` in task-06, so they become CORRECT now; confirm rather than change.
3. **Final gate — all on https://bitcoinburned.com**:
   - `node test/burn.test.js` green locally; working tree clean.
   - Homepage + tool full click-through; PSBT vector byte-identical on the live domain; live balances working; favicon/OG (test a link preview via an OG checker or by fetching the meta); 404 page serves; `www` → canonical redirect; HTTPS lock, no mixed content.
   - Console + network clean on both pages; the only external call is mempool.space on the homepage.
4. **Tag & tidy**: README gets the live URL at top + the testnet proof txid as a "verified end-to-end" line; `git tag v1.0.0` + push tag.
5. Write `BACKLOG.md` (repo root) seeding post-launch work: legacy (P2PKH/P2SH) input support via `nonWitnessUtxo`; fee-estimator deep link; handling submitted registry addresses (issue triage criteria); periodic re-verification of registry figures; optional testnet faucet guide page.
6. Commit (`task-10: go-live — bitcoinburned.com, v1.0.0`) and push.
7. **Tell Joe it's LIVE** — include: the URL, the v1.0.0 tag, the proof txid, and a short optional announce blurb he can post (2–3 sentences, factual, includes "never touches your private key").

## Do NOT
- Start backlog items — launch is the deliverable.
- Delete the staging config or rewrite history.

## Exit criteria
https://bitcoinburned.com serves the site with HTTPS enforced; final gate green; v1.0.0 tagged; BACKLOG.md exists; STATUS table fully ✅ ×10; Joe told the site is live. Round 1 complete — future work = new task round or backlog picks.
