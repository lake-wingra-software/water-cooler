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
      chat: [],
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
        { from: "Bob", message: "working on it" },
        { from: "Alice", message: "are we on track?" },
      ],
      location: "water cooler",
    });

    const messages = captureMessages(client);
    expect(messages[0]).toEqual({
      role: "assistant",
      content: "working on it",
    });
  });

  it("formats others' messages as user role with name labels", async () => {
    const client = makeClient();
    const brain = makeLlmBrain({ client, model: "test-model" });
    await brain({
      name: "Bob",
      character: defaultCharacter,
      others: [{ name: "Alice" }],
      chat: [{ from: "Alice", message: "are we on track?" }],
      location: "water cooler",
    });

    const messages = captureMessages(client);
    expect(messages[0]).toEqual({
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
        { from: "Alice", message: "status?" },
        { from: "Bob", message: "yeah what she said" },
      ],
      location: "water cooler",
    });

    const messages = captureMessages(client);
    expect(messages.length).toEqual(1);
    expect(messages[0].role).toEqual("user");
    expect(messages[0].content).toContain("Alice: status?");
    expect(messages[0].content).toContain("Bob: yeah what she said");
  });

  it("sends a default user message when chat is empty", async () => {
    const client = makeClient();
    const brain = makeLlmBrain({ client, model: "test-model" });
    await brain({
      name: "Chad",
      character: defaultCharacter,
      others: [{ name: "Alice" }],
      chat: [],
      location: "water cooler",
    });

    const messages = captureMessages(client);
    expect(messages.length).toEqual(1);
    expect(messages[0].role).toEqual("user");
  });

  it("returns null without calling the API when no turns remain", async () => {
    const client = { messages: { create: jasmine.createSpy("create") } };
    const brain = makeLlmBrain({
      client,
      model: "test-model",
      minutesPerTurn: 8,
    });
    const result = await brain({
      name: "Chad",
      character: defaultCharacter,
      others: [{ name: "Alice" }],
      chat: [],
      location: "water cooler",
      minutesRemaining: 0,
    });

    expect(result).toBeNull();
    expect(client.messages.create).not.toHaveBeenCalled();
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
      chat: [],
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
      chat: [],
      location: "water cooler",
    });

    expect(result).toBeNull();
    expect(console.error).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
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
      chat: [],
      location: "water cooler",
    });

    expect(result).toBeNull();
    expect(console.warn).toHaveBeenCalledWith(
      "[Chad] No text content (stop_reason: max_tokens)",
    );
  });
});
