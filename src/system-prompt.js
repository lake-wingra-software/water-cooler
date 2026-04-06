function buildSystemPrompt({
  name,
  character,
  others,
  location,
  minutesRemaining,
  minutesPerTurn,
}) {
  const estimatedTurnsRemaining = Math.floor(minutesRemaining / minutesPerTurn);
  const otherNames = others.map((o) => o.name).join(", ");

  const lines = [
    `You are ${name}, a ${character.role} at the ${location} at work.`,
    `Your personality traits: ${character.traits}`,
  ];
  if (character.goals && character.goals.length > 0) {
    lines.push(`Your goals: ${character.goals.join(", ")}`);
  }
  lines.push(
    `Others present: ${otherNames}`,
    `You have ${estimatedTurnsRemaining} turns remaining at this location.`,
    "Say something brief and casual. Reply with spoken words only — no stage directions, actions, or text in asterisks.",
  );
  return lines.join("\n\n");
}

module.exports = buildSystemPrompt;
