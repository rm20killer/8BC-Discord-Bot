const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
//database stuff
const { Sequelize, DataTypes, Model } = require("sequelize");
const sequelize = require("../../data/sequelize");
const mailboxSchema = require("../../utils/models/mailboxes-schema")(sequelize, DataTypes);

const PostOfficeCoords = "662, 110, 1724";
const mailboxVerifyJson = require("../../data/mailboxVerify.json");

const ErrorCodes = {
    1: "No error",
    404: "User not found",
    4000: "error during search"
}
module.exports = {
    data: new SlashCommandBuilder()
        .setName("search-mailbox")
        .setDescription("find someone's mailbox")
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
        if (interaction.options.data[0] === undefined) {
            await interaction.reply({ text: "Please enter one of the following: minecraft username, twitch username, or discord user", ephemeral: true });
            return;
        }
        if (interaction.options.data[1]) {
            await interaction.reply({ text: "only enter one of the fields", ephemeral: true });
            return;
        }
        let searchResult = await search(interaction);
        if (searchResult.error === 1) {
            reply(interaction, searchResult.user);
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
    if (name.name === 'minecraft-username') {
        searcher = { MinecraftUsername: name.value.toLowerCase() };
    }
    else if (name.name === 'twitch-name') {
        searcher = { twitchName: name.value.toLowerCase() };
    }
    else if (name.name === 'discord-user') {
        searcher = { DiscordID: name.value };
    }
    try {
        user = await mailboxSchema.findOne({ where: searcher });
    }
    catch (err) {
        console.log(err);
        error = 4000;
        user = {
            "dataValues":Error
        }
    }
    if (user === null) {
        error = 404;
        user = {
            "dataValues":Error
        }
    }

    let returnObject = {
        error: error,
        user: user.dataValues
    }
    return returnObject;
}

async function reply(interaction, data) {
    //console.log(data)
    const location = data.location
    const { block, level, letter, number, coordinates } = location;
    //from mailboxVerifyJson.levels get the level name
    let levelName = mailboxVerifyJson.levels[level].name;
    let Location = letter.toUpperCase() + number.toString();
    let TextCoord = coordinates.x + " " + coordinates.y + " " + coordinates.z + " (X Y Z)"
    let fieldsarray = [
        { name: "Level", value: levelName, inline: true },
        { name: "Block", value: block, inline: true },
        { name: "Location", value: Location, inline: true },
        { name: "coordinates", value: TextCoord, inline: true }
    ];
    //console.log(fieldsarray)
    //find the discord user with discor id
    let discordUser = await interaction.user.client.users.fetch(data.DiscordID);
    //get block from blockVerifyJson
    let imageLink = ""
    for (let i = 0; i < mailboxVerifyJson.blocks.length; i++) {
        if (mailboxVerifyJson.blocks[i].name === block) {
            imageLink = mailboxVerifyJson.blocks[i].imageLink;
            break;
        }
    }
    //create the embed
    const embed = new Discord.EmbedBuilder()
        .setTitle(`Mailbox for ${data.MinecraftUsername}`)
        .setDescription(`post office is located at ${PostOfficeCoords} near "/warp central"`)
        .addFields(fieldsarray)
        .setColor("#0099ff")
        .setThumbnail(`https://mc-heads.net/avatar/${data.mcUUID}.png`)
        .setFooter({ text: `id:${data.id} | <@${data.DiscordID}> | ${data.twitchName}`, iconURL: discordUser.avatarURL() });
    //.setFooter({ text: `id:${data.id} | <@${data.DiscordID}> | ${data.twitchName}`});

    // if (imageLink) {
    //     embed.setImage(imageLink);
    // }

    try {
        await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
}