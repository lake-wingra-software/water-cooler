const { execFile } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const makeBrain = require("./make-brain");
const { buildWorkSystemPrompt } = require("./system-prompt");

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

function buildPrompt(chat) {
  const lines = [];
  if (chat.length > 0) {
    lines.push("What you've done so far:");
    for (const msg of chat) {
      lines.push(`- ${msg.message}`);
    }
    lines.push("");
  }
  lines.push("What do you work on next?");
  return lines.join("\n");
}

function makeCliBrain({ model, exec, memory }) {
  exec = exec || execClaude;

  return makeBrain({
    memory,
    buildSystemPrompt: buildWorkSystemPrompt,
    async transport({ name, others, chat, system, allowedTools, cwd }) {
      const prompt = buildPrompt(chat);

      const systemFile = path.join(os.tmpdir(), `wc-system-${process.pid}-${Date.now()}.txt`);
      try {
        fs.writeFileSync(systemFile, system, "utf8");
        const flags = [
          "-p",
          "--model", model,
          "--output-format", "text",
          "--system-prompt-file", systemFile,
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
      } finally {
        try { fs.unlinkSync(systemFile); } catch {}
      }
    },
  });
}

module.exports = makeCliBrain;
