module.exports = {
    name: 'commands',
    aliases: ['com'],
    cooldown: 10,
    description: "Prints all commands",
    execute(message, args, client, Discord, profileData) {
        const embed = new Discord.MessageEmbed()
        .setColor('#DF2700')
        .addFields(
            {name: 'Commands', value: '\`.pila\` - Conta verdades\n\`.youtube\` - Dá print do canal do RageCraft :D\n\`.server\` - Mostra info do server se este estiver aberto\n\`.start\` - Liga o server se estiver fechado\n\`.balance <user>\` - Diz o dinheiro que o user tem\n\`.profile <user>\` - Perfil do user\n\`.mine\` - Minera até encontrar minérios para ganhar dinheiro\n\`.coin <heads/tails> <value>\` - Coin flip\n\`.give <user> <value>\` - give <value> money to an user.'}
        )

        message.channel.send({embeds: [embed]});
    }
}
