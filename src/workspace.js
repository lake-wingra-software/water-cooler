const fs = require("fs");
const path = require("path");

function workspacePathFor(name) {
  return path.resolve(process.cwd(), "workspaces", name.toLowerCase());
}

function bagFor(name) {
  const dir = workspacePathFor(name);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
}

module.exports = { workspacePathFor, bagFor };
