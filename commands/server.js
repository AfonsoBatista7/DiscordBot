const https = require('https');
require('dotenv').config();

module.exports = {
    name: 'server',
    aliases: ['serv','ser'],
    cooldown: 10,
    description: 'Tells the user the a lot of information about the minecraft nostalgia server.',
    async execute(message, options) {
        const { args, client, Discord } = options;
        
        const checkServer = (serverIP) => {
            return new Promise((resolve, reject) => {
                const url = `https://api.mcstatus.io/v2/status/java/${serverIP}`;
                https.get(url, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        try {
                            // Check if response looks like JSON
                            if (data.startsWith('<') || !data.startsWith('{')) {
                                reject(new Error('API returned non-JSON response'));
                                return;
                            }
                            const parsed = JSON.parse(data);
                            resolve(parsed);
                        } catch (error) {
                            reject(new Error(`Failed to parse response: ${error.message}`));
                        }
                    });
                }).on('error', reject);
            });
        };

        try {
            const response = await checkServer(process.env.MINECRAFT_SERVER_IP);
            
            if (!response.online) {
                const offlineEmbed = new Discord.MessageEmbed()
                    .setColor('#FF0000')
                    .setTitle('`--Minecraft Nostalgia Server--`')
                    .addFields(
                        { name: 'Status', value: '🔴 Offline'},
                        { name: 'Server IP', value: process.env.MINECRAFT_SERVER_IP }
                    )
                    .setDescription('The server is not online now :(');
                message.channel.send({embeds: [offlineEmbed]});
                return;
            }

            const embed=new Discord.MessageEmbed()
            .setColor('#ADFF2F')
            .setTitle('`--Minecraft Nostalgia Server--`')

            const serverIP = process.env.MINECRAFT_SERVER_IP;
            
            switch(args[0]) {
                case 'ip':
                    embed.addFields(
                        { name: 'Status', value: '🟢 Online'},
                        { name: 'Server IP', value: serverIP }
                    )
                    break;
                case 'version':
                    embed.addFields(
                        { name: 'Status', value: '🟢 Online'},
                        { name: 'Version', value: response.version?.name_clean || response.version?.name || 'Unknown' }
                    )
                    break;
                default:
                    const version = response.version?.name_clean || response.version?.name || 'Unknown';
                    const playersOnline = response.players?.online ?? 0;
                    const playersMax = response.players?.max ?? 0;
                    
                    embed.addFields(
                        { name: 'Status', value: '🟢 Online'},
                        { name: 'Server IP', value: serverIP },
                        { name: 'Version', value: version },
                        { name: 'Online Players', value: `${playersOnline}/${playersMax}` }
                    )
            } 
            message.channel.send({embeds: [embed]});
        
        } catch(error) {
            console.log('Server command error:', error);
            console.log('MINECRAFT_SERVER_IP value:', process.env.MINECRAFT_SERVER_IP);
            
            const serverIP = process.env.MINECRAFT_SERVER_IP;
            const errorEmbed = new Discord.MessageEmbed()
                .setColor('#FF0000')
                .setTitle('`--Minecraft Nostalgia Server--`')
                .addFields(
                    { name: 'Status', value: '🔴 Offline'},
                    { name: 'Server IP', value: serverIP }
                )
                .setDescription('The server is not online now :(');
            message.channel.send({embeds: [errorEmbed]});
        }
    }
}
