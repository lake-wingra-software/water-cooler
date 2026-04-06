const Person = require("./person");
const yeahMan = require("./yeah-man");
const Time = require("./time");

// --- Character sheets (pure data) ---

const alice = {
  name: "Alice",
  schedule: [
    { startTime: new Time(9, 0), endTime: new Time(10, 0), location: "water cooler" },
    { startTime: new Time(10, 0), endTime: new Time(11, 0), location: "conference room" },
    { startTime: new Time(11, 0), endTime: new Time(12, 0), location: "cubicle" },
    { startTime: new Time(12, 0), endTime: new Time(12, 30), location: "cafeteria" },
    { startTime: new Time(12, 30), endTime: new Time(17, 0), location: "cubicle" },
  ],
  character: {
    traits:
      "direct, perpetually needing to meet deadlines, easily exasperated by flippancy",
    role: "engineering manager",
    goals: ["get straight answers from the team", "fire underperformers"],
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
    { startTime: new Time(9, 0), endTime: new Time(10, 0), location: "water cooler" },
    { startTime: new Time(10, 0), endTime: new Time(11, 0), location: "conference room" },
    { startTime: new Time(11, 0), endTime: new Time(12, 30), location: "cubicle" },
    { startTime: new Time(12, 30), endTime: new Time(13, 30), location: "cafeteria" },
    { startTime: new Time(13, 30), endTime: new Time(16, 10), location: "cubicle" },
    { startTime: new Time(16, 10), endTime: new Time(16, 30), location: "water cooler" },
    { startTime: new Time(16, 30), endTime: new Time(17, 0), location: "cubicle" },
  ],
  character: {
    traits: "sarcastic, casual, confident. avoids directly answering questions",
    role: "software engineer",
    goals: [
      "never talk about business at the water cooler",
      "deflect with humor",
      "get through the day with minimal meetings",
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
    { startTime: new Time(16, 0), endTime: new Time(17, 0), location: "water cooler" },
  ],
  character: {
    traits: "Amish.",
    role: "Sales rep",
    goals: ["don't use modern technology"],
  },
};

// --- Wire up people with brains ---

module.exports = (llmBrain) => [
  new Person(alice, llmBrain),
  new Person(bob, yeahMan()),
  new Person(jim, llmBrain),
  new Person(ruby, llmBrain),
  new Person(yoder, llmBrain),
];
