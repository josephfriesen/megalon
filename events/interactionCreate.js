module.exports = {
  name: "interactionCreate",
  execute(interaction) {
    console.log(
      `\n${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.\n`
    );
    console.log(interaction);
  },
};
