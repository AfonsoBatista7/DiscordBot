const mongoose = require('mongoose');

const serversSchema = new mongoose.Schema({
    ip: { type: String, require: true, unique: true },
    name: String,
    provider: String,
    region: String,
    createdAt: String,
    status: Boolean,
});

const model = mongoose.model("servers", serversSchema);

module.exports = model;
