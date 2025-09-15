const { SlashCommandBuilder } = require('@discordjs/builders');
const serverStatsModel = require('../models/serverStatsSchema');

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
           name: 'Money', value: `**${profileData.coins}**$ :money_with_wings:` },{
           name: 'Number of Messages', value: `${profileData.numMessages}` }
           )

        if(profileData.link!=null) {
            serverStatsData = await serverStatsModel.findOne({link: profileData.userId});

            if(!serverStatsData) throw err;

            embed.addFields({name: 'Minecraft Account', value: `${serverStatsData.name}`})
        } else {
            embed.addFields({name: 'Minecraft Account', value: '???'})
        }

    
        await interaction.reply({embeds: [embed]});
    }
}
