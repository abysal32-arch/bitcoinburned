# btc-burn-tool

Builds an **unsigned** Bitcoin transaction that provably destroys bitcoin by
sending it into an `OP_RETURN` output — a script that fails for every
possible unlocking attempt, enforced by consensus rules that every full
node runs. That's a fundamentally stronger guarantee than "send it to an
address nobody has a key for," which is safe in practice but technically
rests on an assumption (that finding a matching key is computationally
infeasible), not a proof.

Two ways to use it, same underlying logic:

- **`index.html`** — a single, dependency-free file. Open it in any
  browser, nothing to install, works offline. This is the whole
  application; there is no server and no build step required to use it.
- **`cli.js`** — a Node.js command-line version, useful for scripting or
  for people who'd rather not click through a form.

## The safety model — please actually read this

**This tool never asks for, generates, stores, or transmits a private
key. Full stop.** It only builds a PSBT (Partially Signed Bitcoin
Transaction) — an inert, unsigned draft. You take that draft to a wallet
you *already trust* (Sparrow, Electrum, a hardware wallet's own
companion app, whatever you already use), review every field yourself,
sign it there, and broadcast it from there.

This is deliberate. A tool that asks you to paste in a private key so it
can "just handle the whole thing for you" is a custody risk, and that
risk buys you nothing here — constructing an unsigned transaction
doesn't require a key at all. If anything ever asks this tool for a
private key, that's not this tool; something has gone wrong.

Burning bitcoin is **irreversible**. Double-check every field — the
txid, the amount, the fee, the message — in the signing wallet before
you sign, not just on this page.

## Using the browser app (`index.html`)

1. Open `index.html` directly in a browser (double-click it, or drag it
   into a browser window). No internet connection is required except to
   load two Google Fonts; the transaction logic itself runs fully
   offline.
2. Fill in the UTXO you want to spend from (txid, output index, value in
   satoshis, and the address it currently sits at — get these from your
   wallet or a block explorer).
3. Choose a full burn (the whole UTXO, minus fee) or a partial burn
   (some of it, with the remainder sent back to a change address you
   specify).
4. Enter a fee, in total satoshis — check a fee estimator or your own
   wallet for a sane current value; this tool does not guess one for
   you, on purpose, to avoid getting it subtly wrong.
5. Optionally add a message. It's embedded permanently, right alongside
   the burned value.
6. Click **Build the unsigned burn PSBT**. Copy the resulting PSBT.
7. Import it into your own wallet, verify every field again there, sign
   it, and broadcast it.

Currently supports UTXOs sitting at **native SegWit (`bc1q…`) or Taproot
(`bc1p…`) addresses**. See "Known limitations" below for why legacy
addresses aren't supported yet.

## Using the CLI (`cli.js`)

```bash
npm install
node cli.js \
  --txid <64-char hex txid> \
  --vout 0 \
  --value 150000 \
  --address bc1q... \
  --fee 300 \
  --message "gone forever"
```

Run `node cli.js --help` for the full flag list, including partial-burn
mode (`--burn-amount` + `--change-address`).

## Why OP_RETURN specifically

An `OP_RETURN` output's script terminates execution in failure the
instant it's evaluated — there is no unlocking script, signature, or
secret that could ever satisfy it. Every full node enforces this as part
of core transaction validation, not merely as a relay-time filter. That
makes it categorically different from a "no known private key" address,
whose safety rests on it being infeasible to find a matching key (true
for all practical purposes, but not a proof of impossibility).

## Known limitations

- **Legacy addresses (`1…`, non-SegWit `3…`) aren't supported yet.**
  PSBT signing for those input types needs the *entire* previous
  transaction attached (`nonWitnessUtxo`), not just its output script
  and value. Native SegWit and Taproot inputs only need the lighter
  `witnessUtxo` form, which is what this tool currently builds.
  Contributions adding legacy support are welcome.
- **Fee is a flat number you supply, not an estimate.** This is
  intentional — guessing a transaction's final virtual size before it's
  signed (signature sizes vary slightly) is a common source of subtly
  wrong fee calculations. Get a real estimate from your wallet or a fee
  estimator and enter the total satoshi fee directly.
- **`OP_RETURN` relay-size policy varies by node**, and has changed
  over time (historically an 80-byte default in Bitcoin Core, raised
  substantially as of Core v30). This affects whether your transaction
  relays smoothly across the whole network, not whether the burn itself
  is valid — the consensus-level unspendability is unaffected either
  way.

## Project layout

```
src/burn.js            core PSBT-building logic (used by both CLI and browser app)
src/browser-entry.js   thin wrapper exposing burn.js to the browser build
cli.js                 command-line interface
index.html             browser app (bundle already inlined — no build step to use it)
test/burn.test.js      round-trip tests: confirms output is genuinely OP_RETURN,
                       amounts are correct, and unsafe inputs are rejected
design/homepage.html   chosen homepage design (design/archive/ holds superseded drafts)
tasks/                 launch task checklists
```

To rebuild `index.html`'s embedded bundle after editing `src/burn.js`:

```bash
npm install
npx esbuild src/browser-entry.js --bundle --platform=browser --format=iife \
  --outfile=dist/bundle.js --minify
# then splice dist/bundle.js into index.html in place of the prior bundle
```

## Running the tests

```bash
npm install
node test/burn.test.js
```

## License

MIT — see `LICENSE`. Use it, fork it, audit it, embed it in something
else; just don't remove the safety model described above without
understanding why it's there.
