const Simulation = require('./src/simulation');
const Person = require('./src/person');
const Time = require('./src/time');

const schedule = [
  { startTime: new Time(9, 0), endTime: new Time(12, 0), activity: 'working' },
  { startTime: new Time(12, 0), endTime: new Time(13, 0), activity: 'cafeteria' },
  { startTime: new Time(13, 0), endTime: new Time(15, 30), activity: 'working' },
  { startTime: new Time(15, 30), endTime: new Time(16, 30), activity: 'water cooler' },
  { startTime: new Time(16, 30), endTime: new Time(17, 0), activity: 'working' }
];

const sim = new Simulation();
const alice = new Person('Alice', schedule);
const bob = new Person('Bob', schedule);

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
