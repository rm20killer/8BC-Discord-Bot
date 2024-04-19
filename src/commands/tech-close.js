const { SlashCommandBuilder } = require("@discordjs/builders");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("tech-close")
    .setDescription("close a tech support thread"),
  async execute(interaction, client) {
    //check if the user has the tech role
    if (interaction.member.roles.cache.has("726137282104524871")) {
      //check if the thread is in the correct category
      if (interaction.channel.parentId == "1054839141118001203") {
        let CloseButton = new ButtonBuilder()
          .setLabel("Mark as resolved")
          .setStyle(ButtonStyle.Danger)
          .setCustomId("ReportClose");
        let row = new ActionRowBuilder().addComponents([CloseButton]);
        await interaction.reply({
          content: "To close this click the button (tech only)",
          components: [row],
        });
      } else {
        await interaction.reply({
          content: "This command can only be used in the tech support category",
          ephemeral: true,
        });
      }
    } else {
      await interaction.reply({
        content: "You do not have permission to use this command",
        ephemeral: true,
      });
    }
  },
};
