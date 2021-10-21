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
                const unit = await Unit.findById({
                    _id: lession.unitID,
                });
                const subject = await Subject.findById({
                    _id: unit.subjectID,
                });

                const nextLession = await Lession.findOne({
                    _id: { $gt: lession._id },
                })
                    .sort({ _id: 1 })
                    .limit(1);

                const exercises = await Exercise.find({
                    lessionID: lession._id,
                });

                const statistical = await Statistical.aggregate([
                    {
                        $match: {
                            $and: [
                                { userID: ObjectId(req.signedCookies.userId) },
                                { lessionID: ObjectId(lession._id) },
                            ],
                        },
                    },
                    {
                        $lookup: {
                            from: "results",
                            localField: "_id",
                            foreignField: "statisticalID",
                            as: "res",
                        },
                    },
                    {
                        $unwind: "$res",
                    },
                    {
                        $lookup: {
                            from: "exercises",
                            localField: "res.exerciseID",
                            foreignField: "_id",
                            as: "res.exercise",
                        },
                    },
                    {
                        $unwind: "$res.exercise",
                    },
                    {
                        $lookup: {
                            from: "exercise-categories",
                            localField: "res.exercise.ceID",
                            foreignField: "_id",
                            as: "res.exercise.category",
                        },
                    },
                    {
                        $group: {
                            _id: "$_id",
                            res: {
                                $push: "$res",
                            },
                        },
                    },
                    {
                        $lookup: {
                            from: "statisticals",
                            localField: "_id",
                            foreignField: "_id",
                            as: "stat",
                        },
                    },
                    {
                        $unwind: "$stat",
                    },
                    {
                        $addFields: {
                            "stat.res": "$res",
                        },
                    },
                    {
                        $replaceRoot: {
                            newRoot: "$stat",
                        },
                    },
                ]);

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
