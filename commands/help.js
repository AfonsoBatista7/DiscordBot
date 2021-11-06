const { Client } = require("discord.js");
const commands = require("./commands");

module.exports = {
    name: 'help',
    aliases: [],
    cooldown: 5,
    description: "Helps the user!",
    execute(message, args, client, Discord, profileData) {
       const embed = new Discord.MessageEmbed()
       .setColor('#DF2700')
       .addFields(
           {name: 'Help', value: `Boas, o meu nome é ${client.user.username}.\nO meu criador é o Ragecraft e tenho como objetivo ajudar aqui no server :D.\nTenta escrever \`.commands\` para ver todos os comandos.`}
       )
        
       message.channel.send(embed);
    }
}
