const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("greeting")
    .setDescription("Say hello to the bot"),
  async execute(interaction) {
    await interaction.reply("What up, bithc?!");
  },
};
