const Subject = require("../models/Subject");
const Unit = require("../models/Unit");
const Lession = require("../models/Lession");
const RatingRegulation = require("../models/RatingRegulation");
// const Theory = require("../models/Theory");
// const ExerciseCategory = require("../models/ExerciseCategory");
// const Exercise = require("../models/Exercise");
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
}

module.exports = new SubjectController();
