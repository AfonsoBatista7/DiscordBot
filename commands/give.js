const profileModel = require('../models/profileSchema');

const ERRORS = {
    INVALID_COMMAND: ':x: | Try -> `.give <user> <value>`',
    INVALID_AMOUNT: ':x: | Please enter a valid positive number',
    INSUFFICIENT_FUNDS: ':x: | You don\'t have enough money bro.',
    NO_USER_MENTIONED: ':x: | You need to mention a user to give money to',
    USER_NO_PROFILE: (userId) => `:x: | <@${userId}> doesn't have a profile yet...`,
    DATABASE_ERROR: ':x: | Something went wrong, please try again'
};

module.exports = {
    name: 'give',
    aliases: ['g', 'giv'],
    cooldown: 2,
    description: "Give money to an user",
    async execute(message, options) {
        const { args, client, Discord } = options;
        
        // Validate user mention
        const userMentioned = message.mentions.users.first();
        if (!userMentioned) {
            message.channel.send(ERRORS.NO_USER_MENTIONED);
            return;
        }

        // Validate amount
        if (args.length < 2) {
            message.channel.send(ERRORS.INVALID_COMMAND);
            return;
        }

        const value = Math.floor(args[1]);
        if (isNaN(value) || value <= 0) {
            message.channel.send(ERRORS.INVALID_AMOUNT);
            return;
        }

        try {
            // Get the author's profile to check balance
            const authorProfile = await profileModel.findOne({ userId: message.author.id });
            if (!authorProfile || authorProfile.coins < value) {
                message.channel.send(ERRORS.INSUFFICIENT_FUNDS);
                return;
            }

            // Transfer money
            await profileModel.findOneAndUpdate({userId: message.author.id}, { 
                $inc: {
                    coins: -value,
                }
            });

            await profileModel.findOneAndUpdate({userId: userMentioned.id}, {
                $inc: {
                    coins: value,
                }
            });

            // Success message
            const avatar = userMentioned.displayAvatarURL({});
            const embed = new Discord.MessageEmbed()
                .setColor('#DF2700')
                .setAuthor({name: `Received from ${message.author.username}`, iconURL: avatar})
                .setDescription(`💰 | ${message.author.username} gave +${value} 💸 to <@${userMentioned.id}>`);
            
            message.channel.send({embeds: [embed]});

        } catch(error) {
            // Check if error is because recipient has no profile
            if (error.message && error.message.includes('null')) {
                message.channel.send(ERRORS.USER_NO_PROFILE(userMentioned.id));
            } else {
                console.error('Database error in give command:', error);
                message.channel.send(ERRORS.DATABASE_ERROR);
            }
        }
    }
}
