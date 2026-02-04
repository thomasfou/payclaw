/**
 * PayClaw — Agent-to-Agent Payments via x402
 * 
 * Enables AI agents to monetize capabilities and pay for services
 * using the x402 protocol with USDC settlements.
 */

const { ethers } = require('ethers');
const express = require('express');

// USDC contract addresses
const USDC_ADDRESSES = {
  'base-sepolia': '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  'base': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  'ethereum': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
};

// x402 facilitator endpoints
const FACILITATORS = {
  'base-sepolia': 'https://x402.org/facilitator',
  'base': 'https://x402.org/facilitator',
  'ethereum': 'https://x402.org/facilitator'
};

// Minimal ERC20 ABI for USDC
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)'
];

class PayClaw {
  constructor(config = {}) {
    this.network = config.network || process.env.PAYCLAW_NETWORK || 'base-sepolia';
    this.walletAddress = config.wallet || process.env.PAYCLAW_WALLET_ADDRESS;
    this.privateKey = config.privateKey || process.env.PAYCLAW_PRIVATE_KEY;
    this.facilitatorUrl = config.facilitatorUrl || FACILITATORS[this.network];
    this.port = config.port || 3402;
    
    // Service registry
    this.services = new Map();
    
    // Express app for receiving requests
    this.app = express();
    this.app.use(express.json());
    
    // Initialize wallet if private key provided
    if (this.privateKey) {
      this.wallet = new ethers.Wallet(this.privateKey);
    }
    
    // RPC endpoints
    this.rpcUrls = {
      'base-sepolia': 'https://sepolia.base.org',
      'base': 'https://mainnet.base.org',
      'ethereum': 'https://eth.llamarpc.com'
    };
  }

  /**
   * Get provider for current network
   */
  getProvider() {
    const rpcUrl = this.rpcUrls[this.network];
    return new ethers.JsonRpcProvider(rpcUrl);
  }

  /**
   * Get USDC contract instance
   */
  getUsdcContract() {
    const provider = this.getProvider();
    const usdcAddress = USDC_ADDRESSES[this.network];
    return new ethers.Contract(usdcAddress, ERC20_ABI, provider);
  }

  /**
   * Check USDC balance
   */
  async getBalance(address = this.walletAddress) {
    const usdc = this.getUsdcContract();
    const balance = await usdc.balanceOf(address);
    const decimals = await usdc.decimals();
    return ethers.formatUnits(balance, decimals);
  }

  /**
   * Register a paid service
   */
  registerService({ name, description, price, handler }) {
    if (!name || !price || !handler) {
      throw new Error('Service requires name, price, and handler');
    }
    
    this.services.set(name, {
      name,
      description: description || '',
      price: price.toString(),
      handler
    });
    
    console.log(`[PayClaw] Registered service: ${name} @ ${price} USDC`);
    return this;
  }

