const { SlashCommandBuilder } = require('@discordjs/builders');
const profileModel = require('../models/profileSchema');

const ERRORS = {
    INVALID_AMOUNT: ':x: | Please enter a valid amount',
    INSUFFICIENT_FUNDS: ':x: | You don\'t have enough coins :/'
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coin')
        .setDescription('Flip a coin and bet money')
        .addStringOption(option =>
            option.setName('side')
                .setDescription('Choose heads or tails')
                .setRequired(true)
                .addChoices(
                    { name: 'Heads', value: 'heads' },
                    { name: 'Tails', value: 'tails' }
                ))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount of money to bet')
                .setRequired(true)
                .setMinValue(1)),
    name: 'coin',
    aliases: ['c'],
    cooldown: 5,
    description: "Flip a coin",
    async execute(interaction, options) {
        const { client, Discord, profileData } = options;

        const headsTails = interaction.options.getString('side');
        const money = interaction.options.getInteger('amount');

        if (money <= 0) {
            await interaction.reply(ERRORS.INVALID_AMOUNT);
            return;
        }

        if (profileData.coins < money) {
            await interaction.reply(ERRORS.INSUFFICIENT_FUNDS);
            return;
        }

        // Game logic
        const randomNumber = Math.floor(Math.random() * 100);
        const avatar = interaction.user.displayAvatarURL({});

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
            await profileModel.findOneAndUpdate({userId: interaction.user.id}, {
                $inc: {
                    coins: coinChange,
                },
            });

            const embed = new Discord.MessageEmbed()
                .setColor('#DF2700')
                .setAuthor({name: `${result.toUpperCase()}!`, iconURL: avatar})
                .setDescription(mensagem);

            await interaction.reply({embeds: [embed]});
        } catch (error) {
            console.error('Database error in coin command:', error);
            await interaction.reply(':x: | Something went wrong, please try again');
        }
    }
}
