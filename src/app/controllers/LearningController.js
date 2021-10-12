const Subject = require("../models/Subject");
const Unit = require("../models/Unit");
const Lession = require("../models/Lession");
const Theory = require("../models/Theory");
const Exercise = require("../models/Exercise");
const User = require("../models/User");
const Result = require("../models/Result");
const ResultDetail = require("../models/ResultDetail");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
class LearningController {
    // [GET]/learning/:slug?name=lession
    async learning(req, res, next) {
        try {
            const subject = await Subject.findOne({ slug: req.params.slug });
            if (subject) {
                const lession = await Lession.findOne({ slug: req.query.name });
                const theory = await Theory.findOne({ lessionID: lession.id });

                const units = await Unit.find({ id: lession.unitID });

                // mục lục môn học
                const unitIdArray = units.map(({ _id }) => _id);
                const lessions = await Lession.find({
                    unitID: { $in: unitIdArray },
                });

                res.render("learning/learning", {
                    lession,
                    theory,
                    subject,
                    units,
                    lessions,
                });
            } else {
                res.render("error");
            }
        } catch (error) {
            res.render("error");
        }
    }

    // [GET]/learning/result
    async learningResult(req, res, next) {
        try {
            const lession = await Lession.findOne({ slug: req.query.name });
            if (lession) {
                const results = await Result.aggregate([
                    {
                        $match: {
                            userID: ObjectId(req.signedCookies.userId),
                        },
                    },
                    {
                        $lookup: {
                            from: "exercises",
                            localField: "exerciseID",
                            foreignField: "_id",
                            as: "exercises",
                        },
                    },
                    {
                        $unwind: "$exercises",
                    },
                    {
                        $lookup: {
                            from: "exercise-categories",
                            localField: "exercises.ceID",
                            foreignField: "_id",
                            as: "exercises.category",
                        },
                    },
                    {
                        $lookup: {
                            from: "lessions",
                            localField: "exercises.lessionID",
                            foreignField: "_id",
                            as: "exercises.lession",
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

                if (results[0].exercises.lession[0]._id == lession.id) {
                    const unit = await Unit.findById({ _id: lession.unitID });
                    const subject = await Subject.findById({
                        _id: unit.subjectID,
                    });

                    const nextLession = await Lession.find({
                        _id: { $gt: lession.id },
                    })
                        .sort({ _id: 1 })
                        .limit(1);

                    var totalScore = 0;
                    var totalAnswerTrue = 0;
                    var score = 100 / results.length;
                    var time = results[results.length - 1].time;

                    results.forEach(async function (result) {
                        if (result.option === result.exercises.answer) {
                            totalScore += score;
                            totalAnswerTrue++;
                        }
                    });

                    res.render("learning/result", {
                        results,
                        totalScore,
                        totalAnswerTrue,
                        time,
                        subject,
                        nextLession,
                    });
                } else {
                    res.render("error");
                }
            } else {
                res.render("error");
            }
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = new LearningController();
