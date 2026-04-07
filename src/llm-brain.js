const isLastSpeaker = require("./last-speaker");
const buildSystemPrompt = require("./system-prompt");
const makeGreeter = require("./greeter");

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

function makeLlmBrain({ client, model, minutesPerTurn }) {
  const greeter = makeGreeter();
  return async function ({
    name,
    character,
    others,
    chat,
    location,
    minutesRemaining,
  }) {
    const messages_so_far = chat || [];
    if (isLastSpeaker(messages_so_far, name)) return null;

    const estimatedTurnsRemaining = Math.floor(
      minutesRemaining / minutesPerTurn,
    );
    if (estimatedTurnsRemaining === 0) return null;

    if (messages_so_far.length === 0) {
      const greeting = greeter({ name, others, chat: messages_so_far });
      if (greeting) return greeting;
    }

    const system = buildSystemPrompt({
      name,
      character,
      others,
      location,
      // minutesRemaining,
      // minutesPerTurn,
    });

    const messages = buildMessages(messages_so_far, name);

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

      return { to: others, message: text.text };
    } catch (err) {
      console.error(`[${name}] LLM error: ${err.message}`);
      return null;
    }
  };
}

module.exports = makeLlmBrain;
