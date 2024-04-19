const Discord = require("discord.js");
const McLog = require("../func/McLog.js");

module.exports = {
    name: 'messageCreate',
    execute(client, message) {
        if(message.channel.parentId == "1054839141118001203")
        {
            McLog.execute(client, message);
        }
    },
};
