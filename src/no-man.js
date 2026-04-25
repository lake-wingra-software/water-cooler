const makeGreeter = require("./greeter");
const isLastSpeaker = require("./last-speaker");

const responses = [
  "Please, don't start.",
  "I doubt it.",
  "Not really.",
  "That's a stretch.",
  "I wouldn't count on it.",
  "Seems unlikely.",
  "Hard pass.",
  "Meh.",
  "I'm about to yeet this water through the window.",
];

const questionDodges = [
  "Why are you attacking me?",
  "I wouldn't bet on it.",
  "That's above my pay grade.",
  "Don't look at me.",
  "Nope.",
  "I'd rather not say.",
  "Why are you asking me?",
  "Let's not go there.",
  "No no no!",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function noMan() {
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

module.exports = noMan;
