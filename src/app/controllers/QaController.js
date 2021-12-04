const Question = require("../models/Question");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const cloudinary = require("../../config/cloud/index");
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

    // [GET]/qa/:id/edit
    async edit(req, res) {
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
        res.render("qa/edit", { qa });
    }

    // [PUT]/qa/:id
    async update(req, res) {
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

    // [DELETE]/qa/:id
    async delete(req, res) {
        const qa = await Question.findById(req.params.id);
        const public_id = qa.thumbnail
            .split("/")
            .slice(-1)
            .join("")
            .split(".")[0];
        cloudinary.uploader.destroy(public_id);
        await Question.deleteOne({ _id: req.params.id });
        req.flash("success", "Đã xóa câu hỏi thành công!");
        res.redirect("/qa/list");
    }
}

module.exports = new QaController();
