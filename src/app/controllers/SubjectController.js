const Subject = require("../models/Subject");
const Unit = require("../models/Unit");
const Lession = require("../models/Lession");
const Theory = require("../models/Theory");
const RatingRegulation = require("../models/RatingRegulation");
const ExerciseCategory = require("../models/ExerciseCategory");
const Exercise = require("../models/Exercise");
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
            res.render("subjects/show", {
                subject,
                units,
                lessions,
                ratingRegulation,
            });
        } catch (error) {
            res.render("error");
        }
    }

    // [GET]/learning/:slug
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

                res.render("subjects/learning", {
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

    // [GET]/exercise/:slug
    async exercise(req, res, next) {
        try {
            const subject = await Subject.findOne({ slug: req.params.slug });
            if (subject) {
                const lession = await Lession.findOne({ slug: req.query.name });
                const exercises = await Exercise.find({
                    lessionID: lession.id,
                });
                const exerciseCategories = await ExerciseCategory.find({});

                res.render("subjects/exercise", {
                    lession,
                    subject,
                    exercises,
                    exerciseCategories,
                });
            } else {
                res.render("error");
            }
        } catch (error) {
            res.render("error");
        }
    }
}

module.exports = new SubjectController();
