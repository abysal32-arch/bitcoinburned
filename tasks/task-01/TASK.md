# task-01 — Domain cutover: bitcoinburned.com live (HTTPS) 🧑‍🤝‍🧑JOE(DNS)

## Goal
Point the real domain Joe owns at the Pages site and serve it at
**https://bitcoinburned.com** with HTTPS enforced. This is the launch.

## Why this can't be one unattended step
Setting the custom domain makes Pages **301-redirect** the `github.io/bitcoinburned/`
URL to `bitcoinburned.com`. If DNS isn't resolving yet, the site is unreachable at
*both* URLs until it propagates. So the order is strict: **Joe sets DNS first**, confirm
it resolves, *then* commit the `CNAME` / set the custom domain. Start DNS early — apex
propagation + Pages cert issuance can take minutes to a few hours.

## Joe checkpoint — DNS (needs his registrar login)
Give Joe these exact records for **bitcoinburned.com** (verified against GitHub Pages docs
2026-07-15 — re-check if it's been a while; they change rarely):
- Apex `A` records → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- (optional but recommended) Apex `AAAA` → `2606:50c0:8000::153`, `2606:50c0:8001::153`,
  `2606:50c0:8002::153`, `2606:50c0:8003::153`
- `www` `CNAME` → `abysal32-arch.github.io.`
- Canonical choice: **apex canonical, `www` redirects** (default). Ask Joe if he prefers www.

Wait for Joe to confirm the records are saved, then verify resolution before cutover:
`nslookup bitcoinburned.com` (expect the four A IPs) and `nslookup www.bitcoinburned.com`.

## Steps (after DNS resolves)
1. Add a `CNAME` file at the repo **root** containing exactly one line: `bitcoinburned.com`
   (no scheme, no trailing slash). Commit + push. In the repo's Pages settings, set the custom
   domain to `bitcoinburned.com` and let the DNS check pass. (`gh.exe` for API; UI is fine too.)
2. Enable **Enforce HTTPS** once the cert provisions (poll — it can lag the DNS check by minutes–hours).
3. **Confirm** (do not change) the absolute URLs now resolve on-domain: `sitemap.xml`,
   `robots.txt` sitemap pointer, and both pages' `canonical`/`og:url`/`og:image`. They were
   authored as `https://bitcoinburned.com/...` and become correct now.
4. **Live gate — everything on https://bitcoinburned.com:**
   - Homepage + tool both 200; assets 200; **zero 404**; HTTPS lock, no mixed content.
   - Internal links (relative) work from domain root; `www.bitcoinburned.com` → apex redirect.
   - Homepage: live mempool.space balances populate; only external call is mempool.space.
   - Tool: still ZERO third-party requests; console clean on both pages.
   - `404.html` served on an unknown path.
5. Update STATUS (commit hash, live-confirmed notes). Commit `task-01: go-live — custom domain + HTTPS`.

## Do NOT
- Commit the `CNAME` / set the custom domain **before** DNS resolves (it takes staging down).
- Touch site content or the inlined bundle — this task is domain/DNS only.

## Exit criteria
https://bitcoinburned.com serves both pages with **Enforce HTTPS** on; `www` redirects to apex;
live gate green (zero-404, no mixed content, homepage balances live, tool zero-network); `CNAME`
committed; STATUS updated; Joe told which URL is canonical. → task-03 can tag once task-02's proof exists.
