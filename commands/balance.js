const profileModel = require('../models/profileSchema');

module.exports = {
    name: 'balance',
    aliases: ['bal', 'balen', 'bale', 'bl'],
    cooldown: 2,
    description: "Prints the user balance",
    async execute(message, args, client, Discord, profileData) {

        const user = message.mentions.users.first() || message.author;
        const avatar = user.displayAvatarURL({});
        const profile = await profileModel.findOne({ userId: user.id });

        const embed = new Discord.MessageEmbed()
       .setColor('#DF2700')
       .setAuthor({name: '💰 Balance', iconURL: avatar})
       .setDescription(`💸 You have **${profile.coins}$** in your Wallet`)
    
       message.channel.send({embeds: [embed]});
    }
}
