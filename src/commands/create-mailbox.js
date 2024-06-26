const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require("fs");
const axios = require('axios');

const CalcCoord = require("../../src/func/CalcCoord");
const mailboxVerifyJson = require("../../data/mailboxVerify.json");
//database stuff
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../data/sequelize");
const mailboxSchema = require("../../utils/models/mailboxes-schema")(sequelize, DataTypes);

//spreadsheet stuff
const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require("../../utils/googlekey.json");

//discord id stuff
const DiscordIDFilePath = require("../../data/DiscordID.json")

//
const storage = require("../../src/func/storage");
const discord = require("../../src/func/discord");

//error codes:
const ErrorCodes = {
    1: "passed",
    //verify coordinates error codes
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
    data: new SlashCommandBuilder()
        .setName("create-mailbox")
        .setDescription("saves mailbox location")
        .addStringOption(option =>
            option.setName('minecraft-username')
                .setDescription('Enter your full minecraft username')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('level')
                .setDescription('Enter your level')
                .addChoices(
                    { "name": "first floor", "value": "2" },
                    { "name": "ground", "value": "1" },
                    { "name": "basement 01", "value": "0" }
                )
                .setRequired(true))
        .addStringOption(option =>
            option.setName('block')
                .setDescription('Enter your block')
                .addChoices(
                    { "name": "Clay", "value": "Clay" },
                    { "name": "Iron", "value": "Iron" },
                    { "name": "Honey", "value": "Honey" },
                    { "name": "Red sand", "value": "Red_sand" },
                    { "name": "Brown mushroom", "value": "Brown_mushroom" },
                    { "name": "Red mushroom", "value": "Red_mushroom" },
                    { "name": "Purpur", "value": "Purpur" },
                    { "name": "Crimson", "value": "Crimson" },
                    { "name": "Amethyst", "value": "Amethyst" },
                    { "name": "lapis", "value": "lapis" },
                    { "name": "Ice", "value": "Ice" },
                    { "name": "Prismarine", "value": "Prismarine" },
                    { "name": "Melon", "value": "Melon" },
                    { "name": "Moss", "value": "Moss" },
                    { "name": "Coal", "value": "Coal" },
                    { "name": "Basalt", "value": "Basalt" },
                    { "name": "staffArea", "value": "staffArea" }
                )
                .setRequired(true))
        .addStringOption(option =>
            option.setName('letter')
                .setDescription('Enter your letter')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('Enter your number')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('discord')
                .setDescription('Enter Discord name of owner of mailbox')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('twitch')
                .setDescription('Enter Twitch name of owner of mailbox')
                .setRequired(false)),

    async execute(interaction, client) {
        //console.log(interaction)
        const level = interaction.options.data[1].value;
        const letter = interaction.options.data[3].value.toLowerCase();
        const number = interaction.options.data[4].value;
        //verify data if not 1 reply with error code
        let errorcode = await VerifyInput(level, letter, number);
        if (errorcode == 1) {
            interaction.deferReply({ ephemeral: true });
            //continue
            CreateMailbox(interaction, client);
        }
        else {
            //reply with error code
            interaction.reply({ content: ErrorCodes[errorcode], ephemeral: true });
            return;
        }
        //await interaction.reply("Pong!");
    },
};

