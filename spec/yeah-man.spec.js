const yeahMan = require("../src/yeah-man");

describe("yeahMan brain", () => {
  it("greets ungreeted people same as greeter", () => {
    const brain = yeahMan();
    const bob = { name: "Bob" };
    const result = brain({ name: "Alice", others: [bob], chat: [] });
    expect(result).toEqual({ to: [bob], message: "hi Bob" });
  });

  it("responds to statements with a response from the list", () => {
    const brain = yeahMan();
    const chat = [
      { from: "Alice", message: "hi Bob" },
      { from: "Bob", message: "hi Alice" },
      { from: "Alice", message: "nice weather today" },
    ];
    const result = brain({ name: "Bob", others: [{ name: "Alice" }], chat });
    expect(result.message).toBeDefined();
    expect(result.to).toEqual([{ name: "Alice" }]);
  });

  it("responds to questions with a dodge from the list", () => {
    const brain = yeahMan();
    const chat = [
      { from: "Alice", message: "hi Bob" },
      { from: "Bob", message: "hi Alice" },
      { from: "Alice", message: "is the work done?" },
    ];
    const result = brain({ name: "Bob", others: [{ name: "Alice" }], chat });
    expect(result.message).toBeDefined();
    expect(result.to).toEqual([{ name: "Alice" }]);
  });

  it("returns null if last message is from self", () => {
    const brain = yeahMan();
    const chat = [
      { from: "Bob", message: "hi Alice" },
      { from: "Alice", message: "hi Bob" },
      { from: "Alice", message: "nice weather" },
      { from: "Bob", message: "Oh yeah?" },
    ];
    const result = brain({ name: "Bob", others: [{ name: "Alice" }], chat });
    expect(result).toBeNull();
  });

  it("returns null if chat is empty and everyone is greeted", () => {
    const brain = yeahMan();
    const chat = [
      { from: "Alice", message: "hi Bob" },
      { from: "Bob", message: "hi Alice" },
    ];
    // last message is from Bob, so should return null
    const result = brain({ name: "Bob", others: [{ name: "Alice" }], chat });
    expect(result).toBeNull();
  });
});
