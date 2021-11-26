const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");
mongoose.plugin(slug);

const Schema = mongoose.Schema;

const Question = new Schema(
    {
        title: { type: String, require: true },
        content: { type: String, require: true },
        image: { type: String },
        slug: { type: String, slug: "title", unique: true },
        view: { type: Number, default: 1 },
        topic: { type: String },
        userID: { type: Schema.Types.ObjectId, ref: "User", require: true },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Question", Question);
