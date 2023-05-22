const discord = require("discord.js");
const fs = require("fs");

module.exports = {
  async execute(client) {
    let channel = client.channels.cache.get("1103480599852896316");
    let guild = client.guilds.cache.get("451781102982529034");
    const GetDiscordID = async (client) => {
      //read Spreadsheet.json
      const data = JSON.parse(fs.readFileSync(`./data/Spreadsheet.json`));
      // let data = JSON.parse(spreadsheetRaw);
      if (data.Total == data.Processed) {
      } else {
        let user = data.Users[data.Processed];
        if (user.discordName) {
          if (!user.discordName|| typeof user.discordName === "string" && user.discordName.includes("#")) {
            let name = user.discordName.split(/#/)[0];
            //check if name is 0 length
            if (name.length === 0) {
              channel.send(
                `User ${user.discordName} not found [ID in spreadsheet: ${data.Processed}]`
              );
            } else {
              const member = await guild.members.search({
                query: name,
                cache: true,
              });
              console.log(member);
              if (member.size === 0) {
                channel.send(
                  `User ${user.discordName} not found [ID in spreadsheet: ${data.Processed}]`
                );
              } else {
                const getMember = member.first();
                console.log(getMember);
                discordId = getMember.user.id;
                //save to spreadsheet.json
                let rawdata = fs.readFileSync(`./data/DiscordID.json`);
                let discordID = JSON.parse(rawdata);
                let userData = {
                  discordID: discordId,
                  RawDiscordName: data.Users[data.Processed],
                };
                discordID.Users.push(userData);
                let Jsondata = JSON.stringify(discordID, null, 2);
                fs.writeFileSync(`./data/DiscordID.json`, Jsondata);

                channel.send(
                  `User ${user.discordName} found with <@${getMember.user.id}>[ID in spreadsheet: ${data.Processed}]`
                );
              }
            }
          }
        }

        data.Processed = data.Processed + 1;
        data.lastProcessed = new Date();
        let dataJSON = JSON.stringify(data, null, 2);
        fs.writeFileSync(`./data/Spreadsheet.json`, dataJSON);
      }

      setTimeout(GetDiscordID, 1000 * 0.1);
    };
    GetDiscordID(client);
  },
};
