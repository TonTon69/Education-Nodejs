const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");
mongoose.plugin(slug);

const Schema = mongoose.Schema;
const mongooseDelete = require("mongoose-delete");

const Unit = new Schema(
    {
        name: { type: String, require: true },
        subjectID: { type: Schema.Types.ObjectId, ref: "Subject" },
    },
    {
        timestamps: true,
    }
);

Unit.plugin(mongooseDelete, { deletedAt: true, overrideMethods: "all" });

module.exports = mongoose.model("Unit", Unit);
