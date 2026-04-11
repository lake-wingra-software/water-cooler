require("dotenv").config();

const fs = require("fs");
const Simulation = require("./src/simulation");
const makeLlmBrain = require("./src/llm-brain");
const makeCliBrain = require("./src/cli-brain");
const makeReflectionBrain = require("./src/reflection-brain");
const Memory = require("./src/memory");
const { workspacePathFor } = require("./src/workspace");
const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({
  baseURL: process.env.ANTHROPIC_URL,
});
const model = process.env.LLM_MODEL || "claude-haiku-4-5";
const memory = new Memory();

const chatBrain = makeLlmBrain({ client, model, memory });
const workBrain = makeCliBrain({ model, memory });
const reflector = makeReflectionBrain({ client, model, memory });

const DEFAULT_TICKS_PER_SEC = 8;
const ticksPerSec = parseFloat(process.env.TICKS_PER_SEC) || DEFAULT_TICKS_PER_SEC;
if (ticksPerSec <= 0) {
  throw new Error(`TICKS_PER_SEC must be greater than 0 (got ${process.env.TICKS_PER_SEC})`);
}
const tickInterval = Math.round(1000 / ticksPerSec);

const daysArg = process.argv.find((a) => a.startsWith("--days="));
const days = daysArg ? parseInt(daysArg.split("=")[1]) : 1;

function runDay() {
  return new Promise((resolve) => {
    const sim = new Simulation();
    const people = require("./src/characters")(chatBrain, workBrain, reflector);
    people.forEach((p) => fs.mkdirSync(workspacePathFor(p.name), { recursive: true }));
    people.forEach((p) => sim.addPerson(p));

    const byLocation = {};
    for (const person of people) {
      const loc = person.currentLocation();
      if (loc) (byLocation[loc] = byLocation[loc] || []).push(person.name);
    }
    const locationSummary = Object.entries(byLocation)
      .map(([loc, names]) => {
        const listed =
          names.length < 3
            ? names.join(" and ")
            : `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
        return `${listed} at the ${loc}`;
      })
      .join("; ");
    console.log(`${sim.currentTime.toString()}: ${locationSummary}`);

    sim.on("locationChanged", ({ person, to }) => {
      console.log(`${sim.currentTime.toString()}: ${person.name} → ${to}`);
    });

    for (const person of people) {
      person.on("worked", ({ name, location, message }) => {
        console.log(
          `${sim.currentTime.toString()}: [${location}] ${name}: "${message}"`,
        );
      });
    }

    for (const location of Object.values(sim.publicLocations)) {
      location.on("messageSent", ({ from, message }) => {
        console.log(
          `${sim.currentTime.toString()}: [${location.name}] ${from}: "${message}"`,
        );
      });
    }

    const timer = setInterval(() => {
      sim.tick();
      if (!sim.isActiveWorkday()) {
        clearInterval(timer);
        console.log(`${sim.currentTime.toString()}: workday ended`);
        resolve();
      }
    }, tickInterval);
  });
}

async function main() {
  for (let day = 1; day <= days; day++) {
    console.log(`\n--- Day ${day} ---`);
    await runDay();
  }
  // The Anthropic SDK keeps a connection pool alive that Node's event loop
  // won't drain on its own. Force-exit so the sim doesn't hang after the
  // workday ends. Same workaround as harness.js meeting mode.
  process.exit(0);
}

main();
