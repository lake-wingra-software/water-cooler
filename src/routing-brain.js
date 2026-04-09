function makeRoutingBrain({ publicBrain, workBrain }) {
  return function routingBrain(ctx) {
    if (ctx.location === "cubicle") {
      return workBrain(ctx);
    }
    return publicBrain(ctx);
  };
}

module.exports = makeRoutingBrain;
