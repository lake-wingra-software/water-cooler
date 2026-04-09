const Person = require("./person");
const yeahMan = require("./yeah-man");
const makeRoutingBrain = require("./routing-brain");
const { alice, bob, jim, ruby, yoder } = require("./character-defs");

// --- Wire up people with brains ---

module.exports = (llmBrain, cliBrain, reflector) => {
  const brain = makeRoutingBrain({ publicBrain: llmBrain, workBrain: cliBrain });
  return [
    new Person(alice, brain, { reflector }),
    // new Person(bob, yeahMan()),
    new Person(jim, brain, { reflector }),
    // new Person(ruby, brain, { reflector }),
    // new Person(yoder, brain, { reflector }),
  ];
};
