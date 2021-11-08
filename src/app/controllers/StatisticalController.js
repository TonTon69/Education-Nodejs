const Subject = require("../models/Subject");
const Lession = require("../models/Lession");
const ExerciseCategory = require("../models/ExerciseCategory");
const Exercise = require("../models/Exercise");
const Result = require("../models/Result");
const Unit = require("../models/Unit");
const User = require("../models/User");
const Statistical = require("../models/Statistical");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const readXlsxFile = require("read-excel-file/node");
const path = require("path");
const XLSX = require("xlsx");

class StatisticalController {
    // [GET]/statisticals
    async show(req, res) {
        if (ObjectId.isValid(req.query.lession)) {
            const lession = await Lession.findById(req.query.lession);

            if (lession) {
                const unit = await Unit.findOne({ _id: lession.unitID });
                const subject = await Subject.findOne({ _id: unit.subjectID });
                const exercises = await Exercise.find({
                    lessionID: lession._id,
                });
                const statisticals = await Statistical.aggregate([
                    { $match: { lessionID: ObjectId(req.query.lession) } },
                    {
                        $lookup: {
                            from: "users",
                            localField: "userID",
                            foreignField: "_id",
                            as: "user",
                        },
                    },
                    {
                        $sort: { updatedAt: 1 },
                    },
                ]);
                res.render("statisticals/list", {
                    lession,
                    statisticals,
                    unit,
                    subject,
                    countExercises: exercises.length,
                    errors: req.flash("error"),
                    success: req.flash("success"),
                });
            } else {
                res.render("error");
            }
        } else if (ObjectId.isValid(req.query.subject)) {
            const subject = await Subject.findById(req.query.subject);
            if (subject) {
                const units = await Unit.find({ subjectID: subject._id });
                const unitIdArray = units.map(({ _id }) => _id);
                const lessions = await Lession.find({
                    unitID: { $in: unitIdArray },
                });
                const lessionIdArray = lessions.map(({ _id }) => _id);

                const ranks = await Statistical.aggregate([
                    {
                        $match: {
                            lessionID: { $in: lessionIdArray },
                        },
                    },
                    {
                        $group: {
                            _id: "$userID",
                            totalScore: { $sum: "$score" },
                            totalLessionDone: { $count: {} },
                        },
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "_id",
                            foreignField: "_id",
                            as: "user",
                        },
                    },
                    {
                        $project: {
                            "user.birthDay": 0,
                            "user.active": 0,
                            "user.password": 0,
                            "user.phone": 0,
                            "user.roleID": 0,
                            "user.address": 0,
                            "user.username": 0,
                        },
                    },
                    { $sort: { totalScore: -1 } },
                ]);

                res.render("statisticals/result", {
                    subject,
                    ranks,
                    countLessions: lessions.length,
                });
            } else {
                res.render("error");
            }
        } else {
            res.render("error");
        }
    }

    // [GET]/statisticals/:id/detail
    async detail(req, res) {
        if (ObjectId.isValid(req.params.id)) {
            const statistical = await Statistical.findById(req.params.id);
            if (statistical) {
                const userSta = await User.findById(statistical.userID);
                const lession = await Lession.findById(statistical.lessionID);
                const unit = await Unit.findById(lession.unitID);
                const subject = await Subject.findById(unit.subjectID);
                const results = await Result.aggregate([
                    { $match: { statisticalID: ObjectId(statistical._id) } },
                    {
                        $lookup: {
                            from: "exercises",
                            localField: "exerciseID",
                            foreignField: "_id",
                            as: "exercise",
                        },
                    },
                ]);
                res.render("statisticals/detail", {
                    results,
                    userSta,
                    lession,
                    unit,
                    subject,
                    statistical,
                });
            } else {
                res.render("error");
            }
        } else {
            res.render("error");
        }
    }

    // [DELETE]/statisticals/:id
    async delete(req, res, next) {
        const statistical = await Statistical.findById(req.params.id);
        if (statistical) {
            await Result.deleteMany({ statisticalID: statistical._id });
            statistical.delete();
        }
        req.flash("success", "Xóa thành công!");
        res.redirect("back");
    }

    // [POST]/statistical/:id/export
    async export(req, res, next) {
        const subject = await Subject.findById(req.params.id);
        const units = await Unit.find({ subjectID: subject._id });
        const unitIdArray = units.map(({ _id }) => _id);
        const lessions = await Lession.find({
            unitID: { $in: unitIdArray },
        });
        const lessionIdArray = lessions.map(({ _id }) => _id);
        const statisticals = await Statistical.aggregate([
            {
                $match: {
                    lessionID: { $in: lessionIdArray },
                },
            },
            {
                $group: {
                    _id: "$userID",
                    totalScore: { $sum: "$score" },
                    totalLessionDone: { $count: {} },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $project: {
                    "user.birthDay": 0,
                    "user.active": 0,
                    "user.password": 0,
                    "user.phone": 0,
                    "user.roleID": 0,
                    "user.address": 0,
                    "user.username": 0,
                },
            },
            { $sort: { totalScore: -1 } },
        ]);

        var wb = XLSX.utils.book_new();
        var temp = JSON.stringify(statisticals);
        temp = JSON.parse(temp);
        var ws = XLSX.utils.json_to_sheet(temp);
        let down = path.resolve(
            __dirname,
            `../../public/exports/thong-ke-ket-qua-mon-${subject.slug}.xlsx`
        );
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, down);
        res.download(down);
    }
}

module.exports = new StatisticalController();
