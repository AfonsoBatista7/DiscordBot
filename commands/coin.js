const profileModel = require('../models/profileSchema');

const ERRORS = {
    INVALID_COMMAND: ':x: | Try **.coin** <heads/tails> <money>',
    INVALID_AMOUNT: ':x: | Please enter a valid amount',
    INSUFFICIENT_FUNDS: ':x: | You don\'t have enough coins :/'
};

module.exports = {
    name: 'coin',
    aliases: ['c'],
    cooldown: 5,
    description: "Flip a coin",
    async execute(message, args, client, Discord, profileData) {
        // Validate input
        if (args.length < 2) {
            message.channel.send(ERRORS.INVALID_COMMAND);
            return;
        }

        const headsTails = args[0].toLowerCase();
        if (headsTails !== 'heads' && headsTails !== 'tails') {
            message.channel.send(ERRORS.INVALID_COMMAND);
            return;
        }

        const money = Math.floor(args[1]);
        if (isNaN(money) || money <= 0) {
            message.channel.send(ERRORS.INVALID_AMOUNT);
            return;
        }

        if (profileData.coins < money) {
            message.channel.send(ERRORS.INSUFFICIENT_FUNDS);
            return;
        }

        // Game logic
        const randomNumber = Math.floor(Math.random() * 100);
        const avatar = message.author.displayAvatarURL({});

        const coin = {
            HEADS: 'heads',
            TAILS: 'tails'
        };
        
        let mensagem, result, coinChange;
        if(randomNumber < 50) /*LOST*/ {
            result = headsTails === coin.HEADS ? coin.TAILS : coin.HEADS;
            mensagem = `🪙 | The coin landed on ${result} You lost :c...\n\n **-${money}** :money_with_wings:`;
            coinChange = -money;
        } else /*WON*/ {
            result = headsTails;
            mensagem = `🪙 | **YOU WIN** The coin landed on ${result}\n\n **+${money*2}** :money_with_wings:`;
            coinChange = money; // Won, so they get double (keep their bet + win same amount)
        }

        try {
            await profileModel.findOneAndUpdate({userId: message.author.id}, {
                $inc: {
                    coins: coinChange,
                },
            });

            const embed = new Discord.MessageEmbed()
                .setColor('#DF2700')
                .setAuthor({name: `${result.toUpperCase()}!`, iconURL: avatar})
                .setDescription(mensagem);
            
            message.channel.send({embeds: [embed]});
        } catch (error) {
            console.error('Database error in coin command:', error);
            message.channel.send(':x: | Something went wrong, please try again');
        }
    }
}
