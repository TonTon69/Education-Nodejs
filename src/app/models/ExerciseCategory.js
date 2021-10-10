const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ExerciseCategory = new Schema(
    {
        type: { type: String },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Exercise-Category", ExerciseCategory);
