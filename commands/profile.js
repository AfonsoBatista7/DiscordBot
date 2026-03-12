const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View your or another user\'s profile')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to view profile for')
                .setRequired(false)),
    name: 'profile',
    aliases: ['prof'],
    cooldown: 5,
    description: "User Profile",
    async execute(interaction, options) {
        const { client, Discord, profileData } = options;
        const user = interaction.options.getUser('user') || interaction.user;
        const avatar = user.displayAvatarURL({});

        const embed = new Discord.MessageEmbed()
           .setColor('#DF2700')
           .setThumbnail(avatar)
           .addFields({
               name: 'User ID', value: `${profileData.userId}` },{
               name: 'Name', value: `${profileData.userName}` },{
               name: 'Money', value: `**${profileData.balance}**$ :money_with_wings:` },{
               name: 'Number of Messages', value: `${profileData.numMessages}` }
           );

        embed.addFields({
            name: 'Minecraft Account',
            value: profileData.mcUsername || '???'
        });

        await interaction.editReply({embeds: [embed]});
    }
}
