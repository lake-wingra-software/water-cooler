function buildMessages(chat, name) {
  const messages = [];
  for (const msg of chat) {
    const role = msg.from === name ? 'assistant' : 'user';
    const content = msg.from === name ? msg.message : `${msg.from}: ${msg.message}`;
    const last = messages[messages.length - 1];
    if (last && last.role === role) {
      last.content += '\n' + content;
    } else {
      messages.push({ role, content });
    }
  }
  return messages;
}

const isLastSpeaker = require('./last-speaker');

function makeLlmBrain({ characterSheet, client, model, minutesPerTurn }) {
  return async function({ name, others, chat, location, minutesRemaining }) {
    if (isLastSpeaker(chat, name)) return null;

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

    const messages = chat.length === 0
      ? [{ role: 'user', content: 'No one has spoken yet.' }]
      : buildMessages(chat, name);

    try {
      const response = await client.messages.create({
        model,
        max_tokens: 256,
        system,
        messages,
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
