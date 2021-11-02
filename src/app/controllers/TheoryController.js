const Subject = require("../models/Subject");
const Unit = require("../models/Unit");
const Lession = require("../models/Lession");
const Theory = require("../models/Theory");
const Exercise = require("../models/Exercise");
const User = require("../models/User");
const Result = require("../models/Result");
const Statistical = require("../models/Statistical");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
class TheoryController {
    // [GET]/theories?lession
    async detail(req, res, next) {
        try {
            if (ObjectId.isValid(req.query.lession)) {
                const theory = await Theory.aggregate([
                    { $match: { lessionID: ObjectId(req.query.lession) } },
                    {
                        $lookup: {
                            from: "lessions",
                            localField: "lessionID",
                            foreignField: "_id",
                            as: "lession",
                        },
                    },
                    {
                        $unwind: "$lession",
                    },
                    {
                        $lookup: {
                            from: "units",
                            localField: "lession.unitID",
                            foreignField: "_id",
                            as: "lession.unit",
                        },
                    },
                    {
                        $unwind: "$lession.unit",
                    },
                    {
                        $lookup: {
                            from: "subjects",
                            localField: "lession.unit.subjectID",
                            foreignField: "_id",
                            as: "lession.unit.subject",
                        },
                    },
                ]);
                res.render("theories/detail", {
                    theory,
                    success: req.flash("success"),
                    errors: req.flash("error"),
                });
            } else {
                res.render("error");
            }
        } catch (error) {
            console.log(error);
        }
    }

    // [PUT]/theories/:id
    async update(req, res, next) {
        await Theory.updateOne({ _id: req.params.id }, req.body);
        req.flash("success", "Cập nhật thành công!");
        res.redirect("back");
    }

    // [GET]/theories/create
    async create(req, res, next) {
        if (ObjectId.isValid(req.query.lession)) {
            const lession = await Lession.findOne({ _id: req.query.lession });
            const unit = await Unit.findOne({ _id: lession.unitID });
            const subject = await Subject.findOne({ _id: unit.subjectID });
            const theory = await Theory.findOne({ lessionID: lession._id });
            if (theory) {
                res.redirect(`/theories/detail?lession=${lession._id}`);
                return;
            }
            res.render("theories/create", {
                lession,
                subject,
                unit,
                errors: req.flash("error"),
            });
        } else {
            res.render("error");
        }
    }

    // [POST]/theories/create
    async postCreate(req, res, next) {
        if (req.body.content === "") {
            req.flash(
                "error",
                "Vui lòng nhập nội dung lý thuyết cho môn học này!"
            );
            res.redirect("back");
            return;
        }
        const theory = new Theory(req.body);
        await theory.save();
        req.flash("success", "Thêm mới thành công!");
        res.redirect("back");
    }
}

module.exports = new TheoryController();
