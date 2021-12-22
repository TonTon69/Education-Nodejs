const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");
mongoose.plugin(slug);

const Schema = mongoose.Schema;

const Question = new Schema(
    {
        title: { type: String, require: true },
        content: { type: String, require: true },
        thumbnail: { type: String },
        topic: { type: String },
        tags: { type: String },
        numViews: { type: Number, default: 0 },
        numLikes: { type: Number, default: 0 },
        numComments: { type: Number, default: 0 },
        userID: { type: Schema.Types.ObjectId, ref: "User", require: true },
        slug: { type: String, slug: "title", unique: true },
        isApproved: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Question", Question);
