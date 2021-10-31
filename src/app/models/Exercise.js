const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");

const Schema = mongoose.Schema;

const Exercise = new Schema(
    {
        question: { type: String },
        option1: { type: String },
        option2: { type: String },
        option3: { type: String },
        option4: { type: String },
        answer: { type: String },
        explain: { type: String },
        recommend: { type: String },
        ceID: { type: Schema.Types.ObjectId, ref: "Exercise-Category" },
        lessionID: { type: Schema.Types.ObjectId, ref: "Lession" },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Exercise", Exercise);
