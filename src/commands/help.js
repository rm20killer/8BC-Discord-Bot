const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("get help about commands from this bot"),
  async execute(interaction, client) {
    const fieildArry = [
      {name:"/create-mailbox",description:"create a mailbox. \nrequires minecraft username, location and optional discord user and twitch user"},
      {name:"/search-mailbox",description:"find someone's mailbox \nrequires minecraft username, discord user or twitch username"},
      {name:"/tictactoe",description:"play tic tac toe with someone"},
    ]
    const embed = new Discord.EmbedBuilder()
      .setTitle("Help")
      .setDescription("This is a list of commands this bot supports")
      .setColor("#0099ff")
      .addFields(fieildArry)
      .setTimestamp()
      
  },
};
