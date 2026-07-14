#!/usr/bin/env node
'use strict';

/**
 * btc-burn-tool CLI
 *
 * Builds an unsigned PSBT that burns bitcoin via OP_RETURN.
 * This tool NEVER asks for or touches a private key. You sign the
 * output yourself, in your own wallet, then broadcast it yourself.
 *
 * Usage:
 *   node cli.js \
 *     --txid <64-char hex txid> \
 *     --vout <n> \
 *     --value <sats> \
 *     --address <the address that UTXO currently sits at> \
 *     --fee <sats> \
 *     [--message "text to embed"] \
 *     [--network mainnet|testnet|regtest] \
 *     [--burn-amount <sats>] [--change-address <addr>]   (omit both for a full burn)
 *
 * Example — burn an entire UTXO:
 *   node cli.js --txid abcd...1234 --vout 0 --value 150000 \
 *     --address bc1qexampleaddress... --fee 300 --message "gone forever"
 *
 * Example — burn part of a UTXO, send the rest back to yourself:
 *   node cli.js --txid abcd...1234 --vout 0 --value 150000 \
 *     --address bc1qexampleaddress... --fee 300 \
 *     --burn-amount 50000 --change-address bc1qyourotheraddress...
 */

const { buildBurnPsbt } = require('./src/burn');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        args[key] = true; // boolean flag
      } else {
        args[key] = next;
        i++;
      }
    }
  }
  return args;
}

function printUsageAndExit(message) {
  if (message) console.error(`\nError: ${message}\n`);
  console.error(
    `Usage:
  node cli.js --txid <txid> --vout <n> --value <sats> --address <addr> --fee <sats>
              [--message "text"] [--network mainnet|testnet|regtest]
              [--burn-amount <sats> --change-address <addr>]

See the top of cli.js or README.md for full examples.`
  );
  process.exit(message ? 1 : 0);
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || args.h || Object.keys(args).length === 0) {
    printUsageAndExit();
  }

  const required = ['txid', 'vout', 'value', 'address', 'fee'];
  for (const key of required) {
    if (args[key] === undefined) printUsageAndExit(`missing required --${key}`);
  }

  const isPartial = args['burn-amount'] !== undefined || args['change-address'] !== undefined;
  if (isPartial && !(args['burn-amount'] !== undefined && args['change-address'] !== undefined)) {
    printUsageAndExit('partial burns require BOTH --burn-amount and --change-address');
  }

  const opts = {
    network: args.network || 'mainnet',
    input: {
      txid: args.txid,
      vout: parseInt(args.vout, 10),
      value: parseInt(args.value, 10),
      address: args.address,
    },
    fee: parseInt(args.fee, 10),
    message: args.message || '',
    mode: isPartial ? 'partial' : 'full',
  };
  if (isPartial) {
    opts.burnAmount = parseInt(args['burn-amount'], 10);
    opts.changeAddress = args['change-address'];
  }

  let result;
  try {
    result = buildBurnPsbt(opts);
  } catch (e) {
    printUsageAndExit(e.message);
  }

  console.log('\n=== Unsigned burn PSBT built successfully ===\n');
  console.log(`Mode:          ${opts.mode}`);
  console.log(`Burning:       ${result.burnAmount} sats`);
  if (opts.mode === 'partial') console.log(`Change back:   ${result.changeAmount} sats`);
  if (opts.message) console.log(`Message:       "${opts.message}"`);
  console.log(`OP_RETURN hex: ${result.opReturnScriptHex}`);
  console.log('\n--- PSBT (base64) — import this into your own wallet to review, sign, and broadcast ---\n');
  console.log(result.psbtBase64);
  console.log(
    '\nNothing has been signed or broadcast. This PSBT is inert until you sign it ' +
    'yourself. Double-check every field in your wallet before doing so — this action ' +
    'is irreversible.\n'
  );
}

main();
