const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
//database stuff
const { Sequelize, DataTypes, Model } = require("sequelize");
const sequelize = require("../../data/sequelize");
const mailboxSchema = require("../../utils/models/mailboxes-schema")(sequelize, DataTypes);

const PostOfficeCoords = "0,0,0";
const mailboxVerifyJson = require("../../data/mailboxVerify.json");

const ErrorCodes = {
    1: "No error",
    404: "User not found",
    4000: "error during search",
    5000: "error during delete"
}
module.exports = {
    data: new SlashCommandBuilder()
        .setName("delete-mailbox")
        .setDescription("delete mailbox")
        .addStringOption(option =>
            option.setName('minecraft-username')
                .setDescription('Enter full minecraft username')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('twitch-name')
                .setDescription('Enter twitch username')
                .setRequired(false))
        .addUserOption(option =>
            option.setName('discord-user')
                .setDescription('Enter discord user')
                .setRequired(false)),
    async execute(interaction, client) {
        //console.log(interaction)
        if(interaction.options.data[0] === undefined) {
            await interaction.reply({text:"Please enter one of the following: minecraft username, twitch username, or discord user",ephemeral: true});
            return;
        }
        if(interaction.options.data[1]) {
            await interaction.reply({text:"only enter one of the fields",ephemeral: true});
            return;
        }
        let searchResult = await search(interaction);
        if (searchResult.error === 1) {
            let isStaff = false;
            for (let i = 0; i < client.config.staffroles.length; i++) {
                if(interaction.member.roles.cache.some(r => r.id === client.config.staffroles[i])){
                    isStaff = true;
                }
            }
            if(isStaff || interaction.user.id == searchResult.user.DiscordID){
                deleteMail(interaction,searchResult.user);
            }
            else{
                interaction.reply({ content: "You can't delete that users mailbox", ephemeral: true });
            }
        }
        else {
            interaction.reply({ content: ErrorCodes[searchResult.error], ephemeral: true });
        }
        //await interaction.reply("Pong!");
    },
};


async function search(interaction) {
    const name = interaction.options.data[0];

    let error = 1;
    let user
    let searcher
    if(name.name === 'minecraft-username') {
        searcher = {MinecraftUsername: name.value.toLowerCase()};
    }
    else if(name.name === 'twitch-name') {
        searcher = {twitchName: name.value.toLowerCase()};
    }
    else if(name.name === 'discord-user') {
        searcher = {DiscordID: name.value};
    }
    try {
        user = await mailboxSchema.findOne({ where: searcher });
    }
    catch (err) {
        console.log(err);
        error = 4000;
    }
    if (user === null) {
        error = 404;
    }

    let returnObject = {
        error: error,
        user: user.dataValues
    }
    return returnObject;
}

async function deleteMail(interaction,olddata)
{
    const name = interaction.options.data[0];

    let error = 1;
    let user
    let searcher
    if(name.name === 'minecraft-username') {
        searcher = {MinecraftUsername: name.value.toLowerCase()};
    }
    else if(name.name === 'twitch-name') {
        searcher = {twitchName: name.value.toLowerCase()};
    }
    else if(name.name === 'discord-user') {
        searcher = {DiscordID: name.value};
    }
    try {
        user = await mailboxSchema.destroy({ where: searcher });
    }
    catch (err) {
        console.log(err);
        error = 5000;
    }
    if(user === null) {
        error = 404;
    }
    if(error === 1) {
        const embed = new Discord.EmbedBuilder()
            .setTitle("Mailbox Deleted")
            .setDescription(`${olddata.MinecraftUsername}mailbox has been deleted by <@${interaction.user.id}>`)
            .setColor("#0099ff")
            .setTimestamp()
        interaction.reply({ embeds: [embed]});
    }
}