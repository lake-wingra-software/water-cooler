function makeLlmBrain({ characterSheet, client, model, minutesPerTurn }) {
  return async function({ name, others, chat, location, minutesRemaining }) {
    if (chat.length > 0 && chat[chat.length - 1].from === name) return null;

    const estimatedTurnsRemaining = Math.floor(minutesRemaining / minutesPerTurn);
    if (estimatedTurnsRemaining === 0) return null;

    const otherNames = others.map(o => o.name).join(', ');
    const chatHistory = chat.map(m => `${m.from}: ${m.message}`).join('\n');

    const lines = [
      `You are ${name}, a ${characterSheet.role} at the ${location} at work.`,
      `Your personality traits: ${characterSheet.traits}`,
    ];
    if (characterSheet.goals && characterSheet.goals.length > 0) {
      lines.push(`Your goals: ${characterSheet.goals.join(', ')}`);
    }
    lines.push(
      `Others present: ${otherNames}`,
      chatHistory ? `Conversation so far:\n${chatHistory}` : 'No one has spoken yet.',
      `You have ${estimatedTurnsRemaining} turns remaining at this location.`,
      'Say something brief and casual. Reply with spoken words only — no stage directions, actions, or text in asterisks.'
    );

    const prompt = lines.join('\n\n');

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
