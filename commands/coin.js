const profileModel = require('../models/profileSchema');

module.exports = {
    name: 'coin',
    aliases: ['c'],
    cooldown: 5,
    description: "Flip a coin",
    async execute(message, args, client, Discord, profileData) {

        const randomNumber = Math.floor(Math.random() * 100);
        const avatar = message.author.displayAvatarURL({});

        let money = args[1];
        const headsTails = args[0].toLowerCase();

        const coin = {
            HEADS: 'heads',
            TAILS: 'tails'
        }

        try {
            if(profileData.coins<money) throw err2;

            try {
                if(headsTails!='heads' && headsTails!='tails') throw err;
            } catch(err) {
                message.channel.send(' :x: | Try **!coin** <heads/tails> <money>'); return;
            }


        } catch(err2) {
            message.channel.send(' :x: | You don\'t have enough coins :/'); return;
        }
        
        
        
        let mensagem, result;
        if(randomNumber < 50) /*LOST*/ {
            
            if(headsTails === coin.HEADS)
                result = coin.TAILS;
            else
                result = coin.HEADS;
            
            money = -money;
            mensagem = `:coin: | The coin landed on ${result} You lost :c...\n\n **${money}** :money_with_wings:`;

        } else /*WON*/ {
            result = headsTails;
            mensagem = `:coin: | **YOU WIN** The coin landed on ${result}\n\n **+${money*2}** :money_with_wings:`;  
        }

        await profileModel.findOneAndUpdate({userId: message.author.id},
            {
                $inc: {
                    coins: money,
                },
            }
        );

        const embed = new Discord.MessageEmbed()
            .setColor('#DF2700')
            .setAuthor(`${result.toUpperCase()}!`, avatar)
            .setDescription(mensagem);
        
        message.channel.send(embed);

    }
}