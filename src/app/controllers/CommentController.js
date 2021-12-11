const Comment = require("../models/Comment");

class CommentController {
    // [DELETE]/comment/:id
    async delete(req, res) {
        await Comment.deleteOne({
            _id: req.params.id,
            userID: req.signedCookies.userId,
        });

        // req.flash("success", "Xóa bình luận thành công!");
        res.redirect("back");
    }
}

module.exports = new CommentController();
