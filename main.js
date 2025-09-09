require('dotenv').config();
const Discord = require('discord.js');

const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGE_TYPING", "GUILD_MESSAGE_TYPING"]});
const mongoose = require("mongoose");

const fs = require('fs');

client.commands = new Discord.Collection();
client.events = new Discord.Collection();

['command_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`)(client, Discord)
})

mongoose.connect(process.env.MONGODB_TOKEN, {
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

client.login(process.env.DISCORD_TOKEN);
