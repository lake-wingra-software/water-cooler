const path = require("path");
const fs = require("fs");
const os = require("os");
const Memory = require("../src/memory");

describe("Memory", () => {
  let tmpDir;
  let memory;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "memory-spec-"));
    memory = new Memory(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("returns empty string when no memory file exists", () => {
    expect(memory.read("alice")).toBe("");
  });

  it("writes and reads back memory for a character", () => {
    memory.write("alice", "Working on: issue #18");
    expect(memory.read("alice")).toBe("Working on: issue #18");
  });

  it("keeps memory separate per character", () => {
    memory.write("alice", "Alice's notes");
    memory.write("jim", "Jim's notes");
    expect(memory.read("alice")).toBe("Alice's notes");
    expect(memory.read("jim")).toBe("Jim's notes");
  });
});
