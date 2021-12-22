const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ExerciseEnglish = new Schema(
    {
        content: { type: String },
        lessionID: {
            type: Schema.Types.ObjectId,
            ref: "Lession",
            require: true,
        },
        audioUrl: { type: String },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Exercise-English", ExerciseEnglish);
