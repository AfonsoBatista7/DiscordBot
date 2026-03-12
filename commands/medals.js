const { SlashCommandBuilder } = require('@discordjs/builders');
const gamestatModel = require('../models/gamestatSchema');
const identityModel = require('../models/identitySchema');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('medals')
        .setDescription('Get Minecraft server medals of a player')
        .addStringOption(option =>
            option.setName('player')
                .setDescription('The name of the player')
                .setRequired(true)),
    name: 'medals',
    aliases: ['me', 'playermedals', 'med', 'pm'],
    cooldown: 5,
    description: "Minecraft Server Medals of a player",
    async execute(interaction, options) {
        const { client, Discord, profileData } = options;
        const playerName = interaction.options.getString('player');

        try {
            const identity = await identityModel.findOne({ username: playerName, provider: 'minecraft' });
            const gamestatData = identity ? await gamestatModel.findOne({ identityId: identity._id }) : null;

            if(!gamestatData) {
                await interaction.editReply(`:x: | The player **${playerName}** never played on this server.`);
                return;
            }

            let onlineMessage = gamestatData.status ? "🟢 Online" : "🔴 Offline";
            const embed = new Discord.MessageEmbed()
                .setTitle(`${playerName} Medals`)
                .setColor('#ADFF2F')
                .setThumbnail(`https://minotar.net/helm/${playerName}/100.png`)
                .setTimestamp()
                .setFooter({text: `${onlineMessage}`});

            for(const i in gamestatData.medals) {
                embed.addFields({
                    name: `${gamestatData.medals[i].medalName}`,
                    value: `${gamestatData.medals[i].medalLevel}`,
                    inline: true
                });
            }

            await interaction.editReply({embeds: [embed]});

        } catch(error) {
            console.log(error);
            await interaction.editReply(':x: | Something went wrong, please try again');
        }
    }
}
