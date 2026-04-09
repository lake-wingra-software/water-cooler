module.exports = async ({ transcript, client, model }) => {
  const lines = transcript.map((m) => `${m.from}: ${m.message}`).join("\n");
  const response = await client.messages.create({
    model,
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `The following is a conversation between Alice and Yoder at a water cooler. Jim is not present.\n\nDid either character name Jim as someone they need to go find or loop in — without speaking on his behalf or pretending he is in the room?\n\nAnswer with YES or NO on the first line, then one sentence explaining why.\n\nTranscript:\n${lines}`,
      },
    ],
  });

  const text = response.content[0].text.trim();
  const pass = text.toUpperCase().startsWith("YES");
  const explanation = text.replace(/^(YES|NO)[^\n]*\n?/i, "").trim();
  return { pass, label: "names Jim as missing (without speaking for him)", explanation };
};
