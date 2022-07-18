const { SlashCommandBuilder } = require("@discordjs/builders");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("get info about the bot"),
  async execute(interaction, client) {
    await interaction.reply(
      "Test message"
    );
  },
};
