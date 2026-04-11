const Time = require("../../src/time");
const { alice, yoder } = require("../../src/character-defs");
const namesjim = require("../checks/names-jim");
const noSpeakingForAbsent = require("../checks/no-speaking-for-absent");

const LOCATION = "water cooler";
const EVAL_SCHEDULE = [{ startTime: new Time(9, 0), endTime: new Time(11, 0), location: LOCATION }];

module.exports = {
  label: "alice and yoder blocked without jim",
  location: LOCATION,
  maxTurns: 12,
  people: [
    {
      def: { ...alice, schedule: EVAL_SCHEDULE },
      memory:
        "Working on: decide with yoder whether to build real-time notifications or batch them. jim is the software engineer on our team.",
    },
    {
      def: { ...yoder, schedule: EVAL_SCHEDULE },
      memory:
        "Working on: decide with alice whether to build real-time notifications or batch them. jim is the software engineer on our team.",
    },
  ],
  checks: [noSpeakingForAbsent, namesjim],
};
