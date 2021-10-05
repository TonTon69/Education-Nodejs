const Subject = require("../models/Subject");
const Unit = require("../models/Unit");
const Lession = require("../models/Lession");
class SubjectController {
    // [GET]/subjects/:slug
    async show(req, res, next) {
        const subject = await Subject.findOne({ slug: req.params.slug });
        const units = await Unit.find({ subjectID: subject.id });
        // console.log(units);
        for (const unit of units) {
            // console.log(unit);
            let lessions = await Lession.find({ unitID: unit.id });
            console.log(lessions);
            res.render("subjects/show", { subject, units, lessions });
        }
    }
}

module.exports = new SubjectController();
