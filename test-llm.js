require('dotenv').config();

const Anthropic = require('@anthropic-ai/sdk');
const makeLlmBrain = require('./src/llm-brain');

const client = new Anthropic({
  baseURL: process.env.ANTHROPIC_URL || undefined
});

console.log('Base URL:', process.env.ANTHROPIC_URL);
console.log('API Key:', process.env.ANTHROPIC_API_KEY ? '(set)' : '(not set)');

const brain = makeLlmBrain({ characterSheet: { traits: 'friendly', role: 'software engineer' }, client });

brain({ name: 'Chad', others: [{ name: 'Alice' }], chat: [] })
  .then(result => console.log('Result:', result))
  .catch(err => console.error('Error:', err.message));
