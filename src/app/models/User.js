const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");
mongoose.plugin(slug);

const Schema = mongoose.Schema;
const mongooseDelete = require("mongoose-delete");

const User = new Schema(
    {
        name: { type: String, require: true },
    },
    {
        timestamps: true,
    }
);

User.plugin(mongooseDelete, { deletedAt: true, overrideMethods: "all" });

module.exports = mongoose.model("User", User);
