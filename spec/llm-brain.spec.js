const makeLlmBrain = require("../src/llm-brain");

function makeClient(response) {
  return {
    messages: {
      create: jasmine
        .createSpy("create")
        .and.resolveTo(
          response ?? { content: [{ type: "text", text: "hey everyone!" }] },
        ),
    },
  };
}

function lastCall(client) {
  return client.messages.create.calls.mostRecent().args[0];
}

function captureSystem(client) {
  return lastCall(client).system;
}

function captureMessages(client) {
  return lastCall(client).messages;
}

function capturePrompt(client) {
  return lastCall(client).messages[0].content;
}

const defaultCharacter = { traits: "friendly", role: "engineer" };

describe("LLM brain", () => {
  it("calls the API and returns message to all others", async () => {
    const client = makeClient();
    const brain = makeLlmBrain({ client, model: "test-model" });
    const alice = { name: "Alice" };
    const bob = { name: "Bob" };
    const result = await brain({
      name: "Chad",
      character: defaultCharacter,
      others: [alice, bob],
      chat: [{ from: "Chad", message: "hi Alice, hi Bob" }, { from: "Alice", message: "hey" }],
      location: "water cooler",
    });

    expect(client.messages.create).toHaveBeenCalled();
    expect(result).toEqual({ to: [alice, bob], message: "hey everyone!" });
  });

  it("formats own messages as assistant role", async () => {
    const client = makeClient();
    const brain = makeLlmBrain({ client, model: "test-model" });
    await brain({
      name: "Bob",
      character: defaultCharacter,
      others: [{ name: "Alice" }],
      chat: [
        { from: "Bob", message: "hi Alice" },
        { from: "Bob", message: "working on it" },
        { from: "Alice", message: "are we on track?" },
      ],
      location: "water cooler",
    });

    const messages = captureMessages(client);
    expect(messages[0]).toEqual({
      role: "assistant",
      content: "hi Alice\nworking on it",
    });
  });

  it("formats others' messages as user role with name labels", async () => {
    const client = makeClient();
    const brain = makeLlmBrain({ client, model: "test-model" });
    await brain({
      name: "Bob",
      character: defaultCharacter,
      others: [{ name: "Alice" }],
      chat: [
        { from: "Bob", message: "hi Alice" },
        { from: "Alice", message: "are we on track?" },
      ],
      location: "water cooler",
    });

    const messages = captureMessages(client);
    expect(messages[1]).toEqual({
      role: "user",
      content: "Alice: are we on track?",
    });
  });

  it("merges consecutive messages from others into one user turn", async () => {
    const client = makeClient();
    const brain = makeLlmBrain({ client, model: "test-model" });
    await brain({
      name: "Chad",
      character: defaultCharacter,
      others: [{ name: "Alice" }, { name: "Bob" }],
      chat: [
        { from: "Chad", message: "hi Alice, hi Bob" },
        { from: "Alice", message: "status?" },
        { from: "Bob", message: "yeah what she said" },
      ],
      location: "water cooler",
    });

    const messages = captureMessages(client);
    expect(messages.length).toEqual(2);
    expect(messages[1].role).toEqual("user");
    expect(messages[1].content).toContain("Alice: status?");
    expect(messages[1].content).toContain("Bob: yeah what she said");
  });

  it("greets others when no one has spoken yet", async () => {
    const client = makeClient();
    const brain = makeLlmBrain({ client, model: "test-model" });
    const result = await brain({
      name: "Chad",
      character: defaultCharacter,
      others: [{ name: "Alice" }, { name: "Bob" }],
      chat: [],
      location: "water cooler",
    });

    expect(client.messages.create).not.toHaveBeenCalled();
    expect(result.message).toContain("hi Alice");
    expect(result.message).toContain("hi Bob");
  });

  it("greets others when chat is null", async () => {
    const client = makeClient();
    const brain = makeLlmBrain({ client, model: "test-model" });
    const result = await brain({
      name: "Chad",
      character: defaultCharacter,
      others: [{ name: "Alice" }],
      chat: null,
      location: "water cooler",
    });

    expect(client.messages.create).not.toHaveBeenCalled();
    expect(result.message).toContain("hi Alice");
  });

  it("returns null if the last message is from the speaker", async () => {
    const client = { messages: { create: jasmine.createSpy("create") } };
    const brain = makeLlmBrain({ client, model: "test-model" });
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
    expect(client.messages.create).not.toHaveBeenCalled();
  });

  it("returns null when the model signals done", async () => {
    const client = makeClient({ content: [{ type: "text", text: "[done]" }] });
    const brain = makeLlmBrain({ client, model: "test-model" });
    const result = await brain({
      name: "Chad",
      character: defaultCharacter,
      others: [{ name: "Alice" }],
      chat: [{ from: "Chad", message: "hi Alice" }, { from: "Alice", message: "hey" }],
      location: "water cooler",
    });

    expect(result).toBeNull();
  });

  it("strips [done] and sends remaining text", async () => {
    const client = makeClient({ content: [{ type: "text", text: "Sounds good, talk soon.\n\n[done]" }] });
    const brain = makeLlmBrain({ client, model: "test-model" });
    const result = await brain({
      name: "Chad",
      character: defaultCharacter,
      others: [{ name: "Alice" }],
      chat: [{ from: "Chad", message: "hi Alice" }, { from: "Alice", message: "hey" }],
      location: "water cooler",
    });

    expect(result.message).toEqual("Sounds good, talk soon.");
  });

  it("returns null when done signal is all that remains after stripping", async () => {
    const client = makeClient({ content: [{ type: "text", text: "  [done]  " }] });
    const brain = makeLlmBrain({ client, model: "test-model" });
    const result = await brain({
      name: "Chad",
      character: defaultCharacter,
      others: [{ name: "Alice" }],
      chat: [{ from: "Chad", message: "hi Alice" }, { from: "Alice", message: "hey" }],
      location: "water cooler",
    });

    expect(result).toBeNull();
  });

  it("returns null and logs to stderr on API error", async () => {
    const client = {
      messages: {
        create: jasmine
          .createSpy("create")
          .and.rejectWith(new Error("credit balance too low")),
      },
    };
    spyOn(console, "error");

    const brain = makeLlmBrain({ client, model: "test-model" });
    const result = await brain({
      name: "Chad",
      character: defaultCharacter,
      others: [{ name: "Alice" }],
      chat: [{ from: "Chad", message: "hi Alice" }, { from: "Alice", message: "hey" }],
      location: "water cooler",
    });

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      "[Chad] LLM error: credit balance too low",
    );
  });

  it("returns null silently when content is null with stop_reason end_turn", async () => {
    const client = makeClient({
      content: null,
      stop_reason: "end_turn",
      id: "msg_123",
      type: "message",
      role: "assistant",
      model: "test-model",
      usage: { input_tokens: 10, output_tokens: 1 },
    });
    spyOn(console, "error");
    spyOn(console, "warn");

    const brain = makeLlmBrain({ client, model: "test-model" });
    const result = await brain({
      name: "Chad",
      character: defaultCharacter,
      others: [{ name: "Alice" }],
      chat: [{ from: "Chad", message: "hi Alice" }, { from: "Alice", message: "hey" }],
      location: "water cooler",
    });

    expect(result).toBeNull();
    expect(console.error).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("includes character memory in system prompt when memory is provided", async () => {
    const client = makeClient();
    const memory = { read: jasmine.createSpy("read").and.returnValue("Working on: issue #18") };
    const brain = makeLlmBrain({ client, model: "test-model", memory });
    await brain({
      name: "Chad",
      character: defaultCharacter,
      others: [{ name: "Alice" }],
      chat: [{ from: "Chad", message: "hi" }, { from: "Alice", message: "hey" }],
      location: "water cooler",
    });

    expect(memory.read).toHaveBeenCalledWith("Chad");
    expect(captureSystem(client)).toContain("Working on: issue #18");
  });

  it("returns null with warning when content is null with other stop_reason", async () => {
    const client = makeClient({
      content: null,
      stop_reason: "max_tokens",
      id: "msg_123",
      type: "message",
      role: "assistant",
      model: "test-model",
      usage: { input_tokens: 10, output_tokens: 256 },
    });
    spyOn(console, "warn");

    const brain = makeLlmBrain({ client, model: "test-model" });
    const result = await brain({
      name: "Chad",
      character: defaultCharacter,
      others: [{ name: "Alice" }],
      chat: [{ from: "Chad", message: "hi Alice" }, { from: "Alice", message: "hey" }],
      location: "water cooler",
    });

    expect(result).toBeNull();
    expect(console.warn).toHaveBeenCalledWith(
      "[Chad] No text content (stop_reason: max_tokens)",
    );
  });
});
