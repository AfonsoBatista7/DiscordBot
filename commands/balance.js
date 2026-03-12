const { SlashCommandBuilder } = require('@discordjs/builders');
const platformstatsModel = require('../models/platformstatsSchema');
const identityModel = require('../models/identitySchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your or another user\'s balance')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to check balance for')
                .setRequired(false)),
    name: 'balance',
    aliases: ['bal', 'balen', 'bale', 'bl'],
    cooldown: 2,
    description: "Prints the user balance",
    async execute(interaction, options) {
        const { client, Discord, profileData } = options;

        const user = interaction.options.getUser('user') || interaction.user;
        const avatar = user.displayAvatarURL({});

        let balance;
        if (user.id === interaction.user.id) {
            balance = profileData.balance;
        } else {
            const identity = await identityModel.findOne({ externalId: user.id, provider: 'discord' });
            const platformstats = identity ? await platformstatsModel.findOne({ identityId: identity._id }) : null;
            balance = platformstats ? platformstats.balance : 0;
        }

        const embed = new Discord.MessageEmbed()
           .setColor('#DF2700')
           .setAuthor({name: '💰 Balance', iconURL: avatar})
           .setDescription(`💸 You have **${balance}$** in your Wallet`);

        await interaction.editReply({embeds: [embed]});
    }
}
