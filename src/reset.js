const fs = require("fs");
const path = require("path");

function reset({ memoryDir, seedDir, workspacesDir, names }) {
  for (const name of names) {
    fs.copyFileSync(
      path.join(seedDir, `${name}.md`),
      path.join(memoryDir, `${name}.md`),
    );
    fs.rmSync(path.join(workspacesDir, name), { recursive: true, force: true });
  }
}

module.exports = reset;
