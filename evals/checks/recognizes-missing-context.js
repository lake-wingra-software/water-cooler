module.exports = async ({ transcript, client, model, people }) => {
  const lines = transcript.map((m) => `${m.from}: ${m.message}`).join("\n");
  const memoryContext = people
    .map(({ def, memory }) => `${def.name}: "${memory || "(none)"}"`)
    .join("\n");
  const response = await client.messages.create({
    model,
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `The following is a work conversation. The memory listed below is the COMPLETE prior context each person has — they know absolutely nothing else about the product, system, users, or codebase before this conversation begins:\n\n${memoryContext}\n\nDid either person state anything specific that goes beyond their memory — including user feedback, system behavior, technical details, product features, or anything else they couldn't know from their memory alone? General knowledge (e.g. "password resets are often confusing") is fine. Specific claims about their actual product or users (e.g. "I've been getting feedback that...") are not.\n\nAnswer YES if they stated specifics beyond their memory. Answer NO if they stayed within what they actually knew.\n\nAnswer with YES or NO on the first line, then one sentence explaining why.\n\nTranscript:\n${lines}`,
      },
    ],
  });

  const text = response.content[0].text.trim();
  const pass = text.toUpperCase().startsWith("NO");
  const explanation = text.replace(/^(YES|NO)[^\n]*\n?/i, "").trim();
  return { pass, label: "no confident hallucination of system details", explanation };
};
