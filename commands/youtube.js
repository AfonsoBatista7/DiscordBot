module.exports = {
    name: 'youtube',
    aliases: ['yout'],
    cooldown: 1,
    description: "Prints my youtube channel.",
    execute(message, options) {
        // YouTube command doesn't need any options
        message.channel.send('The best youtube channel in the World is:\nhttps://www.youtube.com/RageCraft');
    }
}
