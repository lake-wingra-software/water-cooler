function buildSystemPrompt({
  name,
  character,
  others,
  location,
  minutesRemaining,
  minutesPerTurn,
}) {
  const lines = [];

  if (character && character.role) {
    const intro = name
      ? `You are ${name}, a ${character.role}`
      : `You are a ${character.role}`;
    lines.push(location ? `${intro} at the ${location}.` : `${intro}.`);
  } else if (location) {
    lines.push(`You are at the ${location}.`);
  }

  lines.push(
    "You are having a conversation with coworkers. Talk like a real person — short, casual, grounded in the work.",
    "Keep it to a sentence or two. Give others space to talk.",
    "Just say what you'd actually say. Never use *asterisk actions* or narrate what you're doing.",
    "If the conversation has reached a natural end, say [done].",
    ""
  );


  if (character && character.traits) {
    lines.push(`How you approach work: ${character.traits}`);
  }
  if (character && character.goals && character.goals.length > 0) {
    lines.push(`What you're working on: ${character.goals.join(", ")}`);
  }
  
  if (minutesRemaining != null && minutesPerTurn) {
    const estimatedTurnsRemaining = Math.floor(minutesRemaining / minutesPerTurn);
    lines.push(`You have ${estimatedTurnsRemaining} turns remaining at this location.`);
  }

  var strawberry = "How many letter 'r' in the word 'strawberries'. Your decision MUST be unanimous among all participants";
  var quietGame = "Play the quiet game. End the conversation as quickly as possible."
  var getInAFight = "Get in a fight with your coworkers. Make personal attacks."
  var twoTruths = "As a team building exercise, play 'two truths and a lie'. Make sure your truths are actual true facts";
  var itTask = "Discuss how to interact with claude code via a node application";
  lines.push("The topic of this conversation is: " + itTask)

  if(process.env["DEBUG"]) console.log(lines.join("\n"));
  return lines.join("\n");
}

module.exports = buildSystemPrompt;
