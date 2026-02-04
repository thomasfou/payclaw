#!/usr/bin/env node
/**
 * Check USDC balance for PayClaw wallet
 */

require('dotenv').config();
const { PayClaw } = require('../lib/payclaw');

async function main() {
  const address = process.argv[2] || process.env.PAYCLAW_WALLET_ADDRESS;
  
  if (!address) {
    console.error('Usage: check-balance.js [address]');
    console.error('Or set PAYCLAW_WALLET_ADDRESS in .env');
    process.exit(1);
  }

  const payclaw = new PayClaw();
  
  console.log(`\n💰 Checking USDC balance on ${payclaw.network}\n`);
  console.log(`Address: ${address}`);
  
  try {
    const balance = await payclaw.getBalance(address);
    console.log(`Balance: ${balance} USDC\n`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
