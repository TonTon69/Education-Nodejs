const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");

const Schema = mongoose.Schema;

const Exercise = new Schema(
    {
        question: { type: String, require: true },
        option1: { type: String, require: true },
        option2: { type: String, require: true },
        option3: { type: String, require: true },
        option4: { type: String, require: true },
        answer: { type: String, require: true },
        explain: { type: String, require: true },
        recommend: { type: String, require: true },
        ceID: {
            type: Schema.Types.ObjectId,
            ref: "Exercise-Category",
            require: true,
        },
        lessionID: {
            type: Schema.Types.ObjectId,
            ref: "Lession",
            require: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Exercise", Exercise);
