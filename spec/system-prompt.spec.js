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
  it("includes behavioral grounding", () => {
    const system = buildSystemPrompt(defaultArgs);
    expect(system).toContain("coworker");
    expect(system).not.toContain("personality traits");
  });

  it("explicitly prohibits asterisk actions", () => {
    const system = buildSystemPrompt(defaultArgs);
    expect(system).toContain("*");
    expect(system).toMatch(/never|don't|no/i);
  });

  it("encourages short responses", () => {
    const system = buildSystemPrompt(defaultArgs);
    expect(system).toMatch(/one|two|1|2/i);
    expect(system).toMatch(/sentence/i);
  });

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
