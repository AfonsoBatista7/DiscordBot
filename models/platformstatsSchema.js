const mongoose = require('mongoose');

const platformstatsSchema = new mongoose.Schema({
    identityId: { type: String, require: true, unique: true },
    balance: { type: Number, default: 250, get: v => Math.floor(v), set: v => Math.floor(v)},
    numMessages: Number,
});

const model = mongoose.model("platformstats", platformstatsSchema);

module.exports = model;
