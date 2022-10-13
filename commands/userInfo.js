const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Get user info."),
  async execute(interaction) {
    await interaction.reply(
      `Hey there ${interaction.member.nickname}.\nTag: ${interaction.user.tag}\nID: ${interaction.user.id}`
    );
  },
};
