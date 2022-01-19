const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userId: { type: String, require: true, unique: true },
    userName: String,
    coins: { type: Number, default: 250, get: v => Math.floor(v), set: v => Math.floor(v)},
    numMessages: Number,
});

const model = mongoose.model("ProfileModels", profileSchema);

module.exports = model;