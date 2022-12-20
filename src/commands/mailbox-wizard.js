const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputStyle } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("mailbox-wizard")
        .setDescription("A wizard to help you create a mailbox"),

    async execute(interaction, client) {
        const embed = new Discord.EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Mailbox Wizard')
            .setDescription('This is the Mailbox Wizard guide, At the moment the wizard is very picky and will only accept the following options (case sensitive)')
            .addFields(
                { name: 'Level', value: 'When entering level the options are \n `first floor`, `ground`, `basement 01`'},
                { name: 'Block', value: 'When entering block the options are \n `Clay, Iron`, `Honey`, `Red sand`, `Brown mushroom`, `Red mushroom`, `Purpur`, `Crimson`, `Amethyst`, `lapis`, `Ice`, `Prismarine`, `Melon`, `Moss`, `Coal`, `Basalt`, `staffArea`'},
            )
        let startButton = new ButtonBuilder()
            .setCustomId('MailboxWizardStart-start')
            .setLabel('Start Wizard')
            .setStyle(ButtonStyle.Success)
        
        let row = new ActionRowBuilder().addComponents([startButton])
        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true })
        return;
        //await interaction.reply("Pong!");
    },
};