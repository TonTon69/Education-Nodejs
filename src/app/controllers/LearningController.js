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
                const exercises = await Exercise.aggregate([
                    {
                        $match: {
                            lessionID: ObjectId(lession.id),
                        },
                    },
                    {
                        $lookup: {
                            from: "exercise-categories",
                            localField: "ceID",
                            foreignField: "_id",
                            as: "Cate",
                        },
                    },
                ]);
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
                            as: "Exercises",
                        },
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "userID",
                            foreignField: "_id",
                            as: "User",
                        },
                    },
                ]);

                var totalScore = 0;
                var totalAnswerTrue = 0;
                var score = 100 / exercises.length;
                var time = results[results.length - 1].time;

                console.log(time);

                results.forEach(async function (result) {
                    if (result.option === result.Exercises[0].answer) {
                        totalScore += score;
                        totalAnswerTrue++;
                    }
                });

                res.render("learning/result", {
                    exercises,
                    results,
                    totalScore,
                    totalAnswerTrue,
                });
            } else {
                res.render("error");
            }
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = new LearningController();
