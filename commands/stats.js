const { SlashCommandBuilder } = require('@discordjs/builders');
const gamestatModel = require('../models/gamestatSchema');
const identityModel = require('../models/identitySchema');
const serversModel = require('../models/serversSchema');
require('dotenv').config();

const ERRORS = {
    NO_PLAYER_NAME: ':x: | You need to specify the name of a Player on the server (`.stats <playerName>`)',
    PLAYER_NOT_FOUND: (playerName) => `:x: | The player **${playerName}** never played on this Minecraft server.`,
    DATABASE_ERROR: ':x: | Something went wrong, please try again'
};

function TimeMinutesToString(timeMinutes) {
    const hours = Math.floor(timeMinutes / 60);
    const minutes = timeMinutes % 60;
    return minutes === 0 ? `${hours} Hours` : `${hours} Hr ${minutes} Min`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Get Minecraft server stats of a player')
        .addStringOption(option =>
            option.setName('player')
                .setDescription('The name of the player')
                .setRequired(false)),
    name: 'stats',
    aliases: ['serverstats', 'minestats'],
    cooldown: 5,
    description: "Minecraft Server Stats of a player",
    async execute(interaction, options) {
        const { Discord, profileData } = options;

        try {
            const playerOption = interaction.options.getString('player');

            // Resolve which MC identity we're looking up
            let mcIdentity;
            if (!playerOption) {
                if (profileData.mcIdentityId != null) {
                    mcIdentity = await identityModel.findOne({ _id: profileData.mcIdentityId });
                    if (!mcIdentity) throw new Error('MC identity not found');
                } else {
                    await interaction.editReply(ERRORS.NO_PLAYER_NAME);
                    return;
                }
            } else {
                mcIdentity = await identityModel.findOne({ username: playerOption, provider: 'minecraft' });
                if (!mcIdentity) {
                    await interaction.editReply(ERRORS.PLAYER_NOT_FOUND(playerOption));
                    return;
                }
            }

            const playerName = mcIdentity.username;
            const allGameStats = await gamestatModel.find({ identityId: mcIdentity._id });

            if (allGameStats.length === 0) {
                await interaction.editReply(ERRORS.PLAYER_NOT_FOUND(playerName));
                return;
            }

            if (allGameStats.length === 1) {
                await showStats(interaction, Discord, playerName, allGameStats[0]);
                return;
            }

            // Multiple servers — show a select menu
            const serverDocs = await serversModel.find({ _id: { $in: allGameStats.map(g => g.serverId) } });
            const serverMap = {};
            serverDocs.forEach(s => { serverMap[String(s._id)] = s; });

            const selectMenu = new Discord.MessageSelectMenu()
                .setCustomId('server_select_stats')
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
                await showStats(interaction, Discord, playerName, gamestat, serverMap[String(gamestat.serverId)]);
            });

            collector.on('end', (_, reason) => {
                if (reason === 'time') {
                    interaction.editReply({ content: 'Server selection timed out.', components: [] }).catch(() => {});
                }
            });

        } catch(error) {
            console.error('Database error in stats command:', error);
            await interaction.editReply(ERRORS.DATABASE_ERROR);
        }
    }
};

async function showStats(interaction, Discord, playerName, gamestatData, server) {
    const s = gamestatData.stats || {};
    const serverLabel = server ? server.name : null;
    let footer = gamestatData.status ? '🟢 Online' : '🔴 Offline';
    if (serverLabel) footer += ` · ${serverLabel}`;

    const embed = new Discord.MessageEmbed()
        .setTitle(`${playerName} Stats`)
        .setColor('#ADFF2F')
        .setThumbnail(`https://minotar.net/helm/${playerName}/100.png`)
        .addFields(
            { name: 'Name',             value: `${playerName}` },
            { name: 'Blocks Placed',    value: `${s.blcksPlaced ?? 0}`,    inline: true },
            { name: 'Blocks Destroyed', value: `${s.blcksDestroyed ?? 0}`, inline: true },
            { name: 'Blocks Mined',     value: `${s.blockMined ?? 0}`,     inline: true },
            { name: 'Kills',            value: `${s.kills ?? 0}`,          inline: true },
            { name: 'Mob Kills',        value: `${s.mobKills ?? 0}`,       inline: true },
            { name: 'Deaths',           value: `${s.deaths ?? 0}`,         inline: true },
            { name: 'Fish Caught',      value: `${s.fishCaught ?? 0}` },
            { name: 'Times Login',      value: `${s.timeslogin ?? 0}` },
            { name: 'Last Login',       value: `${gamestatData.lastLogin ?? 'N/A'}`,                          inline: true },
            { name: 'Player Since',     value: `${gamestatData.playerSince ?? 'N/A'}`,                        inline: true },
            { name: 'Time Played',      value: `${TimeMinutesToString(gamestatData.timePlayedMinutes ?? 0)}`, inline: true },
            { name: 'Time AFK',         value: `${TimeMinutesToString(gamestatData.timeAFKMinutes ?? 0)}`,    inline: true },
        )
        .setTimestamp()
        .setFooter({ text: footer });

    await interaction.editReply({ content: null, embeds: [embed], components: [] });
}
