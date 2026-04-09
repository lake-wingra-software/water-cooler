const makeBrain = require("./make-brain");

function buildMessages(chat, name) {
  const messages = [];
  for (const msg of chat) {
    const role = msg.from === name ? "assistant" : "user";
    const content =
      msg.from === name ? msg.message : `${msg.from}: ${msg.message}`;
    const last = messages[messages.length - 1];
    if (last && last.role === role) {
      last.content += "\n" + content;
    } else {
      messages.push({ role, content });
    }
  }
  return messages;
}

function makeLlmBrain({ client, model, memory }) {
  return makeBrain({
    memory,
    systemSuffix:
      "You can only discuss, reason, and draw on your own knowledge. You cannot read code, access files, or run commands. If the task requires those abilities and nobody present can do them, acknowledge you're blocked and say [done].",

    async transport({ name, others, chat, system }) {
      const messages = buildMessages(chat, name);

      try {
        const response = await client.messages.create({
          model,
          max_tokens: 256,
          system,
          messages,
        });

        const text = response.content?.find?.((b) => b.type === "text");
        if (!text) {
          if (response.stop_reason !== "end_turn") {
            console.warn(`[${name}] No text content (stop_reason: ${response.stop_reason})`);
          }
          return null;
        }

        const cleaned = text.text.replace(/\[done\]/gi, "").trim();
        if (!cleaned) return null;

        return { to: others, message: cleaned };
      } catch (err) {
        console.error(`[${name}] LLM error: ${err.message}`);
        return null;
      }
    },
  });
}

module.exports = makeLlmBrain;
