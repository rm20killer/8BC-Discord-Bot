const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");
const mailboxVerify = require("../../data/mailboxVerify.json");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require("fs");

const ErrorCodes = {
    1:"passed",
    1002: "Number is not acceptable",
    1003: "Letter is not acceptable",
    1004: "Both number and letter are not acceptable",
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
                {
                    "name": "first floor",
                    "value": "1"
                },
                {
                    "name": "ground",
                    "value": "0"
                },
                {
                    "name": "basement 01",
                    "value": "-1"
                }
            )
            .setRequired(true))
    .addStringOption(option =>
        option.setName('block')
            .setDescription('Enter your block')
            .addChoices(
                {
                    "name": "Clay",
                    "value": "Clay"
                },
                {
                    "name": "Iron",
                    "value": "Iron"
                },
                {
                    "name": "Honey",
                    "value": "Honey"
                },
                {
                    "name": "Red sand",
                    "value": "Red_sand"
                },
                {
                    "name": "Brown mushroom",
                    "value": "Brown_mushroom"
                },
                {
                    "name": "Red mushroom",
                    "value": "Red_mushroom"
                },
                {
                    "name": "Purpur",
                    "value": "Purpur"
                },
                {
                    "name": "Crimson",
                    "value": "Crimson"
                },
                {
                    "name": "Amethyst",
                    "value": "Lapis"
                },
                {
                    "name": "Ice",
                    "value": "Ice"
                },
                {
                    "name": "Prismarine",
                    "value": "Prismarine"
                },
                {
                    "name": "Melon",
                    "value": "Melon"
                },
                {
                    "name": "Moss",
                    "value": "Moss"
                },
                {
                    "name": "Coal",
                    "value": "Coal"
                },
                {
                    "name": "Basalt",
                    "value": "Basalt"
                },
                {
                    "name":"staffArea",
                    "value":"staffArea"
                }
            )
            .setRequired(true))
    .addStringOption(option =>
        option.setName('letter')
            .setDescription('Enter your letter')
            .setRequired(true))
    .addIntegerOption(option =>
        option.setName('number')
            .setDescription('Enter your number')
            .setRequired(true)),
    async execute(interaction, client) {
        console.log(interaction)
        const { minecraftUsername, level, block, letter, number } = interaction.options;
        //verify data if not 1 reply with error code
        let errorcode = await VerifyData(level, letter, number);
        if(errorcode == 1){
            //continue
        }
        else{
            //reply with error code
            interaction.reply({content:ErrorCodes[errorcode], ephemeral:true});
            return;
        }
        await interaction.reply("Pong!");
    },
};

// verify data is part of the mailboxVerify.json file
// if it is, return 1
// if it is not, return an error number
// Error numbers:
// 1002: number is not acceptable
// 1003: letter is not acceptable
// 1004: both number and letter are not acceptable
async function VerifyData(level, letter, number){
    let LevelI = level.value + 1;
    const AcceptedableNumber = mailboxVerify.coords[LevelI].acceptedValues.number;
    let errorcode = 1;
    //check if number is in range return true
    let numberInRange = false
    if(number >= AcceptedableNumber[0] && number <= AcceptedableNumber[1]){
        numberInRange = true;
    }
    else{
        errorcode = 1002;
        //number is not in range
    }
    //check if letter is in range
    const AcceptedableLetter = mailboxVerify.coords[LevelI].acceptedValues.letter;
    //if acceptedableLetter contains letter, return true
    if(AcceptedableLetter.includes(letter.value)){}
    else{
        if(numberInRange){  
            errorcode = 1003;
            //letter is not in range
        }
        else{
            errorcode = 1004;
            //letter and number are not in range
        }
    }
    return errorcode;
}

