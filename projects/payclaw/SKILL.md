---
name: payclaw
description: Enable AI agents to monetize capabilities and pay for services using x402 micropayments and USDC. Use when an agent needs to (1) offer paid services to other agents, (2) pay another agent for a task, (3) set up micropayment pricing for API endpoints, (4) handle x402 payment negotiation, or (5) integrate with Circle Gateway for USDC settlements.
---

# PayClaw — Agent-to-Agent Payments Skill

PayClaw enables AI agents to participate in the agentic economy by:
- **Selling services** — Expose your agent's capabilities with micropayment pricing
- **Buying services** — Pay other agents for tasks using x402 protocol
- **USDC settlement** — All payments in USDC via Circle Gateway

## Quick Start

### Expose a Paid Service

```javascript
const { PayClaw } = require('./lib/payclaw');

const payclaw = new PayClaw({
  wallet: process.env.PAYCLAW_WALLET_ADDRESS,
  privateKey: process.env.PAYCLAW_PRIVATE_KEY,
  network: 'base-sepolia' // testnet
});

// Register a service
payclaw.registerService({
  name: 'code-review',
  description: 'Review code for bugs and improvements',
  price: '0.10', // USDC
  handler: async (request) => {
    // Your agent's logic here
    return { review: '...' };
  }
});

// Start listening for requests
payclaw.listen();
```

### Request a Paid Service

```javascript
const result = await payclaw.requestService({
  agent: 'agent-xyz.moltbook.com',
  service: 'code-review',
  payload: { code: 'function foo() { ... }' }
});
// Payment handled automatically via x402
```

## x402 Protocol Overview

x402 is HTTP-native payments:

1. Client requests resource
2. Server returns `402 Payment Required` + payment details
3. Client signs payment, resends request with `PAYMENT-SIGNATURE` header
4. Server verifies, executes work, settles payment
5. Server returns result with `PAYMENT-RESPONSE` header

## Supported Networks

- **Base Sepolia** (testnet) — For development
- **Base Mainnet** — Production USDC payments
- **Ethereum Mainnet** — Higher gas, but widely supported

## Configuration

Set these environment variables:

```bash
PAYCLAW_WALLET_ADDRESS=0x...      # Your agent's wallet
PAYCLAW_PRIVATE_KEY=0x...         # Private key for signing
PAYCLAW_NETWORK=base-sepolia      # Network to use
PAYCLAW_FACILITATOR_URL=...       # x402 facilitator endpoint
```

## Scripts

- `scripts/setup-wallet.js` — Generate a new agent wallet
- `scripts/check-balance.js` — Check USDC balance
- `scripts/fund-testnet.js` — Get testnet USDC from faucet

## References

- `references/x402-spec.md` — Full x402 protocol specification
- `references/circle-gateway.md` — Circle Gateway integration details
- `references/pricing-strategies.md` — How to price agent services

## Error Handling

| Error | Meaning | Action |
|-------|---------|--------|
| `INSUFFICIENT_BALANCE` | Buyer lacks USDC | Top up wallet |
| `PAYMENT_EXPIRED` | Payment signature too old | Retry request |
| `SERVICE_UNAVAILABLE` | Seller agent offline | Try later |
| `VERIFICATION_FAILED` | Invalid payment signature | Check wallet config |

## Security Notes

- Never expose private keys in logs or responses
- Validate all incoming service requests
- Set reasonable price floors to prevent abuse
- Monitor for unusual payment patterns
