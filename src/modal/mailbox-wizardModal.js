const Discord = require("discord.js");
const { ActionRowBuilder, ButtonBuilder } = require("discord.js");
const fs = require("fs");
const axios = require('axios');


const mailboxVerifyJson = require("../../data/mailboxVerify.json");
//database stuff
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../data/sequelize");
const mailboxSchema = require("../../utils/models/mailboxes-schema")(sequelize, DataTypes);

//spreadsheet stuff
const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require("../../utils/googlekey.json");
//error codes:
const ErrorCodes = {
    1: "passed",
    //verify coordinates error codes
    1001: "Error with Level or Block",
    1002: "Number is not acceptable",
    1003: "Letter is not acceptable",
    1004: "Both number and letter are not acceptable",
    //mojang api error codes
    2000: "Error with mojang api",
    2001: "No user found with that name",
    //saving data error codes
    3000: "Error saving data",
    3001: "You cannot change data for other users",
    //spreadsheet error codes
    6000: "Error with spreadsheet",
    6001: "No user found with that name in the server application, make sure name is entered correctly or send in a updated forum",
}

module.exports = {
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });
        console.log(interaction);
        console.log(interaction.components[0].components[0].value)
        let minecraftUsername = interaction.components[0].components[0];
        let UUID = await getMinecraftUUID(minecraftUsername);
        if (UUID.errorcode == 1) {
            mcUUID = UUID.uuid;
        }
        else {
            interaction.editReply({ content: ErrorCodes[UUID.errorcode], ephemeral: true });
            return;
        }
        let level = interaction.components[1].components[0].value;
        let block = interaction.components[2].components[0].value;
        let number = interaction.components[3].components[0].value;
        let letter = interaction.components[4].components[0].value.toLowerCase();
        let errorcode = await VerifyInput(level, letter, number);
        if (errorcode == 1) {
            let blockErrorcode = await CheckBlock(block);
            if (blockErrorcode == 1) {
                //continue
                CreateMailbox(interaction, client);
            }
            else {
                //reply with error code
                interaction.editReply({ content: ErrorCodes[blockErrorcode], ephemeral: true });
                return;
            }
        }
        else {
            //reply with error code
            interaction.editReply({ content: ErrorCodes[errorcode], ephemeral: true });
            return;
        }


    }
}
async function CheckBlock(block) {
    //check if block is in the list of blocks
    //if it is, return 1
    //if it is not, return an error number
    //Error numbers:
    //1001

    if (block == "Clay" || block == "Iron" || block == "Honey" || block == "Red sand" || block == "Brown mushroom" || block == "Red mushroom" || block == "Purpur" || block == "Crimson" || block == "Amethyst" || block == "lapis" || block == "Ice" || block == "Prismarine" || block == "Melon" || block == "Moss" || block == "Coal" || block == "Basalt" || block == "staffArea") {
        return 1;
    }
    else {
        return 1001;
    }
}
// verify data is part of the mailboxVerify.json file
// if it is, return 1
// if it is not, return an error number
// Error numbers:
// 1002: number is not acceptable
// 1003: letter is not acceptable
// 1004: both number and letter are not acceptable
async function VerifyInput(level, letter, number) {
    if (level == "first floor" || level == "ground" || level == "basement 01") {
        if (level == "first floor") {
            levelValue = 2;
        }
        else if (level == "ground") {
            levelValue = 1;
        }
        else if (level == "basement 01") {
            levelValue = 0;
        }
    }
    else {
        return 1001;
    }
    //console.log(level)
    let LevelI = parseInt(levelValue)
    //console.log(LevelI)
    console.log(LevelI, letter, number)
    //covert json
    //let mailboxVerify = JSON.parse(JSON.stringify(mailboxVerifyJson));
    //console.log(mailboxVerifyJson.coords[LevelI])
    const AcceptedableNumber = mailboxVerifyJson.coords[LevelI].acceptedValues.numbers;
    //console.log(AcceptedableNumber)
    let errorcode = 1;
    //check if number is in range return true
    //console.log(number)

    return errorcode;
    //!
    let numberInRange = false
    if (number >= AcceptedableNumber[0] && number <= AcceptedableNumber[AcceptedableNumber.length - 1]) {
        numberInRange = true;
    }
    else {
        errorcode = 1002;
        //number is not in range
    }
    //check if letter is in range
    const AcceptedableLetter = mailboxVerifyJson.coords[LevelI].acceptedValues.letters;
    //console.log(AcceptedableLetter)
    //console.log(letter)
    //if acceptedableLetter has letter, return true
    //loop through acceptedableLetter
    let letterInRange = false
    for (let i = 0; i < AcceptedableLetter.length; i++) {
        if (letter == AcceptedableLetter[i]) {
            letterInRange = true;
            break;
        }
    }
    if (!letterInRange) {
        if (numberInRange) {
            errorcode = 1003;
            //letter is not in range
        }
        else {
            errorcode = 1004;
            //letter and number are not in range
        }
    }


    return errorcode;
}

