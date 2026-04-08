const { execFile } = require("child_process");
const isLastSpeaker = require("./last-speaker");
const makeGreeter = require("./greeter");
const buildSystemPrompt = require("./system-prompt");

function execClaude(cmd, args, opts) {
  return new Promise((resolve, reject) => {
    const child = execFile(cmd, args, opts, (err, stdout) => {
      if (err) return reject(err);
      resolve({ stdout });
    });
    if (opts.input) {
      child.stdin.write(opts.input);
      child.stdin.end();
    }
  });
}

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

function makeCliBrain({ model, cwd, exec, allowedTools }) {
  exec = exec || execClaude;
  const greeter = makeGreeter();

  return async function ({ name, character, others, chat, location }) {
    const messages = chat || [];
    if (isLastSpeaker(messages, name)) return null;

    if (messages.length === 0) {
      const greeting = greeter({ name, others, chat: messages });
      if (greeting) return greeting;
    }

    const systemPrompt = buildSystemPrompt({ name, character, others, location })
      + "\nYou can read code, search files, and explore the codebase to complete your work.";
    const prompt = buildPrompt(messages, name, location);

    try {
      const flags = [
        "-p",
        "--model", model,
        "--output-format", "text",
        "--system-prompt", systemPrompt,
      ];
      if (allowedTools && allowedTools.length > 0) {
        flags.push("--allowedTools", allowedTools.join(","));
      }

      const { stdout } = await exec("claude", flags, { cwd, timeout: 120000, input: prompt });

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
