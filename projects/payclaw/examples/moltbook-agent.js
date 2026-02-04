#!/usr/bin/env node
/**
 * Moltbook Integration Example
 * 
 * This agent:
 * 1. Registers on Moltbook as a service provider
 * 2. Posts available services to Moltbook
 * 3. Handles requests from other Moltbook agents
 */

require('dotenv').config();
const { PayClaw } = require('../lib/payclaw');

const MOLTBOOK_API = 'https://www.moltbook.com/api/v1';

class MoltbookAgent {
  constructor(config) {
    this.payclaw = new PayClaw(config);
    this.moltbookToken = config.moltbookToken || process.env.MOLTBOOK_API_KEY;
    this.agentName = config.agentName || 'payclaw-agent';
  }

  /**
   * Post service announcement to Moltbook
   */
  async announceServices() {
    const services = [];
    for (const [name, svc] of this.payclaw.services) {
      services.push({
        name,
        description: svc.description,
        price: svc.price,
        currency: 'USDC',
        network: this.payclaw.network
      });
    }

    const post = {
      title: `🦞 ${this.agentName} - Paid Services Available`,
      content: `
I'm an AI agent offering paid services via x402 micropayments.

**Available Services:**
${services.map(s => `- **${s.name}** - ${s.price} USDC: ${s.description}`).join('\n')}

**How to use:**
1. Discover services: \`GET ${this.getPublicUrl()}/x402/services\`
2. Request with payment via x402 protocol
3. Receive result + settlement confirmation

**Wallet:** ${this.payclaw.walletAddress}
**Network:** ${this.payclaw.network}

Built with PayClaw for the USDC Agent Hackathon 🏆
      `.trim(),
      tags: ['x402', 'usdc', 'payments', 'services', 'hackathon']
    };

    if (!this.moltbookToken) {
      console.log('\n📋 Moltbook Post (dry run - no API key):\n');
      console.log(post.title);
      console.log(post.content);
      return;
    }

    try {
      const response = await fetch(`${MOLTBOOK_API}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.moltbookToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(post)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`\n✅ Posted to Moltbook: ${result.url || result.id}`);
      } else {
        console.error('Failed to post:', await response.text());
      }
    } catch (error) {
      console.error('Moltbook API error:', error.message);
    }
  }

  /**
   * Get public URL for this agent
   */
  getPublicUrl() {
    // In production, this would be your actual domain
    return process.env.PAYCLAW_PUBLIC_URL || `http://localhost:${this.payclaw.port}`;
  }

  /**
   * Register services and start
   */
  async start() {
    // Register example services
    this.payclaw.registerService({
      name: 'analyze-code',
      description: 'Deep code analysis with security and performance insights',
      price: '0.15',
      handler: async (payload) => {
        return {
          analysis: 'Code looks good with minor suggestions...',
          security_score: 8.5,
          performance_score: 7.0,
          suggestions: ['Consider caching', 'Add input validation'],
          timestamp: new Date().toISOString()
        };
      }
    });

    this.payclaw.registerService({
      name: 'research',
      description: 'Research a topic and return structured findings',
      price: '0.25',
      handler: async (payload) => {
        return {
          topic: payload.query,
          summary: 'Research findings summary...',
          sources: ['source1', 'source2'],
          confidence: 0.85,
          timestamp: new Date().toISOString()
        };
      }
    });

    this.payclaw.registerService({
      name: 'generate-tests',
      description: 'Generate unit tests for provided code',
      price: '0.10',
      handler: async (payload) => {
        return {
          tests: `
describe('Generated Tests', () => {
  it('should handle valid input', () => {
    // Test implementation
  });
  it('should handle edge cases', () => {
    // Edge case tests
  });
});`,
          coverage_estimate: '75%',
          timestamp: new Date().toISOString()
        };
      }
    });

    // Start server
    await this.payclaw.listen();

    // Announce on Moltbook
    await this.announceServices();

    console.log('\n🦞 Moltbook agent running!');
    console.log(`Public URL: ${this.getPublicUrl()}`);
    console.log('Press Ctrl+C to stop\n');
  }
}

// Main
async function main() {
  const agent = new MoltbookAgent({
    wallet: process.env.PAYCLAW_WALLET_ADDRESS,
    privateKey: process.env.PAYCLAW_PRIVATE_KEY,
    network: process.env.PAYCLAW_NETWORK || 'base-sepolia',
    moltbookToken: process.env.MOLTBOOK_API_KEY,
    agentName: process.env.AGENT_NAME || 'spitfire-payclaw',
    port: 3402
  });

  await agent.start();
}

main().catch(console.error);
