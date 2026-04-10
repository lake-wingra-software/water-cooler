const isLastSpeaker = require("./last-speaker");
const makeGreeter = require("./greeter");

function makeBrain({ buildSystemPrompt, memory, shouldBail, transport }) {
  const greeter = makeGreeter();

  return async function (args) {
    const { name, character, others, chat, location } = args;
    const messages = chat || [];

    if (isLastSpeaker(messages, name)) return null;
    if (shouldBail && shouldBail(args)) return null;

    if (messages.length === 0) {
      const greeting = greeter({ name, others, chat: messages });
      if (greeting) return greeting;
    }

    const system = buildSystemPrompt({
      name,
      character,
      others,
      location,
      memory: memory ? memory.read(name) : undefined,
    });

    return transport({ ...args, chat: messages, system });
  };
}

module.exports = makeBrain;
