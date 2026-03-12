const platformstatsModel = require('../models/platformstatsSchema');
const identityModel = require('../models/identitySchema');
const userModel = require('../models/userSchema');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client, Discord) {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await interaction.deferReply();

            // Find or create Discord identity by externalId (Discord user ID)
            let discordIdentity = await identityModel.findOne({ externalId: interaction.user.id, provider: 'discord' });
            if (!discordIdentity) {
                const user = await userModel.create({});
                discordIdentity = await identityModel.create({
                    userId: user._id,
                    externalId: interaction.user.id,
                    username: interaction.user.username,
                    provider: 'discord',
                });
            }

            let platformstats = await platformstatsModel.findOne({ identityId: discordIdentity._id });
            if (!platformstats) {
                platformstats = await platformstatsModel.create({
                    identityId: discordIdentity._id,
                    balance: 1000,
                    numMessages: 0,
                });
                await platformstats.save();
            }

            // Find linked Minecraft identity (same physical userId)
            const mcIdentity = discordIdentity.userId
                ? await identityModel.findOne({ userId: discordIdentity.userId, provider: 'minecraft' })
                : null;

            const profileData = {
                userId: interaction.user.id,
                identityId: discordIdentity._id,
                physicalUserId: discordIdentity.userId,
                userName: discordIdentity.username,
                balance: platformstats.balance,
                coins: platformstats.balance,
                numMessages: platformstats.numMessages ?? 0,
                link: mcIdentity ? mcIdentity.externalId : null,
                mcUsername: mcIdentity ? mcIdentity.username : null,
                mcIdentityId: mcIdentity ? mcIdentity._id : null,
            };

            console.log('[interactionCreate] discordIdentity:', JSON.stringify(discordIdentity));
            console.log('[interactionCreate] platformstats:', JSON.stringify(platformstats));
            console.log('[interactionCreate] mcIdentity:', JSON.stringify(mcIdentity));
            console.log('[interactionCreate] profileData:', JSON.stringify(profileData));

            const options = {
                client,
                Discord,
                profileData
            };

            await command.execute(interaction, options);
        } catch (error) {
            console.error('Error executing slash command:', error);
            const errorMessage = 'There was an error while executing this command!';

            await interaction.editReply({ content: errorMessage });
        }
    },
};