function makeRoutingBrain({ chatBrain, workBrain }) {
  return function routingBrain(ctx) {
    if (ctx.location === "cubicle") {
      return workBrain(ctx);
    }
    return chatBrain(ctx);
  };
}

module.exports = makeRoutingBrain;
