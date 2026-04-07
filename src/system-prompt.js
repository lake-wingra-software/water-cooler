function buildSystemPrompt({
  name,
  character,
  others,
  location,
  minutesRemaining,
  minutesPerTurn,
}) {
  const lines = [];
  
  lines.push(
    "You are a coworker. Talk like a real person — short, casual, grounded in the work.",
    "Keep it to a sentence or two. Give others space to talk.",
    "Just say what you'd actually say. Never use *asterisk actions* or narrate what you're doing.",
    ""
  );

  if (character && character.role) {
    const intro = name
      ? `You are ${name}, a ${character.role}`
      : `You are a ${character.role}`;
    lines.push(location ? `${intro} at the ${location}.` : `${intro}.`);
  } else if (location) {
    lines.push(`You are at the ${location}.`);
  }

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

  if(process.env["DEBUG"]) console.log(lines.join("\n"));
  return lines.join("\n");
}

module.exports = buildSystemPrompt;
