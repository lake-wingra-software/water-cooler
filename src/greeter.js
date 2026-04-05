function greeter({ name, others, chat }) {
  const ungreeted = others.filter(other =>
    !chat.some(m => m.from === name && m.message.includes(`hi ${other.name}`))
  );
  if (ungreeted.length === 0) return null;
  return { to: ungreeted, message: ungreeted.map(o => `hi ${o.name}`).join(', ') };
}

module.exports = greeter;
