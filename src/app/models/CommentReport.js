const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentReport = new Schema(
    {
        commentID: {
            type: Schema.Types.ObjectId,
            ref: "Comment",
            require: true,
        },
        userID: { type: Schema.Types.ObjectId, ref: "User", require: true },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Comment-Report", CommentReport);
