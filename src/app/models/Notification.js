const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Notification = new Schema(
    {
        content: { type: String },
        type: { type: String },
        isRead: { type: Boolean, default: false },
        senderID: { type: Schema.Types.ObjectId, ref: "User" },
        receiverID: { type: Schema.Types.ObjectId, ref: "User" },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Notification", Notification);
