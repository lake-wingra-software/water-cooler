const makeCliBrain = require("../src/cli-brain");

const defaultCharacter = { traits: "friendly", role: "engineer" };

describe("CLI brain", () => {
  it("returns null if last message is from the speaker", async () => {
    const exec = jasmine.createSpy("exec");
    const brain = makeCliBrain({ model: "test-model", exec });
    const chat = [
      { from: "Alice", message: "hi Chad" },
      { from: "Chad", message: "hey!" },
    ];
    const result = await brain({
      name: "Chad",
      character: defaultCharacter,
      others: [{ name: "Alice" }],
      chat,
      location: "water cooler",
    });

    expect(result).toBeNull();
    expect(exec).not.toHaveBeenCalled();
  });

  it("greets others when no one has spoken yet", async () => {
    const exec = jasmine.createSpy("exec");
    const brain = makeCliBrain({ model: "test-model", exec });
    const result = await brain({
      name: "Chad",
      character: defaultCharacter,
      others: [{ name: "Alice" }, { name: "Bob" }],
      chat: [],
      location: "water cooler",
    });

    expect(exec).not.toHaveBeenCalled();
    expect(result.message).toContain("hi Alice");
    expect(result.message).toContain("hi Bob");
  });

  it("invokes claude with the correct arguments", async () => {
    const exec = jasmine.createSpy("exec").and.resolveTo({ stdout: "Looks good to me." });
    const brain = makeCliBrain({ model: "test-model", exec });
    const chat = [
      { from: "Chad", message: "hi Alice" },
      { from: "Alice", message: "what do you think about the schema?" },
    ];
    await brain({
      name: "Chad",
      character: { traits: "direct", role: "engineer", goals: ["ship it"] },
      others: [{ name: "Alice" }],
      chat,
      location: "conference room",
    });

    expect(exec).toHaveBeenCalled();
    const args = exec.calls.mostRecent().args;
    const cmd = args[0];
    const flags = args[1];
    expect(cmd).toBe("claude");
    expect(flags).toContain("-p");
    expect(flags).toContain("--model");
    expect(flags).toContain("test-model");
    expect(flags).toContain("--output-format");
    expect(flags).toContain("text");
    // prompt should include conversation history
    const prompt = flags[flags.length - 1];
    expect(prompt).toContain("Alice: what do you think about the schema?");
  });

  it("returns { to, message } from CLI stdout", async () => {
    const exec = jasmine.createSpy("exec").and.resolveTo({ stdout: "Looks good to me." });
    const brain = makeCliBrain({ model: "test-model", exec });
    const chat = [
      { from: "Chad", message: "hi Alice" },
      { from: "Alice", message: "thoughts?" },
    ];
    const result = await brain({
      name: "Chad",
      character: defaultCharacter,
      others: [{ name: "Alice" }],
      chat,
      location: "water cooler",
    });

    expect(result).toEqual({ to: [{ name: "Alice" }], message: "Looks good to me." });
  });

  it("returns null and logs error on CLI failure", async () => {
    const exec = jasmine.createSpy("exec").and.rejectWith(new Error("command not found"));
    spyOn(console, "error");
    const brain = makeCliBrain({ model: "test-model", exec });
    const chat = [
      { from: "Chad", message: "hi Alice" },
      { from: "Alice", message: "hey" },
    ];
    const result = await brain({
      name: "Chad",
      character: defaultCharacter,
      others: [{ name: "Alice" }],
      chat,
      location: "water cooler",
    });

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith("[Chad] CLI error: command not found");
  });

  it("returns null on empty output", async () => {
    const exec = jasmine.createSpy("exec").and.resolveTo({ stdout: "   \n  " });
    const brain = makeCliBrain({ model: "test-model", exec });
    const chat = [
      { from: "Chad", message: "hi Alice" },
      { from: "Alice", message: "hey" },
    ];
    const result = await brain({
      name: "Chad",
      character: defaultCharacter,
      others: [{ name: "Alice" }],
      chat,
      location: "water cooler",
    });

    expect(result).toBeNull();
  });
});
