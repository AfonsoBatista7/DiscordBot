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
    let hours = Math.floor(timeMinutes/60);
    let minutes = (timeMinutes % 60);

    return minutes==0 ? `${hours} Hours` : `${hours} Hr ${minutes} Min`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Get Minecraft server stats of a player')
        .addStringOption(option =>
            option.setName('player')
                .setDescription('The name of the player')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('server')
                .setDescription('The name of the server to get stats from')
                .setRequired(false)),
    name: 'stats',
    aliases: ['serverstats', 'minestats'],
    cooldown: 5,
    description: "Minecraft Server Stats of a player",
    async execute(interaction, options) {
        const { client, Discord, profileData } = options;
        let playerName;
        let gamestatData;

        try {
            const playerOption = interaction.options.getString('player');
            const serverOption = interaction.options.getString('server');

            // Resolve which MC identity we're looking up
            let mcIdentity;
            if (!playerOption) {
                if (profileData.mcIdentityId != null) {
                    mcIdentity = await identityModel.findOne({ _id: profileData.mcIdentityId });
                    if (!mcIdentity) throw new Error('MC identity not found');
                    playerName = mcIdentity.username;
                } else {
                    await interaction.editReply(ERRORS.NO_PLAYER_NAME);
                    return;
                }
            } else {
                playerName = playerOption;
                mcIdentity = await identityModel.findOne({ username: playerName, provider: 'minecraft' });
                if (!mcIdentity) {
                    await interaction.editReply(ERRORS.PLAYER_NOT_FOUND(playerName));
                    return;
                }
            }

            // Resolve server filter
            let serverFilter = {};
            let serverName = null;
            if (serverOption) {
                const server = await serversModel.findOne({ name: { $regex: new RegExp(serverOption, 'i') } });
                if (!server) {
                    await interaction.editReply(`:x: | No server found with name **${serverOption}**.`);
                    return;
                }
                serverFilter = { serverId: String(server._id) };
                serverName = server.name;
            }

            // Find gamestats for this player (optionally filtered by server)
            const allGameStats = await gamestatModel.find({ identityId: mcIdentity._id, ...serverFilter });

            if (allGameStats.length === 0) {
                await interaction.editReply(ERRORS.PLAYER_NOT_FOUND(playerName));
                return;
            }

            // If multiple servers and no server specified, show the list
            if (allGameStats.length > 1 && !serverOption) {
                const serverDocs = await serversModel.find({ _id: { $in: allGameStats.map(g => g.serverId) } });
                const serverNameMap = {};
                serverDocs.forEach(s => { serverNameMap[String(s._id)] = s.name || s.ip; });

                const serverList = allGameStats
                    .map(g => `• **${serverNameMap[String(g.serverId)] || g.serverId}**`)
                    .join('\n');

                const embed = new Discord.MessageEmbed()
                    .setTitle(`${playerName} — Multiple Servers`)
                    .setColor('#ADFF2F')
                    .setDescription(`This player has stats on multiple servers. Use \`/stats player:${playerName} server:<name>\` to view a specific one.\n\n${serverList}`)
                    .setThumbnail(`https://minotar.net/helm/${playerName}/100.png`);

                await interaction.editReply({ embeds: [embed] });
                return;
            }

            gamestatData = allGameStats[0];

            const s = gamestatData.stats || {};
            let onlineMessage = gamestatData.status ? "🟢 Online" : "🔴 Offline";
            if (serverName) onlineMessage += ` · ${serverName}`;

            const embed = new Discord.MessageEmbed()
                .setTitle(`${playerName} Stats`)
                .setColor('#ADFF2F')
                .setThumbnail(`https://minotar.net/helm/${playerName}/100.png`)
                .addFields({
                    name: 'Name', value: `${playerName}` },{
                    name: 'Blocks Placed', value: `${s.blcksPlaced ?? 0}`, inline: true },{
                    name: 'Blocks Destroyed', value: `${s.blcksDestroyed ?? 0}`, inline: true },{
                    name: 'Blocks Mined', value: `${s.blockMined ?? 0}`, inline: true },{
                    name: 'Kills', value: `${s.kills ?? 0}`, inline: true },{
                    name: 'Mob Kills', value: `${s.mobKills ?? 0}`, inline: true },{
                    name: 'Deaths', value: `${s.deaths ?? 0}`, inline: true },{
                    name: 'Fish Caught', value: `${s.fishCaught ?? 0}` },{
                    name: 'Times Login', value: `${s.timeslogin ?? 0}` },{
                    name: 'Last Login', value: `${gamestatData.lastLogin ?? 'N/A'}`, inline: true },{
                    name: 'Player Since', value: `${gamestatData.playerSince ?? 'N/A'}`, inline: true },{
                    name: 'Time Played', value: `${TimeMinutesToString(gamestatData.timePlayedMinutes ?? 0)}`, inline: true },{
                    name: 'Time AFK', value: `${TimeMinutesToString(gamestatData.timeAFKMinutes ?? 0)}`, inline: true }
                )
                .setTimestamp()
                .setFooter({text: `${onlineMessage}`});

            await interaction.editReply({embeds: [embed]});
            
        } catch(error) {
            console.error('Database error in stats command:', error);
            await interaction.editReply(ERRORS.DATABASE_ERROR);
        }
    }
}
