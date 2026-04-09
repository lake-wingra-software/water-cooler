require("dotenv").config();

const Anthropic = require("@anthropic-ai/sdk");
const runConversation = require("./run-conversation");

const scenarios = [
  // require("./scenarios/blocked-conversation"),
  require("./scenarios/login-discussion"),
];

async function main() {
  const client = new Anthropic({ baseURL: process.env.ANTHROPIC_URL });
  const model = process.env.LLM_MODEL || "claude-haiku-4-5";

  for (const scenario of scenarios) {
    await runConversation(scenario, { client, model });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
