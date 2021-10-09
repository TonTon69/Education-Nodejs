const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ResultDetail = new Schema(
    {
        resultID: { type: Schema.Types.ObjectId, ref: "Result" },
        exerciseID: { type: Schema.Types.ObjectId, ref: "Exercise" },
        option: { type: String },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Result-Detail", ResultDetail);
