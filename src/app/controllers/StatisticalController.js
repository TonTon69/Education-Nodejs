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
                console.log(results);
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
}

module.exports = new StatisticalController();
