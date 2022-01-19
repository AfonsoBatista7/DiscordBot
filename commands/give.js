const profileModel = require('../models/profileSchema');

module.exports = {
    name: 'give',
    aliases: ['g', 'giv'],
    cooldown: 2,
    description: "Give money to an user",
    async execute(message, args, client, Discord, profileData) {
        
        const userAuthor = message.author, 
              userMentioned = message.mentions.users.first(), 
              avatar = userMentioned.displayAvatarURL({}), 
              value = Math.floor(args[1]);
        try{
            if(isNaN(val)) throw err;
            try {
                giverProfile = await profileModel.findOne({userId: userAuthor.id});
                if(giverProfile.coins < value) throw errNoCoins;
                try {
                    if(value<0) throw errNegative;
                    try {

                        await profileModel.findOneAndUpdate({userId: userAuthor.id},{ 
                            $inc: {
                                coins: -value,
                            }
                        });

                        await profileModel.findOneAndUpdate({userId: userMentioned.id},
                            {
                                $inc: {
                                    coins: value,
                                },
                            }
                        );
                    } catch(err2) {
                        console.log(err2);
                        message.channel.send(`:x: | <@${userMentioned.id}> have no profile yet...`); return;
                    }
                } catch(errNegative){
                    message.channel.send(':x: | Try a positive number :D.'); return;
                }
            } catch(errNoCoins) {
                message.channel.send(':x: | You don\'t have enought money bro.'); return;
            }
        } catch(err) {
            message.channel.send(':x: | Try -> give <user> <value>'); return;
        }

        const embed = new Discord.MessageEmbed()
            .setColor('#DF2700')
            .setAuthor({name: `Received from ${userAuthor.username}`, iconURL: avatar})
            .setDescription(`:moneybag: | ${userAuthor.username} gave +${value} :money_with_wings: to <@${userMentioned.id}>`);
        
            message.channel.send({embeds: [embed]});
    }
}