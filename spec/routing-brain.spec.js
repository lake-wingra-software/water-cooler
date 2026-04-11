const makeRoutingBrain = require("../src/routing-brain");

describe("routing brain", () => {
  let chatBrain, workBrain, ctx;

  beforeEach(() => {
    chatBrain = jasmine.createSpy("chatBrain");
    workBrain = jasmine.createSpy("workBrain");
    ctx = { name: "alice", others: [], chat: [] };
  });

  it("delegates to chatBrain at a public location", () => {
    const brain = makeRoutingBrain({ chatBrain, workBrain });
    brain({ ...ctx, location: "water cooler" });
    expect(chatBrain).toHaveBeenCalledWith({ ...ctx, location: "water cooler" });
    expect(workBrain).not.toHaveBeenCalled();
  });

  it("delegates to workBrain at the cubicle", () => {
    const brain = makeRoutingBrain({ chatBrain, workBrain });
    brain({ ...ctx, location: "cubicle" });
    expect(workBrain).toHaveBeenCalledWith({ ...ctx, location: "cubicle" });
    expect(chatBrain).not.toHaveBeenCalled();
  });
});
