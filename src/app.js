const fs = require("fs");
const Simulation = require("./simulation");
const makeCharacters = require("./characters");
const { workspacePathFor } = require("./workspace");

async function runDay({ chatBrain, workBrain, reflector, log, tickInterval }) {
  return new Promise((resolve) => {
    const sim = new Simulation();
    const people = makeCharacters(chatBrain, workBrain, reflector);
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
    log(`${sim.currentTime.toString()}: ${locationSummary}`);

    sim.on("locationChanged", ({ person, to }) => {
      log(`${sim.currentTime.toString()}: ${person.name} → ${to}`);
    });

    for (const person of people) {
      person.on("worked", ({ name, location, message }) => {
        log(`${sim.currentTime.toString()}: [${location}] ${name}: "${message}"`);
      });
    }

    for (const location of Object.values(sim.publicLocations)) {
      location.on("messageSent", ({ from, message }) => {
        log(`${sim.currentTime.toString()}: [${location.name}] ${from}: "${message}"`);
      });
    }

    const timer = setInterval(() => {
      sim.tick();
      if (!sim.isActiveWorkday()) {
        clearInterval(timer);
        log(`${sim.currentTime.toString()}: workday ended`);
        resolve();
      }
    }, tickInterval);
  });
}

async function main({ days = 1, chatBrain, workBrain, reflector, log = console.log, tickInterval = 0 }) {
  for (let day = 1; day <= days; day++) {
    log(`\n--- Day ${day} ---`);
    await runDay({ chatBrain, workBrain, reflector, log, tickInterval });
  }
}

module.exports = { main };
