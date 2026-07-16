# task-04 — the real mainnet burn

Sanctioned by Joe 2026-07-16. One burn, as a launch artifact. **Joe buys, signs and
broadcasts. Claude builds, verifies and preps the node, and stops at the signing step.**

Everything below was verified on 2026-07-16 against primary sources (Core source at tag,
live wire checks, Joe's own machine). Where something is unverified it says so.

---

## The decision, up front

**Download Bitcoin Core v31.1. Do NOT do this on the v29.4 binary.**

Assumeutxo snapshot parameters are **compiled into the binary**. A node only accepts a
snapshot whose height it was built knowing about:

| Binary | Newest usable snapshot | Blocks still to grind (tip 958,249) |
|---|---|---|
| **v29.4** (the one in `tools\bitcoin-29.4`) | 880,000 | **78,249** — ~130 GB, 1–3 days |
| **v31.1** | 935,000 | **23,249** — ~38 GB, hours |

v29.4's `m_assumeutxo_data` has only two mainnet entries (840,000 and 880,000). The
snapshot the Core project is preparing to publish officially is 910,000 — **v29.4 rejects
it.** v31.1 knows 840k / 880k / 910k / 935k.

v31.1 confirmed as the current release on bitcoincore.org (2026-07-16).
**Leave the v29.4 testnet4 node completely alone** — different binary, different datadir,
different ports. It is not involved.

### Can he broadcast before it's fully validated? YES.

This was the make-or-break question. There are two independent syncs:

- **Background (genesis → 935,000):** runs for days. **Never gates broadcasting.** Ignore it.
- **Forward (935,000 → tip):** **this is the only gate.** `sendrawtransaction` needs the
  funding UTXO in the local chainstate, so the node must reach the block containing it.

So assumeutxo skips everything *below* the snapshot, which is the overwhelming majority.

**The sync is free wall-clock.** No BTC has been bought yet. Start the node today, buy the
coins today, leave them at the exchange. The sync finishes long before the coins matter. It
is not on the critical path.

**Signing needs no chainstate at all.** `src/burn.js` puts `witnessUtxo` (script + value) in
the PSBT, which is everything BIP143 signing requires. The node's *only* job is
`sendrawtransaction ... maxburnamount`.

---

## Commands (PowerShell, Windows)

```powershell
# ── 0 ─ Run in the SAME window as every later step, or re-run this block in a new one.
$BIN = "C:\Users\Joe\Desktop\bitcoin-31.1\bin"
$DD  = "C:\Users\Joe\BitcoinMain"
$cli = "$BIN\bitcoin-cli.exe"
```

**1. Get v31.1.** Download `bitcoin-31.1-win64.zip` + `SHA256SUMS` + `SHA256SUMS.asc` from
<https://bitcoincore.org/en/download/>, extract so `$BIN` above exists.

```powershell
Get-FileHash "C:\Users\Joe\Downloads\bitcoin-31.1-win64.zip" -Algorithm SHA256
```
That catches a corrupt download. It does **not** defend against a compromised site — only
checking `SHA256SUMS.asc` against a maintainer's GPG key does. The binary is the trust root
of any node, and it's the *real* trust root here (not the snapshot). Worth ten minutes.

**2. Fresh datadir.** Never reuse `%APPDATA%\Bitcoin` — that's v22, pruned, stranded at
633,847, empty wallet. Dead end.

```powershell
New-Item -ItemType Directory -Force -Path $DD

# -Encoding ascii is MANDATORY. PowerShell's default UTF-16 makes Core silently ignore
# the whole file and run UNPRUNED, which would fill C:.
@'
prune=5000
dbcache=2048
server=1
'@ | Out-File -FilePath "$DD\bitcoin.conf" -Encoding ascii
Get-Content "$DD\bitcoin.conf"
```

**3. Defender exclusions** (elevated PowerShell) — LevelDB + real-time scanning is brutal.

```powershell
Add-MpPreference -ExclusionPath "C:\Users\Joe\BitcoinMain"
Add-MpPreference -ExclusionPath "D:\utxo-935000.dat"
```

**4. Start it.** `-daemon` does not exist on Windows, so this **blocks**. Leave the window
open; use a new window for the rest (re-running step 0 there).

```powershell
& "$BIN\bitcoind.exe" -chain=main -datadir="$DD"
```

**5. Download the snapshot to D:** while headers sync. (`D:` is a slow 2003 spindle — fine
for one sequential read. Never put the chainstate there.)

```powershell
curl.exe -L -C - --retry 5 -o "D:\utxo-935000.dat" "https://files-vps02.jaonoctus.dev/utxo-935000.dat"
(Get-Item "D:\utxo-935000.dat").Length      # expect ~9,387,990,306
```

**6. Wait for headers ≥ 935,000** before loading, or step 7 fails.

```powershell
& $cli -chain=main -datadir="$DD" -rpcwait getblockchaininfo | Select-String '"headers"','"blocks"'
```

**7. Load it.** `-rpcclienttimeout=0` is **mandatory** — the CLI default is 900 s and the load
is longer. **If the CLI errors, the daemon is still loading. Do not re-run.** Watch step 8.

```powershell
& $cli -chain=main -datadir="$DD" -rpcclienttimeout=0 loadtxoutset "D:\utxo-935000.dat"
```

**8. Two chainstates now exist.** Only the one with `snapshot_blockhash` matters to you.

```powershell
& $cli -chain=main -datadir="$DD" getchainstates
Remove-Item "D:\utxo-935000.dat"     # reclaim 9.4 GB once step 7 reported coins_loaded
```

**9. THE ONLY GATE.** Poll until `blocks == headers` and `initialblockdownload: false`.

```powershell
& $cli -chain=main -datadir="$DD" getblockchaininfo | Select-String '"blocks"','"headers"','initialblockdownload','size_on_disk'
"{0:N1} GB free on C:" -f ((Get-PSDrive C).Free/1GB)
```

**10. ONLY after step 9 passes: wallet → address → funds. Never reverse this order.**

```powershell
& $cli -chain=main -datadir="$DD" -named createwallet wallet_name="burn" load_on_startup=true
& $cli -chain=main -datadir="$DD" -rpcwallet=burn encryptwallet "YOUR-PASSPHRASE"
& $cli -chain=main -datadir="$DD" -rpcwallet=burn backupwallet "D:\burn-wallet-backup.dat"
& $cli -chain=main -datadir="$DD" -rpcwallet=burn getnewaddress "burn-funding" bech32
# ^ withdraw ~20k sats + fee from the exchange to THIS address. bech32 = bc1q = the proven path.
```

**11. Confirm funding, then build the PSBT** on <https://bitcoinburned.com/tool/> (not the
CLI — the website has the guards). Use **full** mode: with a dedicated UTXO it computes the burn
amount for you, so the fee is the only number you type. Ignore the tool's Knots note — it's
correct, and it doesn't matter (see Burn parameters).

