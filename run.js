require('dotenv').config()

const Simulation = require('./src/simulation');
const Person = require('./src/person');
const { defaultSchedule, chadSchedule } = require('./src/schedules');
const greeter = require('./src/greeter');
const makeLlmBrain = require('./src/llm-brain');
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();

const sim = new Simulation();
const alice = new Person('Alice', defaultSchedule, greeter);
const bob = new Person('Bob', defaultSchedule, greeter);

const chadBrain = makeLlmBrain({ personality: 'friendly but a bit sarcastic, keeps it brief', client, model: process.env.LLM_MODEL || 'claude-haiku-4-5' });
const chad = new Person('Chad', chadSchedule, chadBrain);

sim.addPerson(alice);
sim.addPerson(bob);
sim.addPerson(chad);

// Log initial state
console.log(`${sim.currentTime.toString()}: Alice ${alice.currentLocation()}, Bob ${bob.currentLocation()}, Chad ${chad.currentLocation()}`);

// Listen for location changes
sim.on('locationChanged', ({ person, to }) => {
  console.log(`${sim.currentTime.toString()}: ${person.name} → ${to}`);
});

// Listen for messages at each shared location
for (const location of Object.values(sim.locations)) {
  location.on('messageSent', ({ from, message }) => {
    console.log(`${sim.currentTime.toString()}: [${location.name}] ${from}: "${message}"`);
  });
}

// TICKS_PER_SEC: simulated minutes per real millisecond. Default: 1 hour per second (1/16.67)
// Set TICKS_PER_SEC=0 for instant execution.
const ticksPerSec = process.env.TICKS_PER_SEC;
const tickInterval = ticksPerSec === '0' ? 0 : Math.round(1000 / (parseFloat(ticksPerSec) || 60));

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
