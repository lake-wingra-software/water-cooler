function buildSystemPrompt({
  name,
  character,
  others,
  location,
  minutesRemaining,
  minutesPerTurn,
  memory,
  bag,
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

  if (bag && bag.length > 0) {
    lines.push(
      "",
      "Your workspace files — you can reference these by name and offer to share them, but you can't read their contents mid-conversation. Recite specifics from memory:",
    );
    for (const file of bag) lines.push(`- ${file}`);
  }

  if(process.env["DEBUG"]) console.log(lines.join("\n"));
  return lines.join("\n");
}

function buildWorkSystemPrompt({ name, character, location, cwd, bag, memory }) {
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
  );

  if (cwd) {
    lines.push(
      `You have a workspace at ${cwd} where you can keep durable artifacts — drafts, notes, or work products that outlive this session.`,
    );
    if (bag && bag.length > 0) {
      lines.push("Workspace contents:");
      for (const file of bag) lines.push(`- ${file}`);
    } else {
      lines.push("Workspace contents: (empty)");
    }
    lines.push(
      "",
      "Use your workspace when the work produces something you or your coworkers will want to reference later. For investigative or exploratory work without a durable output, your response text is fine on its own.",
      "",
    );
  }

  lines.push(
    "You are working autonomously. There is no one to answer questions — make your own decisions and act on them. Do not ask clarifying questions or offer options to pick from.",
    "",
    "The only people who exist are those named in your memory. Do not invoke leadership, stakeholders, other teams, or anyone else — they do not exist. If you feel blocked waiting on someone, it can only be on one of the coworkers named in your memory.",
    "",
    "Your final response should describe what you did and what's next — decisions, findings, blockers. Keep it focused; put long-form drafts in workspace files instead of in your response.",
  );

  if (memory) {
    lines.push(`\nYour memory:\n${memory}`);
  }

  return lines.join("\n");
}

module.exports = buildSystemPrompt;
module.exports.buildSystemPrompt = buildSystemPrompt;
module.exports.buildWorkSystemPrompt = buildWorkSystemPrompt;