//error codes:
//1: passed
//2001: no user found with that name
//2000: error with mojang api
async function getMinecraftUUID(name) {
    nameArray = [name.value]
    //axios post request to mojang api with nameArray as body
    const response = await axios.post('https://api.mojang.com/profiles/minecraft', nameArray);
    //console.log(response)

    let uuid = ""
    let errorcode = 2000;
    //if response is 200, return uuid
    if (response.status == 200) {
        //check if data is empty
        if (response.data.length == 0) {
            errorcode = 2001;
            //no user found with that name
        }
        else {
            errorcode = 1;
            uuid = response.data[0].id;
        }
    }
    //if response is 204, return errorcode 2000
    else if (response.status == 204) {
        errorcode = 2000;
    }
    //if response is 404, return errorcode 2001
    else if (response.status == 404) {
        errorcode = 2001;
    }


    let returnObject = {
        errorcode: errorcode,
        uuid: uuid
    }

    return returnObject;
}

async function CreateMailbox(interaction, client) {
    //get all options
    let minecraftUsername = interaction.components[0].components[0];

    let UUID = await getMinecraftUUID(minecraftUsername);
    //console.log(UUID)
    //return;
    let mcUUID
    if (UUID.errorcode == 1) {
        mcUUID = UUID.uuid;
    }
    else {
        interaction.editReply({ content: ErrorCodes[UUID.errorcode], ephemeral: true });
        return;
    }

    let levelValue = interaction.components[1].components[0].value;
    if (levelValue == "first floor" || levelValue == "ground" || levelValue == "basement 01") {
        if (levelValue == "first floor") {
            level = 2;
        }
        else if (levelValue == "ground") {
            level = 1;
        }
        else if (levelValue == "basement 01") {
            level = 0;
        }
    }
    let block = interaction.components[2].components[0];
    let number = interaction.components[3].components[0];
    let letter = interaction.components[4].components[0];
    //check if interaction.options.data[5].name is discord
    //if it is, get discord name
    //if it is not, get twitch name
    let discordName = "";
    let twitch = "";

    let discordUser
    if (discordName) {
        discordUser = discordName.user
    }
    let location = {
        level: level,
        block: block.value,
        letter: letter.value.toUpperCase(),
        number: number.value
    }
    //console.log(discordUser)

    let twitchName
    let discordId

    //grab this data from spreadsheet
    let data
    try {
        data = await getSpreadsheetData(client, minecraftUsername.value)
    }
    catch (err) {
        console.log(err)
        interaction.editReply({ content: ErrorCodes[6000], ephemeral: true });
        return;
    }
    if (data.errorcode == 1) {
        //console.log("found data")
        twitchName = data.twitchName;
        let discordName = data.discordName;
        //find user with discord name
        //check if data.discordName has a # and 4 characters after it
        if (discordName.includes("#")) {
            let name = discordName.split(/#/)[0];
            let discriminator = discordName.split(/#/)[1];
            let tags = discriminator.split("");
            let tag = tags[0] + tags[1] + tags[2] + tags[3];
            let discordTag = name + "#" + tag;
            //
            //console.log(interaction.guild.members.cache.find(user => user.user.tag === discordTag))
            const user = client.users.cache.find(user => user.tag === discordTag);
            if (user===undefined){
                await interaction.editReply({ content: "Could not find the user on discord. Make sure application fourm is up to date. Discord Name in tracker: " + data.discordName, ephemeral: true });
                return;
            }
            else {
                discordId = user.id;
                console.log(discordId)
            }
        }
        else {
            await interaction.editReply({ content: "Discord name is not in the correct format on the application fourm. Should be in format (name)#tag example `TheHotdish#7676`", ephemeral: true });
            return;
        }
    }
    else {
        await interaction.editReply({ content: ErrorCodes[data.errorcode], ephemeral: true });
        return;
    }


    let coords = letter.value.toUpperCase() + number.value;
    let levelName = mailboxVerifyJson.levels[level].name;
    let fieildArry = [
        { name: "Level", value: levelName, inline: true },
        { name: "Block", value: block.value, inline: true },
        { name: "Coordinates", value: coords, inline: true },

    ];

    if (discordId) {
        fieildArry.push({ name: "Discord", value: `<@${discordId}>`, inline: true })
    }
    if (twitchName) {
        fieildArry.push({ name: "Twitch", value: twitchName, inline: true })
    }
    //savedata() if return is 1
    let savedData = await saveData(minecraftUsername, location, discordId, twitchName, mcUUID, interaction, client);

    if (savedData == 1) {
        const embed = new Discord.EmbedBuilder()
            .setTitle("Mailbox Created for " + minecraftUsername.value)
            .setColor("#0099ff")
            .setDescription("A mailbox record has been created for you!")
            .addFields(fieildArry)
            .setThumbnail(`https://mc-heads.net/avatar/${mcUUID}.png`)
        await interaction.editReply({ embeds: [embed], ephemeral: true });
        let user = await client.users.fetch(DiscordID);
        if (user) {
            await user.send({ embeds: [embed]});
        }
    }
    else {
        interaction.editReply({ content: ErrorCodes[savedData], ephemeral: true });
    }

}

async function saveData(minecraftUsername, location, discordId, twitchName, mcUUID, interaction, client) {
    console.log("saving data")
    console.log(minecraftUsername, location, discordId, twitchName, mcUUID)
    //check if minecraftUsername is in database
    //if it is, update it
    //if it is not, create it
    try {
        let user = await mailboxSchema.findOne({ where: { MinecraftUsername: minecraftUsername.value.toLowerCase() } });
        if (user) {
            //if interaction.user.id is discordid
            //update user
            //check if interaction.user has a staff role
            let isStaff = false;
            for (let i = 0; i < client.config.staffroles.length; i++) {
                if (interaction.member.roles.cache.some(r => r.id === client.config.staffroles[i])) {
                    isStaff = true;
                }
            }
            if (isStaff) {
                user.update({
                    location: location,
                    DiscordID: discordId,
                    twitchName: twitchName.toLowerCase(),
                    mcUUID: mcUUID
                });
            }
            else if (interaction.user.id == discordId) {
                user.update({
                    location: location,
                    DiscordID: discordId,
                    twitchName: twitchName.toLowerCase(),
                    mcUUID: mcUUID
                });
            }
            else {
                return 3001;
            }
        }
        else {
            //create user
            await mailboxSchema.create({
                MinecraftUsername: minecraftUsername.value.toLowerCase(),
                location: location,
                DiscordID: discordId,
                twitchName: twitchName,
                mcUUID: mcUUID
            });
        }
    }
    catch (err) {
        console.log(err)
        return 3000;
    }
    return 1;
}

async function getSpreadsheetData(client, mcName) {
    const doc = new GoogleSpreadsheet(client.config.spreadsheet);
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    //console.log(doc.title+" has been opened");
    const info = await doc.getInfo();
    const sheet = doc.sheetsByIndex[0];

    n = sheet.rowCount
    n = n
    i = n - 1
    const load = "D1:F" + n;
    //console.log(load)
    //console.log("sheet has opened")
    await sheet.loadCells(load);

    let errorcode = 1
    let discordName
    let twitchName
    //find mcName
    while (i > 0) {
        let data = sheet.getCell(i, 3).value
        if (data) {
            if (data.toLowerCase() === mcName.toLowerCase()) {
                discordName = sheet.getCell(i, 4).value;
                twitchName = sheet.getCell(i, 5).value;
                break;
            }
        }
        i--
    }

    if (i == 0) {
        errorcode = 6001
    }

    let returnObject = {
        discordName: discordName,
        twitchName: twitchName,
        errorcode: errorcode
    }
    //console.log(returnObject)
    return returnObject;
}