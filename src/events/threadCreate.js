const Discord = require("discord.js");
const serverPing = require("../func/serverPing");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: "threadCreate",
  async execute(client, thread) {
    //console.log(thread);
    let CloseButton = new ButtonBuilder()
      .setLabel("Mark as resolved")
      .setStyle(ButtonStyle.Danger)
      .setCustomId("ReportClose");
    if (thread.parentId == "1054839141118001203") {
      let row = new ActionRowBuilder().addComponents([CloseButton]);
      await thread.send("<@&726137282104524871>");
      await thread.send({ content: "To close this click the button (tech only)", components: [row] });
      //check if thread.appliedTags has 1054839593947643984
      if (thread.appliedTags.includes("1054839593947643984")) {
        await serverPing(client, thread);
      } else {
        return;
      }
    }
  },
};
