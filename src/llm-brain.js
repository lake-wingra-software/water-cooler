function makeLlmBrain({ characterSheet, client, model, minutesPerTurn }) {
  return async function({ name, others, chat, location, minutesRemaining }) {
    if (chat.length > 0 && chat[chat.length - 1].from === name) return null;

    const estimatedTurnsRemaining = Math.floor(minutesRemaining / minutesPerTurn);
    if (estimatedTurnsRemaining === 0) return null;

    const otherNames = others.map(o => o.name).join(', ');

    const systemLines = [
      `You are ${name}, a ${characterSheet.role} at the ${location} at work.`,
      `Your personality traits: ${characterSheet.traits}`,
    ];
    if (characterSheet.goals && characterSheet.goals.length > 0) {
      systemLines.push(`Your goals: ${characterSheet.goals.join(', ')}`);
    }
    systemLines.push(
      `Others present: ${otherNames}`,
      `You have ${estimatedTurnsRemaining} turns remaining at this location.`,
      'Say something brief and casual. Reply with spoken words only — no stage directions, actions, or text in asterisks.'
    );
    const system = systemLines.join('\n\n');

    const chatHistory = chat.map(m => `${m.from}: ${m.message}`).join('\n');
    const userContent = chatHistory || 'No one has spoken yet.';

    try {
      const response = await client.messages.create({
        model,
        max_tokens: 256,
        system,
        messages: [{ role: 'user', content: userContent }]
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
