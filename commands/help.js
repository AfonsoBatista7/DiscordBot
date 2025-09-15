const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows all available commands and help information'),
    name: 'help',
    aliases: ['commands', 'com'],
    cooldown: 5,
    description: "Helps the user and shows all commands",
    async execute(interaction, options) {
        const { client, Discord, profileData } = options;
        const commands = [
            { name: '/help', description: 'Shows this help message' },
            { name: '/youtube', description: 'Shows RageCraft\'s channel :D' },
            { name: '/stats [player]', description: 'Shows the stats from the Minecraft server player' },
            { name: '/server', description: 'Shows info about a Minecraft server if it is open' },
            { name: '/balance [user]', description: 'Shows the user money balance' },
            { name: '/profile [user]', description: 'Shows user profile' },
            { name: '/mine', description: 'Mine until it finds ores to get money' },
            { name: '/coin <heads/tails> <amount>', description: 'Coin flip' },
            { name: '/give <user> <amount>', description: 'Give money to a user' },
            { name: '/medals <player>', description: 'Show the player medals from the Minecraft server' },
            { name: '/players', description: 'Show players from the Minecraft server' }
        ];

        const commandList = commands.map(cmd => `\`${cmd.name}\` - ${cmd.description}`).join('\n');

        const embed = new Discord.MessageEmbed()
            .setColor('#DF2700')
            .addFields(
                {name: 'Help', value: `Boas, o meu nome é ${client.user.username}.\nO meu criador é o Ragecraft e tenho como objetivo ajudar aqui no server :D.`},
                {name: 'Available Commands', value: commandList}
            );
        
        await interaction.reply({embeds: [embed]});
    }
}
