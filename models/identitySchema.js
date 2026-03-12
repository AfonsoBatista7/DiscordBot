const mongoose = require('mongoose');

const identitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }, // physical user (_id from userSchema)
    externalId: { type: String, require: true, unique: true },       // platform-specific ID (Discord ID, MC UUID)
    username: String,
    provider: String, // 'discord', 'minecraft', etc.
});

const model = mongoose.model("identities", identitySchema);

module.exports = model;
