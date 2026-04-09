const { execFileSync } = require("child_process");
const path = require("path");

describe("run.js", () => {
  const runJs = (args = []) =>
    execFileSync("node", [path.join(__dirname, "..", "run.js"), ...args], {
      encoding: "utf8",
      env: {
        ...process.env,
        TICKS_PER_SEC: "99999",
        ANTHROPIC_API_KEY: "",
        ANTHROPIC_URL: "",
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
});
