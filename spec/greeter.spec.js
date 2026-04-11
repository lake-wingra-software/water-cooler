const makeGreeter = require("../src/greeter");

describe("greeter brain", () => {
  it("greets the first ungreeted person", () => {
    const brain = makeGreeter();
    const bob = { name: "bob" };
    const action = brain({ name: "alice", others: [bob], chat: [] });
    expect(action).toEqual({ to: [bob], message: "hi bob" });
  });

  it("returns null when everyone has been greeted", () => {
    const brain = makeGreeter();
    const bob = { name: "bob" };
    const chat = [{ from: "alice", message: "hi bob" }];
    const action = brain({ name: "alice", others: [bob], chat });
    expect(action).toBeNull();
  });

  it("skips already-greeted people", () => {
    const brain = makeGreeter();
    const bob = { name: "bob" };
    const carol = { name: "carol" };
    const chat = [{ from: "alice", message: "hi bob" }];
    const action = brain({ name: "alice", others: [bob, carol], chat });
    expect(action).toEqual({ to: [carol], message: "hi carol" });
  });

  it("returns null when everyone was greeted in a combined message", () => {
    const brain = makeGreeter();
    const alice = { name: "alice" };
    const bob = { name: "bob" };
    const chat = [{ from: "chad", message: "hi alice, hi bob" }];
    const action = brain({ name: "chad", others: [alice, bob], chat });
    expect(action).toBeNull();
  });

  it('does not count a greeting for "al" when "alice" is greeted', () => {
    const brain = makeGreeter();
    const al = { name: "al" };
    const alice = { name: "alice" };
    const chat = [{ from: "bob", message: "hi alice" }];
    const result = brain({ name: "bob", others: [al, alice], chat });
    expect(result).toEqual({ to: [al], message: "hi al" });
  });

  it("greets all ungreeted people in one message", () => {
    const brain = makeGreeter();
    const alice = { name: "alice" };
    const bob = { name: "bob" };
    const action = brain({ name: "chad", others: [alice, bob], chat: [] });
    expect(action).toEqual({ to: [alice, bob], message: "hi alice, hi bob" });
  });
});
