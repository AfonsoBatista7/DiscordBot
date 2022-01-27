const util = require('minecraft-server-util');
require('dotenv').config();

module.exports = {
    name: 'server',
    aliases: ['serv','ser'],
    cooldown: 10,
    description: 'Tells the user the a lot of information about the minecraft nostalgia server.',
    execute(message, args, client, Discord, profileData) {
        util.statusLegacy(process.env.MINECRAFT_SERVER_IP).then((response) => {

            const embed=new Discord.MessageEmbed()
            .setColor('#ADFF2F')
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
                message.channel.send({embeds: [embed]});
        })
            .catch((error) => {
                message.channel.send('The server is offline now, try `.start` to start the server :D.');
            });
    }
}
