const mongoose = require('mongoose');

const gamestatSchema = new mongoose.Schema({
    identityId: { type: String, require: true, unique: true },
    serverId: { type: String, require: true },
    lastLogin: String,
    playerSince: String,
    timePlayedMinutes: { type: Number, default: 0 },
    timeAFKMinutes: { type: Number, default: 0 },
    medals: [{ medalName: String, medalLevel: String }],
    customTags: [String],
    versionPlayed: [String],
    status: Boolean,
    stats: {
        kills: Number,
        mTravelled: Number,
        deaths: Number,
        timeslogin: Number,
        redstoneUsed: Number,
        enderdragonKills: Number,
        witherKills: Number,
        fishCaught: Number,
        mobKills: Number,
        blockMined: Number,
        blcksDestroyed: Number,
        blcksPlaced: Number,
        blocks: [{
            bName: String,
            bNumDestroyed: Number,
            bNumPlaced: Number,
        }],
        mobsKilled: [{
            mId: Number,
            mName: String,
            mNumKilled: Number
        }],
    },
});

const model = mongoose.model("gamestats", gamestatSchema);

module.exports = model;
