module.exports = {
    name: 'commands',
    aliases: ['com'],
    cooldown: 10,
    description: "Prints all commands",
    execute(message, args, client, Discord, profileData) {
        const commands = [
            { name: '.pila', description: 'Conta verdades' },
            { name: '.youtube', description: 'Dá print do canal do RageCraft :D' },
            { name: '.stats <playerName>', description: 'Mostra os status de um player num server de Minecraft' },
            { name: '.server', description: 'Mostra info do server se este estiver aberto' },
            { name: '.start', description: 'Liga o server se estiver fechado' },
            { name: '.balance <user>', description: 'Diz o dinheiro que o user tem' },
            { name: '.profile <user>', description: 'Perfil do user' },
            { name: '.mine', description: 'Minera até encontrar minérios para ganhar dinheiro' },
            { name: '.coin <heads/tails> <value>', description: 'Coin flip' },
            { name: '.give <user> <value>', description: 'Give <value> money to an user' },
            { name: '.medals <playerName>', description: 'Mostra as medalhas de um player' }
        ];

        const commandList = commands.map(cmd => `\`${cmd.name}\` - ${cmd.description}`).join('\n');

        const embed = new Discord.MessageEmbed()
            .setColor('#DF2700')
            .addFields({name: 'Commands', value: commandList});

        message.channel.send({embeds: [embed]});
    }
}
