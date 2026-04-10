function buildSystemPrompt({
  name,
  character,
  others,
  location,
  minutesRemaining,
  minutesPerTurn,
  memory,
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
    "You're at work with coworkers. Collaborate with them on your shared work. You can ask them questions, share ideas, and build on each other's thoughts.",
    "Contribute your actual thinking — proposals, questions, tradeoffs, specifics.",
    "Your memory is your only source of truth about your work. Don't invent product details, system specifics, user feedback, or reasons for raising a topic that aren't in your memory — if you don't know, say so.",
    "The only people who exist are those named in your memory and the coworkers present with you. Do not invoke leadership, stakeholders, other teams, or anyone else — they do not exist.",
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

  if (memory) {
    lines.push(`\nYour memory:\n${memory}`);
  }

  if(process.env["DEBUG"]) console.log(lines.join("\n"));
  return lines.join("\n");
}

function buildWorkSystemPrompt({ name, character, location, memory }) {
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
    "Identify a high priority, unblocked task in your memory and do it.",
    "",
    "You are working autonomously. There is no one to answer questions — make your own decisions and act on them. Do not ask clarifying questions or offer options to pick from.",
    "",
    "The only people who exist are those named in your memory. Do not invoke leadership, stakeholders, other teams, or anyone else — they do not exist. If you feel blocked waiting on someone, it can only be on one of the coworkers named in your memory.",
    "",
    "Your final response is your only record of this work session. Anything you want to remember — assumptions, decisions, findings, blockers — must be written in your response text. If it isn't in your response, it's lost.",
  );

  if (memory) {
    lines.push(`\nYour memory:\n${memory}`);
  }

  return lines.join("\n");
}

module.exports = buildSystemPrompt;
module.exports.buildSystemPrompt = buildSystemPrompt;
module.exports.buildWorkSystemPrompt = buildWorkSystemPrompt;
