const Subject = require("../models/Subject");
const Unit = require("../models/Unit");
const Lession = require("../models/Lession");
const RatingRegulation = require("../models/RatingRegulation");
const Result = require("../models/Result");
const User = require("../models/User");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
class SubjectController {
    // [GET]/subjects/:slug
    async show(req, res, next) {
        try {
            const subject = await Subject.findOne({ slug: req.params.slug });
            const units = await Unit.find({ subjectID: subject.id });
            const unitIdArray = units.map(({ _id }) => _id);
            const lessions = await Lession.find({
                unitID: { $in: unitIdArray },
            });
            const ratingRegulation = await RatingRegulation.find({});

            const lessionIdArray = lessions.map(({ id }) => id);
            const results = await Result.find({
                lessionID: { $in: lessionIdArray },
            })
                .sort([
                    ["score", -1],
                    ["time", 1],
                ])
                .limit(10);
            const userIdArray = results.map(({ userID }) => userID);
            const users = await User.find({ _id: { $in: userIdArray } });

            res.render("subjects/show", {
                subject,
                units,
                lessions,
                ratingRegulation,
                results,
                users,
            });
        } catch (error) {
            res.render("error");
        }
    }

    // [GET]/subjects/list
    async list(req, res) {
        const subjects = await Subject.find({});
        res.render("subjects/list", {
            subjects,
            success: req.flash("success"),
            errors: req.flash("error"),
        });
    }

    // [GET]/subjects/create
    async create(req, res) {
        res.render("subjects/create", {
            success: req.flash("success"),
        });
    }

    // [POST]/subjects/create
    async postCreate(req, res) {
        const subject = new Subject(req.body);
        await subject.save();
        req.flash("success", "Thêm mới thành công!");
        res.redirect("back");
    }

    // [GET]/subjects/:id/edit
    async edit(req, res, next) {
        const subject = await Subject.findById(req.params.id);
        res.render("subjects/edit", {
            subject,
            success: req.flash("success"),
        });
    }

    // [PUT]/subjects/:id
    async update(req, res, next) {
        await Subject.updateOne({ _id: req.params.id }, req.body);
        req.flash("success", "Cập nhật thành công!");
        res.redirect("back");
    }

    // [DELETE]/subjects/:id
    async delete(req, res, next) {
        try {
            await Subject.deleteOne({ _id: req.params.id });
            req.flash("success", "Xóa thành công!");
            res.redirect("back");
        } catch (error) {
            req.flash("error", "Xóa thất bại!");
            res.redirect("back");
        }
    }
}

module.exports = new SubjectController();
