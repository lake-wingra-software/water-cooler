const greeter = require("../src/greeter");

describe("greeter brain", () => {
  it("greets the first ungreeted person", () => {
    const bob = { name: "Bob" };
    const action = greeter({ name: "Alice", others: [bob], chat: [] });
    expect(action).toEqual({ to: [bob], message: "hi Bob" });
  });

  it("returns null when everyone has been greeted", () => {
    const bob = { name: "Bob" };
    const chat = [{ from: "Alice", message: "hi Bob" }];
    const action = greeter({ name: "Alice", others: [bob], chat });
    expect(action).toBeNull();
  });

  it("skips already-greeted people", () => {
    const bob = { name: "Bob" };
    const carol = { name: "Carol" };
    const chat = [{ from: "Alice", message: "hi Bob" }];
    const action = greeter({ name: "Alice", others: [bob, carol], chat });
    expect(action).toEqual({ to: [carol], message: "hi Carol" });
  });

  it("returns null when everyone was greeted in a combined message", () => {
    const alice = { name: "Alice" };
    const bob = { name: "Bob" };
    const chat = [{ from: "Chad", message: "hi Alice, hi Bob" }];
    const action = greeter({ name: "Chad", others: [alice, bob], chat });
    expect(action).toBeNull();
  });

  it('does not count a greeting for "Al" when "Alice" is greeted', () => {
    const al = { name: "Al" };
    const alice = { name: "Alice" };
    const chat = [{ from: "Bob", message: "hi Alice" }];
    const result = greeter({ name: "Bob", others: [al, alice], chat });
    expect(result).toEqual({ to: [al], message: "hi Al" });
  });

  it("greets all ungreeted people in one message", () => {
    const alice = { name: "Alice" };
    const bob = { name: "Bob" };
    const action = greeter({ name: "Chad", others: [alice, bob], chat: [] });
    expect(action).toEqual({ to: [alice, bob], message: "hi Alice, hi Bob" });
  });
});
