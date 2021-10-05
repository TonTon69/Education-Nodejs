const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");
mongoose.plugin(slug);

const Schema = mongoose.Schema;
const mongooseDelete = require("mongoose-delete");

const Theory = new Schema(
    {
        content: { type: String },
        lessionID: { type: Schema.Types.ObjectId, ref: "Lession" },
    },
    {
        timestamps: true,
    }
);

Theory.plugin(mongooseDelete, { deletedAt: true, overrideMethods: "all" });

module.exports = mongoose.model("Theory", Theory);
