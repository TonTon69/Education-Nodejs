const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");
mongoose.plugin(slug);

const Schema = mongoose.Schema;
const mongooseDelete = require("mongoose-delete");

const User = new Schema(
    {
        fullname: { type: String, require: true },
        avatar: { type: String },
    },
    {
        timestamps: true,
    }
);

User.plugin(mongooseDelete, { deletedAt: true, overrideMethods: "all" });

module.exports = mongoose.model("User", User);
