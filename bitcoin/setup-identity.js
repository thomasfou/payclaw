import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools';
import { writeFileSync, existsSync } from 'fs';

// Check if keys already exist
if (existsSync('.env.keys')) {
  console.log('⚠️  Keys already exist in .env.keys — not regenerating.');
  console.log('Delete .env.keys first if you want new keys.');
  process.exit(0);
}

// Generate new keypair
const sk = generateSecretKey(); // Uint8Array
const pk = getPublicKey(sk);

// Encode to human-readable Nostr format
const nsec = nip19.nsecEncode(sk);
const npub = nip19.npubEncode(pk);

// Save to .env.keys (NOT in .env to avoid accidental exposure)
const envContent = `# Spitfire's Nostr Identity - Generated ${new Date().toISOString()}
# NEVER share the nsec (private key)!
NOSTR_PRIVATE_KEY=${nsec}
NOSTR_PUBLIC_KEY=${npub}
NOSTR_PUBLIC_KEY_HEX=${pk}
`;

writeFileSync('.env.keys', envContent, { mode: 0o600 });

console.log('🔑 Nostr Identity Generated!');
console.log(`   Public Key (npub): ${npub}`);
console.log(`   Hex: ${pk}`);
console.log('   Private key saved to .env.keys (mode 600)');
console.log('');
console.log('Share your npub freely. NEVER share your nsec.');
