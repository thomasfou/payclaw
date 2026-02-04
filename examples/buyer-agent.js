#!/usr/bin/env node
/**
 * Example: Agent buying services from another agent
 * 
 * This agent discovers and pays for services from a seller agent.
 */

require('dotenv').config();
const { PayClaw } = require('../lib/payclaw');

// Initialize PayClaw with wallet (needs funds to pay)
const payclaw = new PayClaw({
  wallet: process.env.PAYCLAW_WALLET_ADDRESS,
  privateKey: process.env.PAYCLAW_PRIVATE_KEY,
  network: process.env.PAYCLAW_NETWORK || 'base-sepolia'
});

async function main() {
  console.log('\n🦞 PayClaw Buyer Agent Example\n');
  
  // Seller agent URL (default: local seller-agent.js)
  const sellerUrl = process.argv[2] || 'http://localhost:3402';
  console.log(`Target seller: ${sellerUrl}\n`);
  
  // Check our balance
  try {
    const balance = await payclaw.getBalance();
    console.log(`Our USDC balance: ${balance}`);
    
    if (parseFloat(balance) < 0.1) {
      console.log('\n⚠️  Low balance! Run scripts/fund-testnet.js first.\n');
    }
  } catch (e) {
    console.log('Could not fetch balance');
  }
  
  // Discover available services
  console.log('\n📡 Discovering services...\n');
  try {
    const response = await fetch(`${sellerUrl}/x402/services`);
    const { services, agent } = await response.json();
    
    console.log(`Seller agent: ${agent}`);
    console.log('Available services:');
    for (const svc of services) {
      console.log(`  - ${svc.name}: ${svc.price} ${svc.currency} - ${svc.description}`);
    }
  } catch (e) {
    console.error('Could not connect to seller:', e.message);
    console.log('\nMake sure seller-agent.js is running on port 3402');
    process.exit(1);
  }
  
  // Request code review service
  console.log('\n💸 Requesting code-review service...\n');
  
  try {
    const result = await payclaw.requestService({
      agent: sellerUrl,
      service: 'code-review',
      payload: {
        code: `
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}`,
        language: 'javascript'
      }
    });
    
    console.log('✅ Service completed! Result:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Service request failed:', error.message);
    
    if (error.message.includes('402')) {
      console.log('\nPayment required but failed - check wallet balance and config');
    }
  }
  
  // Request summarize service
  console.log('\n💸 Requesting summarize service...\n');
  
  try {
    const result = await payclaw.requestService({
      agent: sellerUrl,
      service: 'summarize',
      payload: {
        text: 'The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet. It is often used for testing fonts and keyboard layouts. The phrase has been used since at least the late 19th century.',
        max_length: 20
      }
    });
    
    console.log('✅ Service completed! Result:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Service request failed:', error.message);
  }
  
  console.log('\n✨ Demo complete!\n');
}

main().catch(console.error);