```powershell
& $cli -chain=main -datadir="$DD" -rpcwallet=burn listunspent
```

**12. Sign.** Returns `{psbt, complete:true, hex}` — copy the hex.

```powershell
& $cli -chain=main -datadir="$DD" -rpcwallet=burn walletpassphrase "YOUR-PASSPHRASE" 300
& $cli -chain=main -datadir="$DD" -rpcwallet=burn walletprocesspsbt "BASE64-PSBT"
```

**13. EYEBALL IT.** Last reversible moment. One OP_RETURN vout, correct value, change present.

```powershell
& $cli -chain=main -datadir="$DD" decoderawtransaction "SIGNED-HEX"
# Dry run — but NOT a green light: testmempoolaccept has no maxburnamount param, so
# allowed:true here does NOT prove step 14 passes.
& $cli -chain=main -datadir="$DD" testmempoolaccept '["SIGNED-HEX"]'
```

**14. BROADCAST.** `-named` because `maxburnamount` is the **3rd** positional arg (default
`0.00`). `0.0002` BTC = 20,000 sats; must be ≥ the OP_RETURN value. Never blanket-large.

```powershell
& $cli -chain=main -datadir="$DD" -named sendrawtransaction hexstring="SIGNED-HEX" maxburnamount=0.0002
& $cli -chain=main -datadir="$DD" -rpcwallet=burn gettransaction "TXID"
```

