const { SlashCommandBuilder } = require('@discordjs/builders');
const serversModel = require('../models/serversSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Get information about the Minecraft servers')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the server to get details for')
                .setRequired(false)),
    name: 'server',
    aliases: ['serv', 'ser'],
    cooldown: 10,
    description: 'Shows information about all available Minecraft servers.',
    async execute(interaction, options) {
        const { Discord } = options;
        const serverName = interaction.options.getString('name');

        try {
            if (serverName) {
                const server = await serversModel.findOne({ name: { $regex: new RegExp(serverName, 'i') } });

                if (!server) {
                    await interaction.editReply(`:x: | No server found with name **${serverName}**.`);
                    return;
                }

                const statusIcon = server.status ? '🟢 Online' : '🔴 Offline';
                const embed = new Discord.MessageEmbed()
                    .setColor(server.status ? '#ADFF2F' : '#FF0000')
                    .setTitle(`${server.name}`)
                    .addFields(
                        { name: 'Status', value: statusIcon },
                        { name: 'IP Address', value: server.ip },
                        { name: 'Region', value: server.region || 'N/A', inline: true },
                        { name: 'Provider', value: server.provider || 'N/A', inline: true },
                    )
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });

            } else {
                const servers = await serversModel.find();

                if (servers.length === 0) {
                    await interaction.editReply(':x: | No servers found in the database.');
                    return;
                }

                const embed = new Discord.MessageEmbed()
                    .setColor('#ADFF2F')
                    .setTitle('Minecraft Servers')
                    .setTimestamp();

                for (const server of servers) {
                    const statusIcon = server.status ? '🟢 Online' : '🔴 Offline';
                    embed.addFields({
                        name: server.name || server.ip,
                        value: `**IP:** ${server.ip}\n**Status:** ${statusIcon}\n**Region:** ${server.region || 'N/A'}`,
                        inline: true
                    });
                }

                await interaction.editReply({ embeds: [embed] });
            }

        } catch (error) {
            console.log('Server command error:', error);
            await interaction.editReply(':x: | Something went wrong while fetching server information.');
        }
    }
}
