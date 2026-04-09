function makeReflectionBrain({ client, model, memory }) {
  return async function reflect({ name, chat }) {
    const existingMemory = memory.read(name);
    const transcript = chat.map((m) => `${m.from}: ${m.message}`).join("\n");

    const prompt =
      `You are updating ${name}'s memory file after a conversation at work.\n\n` +
      `Existing memory:\n${existingMemory}\n\n` +
      `Conversation transcript:\n${transcript}\n\n` +
      `Rewrite ${name}'s memory to incorporate any important information from this conversation. ` +
      `Return only the updated memory content — no preamble or explanation.`;

    try {
      const response = await client.messages.create({
        model,
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });

      const text = response.content?.find?.((b) => b.type === "text");
      if (text) {
        memory.write(name, text.text);
      }
    } catch (err) {
      console.error(`[${name}] reflection error: ${err.message}`);
    }
  };
}

module.exports = makeReflectionBrain;
