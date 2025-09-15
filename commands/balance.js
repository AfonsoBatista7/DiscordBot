const { SlashCommandBuilder } = require('@discordjs/builders');
const profileModel = require('../models/profileSchema');

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
        const profile = await profileModel.findOne({ userId: user.id });

        const embed = new Discord.MessageEmbed()
       .setColor('#DF2700')
       .setAuthor({name: '💰 Balance', iconURL: avatar})
       .setDescription(`💸 You have **${profile.coins}$** in your Wallet`)

       await interaction.reply({embeds: [embed]});
    }
}
