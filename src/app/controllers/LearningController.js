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
class LearningController {
    // [GET]/learning/:slug?name=lession
    async learning(req, res, next) {
        try {
            const subject = await Subject.findOne({ slug: req.params.slug });
            if (subject) {
                const lession = await Lession.findOne({ slug: req.query.name });
                if (lession) {
                    const theory = await Theory.findOne({
                        lessionID: lession.id,
                    });

                    const units = await Unit.find({ id: lession.unitID });

                    // mục lục môn học
                    const unitIdArray = units.map(({ _id }) => _id);
                    const lessions = await Lession.find({
                        unitID: { $in: unitIdArray },
                    });

                    const exercises = await Exercise.find({
                        lessionID: lession._id,
                    });

                    const statistical = await Statistical.findOne({
                        userID: ObjectId(req.signedCookies.userId),
                        lessionID: lession._id,
                    });

                    let results = [];
                    if (statistical) {
                        results = await Result.find({
                            statisticalID: statistical._id,
                        });
                    }

                    res.render("learning/learning", {
                        lession,
                        theory,
                        subject,
                        units,
                        lessions,
                        statistical,
                        exercises,
                        results,
                    });
                } else {
                    res.render("error");
                }
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
                const exercises = await Exercise.find({
                    lessionID: lession._id,
                });
                const statistical = await Statistical.aggregate([
                    {
                        $match: {
                            userID: ObjectId(req.signedCookies.userId),
                        },
                    },
                    {
                        $match: {
                            lessionID: ObjectId(lession._id),
                        },
                    },
                    {
                        $lookup: {
                            from: "results",
                            localField: "_id",
                            foreignField: "statisticalID",
                            as: "results",
                        },
                    },
                    {
                        $unwind: "$results",
                    },
                    {
                        $lookup: {
                            from: "exercises",
                            localField: "results.exerciseID",
                            foreignField: "_id",
                            as: "results.exercise",
                        },
                    },
                    {
                        $unwind: "$results.exercise",
                    },
                    {
                        $lookup: {
                            from: "exercise-categories",
                            localField: "results.exercise.ceID",
                            foreignField: "_id",
                            as: "results.exercise.category",
                        },
                    },
                ]);

                const unit = await Unit.findById({ _id: lession.unitID });
                const subject = await Subject.findById({
                    _id: unit.subjectID,
                });

                const nextLession = await Lession.findOne({
                    _id: { $gt: lession.id },
                })
                    .sort({ _id: 1 })
                    .limit(1);
                res.render("learning/result-detail", {
                    subject,
                    statistical,
                    nextLession,
                    exercises,
                });
            } else {
                const statisticals = await Statistical.aggregate([
                    {
                        $match: {
                            userID: ObjectId(req.signedCookies.userId),
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

                res.render("learning/result", { statisticals });
            }
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = new LearningController();
