const fs = require("fs");
const os = require("os");
const path = require("path");
const Person = require("../src/person");
const Memory = require("../src/memory");
const makeLlmBrain = require("../src/llm-brain");

function isDone(person) {
  const last = person.chat[person.chat.length - 1];
  return last && last.from === person.name && last.message === "[done]";
}

function passToken(person, others, location) {
  return new Promise((resolve) => {
    person.receiveToken(others, location, resolve);
  });
}

function broadcast(people, from, message) {
  people.forEach((p) => p.receiveMessage({ from, message }));
}

async function runLoop(people, location, maxTurns) {
  for (let turn = 0; turn < maxTurns; turn++) {
    const speaker = people[turn % people.length];
    const others = people.filter((p) => p !== speaker);

    const action = await passToken(speaker, others, location);
    if (action) {
      broadcast(people, speaker.name, action.message);
    }

    if (people.every(isDone)) break;
  }
}

module.exports = async function runConversation(scenario, { client, model }) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "eval-memory-"));
  try {
    const memory = new Memory(tmpDir);
    scenario.people.forEach(({ def, memory: seed }) => {
      if (seed) memory.write(def.name, seed);
    });

    const brain = makeLlmBrain({ client, model, memory });
    const people = scenario.people.map(({ def }) => {
      const person = new Person(def, brain);
      const startTime = def.schedule[0]?.startTime;
      if (startTime) person.tick(startTime);
      return person;
    });

    console.log(`\n=== ${scenario.label} ===\n`);
    console.log("Running conversation...\n");
    await runLoop(people, scenario.location, scenario.maxTurns);

    const transcript = people[0].chat;
    console.log("TRANSCRIPT");
    transcript.forEach((m) => console.log(`  ${m.from}: ${m.message}`));

    console.log("\nCHECKS");
    for (const check of scenario.checks) {
      const { pass, label, explanation } = await check({ transcript, client, model, people: scenario.people });
      console.log(`  ${pass ? "✓" : "✗"} ${label}`);
      if (!pass) console.log(`    ${explanation}`);
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true });
  }
};
