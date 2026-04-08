const makeGreeter = require("./greeter");
const isLastSpeaker = require("./last-speaker");

const responses = [
  "Oh yeah?",
  "For sure.",
  "Totally.",
  "Right, right.",
  "No way.",
  "That's crazy.",
  "Yeah man.",
  "Interesting...",
  "Wow, really?",
];

const questionDodges = [
  "Haha yeah, man.",
  "No, yeah...",
  "I mean...",
  "It's complicated.",
  "Depends who you ask.",
  'Define "done".',
  "That's a great question.",
  "You know how it is.",
  "I've been meaning to talk to you about that.",
  "Honestly? Hard to say.",
  "More or less.",
  "Ask me again tomorrow.",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function yeahMan() {
  const greeter = makeGreeter();

  return function ({ name, others, chat }) {
    const greeting = greeter({ name, others, chat });
    if (greeting) return greeting;

    if (chat.length === 0) return null;
    if (isLastSpeaker(chat, name)) return null;
    const lastMessage = chat[chat.length - 1];

    const isQuestion = lastMessage.message.trimEnd().endsWith("?");
    const message = isQuestion ? pick(questionDodges) : pick(responses);
    return { to: others, message };
  };
}

module.exports = yeahMan;
