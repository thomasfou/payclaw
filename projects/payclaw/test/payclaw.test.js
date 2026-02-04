#!/usr/bin/env node
/**
 * PayClaw Basic Tests
 */

const { PayClaw, generateWallet, USDC_ADDRESSES } = require('../lib/payclaw');

console.log('\n🧪 PayClaw Test Suite\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

// Test: Generate wallet
test('generateWallet creates valid wallet', () => {
  const wallet = generateWallet();
  assert(wallet.address.startsWith('0x'), 'Address should start with 0x');
  assert(wallet.address.length === 42, 'Address should be 42 chars');
  assert(wallet.privateKey.startsWith('0x'), 'Private key should start with 0x');
  assert(wallet.mnemonic.split(' ').length === 12, 'Mnemonic should be 12 words');
});

// Test: USDC addresses
test('USDC_ADDRESSES contains expected networks', () => {
  assert(USDC_ADDRESSES['base-sepolia'], 'Should have base-sepolia');
  assert(USDC_ADDRESSES['base'], 'Should have base');
  assert(USDC_ADDRESSES['ethereum'], 'Should have ethereum');
});

// Test: PayClaw initialization
test('PayClaw initializes with defaults', () => {
  const payclaw = new PayClaw();
  assert(payclaw.network === 'base-sepolia', 'Default network should be base-sepolia');
  assert(payclaw.port === 3402, 'Default port should be 3402');
  assert(payclaw.services instanceof Map, 'Services should be a Map');
});

// Test: Service registration
test('PayClaw registers service', () => {
  const payclaw = new PayClaw();
  payclaw.registerService({
    name: 'test-service',
    description: 'A test service',
    price: '0.10',
    handler: async () => ({ result: 'ok' })
  });
  assert(payclaw.services.has('test-service'), 'Service should be registered');
  const svc = payclaw.services.get('test-service');
  assert(svc.price === '0.10', 'Price should be 0.10');
});

// Test: Payment required generation
test('PayClaw generates payment required', () => {
  const wallet = generateWallet();
  const payclaw = new PayClaw({ wallet: wallet.address });
  payclaw.registerService({
    name: 'test',
    price: '0.05',
    handler: async () => ({})
  });
  
  const paymentReq = payclaw.generatePaymentRequired('test', 'req_123');
  const decoded = JSON.parse(Buffer.from(paymentReq, 'base64').toString());
  
  assert(decoded.scheme === 'exact', 'Scheme should be exact');
  assert(decoded.maxAmountRequired === '0.05', 'Amount should be 0.05');
  assert(decoded.payTo === wallet.address, 'PayTo should be wallet address');
});

// Test: Missing service throws
test('PayClaw throws on missing service', () => {
  const payclaw = new PayClaw();
  let threw = false;
  try {
    payclaw.generatePaymentRequired('nonexistent', 'req_123');
  } catch (e) {
    threw = true;
  }
  assert(threw, 'Should throw for missing service');
});

// Summary
console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
