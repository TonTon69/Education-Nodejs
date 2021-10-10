const Subject = require("../models/Subject");
const Lession = require("../models/Lession");
const ExerciseCategory = require("../models/ExerciseCategory");
const Exercise = require("../models/Exercise");
const Result = require("../models/Result");
const ResultDetail = require("../models/ResultDetail");
const User = require("../models/User");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
class ExerciseController {
    // [GET]/exercise/:slug?name=lession
    async exercise(req, res, next) {
        try {
            const subject = await Subject.findOne({ slug: req.params.slug });
            if (subject) {
                const lession = await Lession.findOne({ slug: req.query.name });
                const exercise = await Exercise.aggregate([
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
                    {
                        $limit: 5,
                    },
                ]);

                const results = await Result.aggregate([
                    {
                        $match: {
                            lessionID: ObjectId(lession.id),
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
                    { $sort: { score: -1, time: 1 } },
                    {
                        $limit: 10,
                    },
                ]);

                res.render("exercises/exercise", {
                    lession,
                    subject,
                    exercise,
                    results,
                });
            } else {
                res.render("error");
            }
        } catch (error) {
            res.render("error");
        }
    }

    async postExercise(req, res, next) {
        try {
            const subject = req.params.slug;
            const lession = req.query.name;

            const lessionObj = await Lession.findOne({ slug: lession });
            const exercises = await Exercise.find({ slug: lession });

            const myJsonData = req.body.objectData;
            const myJsonObj = Object.assign({}, ...myJsonData);
            const myTime = req.body.time;
            const myScore = req.body.score;
            const myScoreTemp = myScore.split("/")[0];

            const user = await User.findOne({ _id: req.signedCookies.userId });

            const result = new Result({
                userID: user.id,
                lessionID: lessionObj.id,
                time: myTime,
                score: myScoreTemp,
            });
            const findResult = await Result.findOne({
                userID: user.id,
                lessionID: lessionObj.id,
            });

            if (findResult) {
                const query = {
                    userID: user.id,
                    lessionID: lessionObj.id,
                };
                await Result.findOneAndUpdate(query, {
                    time: myTime,
                    score: myScoreTemp,
                });

                const findResultDetail = await ResultDetail.findOne({
                    resultID: findResult.id,
                    exerciseID: myJsonObj.name,
                });
                if (findResultDetail) {
                    const queryDetail = {
                        resultID: findResultDetail.resultID,
                        exerciseID: findResultDetail.exerciseID,
                    };
                    await ResultDetail.findOneAndUpdate(queryDetail, {
                        option: myJsonObj.value,
                    });
                } else {
                    const resultDetail = new ResultDetail({
                        resultID: findResult.id,
                        exerciseID: myJsonObj.name,
                        option: myJsonObj.value,
                    });
                    await resultDetail.save();
                }
            } else {
                await result.save();
                if (result) {
                    const resultDetail = new ResultDetail({
                        resultID: result.id,
                        exerciseID: myJsonObj.name,
                        option: myJsonObj.value,
                    });
                    await resultDetail.save();
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = new ExerciseController();
