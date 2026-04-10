const makeCliBrain = require("../src/cli-brain");

const defaultCharacter = { traits: "friendly", role: "engineer" };

function mockExec(stdout) {
  return jasmine.createSpy("exec").and.callFake((cmd, args, opts) => {
    return Promise.resolve({ stdout, stdin: opts && opts.input });
  });
}

function mockExecFail(message) {
  return jasmine.createSpy("exec").and.rejectWith(new Error(message));
}

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

  it("invokes claude with the correct arguments and prompt via stdin", async () => {
    const exec = mockExec("Looks good to me.");
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
    const opts = args[2];
    expect(cmd).toBe("claude");
    expect(flags).toContain("-p");
    expect(flags).toContain("--model");
    expect(flags).toContain("test-model");
    expect(flags).toContain("--output-format");
    expect(flags).toContain("text");
    // prompt goes via input option, not as a positional arg
    expect(opts.input).toContain("Alice: what do you think about the schema?");
  });

  it("returns { to, message } from CLI stdout", async () => {
    const exec = mockExec("Looks good to me.");
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
    const exec = mockExecFail("command not found");
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
    const exec = mockExec("   \n  ");
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

  it("passes allowedTools when provided", async () => {
    const exec = mockExec("Found it.");
    const brain = makeCliBrain({ model: "test-model", exec });
    const chat = [
      { from: "Chad", message: "hi Alice" },
      { from: "Alice", message: "can you check the code?" },
    ];
    await brain({
      name: "Chad",
      character: defaultCharacter,
      others: [{ name: "Alice" }],
      chat,
      location: "water cooler",
      allowedTools: ["Read", "Grep"],
    });

    const flags = exec.calls.mostRecent().args[1];
    expect(flags).toContain("--allowedTools");
    expect(flags).toContain("Read,Grep");
  });

  it("includes character memory in system prompt when memory is provided", async () => {
    const exec = mockExec("On it.");
    const memory = { read: jasmine.createSpy("read").and.returnValue("Working on: issue #18") };
    const brain = makeCliBrain({ model: "test-model", exec, memory });
    const chat = [
      { from: "Chad", message: "hi Alice" },
      { from: "Alice", message: "thoughts?" },
    ];
    await brain({
      name: "Chad",
      character: defaultCharacter,
      others: [{ name: "Alice" }],
      chat,
      location: "water cooler",
    });

    expect(memory.read).toHaveBeenCalledWith("Chad");
    const systemPrompt = exec.calls.mostRecent().args[1].find((_, i, arr) => arr[i - 1] === "--system-prompt");
    expect(systemPrompt).toContain("Working on: issue #18");
  });

  it("does not pass allowedTools when not provided", async () => {
    const exec = mockExec("Sure.");
    const brain = makeCliBrain({ model: "test-model", exec });
    const chat = [
      { from: "Chad", message: "hi Alice" },
      { from: "Alice", message: "thoughts?" },
    ];
    await brain({
      name: "Chad",
      character: defaultCharacter,
      others: [{ name: "Alice" }],
      chat,
      location: "water cooler",
    });

    const flags = exec.calls.mostRecent().args[1];
    expect(flags).not.toContain("--allowedTools");
  });
});
