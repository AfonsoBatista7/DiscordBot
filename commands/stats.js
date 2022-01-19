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
                
                
                let onlineMessage = serverStatsData.online ? ":green_circle: Online" : ":red_circle: Offline" ;

                const embed = new Discord.MessageEmbed()
                .setColor('#DF2700')
                .setThumbnail(`https://minotar.net/helm/${args[0]}/100.png`)
                .addFields({
                    name: 'Name', value: `${serverStatsData.name}` },{
                    name: 'Blocks Destroyed', value: `${serverStatsData.blcksDestroyed}` },{
                    name: 'Blocks Placed', value: `${serverStatsData.blcksPlaced}` },{
                    name: 'Blocks Mined', value: `${serverStatsData.blockMined}` },{
                    name: 'Kills', value: `${serverStatsData.kills}` },{
                    name: 'Mob Kills', value: `${serverStatsData.mobKills}` },{
                    name: 'Deaths', value: `${serverStatsData.deaths}` },{
                    name: 'Fish Caught', value: `${serverStatsData.fishCaught}` },{
                    name: 'Times Login', value: `${serverStatsData.timeslogin}` },{
                    name: 'Last Login', value: `${serverStatsData.lastLogin}` },{
                    name: 'Player Since', value: `${serverStatsData.playerSince}` },{
                    name: 'Time Played', value: `${serverStatsData.timePlayed}` },{
                    name: 'Status', value: `${onlineMessage}` }
                )
            
                message.channel.send({embeds: [embed]});
            
            } catch(err) {
                message.channel.send(`:x: | The player **${args[0]}** never played on \`${process.env.MINECRAFT_SERVER_IP.split('.')[0]}\` server.`);
            }
        } catch(err_noArgs) {
            message.channel.send(':x: | You need to specify the name of a Player on the server (\`.stats <playerName>\`)');
        }
    }
}
