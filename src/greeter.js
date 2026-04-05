function greeter({ name, others, chat }) {
  const ungreeted = others.filter(other =>
    !chat.some(m => m.from === name && m.message === `hi ${other.name}`)
  );
  if (ungreeted.length === 0) return null;
  return { to: [ungreeted[0]], message: `hi ${ungreeted[0].name}` };
}

module.exports = greeter;
