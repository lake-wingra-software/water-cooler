const makeReflectionBrain = require("../src/reflection-brain");

function makeClient(responseText) {
  return {
    messages: {
      create: jasmine
        .createSpy("create")
        .and.resolveTo({
          content: [{ type: "text", text: responseText ?? "Updated memory content." }],
        }),
    },
  };
}

describe("reflection brain", () => {
  it("calls the API with a narrator-style prompt", async () => {
    const client = makeClient();
    const memory = {
      read: jasmine.createSpy("read").and.returnValue(""),
      write: jasmine.createSpy("write"),
    };
    const reflect = makeReflectionBrain({ client, model: "test-model", memory });

    await reflect({
      name: "alice",
      chat: [{ from: "alice", message: "hi" }, { from: "bob", message: "hey" }],
    });

    expect(client.messages.create).toHaveBeenCalled();
  });

  it("includes existing memory in the prompt", async () => {
    const client = makeClient();
    const memory = {
      read: jasmine.createSpy("read").and.returnValue("Existing memory: working on issue #3"),
      write: jasmine.createSpy("write"),
    };
    const reflect = makeReflectionBrain({ client, model: "test-model", memory });

    await reflect({
      name: "alice",
      chat: [{ from: "alice", message: "hi" }],
    });

    const call = client.messages.create.calls.mostRecent().args[0];
    const prompt = call.messages[0].content;
    expect(prompt).toContain("Existing memory: working on issue #3");
  });

  it("includes chat transcript in the prompt", async () => {
    const client = makeClient();
    const memory = {
      read: jasmine.createSpy("read").and.returnValue(""),
      write: jasmine.createSpy("write"),
    };
    const reflect = makeReflectionBrain({ client, model: "test-model", memory });

    await reflect({
      name: "alice",
      chat: [
        { from: "alice", message: "we should fix the login bug" },
        { from: "bob", message: "agreed, I'll look into it" },
      ],
    });

    const call = client.messages.create.calls.mostRecent().args[0];
    const prompt = call.messages[0].content;
    expect(prompt).toContain("alice: we should fix the login bug");
    expect(prompt).toContain("bob: agreed, I'll look into it");
  });

  it("reads existing memory for the character", async () => {
    const client = makeClient();
    const memory = {
      read: jasmine.createSpy("read").and.returnValue("some memory"),
      write: jasmine.createSpy("write"),
    };
    const reflect = makeReflectionBrain({ client, model: "test-model", memory });

    await reflect({ name: "jim", chat: [{ from: "jim", message: "hi" }] });

    expect(memory.read).toHaveBeenCalledWith("jim");
  });

  it("writes updated memory for the character", async () => {
    const client = makeClient("New memory content after reflection.");
    const memory = {
      read: jasmine.createSpy("read").and.returnValue(""),
      write: jasmine.createSpy("write"),
    };
    const reflect = makeReflectionBrain({ client, model: "test-model", memory });

    await reflect({ name: "jim", chat: [{ from: "jim", message: "hi" }] });

    expect(memory.write).toHaveBeenCalledWith("jim", "New memory content after reflection.");
  });

  it("logs an error and does not throw on API error", async () => {
    const client = {
      messages: {
        create: jasmine.createSpy("create").and.rejectWith(new Error("network timeout")),
      },
    };
    const memory = {
      read: jasmine.createSpy("read").and.returnValue(""),
      write: jasmine.createSpy("write"),
    };
    spyOn(console, "error");
    const reflect = makeReflectionBrain({ client, model: "test-model", memory });

    await expectAsync(
      reflect({ name: "alice", chat: [{ from: "alice", message: "hi" }] })
    ).toBeResolved();

    expect(console.error).toHaveBeenCalled();
    expect(memory.write).not.toHaveBeenCalled();
  });
});
