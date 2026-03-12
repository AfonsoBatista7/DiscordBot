
const platformstatsModel = require('../../models/platformstatsSchema');
const identityModel = require('../../models/identitySchema');
const userModel = require('../../models/userSchema');

const cooldowns = new Map();

module.exports = async (Discord, client, message) => {
    const prefix = '.';

    let profileData;

    const user = message.mentions.users.first() || message.author;

    if(message.author.bot) return;

    const isCommand = message.content.startsWith(prefix);

    try{
        let discordIdentity = await identityModel.findOne({ externalId: user.id, provider: 'discord' });
        if (!discordIdentity) {
            const newUser = await userModel.create({});
            discordIdentity = await identityModel.create({
                userId: newUser._id,
                externalId: user.id,
                username: user.username,
                provider: 'discord',
            });
        }

        let platformstats = await platformstatsModel.findOne({ identityId: discordIdentity._id });
        if (!platformstats) {
            platformstats = await platformstatsModel.create({
                identityId: discordIdentity._id,
                balance: 250,
                numMessages: 0,
            });
            await platformstats.save();
        }

        const mcIdentity = discordIdentity.userId
            ? await identityModel.findOne({ userId: discordIdentity.userId, provider: 'minecraft' })
            : null;

        profileData = {
            userId: user.id,
            identityId: discordIdentity._id,
            physicalUserId: discordIdentity.userId,
            userName: user.username,
            balance: platformstats.balance,
            coins: platformstats.balance,
            numMessages: platformstats.numMessages,
            link: mcIdentity ? mcIdentity.externalId : null,
            mcUsername: mcIdentity ? mcIdentity.username : null,
            mcIdentityId: mcIdentity ? mcIdentity._id : null,
        };

        // Only give coins for regular messages, not commands
        if (!isCommand) {
            // Find author's identity if different from user
            const authorIdentity = user.id === message.author.id
                ? discordIdentity
                : await identityModel.findOne({ externalId: message.author.id, provider: 'discord' });

            if (authorIdentity) {
                await platformstatsModel.findOneAndUpdate({ identityId: authorIdentity._id },
                    {
                        $inc: {
                            numMessages: 1,
                            balance: 1,
                        },
                    }
                );
            }
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
