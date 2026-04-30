#!/usr/bin/env node
// Usage:
//   node wc.js sim [--days=N]
//   node wc.js reset
//   node wc.js work <character>
//   node wc.js meet <character> <other> [--location <loc>] [--turns N]
//   node wc.js chat <character>

require("dotenv").config();

const Anthropic = require("@anthropic-ai/sdk");
const Memory = require("./src/memory");
const makeReflectionBrain = require("./src/reflection-brain");
const charDefs = require("./src/character-defs");
const { makeBrainFor } = require("./src/characters");
const { runWork } = require("./src/work");
const { runMeeting } = require("./src/meeting");
const { runChat } = require("./src/chat");

const COMMANDS = ["sim", "reset", "work", "meet", "chat"];
const characterNames = Object.keys(charDefs).join(", ");

function help() {
  console.log(`
Usage: node wc.js <command> [args]

Commands:
  sim [--days=N]                         Run the full simulation
  reset                                  Restore seed memory and clear workspaces
  work <character>                       Run a cubicle work session
  meet <character> <other>               Run a meeting (default location: conference room)
        [--location <loc>] [--turns N]
  chat <character>                       Chat interactively with a character

Characters: ${characterNames}
  `.trim());
}

function getFlag(args, name) {
  const idx = args.indexOf(name);
  return idx >= 0 ? args[idx + 1] : undefined;
}

function requireCharacter(name) {
  const def = charDefs[name?.toLowerCase()];
  if (!def) {
    console.error(`Unknown character: ${name}`);
    console.error(`Available: ${characterNames}`);
    process.exit(1);
  }
  return def;
}

function makeClient() {
  return new Anthropic({ baseURL: process.env.ANTHROPIC_URL });
}

const [,, command, ...rest] = process.argv;

if (!command || command === "--help" || command === "-h") {
  help();
  process.exit(0);
}

if (!COMMANDS.includes(command)) {
  console.error(`Unknown command: ${command}`);
  help();
  process.exit(1);
}

// --- reset ---

if (command === "reset") {
  const path = require("path");
  const characters = require("./src/characters");
  const reset = require("./src/reset");
  reset({
    memoryDir: process.env.WC_MEMORY_DIR || path.join(__dirname, "memory"),
    seedDir: process.env.WC_SEED_DIR || path.join(__dirname, "seed", "memory"),
    workspacesDir: process.env.WC_WORKSPACES_DIR || path.join(__dirname, "workspaces"),
    names: characters.names,
  });
  console.log(`reset complete: ${characters.names.join(", ")}`);
  process.exit(0);
}

// --- sim ---

if (command === "sim") {
  const { main } = require("./src/app");
  const makeLlmBrain = require("./src/llm-brain");
  const makeCliBrain = require("./src/cli-brain");

  const client = makeClient();
  const model = process.env.LLM_MODEL || "claude-haiku-4-5";
  const memory = new Memory();
  const chatBrain = makeLlmBrain({ client, model, memory });
  const workBrain = makeCliBrain({ model, memory });
  const reflector = makeReflectionBrain({ client, model, memory });

  const daysArg = rest.find((a) => a.startsWith("--days="));
  const days = daysArg ? parseInt(daysArg.split("=")[1]) : 1;
  const DEFAULT_TICKS_PER_SEC = 8;
  const ticksPerSec = parseFloat(process.env.TICKS_PER_SEC) || DEFAULT_TICKS_PER_SEC;
  const tickInterval = Math.round(1000 / ticksPerSec);

  main({ days, chatBrain, workBrain, reflector, tickInterval }).then(() => process.exit(0));
}

// --- work ---

if (command === "work") {
  const [charName] = rest;
  if (!charName) { console.error("Usage: node wc.js work <character>"); process.exit(1); }
  const characterDef = requireCharacter(charName);
  const client = makeClient();
  const model = process.env.LLM_MODEL || "claude-haiku-4-5";
  const memory = new Memory();
  const brain = makeBrainFor(characterDef, { client, model, memory });
  runWork({ characterDef, brain });
}

// --- meet ---

if (command === "meet") {
  const [char1, char2] = rest;
  if (!char1 || !char2) { console.error("Usage: node wc.js meet <character> <other>"); process.exit(1); }
  const characterDef = requireCharacter(char1);
  const otherDef = requireCharacter(char2);
  const location = getFlag(rest, "--location") || "conference room";
  const turns = parseInt(getFlag(rest, "--turns") || "4", 10);
  const client = makeClient();
  const model = process.env.LLM_MODEL || "claude-haiku-4-5";
  const memory = new Memory();
  const brain = makeBrainFor(characterDef, { client, model, memory });
  runMeeting({ characterDef, otherDef, brain, location, turns }).then(() => process.exit(0));
}

// --- chat ---

if (command === "chat") {
  const [charName] = rest;
  if (!charName) { console.error("Usage: node wc.js chat <character>"); process.exit(1); }
  const characterDef = requireCharacter(charName);
  const client = makeClient();
  const model = process.env.LLM_MODEL || "claude-haiku-4-5";
  const memory = new Memory();
  const brain = makeBrainFor(characterDef, { client, model, memory });
  const reflect = makeReflectionBrain({ client, model, memory });
  const readline = require("readline").createInterface({ input: process.stdin, output: process.stdout });
  runChat({ brain, characterDef, reflect, readline, onMessage: (from, msg) => console.log(`[${from}] ${msg}`) });
}
