const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");
mongoose.plugin(slug);

const Schema = mongoose.Schema;
const mongooseDelete = require("mongoose-delete");

const Lession = new Schema(
    {
        name: { type: String, require: true },
        unitID: { type: Schema.Types.ObjectId, ref: "Unit" },
        slug: { type: String, slug: "name", unique: true },
    },
    {
        timestamps: true,
    }
);

Lession.plugin(mongooseDelete, { deletedAt: true, overrideMethods: "all" });

module.exports = mongoose.model("Lession", Lession);
