const { buildSystemPrompt, buildWorkSystemPrompt } = require("../src/system-prompt");

const defaultArgs = {
  name: "chad",
  character: { traits: "friendly", role: "engineer" },
  others: [{ name: "alice" }],
  location: "water cooler",
  minutesRemaining: 60,
  minutesPerTurn: 8,
};

describe("buildSystemPrompt", () => {
  it("includes character identity", () => {
    const system = buildSystemPrompt({
      ...defaultArgs,
      name: "chad",
      character: { traits: "sarcastic", role: "senior engineer" },
    });
    expect(system).toContain("chad");
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

  it("includes memory when provided", () => {
    const system = buildSystemPrompt({
      ...defaultArgs,
      memory: "Working on: issue #18\nNext: discuss config format with jim",
    });
    expect(system).toContain("Working on: issue #18");
    expect(system).toContain("discuss config format with jim");
  });

  it("omits memory section when memory is empty", () => {
    const system = buildSystemPrompt({ ...defaultArgs, memory: "" });
    expect(system).not.toContain("Memory");
  });

  it("lists workspace files when bag is provided", () => {
    const system = buildSystemPrompt({
      ...defaultArgs,
      bag: ["team-roles-recommendation.md", "notes.md"],
    });
    expect(system).toContain("team-roles-recommendation.md");
    expect(system).toContain("notes.md");
  });

  it("omits workspace section when bag is empty", () => {
    const system = buildSystemPrompt({ ...defaultArgs, bag: [] });
    expect(system).not.toMatch(/workspace/i);
  });
});

describe("buildWorkSystemPrompt", () => {
  it("includes character identity and location", () => {
    const system = buildWorkSystemPrompt({
      name: "alice",
      character: { role: "product manager", traits: "organized" },
      location: "cubicle",
    });
    expect(system).toContain("alice");
    expect(system).toContain("product manager");
    expect(system).toContain("cubicle");
  });

  it("includes memory when provided", () => {
    const system = buildWorkSystemPrompt({
      name: "alice",
      character: { role: "product manager" },
      location: "cubicle",
      memory: "Working on: issue #18\nNext: discuss config format with jim",
    });
    expect(system).toContain("Working on: issue #18");
    expect(system).toContain("discuss config format with jim");
  });

  it("includes workspace path when cwd is provided", () => {
    const system = buildWorkSystemPrompt({
      name: "jim",
      character: { role: "engineer" },
      location: "cubicle",
      cwd: "/tmp/workspaces/jim",
    });
    expect(system).toContain("/tmp/workspaces/jim");
  });

  it("lists workspace files when bag is provided", () => {
    const system = buildWorkSystemPrompt({
      name: "jim",
      character: { role: "engineer" },
      location: "cubicle",
      cwd: "/tmp/workspaces/jim",
      bag: ["team-roles-recommendation.md", "notes.md"],
    });
    expect(system).toContain("team-roles-recommendation.md");
    expect(system).toContain("notes.md");
  });

  it("indicates empty workspace when bag is empty", () => {
    const system = buildWorkSystemPrompt({
      name: "jim",
      character: { role: "engineer" },
      location: "cubicle",
      cwd: "/tmp/workspaces/jim",
      bag: [],
    });
    expect(system).toMatch(/empty/i);
  });

  it("does not instruct that response is the only record", () => {
    const system = buildWorkSystemPrompt({
      name: "jim",
      character: { role: "engineer" },
      location: "cubicle",
    });
    expect(system).not.toContain("only record");
  });
});
