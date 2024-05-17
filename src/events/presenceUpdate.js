const Discord = require("discord.js");

module.exports = {
  name: "presenceUpdate",
  execute(client, oldMember, newMember) {
    return;
    //To enable this event, remove the return statement above
    //This event will announce in a specific channel when a user starts streaming minecraft on the 8bc server

    // console.log("presenceUpdate");
    const channel = oldMember.guild.channels.find(
      (x) => x.id === "668575267064774680"
    );
    if (!channel) return;
    let oldStreamingStatus = oldMember.presence.game
      ? oldMember.presence.game.streaming
      : false;
    let newStreamingStatus = newMember.presence.game
      ? newMember.presence.game.streaming
      : false;

    if (oldStreamingStatus == newStreamingStatus) {
      return;
    }

    if (newStreamingStatus) {
      if (
        (newMember.presence.game &&
          newMember.presence.game.name === "minecraft") ||
        newMember.presence.game.details.match(/!8bc !join/gi)
      ) {
        try {
          channel.send(
            `OH WOWIE! ${newMember.user}, currently streaming on the 8-Bit Minecraft Server! Check it out: ${newMember.presence.game.url}`
          );
          return;
        } catch (error) {
          console.log(error);
        }
      }
    }
  },
};
