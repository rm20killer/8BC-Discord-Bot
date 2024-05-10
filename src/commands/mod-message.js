const { SlashCommandBuilder } = require("@discordjs/builders");
const stockMessages = require("../../data/stockMessage.json");

const { GoogleSpreadsheet } = require("google-spreadsheet");
const creds = require("../../utils/googlekey.json");

//discord id stuff
const DiscordIDFilePath = require("../../data/DiscordID.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mod-message")
    .setDescription("message a user as the bot")
    .addStringOption((option) =>
      option
        .setName("user")
        .setDescription("The MC user to message")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("district")
        .setDescription("Enter the district of the shop")
        .addChoices(
          { name: "harbor", value: "Harbor" },
          { name: "mining", value: "Mining" },
          { name: "museum", value: "Museum" },
          { name: "mushroom", value: "Mushroom" },
          { name: "pride", value: "Pride" }
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for the message")
        .addChoices(
          { name: "low stock", value: "LowStock" },
          { name: "no IGN", value: "ShopNotLabeled" },
          { name: "over 21 items", value: "OverStock" },
          { name: "Not Built after 2 weeks", value: "NotBuilt"}
        )
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("discorduser")
        .setDescription("The discord user to message")
        .setRequired(false)
    ),

  async execute(interaction, client) {
    //check if the user has the correct permissions
    let isStaff = false;
    for (let i = 0; i < client.config.staffroles.length; i++) {
      if (
        interaction.member.roles.cache.some(
          (r) => r.id === client.config.staffroles[i]
        )
      ) {
        isStaff = true;
      }
    }
    if (!isStaff) {
      return interaction.reply({
        content: "You do not have the correct permissions to use this command",
        ephemeral: true,
      });
    }
    interaction.deferReply({ ephemeral: false });
    console.log("mod-message command used");
    console.log(interaction.options.data);
    const user = interaction.options.data[0].value;
    const district = interaction.options.data[1].value;
    const reason = interaction.options.data[2].value;

    let DiscordID = "";
    let DiscordName = "";
    let DiscordUser = "";
    console.log("starting to get discord id");
    if (interaction.options.data[3]) {
      if (interaction.options.data[3].name === "discorduser") {
        DiscordName = interaction.options.data[3].value;
        DiscordUser = interaction.options.data[3].user;
      }
    } else {
      console.log("no discord user looking for discord id in google sheet");
      //look get the discord id from the google sheet
      let data;
      try {
        data = await getSpreadsheetData(client, user.toLowerCase());
      } catch (error) {
        console.error(error);
      }
      if (data.errorcode == 1) {
        let discordName = data.discordName;
        if (discordName.includes("#")) {
          try {
            const matchingEntry = DiscordIDFilePath.Users.find(
              (entry) =>
                entry.RawDiscordName.mcName.toLowerCase() ===
                user.toLowerCase()
            );
            console.log(matchingEntry);
            if (!matchingEntry) {
              await interaction.editReply({
                content: `Could not find a Discord ID associated with the mcName: ${user.toLowerCase()}`,
              });
              return;
            }

            // Extract discordName and proceed with existing logic
            // let discordId = matchingEntry.RawDiscordName.discordName;
            DiscordID = matchingEntry.discordID;
          } catch (err) {
            console.log(err);
            await interaction.editReply({
              content: `Could not find a Discord ID associated with the mcName: ${user}`,
            });
            return;
          }
        } else {
          //find discord id
          let Duser = await client.users.fetch(discordName);
          if (Duser) {
            DiscordID = user.id;
          } else {
            await interaction.editReply({
              content: `Could not find a Discord ID associated with the mcName: ${user}`,
            });
            return;
          }
        }
      } else {
        await interaction.editReply({
          content: `Could load username Database for: ${user}`,
        });
        return;
      }
    }
    try {
        console.log(DiscordID);
      DiscordUser = await client.users.fetch(DiscordID);
      console.log(DiscordUser);
    } catch (error) {
      await interaction.editReply({
        content: `Could not find a Discord ID associated with the mcName: ${user}`,
      });
      return;
    }
    console.log("DiscordUser");
    let message = "";
    switch (reason) {
      case "LowStock":
        message = stockMessages.LowStock.message;
        break;
      case "ShopNotLabeled":
        message = stockMessages.ShopNotLabeled.message;
        break;
      case "OverStock":
        message = stockMessages.OverStock.message;
        break;
    case "NotBuilt":
        message = stockMessages.NotBuilt.message;
        break;
    }

    //replace the placeholders
    message = message.replace("[NAME]", user);

    message = message.replace("[DISTRICT]", district);
    message = message.replace("[DATE]", "<t:1716037200:D>");
    //send the message
    try {
      await DiscordUser.send(message);
      return await interaction.editReply({
        content: `Message sent to ${DiscordUser.username}`,
      });
    } catch (error) {
      await interaction.editReply({
        content: `Could not send message to ${DiscordUser.username} <@${DiscordID}>`,
      });
      return;
    }
  },
};

async function getSpreadsheetData(client, mcName) {
  console.log("starting to get spreadsheet data");
  const doc = new GoogleSpreadsheet(client.config.spreadsheet);
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  //console.log(doc.title+" has been opened");
  const info = await doc.getInfo();
  const sheet = doc.sheetsByIndex[0];

  n = sheet.rowCount;
  n = n;
  i = n - 1;
  const load = "D1:F" + n;
  //console.log(load)
  //console.log("sheet has opened")
  await sheet.loadCells(load);

  let errorcode = 1;
  let discordName;
  let twitchName;
  //find mcName
  while (i > 0) {
    let data = sheet.getCell(i, 3).value;
    if (data) {
      if (data.toLowerCase() === mcName.toLowerCase()) {
        discordName = sheet.getCell(i, 4).value;
        twitchName = sheet.getCell(i, 5).value;
        break;
      }
    }
    i--;
  }

  if (i == 0) {
    errorcode = 6001;
  }

  let returnObject = {
    discordName: discordName,
    twitchName: twitchName,
    errorcode: errorcode,
  };
  //console.log(returnObject)
  return returnObject;
}
