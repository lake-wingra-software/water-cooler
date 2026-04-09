const Time = require("../../src/time");
const { alice, yoder } = require("../../src/character-defs");
const namesJim = require("../checks/names-jim");
const noSpeakingForAbsent = require("../checks/no-speaking-for-absent");

const LOCATION = "water cooler";
const EVAL_SCHEDULE = [{ startTime: new Time(9, 0), endTime: new Time(11, 0), location: LOCATION }];

module.exports = {
  label: "Alice and Yoder blocked without Jim",
  location: LOCATION,
  maxTurns: 12,
  people: [
    {
      def: { ...alice, schedule: EVAL_SCHEDULE },
      memory:
        "Working on: decide with Yoder whether to build real-time notifications or batch them. Jim is the software engineer on our team.",
    },
    {
      def: { ...yoder, schedule: EVAL_SCHEDULE },
      memory:
        "Working on: decide with Alice whether to build real-time notifications or batch them. Jim is the software engineer on our team.",
    },
  ],
  checks: [noSpeakingForAbsent, namesJim],
};
