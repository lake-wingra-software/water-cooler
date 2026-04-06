const greeter = require('./greeter');
const isLastSpeaker = require('./last-speaker');

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

const questionDodges = [
  'haha yeah, man',
  'no, yeah...',
  'I mean...',
  'it\'s complicated',
  'depends who you ask',
  'define "done"',
  'that\'s a great question',
  'you know how it is',
  'I\'ve been meaning to talk about that',
  'honestly? hard to say',
  'more or less',
  'ask me again tomorrow'
];

function yeahMan() {
  let responseIndex = 0;
  let questionIndex = 0;

  return function({ name, others, chat }) {
    const greeting = greeter({ name, others, chat });
    if (greeting) return greeting;

    if (chat.length === 0) return null;
    if (isLastSpeaker(chat, name)) return null;
    const lastMessage = chat[chat.length - 1];

    const isQuestion = lastMessage.message.trimEnd().endsWith('?');
    let message;
    if (isQuestion) {
      message = questionDodges[questionIndex % questionDodges.length];
      questionIndex++;
    } else {
      message = responses[responseIndex % responses.length];
      responseIndex++;
    }
    return { to: others, message };
  };
}

module.exports = yeahMan;
