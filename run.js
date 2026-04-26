require("dotenv").config();

const path = require("path");

if (process.argv.includes("--reset")) {
  const characters = require("./src/characters");
  const reset = require("./src/reset");
  reset({
    memoryDir: process.env.WC_MEMORY_DIR || path.join(__dirname, "memory"),
    seedDir:
      process.env.WC_SEED_DIR || path.join(__dirname, "seed", "memory"),
    workspacesDir:
      process.env.WC_WORKSPACES_DIR || path.join(__dirname, "workspaces"),
    names: characters.names,
  });
  console.log(`reset complete: ${characters.names.join(", ")}`);
  process.exit(0);
}

const Anthropic = require("@anthropic-ai/sdk");
const Memory = require("./src/memory");
const makeLlmBrain = require("./src/llm-brain");
const makeCliBrain = require("./src/cli-brain");
const makeReflectionBrain = require("./src/reflection-brain");
const { main } = require("./src/app");

const client = new Anthropic({ baseURL: process.env.ANTHROPIC_URL });
const model = process.env.LLM_MODEL || "claude-haiku-4-5";
const memory = new Memory();

const chatBrain = makeLlmBrain({ client, model, memory });
const workBrain = makeCliBrain({ model, memory });
const reflector = makeReflectionBrain({ client, model, memory });

const DEFAULT_TICKS_PER_SEC = 8;
const ticksPerSec = parseFloat(process.env.TICKS_PER_SEC) || DEFAULT_TICKS_PER_SEC;
if (ticksPerSec <= 0) {
  throw new Error(`TICKS_PER_SEC must be greater than 0 (got ${process.env.TICKS_PER_SEC})`);
}

const daysArg = process.argv.find((a) => a.startsWith("--days="));
const days = daysArg ? parseInt(daysArg.split("=")[1]) : 1;
const tickInterval = Math.round(1000 / ticksPerSec);

// The Anthropic SDK keeps a connection pool alive that Node's event loop
// won't drain on its own. Force-exit so the sim doesn't hang after the
// workday ends.
main({ days, chatBrain, workBrain, reflector, tickInterval }).then(() => process.exit(0));
