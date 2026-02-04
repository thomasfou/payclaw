# Circle Gateway Integration

Circle Gateway provides chain-abstracted USDC for x402 payments.

## Key Features

### 1. Chain Abstraction
Single USDC balance works across all supported chains:
- Ethereum
- Base
- Arbitrum
- Solana
- And more...

### 2. Batching (Coming Soon)
Bundle thousands of micropayments into single on-chain settlement:
- Eliminates per-transaction gas
- Enables true micropayments
- Sub-cent transactions become viable

### 3. Cross-Chain Agency
Buyer on Chain A can pay Seller on Chain B seamlessly.

## Integration with x402

Circle proposed connecting Gateway to x402:
https://github.com/coinbase/x402/issues/447

### How It Works

1. Client creates x402 payment intent
2. Gateway handles chain selection automatically
3. Payment batched with others for efficiency
4. Seller receives USDC on their preferred chain

## Related Protocols

### A2A (Agent-to-Agent)
Google's protocol for direct agent-to-agent payments.
Circle Gateway x402 serves as the payment layer.

### AP2 (Agent Payments Protocol)
Google + Circle collaboration for:
- Agent-to-human payments
- Agent-to-service payments
- Hybrid autonomous + manual flows

## Getting Started

1. Sign up at https://www.circle.com/gateway
2. Get API credentials
3. Configure in PayClaw:

```javascript
const payclaw = new PayClaw({
  facilitatorUrl: 'https://gateway.circle.com/x402',
  // ... other config
});
```

## Testnet

Use Base Sepolia for development:
- Network: `base-sepolia`
- Faucet: https://faucet.circle.com/

## References

- Circle Gateway: https://www.circle.com/gateway
- Circle Blog on x402: https://www.circle.com/blog/enabling-machine-to-machine-micropayments-with-gateway-and-usdc
