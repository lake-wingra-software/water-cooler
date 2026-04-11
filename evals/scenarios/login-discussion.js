const Time = require("../../src/time");
const { alice, jim } = require("../../src/character-defs");
const recognizesMissingContext = require("../checks/recognizes-missing-context");

const LOCATION = "water cooler";
const EVAL_SCHEDULE = [{ startTime: new Time(9, 0), endTime: new Time(11, 0), location: LOCATION }];

module.exports = {
  label: "alice and jim discuss user login without product context",
  location: LOCATION,
  maxTurns: 4,
  people: [
    {
      def: { ...alice, schedule: EVAL_SCHEDULE },
      memory:
        "Working on: discuss user login with jim. jim is the software engineer on our team.",
    },
    {
      def: { ...jim, schedule: EVAL_SCHEDULE },
      memory:
        "Catching up with alice today. alice is the Product Manager on our team.",
    },
  ],
  checks: [recognizesMissingContext],
};
