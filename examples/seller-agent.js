#!/usr/bin/env node
/**
 * Example: Agent offering paid services via PayClaw
 * 
 * This agent offers three services:
 * 1. Code review - Analyzes code for issues
 * 2. Summarize - Summarizes text content
 * 3. Translate - Translates text to another language
 */

require('dotenv').config();
const { PayClaw } = require('../lib/payclaw');

// Initialize PayClaw with wallet
const payclaw = new PayClaw({
  wallet: process.env.PAYCLAW_WALLET_ADDRESS,
  privateKey: process.env.PAYCLAW_PRIVATE_KEY,
  network: process.env.PAYCLAW_NETWORK || 'base-sepolia',
  port: 3402
});

// Service 1: Code Review ($0.10 USDC)
payclaw.registerService({
  name: 'code-review',
  description: 'Analyze code for bugs, security issues, and improvements',
  price: '0.10',
  handler: async (payload) => {
    const { code, language } = payload;
    
    // In a real agent, this would call an LLM
    // For demo, return mock analysis
    return {
      issues: [
        { severity: 'warning', line: 3, message: 'Consider using const instead of let' },
        { severity: 'info', line: 7, message: 'Function could be simplified' }
      ],
      suggestions: [
        'Add error handling for edge cases',
        'Consider adding TypeScript types'
      ],
      score: 7.5,
      reviewed_at: new Date().toISOString()
    };
  }
});

// Service 2: Summarize ($0.05 USDC)
payclaw.registerService({
  name: 'summarize',
  description: 'Generate a concise summary of text content',
  price: '0.05',
  handler: async (payload) => {
    const { text, max_length } = payload;
    
    // Mock summarization
    const words = text.split(/\s+/);
    const summaryLength = Math.min(max_length || 50, Math.floor(words.length * 0.3));
    
    return {
      summary: words.slice(0, summaryLength).join(' ') + '...',
      original_length: words.length,
      summary_length: summaryLength,
      compression_ratio: (summaryLength / words.length).toFixed(2)
    };
  }
});

// Service 3: Translate ($0.08 USDC)
payclaw.registerService({
  name: 'translate',
  description: 'Translate text to another language',
  price: '0.08',
  handler: async (payload) => {
    const { text, target_language } = payload;
    
    // Mock translation
    return {
      original: text,
      translated: `[${target_language}] ${text}`, // Mock - real agent uses LLM
      source_language: 'en',
      target_language,
      confidence: 0.95
    };
  }
});

// Start the agent
async function main() {
  console.log('\n🦞 PayClaw Seller Agent Example\n');
  
  // Check balance
  try {
    const balance = await payclaw.getBalance();
    console.log(`Current USDC balance: ${balance}`);
  } catch (e) {
    console.log('Could not fetch balance (normal if no RPC)');
  }
  
  // Start server
  await payclaw.listen();
  
  console.log('\n📡 Available services:');
  console.log('  POST /x402/code-review  - 0.10 USDC');
  console.log('  POST /x402/summarize    - 0.05 USDC');
  console.log('  POST /x402/translate    - 0.08 USDC');
  console.log('  GET  /x402/services     - List all services');
  console.log('\nPress Ctrl+C to stop\n');
}

main().catch(console.error);
