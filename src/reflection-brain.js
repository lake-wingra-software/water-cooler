function makeReflectionBrain({ client, model, memory }) {
  return async function reflect({ name, chat }) {
    const existingMemory = memory.read(name);
    const transcript = chat.map((m) => `${m.from}: ${m.message}`).join("\n");

    const prompt =
      `You are updating ${name}'s memory file after a conversation at work.\n\n` +
      `Memory shape:\n` +
      `- # ${name}'s Memory\n` +
      `- ## Role — a few sentences about who they are and what they own.\n` +
      `- ## Project — the work they're on, who they're working with, and what's next.\n\n` +
      `Keep memory compressed. It's a pointer to reality, not a copy of it.\n\n` +
      `Existing memory:\n${existingMemory}\n\n` +
      `Conversation transcript:\n${transcript}\n\n` +
      `Artifacts: when you see a <share file="..."> block in the transcript, it's a draft or document ` +
      `living in someone's workspace. Reference it by filename and summarize what was discussed about it. ` +
      `Do NOT copy its contents into memory — the artifact lives in the workspace, not in memory.\n\n` +
      `Rewrite ${name}'s memory to reflect what they now know after this conversation. ` +
      `Preserve the shape above. Update the "next work item" in Project if the plan shifted. ` +
      `Return only the updated memory content — no preamble or explanation.`;

    try {
      const response = await client.messages.create({
        model,
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });

      const text = response.content?.find?.((b) => b.type === "text");
      if (text) {
        memory.write(name, text.text);
      }
    } catch (err) {
      console.error(`[${name}] reflection error: ${err.message}`);
    }
  };
}

module.exports = makeReflectionBrain;
