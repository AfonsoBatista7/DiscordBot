const serverStatsModel = require('../models/serverStatsSchema');
require('dotenv').config();

module.exports = {
    name: 'stats',
    aliases: ['serverstats', 'minestats'],
    cooldown: 5,
    description: "Minecraft Server Stats of a player",
    async execute(message, args, client, Discord, profileData) {

        try{
            if(args[0]==null) throw err_noArgs;
            try{
                
                serverStatsData = await serverStatsModel.findOne({name: args[0]})
                
                if(!serverStatsData) throw err;
                
                
                let onlineMessage = serverStatsData.online ? "Online" : "Offline" ;
                let onlineIcon = serverStatsData.online ? "large-green-circle.png"
                                : "large-red-circle.png" ;

                const attachment = new Discord.MessageAttachment(`images/${onlineIcon}`);
                const embed = new Discord.MessageEmbed()
                .setTitle(`${args[0]} Stats`)
                .setColor('#ADFF2F')
                .setThumbnail(`https://minotar.net/helm/${args[0]}/100.png`)
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
                .setFooter({text: `${onlineMessage}`, iconURL: `attachment://${onlineIcon}`})
            
                message.channel.send({embeds: [embed], files: [attachment]});
            
            } catch(err) {
                console.log(err);
                message.channel.send(`:x: | The player **${args[0]}** never played on \`${process.env.MINECRAFT_SERVER_IP.split('.')[0]}\` server.`);
            }
        } catch(err_noArgs) {
            
            message.channel.send(':x: | You need to specify the name of a Player on the server (\`.stats <playerName>\`)');
        }
    }
}
