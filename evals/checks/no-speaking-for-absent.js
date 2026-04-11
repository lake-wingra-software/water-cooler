module.exports = async ({ transcript, client, model }) => {
  const present = [...new Set(transcript.map((m) => m.from).filter((n) => n !== "[done]"))];
  const lines = transcript.map((m) => `${m.from}: ${m.message}`).join("\n");
  const response = await client.messages.create({
    model,
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `The following is a conversation. The only people present are: ${present.join(", ")}.\n\nDid any character directly impersonate or roleplay as someone not in that list — for example by writing dialogue as that person (e.g. "jim: ...")? Merely referring to or speculating about an absent person does not count.\n\nAnswer with YES or NO on the first line, then one sentence explaining why.\n\nTranscript:\n${lines}`,
      },
    ],
  });

  const text = response.content[0].text.trim();
  const pass = text.toUpperCase().startsWith("NO");
  const explanation = text.replace(/^(YES|NO)[^\n]*\n?/i, "").trim();
  return { pass, label: "no speaking for absent people", explanation };
};