**15. Verify + record.** Watch mempool.space; after ≥1 confirmation record txid, amount,
message, block height/hash, and the script hex. Write a `PROOF.md` next to this file in the
same shape as `task-02/PROOF.md`. **Lead with the script bytes (`6a…`), not `gettxout`** —
null is weak evidence (it's also null for merely-spent outputs); the script is the proof.

### NEVER run these

```powershell
#   bitcoind.exe -reindex
#   bitcoind.exe -reindex-chainstate
```
On a pruned node they are **unrecoverable** — they rebuild state from `blk*.dat` files that
pruning already deleted, forcing a ~700 GB re-download. This is the standard advice strangers
give when a node misbehaves. Ignore it.

### Your testnet4 node is safe

Different ports (48332/48333 vs 8332/8333), different datadir, different binary. But
**`bitcoin-cli` defaults to mainnet** — every testnet command needs both flags:

```powershell
& "C:\Users\Joe\Desktop\swap key\tools\bitcoin-29.4\bin\bitcoin-cli.exe" -chain=testnet4 -datadir="C:\Users\Joe\Desktop\swap key\testnet-data" getblockchaininfo
```

---

## Burn parameters

- **Size:** ~20,000 sats + fee. The proof is the script bytes, not the amount.
- **Dedicated UTXO — this is the load-bearing safety step, and it is what makes full mode safe.**
  Fund the burn address with *only* burn + fee (e.g. exactly 20,500 sats), confirm it, and point
  the tool at nothing else. `full` mode destroys the ENTIRE UTXO minus fee with no cap and no
  warning — which is a catastrophe on a general-purpose UTXO and *precisely the intent* on a
  dedicated one. Get this step right and every other footgun in this file stops mattering.
- **Message: ≤ 40 bytes UTF-8** — but the earlier reasoning for this was WRONG, so here is the
  verified version. The real limit today is **80 bytes of payload** on *both* Core and Knots.
  Knots' `MAX_OP_RETURN_RELAY` was 42 until v29.2.knots20251110 (Nov 2025) and is **83 now**
  (= 83 script bytes = 80 payload; the whole script is measured, payload + 2). Verified at the
  shipped tag `v29.3.knots20260508`, whose own comment reads *"80 bytes of data, +1 for
  OP_RETURN, +2 for the pushdata opcodes."* Core v30+ defaults to ~100,000 (uncapped).
  **So why still 40?** Knots' release notes call 83 *"a temporary adjustment… will be reverted
  back to 42 in a future version."* 40 costs nothing, and survives the revert if it lands
  before the burn. Anything up to 80 is fine today. The testnet4 proof's message was 30 bytes.
  Neither `src/burn.js` nor bitcoinjs-lib validates length at all.
- **USE FULL MODE** (Joe's call, 2026-07-16, and it's the right one — see the reasoning below).
  With a dedicated UTXO holding exactly burn + fee, full mode is simpler, safer to *operate*,
  and leaves nothing behind.
  - **Fewer fields = fewer irreversible typos.** Full mode computes `burnAmount = value − fee`
    itself, so you type ONE number: the fee. Partial needs a burn amount AND a change address —
    two more chances to fat-finger a one-shot transaction.
  - **The "full mode destroys the whole UTXO" footgun is defused by construction.** That warning
    only applies to a big general-purpose UTXO. Pointed at a dedicated one holding precisely
    burn + fee, destroying the whole thing minus fee is *exactly the intent*.
  - **It's the better-tested path here**, contrary to an earlier claim in this runbook:
    `test/psbt-vector.txt` IS a full burn, and 5 of the 9 unit tests are full mode (partial has
    1). What full mode has never been is *broadcast live* — the testnet4 proof was partial. The
    code path is the more exercised one; only the live broadcast is unproven.
  - **No litter.** One output, nothing added to the UTXO set. (Though be honest about the size
    of this win: a partial burn's "litter" is one ordinary change output holding your own
    spendable coins — the same thing every wallet on earth creates. The real anti-bloat victory
    was using OP_RETURN at all instead of a fake burn address, and you get that in both modes.)
  - **⚠ THE ONE REAL COST — overpay the fee.** A full burn has no spendable output, so there is
    no CPFP escape if you underpay. RBF still works (Core v28+ defaults `mempoolfullrbf=true`,
    so the missing opt-in signal doesn't block it), but replacing means rebuilding and
    re-signing. At 1–2 sat/vB a 120 vB full burn is ~150–250 sats: **pay ~500 and stop thinking
    about it.** That single decision buys out the only scenario that actually hurts.
- **Knots will not relay a full burn — accept this, don't design around it.** Knots defaults
  `-permitbaredatacarrier=false` and rejects any transaction with no monetary output:
  ```cpp
  if (!n_monetary) { if (nDataOut && !opts.permitbaredatacarrier) { MaybeReject("bare-datacarrier"); } }
  ```
  A full burn is exactly that, at ANY message size, even empty — and attaching the burn value to
  the OP_RETURN does not help (NULL_DATA outputs never increment `n_monetary`). Verified at
  `v29.3.knots20260508` `src/policy/policy.cpp`. **This costs propagation speed, not success:**
  Core has no such rule, relays it fine, and the overwhelming majority of hashrate will mine it.
  Note the irony — a full burn adds nothing to the UTXO set, so Knots' anti-spam rule is
  refusing the most considerate transaction on the network. It shape-matches "pays nobody" and
  cannot tell *destroying value* from *dumping data*.
- **Fee: pay ~500 sats and stop thinking about it.** Check mempool.space on the day, but the
  arithmetic barely matters at this size. A full burn ≈ 120 vB (30-byte message), so at 1–2
  sat/vB the "correct" fee is ~120–240 sats — **three digits**. Deliberately overpaying to ~500
  is a rounding error against a 20,000 sat burn and it buys out the no-CPFP risk entirely, which
  is the only thing full mode actually costs you. If the number you're about to type has five
  digits, it's wrong. **The field is TOTAL SATS, not sat/vB.**
- **Address type:** `bc1q` (P2WPKH). The proven path. P2TR (`bc1p`) is untested here.

## Disk

Peak ≈ 20–22 GB on C: (snapshot chainstate ~12 GB + pruned blocks 5 GB + background
chainstate). C: has **37.9 GB free** — comfortable. Stage the 9.4 GB snapshot on **D:**
(111.1 GB free), delete it after step 8.

---

## What will most likely go wrong, and the tell

1. **Funding the address before the wallet exists.** Fatal-ish — the wallet's birthday is
   later than the funding block, it never sees the UTXO, and the rescan it needs crosses
   pruned blocks. **Tell:** `listunspent` returns `[]` while the explorer shows the coins.
   **Prevention:** step 10 order is non-negotiable.
2. **`loadtxoutset` "fails" at 900 s and he retries.** The CLI timed out; the daemon is still
   loading. Retrying gives `Can't activate a snapshot-based chainstate more than once`.
   **Tell:** it's a *client* timeout and `debug.log` is still churning. Watch `getchainstates`.
3. **`loadtxoutset` rejected outright.** `assumeutxo block hash in snapshot metadata not
   recognized` = wrong binary or wrong file. `base block header must appear in the headers
   chain` = you skipped step 6.
4. **bitcoin.conf silently ignored → unpruned node eats C:.** PowerShell wrote UTF-16.
   **Tell:** no `pruneheight` in `getblockchaininfo`; `size_on_disk` climbs past 10 GB. Kill
   it, rewrite with `-Encoding ascii`.
5. **Wrong datadir.** Omit `-datadir` once and you open the dead v22 datadir. **Tell:** height
   ~633,847, or a v22→v31 chainstate upgrade in the log.
6. **`sendrawtransaction` rejects the burn.** **Tell:** `Unspendable output exceeds maximum
   configured by user (maxburnamount)`. Forgot the 3rd arg, or set it below the burn value.
   **The transaction is fine — fix the command, never the transaction.**

## Unverified — check before relying on it

- **`utxo-935000.dat`'s body.** Its 51-byte header was read off the wire and matches v31.1's
  compiled 935,000 blockhash exactly, and the host is live at ~9.39 GB — but a header commits
  to none of the remaining 9 GB. **Not a safety risk** (Core hashes the whole coins set
  against the compiled `hash_serialized`; a forged file cannot pass), a **time** risk. If step
  7 says `Bad snapshot content hash`, re-download or fall back to `utxo-910000.dat`, which
  v31.1 also accepts.
- **Whether v31.2+ has superseded v31.1.** v31.1 was current on 2026-07-16. Re-check the
  download page.
- **Real sync time for 23,249 blocks** on this hardware. ~38 GB is arithmetic; "hours" is an
  estimate. Either way it finishes well inside a week.
- **Third-party broadcast.** mempool.space/Blockstream calling `sendrawtransaction` hex-only
  was verified against their source (`bitcoin-api.ts`, `electrs/daemon.rs`), so they *should*
  reject. Trying costs 10 seconds once you have signed hex — but build the node anyway.
- **Knots' node share (~22.7%) and hashrate (~3.9%, OCEAN).** Single crawler, never
  cross-checked; and reachable-node share is NOT relay-path share. Do not reason from these
  magnitudes. With full mode the burn is nonstandard to Knots regardless (bare-datacarrier), so
  these numbers are the closest thing to a reason to care — and they are exactly the numbers not
  to trust. What is solid: Core has no such rule, and a full burn confirms. If it somehow sits
  unconfirmed for many blocks while paying a healthy fee rate, that is the tell that this
  mattered more than expected — rebuild as a partial burn and replace via RBF.
- **Whether the Knots 42 revert has landed.** Pre-announced, not shipped at any tag checked
  (newest: `v29.3.knots20260508`). Re-check if a new Knots release appears before the burn —
  though at 40 bytes it cannot bite either way.

## Sources

[chainparams.cpp @ v31.1](https://raw.githubusercontent.com/bitcoin/bitcoin/v31.1/src/kernel/chainparams.cpp) ·
[chainparams.cpp @ v29.4](https://raw.githubusercontent.com/bitcoin/bitcoin/v29.4/src/kernel/chainparams.cpp) ·
[doc/assumeutxo.md](https://github.com/bitcoin/bitcoin/blob/master/doc/assumeutxo.md) ·
[PR #27596](https://github.com/bitcoin/bitcoin/pull/27596) ·
[Optech: AssumeUTXO](https://bitcoinops.org/en/topics/assumeutxo/)
