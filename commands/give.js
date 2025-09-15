const { SlashCommandBuilder } = require('@discordjs/builders');
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
    data: new SlashCommandBuilder()
        .setName('give')
        .setDescription('Give money to another user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to give money to')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount of money to give')
                .setRequired(true)
                .setMinValue(1)),
    name: 'give',
    aliases: ['g', 'giv'],
    cooldown: 2,
    description: "Give money to an user",
    async execute(interaction, options) {
        const { client, Discord } = options;

        const userMentioned = interaction.options.getUser('user');
        const value = interaction.options.getInteger('amount');

        if (value <= 0) {
            await interaction.reply(ERRORS.INVALID_AMOUNT);
            return;
        }

        try {
            // Get the author's profile to check balance
            const authorProfile = await profileModel.findOne({ userId: interaction.user.id });
            if (!authorProfile || authorProfile.coins < value) {
                await interaction.reply(ERRORS.INSUFFICIENT_FUNDS);
                return;
            }

            // Transfer money
            await profileModel.findOneAndUpdate({userId: interaction.user.id}, {
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
                .setAuthor({name: `Received from ${interaction.user.username}`, iconURL: avatar})
                .setDescription(`💰 | ${interaction.user.username} gave +${value} 💸 to <@${userMentioned.id}>`);

            await interaction.reply({embeds: [embed]});

        } catch(error) {
            // Check if error is because recipient has no profile
            if (error.message && error.message.includes('null')) {
                await interaction.reply(ERRORS.USER_NO_PROFILE(userMentioned.id));
            } else {
                console.error('Database error in give command:', error);
                await interaction.reply(ERRORS.DATABASE_ERROR);
            }
        }
    }
}
