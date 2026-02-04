#!/usr/bin/env node
/**
 * Get testnet USDC from faucet
 */

require('dotenv').config();

async function main() {
  const address = process.argv[2] || process.env.PAYCLAW_WALLET_ADDRESS;
  
  if (!address) {
    console.error('Usage: fund-testnet.js [address]');
    console.error('Or set PAYCLAW_WALLET_ADDRESS in .env');
    process.exit(1);
  }

  console.log('\n🚰 Testnet USDC Faucets\n');
  console.log(`Your wallet: ${address}\n`);
  
  console.log('Base Sepolia USDC:');
  console.log(`  1. Get Sepolia ETH for gas: https://www.alchemy.com/faucets/base-sepolia`);
  console.log(`  2. Get USDC from Circle faucet: https://faucet.circle.com/`);
  console.log(`     - Select "Base Sepolia" network`);
  console.log(`     - Enter your address`);
  console.log(`     - Request USDC\n`);
  
  console.log('Alternative - Uniswap testnet:');
  console.log(`  https://app.uniswap.org/ (switch to Base Sepolia)\n`);
  
  console.log('After funding, check balance with:');
  console.log(`  node scripts/check-balance.js ${address}\n`);
}

main();
