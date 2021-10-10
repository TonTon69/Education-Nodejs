const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Blog = new Schema(
    {
        content: { type: String },
        title: { type: String },
        image: { type: String },
        slug: { type: String, slug: "title", unique: true },
        view: { type: Number },
        bcID: { type: Schema.Types.ObjectId, ref: "Blog-Category" },
        userID: { type: Schema.Types.ObjectId, ref: "User" },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Blog", Blog);
