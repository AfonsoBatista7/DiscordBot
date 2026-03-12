const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    birthday: String,
});

const model = mongoose.model("users", userSchema);

module.exports = model;
