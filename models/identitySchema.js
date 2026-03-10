const mongoose = require('mongoose');

const identitySchema = new mongoose.Schema({
    userId: { type: String, require: true },
    externalId: { type: String, require: true, unique: true },
    username: String,
    provider: String,
});

const model = mongoose.model("identities", identitySchema);

module.exports = model;
