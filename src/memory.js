const fs = require("fs");
const path = require("path");

class Memory {
  constructor(dir) {
    this.dir = dir || path.join(__dirname, "..", "memory");
  }

  read(name) {
    const file = path.join(this.dir, `${name}.md`);
    try {
      return fs.readFileSync(file, "utf8");
    } catch {
      return "";
    }
  }

  write(name, content) {
    const file = path.join(this.dir, `${name}.md`);
    fs.writeFileSync(file, content, "utf8");
  }
}

module.exports = Memory;
