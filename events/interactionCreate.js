const profileModel = require('../models/profileSchema');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client, Discord) {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            // Get user profile data (same as message commands)
            let profileData = await profileModel.findOne({ userId: interaction.user.id });
            if (!profileData) {
                let profile = await profileModel.create({
                    userId: interaction.user.id,
                    serverID: interaction.guild.id,
                    coins: 1000,
                    bank: 0,
                });
                profile.save();
                profileData = profile;
            }

            const options = {
                client,
                Discord,
                profileData
            };

            await command.execute(interaction, options);
        } catch (error) {
            console.error('Error executing slash command:', error);
            const errorMessage = 'There was an error while executing this command!';

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    },
};