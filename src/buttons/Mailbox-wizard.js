const fs = require("fs");
const Discord = require("discord.js");
const { ActionRowBuilder, ModalBuilder, TextInputStyle } = require("discord.js");

module.exports = {
    customId: "MailboxWizardStart",
    async execute(interaction, client) {
        const modal = new ModalBuilder()
            .setCustomId('mailbox-wizard')
            .setTitle('Mailbox Wizard');
        const MinecraftUsername = new Discord.TextInputBuilder()
            .setLabel("Minecraft Username")
            .setCustomId('minecraft-username')
            .setPlaceholder("Enter Your full Minecraft Username")
            .setRequired(true)
            .setStyle(TextInputStyle.Short);

        const Level = new Discord.TextInputBuilder()
            .setCustomId('level (Use the options in the description)')
            .setPlaceholder('What level is your mailbox located?')
            .setLabel('Level')
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
        const Block = new Discord.TextInputBuilder()
            .setCustomId('block (Use the options in the description)')
            .setPlaceholder('What block is your mailbox located?')
            .setLabel('Block')
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
        const Letter = new Discord.TextInputBuilder()
            .setCustomId('letter')
            .setPlaceholder('What letter is your mailbox located?')
            .setLabel('Letter')
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setMaxLength(1)
        const Number = new Discord.TextInputBuilder()
            .setCustomId('number')
            .setPlaceholder('What number is your mailbox located?')
            .setLabel('Number')
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setMaxLength(2)


            
        const firstActionRow = new Discord.ActionRowBuilder()
            .addComponents(MinecraftUsername)
        const secondActionRow = new Discord.ActionRowBuilder()
            .addComponents(Level)
        const thirdActionRow = new Discord.ActionRowBuilder()
            .addComponents(Block)
        const fourthActionRow = new Discord.ActionRowBuilder()
            .addComponents(Letter)
        const fifthActionRow = new Discord.ActionRowBuilder()
            .addComponents(Number)
        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow, fifthActionRow)
        await interaction.showModal(modal)
    },
};