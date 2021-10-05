const Subject = require("../models/Subject");
const Unit = require("../models/Unit");
const Lession = require("../models/Lession");
class SubjectController {
    // [GET]/subjects/:slug
    async show(req, res, next) {
        const subject = await Subject.findOne({ slug: req.params.slug });
        const units = await Unit.find({ subjectID: subject.id });
        const unitIdArray = units.map(({ _id }) => _id);
        const lessions = await Lession.find({
            unitID: { $in: unitIdArray },
        });
        res.render("subjects/show", { subject, units, lessions });
    }
}

module.exports = new SubjectController();
