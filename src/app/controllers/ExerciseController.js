const Subject = require("../models/Subject");
const Lession = require("../models/Lession");
const ExerciseCategory = require("../models/ExerciseCategory");
const Exercise = require("../models/Exercise");
const Result = require("../models/Result");
const User = require("../models/User");
const Statistical = require("../models/Statistical");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
class ExerciseController {
    // [GET]/exercise/:slug?name=lession
    async exercise(req, res, next) {
        try {
            const subject = await Subject.findOne({ slug: req.params.slug });
            if (subject) {
                const lession = await Lession.findOne({ slug: req.query.name });
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
                    {
                        $project: { answer: 0, explain: 0 },
                    },
                ]);

                // làm lại tất cả
                const statistical = await Statistical.findOne({
                    userID: ObjectId(req.signedCookies.userId),
                    lessionID: lession._id,
                });

                if (statistical) {
                    const results = await Result.find({
                        statisticalID: statistical._id,
                    });
                    const resultsUserIdArray = results.map(({ _id }) => _id);
                    if (results.length > 0) {
                        await Result.deleteMany({
                            _id: { $in: resultsUserIdArray },
                        });
                        await Statistical.deleteOne({ _id: statistical._id });
                    }
                }

                // bảng xếp hạng theo bài học
                const ranks = await Statistical.aggregate([
                    {
                        $match: {
                            lessionID: ObjectId(lession._id),
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
                    { $sort: { score: -1, time: 1 } },
                    {
                        $limit: 10,
                    },
                ]);

                res.render("exercises/exercise", {
                    lession,
                    subject,
                    exercises,
                    ranks,
                });
            } else {
                res.render("error");
            }
        } catch (error) {
            res.render("error");
        }
    }

    // [POST]/exercise/:slug?name=lession
    async postExercise(req, res, next) {
        try {
            const lession = await Lession.findOne({ slug: req.query.name });
            if (lession) {
                const myJsonData = req.body.objectData;
                const myJsonObj = Object.assign({}, ...myJsonData);
                const myTime = req.body.time;
                const myExercise = req.body.exercise;

                let score = 0;
                let totalAnswerTrue = 0;
                const exercises = await Exercise.find({
                    lessionID: lession._id,
                });
                exercises.forEach(function (exercise) {
                    if (
                        myJsonObj.name == exercise._id &&
                        myJsonObj.value == exercise.answer
                    ) {
                        score += 100 / exercises.length;
                        totalAnswerTrue++;
                    }
                });
                const findStatistical = await Statistical.findOne({
                    userID: ObjectId(req.signedCookies.userId),
                    lessionID: lession._id,
                });
                if (findStatistical) {
                    if (myJsonObj.name == exercises[exercises.length - 1]._id) {
                        await Statistical.updateOne(
                            { _id: findStatistical._id },
                            {
                                time: myTime,
                                $inc: {
                                    totalAnswerTrue: totalAnswerTrue,
                                    score: score,
                                },
                                isDone: true,
                            }
                        );
                    } else {
                        await Statistical.updateOne(
                            { _id: findStatistical._id },
                            {
                                time: myTime,
                                $inc: {
                                    totalAnswerTrue: totalAnswerTrue,
                                    score: score,
                                },
                            }
                        );
                    }

                    if (Object.keys(myJsonObj).length === 0) {
                        const result = new Result({
                            statisticalID: findStatistical._id,
                            exerciseID: myExercise,
                            option: "",
                        });
                        await result.save();
                    } else {
                        const result = new Result({
                            statisticalID: findStatistical._id,
                            exerciseID: myJsonObj.name,
                            option: myJsonObj.value,
                        });
                        await result.save();
                    }
                } else {
                    const statistical = new Statistical({
                        lessionID: lession._id,
                        userID: req.signedCookies.userId,
                        totalAnswerTrue: totalAnswerTrue,
                        score: score,
                        time: myTime,
                        isDone: false,
                    });
                    await statistical.save();

                    if (Object.keys(myJsonObj).length === 0) {
                        const result = new Result({
                            statisticalID: statistical._id,
                            exerciseID: myExercise,
                            option: "",
                        });
                        await result.save();
                    } else {
                        const result = new Result({
                            statisticalID: statistical._id,
                            exerciseID: myJsonObj.name,
                            option: myJsonObj.value,
                        });
                        await result.save();
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    // [GET]/exercise?lession
    async detail(req, res, next) {
        if (ObjectId.isValid(req.query.lession)) {
            const exercises = await Exercise.aggregate([
                { $match: { lessionID: ObjectId(req.query.lession) } },
                {
                    $lookup: {
                        from: "exercise-categories",
                        localField: "ceID",
                        foreignField: "_id",
                        as: "category",
                    },
                },
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

            const categories = await ExerciseCategory.find({});

            res.render("exercises/detail", {
                exercises,
                categories,
                success: req.flash("success"),
                errors: req.flash("error"),
            });
        } else {
            res.render("error");
        }
    }

    // [PUT]/exercises/:id
    async update(req, res, next) {
        await Exercise.updateOne({ _id: req.params.id }, req.body);
        req.flash("success", "Cập nhật thành công!");
        res.redirect("back");
    }

    // [POST]/exercises/create
    async postCreate(req, res, next) {
        const exercise = new Exercise(req.body);
        await exercise.save();
        req.flash("success", "Thêm mới thành công!");
        res.redirect("back");
    }

    // [DELETE]/exercises
    async delete(req, res, next) {
        await Exercise.deleteOne({ _id: req.params.id });
        req.flash("success", "Xóa thành công!");
        res.redirect("back");
    }
}

module.exports = new ExerciseController();
