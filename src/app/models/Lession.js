const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");
mongoose.plugin(slug);

const Schema = mongoose.Schema;

const Lession = new Schema(
    {
        name: { type: String, require: true },
        lessionNumber: { type: Number, require: true },
        unitID: { type: Schema.Types.ObjectId, ref: "Unit" },
        slug: { type: String, slug: "name", unique: true },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Lession", Lession);
