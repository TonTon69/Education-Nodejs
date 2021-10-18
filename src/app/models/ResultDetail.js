const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ResultDetail = new Schema(
    {
        resultID: { type: Schema.Types.ObjectId, ref: "Result" },
        lessionID: { type: Schema.Types.ObjectId, ref: "Lession" },
        score: { type: String },
        isDone: { type: Boolean },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Result-Detail", ResultDetail);
