const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Result = new Schema(
    {
        userID: { type: Schema.Types.ObjectId, ref: "User" },
        lessionID: { type: Schema.Types.ObjectId, ref: "Lession" },
        time: { type: String },
        score: { type: Number },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Result", Result);