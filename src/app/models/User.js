const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");
mongoose.plugin(slug);

const Schema = mongoose.Schema;
const mongooseDelete = require("mongoose-delete");

const User = new Schema(
    {
        active: { type: Boolean, default: false },
        birthDay: { type: Date },
        email: { type: String, unique: true },
        password: { type: String },
        phone: { type: String },
        roleID: { type: Schema.Types.ObjectId, ref: "Role" },
        fullname: { type: String },
        avatar: { type: String },
        username: { type: String, slug: "fullname", unique: true },
    },
    {
        timestamps: true,
    }
);

User.plugin(mongooseDelete, { deletedAt: true, overrideMethods: "all" });

module.exports = mongoose.model("User", User);
