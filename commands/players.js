const { SlashCommandBuilder } = require('@discordjs/builders');
const gamestatModel = require('../models/gamestatSchema');
const identityModel = require('../models/identitySchema');
require('dotenv').config();

const PLAYERS_PER_PAGE = 25;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('players')
        .setDescription('Shows all Minecraft server players with pagination'),
    name: 'players',
    aliases: ['serverplayers', 'p'],
    cooldown: 5,
    description: "Shows all Minecraft server players with pagination",
    async execute(interaction, options) {
        const { client, Discord } = options;
        
        try {
            const [allGameStats, allIdentities] = await Promise.all([
                gamestatModel.find().sort({ timePlayedMinutes: -1 }),
                identityModel.find({ provider: 'minecraft' }),
            ]);

            const identityMap = {};
            allIdentities.forEach(id => { identityMap[String(id._id)] = id.username || 'Unknown'; });

            if (allGameStats.length === 0) {
                await interaction.editReply('No players found on the server.');
                return;
            }

            let currentPage = 0;
            const totalPages = Math.ceil(allGameStats.length / PLAYERS_PER_PAGE);

            const createEmbed = (page) => {
                const startIndex = page * PLAYERS_PER_PAGE;
                const endIndex = Math.min(startIndex + PLAYERS_PER_PAGE, allGameStats.length);
                const playersOnPage = allGameStats.slice(startIndex, endIndex);

                const embed = new Discord.MessageEmbed()
                    .setTitle(`All Players (Page ${page + 1}/${totalPages})`)
                    .setColor('#ADFF2F')
                    .setFooter({ text: `Showing ${startIndex + 1}-${endIndex} of ${allGameStats.length} players` });

                for (const player of playersOnPage) {
                    embed.addFields({
                        name: `${identityMap[String(player.identityId)] || 'Unknown'}`,
                        value: `Since: ${player.playerSince ?? 'N/A'}`,
                        inline: true
                    });
                }

                return embed;
            };

            const createButtons = (page) => {
                return new Discord.MessageActionRow()
                    .addComponents(
                        new Discord.MessageButton()
                            .setCustomId('previous')
                            .setLabel('◀️ Previous')
                            .setStyle('SECONDARY')
                            .setDisabled(page === 0),
                        new Discord.MessageButton()
                            .setCustomId('next')
                            .setLabel('Next ▶️')
                            .setStyle('SECONDARY')
                            .setDisabled(page === totalPages - 1)
                    );
            };

            const embed = createEmbed(currentPage);
            const row = createButtons(currentPage);

            const response = await interaction.editReply({
                embeds: [embed],
                components: totalPages > 1 ? [row] : [],
                fetchReply: true
            });

            if (totalPages > 1) {
                const collector = response.createMessageComponentCollector({
                    time: 60000 // 1 minute timeout
                });

                collector.on('collect', async (buttonInteraction) => {
                    if (buttonInteraction.user.id !== interaction.user.id) {
                        await buttonInteraction.reply({ content: 'These buttons are not for you!', ephemeral: true });
                        return;
                    }

                    if (buttonInteraction.customId === 'previous') {
                        currentPage = Math.max(0, currentPage - 1);
                    } else if (buttonInteraction.customId === 'next') {
                        currentPage = Math.min(totalPages - 1, currentPage + 1);
                    }

                    const newEmbed = createEmbed(currentPage);
                    const newRow = createButtons(currentPage);

                    await buttonInteraction.update({
                        embeds: [newEmbed],
                        components: [newRow]
                    });
                });

                collector.on('end', () => {
                    // Disable buttons after timeout
                    const disabledRow = new Discord.MessageActionRow()
                        .addComponents(
                            new Discord.MessageButton()
                                .setCustomId('previous')
                                .setLabel('◀️ Previous')
                                .setStyle('SECONDARY')
                                .setDisabled(true),
                            new Discord.MessageButton()
                                .setCustomId('next')
                                .setLabel('Next ▶️')
                                .setStyle('SECONDARY')
                                .setDisabled(true)
                        );

                    response.edit({ components: [disabledRow] }).catch(() => {});
                });
            }

        } catch (error) {
            console.error('Error in players command:', error);
            await interaction.editReply(':x: | Something went wrong while fetching players.');
        }
    }
}
