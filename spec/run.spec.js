const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { main } = require("../src/app");

function nullBrain() { return Promise.resolve(null); }
function nullReflector() { return Promise.resolve(); }

function captureLog() {
  const lines = [];
  return { log: (msg) => lines.push(msg), lines };
}

describe("app", () => {
  it("completes without errors", async () => {
    const { log, lines } = captureLog();
    await main({ chatBrain: nullBrain, workBrain: nullBrain, reflector: nullReflector, log });
    expect(lines.join("\n")).toContain("workday ended");
  });

  it("prints the day number at the start of each day", async () => {
    const { log, lines } = captureLog();
    await main({ chatBrain: nullBrain, workBrain: nullBrain, reflector: nullReflector, log });
    expect(lines.join("\n")).toContain("Day 1");

    const { log: log3, lines: lines3 } = captureLog();
    await main({ days: 3, chatBrain: nullBrain, workBrain: nullBrain, reflector: nullReflector, log: log3 });
    const out = lines3.join("\n");
    expect(out).toContain("Day 1");
    expect(out).toContain("Day 2");
    expect(out).toContain("Day 3");
  });

  it("runs multiple days when days option is given", async () => {
    const { log, lines } = captureLog();
    await main({ days: 3, chatBrain: nullBrain, workBrain: nullBrain, reflector: nullReflector, log });
    const matches = lines.join("\n").match(/workday ended/g);
    expect(matches?.length).toBe(3);
  });
});

describe("run.js --reset", () => {
  const characters = require("../src/characters");
  let tmpRoot, memoryDir, seedDir, workspacesDir;

  const runJs = (args = [], extraEnv = {}) =>
    execFileSync("node", [path.join(__dirname, "..", "run.js"), ...args], {
      encoding: "utf8",
      env: { ...process.env, ...extraEnv },
      stdio: ["pipe", "pipe", "pipe"],
    });

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

    expect(fs.readFileSync(path.join(memoryDir, "alice.md"), "utf8")).toEqual("seed alice");
    expect(fs.existsSync(aliceWorkspace)).toBe(false);
    expect(output).not.toContain("workday ended");
  });
});
