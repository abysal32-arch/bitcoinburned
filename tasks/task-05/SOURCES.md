# task-05 — fact-check sources & verdicts

Every factual claim on the homepage (`index.html`) recorded as **claim → source → verdict**.
On-chain figures pulled 2026-07-14 from two independent Esplora explorers (blockstream.info + mempool.space) — they agree, and mempool.space is the API task-07 will wire up for live balances. `funded_txo_sum` = total satoshis ever received; every registry address has `spent_txo_sum = 0` (nothing ever spent — they are burns), so received = current balance.

## Address strings — character-verified

Each string was compared char-by-char against the canonical burn-address list
(<https://github.com/jconorgrogan/BTC-Burn-Addresses>) **and** returned valid data from both
explorer APIs (a bad checksum would not). All five match exactly:

| Address (homepage) | Canonical | Verdict |
|---|---|---|
| `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa` | same | ✅ genesis, 34 chars |
| `1CounterpartyXXXXXXXXXXXXXXXUWLpVr` | same | ✅ 15 X's, 34 chars |
| `1ChancecoinXXXXXXXXXXXXXXXXXZELUFD` | same | ✅ 17 X's, 34 chars |
| `1111111111111111111114oLvT2` | same | ✅ null (all-zero hash160), 27 chars |
| `1BitcoinEaterAddressDontSendf59kuE` | same | ✅ 34 chars |

---

## Card 1 — Genesis `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa`

- **"Jan 3, 2009"** → genesis block mined 3 Jan 2009 (coinbase headline "The Times 03/Jan/2009 …"). **✅ correct, universal.**
- **"~100 BTC" received-total** → **⚠️ imprecise, CHANGED to "~57 BTC" (tribute).** The explorer API `funded_txo_sum` = 5,722,502,938 sats = **57.2 BTC**. This is *tributes sent after the genesis block*; it does **not** include the original 50 BTC genesis coinbase, which Bitcoin Core deliberately leaves out of the UTXO set (unspendable, unindexed). Total "at" the address ≈ 50 + 57 ≈ 107 BTC, but the only explorer-verifiable / API-trackable figure (what task-07 will show live) is 57.2 BTC. So the card now reads **~57 BTC "sent as tribute"** with note **"+50 BTC genesis reward, stuck"**.
  - blockstream: `funded_txo_sum` 5722502938, `tx_count` 63568.
  - mempool: `funded_txo_sum` 5722502938 (identical).
- **Stuck 50 BTC coinbase** → well-documented quirk: the genesis coinbase output is not spendable and not in the UTXO database. **✅ kept.**
- **"ordinary address Satoshi likely holds the key to"** → it is a standard P2PKH address (not a no-key burn address); the key is presumably Satoshi's. **✅ kept** (this is why the card is tagged SPECIAL CASE, not a true burn).

## Card 2 — Counterparty `1CounterpartyXXXXXXXXXXXXXXXUWLpVr`

- **"~2,130 BTC"** → API `funded_txo_sum` = 213,099,775,494 sats = **2,131 BTC** all-time. Official proof-of-burn period total was **2,125.63 BTC**. **✅ correct** ("~2,130" fits both).
- **Date "Jan 2014" / "During January 2014"** → proof-of-burn ran **Jan 2 – Feb 3 2014** (~5,000 blocks); bulk in January. **✅ substantially correct; desc reworded "During January 2014" → "In early 2014"** to cover the Jan–Feb window.
- **Proof-of-burn, no ICO/pre-mine, ~2.6M XCP minted** → **✅ correct.**
  - Sources: <https://forums.counterparty.io/t/how-many-btc-were-burned-how-many-xcp-created-and-how-many-are-there-now/1162>, <https://docs.counterparty.io/docs/basics/what-is-xcp/>, <https://en.wikipedia.org/wiki/Counterparty_(platform)>, <https://coinspondent.de/2015/11/21/proof-of-burn-baby-burn/>.
- **"One of the largest single burn events … by volume"** → **✅ kept** (confirmed one of the two largest proof-of-burn projects of the era).

## Card 3 — Chancecoin `1ChancecoinXXXXXXXXXXXXXXXXXZELUFD`

- **amount "large"** → **CHANGED to "~480 BTC".** API `funded_txo_sum` = 48,019,572,673 sats = **480.2 BTC** (both explorers). Independently reported as **"Chancecoin burned 480 BTC … one of the two largest proof-of-burn projects of its era, along with Counterparty."** **✅ figure now sourced.**
- **Year "2014"** → Chancecoin launched 2014 (bitcointalk ANN topic 528023, "SuperNET core coin for betting in a decentralized casino"). **✅ correct.**
- **REMOVED unverifiable superlative** "these account for the overwhelming majority of all BTC ever sent to burn addresses" (cannot be proven across *all* burn addresses) and the "top-3 by volume" note. Replaced with the sourced claim that Chancecoin + Counterparty were the two largest proof-of-burn projects of the era, and described Chancecoin as a decentralized-casino project.
  - Sources: <https://bitcointalk.org/index.php?topic=528023>, <https://en.bitcoin.it/wiki/Proof_of_burn>, explorer `funded_txo_sum`.

## Card 4 — Null address `1111111111111111111114oLvT2`

- **"~510 BTC"** → **STALE, CHANGED to "~808 BTC".** API `funded_txo_sum` = 80,827,168,602 sats = **808.3 BTC** (both explorers).
- **"256k+ txns"** → **UPDATED to "259k+ txns".** API `tx_count` = **259,458**.
- **hash160 = twenty zero bytes; inverting SHA-256/RIPEMD-160 / ~2¹⁶⁰** → **✅ correct** (P2PKH with all-zero hash160; a preimage/brute-force of ~2¹⁶⁰).
- **Blockstack namespace registration** → **✅ confirmed.** BNS sends name-registration fees to this burn address ("black hole") to discourage squatting; "used by this project since at least 2015."
  - Sources: <https://forum.stacks.org/t/why-is-1111111111111111111114olvt2-used-as-the-burn-address/14663>, <https://docs.stacks.co/example-contracts/bns>.
- **"107 BTC across five synchronized transactions in May 2026"** → **✅ CONFIRMED, widely reported.** Five transactions totaling ~107 BTC (batches ≈ 20, 1.41, 36.78, 28.88, 20.02) all confirmed in **block 950962** (~13:59 UTC, 25–26 May 2026) to this address — same-block timing ⇒ "synchronized"/deliberate.
  - Sources: <https://cointelegraph.com/news/unknown-sender-burns-107-btc-unexplained-bitcoin-transfer>, <https://www.bitget.com/amp/news/detail/12560605432852>, <https://www.cryptotimes.io/2026/05/26/107-bitcoin-5-transactions-8-million-burned-in-minutes/>, <https://news.bitcoin.com/bitcoin-burn-wallet-absorbs-8-2m-as-unknown-user-destroys-107-btc-in-mystery-transfer/>, <https://cryip.co/107-bitcoin-btc-worth-millions-permanently-burned-by-mystery-sender/>.

## Card 5 — Bitcoin Eater `1BitcoinEaterAddressDontSendf59kuE`

- **"~13.3 BTC"** → **UPDATED to "~13.4 BTC".** API `funded_txo_sum` = 1,341,694,965 sats = **13.417 BTC** (both explorers). (A stale blockchain.com snapshot showed 13.30103831 BTC — the +0.116 BTC gap confirms the API is current.)
- **"400+ txns"** → **UPDATED to "5,600+ txns".** Both Esplora explorers report `tx_count` = **5,600** (`funded_txo_count` 5,782). blockchain.com's cached "424" is stale; task-07 uses mempool.space, so the card aligns to Esplora.
- **"mid-2010s →"** → **TIGHTENED to "2014 →".** A Feb 2014 blockchain-curiosities write-up records the address had already received >1.6 BTC by then, so tributes date to **2014**.
  - Sources: mempool.space / blockstream.info API, <http://www.righto.com/2014/02/ascii-bernanke-wikileaks-photographs.html>.
- **Vanity address, no derivable key, symbolic tributes** → **✅ correct/kept.**

---

## OP_RETURN relay-policy claim (README lines 106-111; homepage does not make it)

- **"historically an 80-byte default in Bitcoin Core, raised substantially as of Core v30"** → **✅ CONFIRMED and accurate.** Bitcoin Core **v30** (released **10 Oct 2025**) raised the default `datacarrier` size from ~80 bytes to effectively uncapped (100,000-byte `-datacarriersize`, multiple OP_RETURNs allowed). It is a **relay/mempool policy** change, **not** consensus — exactly as the README already states ("affects whether your transaction relays … not whether the burn itself is valid"). The homepage makes no relay-size claim (its OP_RETURN section only asserts consensus-level unspendability, which is correct), so the two are aligned; **no wording change needed**.
  - Sources: <https://www.coindesk.com/tech/2025/06/10/bitcoin-core-30-to-increase-op_return-data-limit-after-developer-debate-concludes>, <https://oakresearch.io/en/analyses/fundamentals/update-op-return-bitcoin-core-v30-core-knots-war>.

## Other prose (non-numeric, checked for accuracy)

- Lore: "Counterparty and Chancecoin communities … destroyed **thousands of BTC**" → 2,131 + 480 ≈ 2,611 BTC. **✅ "thousands" holds.**
- Hero: "OP_RETURN … provably unspendable by consensus rule" → **✅ correct.**
- Honesty callout (crypto-infeasibility, genesis-key caveat) → **✅ consistent with the above.**
- Registry intro said balances "are **live**" — they are static until task-07, so **reworded to "public and verifiable"** (removed the premature "live").

## Copy added (legal/privacy — task step 4)

- Footer extended: MIT-licensed, **fully client-side, no analytics, no tracking, no keys — ever** (alongside existing "not financial advice; burning is irreversible").
- Honesty callout gained one sentence: **nothing on this site is an inducement to burn; verify every figure yourself on a block explorer.**
