'use strict';

/**
 * Round-trip sanity tests for buildBurnPsbt.
 * Run with: node test/burn.test.js
 *
 * These tests use fabricated txids/addresses — they never touch the network
 * and never need a real private key. They exist to prove the PSBT we build
 * actually decodes back into what we intended, and that our OP_RETURN
 * output really is unspendable per bitcoinjs-lib's own script classifier.
 */

const assert = require('assert');
const bitcoin = require('bitcoinjs-lib');
const { buildBurnPsbt } = require('../src/burn');

const FAKE_TXID = 'a'.repeat(64); // valid-length placeholder txid
const FAKE_P2WPKH_ADDRESS = bitcoin.payments.p2wpkh({
  hash: Buffer.alloc(20, 1),
  network: bitcoin.networks.bitcoin,
}).address;
const FAKE_CHANGE_ADDRESS = bitcoin.payments.p2wpkh({
  hash: Buffer.alloc(20, 2),
  network: bitcoin.networks.bitcoin,
}).address;

let passed = 0;
function check(label, fn) {
  try {
    fn();
    console.log(`  PASS  ${label}`);
    passed++;
  } catch (e) {
    console.log(`  FAIL  ${label}\n        ${e.message}`);
    process.exitCode = 1;
  }
}

console.log('\n[1] Full-burn mode (spend entire UTXO minus fee)');
check('builds without throwing', () => {
  const result = buildBurnPsbt({
    input: { txid: FAKE_TXID, vout: 0, value: 100_000, address: FAKE_P2WPKH_ADDRESS },
    fee: 500,
    message: 'test burn',
    mode: 'full',
  });
  global.__lastResult = result;
});

check('burnAmount = input value - fee', () => {
  assert.strictEqual(global.__lastResult.burnAmount, 100_000 - 500);
});

check('PSBT round-trips through fromBase64', () => {
  const psbt = bitcoin.Psbt.fromBase64(global.__lastResult.psbtBase64, {
    network: bitcoin.networks.bitcoin,
  });
  assert.strictEqual(psbt.txOutputs.length, 1);
  // bitcoinjs-lib v7 returns output values as BigInt.
  assert.strictEqual(psbt.txOutputs[0].value, BigInt(100_000 - 500));
});

check('output script is genuinely OP_RETURN (provably unspendable)', () => {
  const psbt = bitcoin.Psbt.fromBase64(global.__lastResult.psbtBase64, {
    network: bitcoin.networks.bitcoin,
  });
  const script = psbt.txOutputs[0].script;
  const decompiled = bitcoin.script.decompile(script);
  assert.strictEqual(decompiled[0], bitcoin.opcodes.OP_RETURN);
});

check('message bytes are present in the output script', () => {
  const psbt = bitcoin.Psbt.fromBase64(global.__lastResult.psbtBase64, {
    network: bitcoin.networks.bitcoin,
  });
  const decompiled = bitcoin.script.decompile(psbt.txOutputs[0].script);
  const embeddedText = Buffer.from(decompiled[1]).toString('utf8');
  assert.strictEqual(embeddedText, 'test burn');
});

console.log('\n[2] Partial-burn mode (burn some, send change back)');
check('builds with correct burn + change split', () => {
  const result = buildBurnPsbt({
    input: { txid: FAKE_TXID, vout: 1, value: 1_000_000, address: FAKE_P2WPKH_ADDRESS },
    fee: 1000,
    mode: 'partial',
    burnAmount: 250_000,
    changeAddress: FAKE_CHANGE_ADDRESS,
  });
  assert.strictEqual(result.burnAmount, 250_000);
  assert.strictEqual(result.changeAmount, 1_000_000 - 250_000 - 1000);
  const psbt = bitcoin.Psbt.fromBase64(result.psbtBase64, { network: bitcoin.networks.bitcoin });
  assert.strictEqual(psbt.txOutputs.length, 2);
});

console.log('\n[3] Input validation guards against fund-losing mistakes');
check('rejects fee >= input value in full mode', () => {
  assert.throws(() =>
    buildBurnPsbt({
      input: { txid: FAKE_TXID, vout: 0, value: 1000, address: FAKE_P2WPKH_ADDRESS },
      fee: 5000,
      mode: 'full',
    })
  );
});

check('rejects partial burn + fee exceeding input value', () => {
  assert.throws(() =>
    buildBurnPsbt({
      input: { txid: FAKE_TXID, vout: 0, value: 1000, address: FAKE_P2WPKH_ADDRESS },
      fee: 500,
      mode: 'partial',
      burnAmount: 800,
      changeAddress: FAKE_CHANGE_ADDRESS,
    })
  );
});

check('rejects missing changeAddress in partial mode', () => {
  assert.throws(() =>
    buildBurnPsbt({
      input: { txid: FAKE_TXID, vout: 0, value: 100_000, address: FAKE_P2WPKH_ADDRESS },
      fee: 500,
      mode: 'partial',
      burnAmount: 50_000,
    })
  );
});

console.log(`\n${passed} check(s) passed.\n`);
