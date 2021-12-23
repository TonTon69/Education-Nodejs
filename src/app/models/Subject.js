const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");
mongoose.plugin(slug);

const Schema = mongoose.Schema;

const Subject = new Schema(
    {
        name: { type: String, index: true },
        gradeID: { type: Number, ref: "Grade" },
        icon: { type: String },
        thumbnail: { type: String },
        slug: { type: String, slug: ["name", "gradeID"], unique: true },
    },
    {
        timestamps: true,
    }
);
Subject.index({ name: "text" });
module.exports = mongoose.model("Subject", Subject);
