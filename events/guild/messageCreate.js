
const profileModel = require('../../models/profileSchema');

const cooldowns = new Map();

module.exports = async (Discord, client, message) => {
    const prefix = '.';

    let profileData;

    const user = message.mentions.users.first() || message.author;

    if(message.author.bot) return;
    
    const isCommand = message.content.startsWith(prefix);
    
    try{
        profileData = await profileModel.findOne({ userId: user.id })
        if(!profileData) {
            let profile = await profileModel.create({
                userId: user.id,
                userName: user.username,
                coins: 250,
                numMessages: 0,
            });
            profile.save();
        }

        // Only give coins for regular messages, not commands
        if (!isCommand) {
            await profileModel.findOneAndUpdate({userId: message.author.id},
                {
                    $inc: {
                        numMessages: 1,
                        coins: 1,
                    },
                }
            );
        }
        
    } catch(err) {
        console.log(err);
    }
    
    if(!isCommand) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const cmd = args.shift().toLowerCase();

    const command = client.commands.get(cmd) || client.commands.find(a => a.aliases && a.aliases.includes(cmd));
    
    try {
        if(!cooldowns.has(command.name)) cooldowns.set(command.name, new Discord.Collection());
        
        const current_time = Date.now();
        const time_stamps = cooldowns.get(command.name);
        const cooldown_amount = (command.cooldown) * 1000;

        if(time_stamps.has(message.author.id)) {
            const expiration_time = time_stamps.get(message.author.id) + cooldown_amount;

            if(current_time < expiration_time) {
                const time_left = (expiration_time - current_time) / 1000;

                return message.channel.send(`:hourglass: | **Wait more:** ${time_left.toFixed(1)} seconds`);
            }
        }

        time_stamps.set(message.author.id, current_time);
    
        const options = {
            args,
            client,
            Discord,
            profileData,
            // Add any future options here without breaking existing commands
        };
        
        command.execute(message, options);     
    } catch(err) {
        message.channel.send('That command doesn\'t exist, try \`.help\`');
    }
}
