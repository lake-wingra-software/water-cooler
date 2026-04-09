const Person = require("./person");
const yeahMan = require("./yeah-man");
const Time = require("./time");

// --- Character sheets (pure data) ---

const alice = {
  name: "Alice",
  schedule: [
    { startTime: new Time(9, 0), endTime: new Time(11, 0), location: "conference room" },
    { startTime: new Time(11, 0), endTime: new Time(12, 0), location: "cubicle" },
    { startTime: new Time(12, 0), endTime: new Time(12, 30), location: "cafeteria" },
    { startTime: new Time(12, 30), endTime: new Time(17, 0), location: "cubicle" },
  ],
  character: {
    traits:
      "direct, focused",
    role: "Product Manager",
    goals: ["Figure out how to get from A to B", "Identify blockers"],
  },
};

const bob = {
  name: "Bob",
  schedule: [
    { startTime: new Time(9, 0), endTime: new Time(10, 0), location: "water cooler" },
    { startTime: new Time(10, 0), endTime: new Time(12, 0), location: "cubicle" },
    { startTime: new Time(12, 0), endTime: new Time(13, 0), location: "cafeteria" },
    { startTime: new Time(13, 0), endTime: new Time(17, 0), location: "cubicle" },
  ],
};

const jim = {
  name: "Jim",
  schedule: [
    { startTime: new Time(9, 0), endTime: new Time(10, 0), location: "conference room" },
    { startTime: new Time(10, 0), endTime: new Time(11, 0), location: "conference room" },
    { startTime: new Time(11, 0), endTime: new Time(12, 30), location: "cubicle" },
    { startTime: new Time(12, 30), endTime: new Time(13, 30), location: "cafeteria" },
    { startTime: new Time(13, 30), endTime: new Time(16, 10), location: "cubicle" },
    { startTime: new Time(16, 10), endTime: new Time(16, 30), location: "water cooler" },
    { startTime: new Time(16, 30), endTime: new Time(17, 0), location: "cubicle" },
  ],
  character: {
    traits: "Helpful and engaging. Thinks in terms of systems.",
    role: "software engineer",
    goals: [
      "Assess feasibility of solutions",
      "When the situation calls for it, delivers working software"
    ],
  },
};

const ruby = {
  name: "Ruby",
  schedule: [
    { startTime: new Time(9, 0), endTime: new Time(10, 0), location: "water cooler" },
    { startTime: new Time(10, 0), endTime: new Time(12, 0), location: "cubicle" },
    { startTime: new Time(12, 0), endTime: new Time(12, 30), location: "cafeteria" },
    { startTime: new Time(12, 30), endTime: new Time(16, 30), location: "water cooler" },
  ],
  character: {
    traits:
      "Into horoscopes. Likes to be cozy, likes cats, likes plants, likes books, likes tea. Is afraid of the dark. Believes in aliens.",
    role: "office temp",
    goals: ["do a good job", "get approval", "find a better job"],
  },
};

const yoder = {
  name: "Yoder",
  schedule: [
    { startTime: new Time(9, 0), endTime: new Time(17, 0), location: "conference room" },
  ],
  character: {
    traits: "Old-school relationship builder, prefers face-to-face",
    role: "Product Designer",
    goals: ["Advocate for the users"],
  },
};

// --- Wire up people with brains ---

module.exports = (llmBrain, cliBrain, reflector) => [
  new Person(alice, llmBrain, { reflector }),
  // new Person(bob, yeahMan()),
  new Person(jim, cliBrain, { reflector }),
  // new Person(ruby, llmBrain, { reflector }),
  // new Person(yoder, llmBrain, { reflector }),
];
