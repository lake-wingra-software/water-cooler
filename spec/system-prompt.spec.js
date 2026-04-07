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
  it("puts role and traits in the system prompt", () => {
    const system = buildSystemPrompt({
      ...defaultArgs,
      character: { traits: "sarcastic", role: "senior engineer" },
    });
    expect(system).toContain("senior engineer");
    expect(system).toContain("sarcastic");
  });

  it("puts goals in the system prompt when provided", () => {
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

  it("omits goals section when not provided", () => {
    const system = buildSystemPrompt(defaultArgs);
    expect(system).not.toContain("goals");
  });

  it("puts location in the system prompt", () => {
    const system = buildSystemPrompt({ ...defaultArgs, location: "cafeteria" });
    expect(system).toContain("cafeteria");
  });

  it("works with no arguments", () => {
    const system = buildSystemPrompt({});
    expect(system).toBeInstanceOf(String);
    expect(system.length).toBeGreaterThan(0);
  });

  it("puts turns remaining in the system prompt", () => {
    const system = buildSystemPrompt({
      ...defaultArgs,
      minutesRemaining: 24,
      minutesPerTurn: 8,
    });
    expect(system).toContain("3 turns");
  });
});
