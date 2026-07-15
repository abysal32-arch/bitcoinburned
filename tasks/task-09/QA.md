# task-09 — QA sweep results

**Date:** 2026-07-15
**Target under test:** the task-08 deploy — repo commit on `main`, live at
`https://abysal32-arch.github.io/bitcoinburned/`.

## How this was tested (and why it's representative of staging)

- **Code gate:** `node test/burn.test.js` + a CLI vector reproduction, run directly.
- **Browser QA:** driven with a headless Chromium (Claude Preview) against a local
  static server that serves the repo files verbatim (mirrors GitHub Pages routing:
  dir→`index.html`, unknown→`404.html`, correct MIME). Task-08 already proved the
  **served staging page is byte-identical to the repo blob** (sha256), so
  local-serve == repo == staging for every page checked here.
- **Staging reachability:** both pages fetched live over HTTPS (200, correct titles/content).
- **Environment note:** the Chrome-in-Chrome extension was **offline** this session, so
  three items that genuinely require a focused, live-origin browser are split out below
  under "Deferred to the live-browser pass" — none is a code defect; each is a tooling
  limitation carried over from task-04/task-08.

Legend: ✅ pass · ⏳ deferred to live-browser pass · ⛔ blocked on Joe

---

## 1. Code gate
| Check | Result |
|---|---|
| `node test/burn.test.js` (9 checks) | ✅ 9/9 PASS, exit 0 |
| CLI reproduces task-02 vector PSBT byte-identical | ✅ MATCH (mainnet full burn, txid 64×a, vout 0, value 150000, fee 300, msg "smoke") |
| Vector burn amount / OP_RETURN hex | ✅ 149,700 sats · `6a05736d6f6b65` |

## 2. Staging reachability (live HTTPS)
| Check | Result |
|---|---|
| Homepage `/` HTTP 200, title, 5 registry addresses, all sections | ✅ |
| Tool `/tool/` HTTP 200, title "Burn Tool — bitcoinburned.com", full form | ✅ |
| Issue template the footer deep-links exists (`.github/ISSUE_TEMPLATE/burn-address.yml`) | ✅ (+ `config.yml` disables blank issues) |

## 3. Homepage — desktop + 375px mobile
| Check | Result |
|---|---|
| Loads; title `bitcoinburned.com — Provably Destroyed bitcoin`; h1 present | ✅ |
| 5 `.addr-card`s, all 5 `data-address` values correct | ✅ |
| Nav: 3 anchors (Burn Addresses/Burn Tool/How It Works) + "Burn BTC →" to `tool/` | ✅ |
| Anchor targets `#addresses` `#tool` `#how` all exist | ✅ |
| Footer links resolve: GitHub repo, Registry (`#addresses`), Burn Tool (`#tool`), Submit-an-address (issue template) | ✅ |
| Irreversibility / "no known key ≠ no key possible" copy present | ✅ |
| Head assets: `favicon.svg`, `apple-touch-icon.png`, `og:image`, canonical | ✅ (canonical/og point at final `bitcoinburned.com` — resolves at task-10) |
| Console clean (no logs/warnings/errors) | ✅ |
| Desktop: no horizontal overflow | ✅ |
| 375px mobile: no horizontal overflow, all 5 cards visible, nav present | ✅ |

