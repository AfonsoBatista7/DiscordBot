const { SlashCommandBuilder } = require('@discordjs/builders');
const gamestatModel = require('../models/gamestatSchema');
const identityModel = require('../models/identitySchema');
const serversModel = require('../models/serversSchema');
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
        const { Discord } = options;
        const playerName = interaction.options.getString('player');

        try {
            const identity = await identityModel.findOne({ username: playerName, provider: 'minecraft' });
            if (!identity) {
                await interaction.editReply(`:x: | The player **${playerName}** never played on this server.`);
                return;
            }

            const allGameStats = await gamestatModel.find({ identityId: identity._id });
            if (allGameStats.length === 0) {
                await interaction.editReply(`:x: | The player **${playerName}** never played on this server.`);
                return;
            }

            if (allGameStats.length === 1) {
                await showMedals(interaction, Discord, playerName, allGameStats[0]);
                return;
            }

            // Multiple servers — show a select menu
            const serverDocs = await serversModel.find({ _id: { $in: allGameStats.map(g => g.serverId) } });
            const serverMap = {};
            serverDocs.forEach(s => { serverMap[String(s._id)] = s; });

            const selectMenu = new Discord.MessageSelectMenu()
                .setCustomId('server_select_medals')
                .setPlaceholder('Choose a server...')
                .addOptions(allGameStats.map(g => {
                    const s = serverMap[String(g.serverId)];
                    return {
                        label: s ? (s.name || s.ip) : g.serverId,
                        description: s ? `${s.ip} · ${s.status ? '🟢 Online' : '🔴 Offline'}` : 'Unknown server',
                        value: String(g._id),
                    };
                }));

            const response = await interaction.editReply({
                content: `**${playerName}** has played on multiple servers. Select one:`,
                components: [new Discord.MessageActionRow().addComponents(selectMenu)],
                fetchReply: true,
            });

            const collector = response.createMessageComponentCollector({
                componentType: 'SELECT_MENU',
                time: 30000,
            });

            collector.on('collect', async (selectInteraction) => {
                if (selectInteraction.user.id !== interaction.user.id) {
                    await selectInteraction.reply({ content: 'This menu is not for you!', ephemeral: true });
                    return;
                }
                const gamestat = allGameStats.find(g => String(g._id) === selectInteraction.values[0]);
                await selectInteraction.deferUpdate();
                await showMedals(interaction, Discord, playerName, gamestat);
            });

            collector.on('end', (_, reason) => {
                if (reason === 'time') {
                    interaction.editReply({ content: 'Server selection timed out.', components: [] }).catch(() => {});
                }
            });

        } catch(error) {
            console.log(error);
            await interaction.editReply(':x: | Something went wrong, please try again');
        }
    }
};

async function showMedals(interaction, Discord, playerName, gamestatData) {
    const onlineMessage = gamestatData.status ? '🟢 Online' : '🔴 Offline';
    const embed = new Discord.MessageEmbed()
        .setTitle(`${playerName} Medals`)
        .setColor('#ADFF2F')
        .setThumbnail(`https://minotar.net/helm/${playerName}/100.png`)
        .setTimestamp()
        .setFooter({ text: onlineMessage });

    if (!gamestatData.medals || gamestatData.medals.length === 0) {
        embed.setDescription('This player has no medals yet.');
    } else {
        for (const medal of gamestatData.medals) {
            embed.addFields({ name: medal.medalName, value: medal.medalLevel, inline: true });
        }
    }

    await interaction.editReply({ content: null, embeds: [embed], components: [] });
}
