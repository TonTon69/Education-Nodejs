const Subject = require("../models/Subject");
const Unit = require("../models/Unit");
const Lession = require("../models/Lession");
const RatingRegulation = require("../models/RatingRegulation");
const Result = require("../models/Result");
const User = require("../models/User");
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

            const lessionIdArray = lessions.map(({ id }) => id);
            const results = await Result.find({
                lessionID: { $in: lessionIdArray },
            })
                .sort([
                    ["score", -1],
                    ["time", 1],
                ])
                .limit(10);
            const userIdArray = results.map(({ userID }) => userID);
            const users = await User.find({ _id: { $in: userIdArray } });

            res.render("subjects/show", {
                subject,
                units,
                lessions,
                ratingRegulation,
                results,
                users,
            });
        } catch (error) {
            res.render("error");
        }
    }
}

module.exports = new SubjectController();
