const Time = require("./time");

const alice = {
  name: "Alice",
  schedule: [
    { startTime: new Time(9, 0), endTime: new Time(10, 0), location: "conference room" },
    { startTime: new Time(10, 0), endTime: new Time(12, 0), location: "cubicle" },
    { startTime: new Time(12, 0), endTime: new Time(12, 30), location: "cafeteria" },
    { startTime: new Time(12, 30), endTime: new Time(16, 30), location: "cubicle" },
    { startTime: new Time(16, 30), endTime: new Time(17, 0), location: "water cooler" },
  ],
  character: {
    traits: "direct, focused",
    role: "Product Manager",
    goals: [],
  },
};

const bob = {
  name: "Bob",
  schedule: [
    { startTime: new Time(9, 0), endTime: new Time(10, 0), location: "conference room" },
    { startTime: new Time(10, 0), endTime: new Time(12, 0), location: "cubicle" },
    { startTime: new Time(12, 0), endTime: new Time(13, 0), location: "cafeteria" },
    { startTime: new Time(13, 0), endTime: new Time(17, 0), location: "cubicle" },
  ],
};

const jim = {
  name: "Jim",
  schedule: [
    { startTime: new Time(9, 0), endTime: new Time(10, 0), location: "conference room" },
    { startTime: new Time(10, 0), endTime: new Time(12, 30), location: "cubicle" },
    { startTime: new Time(12, 30), endTime: new Time(13, 30), location: "cafeteria" },
    { startTime: new Time(13, 30), endTime: new Time(16, 30), location: "cubicle" },
    { startTime: new Time(16, 30), endTime: new Time(17, 0), location: "water cooler" },
  ],
  character: {
    traits: "Helpful and engaging. Thinks in terms of systems.",
    role: "software engineer",
    goals: [],
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
    goals: [],
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
    goals: [],
  },
};

module.exports = { alice, bob, jim, ruby, yoder };
