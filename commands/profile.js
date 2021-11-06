
module.exports = {
    name: 'profile',
    aliases: ['prof'],
    cooldown: 5,
    description: "User Profile",
    execute(message, args, client, Discord, profileData) {

        const user = message.mentions.users.first() || message.author;
        const avatar = user.displayAvatarURL({});

        const embed = new Discord.MessageEmbed()
       .setColor('#DF2700')
       .setThumbnail(avatar)
       .addFields({
           name: 'User ID', value: profileData.userId },{
           name: 'Name', value: profileData.userName },{
           name: 'Money', value: `**${profileData.coins}**$ :money_with_wings:` },{
           name: 'Número De Mensagens', value: profileData.numMessages }
           )
    
        message.channel.send(embed);
    }
}
