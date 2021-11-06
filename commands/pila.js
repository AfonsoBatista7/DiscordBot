module.exports = {
    name: 'pila',
    aliases: [],
    cooldown: 3,
    description: "Tells the user that he is gay!",
    execute(message, args, client, Discord, profileData) {
        const user = message.author.id;
        message.channel.send(`O <@${user}> gosta de pila hihi :)`);
    }
}