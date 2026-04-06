const { execFileSync } = require("child_process");
const path = require("path");

describe("run.js", () => {
  it("completes without errors", () => {
    const result = execFileSync(
      "node",
      [path.join(__dirname, "..", "run.js")],
      {
        encoding: "utf8",
        env: {
          ...process.env,
          TICKS_PER_SEC: "0",
          ANTHROPIC_API_KEY: "",
          ANTHROPIC_URL: "",
        },
        stdio: ["pipe", "pipe", "pipe"],
      },
    );
    expect(result).toContain("workday ended");
  });
});
