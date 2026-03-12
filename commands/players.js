const { SlashCommandBuilder } = require('@discordjs/builders');
const gamestatModel = require('../models/gamestatSchema');
const identityModel = require('../models/identitySchema');
const serversModel = require('../models/serversSchema');

const PLAYERS_PER_PAGE = 25;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('players')
        .setDescription('Shows all Minecraft server players'),
    name: 'players',
    aliases: ['serverplayers', 'p'],
    cooldown: 5,
    description: "Shows all Minecraft server players",
    async execute(interaction, options) {
        const { Discord } = options;

        try {
            const servers = await serversModel.find();

            if (servers.length === 0) {
                await interaction.editReply(':x: | No servers found in the database.');
                return;
            }

            if (servers.length === 1) {
                await showPlayerList(interaction, Discord, servers[0]);
                return;
            }

            // Multiple servers — show a select menu
            const selectMenu = new Discord.MessageSelectMenu()
                .setCustomId('server_select')
                .setPlaceholder('Choose a server...')
                .addOptions(servers.map(s => ({
                    label: s.name || s.ip,
                    description: `${s.ip} · ${s.status ? '🟢 Online' : '🔴 Offline'}`,
                    value: String(s._id),
                })));

            const response = await interaction.editReply({
                content: 'Select a server to view its players:',
                components: [new Discord.MessageActionRow().addComponents(selectMenu)],
                fetchReply: true,
            });

            const collector = response.createMessageComponentCollector({
                componentType: 'SELECT_MENU',
                time: 30000,
            });

            collector.on('collect', async (selectInteraction) => {
                if (selectInteraction.user.id !== interaction.user.id) {
                    await selectInteraction.reply({ content: 'This menu is not for you!', ephemeral: true });
                    return;
                }
                const server = servers.find(s => String(s._id) === selectInteraction.values[0]);
                await selectInteraction.deferUpdate();
                await showPlayerList(interaction, Discord, server);
            });

            collector.on('end', (_, reason) => {
                if (reason === 'time') {
                    interaction.editReply({ content: 'Server selection timed out.', components: [] }).catch(() => {});
                }
            });

        } catch (error) {
            console.error('Error in players command:', error);
            await interaction.editReply(':x: | Something went wrong while fetching players.');
        }
    }
};

async function showPlayerList(interaction, Discord, server) {
    const [allGameStats, allIdentities] = await Promise.all([
        gamestatModel.find({ serverId: String(server._id) }).sort({ timePlayedMinutes: -1 }),
        identityModel.find({ provider: 'minecraft' }),
    ]);

    const identityMap = {};
    allIdentities.forEach(id => { identityMap[String(id._id)] = id.username || 'Unknown'; });

    if (allGameStats.length === 0) {
        await interaction.editReply({ content: `No players found on **${server.name}**.`, components: [] });
        return;
    }

    let currentPage = 0;
    const totalPages = Math.ceil(allGameStats.length / PLAYERS_PER_PAGE);

    const createEmbed = (page) => {
        const startIndex = page * PLAYERS_PER_PAGE;
        const endIndex = Math.min(startIndex + PLAYERS_PER_PAGE, allGameStats.length);
        const playersOnPage = allGameStats.slice(startIndex, endIndex);

        const embed = new Discord.MessageEmbed()
            .setTitle(`${server.name} — Players (Page ${page + 1}/${totalPages})`)
            .setColor('#ADFF2F')
            .setFooter({ text: `Showing ${startIndex + 1}-${endIndex} of ${allGameStats.length} players` });

        for (const player of playersOnPage) {
            embed.addFields({
                name: identityMap[String(player.identityId)] || 'Unknown',
                value: `Since: ${player.playerSince ?? 'N/A'}`,
                inline: true,
            });
        }

        return embed;
    };

    const createButtons = (page) => new Discord.MessageActionRow().addComponents(
        new Discord.MessageButton()
            .setCustomId('prev')
            .setLabel('◀️ Previous')
            .setStyle('SECONDARY')
            .setDisabled(page === 0),
        new Discord.MessageButton()
            .setCustomId('next')
            .setLabel('Next ▶️')
            .setStyle('SECONDARY')
            .setDisabled(page === totalPages - 1),
    );

    const response = await interaction.editReply({
        content: null,
        embeds: [createEmbed(currentPage)],
        components: totalPages > 1 ? [createButtons(currentPage)] : [],
        fetchReply: true,
    });

    if (totalPages <= 1) return;

    const collector = response.createMessageComponentCollector({
        componentType: 'BUTTON',
        time: 60000,
    });

    collector.on('collect', async (btn) => {
        if (btn.user.id !== interaction.user.id) {
            await btn.reply({ content: 'These buttons are not for you!', ephemeral: true });
            return;
        }

        if (btn.customId === 'prev') currentPage = Math.max(0, currentPage - 1);
        else if (btn.customId === 'next') currentPage = Math.min(totalPages - 1, currentPage + 1);

        await btn.update({ embeds: [createEmbed(currentPage)], components: [createButtons(currentPage)] });
    });

    collector.on('end', () => {
        const disabledRow = new Discord.MessageActionRow().addComponents(
            new Discord.MessageButton().setCustomId('prev').setLabel('◀️ Previous').setStyle('SECONDARY').setDisabled(true),
            new Discord.MessageButton().setCustomId('next').setLabel('Next ▶️').setStyle('SECONDARY').setDisabled(true),
        );
        response.edit({ components: [disabledRow] }).catch(() => {});
    });
}
