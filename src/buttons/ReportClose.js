const Discord = require("discord.js");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  customId: "ReportClose",
  async execute(interaction, client) {
    await interaction.deferUpdate();
    console.log(interaction);
    if (interaction.member.roles.cache.some((r) => r.id === "726137282104524871")) {
        // return;
        if (interaction.channel.isThread()) {
        //add resolved tag
        let newTags = interaction.channel.appliedTags;
        console.log(newTags);
        //if tag is already there
        if (newTags.includes("1055496168509034497")) {
        }
        else {
            newTags.push("1055496168509034497");
        }
        await interaction.channel.edit({appliedTags: newTags})
        await interaction.editReply({
            content: "This thread has been marked as resolved",
            components: [],
          });
        // await interaction.reply()
        await interaction.channel.setLocked(true);
        await interaction.channel.setArchived(true);
      } else {
        await interaction.editReply({
          content: "This is not a thread",
          components: [],
        });
      }
    } else {
      await interaction.reply({
        content: "You do not have permission to close this thead",
        components: [],
        ephemeral: true
      });
    }
  },
};
