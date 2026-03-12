const { SlashCommandBuilder } = require('@discordjs/builders');
const identityModel = require('../models/identitySchema');
const platformstatsModel = require('../models/platformstatsSchema');

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

        let displayData;

        if (user.id === interaction.user.id) {
            displayData = profileData;
        } else {
            // Look up the mentioned user by their Discord ID (externalId)
            const discordIdentity = await identityModel.findOne({ externalId: user.id, provider: 'discord' });
            if (!discordIdentity) {
                await interaction.editReply(`:x: | <@${user.id}> doesn't have a profile yet.`);
                return;
            }

            const platformstats = await platformstatsModel.findOne({ identityId: discordIdentity._id });
            const mcIdentity = discordIdentity.userId
                ? await identityModel.findOne({ userId: discordIdentity.userId, provider: 'minecraft' })
                : null;

            displayData = {
                userId: user.id,
                userName: discordIdentity.username,
                balance: platformstats?.balance ?? 0,
                numMessages: platformstats?.numMessages ?? 0,
                mcUsername: mcIdentity?.username || null,
            };
        }

        const embed = new Discord.MessageEmbed()
           .setColor('#DF2700')
           .setThumbnail(avatar)
           .addFields(
               { name: 'User ID', value: `${displayData.userId}` },
               { name: 'Name', value: `${displayData.userName}` },
               { name: 'Money', value: `**${displayData.balance}**$ :money_with_wings:` },
               { name: 'Number of Messages', value: `${displayData.numMessages}` },
               { name: 'Minecraft Account', value: displayData.mcUsername || '???' },
           );

        await interaction.editReply({ embeds: [embed] });
    }
}
