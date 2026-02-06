const fs = require('fs');
const Discord = require('discord.js');
const mongoose = require("mongoose");

function readSecret(name) {
    const filePath = process.env[`${name}_FILE`];
    if (filePath && fs.existsSync(filePath)) return fs.readFileSync(filePath, 'utf8').trim();
    return process.env[name];
}

const DISCORD_TOKEN = readSecret('DISCORD_TOKEN');
const MONGODB_TOKEN = readSecret('MONGODB_TOKEN');

const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGE_TYPING", "GUILD_MESSAGE_TYPING"]});

client.commands = new Discord.Collection();
client.events = new Discord.Collection();

['command_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`)(client, Discord)
})

mongoose.connect(MONGODB_TOKEN, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log('\nConnected to the database :D!');
}).catch((error) => {
    console.log(error);
});

// Global error handlers
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Discord client error handler
client.on('error', (error) => {
    console.error('Discord client error:', error);
});

client.login(DISCORD_TOKEN);
