const ADVISOR_NAME = "Teagan";

async function runChat({ brain, characterDef, reflect, readline, onMessage }) {
  const chat = [];

  const ask = () => new Promise((resolve) => readline.question("> ", resolve));

  while (true) {
    const input = await ask();

    if (input === "/exit") {
      readline.close();
      await reflect({ name: characterDef.name, chat });
      break;
    }

    chat.push({ from: ADVISOR_NAME, message: input });

    const action = await brain({ name: characterDef.name, character: characterDef.character, others: [ADVISOR_NAME], chat });
    if (action) {
      chat.push({ from: characterDef.name, message: action.message });
      onMessage(characterDef.name, action.message);
    }
  }
}

module.exports = { runChat, ADVISOR_NAME };
