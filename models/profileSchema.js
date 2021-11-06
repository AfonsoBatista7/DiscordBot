const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userId: { type: String, require: true, unique: true },
    userName: { type: String },
    coins: { type: Number, default: 250 },
    numMessages: { type: Number },
});

const model = mongoose.model("ProfileModels", profileSchema);

module.exports = model;