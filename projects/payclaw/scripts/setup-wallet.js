#!/usr/bin/env node
/**
 * Generate a new wallet for PayClaw agent
 */

const { generateWallet } = require('../lib/payclaw');
const fs = require('fs');
const path = require('path');

const wallet = generateWallet();

console.log('\n🔐 New Agent Wallet Generated\n');
console.log(`Address:     ${wallet.address}`);
console.log(`Private Key: ${wallet.privateKey}`);
console.log(`Mnemonic:    ${wallet.mnemonic}`);
console.log('\n⚠️  SAVE THESE SECURELY - They cannot be recovered!\n');

// Create .env template
const envContent = `# PayClaw Configuration
PAYCLAW_WALLET_ADDRESS=${wallet.address}
PAYCLAW_PRIVATE_KEY=${wallet.privateKey}
PAYCLAW_NETWORK=base-sepolia
`;

const envPath = path.join(__dirname, '..', '.env.example');
fs.writeFileSync(envPath, envContent);
console.log(`📝 Environment template saved to: ${envPath}`);
console.log('\nCopy to .env and keep private key secure.');
