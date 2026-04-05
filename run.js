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

// SIM_SPEED: simulated minutes per real millisecond. Default: 1 hour per second (1/16.67)
// Set SIM_SPEED=0 for instant execution.
const speed = process.env.SIM_SPEED;
const tickInterval = speed === '0' ? 0 : Math.round(1000 / (parseFloat(speed) || 60));

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
