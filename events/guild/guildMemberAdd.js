const profileModel = require('../../models/profileSchema');

module.exports = async(client, discord, member) =>{
    let profile = await profileModel.create({
        userID: member.id,
        userName: member.username,
        coins: 250,
        numMessages: 0,
    });

    profile.save();

}