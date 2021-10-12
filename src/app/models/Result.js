const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Result = new Schema(
    {
        userID: { type: Schema.Types.ObjectId, ref: "User" },
        exerciseID: { type: Schema.Types.ObjectId, ref: "Exercise" },
        option: { type: String },
        time: { type: String },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Result", Result);
