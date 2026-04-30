const fs = require("fs");
const path = require("path");
const Person = require("./person");
const { workspacePathFor } = require("./workspace");

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

function runWork({ characterDef, brain, log = console.log }) {
  const workspace = workspacePathFor(characterDef.name);
  fs.mkdirSync(workspace, { recursive: true });
  const before = snapshot(workspace);

  log(`Character: ${characterDef.name}`);
  log(`Workspace: ${workspace}`);
  log(`Tools:     ${(characterDef.allowedTools || []).join(", ") || "(none)"}`);
  log(``);
  log(`Running cubicle work session...`);
  log(``);

  const person = new Person(characterDef, brain, { allowedTools: characterDef.allowedTools });

  person.receiveToken([], "cubicle", (action) => {
    log(`--- Brain output ---`);
    log(action ? action.message : "(no output)");
    log(``);

    const after = snapshot(workspace);
    const added = [];
    const changed = [];
    for (const [file, mtime] of after) {
      if (!before.has(file)) added.push(file);
      else if (before.get(file) !== mtime) changed.push(file);
    }

    log(`--- Workspace changes ---`);
    if (added.length === 0 && changed.length === 0) {
      log(`(no changes)`);
    } else {
      for (const f of added) log(`+ ${f}`);
      for (const f of changed) log(`~ ${f}`);
    }
  });
}

module.exports = { runWork };
