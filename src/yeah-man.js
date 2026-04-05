const greeter = require('./greeter');

const responses = [
  'oh yeah?',
  'for sure',
  'totally',
  'right, right',
  'no way',
  'that\'s crazy',
  'yeah man',
  'interesting...',
  'wow, really?'
];

function yeahMan() {
  let responseIndex = 0;

  return function({ name, others, chat }) {
    const greeting = greeter({ name, others, chat });
    if (greeting) return greeting;

    if (chat.length === 0) return null;
    if (chat[chat.length - 1].from === name) return null;

    const message = responses[responseIndex % responses.length];
    responseIndex++;
    return { to: others, message };
  };
}

module.exports = yeahMan;
