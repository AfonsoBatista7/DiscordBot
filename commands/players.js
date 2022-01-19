const serverStatsModel = require('../models/serverStatsSchema');
require('dotenv').config();

module.exports = {
    name: 'players',
    aliases: ['serverplayers', 'p'],
    cooldown: 5,
    description: "Minecraft Server Stats of a player",
    async execute(message, args, client, Discord, profileData) {
                
                serverStatsData = await serverStatsModel.find()
                
                const embed = new Discord.MessageEmbed()
                .setTitle(`All Players`)
                .setColor('#DF2700')

                for(const i in serverStatsData){
                    embed.addFields({
                        name: `${serverStatsData[i].name}`, value: `${serverStatsData[i].playerSince}`, inline: true }
                    )
                }
            
                message.channel.send({embeds: [embed]});
        
    }
}
