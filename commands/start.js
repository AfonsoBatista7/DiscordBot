var shell = require('shelljs');
const util = require('minecraft-server-util');
const { spawn } = require('child_process');

module.exports = {
    name: 'start',
    aliases: ['st'],
    cooldown: 10,
    description: "Starts the server",
    execute(message, args, client, Discord, profileData) {
       util.statusFE01('minenostalgia.tk').then((response) => {
            message.channel.send('The server is already on, try `.server` to see the version and IP.');
        })
        .catch((error) => {
	    shell.cd('../Server');
            spawn('bash',['./run.sh']);
            message.channel.send('Yee! the server is now on :DD.');
        });

    }
}
