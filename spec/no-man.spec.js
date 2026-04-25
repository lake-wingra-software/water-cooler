const noMan = require("../src/no-man");

describe("noMan brain", () => {
  it("responds to statements with a negative or neutral response", () => {
    const brain = noMan();
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
    const brain = noMan();
    const chat = [
      { from: "Alice", message: "hi Bob" },
      { from: "Bob", message: "hi Alice" },
      { from: "Alice", message: "is the work done?" },
    ];
    const result = brain({ name: "Bob", others: [{ name: "Alice" }], chat });
    expect(result.message).toBeDefined();
    expect(result.to).toEqual([{ name: "Alice" }]);
  });
});
