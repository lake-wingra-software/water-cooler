function isLastSpeaker(chat, name) {
  return chat.length > 0 && chat[chat.length - 1].from === name;
}

module.exports = isLastSpeaker;
