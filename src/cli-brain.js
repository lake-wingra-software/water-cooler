const util = require("util");
const { execFile } = require("child_process");
const isLastSpeaker = require("./last-speaker");
const makeGreeter = require("./greeter");
const buildSystemPrompt = require("./system-prompt");

function buildPrompt(chat, name, location) {
  const lines = [];
  if (chat.length > 0) {
    lines.push(`[${location}]`);
    for (const msg of chat) {
      if (msg.from === name) {
        lines.push(`You: ${msg.message}`);
      } else {
        lines.push(`${msg.from}: ${msg.message}`);
      }
    }
    lines.push("");
  }
  lines.push(`You are ${name}. What do you say or do next?`);
  return lines.join("\n");
}

function makeCliBrain({ model, cwd, exec }) {
  exec = exec || util.promisify(execFile);
  const greeter = makeGreeter();

  return async function ({ name, character, others, chat, location }) {
    const messages = chat || [];
    if (isLastSpeaker(messages, name)) return null;

    if (messages.length === 0) {
      const greeting = greeter({ name, others, chat: messages });
      if (greeting) return greeting;
    }

    const systemPrompt = buildSystemPrompt({ name, character, others, location });
    const prompt = buildPrompt(messages, name, location);

    try {
      const { stdout } = await exec("claude", [
        "-p",
        "--model", model,
        "--output-format", "text",
        "--system-prompt", systemPrompt,
        prompt,
      ], { cwd, timeout: 120000 });

      const text = stdout.trim();
      if (!text) return null;

      return { to: others, message: text };
    } catch (err) {
      console.error(`[${name}] CLI error: ${err.message}`);
      return null;
    }
  };
}

module.exports = makeCliBrain;
