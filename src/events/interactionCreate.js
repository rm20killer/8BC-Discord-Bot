const Discord = require("discord.js");
const MailboxWizard = require('../modal/mailbox-wizardModal');

module.exports = {
    name: 'interactionCreate',
    async execute(client, interaction) {
        //console.log(interaction);
        //slash commands
        if (interaction.type === 2) {
            const command = client.slashcommand.get(interaction.commandName);
            if (!command) return;
            try {
                var date = new Date();
                var dateStr =
                    ("00" + (date.getMonth() + 1)).slice(-2) + "/" +
                    ("00" + date.getDate()).slice(-2) + "/" +
                    date.getFullYear() + " " +
                    ("00" + date.getHours()).slice(-2) + ":" +
                    ("00" + date.getMinutes()).slice(-2) + ":" +
                    ("00" + date.getSeconds()).slice(-2);
                console.log(`executing command ${interaction.commandName} for ${interaction.member.user.username} at ${dateStr}`)
                await command.execute(interaction, client);
            } catch (error) {
                console.error(error);
                const embed = new Discord.EmbedBuilder()
                    .setDescription(`error executing command ${interaction.commandName}`)
                    .setColor("#2F3136");
                if(interaction.deferred == false && interaction.replied == false)
                {
                    return interaction.reply({
                        embeds: [embed],
                    });
                }
                else
                {
                    return interaction.editReply({
                        embeds: [embed],
                    });
                }
            }
        }
        //buttons
        else if (interaction.type === 3) {
            //get button id
            const id = interaction.customId;
            const ButtonStart = id.split("-")[0];
            //console.log(ButtonStart);
            const buttonType = client.button.get(ButtonStart);
            if (!buttonType) return;
            try {
                await buttonType.execute(interaction, client);
            } catch (error) {
                console.error(error);
                const embed = new Discord.EmbedBuilder()
                    .setDescription(`error`)
                    .setColor("#2F3136");
                return interaction.reply({
                    embeds: [embed],
                });
            }
        }

        else if (interaction.isModalSubmit) {
            const id = interaction.customId;
            if (id === "mailbox-wizard") {
                MailboxWizard.execute(interaction, client);
            }
        }
        else {
            console.log(interaction);
        }

    },
};