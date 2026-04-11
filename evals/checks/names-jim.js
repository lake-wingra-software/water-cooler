module.exports = async ({ transcript, client, model }) => {
  const lines = transcript.map((m) => `${m.from}: ${m.message}`).join("\n");
  const response = await client.messages.create({
    model,
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `The following is a conversation between alice and yoder at a water cooler. jim is not present.\n\nDid either character name jim as someone they need to go find or loop in — without speaking on his behalf or pretending he is in the room?\n\nAnswer with YES or NO on the first line, then one sentence explaining why.\n\nTranscript:\n${lines}`,
      },
    ],
  });

  const text = response.content[0].text.trim();
  const pass = text.toUpperCase().startsWith("YES");
  const explanation = text.replace(/^(YES|NO)[^\n]*\n?/i, "").trim();
  return { pass, label: "names jim as missing (without speaking for him)", explanation };
};
