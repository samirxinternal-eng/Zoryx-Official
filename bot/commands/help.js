module.exports = async function helpCommand(ctx) {
  await ctx.reply(
    `🛠 Aura Coin — Admin Panel\n\n` +
      `/addtask Title | https://url.com | 100 | channel\n` +
      `  → add a task. Type is channel / link / bot (optional, defaults to link)\n\n` +
      `/removetask <taskId>\n` +
      `  → delete a task\n\n` +
      `/alltasks\n` +
      `  → list every task with its ID\n\n` +
      `/broadcast Your message\n` +
      `  → send a message to every user\n\n` +
      `/stats\n` +
      `  → total users + total coins distributed\n\n` +
      `This menu only ever replies to you — everyone else's /help is ignored.`
  );
};
