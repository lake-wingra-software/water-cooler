const makeRoutingBrain = require("../src/routing-brain");

describe("routing brain", () => {
  let publicBrain, workBrain, ctx;

  beforeEach(() => {
    publicBrain = jasmine.createSpy("publicBrain");
    workBrain = jasmine.createSpy("workBrain");
    ctx = { name: "Alice", others: [], chat: [] };
  });

  it("delegates to publicBrain at a public location", () => {
    const brain = makeRoutingBrain({ publicBrain, workBrain });
    brain({ ...ctx, location: "water cooler" });
    expect(publicBrain).toHaveBeenCalledWith({ ...ctx, location: "water cooler" });
    expect(workBrain).not.toHaveBeenCalled();
  });

  it("delegates to workBrain at the cubicle", () => {
    const brain = makeRoutingBrain({ publicBrain, workBrain });
    brain({ ...ctx, location: "cubicle" });
    expect(workBrain).toHaveBeenCalledWith({ ...ctx, location: "cubicle" });
    expect(publicBrain).not.toHaveBeenCalled();
  });
});
