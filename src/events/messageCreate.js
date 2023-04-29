const { Attachment } = require("discord.js");
const Discord = require("discord.js");
const fetch = require("node-fetch");
const querystring = require('querystring');

module.exports = {
    name: 'messageCreate',
    execute(client, message) {
        if(message.channel.parentId != "1054839141118001203")
        {
            return
        }
        // console.log(message);
        let attachments = Array.from(message.attachments);
        //if attachments more then 0
        if (attachments.length > 0) {
            attachments.forEach(attachment => {
                console.log(attachment)
                const nameArray = attachment[1].name.split("."); // Split the name
                const attEx = nameArray[nameArray.length - 1].toLowerCase(); // Grab the last value of the array.
                if (attEx == "log") {
                    let content
                    fetch(attachment[1].url)
                        .then(res => res.text())
                        .then(body => {
                            content = body
                            //if the first line = loading Minecraft
                            if (content.split("\n")[0].includes("Loading Minecraft")) {

                                postToMClog(content, message)
                            }
                        })
                }
            });
        }
        else {
            return
        }
    },
};

function postToMClog(content, message) {
    // console.log(content)
    const postData = querystring.stringify({ content });
    try {
        fetch("https://api.mclo.gs/1/log",
            {
                method: 'POST',
                body: postData,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            .then(res => res.json())
            .then(json => {
                console.log(json)
                if (json.success) {
                    message.reply("Your log has been posted to " + json.url + " For easy viewing")
                    analyzeLog(message, json)
                }
            })
    } catch (error) {
        console.log(error)
    }
}

function analyzeLog(message, json) {
    let jsonOld = json
    let url = "https://api.mclo.gs/1/insights/" + json.id
    //fetch https://api.mclo.gs/1/insights/[id] 
    fetch(url,
        {
            method: 'GET'
        })
        .then(res => res.json())
        .then(json => {
            console.log(json)
            if (json.success == false) {

            }
            else {
                let fieildArry = []
                
                let infos = json.analysis.information
                //for each
                infos.forEach(info => {
                    fieildArry.push({ name: info.label, value: info.value })
                });


                fieildArry.push({ name: "Errors:", value: "Below this" })
                if (json.analysis.problems > 0) {
                    json.analysis.problems.forEach(issue => {
                        fieildArry.push({ name: issue.counter, value: issue.message })
                        if(issue.solutions > 0)
                        {
                            issue.solutions.forEach(solution => {
                                fieildArry.push({ name: "Solution", value: solution.message })
                            });
                        }
                    });
                }
                const embed = new Discord.EmbedBuilder()
                    .setTitle(json.title)
                    .setDescription("Basic info from the log")
                    .setColor("#0099ff")
                    .setTimestamp()
                    .addFields(fieildArry);
                message.reply({ embeds: [embed] });

            }
        })
}
