const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

describe("run.js", () => {
  const runJs = (args = [], extraEnv = {}) =>
    execFileSync("node", [path.join(__dirname, "..", "run.js"), ...args], {
      encoding: "utf8",
      env: {
        ...process.env,
        TICKS_PER_SEC: "99999",
        ANTHROPIC_API_KEY: "",
        ANTHROPIC_URL: "",
        ...extraEnv,
      },
      stdio: ["pipe", "pipe", "pipe"],
    });

  it("completes without errors", () => {
    const result = runJs();
    expect(result).toContain("workday ended");
  });

  it("prints the day number at the start of each day", () => {
    expect(runJs()).toContain("Day 1");

    const multi = runJs(["--days=3"]);
    expect(multi).toContain("Day 1");
    expect(multi).toContain("Day 2");
    expect(multi).toContain("Day 3");
  });

  it("runs multiple days when --days is given", () => {
    const result = runJs(["--days=3"]);
    const matches = result.match(/workday ended/g);
    expect(matches?.length).toBe(3);
  });

  describe("--reset", () => {
    const characters = require("../src/characters");
    let tmpRoot, memoryDir, seedDir, workspacesDir;

    beforeEach(() => {
      tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "run-reset-"));
      memoryDir = path.join(tmpRoot, "memory");
      seedDir = path.join(tmpRoot, "seed", "memory");
      workspacesDir = path.join(tmpRoot, "workspaces");
      fs.mkdirSync(memoryDir, { recursive: true });
      fs.mkdirSync(seedDir, { recursive: true });
      fs.mkdirSync(workspacesDir, { recursive: true });
      for (const name of characters.names) {
        fs.writeFileSync(path.join(seedDir, `${name}.md`), `seed ${name}`);
      }
    });

    afterEach(() => {
      fs.rmSync(tmpRoot, { recursive: true, force: true });
    });

    it("restores seed memory, removes workspace dirs, and exits without running the sim", () => {
      fs.writeFileSync(path.join(memoryDir, "alice.md"), "stale runtime alice");
      const aliceWorkspace = path.join(workspacesDir, "alice");
      fs.mkdirSync(aliceWorkspace);
      fs.writeFileSync(path.join(aliceWorkspace, "draft.md"), "leftover");

      const output = runJs(["--reset"], {
        WC_MEMORY_DIR: memoryDir,
        WC_SEED_DIR: seedDir,
        WC_WORKSPACES_DIR: workspacesDir,
      });

      expect(fs.readFileSync(path.join(memoryDir, "alice.md"), "utf8")).toEqual(
        "seed alice",
      );
      expect(fs.existsSync(aliceWorkspace)).toBe(false);
      expect(output).not.toContain("workday ended");
    });
  });
});
