const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Role = new Schema(
    {
        roleName: { type: String },
        description: { type: String },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Role", Role);
