const Simulation = require('./src/simulation');
const Person = require('./src/person');
const { defaultSchedule, chadSchedule } = require('./src/schedules');
const greeter = require('./src/greeter');

const sim = new Simulation();
const alice = new Person('Alice', defaultSchedule, greeter);
const bob = new Person('Bob', defaultSchedule, greeter);

const chad = new Person('Chad', chadSchedule, greeter);

sim.addPerson(alice);
sim.addPerson(bob);
sim.addPerson(chad);

// Log initial state
console.log(`${sim.currentTime.toString()}: Alice ${alice.currentLocation()}, Bob ${bob.currentLocation()}, Chad ${chad.currentLocation()}`);

// Listen for location changes
sim.on('locationChanged', ({ person, to }) => {
  console.log(`${sim.currentTime.toString()}: ${person.name} → ${to}`);
});

// Listen for messages
alice.on('messageReceived', (msg) => {
  console.log(`${sim.currentTime.toString()}: ${msg.from} → Alice: "${msg.message}"`);
});

bob.on('messageReceived', (msg) => {
  console.log(`${sim.currentTime.toString()}: ${msg.from} → Bob: "${msg.message}"`);
});

chad.on('messageReceived', (msg) => {
  console.log(`${sim.currentTime.toString()}: ${msg.from} → Chad: "${msg.message}"`);
});

while (sim.isActiveWorkday()) {
  sim.tick();
}

console.log(`${sim.currentTime.toString()}: workday ended`);
