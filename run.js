require('dotenv').config()

const Simulation = require('./src/simulation');
const Person = require('./src/person');
const { defaultSchedule, chadSchedule } = require('./src/schedules');
const yeahMan = require('./src/yeah-man');
const makeLlmBrain = require('./src/llm-brain');
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();
const model = process.env.LLM_MODEL || 'claude-haiku-4-5';

const aliceBrain = makeLlmBrain({
  characterSheet: {
    traits: 'no-nonsense, direct, professional, perpetually behind on deadlines, easily exasperated by flippancy',
    role: 'engineering manager',
    goals: ['keep the project on track', 'get straight answers from the team', 'meet the sprint deadline'],
  },
  client,
  model,
});

const chadBrain = makeLlmBrain({
  characterSheet: {
    traits: 'sarcastic, casual, confident — knows he\'s good at his job and uses it as license to be flippant',
    role: 'software engineer',
    goals: ['avoid extra work', 'deflect with humor', 'get through the day with minimal meetings'],
  },
  client,
  model,
});

const sim = new Simulation();
const alice = new Person('Alice', defaultSchedule, aliceBrain);
const bob = new Person('Bob', defaultSchedule, yeahMan());
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

// TICKS_PER_SEC: ticks per second. Default: 10 (1 hour = 6 seconds).
// Set TICKS_PER_SEC=0 for instant execution.
const ticksPerSec = process.env.TICKS_PER_SEC;
const tickInterval = ticksPerSec === '0' ? 0 : Math.round(1000 / (parseFloat(ticksPerSec) || 10));

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
