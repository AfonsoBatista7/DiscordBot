const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('youtube')
        .setDescription('Shows RageCraft\'s YouTube channel'),
    name: 'youtube',
    aliases: ['yout'],
    cooldown: 1,
    description: "Prints my youtube channel.",
    async execute(interaction, options) {
        await interaction.reply('The best youtube channel in the World is:\nhttps://www.youtube.com/RageCraft');
    }
}
