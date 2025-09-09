const profileModel = require('../models/profileSchema');

module.exports = {
    name: 'coin',
    aliases: ['c'],
    cooldown: 5,
    description: "Flip a coin",
    async execute(message, args, client, Discord, profileData) {
        try {
            if(args.length<=2) throw errCommand

            let money = Math.floor(args[1]);
            const headsTails = args[0].toLowerCase();

            if(headsTails!='heads' && headsTails!='tails') throw errCommand;

            if(profileData.coins<money) throw errNoMoney;

            const randomNumber = Math.floor(Math.random() * 100);
            const avatar = message.author.displayAvatarURL({});

            const coin = {
                HEADS: 'heads',
                TAILS: 'tails'
            }

        } catch(errCommand) {
            message.channel.send(' :x: | Try **!coin** <heads/tails> <money>'); return;
        } catch(errNoMoney) {
            message.channel.send(' :x: | You don\'t have enough coins :/'); return;
        }
        
        let message, result;
        if(randomNumber < 50) /*LOST*/ {
            
            result = headsTails === coin.HEADS ? coin.TAILS : coin.HEADS;
            
            mensagem = `🪙 | The coin landed on ${result} You lost :c...\n\n **${-money}** :money_with_wings:`;

        } else /*WON*/ {
            result = headsTails;
            mensagem = `🪙 | **YOU WIN** The coin landed on ${result}\n\n **+${money*2}** :money_with_wings:`;  
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
            .setAuthor({name: `${result.toUpperCase()}!`, iconURL: avatar})
            .setDescription(mensagem);
        
        message.channel.send({embeds: [embed]});
    }
}
