const serverStatsModel = require('../models/serverStatsSchema');
require('dotenv').config();

const PLAYERS_PER_PAGE = 25;

module.exports = {
    name: 'players',
    aliases: ['serverplayers', 'p'],
    cooldown: 5,
    description: "Shows all Minecraft server players with pagination",
    async execute(message, options) {
        const { args, client, Discord } = options;
        
        try {
            const allPlayers = await serverStatsModel.find().sort({ timePlayed: -1 });
            
            if (allPlayers.length === 0) {
                message.channel.send('No players found on the server.');
                return;
            }

            let currentPage = 0;
            const totalPages = Math.ceil(allPlayers.length / PLAYERS_PER_PAGE);

            const createEmbed = (page) => {
                const startIndex = page * PLAYERS_PER_PAGE;
                const endIndex = Math.min(startIndex + PLAYERS_PER_PAGE, allPlayers.length);
                const playersOnPage = allPlayers.slice(startIndex, endIndex);

                const embed = new Discord.MessageEmbed()
                    .setTitle(`All Players (Page ${page + 1}/${totalPages})`)
                    .setColor('#ADFF2F')
                    .setFooter({ text: `Showing ${startIndex + 1}-${endIndex} of ${allPlayers.length} players` });

                for (const player of playersOnPage) {
                    embed.addFields({
                        name: `${player.name}`, 
                        value: `Since: ${player.playerSince}`, 
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

            const response = await message.channel.send({
                embeds: [embed],
                components: totalPages > 1 ? [row] : []
            });

            if (totalPages > 1) {
                const collector = response.createMessageComponentCollector({
                    time: 60000 // 1 minute timeout
                });

                collector.on('collect', async (interaction) => {
                    if (interaction.user.id !== message.author.id) {
                        await interaction.reply({ content: 'These buttons are not for you!', ephemeral: true });
                        return;
                    }

                    if (interaction.customId === 'previous') {
                        currentPage = Math.max(0, currentPage - 1);
                    } else if (interaction.customId === 'next') {
                        currentPage = Math.min(totalPages - 1, currentPage + 1);
                    }

                    const newEmbed = createEmbed(currentPage);
                    const newRow = createButtons(currentPage);

                    await interaction.update({
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
            message.channel.send(':x: | Something went wrong while fetching players.');
        }
    }
}
