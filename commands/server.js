const util = require('minecraft-server-util');

module.exports = {
    name: 'server',
    aliases: ['serv','ser'],
    cooldown: 10,
    description: 'Tells the user the a lot of information about the minecraft nostalgia server.',
    execute(message, args, client, Discord, profileData) {
        util.statusFE01('minenostalgia.tk').then((response) => {

            const embed=new Discord.MessageEmbed()
            .setColor('#DF2700')
            .setTitle('`--Minecraft Nostalgia Server--`')

            switch(args[0]) {
                case 'ip':
                    embed.addFields(
                        { name: 'Status', value: ':green_circle: Online'},
                        { name: 'Server IP', value: response.host }
                    )
                    break;
                case 'version':
                    embed.addFields(
                        { name: 'Status', value: ':green_circle: Online'},
                        { name: 'Version', value: response.version }
                    )
                    break;
                default:
                    embed.addFields(
                        { name: 'Status', value: ':green_circle: Online'},
                        { name: 'Server IP', value: response.host },
                        { name: 'Version', value: response.version },
                        { name: 'Online Players', value: response.onlinePlayers }
                    )
            } 
                message.channel.send(embed);
        })
            .catch((error) => {
                message.channel.send('The server is offline now, try `.start` to start the server :D.');
            });
    }
}
