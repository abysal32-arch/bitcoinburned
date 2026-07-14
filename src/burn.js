'use strict';

/**
 * btc-burn-tool / src/burn.js
 *
 * Core logic for building an UNSIGNED PSBT that provably burns bitcoin
 * via an OP_RETURN output.
 *
 * SECURITY MODEL — READ THIS FIRST:
 *   This module NEVER handles, generates, imports, or stores a private key.
 *   It only builds an unsigned PSBT (Partially Signed Bitcoin Transaction).
 *   You must sign the resulting PSBT yourself with a wallet you already
 *   trust (Sparrow, Electrum, a hardware wallet, etc.) and broadcast it
 *   yourself. This is intentional: a tool that asks for your private key
 *   is a custody risk, and that risk is not necessary to solve this problem.
 *
 * WHY OP_RETURN:
 *   An output whose script begins with OP_RETURN can never be satisfied by
 *   any unlocking script, for any input, ever. This is enforced by Bitcoin's
 *   consensus rules (i.e. every full node, not just relay policy), so it is
 *   not a probabilistic argument the way a "nobody knows the private key"
 *   burn address is. Put real value in that output, and it is destroyed.
 */

const bitcoin = require('bitcoinjs-lib');

const NETWORKS = {
  mainnet: bitcoin.networks.bitcoin,
  testnet: bitcoin.networks.testnet,
  regtest: bitcoin.networks.regtest,
};

/**
 * Build an unsigned PSBT with a single OP_RETURN burn output.
 *
 * @param {Object} opts
 * @param {'mainnet'|'testnet'|'regtest'} [opts.network='mainnet']
 * @param {Object} opts.input
 * @param {string} opts.input.txid            - txid of the UTXO being spent
 * @param {number} opts.input.vout             - output index of the UTXO
 * @param {number} opts.input.value            - value of the UTXO, in satoshis
 * @param {string} opts.input.address          - address the UTXO currently sits at
 *                                                (must be P2WPKH `bc1q...`, P2WSH,
 *                                                or P2TR `bc1p...` — see README for why
 *                                                legacy P2PKH/P2SH need extra data)
 * @param {number} opts.fee                    - total fee in satoshis you intend to pay.
 *                                                Get this from a fee estimator; this tool
 *                                                does not guess it for you.
 * @param {string} [opts.message='']           - optional text embedded in the OP_RETURN
 *                                                output alongside the burned value
 * @param {'full'|'partial'} [opts.mode='full']
 * @param {number} [opts.burnAmount]           - required if mode === 'partial': how many
 *                                                satoshis to actually burn
 * @param {string} [opts.changeAddress]        - required if mode === 'partial': where the
 *                                                unburned remainder goes
 *
 * @returns {{ psbtBase64: string, burnAmount: number, changeAmount: number, opReturnScriptHex: string }}
 */
function buildBurnPsbt(opts) {
  const network = NETWORKS[opts.network || 'mainnet'];
  if (!network) {
    throw new Error(`Unknown network "${opts.network}". Use mainnet, testnet, or regtest.`);
  }

  const { input, fee, message = '', mode = 'full' } = opts;

  if (!input || !input.txid || input.vout === undefined || !input.value || !input.address) {
    throw new Error('input.txid, input.vout, input.value, and input.address are all required.');
  }
  if (!Number.isInteger(fee) || fee < 0) {
    throw new Error('fee must be a non-negative integer number of satoshis.');
  }
  if (mode !== 'full' && mode !== 'partial') {
    throw new Error('mode must be "full" or "partial".');
  }

  // Derive the scriptPubKey for the input from its address. This works for
  // any standard address type bitcoinjs-lib recognizes, but PSBT signing
  // for *legacy* (non-segwit) inputs additionally needs the full previous
  // transaction (nonWitnessUtxo), which this tool does not request in v1 —
  // see README for the segwit-only rationale.
  let inputScript;
  try {
    inputScript = bitcoin.address.toOutputScript(input.address, network);
  } catch (e) {
    throw new Error(`Could not derive a script from address "${input.address}": ${e.message}`);
  }

  // Compute burn/change split.
  let burnAmount, changeAmount;
  if (mode === 'full') {
    burnAmount = input.value - fee;
    changeAmount = 0;
    if (burnAmount <= 0) {
      throw new Error(
        `Fee (${fee} sats) is >= input value (${input.value} sats). Nothing would be left to burn.`
      );
    }
  } else {
    if (!Number.isInteger(opts.burnAmount) || opts.burnAmount <= 0) {
      throw new Error('partial mode requires a positive integer burnAmount.');
    }
    if (!opts.changeAddress) {
      throw new Error('partial mode requires a changeAddress for the unburned remainder.');
    }
    burnAmount = opts.burnAmount;
    changeAmount = input.value - burnAmount - fee;
    if (changeAmount < 0) {
      throw new Error(
        `burnAmount (${burnAmount}) + fee (${fee}) exceeds input value (${input.value}).`
      );
    }
  }

  // Build the OP_RETURN script. bitcoinjs-lib's payments.embed() produces
  // the "OP_RETURN <data>" script for us; we attach the real burnAmount as
  // this output's *value*, which is the whole point — a plain data-only
  // OP_RETURN normally carries 0 value, ours deliberately carries funds.
  const dataChunks = message ? [Buffer.from(message, 'utf8')] : [];
  const embed = bitcoin.payments.embed({ data: dataChunks });
  const opReturnScript = Buffer.from(embed.output);

  const psbt = new bitcoin.Psbt({ network });

  // bitcoinjs-lib v7 represents satoshi amounts as BigInt (to avoid silent
  // float precision issues at the edges of the 21M-BTC range). Our public
  // API stays in plain Numbers for callers' convenience; we convert at
  // this boundary only.
  psbt.addInput({
    hash: input.txid,
    index: input.vout,
    witnessUtxo: {
      script: inputScript,
      value: BigInt(input.value),
    },
  });

  psbt.addOutput({
    script: opReturnScript,
    value: BigInt(burnAmount),
  });

  if (mode === 'partial' && changeAmount > 0) {
    psbt.addOutput({
      address: opts.changeAddress,
      value: BigInt(changeAmount),
    });
  }

  return {
    psbtBase64: psbt.toBase64(),
    burnAmount,
    changeAmount,
    opReturnScriptHex: opReturnScript.toString('hex'),
  };
}

module.exports = { buildBurnPsbt, NETWORKS };
