const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const System = new Schema(
  {
    field: { type: String },
    value: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("System", System);
