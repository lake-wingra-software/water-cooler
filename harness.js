// Usage: node harness.js <character-name>
// Runs a single cubicle work session for one character in isolation.
// Shows files created/changed in their workspace.

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");

const makeCliBrain = require("./src/cli-brain");
const Memory = require("./src/memory");
const Person = require("./src/person");
const { workspacePathFor } = require("./src/workspace");
const charDefs = require("./src/character-defs");

const nameArg = process.argv[2];
if (!nameArg) {
  console.error("Usage: node harness.js <character-name>");
  console.error(`Available: ${Object.keys(charDefs).join(", ")}`);
  process.exit(1);
}

const def = charDefs[nameArg.toLowerCase()];
if (!def) {
  console.error(`Unknown character: ${nameArg}`);
  console.error(`Available: ${Object.keys(charDefs).join(", ")}`);
  process.exit(1);
}

const client = new Anthropic({ baseURL: process.env.ANTHROPIC_URL });
const model = process.env.LLM_MODEL || "claude-haiku-4-5";
const memory = new Memory();
const workBrain = makeCliBrain({ model, memory });

const workspace = workspacePathFor(def.name);
fs.mkdirSync(workspace, { recursive: true });

function snapshot(dir) {
  const result = new Map();
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

const before = snapshot(workspace);

console.log(`Character: ${def.name}`);
console.log(`Workspace: ${workspace}`);
console.log(`Tools:     ${(def.allowedTools || []).join(", ") || "(none)"}`);
console.log("");
console.log("Running cubicle work session...");
console.log("");

const person = new Person(def, workBrain, { allowedTools: def.allowedTools });

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
