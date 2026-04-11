const path = require("path");

function workspacePathFor(name) {
  return path.resolve(process.cwd(), "workspaces", name.toLowerCase());
}

module.exports = { workspacePathFor };
