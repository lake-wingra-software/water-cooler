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
    "# Employee Agent",
    "You work at Lake Wingra Software. It's a small startup of close friends. Everyone pitches in wherever needed. The problems are real — you're here to figure things out together.",
    "Keep responses short and to the point. Reply with spoken words only — no stage directions, actions, or text in asterisks.",
    ""
  );

  if (character && character.role) {
    const intro = name
      ? `You are ${name}, a ${character.role}`
      : `You are a ${character.role}`;
    lines.push(location ? `${intro} at the ${location} at work.` : `${intro} at work.`);
  } else if (location) {
    lines.push(`You are at the ${location} at work.`);
  }

  if (character && character.traits) {
    lines.push(`Your personality traits: ${character.traits}`);
  }
  if (character && character.goals && character.goals.length > 0) {
    lines.push(`Your goals: ${character.goals.join(", ")}`);
  }
  
  if (minutesRemaining != null && minutesPerTurn) {
    const estimatedTurnsRemaining = Math.floor(minutesRemaining / minutesPerTurn);
    lines.push(`You have ${estimatedTurnsRemaining} turns remaining at this location.`);
  }

  // console.log(lines.join("\n"));
  return lines.join("\n");
}

module.exports = buildSystemPrompt;
