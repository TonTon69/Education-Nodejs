const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Comment = new Schema(
    {
        questionID: {
            type: Schema.Types.ObjectId,
            ref: "Question",
            require: true,
        },
        content: { type: String, require: true },
        userID: { type: Schema.Types.ObjectId, ref: "User", require: true },
        numLikes: { type: Number, default: 0 },
        numReplys: { type: Number, default: 0 },
        isApproved: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Comment", Comment);
