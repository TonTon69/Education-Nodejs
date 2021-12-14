const Question = require("../models/Question");
const Comment = require("../models/Comment");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const slugify = require("slugify");
const cloudinary = require("../../config/cloud/index");
const CommentLike = require("../models/CommentLike");
const Notification = require("../models/Notification");
class QaController {
    // [GET]/qa/list
    async list(req, res) {
        const qaList = await Question.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "userID",
                    foreignField: "_id",
                    as: "user",
                },
            },
        ]);

        res.render("qa/list", {
            qaList,
            success: req.flash("success"),
            errors: req.flash("error"),
        });
    }

    // [GET]/qa/:id/browser
    async browser(req, res) {
        const qa = await Question.aggregate([
            {
                $match: { _id: ObjectId(req.params.id) },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userID",
                    foreignField: "_id",
                    as: "user",
                },
            },
        ]);

        res.render("qa/browser", { qa });
    }

    // [GET]/qa/:id/edit
    async edit(req, res) {
        if (ObjectId.isValid(req.params.id)) {
            const qa = await Question.aggregate([
                {
                    $match: {
                        $and: [
                            { _id: ObjectId(req.params.id) },
                            { userID: ObjectId(req.signedCookies.userId) },
                        ],
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userID",
                        foreignField: "_id",
                        as: "user",
                    },
                },
            ]);

            if (qa.length > 0) {
                res.render("qa/edit", { qa });
            } else {
                res.render("error");
            }
        } else {
            res.render("error");
        }
    }

    // [PUT]/qa/:id/edit
    async updateQa(req, res) {
        if (req.file === undefined) {
            const { title, content } = req.body;
            await Question.updateOne(
                { _id: req.params.id },
                {
                    title,
                    content,
                    slug: slugify(title.toLowerCase()),
                }
            );
            req.flash("success", "Đã chỉnh sửa câu hỏi thành công!");
            res.redirect("/my-qa");
        } else {
            // delete old thumbnail on cloudinary
            const qa = await Question.findOne({
                _id: req.params.id,
                userID: req.signedCookies.userId,
            });
            const public_id = qa.thumbnail
                .split("/")
                .slice(-1)
                .join("")
                .split(".")[0];
            cloudinary.uploader.destroy(public_id);

            // upload new thumbnail on cloudinary
            req.body.thumbnail = req.file.path.split("/").slice(-2).join("/");
            cloudinary.uploader.upload(req.file.path, async (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    const { title, content } = req.body;
                    await Question.updateOne(
                        { _id: req.params.id },
                        {
                            title,
                            content,
                            thumbnail: result.url,
                            slug: slugify(title.toLowerCase()),
                        }
                    );
                    req.flash("success", "Đã chỉnh sửa câu hỏi thành công!");
                    res.redirect("/my-qa");
                }
            });
        }
    }

    // [PUT]/qa/:id/browser
    async updateBrowser(req, res) {
        await Question.updateOne(
            { _id: req.params.id },
            {
                topic: req.body.topic,
                isApproved: true,
            }
        );
        req.flash("success", "Đã duyệt câu hỏi thành công!");
        res.redirect("/qa/list");
    }

    // [DELETE]/qa/:id/destroy
    async destroy(req, res) {
        const qa = await Question.findById(req.params.id);
        const public_id = qa.thumbnail
            .split("/")
            .slice(-1)
            .join("")
            .split(".")[0];
        cloudinary.uploader.destroy(public_id);

        await Comment.deleteMany({ questionID: req.params.id });
        await Question.deleteOne({ _id: req.params.id });
        req.flash("success", "Đã xóa câu hỏi thành công!");
        res.redirect("/qa/list");
    }

    // [DELETE]/qa/:id/delete
    async delete(req, res) {
        const qa = await Question.findOne({
            _id: req.params.id,
            userID: req.signedCookies.userId,
        });
        const public_id = qa.thumbnail
            .split("/")
            .slice(-1)
            .join("")
            .split(".")[0];
        cloudinary.uploader.destroy(public_id);

        await Comment.deleteMany({ questionID: req.params.id });
        await Question.deleteOne({
            _id: req.params.id,
            userID: req.signedCookies.userId,
        });
        req.flash("success", "Đã xóa câu hỏi thành công!");
        res.redirect("/my-qa");
    }

    // [GET]/qa/:slug
    async show(req, res) {
        const qa = await Question.aggregate([
            { $match: { slug: req.params.slug } },
            {
                $lookup: {
                    from: "users",
                    localField: "userID",
                    foreignField: "_id",
                    as: "user",
                },
            },
        ]);

        if (qa.length > 0) {
            const comments = await Comment.aggregate([
                {
                    $match: {
                        $and: [
                            { questionID: ObjectId(qa[0]._id) },
                            { isApproved: true },
                        ],
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userID",
                        foreignField: "_id",
                        as: "user",
                    },
                },
                {
                    $lookup: {
                        from: "comment-likes",
                        localField: "_id",
                        foreignField: "commentID",
                        as: "commentLikes",
                    },
                },
                { $sort: { createdAt: 1 } },
            ]);

            res.render("qa/show", {
                qa,
                comments,
                success: req.flash("success"),
            });
        } else {
            res.render("error");
        }
    }

    // ----------------------------------------------------------------
    async postMarkAllRead(req, res) {
        await Notification.updateMany(
            { receiverID: req.signedCookies.userId },
            { isRead: true }
        );
        const notifications = await Notification.aggregate([
            { $match: { receiverID: ObjectId(req.signedCookies.userId) } },
            {
                $lookup: {
                    from: "users",
                    localField: "senderID",
                    foreignField: "_id",
                    as: "sender",
                },
            },
            {
                $lookup: {
                    from: "questions",
                    localField: "sourceID",
                    foreignField: "_id",
                    as: "question",
                },
            },
            { $sort: { createdAt: -1 } },
        ]);
        res.render("helper/notification", { notifications });
    }
}

module.exports = new QaController();
