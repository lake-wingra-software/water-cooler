const Person = require("./person");
const yeahMan = require("./yeah-man");
const makeRoutingBrain = require("./routing-brain");
const { alice, bob, jim, ruby, yoder } = require("./character-defs");

// --- Wire up people with brains ---

module.exports = (chatBrain, workBrain, reflector) => {
  const brain = makeRoutingBrain({ chatBrain, workBrain });
  const aliceTools = ["Read", "Grep", "Glob", "Bash(gh:*)", "WebFetch"];
  const jimTools = ["Read", "Grep", "Glob", "Edit", "Write", "Bash(gh:*)", "Bash(npm test:*)"];
  return [
    new Person(alice, brain, { reflector, allowedTools: aliceTools }),
    // new Person(bob, yeahMan()),
    new Person(jim, brain, { reflector, allowedTools: jimTools }),
    // new Person(ruby, brain, { reflector }),
    // new Person(yoder, brain, { reflector }),
  ];
};
