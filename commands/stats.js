const { SlashCommandBuilder } = require('@discordjs/builders');
const serverStatsModel = require('../models/serverStatsSchema');
require('dotenv').config();

const ERRORS = {
    NO_PLAYER_NAME: ':x: | You need to specify the name of a Player on the server (`.stats <playerName>`)',
    PLAYER_NOT_FOUND: (playerName) => `:x: | The player **${playerName}** never played on this Minecraft server.`,
    DATABASE_ERROR: ':x: | Something went wrong, please try again'
};

function TimePlayedMinutesToString(timePlayedMinutes) {
    let hours = Math.floor(timePlayedMinutes/60);
    let minutes = (timePlayedMinutes % 60);

    return minutes==0 ? `${hours} Hours` : `${hours} Hr ${minutes} Min`;
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
        const { client, Discord, profileData } = options;
        let playerName;
        let serverStatsData;

        try {
            // Get player name from slash command option or use linked profile
            const playerOption = interaction.options.getString('player');

            if (!playerOption) {
                if (profileData.link != null) {
                    serverStatsData =
                        await serverStatsModel.findOne({link: profileData.userId});

                    if(!serverStatsData) throw error;
                    playerName = serverStatsData.name;
                } else {
                    await interaction.reply(ERRORS.NO_PLAYER_NAME);
                    return;
                }
            } else {
                playerName = playerOption;
                serverStatsData =
                    await serverStatsModel.findOne({name: playerName})
            }
                

            if (!serverStatsData) {
                await interaction.reply(ERRORS.PLAYER_NOT_FOUND(playerName));
                return;
            }

            let onlineMessage = serverStatsData.online ? "🟢 Online" : "🔴 Offline";

            const embed = new Discord.MessageEmbed()
                .setTitle(`${playerName} Stats`)
                .setColor('#ADFF2F')
                .setThumbnail(`https://minotar.net/helm/${playerName}/100.png`)
                .addFields({
                    name: 'Name', value: `${serverStatsData.name}` },{
                    name: 'Blocks Placed', value: `${serverStatsData.blcksPlaced}`, inline: true },{
                    name: 'Blocks Destroyed', value: `${serverStatsData.blcksDestroyed}`, inline: true },{
                    name: 'Blocks Mined', value: `${serverStatsData.blockMined}` , inline: true},{
                    name: 'Kills', value: `${serverStatsData.kills}`, inline: true },{
                    name: 'Mob Kills', value: `${serverStatsData.mobKills}` , inline: true},{
                    name: 'Deaths', value: `${serverStatsData.deaths}` , inline: true},{
                    name: 'Fish Caught', value: `${serverStatsData.fishCaught}` },{
                    name: 'Times Login', value: `${serverStatsData.timeslogin}` },{
                    name: 'Last Login', value: `${serverStatsData.lastLogin}` , inline: true},{
                    name: 'Player Since', value: `${serverStatsData.playerSince}` , inline: true},{
                    name: 'Time Played', value: `${TimePlayedMinutesToString(serverStatsData.timePlayedMinutes)}` , inline: true}
                )
                .setTimestamp()
                .setFooter({text: `${onlineMessage}`});

            await interaction.reply({embeds: [embed]});
            
        } catch(error) {
            console.error('Database error in stats command:', error);
            await interaction.reply(ERRORS.DATABASE_ERROR);
        }
    }
}
