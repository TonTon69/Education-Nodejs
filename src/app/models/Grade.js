const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Grade = new Schema({
    _id: { type: Number, require: true },
    name: { type: String, require: true },
});

module.exports = mongoose.model("Grade", Grade);
