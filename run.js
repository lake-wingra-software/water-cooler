require("dotenv").config();

const Simulation = require("./src/simulation");
const makeLlmBrain = require("./src/llm-brain");
const makeCliBrain = require("./src/cli-brain");
const Memory = require("./src/memory");
const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({
  baseURL: process.env.ANTHROPIC_URL,
});
const model = process.env.LLM_MODEL || "claude-haiku-4-5";
const minutesPerTurn = 8;
const memory = new Memory();

const llmBrain = makeLlmBrain({ client, model, minutesPerTurn, memory });
const cliBrain = makeCliBrain({ model, allowedTools: ["Read", "Grep", "Glob"], memory });

const sim = new Simulation();
const people = require("./src/characters")(llmBrain, cliBrain);
people.forEach((p) => sim.addPerson(p));

// Log initial state
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

// Listen for location changes
sim.on("locationChanged", ({ person, to }) => {
  console.log(`${sim.currentTime.toString()}: ${person.name} → ${to}`);
});

// Listen for messages at each shared location
for (const location of Object.values(sim.locations)) {
  location.on("messageSent", ({ from, message }) => {
    console.log(
      `${sim.currentTime.toString()}: [${location.name}] ${from}: "${message}"`,
    );
  });
}

// TICKS_PER_SEC: ticks per second.
// Example: 10 (1 hour = 6 seconds).
// Set TICKS_PER_SEC=0 for instant execution.
const DEFAULT_TICKS_PER_SEC = 8;
const ticksPerSec = process.env.TICKS_PER_SEC;
const tickInterval =
  ticksPerSec === "0"
    ? 0
    : Math.round(1000 / (parseFloat(ticksPerSec) || DEFAULT_TICKS_PER_SEC));

if (tickInterval === 0) {
  while (sim.isActiveWorkday()) {
    sim.tick();
  }
  console.log(`${sim.currentTime.toString()}: workday ended`);
} else {
  const timer = setInterval(() => {
    sim.tick();
    if (!sim.isActiveWorkday()) {
      clearInterval(timer);
      console.log(`${sim.currentTime.toString()}: workday ended`);
    }
  }, tickInterval);
}
