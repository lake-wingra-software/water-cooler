const Simulation = require('./src/simulation');
const Person = require('./src/person');
const { defaultSchedule } = require('./src/schedules');
const greeter = require('./src/greeter');

const sim = new Simulation();
const alice = new Person('Alice', defaultSchedule, greeter);
const bob = new Person('Bob', defaultSchedule, greeter);

sim.addPerson(alice);
sim.addPerson(bob);

// Log initial state
console.log(`${sim.currentTime.toString()}: Alice ${alice.currentLocation()}, Bob ${bob.currentLocation()}`);

// Listen for location changes
alice.on('locationChanged', (data) => {
  console.log(`${data.time.toString()}: ${data.name} ${data.location}`);
});

bob.on('locationChanged', (data) => {
  console.log(`${data.time.toString()}: ${data.name} ${data.location}`);
});

// Listen for messages
alice.on('messageReceived', (msg) => {
  console.log(`${sim.currentTime.toString()}: ${msg.from} → Alice: "${msg.message}"`);
});

bob.on('messageReceived', (msg) => {
  console.log(`${sim.currentTime.toString()}: ${msg.from} → Bob: "${msg.message}"`);
});

while (sim.isActiveWorkday()) {
  sim.tick();
}

console.log(`${sim.currentTime.toString()}: workday ended`);
