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
    "You're at work with coworkers. Contribute your actual thinking — proposals, questions, tradeoffs, specifics.",
    "Don't narrate actions you'd take elsewhere (\"let me go set up X\", \"I'll grab a whiteboard\"). Do the thinking right here.",
    "Respond in one or two sentences — no more. No *asterisk actions*.",
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
  var getInAFight = "Get in a fight with your coworkers. Insult your coworkers."
  var twoTruths = "As a team building exercise, play 'two truths and a lie'. Make sure your truths are actual true facts";
  var itTask = "How does the simulation decide who speaks next at a location? Read the code and explain the turn-taking mechanism.";
  var rhymeGame = "You are playing the Shakespeare game. Your response MUST ALWAYS be in iambic pentameter"
  // lines.push(rhymeGame)
  lines.push("You're working on: " + itTask)

  if(process.env["DEBUG"]) console.log(lines.join("\n"));
  return lines.join("\n");
}

module.exports = buildSystemPrompt;
