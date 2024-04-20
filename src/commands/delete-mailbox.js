const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
//database stuff
const { Sequelize, DataTypes, Model } = require("sequelize");
const sequelize = require("../../data/sequelize");
const mailboxSchema = require("../../utils/models/mailboxes-schema")(sequelize, DataTypes);

const PostOfficeCoords = "0,0,0";
const mailboxVerifyJson = require("../../data/mailboxVerify.json");
const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require("../../utils/googlekey.json");

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
                deleteMail(interaction,searchResult.user, client);
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
    if (user == null) {
        error = 404;
    }

    let returnObject = {
        error: error,
        user: user.dataValues
    }
    return returnObject;
}

async function deleteMail(interaction,olddata, client)
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
            .setTitle("Mailbox Record Deleted")
            .setDescription(`${olddata.MinecraftUsername} mailbox record has been deleted by <@${interaction.user.id}>`)
            .setColor("#0099ff")
            .setTimestamp()
        interaction.reply({ embeds: [embed]});

        //send message to olddata.discordId#
        const embed2 = new Discord.EmbedBuilder()
            .setTitle("Mailbox Record Deleted")
            .setDescription(`Your mailbox record has been deleted.\nIf this was a mistake feel free to make a new mailbox`)
            .setColor("#0099ff")
            .setTimestamp()

        let user = await client.users.fetch(olddata.DiscordID);
        if (user) {
            await user.send({ embeds: [embed2]});
        }
        updateRickSpreadsheet(client, olddata.MinecraftUsername, olddata.location)
    }
}


async function updateRickSpreadsheet(client, mcName, location)
{
    console.log("updating mailbox spreadsheet")
    //get level
    let level = location.level;
    //get level make first letter uppercase and remove 01
    let floor = mailboxVerifyJson.levels[level].name;
    if (floor.includes("01")) {
        floor = floor.replace("01", "");
    }
    floor = floor.charAt(0).toUpperCase() + floor.slice(1);

    //get block
    let block = location.block;
    block = block.charAt(0).toUpperCase() + block.slice(1);

    //get letter
    let letter = location.letter;
    letter = letter.toUpperCase();
    //get number
    let number = location.number;
    let Position = letter + number;

    const doc = new GoogleSpreadsheet(client.config.RicksMailBox);
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    //console.log(doc.title+" has been opened");
    const info = await doc.getInfo();
    const sheet = doc.sheetsByIndex[0];
    n = 350
    const load = "A1:D" + n;
    //console.log(load)
    //console.log("sheet has opened")
    await sheet.loadCells(load);

    //find mcName
    let i = 1
    let found = false
    while (i < n) {
        let data = sheet.getCell(i, 0).value
        if (data) {
            if (data.toLowerCase() === mcName.toLowerCase()) {
                found = true;
                break;
            }
        }
        i++
    }
    if (found) {
        //remove user
        // sheet.deleteRow(i);
        sheet.getCell(i, 0).value = "";
        sheet.getCell(i, 1).value = "";
        sheet.getCell(i, 2).value = "";
        sheet.getCell(i, 3).value = "";
        
        console.log("user found in mailbox spreadsheet and deleted")
    }
    else {
//return if not found
        console.log("user not found in mailbox spreadsheet")
        return; 
    }

    await sheet.saveUpdatedCells();
    console.log("mailbox spreadsheet updated")
    return;
}