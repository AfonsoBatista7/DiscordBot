
module.exports = {
    name: 'profile',
    aliases: ['prof'],
    cooldown: 5,
    description: "User Profile",
    async execute(message, args, client, Discord, profileData) {
        const user = message.mentions.users.first() || message.author;
        const avatar = user.displayAvatarURL({});

        const embed = new Discord.MessageEmbed()
       .setColor('#DF2700')
       .setThumbnail(avatar)
       .addFields({
           name: 'User ID', value: `${profileData.userId}` },{
           name: 'Name', value: `${profileData.userName}` },{
           name: 'Money', value: `**${profileData.coins}**$ :money_with_wings:` },{
           name: 'Número De Mensagens', value: `${profileData.numMessages}` }
           )

        if(profileData.link!=null) {
            serverStatsData = await serverStatsModel.findOne({link: profileData.userId});

            if(!serverStatsData) throw err;

            embed.addFields({name: 'Minecraft Account', value: `${serverStatsData.name}`})
        } else {
            embed.addFields({name: 'Minecraft Account', value: '???'})
        }

    
        message.channel.send({embeds: [embed]});
    }
}
