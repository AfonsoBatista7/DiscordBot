const fs = require('node:fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

function readSecret(name) {
    const filePath = process.env[`${name}_FILE`];
    if (filePath && fs.existsSync(filePath)) return fs.readFileSync(filePath, 'utf8').trim();
    return process.env[name];
}

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.data) {
        commands.push(command.data.toJSON());
    }
}

const rest = new REST({ version: '9' }).setToken(readSecret('DISCORD_TOKEN'));

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // For global commands (takes up to 1 hour to update)
        const data = await rest.put(
            Routes.applicationCommands(readSecret('CLIENT_ID')),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();