## 4. Homepage — live balances (network)
| Check | Result |
|---|---|
| Exactly the 5 sanctioned `mempool.space/api/address/*` calls, all 200 | ✅ |
| **Zero** other third-party (no Google/CDN/analytics/tracking) | ✅ (only mempool.space + local self-hosted fonts + the doc) |
| Live balances populate: ~57.2 / ~2,131 / ~480 / ~808 / ~13.4 BTC | ✅ (success path — this preview is not network-sandboxed, unlike task-07's env) |
| Exactly one `live · mempool.space` marker per updated card; one footer note (no dupes) | ✅ |
| Silent static fallback on fetch failure | ✅ verified in task-07 (sandboxed abort → static numbers); success path verified here. Static numbers are the HTML default that the script only overwrites on success, so failure ⇒ static by construction. |

## 5. Tool page — layout & load (desktop + 375px mobile)
| Check | Result |
|---|---|
| Loads; title correct; all 9 form fields present | ✅ |
| `window.BurnTool.buildBurnPsbt` present (bundle + Buffer shim working) | ✅ |
| Back-links all point home (`../`, `../#addresses`) | ✅ |
| Desktop + 375px mobile: no horizontal overflow | ✅ |
| **Zero network requests to any third party** (doc + local fonts only; no mempool.space) | ✅ — offline-trust invariant intact |
| Console clean | ✅ |

## 6. Tool page — build correctness (in a real browser)
| Check | Result |
|---|---|
| **Vector build clicked in-browser → PSBT byte-identical to task-02 vector** | ✅ (closes the task-08 gap where Build was never clicked in a browser) |
| Certificate shows burn 149,700 sats; OP_RETURN hex `6a05736d6f6b65` (renders as hex, not comma-decimals) | ✅ (task-03/04 cert-hex bug stays fixed) |
| Testnet build w/ our receive addr + "bitcoinburned.com launch proof" | ✅ burn 19,500 (20000−500); OP_RETURN `6a1e…` decodes to the message (30 bytes) — dry-run of the real burn |

## 7. Tool page — validation matrix (task-04). Each shows the correct field-specific error and suppresses the certificate.
| # | Case | Result |
|---|---|---|
| A | txid empty | ✅ "Transaction ID is required…" |
| B | txid too short (3 chars) | ✅ "…exactly 64 hex characters … this one is 3 characters." |
| C | txid 64 non-hex | ✅ "…64 characters and contains non-hex characters." |
| D | vout empty | ✅ "Output index (vout) is required…" |
| E | vout negative | ✅ "…whole number (digits only), at least 0." |
| F | value empty | ✅ "Value is required…" |
| G | value 0 | ✅ "Value must be at least 1." |
| H | address empty | ✅ "Address is required…" |
| I | address legacy (P2PKH) | ✅ "…native SegWit or Taproot bech32 … legacy addresses are not supported in v1." |
| J | address↔network mismatch (bc1 + testnet) | ✅ "Address ↔ network mismatch … starts with \"bc1\" (mainnet) but … testnet." |
| K | partial: burn-amount empty | ✅ "Amount to burn is required…" |
| L | partial: change-address empty | ✅ "Change address is required for a partial burn…" |
| M | partial: change-address legacy | ✅ "Change address must be native SegWit or Taproot bech32…" |
| N | partial: change↔network mismatch | ✅ "Change address ↔ network mismatch … starts with \"tb1\" (testnet) but … mainnet." |
| O | fee empty | ✅ "Network fee is required…" |
| P | fee negative | ✅ "Network fee must be a whole number … at least 0." |
| Q | message > 500 bytes | ✅ "Message is 501 bytes … the limit is 500 bytes…" |

## 8. Tool page — non-blocking warnings (build still succeeds)
| Check | Result |
|---|---|
| fee > ½ input → `fee-warning` shown, still builds | ✅ (value 150000 / fee 80000 → burn 70,000) |
| message > 80 bytes (≤500) → relay-policy note + warn styling, still builds | ✅ |
| valid partial burn → change computed | ✅ (150000 − 50000 − 300 → change 99,700) |

## 9. 404
| Check | Result |
|---|---|
| Unknown path → HTTP 404, branded page, back-home link | ✅ |

---

## Deferred to the live-browser pass (needs the Chrome extension online — NOT code defects)
| ⏳ Item | Why deferred |
|---|---|
| Copy-PSBT "Copied" feedback + real clipboard write | Headless preview denies clipboard to an unfocused document (`NotAllowedError: Document is not focused`). Button click throws no error and exercises the `execCommand` fallback; the visible "Copied" confirmation needs a focused real browser. Same limitation as task-04/task-08. |
| Literal `file://` offline open of `/tool/` | Browser blocks script-initiated `http://`→`file://` navigation. Proven **transitively**: tool page = zero third-party requests + inlined bundle + pure-JS build (built the vector with no network), so it has no network dependency. |
| Live mempool balances on the real `github.io` origin; the **real burn build on staging** | The burn PSBT must be built on the deployed page itself (task step 3). Needs the extension. |

## Blocked on Joe
| ⛔ Item | Detail |
|---|---|
| Faucet funding | Fund `tb1qr82u5h86epepnxlvx5me2njkhs8pufjhfmhzfp` (fresh Core wallet `bitcoinburned-burn`, testnet4) with a small amount (≥ ~20,000 sats). |
| Chrome extension online | Required to build the burn on the live staging site + finish the ⏳ items above. |

**Bottom line:** everything testable without funds or a live browser is **green**. The only open work is the on-chain burn proof (PROOF.md), which is gated on the faucet + extension.
