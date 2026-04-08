const buildSystemPrompt = require("../src/system-prompt");

const defaultArgs = {
  name: "Chad",
  character: { traits: "friendly", role: "engineer" },
  others: [{ name: "Alice" }],
  location: "water cooler",
  minutesRemaining: 60,
  minutesPerTurn: 8,
};

describe("buildSystemPrompt", () => {
  it("includes character identity", () => {
    const system = buildSystemPrompt({
      ...defaultArgs,
      name: "Chad",
      character: { traits: "sarcastic", role: "senior engineer" },
    });
    expect(system).toContain("Chad");
    expect(system).toContain("senior engineer");
  });

  it("includes traits", () => {
    const system = buildSystemPrompt({
      ...defaultArgs,
      character: { traits: "sarcastic", role: "engineer" },
    });
    expect(system).toContain("sarcastic");
  });

  it("includes goals when provided", () => {
    const system = buildSystemPrompt({
      ...defaultArgs,
      character: {
        traits: "friendly",
        role: "engineer",
        goals: ["get promoted", "avoid meetings"],
      },
    });
    expect(system).toContain("get promoted");
    expect(system).toContain("avoid meetings");
  });

  it("omits goals when not provided", () => {
    const system = buildSystemPrompt(defaultArgs);
    expect(system).not.toMatch(/get promoted|avoid meetings/);
  });

  it("includes location", () => {
    const system = buildSystemPrompt({ ...defaultArgs, location: "cafeteria" });
    expect(system).toContain("cafeteria");
  });

  it("includes turns remaining", () => {
    const system = buildSystemPrompt({
      ...defaultArgs,
      minutesRemaining: 24,
      minutesPerTurn: 8,
    });
    expect(system).toContain("3");
    expect(system).toMatch(/turn/);
  });

  it("includes done signal", () => {
    const system = buildSystemPrompt(defaultArgs);
    expect(system).toContain("[done]");
  });

  it("works with no arguments", () => {
    const system = buildSystemPrompt({});
    expect(system).toBeInstanceOf(String);
    expect(system.length).toBeGreaterThan(0);
  });
});
