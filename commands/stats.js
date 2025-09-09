const serverStatsModel = require('../models/serverStatsSchema');
require('dotenv').config();

const ERRORS = {
    NO_PLAYER_NAME: ':x: | You need to specify the name of a Player on the server (`.stats <playerName>`)',
    PLAYER_NOT_FOUND: (playerName) => `:x: | The player **${playerName}** never played on this Minecraft server.`,
    DATABASE_ERROR: ':x: | Something went wrong, please try again'
};

module.exports = {
    name: 'stats',
    aliases: ['serverstats', 'minestats'],
    cooldown: 5,
    description: "Minecraft Server Stats of a player",
    async execute(message, args, client, Discord, profileData) {
        let playerName;
        let serverStatsData;

        try {
            // Determine player name
            if (args.length === 0) {
                if (profileData.link != null) {
                    serverStatsData = 
                        await serverStatsModel.findOne({link: profileData.userId});

                    if(!serverStatsData) throw error;
                    playerName = serverStatsData.name;
                } else {
                    message.channel.send(ERRORS.NO_PLAYER_NAME);
                    return;
                }
            } else {
                playerName = args[0];
                serverStatsData = 
                    await serverStatsModel.findOne({name: playerName})
            }
                

            if (!serverStatsData) {
                message.channel.send(ERRORS.PLAYER_NOT_FOUND(playerName));
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
                    name: 'Time Played', value: `${serverStatsData.timePlayed}` , inline: true}
                )
                .setTimestamp()
                .setFooter({text: `${onlineMessage}`});
            
            message.channel.send({embeds: [embed]});
            
        } catch(error) {
            console.error('Database error in stats command:', error);
            message.channel.send(ERRORS.DATABASE_ERROR);
        }
    }
}
