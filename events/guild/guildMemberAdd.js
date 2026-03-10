const platformstatsModel = require('../../models/platformstatsSchema');
const identityModel = require('../../models/identitySchema');
const userModel = require('../../models/userSchema');

module.exports = async(client, discord, member) =>{
    const user = await userModel.create({});
    const identity = await identityModel.create({
        userId: user._id,
        externalId: member.id,
        username: member.user.username,
        provider: 'discord',
    });

    const profile = await platformstatsModel.create({
        identityId: identity._id,
        balance: 250,
        numMessages: 0,
    });

    profile.save();
}