// verify data is part of the mailboxVerify.json file
// if it is, return 1
// if it is not, return an error number
// Error numbers:
// 1002: number is not acceptable
// 1003: letter is not acceptable
// 1004: both number and letter are not acceptable
async function VerifyInput(level, letter, number) {
    //console.log(level)
    let LevelI = parseInt(level)
    //console.log(LevelI)

    //covert json
    //let mailboxVerify = JSON.parse(JSON.stringify(mailboxVerifyJson));
    //console.log(mailboxVerifyJson.coords[LevelI])
    const AcceptedableNumber = mailboxVerifyJson.coords[LevelI].acceptedValues.numbers;
    //console.log(AcceptedableNumber)
    let errorcode = 1;
    //check if number is in range return true
    //console.log(number)

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
    const response = await axios.post('https://api.minecraftservices.com/minecraft/profile/lookup/bulk/byname', nameArray);
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
    const minecraftUsername = interaction.options.data[0];

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

    const level = interaction.options.data[1];
    const block = interaction.options.data[2];
    const letter = interaction.options.data[3];
    const number = interaction.options.data[4];
    //check if interaction.options.data[5].name is discord
    //if it is, get discord name
    //if it is not, get twitch name
    let discordName = "";
    let twitch = "";
    if (interaction.options.data[5]) {
        if (interaction.options.data[5].name == "discord") {
            discordName = interaction.options.data[5];
        }
        else if (interaction.options.data[5].name == "twitch") {
            twitch = interaction.options.data[5];
        }
    }

    //check for [6] if it is discord or twitch
    //if it is discord, get discord name
    //if it is twitch, get twitch name
    if (interaction.options.data[6]) {
        if (interaction.options.data[6].name == "discord") {
            discordName = interaction.options.data[6];
        }
        else if (interaction.options.data[6].name == "twitch") {
            twitch = interaction.options.data[6];
        }
    }
    let discordUser
    if (discordName) {
        discordUser = discordName.user
    }
    let coord = CalcCoord(number.value,letter.value.toLowerCase(),block.value,level.value)
    let location = {
        level: level.value,
        block: block.value,
        letter: letter.value.toUpperCase(),
        number: number.value,
        coordinates: coord
    }
    //console.log(discordUser)

    let twitchName
    let discordId


    if (discordUser && twitch) {
        discordId = discordUser.id;
        twitchName = twitch.value;

    }
    else {
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
                try {
                    const matchingEntry = DiscordIDFilePath.Users.find(entry => entry.RawDiscordName.mcName.toLowerCase() === minecraftUsername.value.toLowerCase());

                    if (!matchingEntry) {
                        await interaction.editReply({ content: `Could not find a Discord ID associated with the mcName: ${minecraftUsername.value.toLowerCase()}`, ephemeral: true });
                        return;
                    }
            
                    // Extract discordName and proceed with existing logic
                    // let discordId = matchingEntry.RawDiscordName.discordName; 
                discordId = matchingEntry.discordID; 
                }
                catch (err) {
                    console.log(err)
                    await interaction.editReply({ content: `Could not find a Discord ID associated with the mcName: ${minecraftUsername}`, ephemeral: true });
                    return;
                }
            }
            else {
                //find discord id
                let user = await client.users.fetch(discordName);
                if (user) {
                    discordId = user.id;
                }
                else {
                    await interaction.editReply({ content: `Could not find a Discord ID associated with the mcName: ${minecraftUsername}`, ephemeral: true });
                    return;
                }
            }
        }
        else {
            await interaction.editReply({ content: ErrorCodes[data.errorcode], ephemeral: true });
            return;
        }
    }

    let Location = letter.value.toUpperCase() + number.value;
    let levelName = mailboxVerifyJson.levels[level.value].name;
    let TextCoord = coord.x + " " + coord.y + " " + coord.z + " (X Y Z)"
    let fieildArry = [
        { name: "Level", value: levelName, inline: true },
        { name: "Block", value: block.value, inline: true },
        { name: "Location", value: Location, inline: true },
        { name: "coordinates", value: TextCoord, inline: true}
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
            .setTitle("Mailbox Record Created for " + minecraftUsername.value)
            .setColor("#0099ff")
            .setDescription("A mailbox has been created for you!")
            .addFields(fieildArry)
            .setThumbnail(`https://mc-heads.net/avatar/${mcUUID}.png`)
        await interaction.editReply({ embeds: [embed], ephemeral: true });
        console.log("mailbox created for " + minecraftUsername.value + " at "+ TextCoord + " | Discord ID: "+ discordId)
        //get user for discordId
        //if user exists, send them a message
        if (discordId) {
            let user = await client.users.fetch(discordId);
            if (user) {
                // await user.send({ embeds: [embed]});
                updateMetadata(discordId, location, mcUUID)
            }
        }
        updateRickSpreadsheet(client, minecraftUsername.value, location);
    }
    else {
        interaction.editReply({ content: ErrorCodes[savedData], ephemeral: true });
    }

}

async function saveData(minecraftUsername, location, discordId, twitchName, mcUUID, interaction, client) {
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
                //send message to discordId
                
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
                console.log(`User ${interaction.user.id} tried to update ${discordId}`)
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
    if(floor.includes("First floor")){
        floor = "First"
    }
    floor = floor.charAt(0).toUpperCase() + floor.slice(1);

    //get block
    let block = location.block;
    block = block.charAt(0).toUpperCase() + block.slice(1);
    if(block=="Red_mushroom"||block=="Brown_mushroom"){
        //get rid of mushroom
        block = block.replace("mushroom", "")
    }
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
        //update data
        sheet.getCell(i, 1).value = floor;
        sheet.getCell(i, 2).value = block;
        sheet.getCell(i, 3).value = Position;
    }
    else {
        //create new data
        //find first empty row
        let j = 1
        while (j < n) {
            let data = sheet.getCell(j, 0).value
            if (!data) {
                break;
            }
            j++
        }
        sheet.getCell(j, 0).value = mcName;
        sheet.getCell(j, 1).value = floor;
        sheet.getCell(j, 2).value = block;
        sheet.getCell(j, 3).value = Position;
    }

    await sheet.saveUpdatedCells();
    console.log("mailbox spreadsheet updated")
    return;
}


// async function updateMetadata(userID, location , mcUUID){
//     const token = await storage.getDiscordTokens(userID);
//     let metadata = {};
//     try {
//         let level = location.level;
//         let floor = mailboxVerifyJson.levels[level].name;
//         let letter = location.letter;
//         letter = letter.toUpperCase();
//         let number = location.number;
//         let Position = letter + number;
//         metadata = {
//             floor: floor,
//             block: location.block,
//             position: Position,
//             coordinates: location.coordinates,
//             mcUUID: mcUUID
//         };
//     } catch (error) {
//         e.message = `Error fetching external data: ${e.message}`;
//         console.error(e);
//     }

//     await discord.pushMetadata(userID, token, metadata);
// }