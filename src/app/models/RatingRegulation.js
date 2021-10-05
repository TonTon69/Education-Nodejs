const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RatingRegulation = new Schema(
    {
        content: { type: String },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Rating-Regulation", RatingRegulation);
