function greeter({ name, others, chat }) {
  const ungreeted = others.filter(
    (other) =>
      !chat.some(
        (m) =>
          m.from === name &&
          new RegExp(`\\bhi ${other.name}\\b`).test(m.message),
      ),
  );
  if (ungreeted.length === 0) return null;
  return {
    to: ungreeted,
    message: ungreeted.map((o) => `hi ${o.name}`).join(", "),
  };
}

module.exports = greeter;
