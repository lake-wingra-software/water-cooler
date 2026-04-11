const Person = require("./person");
const yeahMan = require("./yeah-man");
const makeRoutingBrain = require("./routing-brain");
const { alice, bob, jim, ruby, yoder } = require("./character-defs");

// --- Wire up people with brains ---

const activeCharacters = [alice, jim];

module.exports = (chatBrain, workBrain, reflector) => {
  const brain = makeRoutingBrain({ chatBrain, workBrain });
  return activeCharacters.map(
    (c) => new Person(c, brain, { reflector, allowedTools: c.allowedTools }),
  );
};

module.exports.names = activeCharacters.map((c) => c.name);
