const Discord = require("discord.js");
const util = require('minecraft-server-util');
const fs = require("fs")
const ip = "mc.8bitcommunity.com"
const ports = [
    25565, //waterfall
    25500, //hub
    25510, //survival
    25530 //plotworld
]
const portsName = [{
    25565 : "Proxy",
    25500 : "Hub",
    25510 : "survival",
    25530 : "plotworld"
}]
const options = {
    timeout: 1000 * 5, // timeout in milliseconds
    enableSRV: true // SRV record lookup
};
const serverChatID = "581520306984845324"


module.exports = async(client, thread) => {
    thread.send("Thanks for creating a crash report, a tech staff will check on this as soon as possible")
    //get server status
    let serverStatus = await getServerStatus(25565,thread )
    let survivalStatus = await getServerStatus(25510,thread )
    //console.log(serverStatus);
    //console.log(survivalStatus);
    let current_players
    let ping
    let survivalPing
    let serverOnline = true
    let survivalOnline = true
    
    try {
        current_players = serverStatus.players.online
    } catch (error) {
        current_players = 0
        serverOnline = false
        error = serverStatus
    }
    try {
        ping = serverStatus.roundTripLatency
    } catch (error) {
        ping = "offline"
        survivalOnline = false
    }
    try {
        survivalPing = survivalStatus.roundTripLatency
    } catch (error) {
        survivalPing = "offline"
    }

    //get topic of serverChatID
    let serverChat = await client.channels.fetch(serverChatID)
    let OnlineFor

    let topic = serverChat.topic
    let topicArry = topic.split("|")

    if (topicArry.length == 4) {
        OnlineFor = topicArry[2]
    }
    else {
        OnlineFor = "Cant get data (Offline?)"
    }

    const fieildArry = [
        { name: "Players online", value: String(current_players), inline: true },
        { name: "Proxy status", value: serverOnline ? "online" : "offline", inline: true },
        { name: "Proxy Ping", value: String(ping) + " ms", inline: true },
        { name: "Survival status", value: survivalOnline ? "online" : "offline", inline: true },
        { name: "Survival server Ping", value: String(survivalPing) + "ms", inline: true },
        { name: "Online for", value: OnlineFor, inline: true },
    ]

    try {
        let embed = new Discord.EmbedBuilder()
            .setTitle("Server ping")
            .setDescription("Crash report")
            .setColor("#0099ff")
            .addFields(fieildArry)
            .setTimestamp()

        await thread.send({ embeds: [embed] })
    } catch (error) {
        console.log(error);
        SaveLog(survivalStatus,serverStatus)
        await thread.send("Error sending emebed, report this error to RM")
    }
}

async function getServerStatus(port,thread) {
    let data
    await util.status(ip, port, options)
        .then((result) => {
            // console.log(result);
            data = result
        })
        .catch((error) => {
            console.error(error)
            data = error
            thread.send(`Error getting server status for ${portsName[parseInt(port)]}: ${error}`)
        });

    return data

}

async function SaveLog(survivalStatus,serverStatus)
{
    //create a file
    let date = new Date()
    let fileName = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDay() + "-" + date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds() + ".txt"
    data = {
        survivalStatus,
        serverStatus
    }

    //save to Logs
    fs.writeFile(`Logs/${fileName}`, JSON.stringify(data), function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
}