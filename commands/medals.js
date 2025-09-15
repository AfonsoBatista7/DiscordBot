const { SlashCommandBuilder } = require('@discordjs/builders');
const serverStatsModel = require('../models/serverStatsSchema');
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
            const serverStatsData = await serverStatsModel.findOne({name: playerName});

            if(!serverStatsData) {
                await interaction.reply(`:x: | The player **${playerName}** never played on \`${process.env.MINECRAFT_SERVER_IP.split('.')[0]}\` server.`);
                return;
            }

            let onlineMessage = serverStatsData.online ? "🟢 Online" : "🔴 Offline";
            const embed = new Discord.MessageEmbed()
                .setTitle(`${playerName} Medals`)
                .setColor('#ADFF2F')
                .setThumbnail(`https://minotar.net/helm/${playerName}/100.png`)
                .setTimestamp()
                .setFooter({text: `${onlineMessage}`});

            for(const i in serverStatsData.medals) {
                embed.addFields({
                    name: `${serverStatsData.medals[i].medalName}`,
                    value: `${serverStatsData.medals[i].medalLevel}`,
                    inline: true
                });
            }

            await interaction.reply({embeds: [embed]});

        } catch(error) {
            console.log(error);
            await interaction.reply(':x: | Something went wrong, please try again');
        }
    }
}
