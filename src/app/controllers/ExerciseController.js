const Subject = require("../models/Subject");
const Lession = require("../models/Lession");
const ExerciseCategory = require("../models/ExerciseCategory");
const Exercise = require("../models/Exercise");
const Result = require("../models/Result");
const ResultDetail = require("../models/ResultDetail");
const User = require("../models/User");
class ExerciseController {
    // [GET]/exercise/:slug?name=lession
    async exercise(req, res, next) {
        try {
            const subject = await Subject.findOne({ slug: req.params.slug });
            if (subject) {
                const lession = await Lession.findOne({ slug: req.query.name });
                const exercises = await Exercise.find({
                    lessionID: lession.id,
                });
                const exerciseCatagoryIdArray = exercises.map(
                    ({ ceID }) => ceID
                );
                const exerciseCategories = await ExerciseCategory.find({
                    _id: { $in: exerciseCatagoryIdArray },
                });

                const results = await Result.find({ lessionID: lession.id })
                    .sort({ score: -1 })
                    .limit(10);
                const userIdArray = results.map(({ userID }) => userID);
                const users = await User.find({ _id: { $in: userIdArray } });
                console.log(users);

                res.render("exercises/exercise", {
                    lession,
                    subject,
                    exercises,
                    exerciseCategories,
                    results,
                    users,
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

            const result = new Result({
                userID: "615f01b576023090c2ac4971",
                lessionID: lessionObj.id,
                time: myTime,
                score: myScoreTemp,
            });
            const findResult = await Result.findOne({
                userID: "615f01b576023090c2ac4971",
                lessionID: lessionObj.id,
            });

            if (findResult) {
                const query = {
                    userID: "615f01b576023090c2ac4971",
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
                    resultDetail.save();
                }
            } else {
                result.save();
                if (result) {
                    const resultDetail = new ResultDetail({
                        resultID: result.id,
                        exerciseID: myJsonObj.name,
                        option: myJsonObj.value,
                    });
                    resultDetail.save();
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = new ExerciseController();
