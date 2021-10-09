const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Banner = new Schema({
    image: { type: String },
    description: { type: String },
    title: { type: String },
    url: { type: String },
});

module.exports = mongoose.model("Banner", Banner);
