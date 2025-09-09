module.exports = {
    name: 'help',
    aliases: ['commands', 'com'],
    cooldown: 5,
    description: "Helps the user and shows all commands",
    execute(message, args, client, Discord, profileData) {
        const commands = [
            { name: '.help', description: 'Shows this help message' },
            { name: '.youtube', description: 'Shows RageCraft\'s channel :D' },
            { name: '.stats <playerName>', description: 'Shows the stats from the Minecraft server player <playerName>' },
            { name: '.server', description: 'Shows info about a Minecraft server if it is open' },
            { name: '.balance <user>', description: 'Shows the user money balance' },
            { name: '.profile <user>', description: 'Shows user profile' },
            { name: '.mine', description: 'Mine until it finds ores to get money' },
            { name: '.coin <heads/tails> <value>', description: 'Coin flip' },
            { name: '.give <user> <value>', description: 'Give <value> money to an user' },
            { name: '.medals <playerName>', description: 'Show the <playerName> medals from the Minecraft server' }
        ];

        const commandList = commands.map(cmd => `\`${cmd.name}\` - ${cmd.description}`).join('\n');

        const embed = new Discord.MessageEmbed()
            .setColor('#DF2700')
            .addFields(
                {name: 'Help', value: `Boas, o meu nome é ${client.user.username}.\nO meu criador é o Ragecraft e tenho como objetivo ajudar aqui no server :D.`},
                {name: 'Available Commands', value: commandList}
            );
        
        message.channel.send({embeds: [embed]});
    }
}
