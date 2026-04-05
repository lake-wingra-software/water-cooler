const Simulation = require('./src/simulation');
const Person = require('./src/person');
const { defaultSchedule } = require('./src/schedules');

const sim = new Simulation();
const alice = new Person('Alice', defaultSchedule);
const bob = new Person('Bob', defaultSchedule);

sim.addPerson(alice);
sim.addPerson(bob);

// Log initial state
console.log(`${sim.currentTime.toString()}: Alice ${alice.currentActivity()}, Bob ${bob.currentActivity()}`);

// Listen for activity changes
alice.on('activityChanged', (data) => {
  console.log(`${data.time.toString()}: ${data.name} ${data.activity}`);
});

bob.on('activityChanged', (data) => {
  console.log(`${data.time.toString()}: ${data.name} ${data.activity}`);
});

// Listen for messages
alice.on('messageReceived', (msg) => {
  console.log(`${sim.currentTime.toString()}: ${msg.from} → ${msg.from === 'Alice' ? 'Bob' : 'Alice'}: "${msg.message}"`);
});

bob.on('messageReceived', (msg) => {
  console.log(`${sim.currentTime.toString()}: ${msg.from} → ${msg.from === 'Alice' ? 'Bob' : 'Alice'}: "${msg.message}"`);
});

while (sim.isActiveWorkday()) {
  sim.tick();
}

console.log(`${sim.currentTime.toString()}: workday ended`);
