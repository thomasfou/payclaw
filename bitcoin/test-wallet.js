import { readFileSync } from 'fs';
import { NWCClient } from '@getalby/sdk';

// Load NWC URL from .env.keys
const envContent = readFileSync('.env.keys', 'utf8');
const nwcUrl = envContent.match(/NWC_URL=(.*)/)?.[1];

if (!nwcUrl) {
  console.error('❌ No NWC_URL found in .env.keys');
  process.exit(1);
}

console.log('⚡ Connecting to Lightning wallet via NWC...');

const client = new NWCClient({ nostrWalletConnectUrl: nwcUrl });

try {
  // Check balance
  const balance = await client.getBalance();
  console.log(`💰 Balance: ${balance.balance} sats`);

  // Get wallet info
  const info = await client.getInfo();
  console.log(`ℹ️  Wallet info:`, JSON.stringify(info, null, 2));

  // Create a test invoice (receive)
  const invoice = await client.makeInvoice({
    amount: 1000, // 1000 sats
    description: 'Spitfire test invoice'
  });
  console.log(`\n📄 Test Invoice Created (1000 sats):`);
  console.log(`   Invoice: ${invoice.invoice.substring(0, 60)}...`);
  console.log(`   Payment hash: ${invoice.payment_hash}`);

  console.log('\n✅ Wallet connected and working!');
} catch (err) {
  console.error('❌ Error:', err.message);
} finally {
  client.close();
}
