const yeahMan = require("../src/yeah-man");

describe("yeahMan brain", () => {
  it("greets ungreeted people same as greeter", () => {
    const brain = yeahMan();
    const bob = { name: "bob" };
    const result = brain({ name: "alice", others: [bob], chat: [] });
    expect(result).toEqual({ to: [bob], message: "hi bob" });
  });

  it("responds to statements with a response from the list", () => {
    const brain = yeahMan();
    const chat = [
      { from: "alice", message: "hi bob" },
      { from: "bob", message: "hi alice" },
      { from: "alice", message: "nice weather today" },
    ];
    const result = brain({ name: "bob", others: [{ name: "alice" }], chat });
    expect(result.message).toBeDefined();
    expect(result.to).toEqual([{ name: "alice" }]);
  });

  it("responds to questions with a dodge from the list", () => {
    const brain = yeahMan();
    const chat = [
      { from: "alice", message: "hi bob" },
      { from: "bob", message: "hi alice" },
      { from: "alice", message: "is the work done?" },
    ];
    const result = brain({ name: "bob", others: [{ name: "alice" }], chat });
    expect(result.message).toBeDefined();
    expect(result.to).toEqual([{ name: "alice" }]);
  });

  it("returns null if last message is from self", () => {
    const brain = yeahMan();
    const chat = [
      { from: "bob", message: "hi alice" },
      { from: "alice", message: "hi bob" },
      { from: "alice", message: "nice weather" },
      { from: "bob", message: "Oh yeah?" },
    ];
    const result = brain({ name: "bob", others: [{ name: "alice" }], chat });
    expect(result).toBeNull();
  });

  it("returns null if chat is empty and everyone is greeted", () => {
    const brain = yeahMan();
    const chat = [
      { from: "alice", message: "hi bob" },
      { from: "bob", message: "hi alice" },
    ];
    // last message is from bob, so should return null
    const result = brain({ name: "bob", others: [{ name: "alice" }], chat });
    expect(result).toBeNull();
  });
});
