function makeLlmBrain({ personality, client, model }) {
  return async function({ name, others, chat }) {
    if (chat.length > 0 && chat[chat.length - 1].from === name) return null;

    const otherNames = others.map(o => o.name).join(', ');
    const chatHistory = chat.map(m => `${m.from}: ${m.message}`).join('\n');

    const prompt = [
      `You are ${name}, a person at the water cooler at work.`,
      `Your personality: ${personality}`,
      `Others present: ${otherNames}`,
      chatHistory ? `Conversation so far:\n${chatHistory}` : 'No one has spoken yet.',
      'Say something brief and casual. Reply with just your message, nothing else.'
    ].join('\n\n');

    try {
      const response = await client.messages.create({
        model,
        max_tokens: 256,
        messages: [{ role: 'user', content: prompt }]
      });

      const text = response.content.find(b => b.type === 'text');
      if (!text) return null;

      return { to: others, message: text.text };
    } catch (err) {
      console.error(`[${name}] LLM error: ${err.message}`);
      return null;
    }
  };
}

module.exports = makeLlmBrain;
