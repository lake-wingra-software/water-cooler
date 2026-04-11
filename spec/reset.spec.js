const fs = require("fs");
const os = require("os");
const path = require("path");
const reset = require("../src/reset");

describe("reset", () => {
  let memoryDir;
  let seedDir;
  let workspacesDir;

  beforeEach(() => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "reset-spec-"));
    memoryDir = path.join(root, "memory");
    seedDir = path.join(root, "seed", "memory");
    workspacesDir = path.join(root, "workspaces");
    fs.mkdirSync(memoryDir, { recursive: true });
    fs.mkdirSync(seedDir, { recursive: true });
    fs.mkdirSync(workspacesDir, { recursive: true });
  });

  it("copies seed memory file over the runtime memory file for each name", () => {
    fs.writeFileSync(path.join(seedDir, "alice.md"), "seed alice");
    fs.writeFileSync(path.join(memoryDir, "alice.md"), "stale runtime alice");

    reset({ memoryDir, seedDir, workspacesDir, names: ["alice"] });

    expect(fs.readFileSync(path.join(memoryDir, "alice.md"), "utf8")).toEqual(
      "seed alice",
    );
  });

  it("removes each name's workspace directory", () => {
    fs.writeFileSync(path.join(seedDir, "alice.md"), "seed alice");
    const aliceWorkspace = path.join(workspacesDir, "alice");
    fs.mkdirSync(aliceWorkspace);
    fs.writeFileSync(path.join(aliceWorkspace, "draft.md"), "leftover");

    reset({ memoryDir, seedDir, workspacesDir, names: ["alice"] });

    expect(fs.existsSync(aliceWorkspace)).toBe(false);
  });
});
