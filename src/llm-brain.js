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

function makeLlmBrain({ client, model, minutesPerTurn, memory }) {
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
      memory: memory ? memory.read(name) : undefined,
    }) + "\nYou can only discuss, reason, and draw on your own knowledge. You cannot read code, access files, or run commands. If the task requires those abilities and nobody present can do them, acknowledge you're blocked and say [done].";

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

      const cleaned = text.text.replace(/\[done\]/gi, "").trim();
      if (!cleaned) return null;

      return { to: others, message: cleaned };
    } catch (err) {
      console.error(`[${name}] LLM error: ${err.message}`);
      return null;
    }
  };
}

module.exports = makeLlmBrain;
