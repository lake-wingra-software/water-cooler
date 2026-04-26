// Usage:
//   node harness.js <character>                                          # cubicle work session
//   node harness.js <character> --location <loc> --with <other> [--turns N]  # meeting
//
// Cubicle mode: runs a single work session, diffs the workspace, prints output.
// Meeting mode: places <character> and <other> at <loc>, runs N turns of
// conversation (default 4), prints the chat log.

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");

const makeCliBrain = require("./src/cli-brain");
const makeLlmBrain = require("./src/llm-brain");
const makeRoutingBrain = require("./src/routing-brain");
const makeReflectionBrain = require("./src/reflection-brain");
const Memory = require("./src/memory");
const Person = require("./src/person");
const Location = require("./src/location");
const { workspacePathFor } = require("./src/workspace");
const charDefs = require("./src/character-defs");
const { runChat } = require("./src/chat");

function getFlag(name) {
  const idx = process.argv.indexOf(name);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

const nameArg = process.argv[2];
if (!nameArg || nameArg.startsWith("--")) {
  console.error(
    "Usage: node harness.js <character> [--location <loc> --with <other>] [--turns N]",
  );
  console.error(`Available characters: ${Object.keys(charDefs).join(", ")}`);
  process.exit(1);
}

const def = charDefs[nameArg.toLowerCase()];
if (!def) {
  console.error(`Unknown character: ${nameArg}`);
  console.error(`Available: ${Object.keys(charDefs).join(", ")}`);
  process.exit(1);
}

const locationArg = getFlag("--location");
const withArg = getFlag("--with");
const turnsArg = parseInt(getFlag("--turns") || "4", 10);
const chatMode = process.argv.includes("--chat");

const client = new Anthropic({ baseURL: process.env.ANTHROPIC_URL });
const model = process.env.LLM_MODEL || "claude-haiku-4-5";
const memory = new Memory();
const workBrain = makeCliBrain({ model, memory });
const chatBrain = makeLlmBrain({ client, model, memory });
const brain = makeRoutingBrain({ chatBrain, workBrain });

fs.mkdirSync(workspacePathFor(def.name), { recursive: true });

if (chatMode) {
  const reflect = makeReflectionBrain({ client, model, memory });
  const readline = require("readline").createInterface({ input: process.stdin, output: process.stdout });
  runChat({ brain, characterDef: def, reflect, readline, onMessage: (from, msg) => console.log(`[${from}] ${msg}`) });
} else if (locationArg && locationArg !== "cubicle") {
  runMeeting();
} else {
  runCubicleWork();
}

// ---

function snapshot(dir) {
  const result = new Map();
  if (!fs.existsSync(dir)) return result;
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else result.set(path.relative(dir, full), fs.statSync(full).mtimeMs);
    }
  };
  walk(dir);
  return result;
}

function runCubicleWork() {
  const workspace = workspacePathFor(def.name);
  const before = snapshot(workspace);

  console.log(`Character: ${def.name}`);
  console.log(`Workspace: ${workspace}`);
  console.log(`Tools:     ${(def.allowedTools || []).join(", ") || "(none)"}`);
  console.log("");
  console.log("Running cubicle work session...");
  console.log("");

  const person = new Person(def, brain, { allowedTools: def.allowedTools });

  person.receiveToken([], "cubicle", (action) => {
    console.log("--- Brain output ---");
    console.log(action ? action.message : "(no output)");
    console.log("");

    const after = snapshot(workspace);
    const added = [];
    const changed = [];
    for (const [file, mtime] of after) {
      if (!before.has(file)) added.push(file);
      else if (before.get(file) !== mtime) changed.push(file);
    }

    console.log("--- Workspace changes ---");
    if (added.length === 0 && changed.length === 0) {
      console.log("(no changes)");
    } else {
      for (const f of added) console.log(`+ ${f}`);
      for (const f of changed) console.log(`~ ${f}`);
    }
  });
}

async function runMeeting() {
  if (!withArg) {
    console.error("Meeting mode requires --with <other-character>");
    process.exit(1);
  }
  const other = charDefs[withArg.toLowerCase()];
  if (!other) {
    console.error(`Unknown character: ${withArg}`);
    process.exit(1);
  }
  fs.mkdirSync(workspacePathFor(other.name), { recursive: true });

  const person = new Person(def, brain, { allowedTools: def.allowedTools });
  const otherPerson = new Person(other, brain, { allowedTools: other.allowedTools });

  console.log(`Meeting at: ${locationArg}`);
  console.log(`Attendees:  ${def.name}, ${other.name}`);
  console.log(`Turns:      ${turnsArg}`);
  console.log("");

  const location = new Location(locationArg, (occupants) => [...occupants]);
  location.arrive(person);
  location.arrive(otherPerson);

  location.on("messageSent", ({ from, message }) => {
    console.log(`[${from}] ${message}`);
    console.log("");
  });

  for (let i = 0; i < turnsArg; i++) {
    const turned = await runTurn(location);
    if (!turned) {
      console.log("(conversation ended early)");
      break;
    }
  }
  process.exit(0);
}

function runTurn(location) {
  return new Promise((resolve) => {
    let settled = false;
    const settle = (value) => {
      if (settled) return;
      settled = true;
      location.removeListener("messageSent", onMessage);
      clearTimeout(timer);
      resolve(value);
    };
    const onMessage = () => settle(true);
    location.once("messageSent", onMessage);
    const timer = setTimeout(() => settle(false), 60000);
    location.tick();
  });
}
