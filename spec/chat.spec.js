const { runChat, ADVISOR_NAME } = require("../src/chat");

describe("chat", () => {
  function makeReadline(inputs) {
    const handlers = {};
    return {
      question(prompt, cb) {
        const input = inputs.shift();
        if (input !== undefined) setImmediate(() => cb(input));
      },
      on(event, cb) { handlers[event] = cb; },
      close() {},
    };
  }

  it("/exit runs reflection with the conversation transcript and ends the loop", async () => {
    const brain = jasmine.createSpy("brain").and.returnValue(
      Promise.resolve({ to: [], message: "just some work." })
    );
    const reflect = jasmine.createSpy("reflect").and.returnValue(Promise.resolve());
    const readline = makeReadline(["what are you up to?", "/exit"]);

    await runChat({ brain, characterDef: { name: "alice" }, reflect, readline, onMessage: () => {} });

    expect(reflect).toHaveBeenCalledWith(
      jasmine.objectContaining({
        name: "alice",
        chat: jasmine.arrayContaining([
          jasmine.objectContaining({ from: ADVISOR_NAME, message: "what are you up to?" }),
          jasmine.objectContaining({ from: "alice", message: "just some work." }),
        ]),
      })
    );
  });

  it("calls the brain with the user's message and prints the response", async () => {
    const messages = [];
    const brain = jasmine.createSpy("brain").and.returnValue(
      Promise.resolve({ to: [], message: "I'm working on the team roles doc." })
    );
    const reflect = jasmine.createSpy("reflect").and.returnValue(Promise.resolve());
    const readline = makeReadline(["what are you working on?", "/exit"]);
    const onMessage = jasmine.createSpy("onMessage");

    await runChat({ brain, characterDef: { name: "alice" }, reflect, readline, onMessage });

    expect(brain).toHaveBeenCalledWith(
      jasmine.objectContaining({
        chat: jasmine.arrayContaining([
          jasmine.objectContaining({ from: ADVISOR_NAME, message: "what are you working on?" }),
        ]),
      })
    );
    expect(onMessage).toHaveBeenCalledWith("alice", "I'm working on the team roles doc.");
  });
});