  /**
   * Generate x402 PaymentRequired response
   */
  generatePaymentRequired(serviceName, requestId) {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service not found: ${serviceName}`);
    }

    const paymentDetails = {
      scheme: 'exact',
      network: this.network,
      maxAmountRequired: service.price,
      resource: `/${serviceName}`,
      description: service.description,
      mimeType: 'application/json',
      payTo: this.walletAddress,
      maxTimeoutSeconds: 300,
      asset: `eip155:${this.network === 'base-sepolia' ? '84532' : '8453'}/erc20:${USDC_ADDRESSES[this.network]}`,
      extra: {
        name: service.name,
        requestId
      }
    };

    return Buffer.from(JSON.stringify(paymentDetails)).toString('base64');
  }

  /**
   * Verify payment via facilitator
   */
  async verifyPayment(paymentSignature, paymentRequired) {
    try {
      const response = await fetch(`${this.facilitatorUrl}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentPayload: paymentSignature,
          paymentRequirements: paymentRequired
        })
      });
      
      const result = await response.json();
      return result.valid === true;
    } catch (error) {
      console.error('[PayClaw] Verification failed:', error.message);
      return false;
    }
  }

  /**
   * Settle payment via facilitator
   */
  async settlePayment(paymentSignature, paymentRequired) {
    try {
      const response = await fetch(`${this.facilitatorUrl}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentPayload: paymentSignature,
          paymentRequirements: paymentRequired
        })
      });
      
      return await response.json();
    } catch (error) {
      console.error('[PayClaw] Settlement failed:', error.message);
      throw error;
    }
  }

  /**
   * Create payment signature for requesting a service
   */
  async createPaymentSignature(paymentRequired) {
    if (!this.wallet) {
      throw new Error('Wallet not configured - set privateKey');
    }

    const details = JSON.parse(Buffer.from(paymentRequired, 'base64').toString());
    
    // Create payment payload
    const payload = {
      scheme: details.scheme,
      network: details.network,
      payload: {
        signature: '', // Will be filled
        authorization: {
          from: this.walletAddress,
          to: details.payTo,
          value: ethers.parseUnits(details.maxAmountRequired, 6).toString(),
          validAfter: Math.floor(Date.now() / 1000) - 60,
          validBefore: Math.floor(Date.now() / 1000) + details.maxTimeoutSeconds,
          nonce: ethers.hexlify(ethers.randomBytes(32))
        }
      }
    };

    // Sign the authorization (simplified - real impl needs EIP-712)
    const message = ethers.solidityPackedKeccak256(
      ['address', 'address', 'uint256', 'uint256', 'uint256', 'bytes32'],
      [
        payload.payload.authorization.from,
        payload.payload.authorization.to,
        payload.payload.authorization.value,
        payload.payload.authorization.validAfter,
        payload.payload.authorization.validBefore,
        payload.payload.authorization.nonce
      ]
    );
    
    payload.payload.signature = await this.wallet.signMessage(ethers.getBytes(message));
    
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  /**
   * Request a paid service from another agent
   */
  async requestService({ agent, service, payload }) {
    const url = agent.startsWith('http') ? agent : `https://${agent}`;
    const endpoint = `${url}/x402/${service}`;
    
    // First request - expect 402
    let response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.status === 402) {
      // Get payment requirements
      const paymentRequired = response.headers.get('payment-required');
      if (!paymentRequired) {
        throw new Error('Server returned 402 but no payment requirements');
      }

      // Create and sign payment
      const paymentSignature = await this.createPaymentSignature(paymentRequired);

      // Retry with payment
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'payment-signature': paymentSignature
        },
        body: JSON.stringify(payload)
      });
    }

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Setup express routes for all registered services
   */
  setupRoutes() {
    // Service discovery endpoint
    this.app.get('/x402/services', (req, res) => {
      const services = [];
      for (const [name, svc] of this.services) {
        services.push({
          name,
          description: svc.description,
          price: svc.price,
          currency: 'USDC'
        });
      }
      res.json({ services, agent: this.walletAddress, network: this.network });
    });

    // Service endpoints
    for (const [name, service] of this.services) {
      this.app.post(`/x402/${name}`, async (req, res) => {
        const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        
        // Check for payment
        const paymentSignature = req.headers['payment-signature'];
        
        if (!paymentSignature) {
          // Return 402 with payment requirements
          const paymentRequired = this.generatePaymentRequired(name, requestId);
          res.status(402)
            .set('payment-required', paymentRequired)
            .json({
              error: 'Payment required',
              service: name,
              price: service.price,
              currency: 'USDC'
            });
          return;
        }

        try {
          // Verify payment
          const paymentRequired = this.generatePaymentRequired(name, requestId);
          const valid = await this.verifyPayment(paymentSignature, paymentRequired);
          
          if (!valid) {
            res.status(402).json({ error: 'Payment verification failed' });
            return;
          }

          // Execute service
          const result = await service.handler(req.body, {
            requestId,
            payer: req.headers['x-payer-address']
          });

          // Settle payment
          const settlement = await this.settlePayment(paymentSignature, paymentRequired);

          res.set('payment-response', Buffer.from(JSON.stringify(settlement)).toString('base64'))
            .json(result);
        } catch (error) {
          console.error(`[PayClaw] Service ${name} error:`, error);
          res.status(500).json({ error: error.message });
        }
      });
    }

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', agent: this.walletAddress, services: this.services.size });
    });
  }

  /**
   * Start the payment server
   */
  listen(port = this.port) {
    this.setupRoutes();
    return new Promise((resolve) => {
      this.server = this.app.listen(port, () => {
        console.log(`[PayClaw] Agent payment server running on port ${port}`);
        console.log(`[PayClaw] Wallet: ${this.walletAddress}`);
        console.log(`[PayClaw] Network: ${this.network}`);
        console.log(`[PayClaw] Services: ${Array.from(this.services.keys()).join(', ')}`);
        resolve(this.server);
      });
    });
  }

  /**
   * Stop the server
   */
  close() {
    if (this.server) {
      this.server.close();
    }
  }
}

/**
 * Generate a new wallet for an agent
 */
function generateWallet() {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic.phrase
  };
}

module.exports = { PayClaw, generateWallet, USDC_ADDRESSES, FACILITATORS };
