const fs = require("fs");
const Person = require("./person");
const Location = require("./location");
const { workspacePathFor } = require("./workspace");

function runTurn(location) {
  return new Promise((resolve) => {
    let settled = false;
    const settle = (value) => {
      if (settled) return;
      settled = true;
      location.removeListener("messageSent", onMessage);
      clearTimeout(timer);
      resolve(value);
    };
    const onMessage = () => settle(true);
    location.once("messageSent", onMessage);
    const timer = setTimeout(() => settle(false), 60000);
    location.tick();
  });
}

async function runMeeting({ characterDef, otherDef, brain, location = "conference room", turns = 4, log = console.log }) {
  fs.mkdirSync(workspacePathFor(characterDef.name), { recursive: true });
  fs.mkdirSync(workspacePathFor(otherDef.name), { recursive: true });

  const person = new Person(characterDef, brain, { allowedTools: characterDef.allowedTools });
  const otherPerson = new Person(otherDef, brain, { allowedTools: otherDef.allowedTools });

  log(`Meeting at: ${location}`);
  log(`Attendees:  ${characterDef.name}, ${otherDef.name}`);
  log(`Turns:      ${turns}`);
  log(``);

  const loc = new Location(location, (occupants) => [...occupants]);
  loc.arrive(person);
  loc.arrive(otherPerson);

  loc.on("messageSent", ({ from, message }) => {
    log(`[${from}] ${message}`);
    log(``);
  });

  for (let i = 0; i < turns; i++) {
    const turned = await runTurn(loc);
    if (!turned) {
      log(`(conversation ended early)`);
      break;
    }
  }
}

module.exports = { runMeeting };
