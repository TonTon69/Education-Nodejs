const Subject = require("../models/Subject");
const Unit = require("../models/Unit");
const Lession = require("../models/Lession");
const Theory = require("../models/Theory");
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

    // [GET]/learning/:slug
    async learning(req, res, next) {
        const lession = await Lession.findOne({ slug: req.query.name });
        const theory = await Theory.findOne({ lessionID: lession.id });

        const units = await Unit.find({ id: lession.unitID });
        const subject = await Subject.findOne({ id: units.subjectID });

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
    }
}

module.exports = new SubjectController();
