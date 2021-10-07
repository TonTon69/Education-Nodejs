const Subject = require("../models/Subject");
const Unit = require("../models/Unit");
const Lession = require("../models/Lession");
const Theory = require("../models/Theory");

class LearningController {
    // [GET]/learning/:slug?name=lession
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

                res.render("learning/learning", {
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
}

module.exports = new LearningController();
