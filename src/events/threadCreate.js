
const Discord = require("discord.js");

const serverPing = require("../func/serverPing")
module.exports = {
    name: 'threadCreate',
    async execute(client, thread) {
        //console.log(thread);

        if (thread.parentId == "1054839141118001203") {

            thread.send("<@&726137282104524871>")
            //check if thread.appliedTags has 1054839593947643984
            if (thread.appliedTags.includes("1054839593947643984")) {
                serverPing(client,thread);
            }
            else{
                return
            }
        }
    },
};
