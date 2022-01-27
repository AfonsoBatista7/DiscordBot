const serverStatsModel = require('../models/serverStatsSchema');
require('dotenv').config();

module.exports = {
    name: 'medals',
    aliases: ['me', 'playermedals', 'med', 'pm'],
    cooldown: 5,
    description: "Minecraft Server Medals of a player",
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
                .setTitle(`${args[0]} Medals`)
                .setColor('#ADFF2F')
                .setThumbnail(`https://minotar.net/helm/${args[0]}/100.png`)
                .setTimestamp()
                .setFooter({text: `${onlineMessage}`, iconURL: `attachment://${onlineIcon}`})
            
                for(const i in serverStatsData.medals) {    
                    embed.addFields({
                        name: `${serverStatsData.medals[i].medalName}`, value: `${serverStatsData.medals[i].medalLevel}`, inline: true}
                    )
                }

                message.channel.send({embeds: [embed], files: [attachment]});
            
            } catch(err) {
                console.log(err);
                message.channel.send(`:x: | The player **${args[0]}** never played on \`${process.env.MINECRAFT_SERVER_IP.split('.')[0]}\` server.`);
            }
        } catch(err_noArgs) {
            
            message.channel.send(':x: | You need to specify the name of a Player on the server (\`.medals <playerName>\`)');
        }
    }
}
