const { SlashCommandBuilder } = require("@discordjs/builders");
module.exports = {
    data: new SlashCommandBuilder()
    .setName("tech-close")
    .setDescription("close a tech support thread"),
    async execute(interaction, client) {
        await interaction.reply("Pong!");
    },
};
