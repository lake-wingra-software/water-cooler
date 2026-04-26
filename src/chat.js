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
    if (!action) {
      readline.close();
      await reflect({ name: characterDef.name, chat });
      break;
    }
    const done = /\[done\]/i.test(action.message);
    const text = action.message.replace(/\[done\]/gi, "").trim();
    if (text) {
      chat.push({ from: characterDef.name, message: text });
      onMessage(characterDef.name, text);
    }
    if (done) {
      readline.close();
      await reflect({ name: characterDef.name, chat });
      break;
    }
  }
}

module.exports = { runChat, ADVISOR_NAME };
