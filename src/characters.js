const Person = require("./person");
const yeahMan = require("./yeah-man");
const noMan = require("./no-man");
const makeRoutingBrain = require("./routing-brain");
const makeLlmBrain = require("./llm-brain");
const makeCliBrain = require("./cli-brain");
const { alice, bob, jim, ruby, yoder } = require("./character-defs");

function makeBrainFor(def, { client, model, memory } = {}) {
  switch (def.brain) {
    case "yeah-man": return yeahMan();
    case "no-man": return noMan();
    case "ai":
    default: {
      const chatBrain = makeLlmBrain({ client, model, memory });
      const workBrain = makeCliBrain({ model, memory });
      return makeRoutingBrain({ chatBrain, workBrain });
    }
  }
}

// --- Wire up people with brains ---

const activeCharacters = [alice, jim];

module.exports = (chatBrain, workBrain, reflector) => {
  const brain = makeRoutingBrain({ chatBrain, workBrain });
  return activeCharacters.map(
    (c) => new Person(c, brain, { reflector, allowedTools: c.allowedTools }),
  );
};

module.exports.names = activeCharacters.map((c) => c.name);
module.exports.makeBrainFor = makeBrainFor;
