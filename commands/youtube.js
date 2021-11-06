module.exports = {
    name: 'youtube',
    aliases: ['yout'],
    cooldown: 1,
    description: "Prints my youtube channel.",
    execute(message, args, client, Discord, profileData) {
        message.channel.send('The best youtube channel in the World is:\nhttps://www.youtube.com/RageCraft');
    }
}
