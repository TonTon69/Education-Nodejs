const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");
mongoose.plugin(slug);

const Schema = mongoose.Schema;
const mongooseDelete = require("mongoose-delete");

const Subject = new Schema(
    {
        name: { type: String, require: true },
        gradeID: { type: Number, ref: "Grade" },
        icon: { type: String },
        description: { type: String },
        slug: { type: String, slug: "name" + "gradeID", unique: true },
    },
    {
        timestamps: true,
    }
);

Subject.plugin(mongooseDelete, { deletedAt: true, overrideMethods: "all" });

module.exports = mongoose.model("Subject", Subject);
