# x402 Protocol Specification

x402 is an open standard for internet-native payments built on HTTP.

## Core Flow

```
Client                    Server                    Facilitator
  |                         |                            |
  |--- GET /resource ------>|                            |
  |<-- 402 + PaymentReq ----|                            |
  |                         |                            |
  |--- Sign payment --------|                            |
  |                         |                            |
  |--- GET + PaymentSig --->|                            |
  |                         |--- POST /verify ---------->|
  |                         |<-- { valid: true } --------|
  |                         |                            |
  |                         |    [Execute work]          |
  |                         |                            |
  |                         |--- POST /settle ---------->|
  |                         |<-- { tx: "0x..." } --------|
  |                         |                            |
  |<-- 200 + PaymentResp ---|                            |
```

## Payment Required Response (402)

Server returns with header:
```
HTTP/1.1 402 Payment Required
payment-required: <base64-encoded PaymentRequirements>
```

### PaymentRequirements Schema

```json
{
  "scheme": "exact",
  "network": "base-sepolia",
  "maxAmountRequired": "0.10",
  "resource": "/code-review",
  "description": "Code review service",
  "mimeType": "application/json",
  "payTo": "0x1234...",
  "maxTimeoutSeconds": 300,
  "asset": "eip155:84532/erc20:0x036CbD53842c5426634e7929541eC2318f3dCF7e"
}
```

## Payment Signature

Client signs payment and sends:
```
payment-signature: <base64-encoded PaymentPayload>
```

### PaymentPayload Schema

```json
{
  "scheme": "exact",
  "network": "base-sepolia",
  "payload": {
    "signature": "0x...",
    "authorization": {
      "from": "0xbuyer...",
      "to": "0xseller...",
      "value": "100000",
      "validAfter": 1706918400,
      "validBefore": 1706918700,
      "nonce": "0x..."
    }
  }
}
```

## Schemes

### exact
Transfer a specific amount. Used for fixed-price services.

### upto (planned)
Transfer up to a maximum amount based on actual consumption.
Useful for LLM token-based pricing.

## Networks

| Network | Chain ID | USDC Address |
|---------|----------|--------------|
| Base Sepolia | 84532 | 0x036CbD53842c5426634e7929541eC2318f3dCF7e |
| Base | 8453 | 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 |
| Ethereum | 1 | 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 |

## Facilitator Endpoints

### POST /verify
Verify payment signature is valid without executing.

### POST /settle
Execute the payment on-chain.

## SDK Packages

```bash
npm install @x402/core @x402/evm @x402/fetch @x402/express
```

## References

- GitHub: https://github.com/coinbase/x402
- Docs: https://x402.org
- Circle Gateway: https://www.circle.com/gateway
